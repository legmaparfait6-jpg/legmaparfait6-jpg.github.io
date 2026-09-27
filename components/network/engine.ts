/**
 * Moteur du « Réseau Vivant » (three.js).
 *
 * - Nœuds réels (missions, technologies) + nœuds d'ambiance (infrastructure).
 * - Le réseau se réorganise en « formations » selon la section lue.
 * - Des paquets circulent le long des liens ; l'incident simulé suit les
 *   phases émises par la section « En direct ».
 * - Tout est calculé sur quelques centaines de points : coût GPU minime.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  LineBasicMaterial,
  LineSegments,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from "three";
import type { GraphData, GraphNode } from "@/content/graph";
import type { IncidentPhase } from "@/lib/bus";
import { PortraitCloud } from "./portrait";

export type Formation = "galaxy" | "layers" | "clusters" | "live" | "finale" | "mission";

export type StageState = { formation: Formation; opacity: number; slug?: string; portrait?: boolean };

type Options = { mobile: boolean; onHover: (node: GraphNode | null) => void };

const COLOR = {
  text: new Color("#c4c8ce"),
  dim: new Color("#7d848e"),
  ambient: new Color("#36404a"),
  signal: new Color("#3ddc84"),
  progress: new Color("#f2b13c"),
  black: new Color(0, 0, 0),
};

const ACTIVE_INCIDENT: IncidentPhase[] = ["down", "alert", "ticket", "escalate"];

/** Générateur pseudo-aléatoire déterministe : la même scène à chaque visite. */
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const damp = (a: number, b: number, lambda: number, dt: number) => a + (b - a) * (1 - Math.exp(-lambda * dt));

const VERTEX = /* glsl */ `
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aAlpha;
  uniform float uPixelRatio;
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vColor = aColor;
    vAlpha = aAlpha * uOpacity;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio * (190.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float d = length(p);
    if (d > 0.5) discard;
    float core = smoothstep(0.16, 0.0, d);
    float glow = exp(-d * d * 22.0) * 0.45;
    gl_FragColor = vec4(vColor * (core * 1.15 + glow), (core + glow) * vAlpha);
  }
`;

type Packet = { edge: number; t: number; speed: number; forward: boolean; color: Color; strength: number; alive: boolean };

export class NetworkEngine {
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(42, 1, 0.1, 100);
  private group = new Group();
  private material: ShaderMaterial;
  private lineMaterial: LineBasicMaterial;

  private readonly realCount: number;
  private readonly count: number;
  private readonly incidentIndex: number;
  private readonly futureIndex: number;
  private readonly supervisionIndex: number;
  private readonly missionIndex = new Map<string, number>();
  private readonly edges: Int32Array;
  private readonly adjacency: number[][];

  private formations: Record<Exclude<Formation, "live" | "mission">, Float32Array>;
  private current: Float32Array;
  private colors: Float32Array;
  private sizes: Float32Array;
  private alphas: Float32Array;
  private baseSize: Float32Array;
  private phases: Float32Array;
  private revealAt: Float32Array;
  private lineColors: Float32Array;
  private linePositions: Float32Array;

  private nodeGeometry = new BufferGeometry();
  private lineGeometry = new BufferGeometry();
  private packetGeometry = new BufferGeometry();
  private packets: Packet[] = [];
  private packetPositions: Float32Array;
  private packetColors: Float32Array;
  private packetAlphas: Float32Array;

  private state: StageState = { formation: "galaxy", opacity: 1 };
  private opacity = 0;
  private focusIndex = -1;
  private focusSet = new Set<number>();
  private incident: IncidentPhase = "idle";
  private camPos = new Vector3(0, 1, 16);
  private camLook = new Vector3();
  private pointer = { x: 0, y: 0, nx: 0, ny: 0, active: false };
  private hovered = -1;
  private diveBoost = 0;
  private rotation = 0;
  private portrait: PortraitCloud | null = null;
  private pointerPlane = new Vector3();

  private width = 1;
  private height = 1;
  private raf = 0;
  private running = false;
  private lastTime = 0;
  private elapsed = 0;
  private spawnClock = 0;
  private focusClock = 0;
  private tmp = new Vector3();
  private tmp2 = new Vector3();
  private tmpColor = new Color();

  constructor(
    private canvas: HTMLCanvasElement,
    private graph: GraphData,
    private options: Options,
  ) {
    const random = mulberry32(20260927);
    const ambientCount = options.mobile ? 90 : 210;
    this.realCount = graph.nodes.length;
    this.incidentIndex = this.realCount;
    this.count = this.realCount + ambientCount + 1;
    this.futureIndex = this.count - 1;
    graph.missionSlugs.forEach((slug, i) => this.missionIndex.set(slug, i));
    this.supervisionIndex = this.missionIndex.get("network-supervision") ?? 0;

    this.renderer = new WebGLRenderer({ canvas, antialias: !options.mobile, alpha: true, powerPreference: "high-performance" });
    this.renderer.setClearColor(0x000000, 0);
    this.scene.add(this.group);

    // --- positions des formations -----------------------------------------
    const ambientDir: Vector3[] = [];
    const ambientR: number[] = [];
    for (let i = 0; i < ambientCount; i++) {
      const u = random() * 2 - 1;
      const theta = random() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      ambientDir.push(new Vector3(Math.cos(theta) * s, u, Math.sin(theta) * s));
      ambientR.push(random());
    }
    // Le nœud de l'incident est placé à l'avant de la scène, bien visible.
    ambientDir[0] = new Vector3(0.62, 0.22, 0.75).normalize();
    ambientR[0] = 0.05;

    const skillNodes = graph.nodes.map((n, i) => ({ n, i })).filter((x) => x.n.kind === "skill");
    const missionNodes = graph.nodes.map((n, i) => ({ n, i })).filter((x) => x.n.kind === "mission");
    const layerMembers = new Map<number, number[]>();
    skillNodes.forEach(({ n, i }) => layerMembers.set(n.layer, [...(layerMembers.get(n.layer) ?? []), i]));

    const make = () => new Float32Array(this.count * 3);
    const set = (arr: Float32Array, i: number, x: number, y: number, z: number) => {
      arr[i * 3] = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = z;
    };

    const galaxy = make();
    const golden = Math.PI * (3 - Math.sqrt(5));
    skillNodes.forEach(({ i }, k) => {
      const y = 1 - (2 * (k + 0.5)) / skillNodes.length;
      const r = Math.sqrt(1 - y * y);
      const th = k * golden;
      set(galaxy, i, Math.cos(th) * r * 3.1, y * 2.7, Math.sin(th) * r * 3.1);
    });
    missionNodes.forEach(({ i }, k) => {
      const a = (k / missionNodes.length) * Math.PI * 2;
      set(galaxy, i, Math.cos(a) * 1.35, Math.sin(k * 1.7) * 0.35, Math.sin(a) * 1.35);
    });

    const layers = make();
    layerMembers.forEach((members, layer) => {
      members.forEach((i, j) => {
        const a = (j / members.length) * Math.PI * 2 + layer * 0.45;
        set(layers, i, Math.cos(a) * 2.7, 2.85 - layer * 0.95, Math.sin(a) * 1.2);
      });
    });
    missionNodes.forEach(({ i }, k) => {
      const a = (k / missionNodes.length) * Math.PI * 2;
      set(layers, i, Math.cos(a) * 1.8, -3.9, Math.sin(a) * 0.9);
    });

    const clusters = make();
    const missionPos = new Map<string, Vector3>();
    missionNodes.forEach(({ n, i }, k) => {
      const a = (k / missionNodes.length) * Math.PI * 2 - Math.PI / 2;
      const p = new Vector3(Math.cos(a) * 3.3, Math.sin(k * 2.1) * 0.4, Math.sin(a) * 2.4);
      missionPos.set(n.missions[0]!, p);
      set(clusters, i, p.x, p.y, p.z);
    });
    skillNodes.forEach(({ n, i }, k) => {
      if (n.missions.length === 0) {
        const a = (k / skillNodes.length) * Math.PI * 2;
        set(clusters, i, Math.cos(a) * 5.3, 2 + random() * 0.6, Math.sin(a) * 3.2);
        return;
      }
      const c = new Vector3();
      n.missions.forEach((slug) => c.add(missionPos.get(slug) ?? new Vector3()));
      c.divideScalar(n.missions.length);
      const a = random() * Math.PI * 2;
      const d = n.missions.length === 1 ? 0.75 + random() * 0.5 : 0.35 + random() * 0.4;
      set(clusters, i, c.x + Math.cos(a) * d, c.y + (random() - 0.5) * 0.9, c.z + Math.sin(a) * d);
    });

    const finale = make();
    for (let i = 0; i < this.realCount; i++) {
      set(finale, i, galaxy[i * 3]! * 1.08, galaxy[i * 3 + 1]! * 1.08, galaxy[i * 3 + 2]! * 1.08);
    }

    for (let a = 0; a < ambientCount; a++) {
      const i = this.realCount + a;
      const d = ambientDir[a]!;
      const r = ambientR[a]!;
      set(galaxy, i, d.x * (3.9 + r * 3.4), d.y * (3.9 + r * 3.4) * 0.62, d.z * (3.9 + r * 3.4));
      set(layers, i, d.x * (6.4 + r * 3), d.y * (6.4 + r * 3) * 0.9, d.z * (6.4 + r * 3));
      set(clusters, i, d.x * (6.6 + r * 2.6), d.y * (6.6 + r * 2.6) * 0.7, d.z * (6.6 + r * 2.6));
      set(finale, i, d.x * (4.4 + r * 4.2), d.y * (4.4 + r * 4.2) * 0.62, d.z * (4.4 + r * 4.2));
    }
    set(galaxy, this.futureIndex, 4.6, 0.3, 1);
    set(layers, this.futureIndex, 6, 0, 0);
    set(clusters, this.futureIndex, 0, 2.6, 4.6);
    set(finale, this.futureIndex, 4.3, 0.25, 1.1);

    this.formations = { galaxy, layers, clusters, finale };

    // --- liens -------------------------------------------------------------
    const edgeList: [number, number][] = [...graph.edges];
    for (let a = 0; a < ambientCount; a++) {
      const i = this.realCount + a;
      const near = this.nearest(galaxy, i, this.realCount, this.count - 1, 2);
      near.forEach((j) => j > i && edgeList.push([i, j]));
    }
    for (let i = 0; i < this.realCount; i++) {
      const [j] = this.nearest(galaxy, i, this.realCount, this.count - 1, 1);
      if (j !== undefined) edgeList.push([i, j]);
    }
    edgeList.push([this.incidentIndex, this.supervisionIndex]);
    missionNodes.forEach(({ i }) => edgeList.push([this.futureIndex, i]));

    this.edges = new Int32Array(edgeList.flat());
    this.adjacency = Array.from({ length: this.count }, () => []);
    edgeList.forEach(([a, b]) => {
      this.adjacency[a]!.push(b);
      this.adjacency[b]!.push(a);
    });

    // --- attributs des nœuds ----------------------------------------------
    this.current = new Float32Array(this.count * 3);
    for (let i = 0; i < this.count; i++) {
      // Départ : tout est replié au centre, puis se déploie (démarrage).
      const s = 0.15;
      this.current[i * 3] = galaxy[i * 3]! * s;
      this.current[i * 3 + 1] = galaxy[i * 3 + 1]! * s;
      this.current[i * 3 + 2] = galaxy[i * 3 + 2]! * s;
    }
    this.colors = new Float32Array(this.count * 3);
    this.sizes = new Float32Array(this.count);
    this.alphas = new Float32Array(this.count);
    this.baseSize = new Float32Array(this.count);
    this.phases = new Float32Array(this.count);
    this.revealAt = new Float32Array(this.count);
    for (let i = 0; i < this.count; i++) {
      const node = graph.nodes[i];
      this.baseSize[i] = node ? (node.kind === "mission" ? 6 : node.missions.length > 0 ? 3.4 : 2.6) : i === this.futureIndex ? 6 : 1.9;
      this.phases[i] = random() * Math.PI * 2;
      // Ordre d'allumage : missions, puis couches dans l'ordre, puis ambiance.
      this.revealAt[i] = node ? (node.kind === "mission" ? 0.1 : 0.25 + node.layer * 0.12) : 1.05 + random() * 0.5;
    }

    this.nodeGeometry.setAttribute("position", new BufferAttribute(this.current, 3));
    this.nodeGeometry.setAttribute("aColor", new BufferAttribute(this.colors, 3));
    this.nodeGeometry.setAttribute("aSize", new BufferAttribute(this.sizes, 1));
    this.nodeGeometry.setAttribute("aAlpha", new BufferAttribute(this.alphas, 1));

    this.material = new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: { uPixelRatio: { value: 1 }, uOpacity: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const nodes = new Points(this.nodeGeometry, this.material);
    nodes.frustumCulled = false;
    this.group.add(nodes);

    const edgeCount = this.edges.length / 2;
    this.linePositions = new Float32Array(edgeCount * 6);
    this.lineColors = new Float32Array(edgeCount * 6);
    this.lineGeometry.setAttribute("position", new BufferAttribute(this.linePositions, 3));
    this.lineGeometry.setAttribute("color", new BufferAttribute(this.lineColors, 3));
    this.lineMaterial = new LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    const lines = new LineSegments(this.lineGeometry, this.lineMaterial);
    lines.frustumCulled = false;
    this.group.add(lines);

    // --- paquets -------------------------------------------------------------
    const packetCount = options.mobile ? 70 : 160;
    for (let p = 0; p < packetCount; p++) {
      this.packets.push({ edge: 0, t: 0, speed: 0, forward: true, color: new Color(), strength: 0, alive: false });
    }
    this.packetPositions = new Float32Array(packetCount * 3);
    this.packetColors = new Float32Array(packetCount * 3);
    this.packetAlphas = new Float32Array(packetCount);
    const packetSizes = new Float32Array(packetCount).fill(options.mobile ? 3.4 : 3);
    this.packetGeometry.setAttribute("position", new BufferAttribute(this.packetPositions, 3));
    this.packetGeometry.setAttribute("aColor", new BufferAttribute(this.packetColors, 3));
    this.packetGeometry.setAttribute("aSize", new BufferAttribute(packetSizes, 1));
    this.packetGeometry.setAttribute("aAlpha", new BufferAttribute(this.packetAlphas, 1));
    const packets = new Points(this.packetGeometry, this.material);
    packets.frustumCulled = false;
    this.group.add(packets);

    this.resize();
  }

  // --------------------------------------------------------------------------
  // API publique

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;
      const dt = Math.min((now - this.lastTime) / 1000, 0.05);
      this.lastTime = now;
      this.update(dt);
      this.renderer.render(this.scene, this.camera);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  /** Nuage de points du portrait (données préparées par scripts/make-portrait-points.py). */
  setPortrait(data: Uint16Array) {
    this.portrait?.dispose();
    this.portrait = new PortraitCloud(data, { mobile: this.options.mobile, ratio: this.renderer.getPixelRatio() });
    this.scene.add(this.portrait.object);
  }

  setState(state: StageState) {
    this.state = state;
  }

  focus(nodeId: string | null) {
    this.focusIndex = nodeId ? this.graph.nodes.findIndex((n) => n.id === nodeId) : -1;
    this.focusSet = new Set(this.focusIndex >= 0 ? this.adjacency[this.focusIndex] : []);
    if (this.focusIndex >= 0) {
      for (let k = 0; k < 8; k++) this.spawnOn(this.focusIndex, COLOR.signal, 1.6 + Math.random());
    }
  }

  setIncident(phase: IncidentPhase) {
    this.incident = phase;
    const amber = COLOR.progress;
    if (phase === "probe") this.spawnBetween(this.supervisionIndex, this.incidentIndex, COLOR.text, 3, 0.9);
    if (phase === "alert") this.spawnBetween(this.incidentIndex, this.supervisionIndex, amber, 6, 1.1);
    if (phase === "ticket") for (let k = 0; k < 6; k++) this.spawnOn(this.supervisionIndex, amber, 1.4);
    if (phase === "escalate") for (let k = 0; k < 10; k++) this.spawnOn(this.supervisionIndex, amber, 2.2);
    if (phase === "recover") this.spawnBetween(this.supervisionIndex, this.incidentIndex, COLOR.signal, 4, 1.2);
    if (phase === "resolved") for (let k = 0; k < 14; k++) this.spawnOn(this.incidentIndex, COLOR.signal, 1.8 + Math.random());
  }

  /** Salve de paquets depuis le nœud le plus proche du point cliqué. */
  burst(x: number, y: number) {
    const i = this.pick(x, y, 260, true);
    if (i < 0) return;
    for (let k = 0; k < 12; k++) this.spawnOn(i, COLOR.signal, 1.8 + Math.random() * 1.4);
  }

  /** Plongée de la caméra vers une mission (transition de page). */
  dive(slug: string) {
    this.state = { formation: "mission", opacity: Math.max(this.state.opacity, 0.7), slug };
    this.diveBoost = 1;
    const i = this.missionIndex.get(slug);
    if (i !== undefined) for (let k = 0; k < 16; k++) this.spawnOn(i, COLOR.signal, 2.4);
  }

  setPointer(x: number, y: number, active: boolean) {
    this.pointer.x = x;
    this.pointer.y = y;
    this.pointer.nx = (x / this.width) * 2 - 1;
    this.pointer.ny = (y / this.height) * 2 - 1;
    this.pointer.active = active;
  }

  hoveredNode(): GraphNode | null {
    return this.hovered >= 0 && this.hovered < this.realCount ? this.graph.nodes[this.hovered]! : null;
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, this.options.mobile ? 1.25 : 1.6);
    this.renderer.setPixelRatio(ratio);
    this.renderer.setSize(this.width, this.height, false);
    this.material.uniforms.uPixelRatio!.value = ratio;
    this.portrait?.setPixelRatio(ratio);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  dispose() {
    this.stop();
    this.portrait?.dispose();
    this.nodeGeometry.dispose();
    this.lineGeometry.dispose();
    this.packetGeometry.dispose();
    this.material.dispose();
    this.lineMaterial.dispose();
    this.renderer.dispose();
  }

  // --------------------------------------------------------------------------
  // Boucle

  private update(dt: number) {
    this.elapsed += dt;
    const time = this.elapsed;
    const { formation, opacity: targetOpacity } = this.state;
    const desktop = this.width >= 960;

    // Une technologie sélectionnée dans la carte rend la scène plus présente.
    const focusBoost = this.focusIndex >= 0 && formation === "layers" ? 0.85 : 0;
    this.opacity = damp(this.opacity, Math.max(targetOpacity, focusBoost) * (desktop ? 1 : 0.6), 2.2, dt);
    // Le portrait au premier plan : le réseau s'efface en partie derrière lui.
    const portraitVis = this.updatePortrait(dt, desktop);
    this.material.uniforms.uOpacity!.value = this.opacity * (1 - 0.62 * portraitVis);
    this.lineMaterial.opacity = this.opacity * 0.42 * (1 - 0.55 * portraitVis);

    // Rotation lente, figée quand la caméra doit viser un nœud précis.
    const still = formation === "live" || formation === "mission";
    if (still) {
      this.rotation = Math.atan2(Math.sin(this.rotation), Math.cos(this.rotation));
      this.rotation = damp(this.rotation, 0, 1.8, dt);
    } else {
      this.rotation += dt * (formation === "layers" ? 0.07 : 0.045);
    }
    this.group.rotation.y = this.rotation;
    this.group.updateMatrixWorld();

    // Positions : interpolation vers la formation cible.
    const key = formation === "live" ? "galaxy" : formation === "mission" ? "clusters" : formation;
    const target = this.formations[key];
    const lambda = time < 2 ? 1.6 : 2.4;
    for (let i = 0; i < this.count; i++) {
      const float = i >= this.realCount ? Math.sin(time * 0.5 + this.phases[i]!) * 0.05 : 0;
      for (let c = 0; c < 3; c++) {
        const idx = i * 3 + c;
        this.current[idx] = damp(this.current[idx]!, target[idx]! + (c === 1 ? float : 0), lambda, dt);
      }
    }

    this.updateNodes(time, dt);
    this.updateLines(dt);
    this.updatePackets(dt, time);
    this.updateCamera(dt, desktop);
    this.updateHover();

    this.nodeGeometry.attributes.position!.needsUpdate = true;
    this.nodeGeometry.attributes.aColor!.needsUpdate = true;
    this.nodeGeometry.attributes.aSize!.needsUpdate = true;
    this.nodeGeometry.attributes.aAlpha!.needsUpdate = true;
    this.lineGeometry.attributes.position!.needsUpdate = true;
    this.lineGeometry.attributes.color!.needsUpdate = true;
  }

  /** Met à jour le portrait ; renvoie sa présence (0 à 1) pour atténuer le réseau. */
  private updatePortrait(dt: number, desktop: boolean): number {
    if (!this.portrait) return 0;
    let pointer: Vector3 | null = null;
    if (this.pointer.active && desktop) {
      // Intersection du rayon pointeur avec le plan du portrait (z = 0).
      this.tmp.set(this.pointer.nx, -this.pointer.ny, 0.5).unproject(this.camera).sub(this.camera.position).normalize();
      const t = -this.camera.position.z / this.tmp.z;
      if (t > 0) pointer = this.pointerPlane.copy(this.camera.position).addScaledVector(this.tmp, t);
    }
    const visible = this.state.portrait === true && this.state.formation === "galaxy";
    this.portrait.update(dt, this.elapsed, visible, this.opacity, pointer);
    return this.portrait.visibility;
  }

  private updateNodes(time: number, dt: number) {
    const incidentActive = ACTIVE_INCIDENT.includes(this.incident);
    const finale = this.state.formation === "finale";
    const focusing = this.focusIndex >= 0;
    const pulse = 0.5 + 0.5 * Math.sin(time * 6);

    for (let i = 0; i < this.count; i++) {
      const node = this.graph.nodes[i];
      let color = node ? (node.kind === "mission" ? COLOR.signal : node.missions.length > 0 ? COLOR.text : COLOR.dim) : COLOR.ambient;
      let size = this.baseSize[i]!;
      let alpha = node ? (node.kind === "mission" ? 1 : 0.85) : 0.7;

      if (i === this.futureIndex) {
        color = COLOR.progress;
        alpha = finale ? 0.65 + pulse * 0.35 : 0;
        size = finale ? 7 + pulse * 3 : 0;
      } else if (i === this.incidentIndex) {
        size = 4.2;
        alpha = 0.9;
        color = COLOR.dim;
        if (incidentActive) {
          color = COLOR.progress;
          size = 6 + pulse * 3.5;
          alpha = 1;
        } else if (this.incident === "recover" || this.incident === "resolved") {
          color = COLOR.signal;
          size = 6;
          alpha = 1;
        }
      } else if (i === this.supervisionIndex && (this.incident === "ticket" || this.incident === "escalate")) {
        color = COLOR.progress;
        size = this.baseSize[i]! * (1.2 + pulse * 0.3);
      }

      if (focusing) {
        if (i === this.focusIndex) {
          color = COLOR.signal;
          size = this.baseSize[i]! * 2.1 + pulse * 1.5;
          alpha = 1;
        } else if (this.focusSet.has(i) && i < this.realCount) {
          color = this.graph.nodes[i]!.kind === "mission" ? COLOR.signal : COLOR.text;
          size *= 1.35;
          alpha = 1;
        } else if (i !== this.incidentIndex) {
          alpha *= 0.3;
        }
      }

      if (i === this.hovered) {
        size *= 1.6;
        alpha = 1;
      }

      // Démarrage : chaque nœud s'allume à son tour.
      if (time < this.revealAt[i]!) alpha = 0;

      const twinkle = i >= this.realCount ? 0.75 + 0.25 * Math.sin(time * 1.3 + this.phases[i]!) : 1;
      const k = 1 - Math.exp(-8 * dt);
      this.colors[i * 3] = this.colors[i * 3]! + (color.r - this.colors[i * 3]!) * k;
      this.colors[i * 3 + 1] = this.colors[i * 3 + 1]! + (color.g - this.colors[i * 3 + 1]!) * k;
      this.colors[i * 3 + 2] = this.colors[i * 3 + 2]! + (color.b - this.colors[i * 3 + 2]!) * k;
      this.sizes[i] = damp(this.sizes[i]!, size, 10, dt);
      this.alphas[i] = damp(this.alphas[i]!, alpha * twinkle, 6, dt);
    }
  }

  private updateLines(dt: number) {
    const incidentActive = ACTIVE_INCIDENT.includes(this.incident);
    const finale = this.state.formation === "finale";
    const reveal = Math.min(Math.max((this.elapsed - 0.6) / 1.2, 0), 1);
    const k = 1 - Math.exp(-6 * dt);

    for (let e = 0; e < this.edges.length / 2; e++) {
      const a = this.edges[e * 2]!;
      const b = this.edges[e * 2 + 1]!;
      for (let c = 0; c < 3; c++) {
        this.linePositions[e * 6 + c] = this.current[a * 3 + c]!;
        this.linePositions[e * 6 + 3 + c] = this.current[b * 3 + c]!;
      }

      const real = a < this.realCount && b < this.realCount;
      let color = this.tmpColor.copy(real ? COLOR.dim : COLOR.ambient).multiplyScalar(real ? 0.5 : 0.55);
      if (a === this.futureIndex || b === this.futureIndex) {
        color = finale ? this.tmpColor.copy(COLOR.progress).multiplyScalar(0.55) : this.tmpColor.copy(COLOR.black);
      } else if (this.focusIndex >= 0) {
        color = a === this.focusIndex || b === this.focusIndex ? this.tmpColor.copy(COLOR.signal).multiplyScalar(0.95) : color.multiplyScalar(0.35);
      }
      if (incidentActive && (a === this.incidentIndex || b === this.incidentIndex)) {
        color = this.tmpColor.copy(COLOR.progress).multiplyScalar(0.85);
      }
      color.multiplyScalar(reveal);

      for (let v = 0; v < 2; v++) {
        const o = e * 6 + v * 3;
        this.lineColors[o] = this.lineColors[o]! + (color.r - this.lineColors[o]!) * k;
        this.lineColors[o + 1] = this.lineColors[o + 1]! + (color.g - this.lineColors[o + 1]!) * k;
        this.lineColors[o + 2] = this.lineColors[o + 2]! + (color.b - this.lineColors[o + 2]!) * k;
      }
    }
  }

  private updatePackets(dt: number, time: number) {
    // Flux continu entre la technologie sélectionnée et ses missions.
    if (this.focusIndex >= 0) {
      this.focusClock += dt;
      while (this.focusClock > 0.06) {
        this.focusClock -= 0.06;
        this.spawnOn(this.focusIndex, COLOR.signal, 1.2 + Math.random() * 0.8);
      }
    }

    // Trafic de fond une fois le système « en ligne ».
    if (time > 1.4) {
      this.spawnClock += dt;
      const interval = this.options.mobile ? 0.16 : 0.07;
      while (this.spawnClock > interval) {
        this.spawnClock -= interval;
        const e = Math.floor(Math.random() * (this.edges.length / 2));
        const a = this.edges[e * 2]!;
        const b = this.edges[e * 2 + 1]!;
        const real = a < this.realCount || b < this.realCount;
        if (a === this.futureIndex || b === this.futureIndex) continue;
        this.spawnEdge(e, Math.random() < 0.5, real ? COLOR.signal : COLOR.text, real ? 0.9 : 0.45, 0.35 + Math.random() * 0.45);
      }
    }

    this.packets.forEach((p, i) => {
      if (p.alive) {
        p.t += p.speed * dt;
        if (p.t >= 1) p.alive = false;
      }
      const o = i * 3;
      if (!p.alive) {
        this.packetAlphas[i] = 0;
        return;
      }
      const a = this.edges[p.edge * 2]!;
      const b = this.edges[p.edge * 2 + 1]!;
      const from = p.forward ? a : b;
      const to = p.forward ? b : a;
      const t = p.t;
      for (let c = 0; c < 3; c++) {
        this.packetPositions[o + c] = this.current[from * 3 + c]! + (this.current[to * 3 + c]! - this.current[from * 3 + c]!) * t;
      }
      this.packetColors[o] = p.color.r;
      this.packetColors[o + 1] = p.color.g;
      this.packetColors[o + 2] = p.color.b;
      this.packetAlphas[i] = p.strength * Math.sin(Math.PI * t);
    });

    this.packetGeometry.attributes.position!.needsUpdate = true;
    this.packetGeometry.attributes.aColor!.needsUpdate = true;
    this.packetGeometry.attributes.aAlpha!.needsUpdate = true;
  }

  private updateCamera(dt: number, desktop: boolean) {
    const { formation, slug } = this.state;
    const look = this.tmp.set(0, 0, 0);
    const pos = this.tmp2.set(0, 0.9, 11.5);
    let shift = desktop ? -3 : 0;

    const world = (i: number) => new Vector3(this.current[i * 3]!, this.current[i * 3 + 1]!, this.current[i * 3 + 2]!).applyMatrix4(this.group.matrixWorld);

    switch (formation) {
      case "layers":
        pos.set(0, 2.4, 10.8);
        look.set(0, -0.4, 0);
        shift = 0;
        break;
      case "clusters":
        pos.set(0, 5.2, 8.8);
        look.set(0, -0.3, 0);
        shift = desktop ? -1.6 : 0;
        break;
      case "live": {
        const inc = world(this.incidentIndex);
        const sup = world(this.supervisionIndex);
        look.copy(inc).lerp(sup, 0.45);
        pos.copy(look).add(new Vector3(0.4, 0.9, 5.2));
        shift = desktop ? -2 : 0;
        break;
      }
      case "finale":
        pos.set(0, 1.4, 13.5);
        look.set(0.6, 0, 0);
        shift = desktop ? -2.6 : 0;
        break;
      case "mission": {
        const i = slug ? this.missionIndex.get(slug) : undefined;
        if (i !== undefined) {
          look.copy(world(i));
          // Plongée rapprochée, puis recul pour laisser le texte lisible.
          pos.copy(look).add(new Vector3(0, 1.4, this.diveBoost > 0.5 ? 2.4 : 6.2));
        }
        shift = desktop ? -2.4 : 0;
        break;
      }
    }

    // Mobile : scène plus lointaine et plus basse, pour dégager le texte.
    if (!desktop) {
      pos.z += 6.5;
      pos.y += 2.4;
      look.y += 2.4;
    }
    // Parallaxe légère au pointeur.
    if (this.pointer.active && desktop) {
      pos.x += this.pointer.nx * 0.45;
      pos.y -= this.pointer.ny * 0.3;
    }
    pos.x += shift;
    look.x += shift;

    const speed = this.diveBoost > 0 ? 4.5 : 1.7;
    this.diveBoost = Math.max(0, this.diveBoost - dt * 0.9);
    this.camPos.set(damp(this.camPos.x, pos.x, speed, dt), damp(this.camPos.y, pos.y, speed, dt), damp(this.camPos.z, pos.z, speed, dt));
    this.camLook.set(damp(this.camLook.x, look.x, speed, dt), damp(this.camLook.y, look.y, speed, dt), damp(this.camLook.z, look.z, speed, dt));
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);
  }

  private updateHover() {
    if (!this.pointer.active || this.opacity < 0.45) {
      if (this.hovered !== -1) {
        this.hovered = -1;
        this.options.onHover(null);
      }
      return;
    }
    const i = this.pick(this.pointer.x, this.pointer.y, 22, false);
    if (i !== this.hovered) {
      this.hovered = i;
      this.options.onHover(i >= 0 && i < this.realCount ? this.graph.nodes[i]! : null);
    }
  }

  // --------------------------------------------------------------------------
  // Outils

  /** Nœud réel (ou d'ambiance si `any`) le plus proche d'un point de l'écran. */
  private pick(x: number, y: number, radius: number, any: boolean): number {
    let best = -1;
    let bestD = radius * radius;
    const limit = any ? this.count - 1 : this.realCount;
    for (let i = 0; i < limit; i++) {
      if (this.alphas[i]! < 0.25) continue;
      this.tmp.set(this.current[i * 3]!, this.current[i * 3 + 1]!, this.current[i * 3 + 2]!).applyMatrix4(this.group.matrixWorld).project(this.camera);
      if (this.tmp.z > 1) continue;
      const sx = (this.tmp.x * 0.5 + 0.5) * this.width;
      const sy = (-this.tmp.y * 0.5 + 0.5) * this.height;
      const d = (sx - x) ** 2 + (sy - y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  }

  private nearest(positions: Float32Array, i: number, from: number, to: number, k: number): number[] {
    const found: { j: number; d: number }[] = [];
    for (let j = from; j < to; j++) {
      if (j === i) continue;
      const d =
        (positions[i * 3]! - positions[j * 3]!) ** 2 +
        (positions[i * 3 + 1]! - positions[j * 3 + 1]!) ** 2 +
        (positions[i * 3 + 2]! - positions[j * 3 + 2]!) ** 2;
      found.push({ j, d });
    }
    return found
      .sort((a, b) => a.d - b.d)
      .slice(0, k)
      .map((f) => f.j);
  }

  private spawnEdge(edge: number, forward: boolean, color: Color, strength: number, speed: number) {
    const p = this.packets.find((x) => !x.alive);
    if (!p) return;
    p.edge = edge;
    p.forward = forward;
    p.t = 0;
    p.speed = speed;
    p.color.copy(color);
    p.strength = strength;
    p.alive = true;
  }

  /** Paquets qui partent d'un nœud sur ses liens. */
  private spawnOn(node: number, color: Color, speed: number) {
    const edgesOf: number[] = [];
    for (let e = 0; e < this.edges.length / 2; e++) {
      if (this.edges[e * 2] === node || this.edges[e * 2 + 1] === node) edgesOf.push(e);
    }
    const e = edgesOf[Math.floor(Math.random() * edgesOf.length)];
    if (e === undefined) return;
    this.spawnEdge(e, this.edges[e * 2] === node, color, 1, speed);
  }

  /** Paquets dirigés d'un nœud vers un autre (lien direct). */
  private spawnBetween(from: number, to: number, color: Color, count: number, speed: number) {
    for (let e = 0; e < this.edges.length / 2; e++) {
      const a = this.edges[e * 2];
      const b = this.edges[e * 2 + 1];
      if ((a === from && b === to) || (a === to && b === from)) {
        for (let k = 0; k < count; k++) {
          this.spawnEdge(e, a === from, color, 1, speed * (0.7 + k * 0.12));
        }
        return;
      }
    }
  }
}
