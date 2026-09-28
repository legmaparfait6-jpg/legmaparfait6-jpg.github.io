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
  DataTexture,
  Group,
  LinearFilter,
  LinearMipmapLinearFilter,
  LineSegments,
  Mesh,
  Points,
  RGBAFormat,
  ShaderMaterial,
  UnsignedByteType,
  Vector2,
  Vector3,
  Vector4,
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

  /** Rotation de la tête (lacet puis tangage), pondérée par région. */
  vec3 turn(vec3 q, float headWeight) {
    float yaw = uHeadRot.x * headWeight;
    float pitch = uHeadRot.y * headWeight;
    float cy = cos(yaw), sy = sin(yaw);
    q = vec3(cy * q.x + sy * q.z, q.y, -sy * q.x + cy * q.z);
    float cp = cos(pitch), sp = sin(pitch);
    return vec3(q.x, cp * q.y - sp * q.z, sp * q.y + cp * q.z);
  }

  /**
   * Perspective faible : chaque point est ramené à l'échelle du plan du
   * portrait. Au repos, l'image est exactement la photo (aucune déformation
   * des zones plus lointaines) ; le relief se révèle quand la tête tourne.
   */
  vec4 viewPosition(vec3 p) {
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float planeDepth = -modelViewMatrix[3].z;
    mv.xy *= -mv.z / planeDepth;
    return mv;
  }

  vec3 rig(vec3 base, float headWeight) {
    vec3 p = base + aJaw * uOpen + aShape * uShape + aBlink * uBlink;
    return uPivot + turn(p - uPivot, headWeight);
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
  attribute vec3 aNormal;
  uniform float uProgress;
  uniform float uScatter;
  uniform float uScanY;
  uniform float uPixelRatio;
  uniform float uOpacity;
  uniform float uSize;
  uniform float uVoice;
  uniform float uDensity;
  uniform vec3 uLight;
  uniform float uFocus;
  uniform float uSettle;
  uniform vec3 uHeadCircle;
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
    // Matière vivante : chaque particule frémit, imperceptiblement.
    float seed = aDelay * 97.0;
    target += vec3(sin(uTime * 2.1 + seed), cos(uTime * 1.7 + seed * 1.3), sin(uTime * 1.3 + seed * 0.7)) * 0.006;
    vec3 p = mix(aStart, target, e);
    p = mix(p, aStart * 1.25, uScatter);

    float face = (aKind == 1.0 || aKind == 4.0) ? 1.0 : 0.0;
    float mouth = aKind == 2.0 ? 1.0 : 0.0;
    float hair = aKind == 3.0 ? 1.0 : 0.0;

    // Profondeur de champ : net sur le visage, flou doux en avant et en arrière.
    float defocus = smoothstep(1.1, 3.4, abs(p.z - uFocus));
    vec4 mv = viewPosition(p);
    gl_PointSize = uSize * (0.55 + aIntensity * 0.85) * (1.0 + mouth * 0.45) * (1.0 + defocus * 1.8)
      * uPixelRatio * (190.0 / -mv.z);
    gl_Position = projectionMatrix * mv;

    // Ligne de balayage : une bande lumineuse qui descend sur le visage.
    float scan = (1.0 - smoothstep(0.0, 0.14, abs(position.y - uScanY))) * (0.35 + face);

    // Couleur : le teint réel de la peau (reflets cuivrés), vert du signal dans l'ombre.
    vec3 signal = vec3(0.24, 0.86, 0.52);
    float lum = max(dot(aColor, vec3(0.2126, 0.7152, 0.0722)), 0.03);
    vec3 photo = min(aColor / lum * 0.62, vec3(1.0));
    vec3 base = mix(signal * 0.9, photo, smoothstep(0.08, 0.45, aIntensity) * (0.45 + 0.55 * face));
    // Cheveux : sombres, à peine teintés, seuls les contours accrochent la lumière.
    base = mix(base, mix(signal * 0.45, photo * 0.8, 0.55), hair);

    // Éclairage : lumière principale qui suit le regard, reflet sur la peau,
    // liseré vert sur les contours (lumière arrière).
    vec3 n = normalize(turn(aNormal, aHead));
    float wrap = max((dot(n, uLight) + 0.35) / 1.35, 0.0);
    vec3 halfway = normalize(uLight + vec3(0.0, 0.0, 1.0));
    float spec = pow(max(dot(n, halfway), 0.0), 26.0) * face * smoothstep(0.15, 0.6, aIntensity);
    // Liseré réservé à la tête : le buste reste dans l'ombre.
    float rim = pow(1.0 - clamp(n.z, 0.0, 1.0), 3.5) * (1.0 - mouth) * aHead;
    vec3 lit = base * (0.38 + 1.05 * wrap) + vec3(1.0, 0.9, 0.78) * spec * 0.55 + signal * rim * 0.3;
    lit = mix(lit, vec3(0.62, 1.0, 0.78), scan * 0.3);
    vColor = mix(lit, signal * 1.1, mouth);

    float speaking = 1.0 + uVoice * 0.35 * face;
    float visible = (0.25 + 0.75 * e) * (1.0 - uScatter);
    float twinkle = 0.86 + 0.14 * sin(uTime * 2.6 + seed * 3.1);
    // Une fois la surface formée, les particules ne restent qu'en éclats.
    float body = aKind == 0.0 && aHead < 0.05 ? 1.0 : 0.0;
    float settled = mix(1.0, mix(mix(0.1, 0.22, hair), 1.0, max(body, mouth * 0.6)), uSettle);
    vec2 off = (position.xy - uHeadCircle.xy) / uHeadCircle.z;
    settled *= mix(1.0, 1.0 - smoothstep(0.95, 2.6, length(vec2(off.x * 0.9, off.y < 0.0 ? off.y : off.y * 0.6))), uSettle);
    vAlpha = settled * uOpacity * visible * speaking * twinkle * (1.0 + scan * 0.4) / (1.0 + defocus * 2.2)
      * mix((0.08 + aIntensity * 1.1) * uDensity * (1.0 - 0.35 * hair), uOpen * 0.35, mouth);
  }
`;

const CLIP = /* glsl */ `
  uniform vec4 uClip; // bas, haut, fondu (pixels), actif
  float clipMask() {
    if (uClip.w < 0.5) return 1.0;
    return smoothstep(uClip.x, uClip.x + uClip.z, gl_FragCoord.y) * (1.0 - smoothstep(uClip.y - uClip.z, uClip.y, gl_FragCoord.y));
  }
`;

const RELIEF_VERTEX = /* glsl */ `
  ${COMMON}
  attribute float aHead;
  attribute float aMask;
  attribute float aMouth;
  attribute float aFace;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying float vMask;
  varying float vMouth;
  varying float vFace;
  varying float vY;
  varying vec2 vXY;
  void main() {
    vec3 p = rig(position, aHead);
    p.y += sin(uTime * 1.3) * 0.02 * (1.0 - aHead * 0.5);
    vXY = position.xy;
    vNormal = normalize(turn(normal, aHead));
    vUv = uv;
    vMask = aMask;
    vMouth = aMouth;
    vFace = aFace;
    vY = position.y;
    gl_Position = projectionMatrix * viewPosition(p);
  }
`;

const RELIEF_FRAGMENT = /* glsl */ `
  ${CLIP}
  uniform sampler2D tMap;
  uniform float uReveal;
  uniform vec3 uLight;
  uniform float uOpacity;
  uniform float uOpen;
  uniform float uTime;
  uniform float uScanY;
  uniform vec2 uBounds;
  uniform vec3 uHeadCircle;
  varying vec2 vXY;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying float vMask;
  varying float vMouth;
  varying float vFace;
  varying float vY;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  void main() {
    vec3 signal = vec3(0.24, 0.86, 0.52);
    // Matérialisation : la surface apparaît de haut en bas, bord irrégulier et lumineux.
    float h = clamp((uBounds.x - vY) / (uBounds.x - uBounds.y), 0.0, 1.0);
    float n = noise(vUv * vec2(60.0, 75.0));
    float front = uReveal * 1.35 - (h + n * 0.3);
    if (front < 0.0) discard;
    float edgeGlow = 1.0 - smoothstep(0.0, 0.05, front);

    vec3 photo = texture2D(tMap, vUv).rgb;
    // Éclairage : lumière principale enveloppante, reflet léger sur la peau,
    // liseré de contour vert.
    vec3 nrm = normalize(vNormal);
    float wrap = max((dot(nrm, uLight) + 0.45) / 1.45, 0.0);
    vec3 halfway = normalize(uLight + vec3(0.0, 0.0, 1.0));
    float spec = pow(max(dot(nrm, halfway), 0.0), 32.0) * vFace;
    float fres = pow(1.0 - clamp(nrm.z, 0.0, 1.0), 3.0);
    // La tête reçoit la lumière, le buste reste dans la pénombre (transition
    // douce, sans couture au bord du visage).
    vec2 off = (vXY - uHeadCircle.xy) / uHeadCircle.z;
    float headness = 1.0 - smoothstep(0.75, 1.6, length(off));
    // La photo est déjà éclairée : la lumière ne fait que la moduler.
    float key = mix(0.5 + 0.3 * wrap, 0.78 + 0.36 * wrap, headness);
    vec3 c = photo * key + vec3(1.0, 0.9, 0.8) * spec * 0.12 + signal * fres * 0.07 * headness;
    // Étalonnage : ombres légèrement teintées du vert du signal.
    c += signal * 0.018 * (1.0 - smoothstep(0.0, 0.25, dot(photo, vec3(0.333))));
    // Bouche ouverte : intérieur sombre, lueur de la voix.
    float inside = clamp(vMouth * uOpen * 2.5, 0.0, 1.0);
    c = mix(c, vec3(0.015, 0.03, 0.025) + signal * 0.55 * uOpen, inside);
    // Hologramme : trame très fine, balayage discret.
    c *= 0.95 + 0.05 * sin(gl_FragCoord.y * 1.4 + uTime * 2.0);
    c += signal * (1.0 - smoothstep(0.0, 0.05, abs(vY - uScanY))) * 0.1;
    c += signal * edgeGlow * 0.9;
    // Le portrait émerge de l'obscurité : le buste s'efface loin de la tête.
    float emerge = 1.0 - smoothstep(0.95, 2.4, length(vec2(off.x * 0.9, min(off.y, 0.0) * 1.0 + max(off.y, 0.0) * 0.6)));
    // Bords : le masque se dissout en grain, jamais de découpe nette.
    float a = smoothstep(0.25, 0.95, vMask + (n - 0.5) * 0.45) * emerge * uOpacity * clipMask();
    gl_FragColor = vec4(c, a);
  }
`;

const FRAGMENT = /* glsl */ `
  ${CLIP}
  varying float vAlpha;
  varying vec3 vColor;
  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float d = length(p);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);
    float a = core * vAlpha * clipMask();
    gl_FragColor = vec4(vColor * core, a);
  }
`;

const WIRE_VERTEX = /* glsl */ `
  ${COMMON}
  uniform float uScanY;
  uniform float uWire;
  varying float vAlpha;
  void main() {
    vec3 p = rig(position, 1.0);
    gl_Position = projectionMatrix * viewPosition(p);
    float scan = 1.0 - smoothstep(0.0, 0.35, abs(position.y - uScanY));
    // Scintillement discret, plus présent quand la voix passe.
    float flicker = 0.85 + 0.15 * sin(uTime * 23.0 + position.x * 40.0);
    vAlpha = uWire * (0.015 + 0.05 * uOpen + scan * 0.3) * flicker;
  }
`;

const WIRE_FRAGMENT = /* glsl */ `
  ${CLIP}
  varying float vAlpha;
  void main() {
    float a = vAlpha * clipMask();
    gl_FragColor = vec4(vec3(0.24, 0.86, 0.52) * a, a);
  }
`;

/** Couche de rendu du visage (la scène du réseau reste sur la couche 0). */
export const PORTRAIT_LAYER = 1;

const damp = (a: number, b: number, lambda: number, dt: number) => a + (b - a) * (1 - Math.exp(-lambda * dt));

export class PortraitCloud {
  readonly object = new Group();
  private material: ShaderMaterial;
  private wireMaterial: ShaderMaterial;
  private geometry = new BufferGeometry();
  private wireGeometry = new BufferGeometry();
  private reliefGeometry = new BufferGeometry();
  private reliefMaterial: ShaderMaterial;
  private texture: DataTexture;
  /** Bande de l'écran où le visage reste visible (cadre mobile), en pixels du tampon. */
  private clip = new Vector4(0, 0, 1, 0);
  private progress = 0;
  private scatter = 1;
  private started = false;
  private scanClock = 0;
  private readonly top: number;
  private readonly bottom: number;
  private turn = new Vector2();
  private light = new Vector3(0.4, 0.3, 1).normalize();
  private lightTarget = new Vector3();
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
    g.setAttribute("aNormal", new BufferAttribute(data.normal, 3));

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
      uLight: { value: new Vector3(0.4, 0.3, 1).normalize() },
      uClip: { value: this.clip },
      uOpacity: { value: 1 },
      // Tête : centre et rayon (repère du portrait).
      uHeadCircle: { value: new Vector3(data.frame.x, data.frame.y, data.frame.height * 0.5) },
    };
    this.material = new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: {
        ...shared,
        uProgress: { value: 0 },
        uScatter: { value: 1 },
        uPixelRatio: { value: options.ratio },
        uSize: { value: options.size },
        uSettle: { value: 0 },
        uVoice: { value: 0 },
        // Plus de particules, chacune plus discrète : même luminosité d'ensemble.
        uDensity: { value: Math.min(1.2, (16000 / count) ** 0.8) },
        uFocus: { value: data.focus },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: AdditiveBlending,
    });
    this.wireMaterial = new ShaderMaterial({
      vertexShader: WIRE_VERTEX,
      fragmentShader: WIRE_FRAGMENT,
      uniforms: { ...shared, uWire: { value: 0 } },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: AdditiveBlending,
    });

    // Surface en relief, texturée par la photo : le visage net, en volume.
    const r = data.relief;
    const rg = this.reliefGeometry;
    rg.setAttribute("position", new BufferAttribute(r.position, 3));
    rg.setAttribute("uv", new BufferAttribute(r.uv, 2));
    rg.setAttribute("normal", new BufferAttribute(r.normal, 3));
    rg.setAttribute("aJaw", new BufferAttribute(r.jaw, 3));
    rg.setAttribute("aShape", new BufferAttribute(r.shape, 3));
    rg.setAttribute("aBlink", new BufferAttribute(r.blink, 3));
    rg.setAttribute("aHead", new BufferAttribute(r.head, 1));
    rg.setAttribute("aMask", new BufferAttribute(r.mask, 1));
    rg.setAttribute("aMouth", new BufferAttribute(r.mouth, 1));
    rg.setAttribute("aFace", new BufferAttribute(r.face, 1));
    rg.setIndex(new BufferAttribute(r.index, 1));
    this.texture = new DataTexture(data.pixels.data, data.pixels.width, data.pixels.height, RGBAFormat, UnsignedByteType);
    this.texture.generateMipmaps = true;
    this.texture.minFilter = LinearMipmapLinearFilter;
    this.texture.magFilter = LinearFilter;
    this.texture.anisotropy = 4;
    this.texture.needsUpdate = true;
    this.reliefMaterial = new ShaderMaterial({
      vertexShader: RELIEF_VERTEX,
      fragmentShader: RELIEF_FRAGMENT,
      uniforms: {
        ...shared,
        tMap: { value: this.texture },
        uReveal: { value: 0 },
        uBounds: { value: new Vector2(data.bounds.top, data.bounds.bottom) },
      },
      transparent: true,
      depthWrite: true,
      depthTest: true,
    });

    const relief = new Mesh(this.reliefGeometry, this.reliefMaterial);
    relief.frustumCulled = false;
    relief.renderOrder = 0;
    const points = new Points(this.geometry, this.material);
    points.frustumCulled = false;
    points.renderOrder = 1;
    const wire = new LineSegments(this.wireGeometry, this.wireMaterial);
    wire.frustumCulled = false;
    wire.renderOrder = 2;
    // Couche dédiée : le visage est rendu à part, en HDR (portrait-post.ts).
    for (const part of [relief, points, wire]) part.layers.set(PORTRAIT_LAYER);
    this.object.add(relief, points, wire);
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

    // Lumière principale : suit le regard ; au repos, tourne lentement autour du visage.
    if (gaze) this.lightTarget.set(gaze.x * 1.3, -gaze.y * 0.9 + 0.25, 1);
    else this.lightTarget.set(Math.sin(time * 0.35) * 0.9, 0.35 + Math.sin(time * 0.23) * 0.25, 1);
    this.lightTarget.normalize();
    this.light.lerp(this.lightTarget, 1 - Math.exp(-2.5 * dt)).normalize();

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
    (u.uLight!.value as Vector3).copy(this.light);
    // La surface se matérialise quand les particules se posent ; elles
    // s'effacent ensuite (sauf en partant : elles s'envolent à nouveau).
    const present = 1 - this.scatter;
    this.reliefMaterial.uniforms.uReveal!.value = Math.max(0, Math.min(1, (this.progress - 0.55) / 0.8)) * present;
    u.uSettle!.value = Math.max(0, Math.min(1, (this.progress - 1) / 0.6)) * present;
    // Le filaire apparaît une fois le visage formé.
    const formed = Math.max(0, Math.min(1, (this.progress - 1) / 0.5)) * present;
    this.wireMaterial.uniforms.uWire!.value = formed * opacity;
    this.object.visible = this.scatter < 0.995;
  }

  /** Limite verticale du visage (pixels du tampon, origine en bas), ou aucune. */
  setClip(bottom: number, top: number, feather: number) {
    this.clip.set(bottom, top, feather, 1);
  }

  clearClip() {
    this.clip.w = 0;
  }

  setPixelRatio(ratio: number) {
    this.material.uniforms.uPixelRatio!.value = ratio;
  }

  dispose() {
    this.geometry.dispose();
    this.wireGeometry.dispose();
    this.reliefGeometry.dispose();
    this.reliefMaterial.dispose();
    this.texture.dispose();
    this.material.dispose();
    this.wireMaterial.dispose();
  }
}
