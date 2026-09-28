/**
 * Post-traitement du visage : rendu en haute dynamique (HDR), halo lumineux
 * (bloom) et compression des hautes lumières qui préserve la teinte.
 *
 * Les particules s'additionnent : en rendu classique, les zones denses et
 * éclairées saturent au blanc et le teint disparaît. Ici elles s'accumulent
 * dans une texture en virgule flottante (16 bits), puis une courbe de type
 * Reinhard étendue ramène la luminance dans l'écran sans changer la couleur.
 * Le halo est calculé au quart de la résolution (coût minime).
 */
import {
  CustomBlending,
  HalfFloatType,
  LinearFilter,
  Mesh,
  OneFactor,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  UnsignedByteType,
  Vector2,
  WebGLRenderTarget,
  type Camera,
  type Texture,
  type WebGLRenderer,
} from "three";

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/** Réduction au quart : 4 lectures bilinéaires = moyenne de 4 x 4 pixels. */
const DOWNSAMPLE = /* glsl */ `
  uniform sampler2D tInput;
  uniform vec2 uTexel;
  varying vec2 vUv;
  void main() {
    vec3 c = texture2D(tInput, vUv + uTexel * vec2(-1.0, -1.0)).rgb
      + texture2D(tInput, vUv + uTexel * vec2(1.0, -1.0)).rgb
      + texture2D(tInput, vUv + uTexel * vec2(-1.0, 1.0)).rgb
      + texture2D(tInput, vUv + uTexel * vec2(1.0, 1.0)).rgb;
    gl_FragColor = vec4(c * 0.25, 1.0);
  }
`;

/** Flou gaussien à 9 échantillons (5 lectures grâce au filtrage linéaire). */
const BLUR = /* glsl */ `
  uniform sampler2D tInput;
  uniform vec2 uDirection;
  varying vec2 vUv;
  void main() {
    vec3 c = texture2D(tInput, vUv).rgb * 0.2270270270;
    c += texture2D(tInput, vUv + uDirection * 1.3846153846).rgb * 0.3162162162;
    c += texture2D(tInput, vUv - uDirection * 1.3846153846).rgb * 0.3162162162;
    c += texture2D(tInput, vUv + uDirection * 3.2307692308).rgb * 0.0702702703;
    c += texture2D(tInput, vUv - uDirection * 3.2307692308).rgb * 0.0702702703;
    gl_FragColor = vec4(c, 1.0);
  }
`;

const COMPOSITE = /* glsl */ `
  uniform sampler2D tBase;
  uniform sampler2D tBloom;
  uniform float uExposure;
  uniform float uBloom;
  varying vec2 vUv;

  // Reinhard étendu appliqué à la luminance : la teinte est conservée.
  vec3 tone(vec3 c) {
    float L = dot(c, vec3(0.2126, 0.7152, 0.0722));
    float white = 3.2;
    float mapped = L * (1.0 + L / (white * white)) / (1.0 + L);
    c *= mapped / max(L, 1e-5);
    // Canal hors limites : on glisse vers le blanc plutôt que de tronquer.
    float peak = max(max(c.r, c.g), c.b);
    return peak > 1.0 ? mix(c / peak, vec3(1.0), clamp((peak - 1.0) * 0.5, 0.0, 1.0)) : c;
  }

  void main() {
    vec3 c = texture2D(tBase, vUv).rgb * uExposure + texture2D(tBloom, vUv).rgb * uBloom;
    c = tone(c);
    float a = max(max(c.r, c.g), c.b);
    gl_FragColor = vec4(c, clamp(a, 0.0, 1.0));
  }
`;

export class PortraitComposer {
  private base: WebGLRenderTarget;
  private small: WebGLRenderTarget;
  private blur: WebGLRenderTarget;
  private scene = new Scene();
  private camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private quad: Mesh;
  private downsample: ShaderMaterial;
  private blurMaterial: ShaderMaterial;
  private composite: ShaderMaterial;
  /** Vrai si la carte graphique accepte le rendu en virgule flottante. */
  readonly hdr: boolean;

  constructor(renderer: WebGLRenderer) {
    this.hdr = renderer.extensions.has("EXT_color_buffer_float") || renderer.extensions.has("EXT_color_buffer_half_float");
    const options = { type: this.hdr ? HalfFloatType : UnsignedByteType, depthBuffer: false, minFilter: LinearFilter, magFilter: LinearFilter };
    this.base = new WebGLRenderTarget(1, 1, options);
    this.small = new WebGLRenderTarget(1, 1, options);
    this.blur = new WebGLRenderTarget(1, 1, options);

    this.downsample = new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: DOWNSAMPLE,
      uniforms: { tInput: { value: null }, uTexel: { value: new Vector2() } },
      depthTest: false,
      depthWrite: false,
    });
    this.blurMaterial = new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: BLUR,
      uniforms: { tInput: { value: null }, uDirection: { value: new Vector2() } },
      depthTest: false,
      depthWrite: false,
    });
    this.composite = new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: COMPOSITE,
      uniforms: {
        tBase: { value: this.base.texture },
        tBloom: { value: this.small.texture },
        uExposure: { value: 1 },
        uBloom: { value: 0.32 },
      },
      // Ajouté par-dessus le réseau, sans l'effacer.
      blending: CustomBlending,
      blendSrc: OneFactor,
      blendDst: OneFactor,
      blendSrcAlpha: OneFactor,
      blendDstAlpha: OneFactor,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    this.quad = new Mesh(new PlaneGeometry(2, 2), this.composite);
    this.quad.frustumCulled = false;
    this.scene.add(this.quad);
  }

  /**
   * Compile les trois shaders en parallèle (sans bloquer la page) ; le visage
   * n'est composé qu'une fois cette étape terminée.
   */
  compile(renderer: WebGLRenderer): Promise<unknown> {
    const scene = new Scene();
    for (const material of [this.downsample, this.blurMaterial, this.composite]) {
      const mesh = new Mesh(this.quad.geometry, material);
      mesh.frustumCulled = false;
      scene.add(mesh);
    }
    return renderer.compileAsync(scene, this.camera).catch(() => undefined);
  }

  /**
   * Préchauffage : chaque passe est dessinée une fois dans une cible de 1 x 1,
   * une par image. Certains pilotes finalisent les shaders au premier dessin :
   * le coût est ainsi réparti au lieu de bloquer une image entière.
   */
  get warmSteps(): number {
    return 3;
  }

  warm(renderer: WebGLRenderer, step: number) {
    const target = (this.warmTarget ??= new WebGLRenderTarget(1, 1, { type: this.base.texture.type, depthBuffer: false }));
    const material = [this.downsample, this.blurMaterial, this.composite][step];
    if (!material) return;
    const autoClear = renderer.autoClear;
    renderer.autoClear = false;
    this.pass(renderer, material, target);
    renderer.setRenderTarget(null);
    renderer.autoClear = autoClear;
  }

  private warmTarget: WebGLRenderTarget | null = null;

  setSize(width: number, height: number) {
    this.base.setSize(width, height);
    const w = Math.max(1, Math.round(width / 4));
    const h = Math.max(1, Math.round(height / 4));
    this.small.setSize(w, h);
    this.blur.setSize(w, h);
  }

  private pass(renderer: WebGLRenderer, material: ShaderMaterial, target: WebGLRenderTarget | null) {
    this.quad.material = material;
    renderer.setRenderTarget(target);
    if (target) renderer.clear();
    renderer.render(this.scene, this.camera);
  }

  /** Rend la couche du visage (déjà sélectionnée sur la caméra) puis la compose à l'écran. */
  render(renderer: WebGLRenderer, scene: Scene, camera: Camera, exposure: number) {
    const autoClear = renderer.autoClear;
    renderer.autoClear = false;

    renderer.setRenderTarget(this.base);
    renderer.clear();
    renderer.render(scene, camera);

    // Halo : réduction, flou horizontal, flou vertical.
    const d = this.downsample.uniforms;
    d.tInput!.value = this.base.texture as Texture;
    (d.uTexel!.value as Vector2).set(1 / this.base.width, 1 / this.base.height);
    this.pass(renderer, this.downsample, this.small);
    const b = this.blurMaterial.uniforms;
    b.tInput!.value = this.small.texture;
    (b.uDirection!.value as Vector2).set(1 / this.small.width, 0);
    this.pass(renderer, this.blurMaterial, this.blur);
    b.tInput!.value = this.blur.texture;
    (b.uDirection!.value as Vector2).set(0, 1 / this.small.height);
    this.pass(renderer, this.blurMaterial, this.small);

    this.composite.uniforms.uExposure!.value = exposure;
    this.pass(renderer, this.composite, null);
    renderer.autoClear = autoClear;
  }

  dispose() {
    this.warmTarget?.dispose();
    this.base.dispose();
    this.small.dispose();
    this.blur.dispose();
    this.downsample.dispose();
    this.blurMaterial.dispose();
    this.composite.dispose();
    this.quad.geometry.dispose();
  }
}
