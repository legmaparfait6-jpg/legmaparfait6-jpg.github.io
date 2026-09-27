/**
 * Voix du système : fabrique les annonces audio à partir de content/transmissions.ts.
 *
 * 1. Synthèse Windows (scripts/voice-synth.ps1), une phrase à la fois, mise en cache.
 * 2. Vocodeur à 32 bandes : l'enveloppe spectrale de la parole est appliquée
 *    à une onde en dents de scie qui suit l'intonation, abaissée et resserrée.
 *    Le timbre devient celui d'une voix d'homme robotique, grave et nette.
 *    Les formants peuvent être abaissés (voix d'origine féminine en anglais).
 * 3. Habillage : consonnes d'origine conservées dans les aigus, léger timbre
 *    métallique, bande radio, compression, volume normalisé (fort).
 * 4. Pistes de la bouche (50 images/s) calculées sur la parole d'origine :
 *    ouverture et forme (lèvres arrondies ou étirées).
 *
 * Sorties : public/voice/<id>.<lang>.mp3 et public/voice/<id>.<lang>.json
 * Usage : npm run voice   (Windows uniquement : les voix sont celles du système)
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpeg from "ffmpeg-static";
import { transmissions } from "../content/transmissions.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = join(ROOT, ".cache", "voice");
const OUT = join(ROOT, "public", "voice");
const SR = 24000;
const FPS = 50;

/** Réglages par langue : hauteur de la voix, abaissement des formants, part de voix d'origine. */
const PROFILE = {
  fr: { f0: 88, formant: 0.96 },
  en: { f0: 90, formant: 0.8 },
};
const VERSION = "v2"; // à changer si le traitement change (invalide le cache final)

mkdirSync(CACHE, { recursive: true });
mkdirSync(OUT, { recursive: true });

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const DEBUG = args.includes("--debug");
const ONLY = args.find((a) => !a.startsWith("--"));

const hash = (s) => createHash("sha1").update(s).digest("hex").slice(0, 12);

// ---------- 1. Synthèse ----------

function synthesize(items) {
  const missing = items.filter((it) => !existsSync(it.wav));
  if (missing.length === 0) return;
  const jobs = join(CACHE, "jobs.json");
  writeFileSync(jobs, JSON.stringify(missing.map((it) => ({ text: it.text, lang: it.lang, out: it.wav }))));
  execFileSync(
    "powershell.exe",
    ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", join(ROOT, "scripts", "voice-synth.ps1"), "-Jobs", jobs],
    { stdio: ["ignore", "inherit", "inherit"] },
  );
}

function decode(file) {
  const raw = execFileSync(ffmpeg, ["-v", "error", "-i", file, "-f", "f32le", "-ac", "1", "-ar", String(SR), "-"], {
    maxBuffer: 1 << 28,
  });
  return new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4).slice();
}

/** Retire le silence de début et de fin (la pause entre phrases est ajoutée ensuite). */
function trim(x) {
  const threshold = 0.004;
  let a = 0;
  let b = x.length - 1;
  while (a < b && Math.abs(x[a]) < threshold) a++;
  while (b > a && Math.abs(x[b]) < threshold) b--;
  return x.slice(Math.max(0, a - SR * 0.02), Math.min(x.length, b + SR * 0.06));
}

// ---------- 2. Analyse de la hauteur (YIN) ----------

const HOP = SR / 200; // 5 ms

function pitchTrack(x) {
  const lowBand = biquad(biquad(x, "lp", 900, 0.7), "hp", 80, 0.7);
  const W = Math.round(SR * 0.03);
  const minLag = Math.floor(SR / 380);
  const maxLag = Math.ceil(SR / 60);
  const frames = Math.ceil(x.length / HOP);
  const f0 = new Float32Array(frames);
  const voiced = new Float32Array(frames);
  const d = new Float32Array(maxLag + 1);
  for (let f = 0; f < frames; f++) {
    const start = f * HOP - W / 2;
    let energy = 0;
    for (let i = 0; i < W; i++) {
      const v = x[start + i] ?? 0;
      energy += v * v;
    }
    if (energy / W < 1e-6) continue;
    // Indice complémentaire : une voyelle concentre son énergie sous 900 Hz.
    let low = 0;
    for (let i = 0; i < W; i++) low += (lowBand[start + i] ?? 0) ** 2;
    const lowShare = Math.max(0, Math.min(1, (low / energy - 0.3) / 0.35));
    for (let tau = 1; tau <= maxLag; tau++) {
      let sum = 0;
      for (let i = 0; i < W; i++) {
        const diff = (x[start + i] ?? 0) - (x[start + i + tau] ?? 0);
        sum += diff * diff;
      }
      d[tau] = sum;
    }
    // Différence normalisée cumulée.
    let running = 0;
    let best = -1;
    let bestValue = 1;
    for (let tau = 1; tau <= maxLag; tau++) {
      running += d[tau];
      const cmnd = (d[tau] * tau) / (running || 1);
      d[tau] = cmnd;
    }
    for (let tau = minLag; tau <= maxLag; tau++) {
      if (d[tau] < 0.15) {
        while (tau + 1 <= maxLag && d[tau + 1] < d[tau]) tau++;
        best = tau;
        bestValue = d[tau];
        break;
      }
    }
    // Pas de creux net : on retient le minimum global, avec une confiance moindre.
    if (best < 0) {
      for (let tau = minLag; tau <= maxLag; tau++) {
        if (d[tau] < bestValue) {
          bestValue = d[tau];
          best = tau;
        }
      }
      if (bestValue > 0.5) best = -1;
    }
    if (best < 0) {
      voiced[f] = lowShare * 0.5;
      continue;
    }
    const a = d[best - 1] ?? d[best];
    const c = d[best + 1] ?? d[best];
    const shift = (a - c) / (2 * (a - 2 * d[best] + c) || 1);
    f0[f] = SR / (best + Math.max(-1, Math.min(1, shift)));
    voiced[f] = Math.max(lowShare, Math.min(1, Math.max(0, (0.5 - bestValue) / 0.3)));
  }
  // Voisement lissé (20 ms) : pas de bascule brusque entre voix et souffle.
  for (let f = 1; f < frames; f++) voiced[f] = voiced[f - 1] + (voiced[f] - voiced[f - 1]) * 0.3;
  // Médiane sur 5 images, puis maintien de la dernière hauteur dans les silences.
  const med = new Float32Array(frames);
  for (let f = 0; f < frames; f++) {
    const w = [];
    for (let k = -2; k <= 2; k++) if (f0[f + k] > 0) w.push(f0[f + k]);
    w.sort((p, q) => p - q);
    med[f] = f0[f] > 0 && w.length ? w[w.length >> 1] : 0;
  }
  const values = [...med].filter((v) => v > 0).sort((p, q) => p - q);
  const median = values[values.length >> 1] ?? 120;
  let last = median;
  for (let f = 0; f < frames; f++) {
    if (med[f] > 0) last = med[f];
    else med[f] = last;
  }
  return { f0: med, voiced, median };
}

// ---------- 3. Vocodeur ----------

function bandpass(fc, q) {
  const w0 = (2 * Math.PI * fc) / SR;
  const alpha = Math.sin(w0) / (2 * q);
  const a0 = 1 + alpha;
  return { b0: alpha / a0, b2: -alpha / a0, a1: (-2 * Math.cos(w0)) / a0, a2: (1 - alpha) / a0 };
}

function biquad(c, type, fc, q = Math.SQRT1_2, gainDb = 0) {
  const w0 = (2 * Math.PI * fc) / SR;
  const cos = Math.cos(w0);
  const alpha = Math.sin(w0) / (2 * q);
  const A = 10 ** (gainDb / 40);
  let b0, b1, b2, a0, a1, a2;
  if (type === "hp") [b0, b1, b2, a0, a1, a2] = [(1 + cos) / 2, -(1 + cos), (1 + cos) / 2, 1 + alpha, -2 * cos, 1 - alpha];
  else if (type === "lp") [b0, b1, b2, a0, a1, a2] = [(1 - cos) / 2, 1 - cos, (1 - cos) / 2, 1 + alpha, -2 * cos, 1 - alpha];
  else [b0, b1, b2, a0, a1, a2] = [1 + alpha * A, -2 * cos, 1 - alpha * A, 1 + alpha / A, -2 * cos, 1 - alpha / A];
  const y = new Float32Array(c.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < c.length; i++) {
    const x0 = c[i];
    const out = (b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x0; y2 = y1; y1 = out;
    y[i] = out;
  }
  return y;
}

/** Filtre passe-bande du 4e ordre (deux cellules) appliqué au signal. */
function band(x, fc, q) {
  const { b0, b2, a1, a2 } = bandpass(fc, q);
  const y = new Float32Array(x.length);
  let ax1 = 0, ax2 = 0, ay1 = 0, ay2 = 0, bx1 = 0, bx2 = 0, by1 = 0, by2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = x[i];
    const o1 = b0 * v + b2 * ax2 - a1 * ay1 - a2 * ay2;
    ax2 = ax1; ax1 = v; ay2 = ay1; ay1 = o1;
    const o2 = b0 * o1 + b2 * bx2 - a1 * by1 - a2 * by2;
    bx2 = bx1; bx1 = o1; by2 = by1; by1 = o2;
    y[i] = o2;
  }
  return y;
}

/** Enveloppe d'amplitude sans ondulation : moyenne quadratique filtrée (2 pôles). */
function envelope(x, cutoff) {
  const sq = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) sq[i] = x[i] * x[i];
  const lp = biquad(biquad(sq, "lp", cutoff, 0.6), "lp", cutoff, 0.6);
  for (let i = 0; i < lp.length; i++) lp[i] = Math.sqrt(Math.max(0, lp[i]));
  return lp;
}

function follow(x, attackMs, releaseMs) {
  const a = Math.exp(-1 / ((attackMs / 1000) * SR));
  const r = Math.exp(-1 / ((releaseMs / 1000) * SR));
  const y = new Float32Array(x.length);
  let e = 0;
  for (let i = 0; i < x.length; i++) {
    const v = Math.abs(x[i]);
    e = v > e ? a * e + (1 - a) * v : r * e + (1 - r) * v;
    y[i] = e;
  }
  return y;
}

function polyblep(t, dt) {
  if (t < dt) {
    t /= dt;
    return t + t - t * t - 1;
  }
  if (t > 1 - dt) {
    t = (t - 1) / dt;
    return t * t + t + t + 1;
  }
  return 0;
}

function robotize(x, lang) {
  const profile = PROFILE[lang];
  const { f0, voiced, median } = pitchTrack(x);
  const n = x.length;
  if (DEBUG) {
    let loud = 0, weak = 0;
    for (let f = 0; f < voiced.length; f++) {
      let e = 0;
      for (let i = f * HOP; i < (f + 1) * HOP && i < n; i++) e += x[i] * x[i];
      if (e / HOP > 1e-3) { loud++; if (voiced[f] < 0.6) weak++; }
    }
    console.log(`  hauteur médiane ${median.toFixed(0)} Hz, images fortes peu voisées : ${((weak / loud) * 100).toFixed(0)} %`);
  }

  // Onde porteuse : dents de scie qui suit l'intonation (écarts réduits de moitié),
  // mêlée de bruit pour les consonnes sourdes.
  let seed = 7;
  const noise = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed / 2147483647) * 2 - 1;
  };
  const carrier = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const fi = i / HOP;
    const k = Math.min(f0.length - 1, Math.floor(fi));
    const k2 = Math.min(f0.length - 1, k + 1);
    const t = fi - k;
    const hz = f0[k] * (1 - t) + f0[k2] * t;
    const v = voiced[k] * (1 - t) + voiced[k2] * t;
    const pitch = profile.f0 * Math.sqrt(hz / median);
    const dt = pitch / SR;
    phase += dt;
    if (phase >= 1) phase -= 1;
    const saw = 2 * phase - 1 - polyblep(phase, dt);
    carrier[i] = saw * (0.15 + 0.85 * v) + noise() * (0.5 * (1 - v) + 0.012);
  }

  // Bancs de filtres : analyse (parole) et synthèse (porteuse, formants décalés).
  const BANDS = 32;
  const low = 90;
  const high = 9800;
  const ratio = (high / low) ** (1 / (BANDS - 1));
  const q = 1 / (Math.sqrt(ratio) - 1 / Math.sqrt(ratio)) * 1.1;
  const out = new Float32Array(n);
  for (let b = 0; b < BANDS; b++) {
    const fc = low * ratio ** b;
    const fs = fc * profile.formant;
    const env = envelope(band(x, fc, q), 38);
    const synth = band(carrier, fs, q);
    const carEnv = envelope(synth, 22);
    for (let i = 0; i < n; i++) {
      const g = Math.min(40, env[i] / (carEnv[i] + 1e-4));
      out[i] += synth[i] * g;
    }
  }

  // Consonnes nettes : les aigus de la voix d'origine (sans sa hauteur).
  const air = biquad(biquad(x, "hp", 3200, 0.7), "hp", 3200, 0.7);
  for (let i = 0; i < n; i++) out[i] += air[i] * 0.55;

  // Timbre métallique léger : filtre en peigne (7 ms).
  const delay = Math.round(SR * 0.0068);
  const comb = new Float32Array(n);
  for (let i = 0; i < n; i++) comb[i] = out[i] + 0.32 * (comb[i - delay] ?? 0);
  for (let i = 0; i < n; i++) out[i] = out[i] * 0.72 + comb[i] * 0.28;

  // Bande radio, présence, rondeur des graves.
  let y = biquad(out, "hp", 95, 0.8);
  y = biquad(y, "lp", 7600, 0.7);
  y = biquad(y, "peak", 2600, 1.1, 3.5);
  y = biquad(y, "peak", 180, 0.9, 2.5);
  return y;
}

// ---------- 4. Dynamique et volume ----------

function master(x) {
  // Compression douce (rapport 3:1 au-dessus de -24 dB).
  const env = follow(x, 4, 80);
  const y = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) {
    const db = 20 * Math.log10(env[i] + 1e-9);
    const over = Math.max(0, db + 24);
    y[i] = x[i] * 10 ** ((-over * (1 - 1 / 3)) / 20);
  }
  // Volume : moyenne des passages parlés à -15 dBFS.
  let sum = 0;
  let count = 0;
  for (let i = 0; i < y.length; i += 64) {
    const v = y[i];
    if (Math.abs(v) > 0.002) {
      sum += v * v;
      count++;
    }
  }
  const rms = Math.sqrt(sum / Math.max(1, count));
  const gain = 10 ** (-15 / 20) / (rms || 1);
  // Limiteur doux : crêtes arrondies sous -1 dBFS.
  const ceiling = 10 ** (-1 / 20);
  for (let i = 0; i < y.length; i++) y[i] = ceiling * Math.tanh((y[i] * gain) / ceiling);
  return y;
}

// ---------- 5. Pistes de la bouche ----------

function mouthTracks(x) {
  const frames = Math.ceil((x.length / SR) * FPS);
  const size = SR / FPS;
  const voice = biquad(biquad(x, "hp", 200, 0.7), "lp", 3500, 0.7);
  const lowF = biquad(biquad(x, "hp", 250, 0.7), "lp", 1000, 0.7);
  const highF = biquad(biquad(x, "hp", 1700, 0.7), "lp", 4000, 0.7);
  const open = new Uint8Array(frames);
  const shape = new Uint8Array(frames);
  let smooth = 0;
  let shapeSmooth = 0.5;
  for (let f = 0; f < frames; f++) {
    let e = 0, lo = 0, hi = 0;
    for (let i = f * size; i < (f + 1) * size && i < x.length; i++) {
      e += voice[i] ** 2;
      lo += lowF[i] ** 2;
      hi += highF[i] ** 2;
    }
    const db = 10 * Math.log10(e / size + 1e-10);
    const level = Math.max(0, Math.min(1, (db + 48) / 34));
    // Ouverture rapide, fermeture un peu plus lente : la bouche ne claque pas.
    smooth = level > smooth ? smooth + (level - smooth) * 0.75 : smooth + (level - smooth) * 0.42;
    open[f] = Math.round(smooth ** 1.15 * 255);
    // Forme : 0 lèvres arrondies (o, u), 1 lèvres étirées (i, é).
    const tilt = Math.log10((hi + 1e-10) / (lo + 1e-10));
    const target = level > 0.08 ? Math.max(0, Math.min(1, 0.55 + tilt * 0.45)) : 0.5;
    shapeSmooth += (target - shapeSmooth) * 0.35;
    shape[f] = Math.round(shapeSmooth * 255);
  }
  return { open, shape };
}

// ---------- Assemblage ----------

function writeWav(samples, file) {
  const pcm = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767), i * 2);
  const head = Buffer.alloc(44);
  head.write("RIFF", 0); head.writeUInt32LE(36 + pcm.length, 4); head.write("WAVEfmt ", 8);
  head.writeUInt32LE(16, 16); head.writeUInt16LE(1, 20); head.writeUInt16LE(1, 22);
  head.writeUInt32LE(SR, 24); head.writeUInt32LE(SR * 2, 28); head.writeUInt16LE(2, 32); head.writeUInt16LE(16, 34);
  head.write("data", 36); head.writeUInt32LE(pcm.length, 40);
  writeFileSync(file, Buffer.concat([head, pcm]));
}

function encode(samples, file) {
  const raw = join(CACHE, "master.f32");
  writeFileSync(raw, Buffer.from(samples.buffer, samples.byteOffset, samples.byteLength));
  execFileSync(ffmpeg, ["-v", "error", "-y", "-f", "f32le", "-ar", String(SR), "-ac", "1", "-i", raw, "-c:a", "libmp3lame", "-b:a", "64k", file]);
  rmSync(raw);
}

const LEAD = 0.18; // silence avant la première phrase (s)
const GAP = 0.42; // pause entre deux phrases (s)

const items = [];
for (const tr of transmissions) {
  for (const lang of /** @type {const} */ (["fr", "en"])) {
    tr.lines[lang].forEach((text, i) => {
      items.push({ id: tr.id, lang, i, text, wav: join(CACHE, `${hash(`${lang}|${text}`)}.wav`) });
    });
  }
}
synthesize(items);

for (const tr of transmissions) {
  if (ONLY && !tr.id.startsWith(ONLY)) continue;
  for (const lang of /** @type {const} */ (["fr", "en"])) {
    const lines = items.filter((it) => it.id === tr.id && it.lang === lang);
    const key = hash(VERSION + JSON.stringify(PROFILE[lang]) + lines.map((l) => l.text).join("|"));
    const base = join(OUT, `${tr.id}.${lang}`);
    if (!FORCE && existsSync(`${base}.json`) && JSON.parse(readFileSync(`${base}.json`, "utf8")).key === key) {
      console.log(`${tr.id}.${lang} : à jour`);
      continue;
    }
    const parts = lines.map((l) => trim(decode(l.wav)));
    const total = Math.round(SR * LEAD) + parts.reduce((s, p) => s + p.length, 0) + Math.round(SR * GAP) * (parts.length - 1) + Math.round(SR * 0.3);
    const dry = new Float32Array(total);
    const timing = [];
    let at = Math.round(SR * LEAD);
    parts.forEach((p, i) => {
      dry.set(p, at);
      timing.push([+(at / SR).toFixed(3), +((at + p.length) / SR).toFixed(3)]);
      at += p.length + (i < parts.length - 1 ? Math.round(SR * GAP) : 0);
    });
    const wet = master(robotize(dry, lang));
    encode(wet, `${base}.mp3`);
    if (DEBUG) {
      writeWav(master(dry), join(CACHE, `debug-${tr.id}.${lang}.dry.wav`));
      writeWav(wet, join(CACHE, `debug-${tr.id}.${lang}.wet.wav`));
    }
    const { open, shape } = mouthTracks(dry);
    const meta = {
      key,
      // Empreinte du texte : la compilation vérifie que l'audio correspond aux sous-titres.
      text: hash(lines.map((l) => l.text).join("|")),
      duration: +(total / SR).toFixed(3),
      lines: timing,
      fps: FPS,
      open: Buffer.from(open).toString("base64"),
      shape: Buffer.from(shape).toString("base64"),
    };
    writeFileSync(`${base}.json`, JSON.stringify(meta));
    console.log(`${tr.id}.${lang} : ${meta.duration} s`);
  }
}
