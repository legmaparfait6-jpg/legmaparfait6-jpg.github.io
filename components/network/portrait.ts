/**
 * Portrait en nuage de points, attaché à la caméra : il reste de face, en
 * arrière-plan, quelle que soit la formation du réseau.
 *
 * - Assemblage de haut en bas depuis le réseau, dispersion quand il n'est plus utile.
 * - Relief : le visage est bombé comme un volume, et oscille légèrement pour
 *   révéler sa profondeur.
 * - Parole : pendant une transmission, la mâchoire et la lèvre inférieure
 *   s'ouvrent au rythme des syllabes ; le visage s'illumine.
 * - Balayage : une ligne lumineuse parcourt régulièrement le visage.
 * Tout le mouvement est calculé sur la carte graphique.
 */
import { AdditiveBlending, BufferAttribute, BufferGeometry, Points, ShaderMaterial, Vector3 } from "three";

const VERTEX = /* glsl */ `
  attribute vec3 aStart;
  attribute float aDelay;
  attribute float aIntensity;
  attribute float aJaw;
  attribute float aUpper;
  attribute float aFace;
  uniform float uProgress;
  uniform float uScatter;
  uniform float uVoice;
  uniform float uTime;
  uniform float uScanY;
  uniform float uPixelRatio;
  uniform float uOpacity;
  uniform vec3 uPointer;
  uniform float uPointerOn;
  varying float vAlpha;
  varying float vIntensity;
  varying float vScan;

  float easeInOut(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void main() {
    float t = clamp((uProgress - aDelay) / 0.6, 0.0, 1.0);
    float e = easeInOut(t);
    vec3 target = position;

    // Parole : la mâchoire descend, la lèvre supérieure se relève à peine.
    target.y -= uVoice * aJaw * 0.26;
    target.z += uVoice * aJaw * 0.08;
    target.y += uVoice * aUpper * 0.035;

    vec3 p = mix(aStart, target, e);

    // Respiration : ondulation lente de la profondeur.
    p.z += sin(uTime * 1.1 + position.y * 2.6 + position.x * 1.7) * 0.03 * e;

    // Dispersion vers le réseau quand le portrait n'est plus affiché.
    p = mix(p, aStart * 1.25, uScatter);

    // Le pointeur écarte les points, comme une main dans un nuage.
    vec2 d = p.xy - uPointer.xy;
    float dist = length(d);
    float force = uPointerOn * (1.0 - smoothstep(0.0, 0.85, dist)) * 0.4;
    p.xy += (d / max(dist, 0.0001)) * force;
    p.z += force * 0.8;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    // Points fins : la densité dessine le visage, pas la taille.
    gl_PointSize = (0.11 + aIntensity * 0.21) * uPixelRatio * (190.0 / -mv.z);
    gl_Position = projectionMatrix * mv;

    // Ligne de balayage : une bande lumineuse qui descend sur le visage.
    vScan = (1.0 - smoothstep(0.0, 0.16, abs(position.y - uScanY))) * aFace;

    float speaking = 1.0 + uVoice * (0.3 + aJaw * 1.4 + aUpper * 0.8);
    vIntensity = aIntensity;
    vAlpha = uOpacity * (0.2 + aIntensity * 0.62) * (0.25 + 0.75 * e) * (1.0 - uScatter) * speaking
      * (1.0 + vScan * 1.3) + force * 0.5 * uOpacity;
  }
`;

const FRAGMENT = /* glsl */ `
  varying float vAlpha;
  varying float vIntensity;
  varying float vScan;
  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float d = length(p);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);
    // Visage : blanc chaud ; contours et brume : vert du signal ; balayage : vert vif.
    vec3 signal = vec3(0.24, 0.86, 0.52);
    vec3 skin = vec3(0.93, 0.96, 0.92);
    vec3 color = mix(signal, skin, smoothstep(0.45, 0.95, vIntensity));
    color = mix(color, vec3(0.45, 1.0, 0.7), vScan * 0.7);
    gl_FragColor = vec4(color * core, core * vAlpha);
  }
`;

const damp = (a: number, b: number, lambda: number, dt: number) => a + (b - a) * (1 - Math.exp(-lambda * dt));
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Repères du visage dans la photo recadrée (u, v de 0 à 1). */
const FACE = { u: 0.383, v: 0.36, ru: 0.19, rv: 0.24 };
const MOUTH = { u: 0.347, v: 0.443 };

export class PortraitCloud {
  readonly object: Points;
  private material: ShaderMaterial;
  private geometry = new BufferGeometry();
  private progress = 0;
  private scatter = 1;
  private pointerOn = 0;
  private started = false;
  private scanClock = 0;
  private readonly top: number;
  private readonly bottom: number;
  /** Présence du portrait (0 à 1), utilisée pour atténuer le réseau. */
  visibility = 0;

  constructor(data: Uint16Array, options: { mobile: boolean; ratio: number }) {
    const total = data.length / 3;
    const step = options.mobile ? 2 : 1; // mobile : un point sur deux
    const count = Math.floor(total / step);
    const height = 7.4;
    const width = height * (470 / 580);
    // Le visage occupe le haut gauche de la photo : on le recentre.
    const offsetX = (0.5 - FACE.u) * width;
    const offsetY = -0.1 * height;
    this.top = (0.5 - (FACE.v - FACE.rv)) * height + offsetY;
    this.bottom = (0.5 - (FACE.v + FACE.rv)) * height + offsetY;

    const target = new Float32Array(count * 3);
    const start = new Float32Array(count * 3);
    const delay = new Float32Array(count);
    const intensity = new Float32Array(count);
    const jaw = new Float32Array(count);
    const upper = new Float32Array(count);
    const face = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const s = i * step * 3;
      const u = data[s]! / 65535;
      const v = data[s + 1]! / 65535;
      const k = data[s + 2]! / 65535;

      // Relief : le visage est bombé (ellipsoïde), les zones éclairées avancent.
      const fu = (u - FACE.u) / FACE.ru;
      const fv = (v - FACE.v) / FACE.rv;
      const inside = 1 - fu * fu - fv * fv;
      const bulge = inside > 0 ? Math.sqrt(inside) : 0;
      face[i] = bulge > 0 ? Math.min(1, bulge * 1.6) : 0;

      target[i * 3] = (u - 0.5) * width + offsetX;
      target[i * 3 + 1] = (0.5 - v) * height + offsetY;
      target[i * 3 + 2] = bulge * 0.95 + k * 0.35 + (Math.random() - 0.5) * 0.08;

      // Mâchoire : lèvre inférieure et menton, sous la ligne de la bouche.
      const across = Math.exp(-(((u - MOUTH.u) / 0.085) ** 2));
      const below = clamp01((v - MOUTH.v) / 0.012) * (1 - clamp01((v - 0.53) / 0.035));
      jaw[i] = across * below;
      // Lèvre supérieure : juste au-dessus de la ligne de la bouche.
      upper[i] = Math.exp(-(((u - MOUTH.u) / 0.06) ** 2)) * (v < MOUTH.v ? Math.exp(-(((v - (MOUTH.v - 0.012)) / 0.012) ** 2)) : 0);

      // Départ : dispersés dans l'espace du réseau.
      const theta = Math.random() * Math.PI * 2;
      const z = Math.random() * 2 - 1;
      const r = 5 + Math.random() * 4;
      const ring = Math.sqrt(1 - z * z);
      start[i * 3] = Math.cos(theta) * ring * r;
      start[i * 3 + 1] = z * r * 0.6;
      start[i * 3 + 2] = Math.sin(theta) * ring * r - 4;

      // Assemblage de haut en bas, avec un léger désordre.
      delay[i] = v * 0.75 + Math.random() * 0.3;
      intensity[i] = k;
    }

    this.geometry.setAttribute("position", new BufferAttribute(target, 3));
    this.geometry.setAttribute("aStart", new BufferAttribute(start, 3));
    this.geometry.setAttribute("aDelay", new BufferAttribute(delay, 1));
    this.geometry.setAttribute("aIntensity", new BufferAttribute(intensity, 1));
    this.geometry.setAttribute("aJaw", new BufferAttribute(jaw, 1));
    this.geometry.setAttribute("aUpper", new BufferAttribute(upper, 1));
    this.geometry.setAttribute("aFace", new BufferAttribute(face, 1));

    this.material = new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: {
        uProgress: { value: 0 },
        uScatter: { value: 1 },
        uVoice: { value: 0 },
        uTime: { value: 0 },
        uScanY: { value: 99 },
        uPixelRatio: { value: options.ratio },
        uOpacity: { value: 1 },
        uPointer: { value: new Vector3(99, 99, 0) },
        uPointerOn: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    this.object = new Points(this.geometry, this.material);
    this.object.frustumCulled = false;
  }

  /**
   * @param visible le portrait doit être affiché (hero, ou transmission en cours)
   * @param opacity intensité du portrait
   * @param pointer position du pointeur dans le repère du portrait (ou null)
   * @param voice niveau de la voix (0 à 1)
   */
  update(dt: number, time: number, visible: boolean, opacity: number, pointer: Vector3 | null, voice = 0) {
    if (visible) this.started = true;
    // Assemblage plus rapide quand une transmission l'appelle.
    if (this.started) this.progress = Math.min(this.progress + dt * (voice > 0 ? 1.1 : 0.55), 1.7);
    this.scatter = damp(this.scatter, visible ? 0 : 1, visible ? 2.8 : 1.6, dt);
    this.pointerOn = damp(this.pointerOn, pointer ? 1 : 0, 6, dt);
    this.visibility = (1 - this.scatter) * Math.min(this.progress, 1);

    // Balayage toutes les 7 secondes, du haut vers le bas du visage (1,6 s).
    this.scanClock = (this.scanClock + dt) % 7;
    const scan = this.scanClock < 1.6 ? this.top + (this.bottom - this.top) * (this.scanClock / 1.6) : 99;

    // Oscillation lente : la profondeur du visage devient perceptible.
    this.object.rotation.y = Math.sin(time * 0.32) * 0.11;
    this.object.rotation.x = Math.sin(time * 0.21) * 0.03;

    const u = this.material.uniforms;
    u.uProgress!.value = this.progress;
    u.uScatter!.value = this.scatter;
    u.uVoice!.value = voice;
    u.uTime!.value = time;
    u.uScanY!.value = scan;
    u.uOpacity!.value = opacity;
    if (pointer) (u.uPointer!.value as Vector3).copy(pointer);
    u.uPointerOn!.value = this.pointerOn;
    this.object.visible = this.scatter < 0.995;
  }

  setPixelRatio(ratio: number) {
    this.material.uniforms.uPixelRatio!.value = ratio;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
