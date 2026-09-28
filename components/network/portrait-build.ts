/**
 * Construction du visage en particules, dans le navigateur.
 *
 * Entrées : la photo (déjà publiée pour la section « Parcours ») et le
 * maillage préparé par scripts/make-portrait-rig.py (points 3D du visage,
 * triangles, déformations, profondeur et régions de la silhouette).
 *
 * Les particules sont tirées sur la photo selon sa lumière et ses contours ;
 * celles du visage sont attachées à un triangle du maillage (coordonnées
 * barycentriques) : elles héritent de sa profondeur réelle et de ses
 * déformations (mâchoire, lèvres, paupières). Le nombre de particules
 * dépend de l'appareil.
 */

export type PortraitRig = {
  source: string;
  crop: [number, number, number, number];
  grid: [number, number];
  depthRange: [number, number];
  landmarks: number[];
  triangles: number[];
  morphs: { jaw: number[]; shape: number[]; blink: number[] };
  mouth: [number, number];
  pivot: [number, number, number];
  depth: string;
  classes: string;
};

export type PortraitData = {
  count: number;
  position: Float32Array;
  color: Float32Array;
  intensity: Float32Array;
  jaw: Float32Array;
  shape: Float32Array;
  blink: Float32Array;
  head: Float32Array;
  kind: Float32Array; // 0 silhouette, 1 visage (maillage), 2 intérieur de la bouche, 3 cheveux, 4 peau hors maillage
  /** Orientation de la surface (éclairage dynamique). */
  normal: Float32Array;
  /** Profondeur du visage : plan de netteté de la profondeur de champ. */
  focus: number;
  wire: { position: Float32Array; jaw: Float32Array; shape: Float32Array; blink: Float32Array };
  pivot: [number, number, number];
  height: number;
  /** Tête (cheveux compris) dans le repère du portrait : centre et hauteur. */
  frame: { x: number; y: number; height: number };
};

const HAIR = 1;
const BODY_SKIN = 2;
const FACE_SKIN = 3;
const CLOTHES = 4;
const OTHERS = 5;
const INNER_LIPS = [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95];

/** Hauteur du cadrage dans la scène (unités du monde). */
export const PORTRAIT_HEIGHT = 7.4;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function bytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function denseMorph(sparse: number[], n: number): Float32Array {
  const out = new Float32Array(n * 3);
  for (let k = 0; k < sparse.length; k += 4) {
    const i = sparse[k]!;
    out[i * 3] = sparse[k + 1]!;
    out[i * 3 + 1] = sparse[k + 2]!;
    out[i * 3 + 2] = sparse[k + 3]!;
  }
  return out;
}

export function buildPortrait(rig: PortraitRig, image: ImageData, count: number): PortraitData {
  const [, , cw, ch] = rig.crop;
  const [gw, gh] = rig.grid;
  const width = PORTRAIT_HEIGHT * (cw / ch);
  const height = PORTRAIT_HEIGHT;
  const px = image.data;
  const n = rig.landmarks.length / 3;
  const L = rig.landmarks;
  const morph = { jaw: denseMorph(rig.morphs.jaw, n), shape: denseMorph(rig.morphs.shape, n), blink: denseMorph(rig.morphs.blink, n) };
  // Normales des points du maillage : moyenne des faces voisines, tournées vers la caméra.
  const lmNormal = new Float32Array(n * 3);
  {
    const W3 = PORTRAIT_HEIGHT * (rig.crop[2] / rig.crop[3]);
    const P = (i: number) => [L[i * 3]! * W3, -L[i * 3 + 1]! * PORTRAIT_HEIGHT, L[i * 3 + 2]! * W3] as const;
    for (let t = 0; t < rig.triangles.length; t += 3) {
      const ia = rig.triangles[t]!, ib = rig.triangles[t + 1]!, ic = rig.triangles[t + 2]!;
      const a = P(ia), b = P(ib), c = P(ic);
      const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
      const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; }
      for (const i of [ia, ib, ic]) {
        lmNormal[i * 3] = lmNormal[i * 3]! + nx;
        lmNormal[i * 3 + 1] = lmNormal[i * 3 + 1]! + ny;
        lmNormal[i * 3 + 2] = lmNormal[i * 3 + 2]! + nz;
      }
    }
  }
  const depthMap = bytes(rig.depth);
  const classes = bytes(rig.classes);
  const [dLow, dHigh] = rig.depthRange;
  const random = mulberry32(20260927);

  // Centre du visage : on recentre le cadrage sur lui (horizontalement).
  let faceU = 0;
  let top = 1;
  let chin = 0;
  for (let i = 0; i < n; i++) {
    faceU += L[i * 3]!;
    top = Math.min(top, L[i * 3 + 1]!);
    chin = Math.max(chin, L[i * 3 + 1]!);
  }
  faceU /= n;
  let meanDepth = 0;
  for (let i = 0; i < n; i++) meanDepth += L[i * 3 + 2]!;
  meanDepth /= n;
  const offsetX = (0.5 - faceU) * width;
  const offsetY = -0.1 * height;
  const toX = (u: number) => (u - 0.5) * width + offsetX;
  const toY = (v: number) => (0.5 - v) * height + offsetY;
  const toZ = (d: number) => d * width;

  // --- Lumière, contours ---
  const W = image.width;
  const H = image.height;
  const lum = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) lum[i] = (0.2126 * px[i * 4]! + 0.7152 * px[i * 4 + 1]! + 0.0722 * px[i * 4 + 2]!) / 255;
  // Flou 5 x 5 séparable : deux passes d'une dimension.
  const pass = new Float32Array(W * H);
  const blur = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let sum = 0;
      let c = 0;
      for (let dx = -2; dx <= 2; dx++) {
        const xx = x + dx;
        if (xx < 0 || xx >= W) continue;
        sum += lum[y * W + xx]!;
        c++;
      }
      pass[y * W + x] = sum / c;
    }
  }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let sum = 0;
      let c = 0;
      for (let dy = -2; dy <= 2; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= H) continue;
        sum += pass[yy * W + x]!;
        c++;
      }
      blur[y * W + x] = sum / c;
    }
  }
  const edge = new Float32Array(W * H);
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      const gx = blur[i + 1]! - blur[i - 1]!;
      const gy = blur[i + W]! - blur[i - W]!;
      edge[i] = Math.min(1, Math.hypot(gx, gy) * 11);
    }
  }

  // --- Triangles du visage, rastérisés : quel triangle couvre chaque pixel ---
  const tris = rig.triangles;
  const triCount = tris.length / 3;
  const owner = new Int16Array(W * H).fill(-1);
  const mouthTris: number[] = [];
  const inner = new Set(INNER_LIPS);
  for (let t = 0; t < triCount; t++) {
    const a = tris[t * 3]!;
    const b = tris[t * 3 + 1]!;
    const c = tris[t * 3 + 2]!;
    if (inner.has(a) && inner.has(b) && inner.has(c)) mouthTris.push(t);
    const ax = L[a * 3]! * W, ay = L[a * 3 + 1]! * H;
    const bx = L[b * 3]! * W, by = L[b * 3 + 1]! * H;
    const cx = L[c * 3]! * W, cy = L[c * 3 + 1]! * H;
    const x0 = Math.max(0, Math.floor(Math.min(ax, bx, cx)));
    const x1 = Math.min(W - 1, Math.ceil(Math.max(ax, bx, cx)));
    const y0 = Math.max(0, Math.floor(Math.min(ay, by, cy)));
    const y1 = Math.min(H - 1, Math.ceil(Math.max(ay, by, cy)));
    const area = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
    if (Math.abs(area) < 1e-6) continue;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const w1 = ((x + 0.5 - ax) * (cy - ay) - (cx - ax) * (y + 0.5 - ay)) / area;
        const w2 = ((bx - ax) * (y + 0.5 - ay) - (x + 0.5 - ax) * (by - ay)) / area;
        if (w1 >= -0.01 && w2 >= -0.01 && w1 + w2 <= 1.01) owner[y * W + x] = t;
      }
    }
  }

  const regionAt = (x: number, y: number) =>
    classes[Math.min(gh - 1, Math.floor((y / H) * gh)) * gw + Math.min(gw - 1, Math.floor((x / W) * gw))]!;

  const depthAt = (u: number, v: number) => {
    const fx = Math.max(0, Math.min(gw - 1.001, u * gw - 0.5));
    const fy = Math.max(0, Math.min(gh - 1.001, v * gh - 0.5));
    const x = Math.floor(fx);
    const y = Math.floor(fy);
    const tx = fx - x;
    const ty = fy - y;
    const at = (xx: number, yy: number) => dLow + (depthMap[yy * gw + xx]! / 255) * (dHigh - dLow);
    return (at(x, y) * (1 - tx) + at(x + 1, y) * tx) * (1 - ty) + (at(x, y + 1) * (1 - tx) + at(x + 1, y + 1) * tx) * ty;
  };

  // --- Poids de tirage : le visage domine, la silhouette se lit par ses contours ---
  const weights = new Float32Array(W * H);
  let total = 0;
  const margin = 4;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      // Poids cumulés : chaque pixel reçoit le total courant (tableau croissant).
      if (x < margin || y < margin || x >= W - margin || y >= H - margin) {
        weights[i] = total;
        continue;
      }
      const l = lum[i]!;
      const e = edge[i]!;
      const r = px[i * 4]!;
      const b = px[i * 4 + 2]!;
      const skin = Math.max(0, Math.min(1, (r - b - 4) / 50));
      let w: number;
      // Densité guidée par la lumière : les reliefs éclairés se lisent, les ombres respirent.
      if (owner[i]! >= 0) w = 0.25 + 3.2 * l ** 1.25 * (0.6 + skin) + 1.1 * e ** 1.2;
      else {
        const region = regionAt(x, y);
        if (region === FACE_SKIN || region === BODY_SKIN) w = 0.25 + 3.0 * l ** 1.25 * (0.6 + skin) + 1.1 * e ** 1.2;
        else if (region === HAIR || region === OTHERS) w = 0.3 + 1.8 * e ** 1.2;
        else if (region === CLOTHES) w = 0.12 + 3.2 * e ** 1.2;
        else w = l > 0.14 ? 0.012 + 0.4 * e ** 1.5 : 0;
      }
      total += w;
      weights[i] = total;
    }
  }

  const mouthCount = Math.round(count * 0.012);
  const bodyCount = count - mouthCount;
  const position = new Float32Array(count * 3);
  const color = new Float32Array(count * 3);
  const intensity = new Float32Array(count);
  const jaw = new Float32Array(count * 3);
  const shape = new Float32Array(count * 3);
  const blink = new Float32Array(count * 3);
  const head = new Float32Array(count);
  const kind = new Float32Array(count);
  const normal = new Float32Array(count * 3);
  const setNormal = (k: number, x: number, y: number, z: number) => {
    const len = Math.hypot(x, y, z) || 1;
    normal[k * 3] = x / len;
    normal[k * 3 + 1] = y / len;
    normal[k * 3 + 2] = z / len;
  };
  // Normale d'après la carte de profondeur (silhouette hors maillage).
  const depthNormal = (k: number, u: number, v: number) => {
    const du = 1 / gw;
    const dv = 1 / gh;
    const dzdx = (depthAt(u + du, v) - depthAt(u - du, v)) / (2 * du);
    const dzdy = ((depthAt(u, v + dv) - depthAt(u, v - dv)) * width) / (-2 * dv * height);
    setNormal(k, -dzdx, -dzdy, 1);
  };

  /** Point attaché au triangle t (coordonnées barycentriques w0, w1, w2). */
  const bind = (k: number, t: number, w0: number, w1: number, w2: number) => {
    const ids = [tris[t * 3]!, tris[t * 3 + 1]!, tris[t * 3 + 2]!];
    const ws = [w0, w1, w2];
    let u = 0, v = 0, d = 0;
    let nx = 0, ny = 0, nz = 0;
    const acc = new Float32Array(9); // mâchoire, lèvres, paupières
    for (let j = 0; j < 3; j++) {
      const id = ids[j]!;
      const w = ws[j]!;
      u += L[id * 3]! * w;
      v += L[id * 3 + 1]! * w;
      d += L[id * 3 + 2]! * w;
      nx += lmNormal[id * 3]! * w;
      ny += lmNormal[id * 3 + 1]! * w;
      nz += lmNormal[id * 3 + 2]! * w;
      [morph.jaw, morph.shape, morph.blink].forEach((m, slot) => {
        acc[slot * 3] = acc[slot * 3]! + m[id * 3]! * w * width;
        acc[slot * 3 + 1] = acc[slot * 3 + 1]! - m[id * 3 + 1]! * w * height;
        acc[slot * 3 + 2] = acc[slot * 3 + 2]! + m[id * 3 + 2]! * w * width;
      });
    }
    setNormal(k, nx, ny, nz);
    jaw.set(acc.subarray(0, 3), k * 3);
    shape.set(acc.subarray(3, 6), k * 3);
    blink.set(acc.subarray(6, 9), k * 3);
    position[k * 3] = toX(u);
    position[k * 3 + 1] = toY(v);
    position[k * 3 + 2] = toZ(d);
  };

  const barycentric = (t: number, x: number, y: number): [number, number, number] => {
    const a = tris[t * 3]!, b = tris[t * 3 + 1]!, c = tris[t * 3 + 2]!;
    const ax = L[a * 3]! * W, ay = L[a * 3 + 1]! * H;
    const bx = L[b * 3]! * W, by = L[b * 3 + 1]! * H;
    const cx = L[c * 3]! * W, cy = L[c * 3 + 1]! * H;
    const area = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
    let w1 = ((x - ax) * (cy - ay) - (cx - ax) * (y - ay)) / area;
    let w2 = ((bx - ax) * (y - ay) - (x - ax) * (by - ay)) / area;
    w1 = Math.max(0, Math.min(1, w1));
    w2 = Math.max(0, Math.min(1 - w1, w2));
    return [1 - w1 - w2, w1, w2];
  };

  for (let k = 0; k < bodyCount; k++) {
    // Tirage pondéré (recherche dichotomique dans les poids cumulés).
    const target = random() * total;
    let lo = 0;
    let hi = weights.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (weights[mid]! < target) lo = mid + 1;
      else hi = mid;
    }
    const x = (lo % W) + random();
    const y = Math.floor(lo / W) + random();
    const i = lo;
    const l = lum[i]!;
    const e = edge[i]!;
    const t = owner[i]!;
    color[k * 3] = px[i * 4]! / 255;
    color[k * 3 + 1] = px[i * 4 + 1]! / 255;
    color[k * 3 + 2] = px[i * 4 + 2]! / 255;

    if (t >= 0) {
      const [w0, w1, w2] = barycentric(t, x, y);
      bind(k, t, w0, w1, w2);
      intensity[k] = Math.min(1, 0.12 + 1.35 * l + 0.08 * e);
      head[k] = 1;
      kind[k] = 1;
      continue;
    }
    const u = x / W;
    const v = y / H;
    const region = regionAt(x, y);
    let d = depthAt(u, v);
    if (region === HAIR || region === OTHERS) {
      d += (random() - 0.3) * 0.03; // volume des cheveux
      intensity[k] = 0.05 + 0.28 * e + 0.2 * l;
      head[k] = 1;
      kind[k] = 3;
    } else if (region === FACE_SKIN || region === BODY_SKIN) {
      d += (random() - 0.5) * 0.006;
      intensity[k] = Math.min(1, 0.12 + 1.3 * l + 0.08 * e);
      kind[k] = 4; // même rendu que le visage : pas de bord de masque
      // Le cou suit la tête près du menton, le buste presque pas.
      head[k] = region === FACE_SKIN ? 1 : Math.max(0.2, Math.min(1, 1 - (v - rig.pivot[1]) * 6));
    } else if (region === CLOTHES) {
      d += (random() - 0.5) * 0.01;
      intensity[k] = 0.2 + 0.7 * e + 0.3 * l;
      head[k] = 0.12;
    } else {
      d += (random() - 0.5) * 0.12; // brume : une épaisseur, pas un plan
      intensity[k] = 0.1 + 0.25 * e;
      head[k] = 0;
    }
    position[k * 3] = toX(u);
    position[k * 3 + 1] = toY(v);
    position[k * 3 + 2] = toZ(d);
    if (kind[k] === 0 && head[k] === 0) setNormal(k, 0, 0, 1);
    else depthNormal(k, u, v);
  }

  // Intérieur de la bouche : particules qui s'allument quand elle s'ouvre.
  for (let k = bodyCount; k < count; k++) {
    if (mouthTris.length === 0) break;
    const t = mouthTris[Math.floor(random() * mouthTris.length)]!;
    let a = random();
    let b = random();
    if (a + b > 1) {
      a = 1 - a;
      b = 1 - b;
    }
    bind(k, t, 1 - a - b, a, b);
    position[k * 3 + 2] = position[k * 3 + 2]! - 0.02 * width; // légèrement en retrait des lèvres
    color[k * 3] = 0.24;
    color[k * 3 + 1] = 0.86;
    color[k * 3 + 2] = 0.52;
    intensity[k] = 0.9;
    head[k] = 1;
    kind[k] = 2;
    setNormal(k, 0, 0, 1);
  }

  // Maillage filaire : chaque arête une fois.
  const edges = new Set<number>();
  for (let t = 0; t < triCount; t++) {
    for (let j = 0; j < 3; j++) {
      const a = tris[t * 3 + j]!;
      const b = tris[t * 3 + ((j + 1) % 3)]!;
      edges.add(Math.min(a, b) * 1000 + Math.max(a, b));
    }
  }
  const wire = {
    position: new Float32Array(edges.size * 6),
    jaw: new Float32Array(edges.size * 6),
    shape: new Float32Array(edges.size * 6),
    blink: new Float32Array(edges.size * 6),
  };
  let e = 0;
  for (const key of edges) {
    for (const id of [Math.floor(key / 1000), key % 1000]) {
      wire.position.set([toX(L[id * 3]!), toY(L[id * 3 + 1]!), toZ(L[id * 3 + 2]!) + 0.006], e * 3);
      wire.jaw.set([morph.jaw[id * 3]! * width, -morph.jaw[id * 3 + 1]! * height, morph.jaw[id * 3 + 2]! * width], e * 3);
      wire.shape.set([morph.shape[id * 3]! * width, -morph.shape[id * 3 + 1]! * height, morph.shape[id * 3 + 2]! * width], e * 3);
      wire.blink.set([morph.blink[id * 3]! * width, -morph.blink[id * 3 + 1]! * height, morph.blink[id * 3 + 2]! * width], e * 3);
      e++;
    }
  }

  return {
    count,
    position,
    color,
    intensity,
    jaw,
    shape,
    blink,
    head,
    kind,
    normal,
    focus: toZ(meanDepth),
    wire,
    pivot: [toX(rig.pivot[0]), toY(rig.pivot[1]), toZ(rig.pivot[2])],
    height,
    // Les cheveux ajoutent environ un tiers au-dessus du front.
    frame: { x: toX(faceU), y: toY((top - (chin - top) * 0.35 + chin) / 2), height: (chin - top) * 1.35 * height },
  };
}

/** Repli sans Worker : pixels du cadrage de la photo (même origine). */
export async function loadPortraitPixels(rig: PortraitRig): Promise<ImageData> {
  const blob = await fetch(rig.source).then((r) => {
    if (!r.ok) throw new Error(rig.source);
    return r.blob();
  });
  const bitmap = await createImageBitmap(blob);
  const [x, y, w, h] = rig.crop;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("canvas 2d");
  context.drawImage(bitmap, x, y, w, h, 0, 0, w, h);
  bitmap.close();
  return context.getImageData(0, 0, w, h);
}
