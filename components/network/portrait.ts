/**
 * Portrait en nuage de points : les points partent du réseau et s'assemblent
 * en visage, de haut en bas, comme un balayage. Tout le mouvement est calculé
 * sur la carte graphique (un seul envoi de données, aucun calcul par point en
 * JavaScript à chaque image).
 */
import { AdditiveBlending, BufferAttribute, BufferGeometry, Points, ShaderMaterial, Vector3 } from "three";

const VERTEX = /* glsl */ `
  attribute vec3 aStart;
  attribute float aDelay;
  attribute float aIntensity;
  uniform float uProgress;
  uniform float uScatter;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uOpacity;
  uniform vec3 uPointer;
  uniform float uPointerOn;
  varying float vAlpha;
  varying float vIntensity;

  float easeInOut(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void main() {
    float t = clamp((uProgress - aDelay) / 0.6, 0.0, 1.0);
    float e = easeInOut(t);
    vec3 p = mix(aStart, position, e);

    // Respiration : légère ondulation de profondeur.
    p.z += sin(uTime * 1.1 + position.y * 2.6 + position.x * 1.7) * 0.035 * e;

    // Retour vers le réseau quand on quitte le hero.
    p = mix(p, aStart * 1.25, uScatter);

    // Le pointeur écarte les points, comme une main dans un nuage.
    vec2 d = p.xy - uPointer.xy;
    float dist = length(d);
    float force = uPointerOn * (1.0 - smoothstep(0.0, 0.85, dist)) * 0.42;
    p.xy += (d / max(dist, 0.0001)) * force;
    p.z += force * 0.8;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    // Points fins (2 à 6 px) : la densité dessine le visage, pas la taille.
    gl_PointSize = (0.13 + aIntensity * 0.23) * uPixelRatio * (190.0 / -mv.z);
    gl_Position = projectionMatrix * mv;

    vIntensity = aIntensity;
    vAlpha = uOpacity * (0.22 + aIntensity * 0.6) * (0.25 + 0.75 * e) * (1.0 - uScatter) + force * 0.5 * uOpacity;
  }
`;

const FRAGMENT = /* glsl */ `
  varying float vAlpha;
  varying float vIntensity;
  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float d = length(p);
    if (d > 0.5) discard;
    float core = smoothstep(0.5, 0.0, d);
    // Visage : blanc chaud teinté de vert ; contours et brume : vert du signal.
    vec3 signal = vec3(0.24, 0.86, 0.52);
    vec3 skin = vec3(0.9, 0.97, 0.92);
    vec3 color = mix(signal, skin, smoothstep(0.45, 0.95, vIntensity));
    gl_FragColor = vec4(color * core, core * vAlpha);
  }
`;

const damp = (a: number, b: number, lambda: number, dt: number) => a + (b - a) * (1 - Math.exp(-lambda * dt));

export class PortraitCloud {
  readonly object: Points;
  private material: ShaderMaterial;
  private geometry = new BufferGeometry();
  private progress = 0;
  private scatter = 1;
  private pointerOn = 0;
  private started = false;
  /** Présence du portrait (0 à 1), utilisée pour atténuer le réseau. */
  visibility = 0;

  constructor(data: Uint16Array, options: { mobile: boolean; ratio: number }) {
    const total = data.length / 3;
    const step = options.mobile ? 2 : 1; // mobile : un point sur deux
    const count = Math.floor(total / step);
    const height = 7.4;
    const width = height * (470 / 580);
    // Le visage occupe le haut gauche de la photo : on le recentre sur le réseau.
    const offsetX = (0.5 - 0.37) * width;
    const offsetY = -0.1 * height;

    const target = new Float32Array(count * 3);
    const start = new Float32Array(count * 3);
    const delay = new Float32Array(count);
    const intensity = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const s = i * step * 3;
      const u = data[s]! / 65535;
      const v = data[s + 1]! / 65535;
      const k = data[s + 2]! / 65535;
      // Relief : les zones éclairées avancent vers la caméra.
      target[i * 3] = (u - 0.5) * width + offsetX;
      target[i * 3 + 1] = (0.5 - v) * height + offsetY;
      target[i * 3 + 2] = k * 0.7 + (Math.random() - 0.5) * 0.12;

      // Départ : dispersés dans l'espace du réseau.
      const theta = Math.random() * Math.PI * 2;
      const z = Math.random() * 2 - 1;
      const r = 5 + Math.random() * 4;
      const ring = Math.sqrt(1 - z * z);
      start[i * 3] = Math.cos(theta) * ring * r;
      start[i * 3 + 1] = z * r * 0.6;
      start[i * 3 + 2] = Math.sin(theta) * ring * r;

      // Assemblage de haut en bas, avec un léger désordre.
      delay[i] = v * 0.75 + Math.random() * 0.3;
      intensity[i] = k;
    }

    this.geometry.setAttribute("position", new BufferAttribute(target, 3));
    this.geometry.setAttribute("aStart", new BufferAttribute(start, 3));
    this.geometry.setAttribute("aDelay", new BufferAttribute(delay, 1));
    this.geometry.setAttribute("aIntensity", new BufferAttribute(intensity, 1));

    this.material = new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: {
        uProgress: { value: 0 },
        uScatter: { value: 1 },
        uTime: { value: 0 },
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
   * @param visible le hero est affiché
   * @param opacity intensité globale de la scène
   * @param pointer position du pointeur dans le plan du portrait (ou null)
   */
  update(dt: number, time: number, visible: boolean, opacity: number, pointer: Vector3 | null) {
    if (visible && !this.started) {
      this.started = true;
    }
    if (this.started) this.progress = Math.min(this.progress + dt * 0.55, 1.7);
    this.scatter = damp(this.scatter, visible ? 0 : 1, visible ? 2.5 : 1.6, dt);
    this.pointerOn = damp(this.pointerOn, pointer ? 1 : 0, 6, dt);
    this.visibility = (1 - this.scatter) * Math.min(this.progress, 1);

    const u = this.material.uniforms;
    u.uProgress!.value = this.progress;
    u.uScatter!.value = this.scatter;
    u.uTime!.value = time;
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
