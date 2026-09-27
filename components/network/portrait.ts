/**
 * Visage en particules, attaché à la caméra : il reste de face, en
 * arrière-plan, quelle que soit la formation du réseau.
 *
 * - Volume réel : les particules du visage reposent sur le maillage 3D
 *   extrait de la photo (voir portrait-build.ts).
 * - Parole : la mâchoire, les lèvres (étirées ou arrondies) et l'intérieur
 *   de la bouche suivent les pistes calculées sur l'annonce audio.
 * - Vie : clignements, respiration, tête qui se tourne vers le pointeur
 *   (ou le doigt), léger hochement pendant la parole.
 * - Maillage filaire holographique, révélé par une ligne de balayage.
 * Tout le mouvement est calculé sur la carte graphique.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Group,
  LineSegments,
  Points,
  ShaderMaterial,
  Vector2,
  Vector3,
} from "three";
import type { PortraitData } from "./portrait-build";

const COMMON = /* glsl */ `
  attribute vec3 aJaw;
  attribute vec3 aShape;
  attribute vec3 aBlink;
  uniform float uOpen;
  uniform float uShape;
  uniform float uBlink;
  uniform vec2 uHeadRot;
  uniform vec3 uPivot;
  uniform float uTime;

  vec3 rig(vec3 base, float headWeight) {
    vec3 p = base + aJaw * uOpen + aShape * uShape + aBlink * uBlink;
    vec3 q = p - uPivot;
    float yaw = uHeadRot.x * headWeight;
    float pitch = uHeadRot.y * headWeight;
    float cy = cos(yaw), sy = sin(yaw);
    q = vec3(cy * q.x + sy * q.z, q.y, -sy * q.x + cy * q.z);
    float cp = cos(pitch), sp = sin(pitch);
    q = vec3(q.x, cp * q.y - sp * q.z, sp * q.y + cp * q.z);
    return uPivot + q;
  }
`;

const VERTEX = /* glsl */ `
  ${COMMON}
  attribute vec3 aStart;
  attribute float aDelay;
  attribute vec3 aColor;
  attribute float aIntensity;
  attribute float aHead;
  attribute float aKind;
  uniform float uProgress;
  uniform float uScatter;
  uniform float uScanY;
  uniform float uPixelRatio;
  uniform float uOpacity;
  uniform float uSize;
  uniform float uVoice;
  uniform float uDensity;
  varying float vAlpha;
  varying vec3 vColor;

  float easeInOut(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void main() {
    float t = clamp((uProgress - aDelay) / 0.6, 0.0, 1.0);
    float e = easeInOut(t);
    vec3 target = rig(position, aHead);
    // Respiration : la silhouette se soulève à peine.
    target.y += sin(uTime * 1.3) * 0.02 * (1.0 - aHead * 0.5);
    vec3 p = mix(aStart, target, e);
    p = mix(p, aStart * 1.25, uScatter);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float face = aKind == 1.0 ? 1.0 : 0.0;
    float mouth = aKind == 2.0 ? 1.0 : 0.0;
    gl_PointSize = uSize * (0.55 + aIntensity * 0.85) * (1.0 + mouth * 0.8) * uPixelRatio * (190.0 / -mv.z);
    gl_Position = projectionMatrix * mv;

    // Ligne de balayage : une bande lumineuse qui descend sur le visage.
    float scan = (1.0 - smoothstep(0.0, 0.14, abs(position.y - uScanY))) * (0.35 + face);

    // Couleur : teinte de la photo dans la lumière, vert du signal dans l'ombre.
    vec3 signal = vec3(0.24, 0.86, 0.52);
    // Teint fidèle : la couleur réelle de la peau, éclaircie (reflets cuivrés).
    float lum = max(dot(aColor, vec3(0.2126, 0.7152, 0.0722)), 0.03);
    vec3 photo = min(aColor / lum * 0.62, vec3(1.0));
    vec3 base = mix(signal * 0.9, photo, smoothstep(0.08, 0.45, aIntensity) * (0.45 + 0.55 * face));
    base = mix(base, vec3(0.62, 1.0, 0.78), scan * 0.75);
    vColor = mix(base, signal * 1.15, mouth);

    float speaking = 1.0 + uVoice * 0.35 * face;
    float visible = (0.25 + 0.75 * e) * (1.0 - uScatter);
    vAlpha = uOpacity * visible * speaking * (1.0 + scan * 1.2)
      * mix((0.08 + aIntensity * 1.1) * uDensity, uOpen * 0.6, mouth);
  }
`;

const FRAGMENT = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float d = length(p);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor * core, core * vAlpha);
  }
`;

const WIRE_VERTEX = /* glsl */ `
  ${COMMON}
  uniform float uScanY;
  uniform float uWire;
  varying float vAlpha;
  void main() {
    vec3 p = rig(position, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    float scan = 1.0 - smoothstep(0.0, 0.35, abs(position.y - uScanY));
    // Scintillement discret, plus présent quand la voix passe.
    float flicker = 0.85 + 0.15 * sin(uTime * 23.0 + position.x * 40.0);
    vAlpha = uWire * (0.05 + 0.1 * uOpen + scan * 0.5) * flicker;
  }
`;

const WIRE_FRAGMENT = /* glsl */ `
  varying float vAlpha;
  void main() {
    gl_FragColor = vec4(vec3(0.24, 0.86, 0.52) * vAlpha, vAlpha);
  }
`;

const damp = (a: number, b: number, lambda: number, dt: number) => a + (b - a) * (1 - Math.exp(-lambda * dt));

export class PortraitCloud {
  readonly object = new Group();
  private material: ShaderMaterial;
  private wireMaterial: ShaderMaterial;
  private geometry = new BufferGeometry();
  private wireGeometry = new BufferGeometry();
  private progress = 0;
  private scatter = 1;
  private started = false;
  private scanClock = 0;
  private readonly top: number;
  private readonly bottom: number;
  private turn = new Vector2();
  private open = 0;
  private openSlow = 0;
  private shape = 0;
  private blinkClock = 2.5;
  private blinkPhase = -1;
  private readonly reduced: boolean;
  /** Présence du portrait (0 à 1), utilisée pour atténuer le réseau. */
  visibility = 0;
  /** Tête dans le repère du portrait (placement dans un cadre de la page). */
  readonly frame: PortraitData["frame"];

  constructor(data: PortraitData, options: { ratio: number; size: number; reducedMotion?: boolean }) {
    this.reduced = options.reducedMotion ?? false;
    this.frame = data.frame;
    const { count } = data;
    const start = new Float32Array(count * 3);
    const delay = new Float32Array(count);
    let top = -Infinity;
    let bottom = Infinity;
    for (let i = 0; i < count; i++) {
      // Départ : dispersés dans l'espace du réseau.
      const theta = Math.random() * Math.PI * 2;
      const z = Math.random() * 2 - 1;
      const r = 5 + Math.random() * 4;
      const ring = Math.sqrt(1 - z * z);
      start[i * 3] = Math.cos(theta) * ring * r;
      start[i * 3 + 1] = z * r * 0.6;
      start[i * 3 + 2] = Math.sin(theta) * ring * r - 4;
      // Assemblage de haut en bas, avec un léger désordre.
      const y = data.position[i * 3 + 1]!;
      delay[i] = (0.5 - y / data.height) * 0.75 + Math.random() * 0.3;
      if (data.kind[i] === 1) {
        top = Math.max(top, y);
        bottom = Math.min(bottom, y);
      }
    }
    this.top = top;
    this.bottom = bottom;

    const g = this.geometry;
    g.setAttribute("position", new BufferAttribute(data.position, 3));
    g.setAttribute("aStart", new BufferAttribute(start, 3));
    g.setAttribute("aDelay", new BufferAttribute(delay, 1));
    g.setAttribute("aColor", new BufferAttribute(data.color, 3));
    g.setAttribute("aIntensity", new BufferAttribute(data.intensity, 1));
    g.setAttribute("aJaw", new BufferAttribute(data.jaw, 3));
    g.setAttribute("aShape", new BufferAttribute(data.shape, 3));
    g.setAttribute("aBlink", new BufferAttribute(data.blink, 3));
    g.setAttribute("aHead", new BufferAttribute(data.head, 1));
    g.setAttribute("aKind", new BufferAttribute(data.kind, 1));

    const w = this.wireGeometry;
    w.setAttribute("position", new BufferAttribute(data.wire.position, 3));
    w.setAttribute("aJaw", new BufferAttribute(data.wire.jaw, 3));
    w.setAttribute("aShape", new BufferAttribute(data.wire.shape, 3));
    w.setAttribute("aBlink", new BufferAttribute(data.wire.blink, 3));

    const shared = {
      uOpen: { value: 0 },
      uShape: { value: 0 },
      uBlink: { value: 0 },
      uHeadRot: { value: new Vector2() },
      uPivot: { value: new Vector3(...data.pivot) },
      uTime: { value: 0 },
      uScanY: { value: 99 },
    };
    this.material = new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: {
        ...shared,
        uProgress: { value: 0 },
        uScatter: { value: 1 },
        uPixelRatio: { value: options.ratio },
        uOpacity: { value: 1 },
        uSize: { value: options.size },
        uVoice: { value: 0 },
        // Plus de particules, chacune plus discrète : même luminosité d'ensemble.
        uDensity: { value: Math.min(1.2, (16000 / count) ** 0.8) },
      },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    this.wireMaterial = new ShaderMaterial({
      vertexShader: WIRE_VERTEX,
      fragmentShader: WIRE_FRAGMENT,
      uniforms: { ...shared, uWire: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });

    const points = new Points(this.geometry, this.material);
    points.frustumCulled = false;
    const wire = new LineSegments(this.wireGeometry, this.wireMaterial);
    wire.frustumCulled = false;
    this.object.add(points, wire);
  }

  /**
   * @param visible le portrait doit être affiché (hero, ou transmission en cours)
   * @param opacity intensité du portrait
   * @param gaze direction du regard (-1 à 1 sur chaque axe) ou null
   * @param voice ouverture de la bouche (0 à 1)
   * @param mouthShape forme des lèvres (0 arrondies, 1 étirées)
   */
  update(dt: number, time: number, visible: boolean, opacity: number, gaze: Vector2 | null, voice = 0, mouthShape = 0.5) {
    if (visible) this.started = true;
    // Assemblage plus rapide quand une transmission l'appelle.
    if (this.started) this.progress = Math.min(this.progress + dt * (voice > 0 ? 1.1 : 0.55), 1.7);
    this.scatter = damp(this.scatter, visible ? 0 : 1, visible ? 2.8 : 1.6, dt);
    this.visibility = (1 - this.scatter) * Math.min(this.progress, 1);

    // Bouche : suit la voix (déjà lissée), avec un léger amorti.
    this.open = damp(this.open, voice, 28, dt);
    this.openSlow = damp(this.openSlow, voice, 3, dt);
    this.shape = damp(this.shape, (mouthShape - 0.5) * 2 * Math.min(1, voice * 2.5), 14, dt);

    // Clignements : toutes les 2,5 à 6 s, 0,18 s.
    if (!this.reduced) {
      this.blinkClock -= dt;
      if (this.blinkClock <= 0) {
        this.blinkPhase = 0;
        this.blinkClock = 2.5 + Math.random() * 3.5;
      }
    }
    let blink = 0;
    if (this.blinkPhase >= 0) {
      this.blinkPhase += dt / 0.18;
      blink = this.blinkPhase < 0.4 ? this.blinkPhase / 0.4 : Math.max(0, 1 - (this.blinkPhase - 0.4) / 0.6);
      if (this.blinkPhase >= 1) this.blinkPhase = -1;
    }

    // Tête : suit le regard ; oscillation lente au repos ; hochement en parlant.
    const idleYaw = this.reduced ? 0 : Math.sin(time * 0.32) * 0.09;
    const idlePitch = this.reduced ? 0 : Math.sin(time * 0.21) * 0.025;
    const nod = (this.open - this.openSlow) * 0.1;
    const targetYaw = gaze ? gaze.x * 0.3 : idleYaw;
    const targetPitch = (gaze ? gaze.y * 0.16 : idlePitch) + nod;
    this.turn.set(damp(this.turn.x, targetYaw, 3.2, dt), damp(this.turn.y, targetPitch, 3.2, dt));

    // Balayage toutes les 7 secondes, du haut vers le bas du visage (1,6 s).
    this.scanClock = (this.scanClock + dt) % 7;
    const scan = this.scanClock < 1.6 ? this.top + (this.bottom - this.top) * (this.scanClock / 1.6) : 99;

    const u = this.material.uniforms;
    u.uProgress!.value = this.progress;
    u.uScatter!.value = this.scatter;
    u.uOpen!.value = this.open;
    u.uShape!.value = this.shape;
    u.uBlink!.value = blink;
    u.uVoice!.value = voice;
    (u.uHeadRot!.value as Vector2).copy(this.turn);
    u.uTime!.value = time;
    u.uScanY!.value = scan;
    u.uOpacity!.value = opacity;
    // Le filaire apparaît une fois le visage formé.
    const formed = Math.max(0, Math.min(1, (this.progress - 1) / 0.5)) * (1 - this.scatter);
    this.wireMaterial.uniforms.uWire!.value = formed * opacity;
    this.object.visible = this.scatter < 0.995;
  }

  setPixelRatio(ratio: number) {
    this.material.uniforms.uPixelRatio!.value = ratio;
  }

  dispose() {
    this.geometry.dispose();
    this.wireGeometry.dispose();
    this.material.dispose();
    this.wireMaterial.dispose();
  }
}
