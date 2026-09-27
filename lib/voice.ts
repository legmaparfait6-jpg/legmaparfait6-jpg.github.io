/**
 * Voix du système : annonces pré-enregistrées (scripts/make-voice.mjs),
 * identiques sur tous les appareils : voix d'homme robotique, volume fort.
 *
 * Chaque annonce est accompagnée de ses repères : début et fin de chaque
 * phrase (sous-titres exacts) et deux pistes de la bouche à 50 images/s,
 * ouverture et forme, lues en phase avec l'horloge audio. Le portrait 3D
 * articule donc réellement les mots prononcés.
 *
 * Habillage radio en direct : grésillement d'ouverture et de fermeture,
 * souffle de canal très bas pendant la parole.
 */
import { type Lang } from "./i18n";
import { emit, runtime } from "./bus";

const VOLUME_KEY = "lp-volume";

type Cue = { duration: number; lines: [number, number][]; fps: number; open: Uint8Array; shape: Uint8Array };
type Loaded = { cue: Cue; buffer: AudioBuffer };

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let bed: { source: AudioBufferSourceNode; gain: GainNode } | null = null;
let source: AudioBufferSourceNode | null = null;
let current: (Loaded & { id: string }) | null = null;
let session = 0;
let raf = 0;
let volume = 1;
let startedAt = 0; // horloge audio au moment où la position 0 serait jouée
let offset = 0; // position au moment de la pause (s)
let paused = false;
let lastPublish = 0;
let lastLine = -2;
const cache = new Map<string, Promise<Loaded>>();

export function isVoiceSupported(): boolean {
  return typeof window !== "undefined" && ("AudioContext" in window || "webkitAudioContext" in window);
}

/** Les annonces sont des fichiers : disponibles dès que l'audio l'est. */
export async function hasVoices(_lang: Lang): Promise<boolean> {
  return isVoiceSupported();
}

function readVolume(): number {
  try {
    const stored = localStorage.getItem(VOLUME_KEY);
    const v = Number(stored);
    return stored !== null && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 1;
  } catch {
    return 1;
  }
}

export function voiceVolume(): number {
  volume = readVolume();
  return volume;
}

export function setVoiceVolume(value: number) {
  volume = Math.max(0, Math.min(1, value));
  if (ctx && master) master.gain.setTargetAtTime(volume, ctx.currentTime, 0.04);
  if (ctx && bed) bed.gain.gain.setTargetAtTime(0.012 * volume, ctx.currentTime, 0.05);
  try {
    localStorage.setItem(VOLUME_KEY, String(volume));
  } catch {
    // réglage valable pour cette visite seulement
  }
}

/** Contexte audio, créé et réveillé pendant le geste de l'utilisateur (exigence iOS). */
function audio(): AudioContext {
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor({ latencyHint: "interactive" });
    master = ctx.createGain();
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function decode64(text: string): Uint8Array {
  const bin = atob(text);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

type Meta = { duration: number; lines: [number, number][]; fps: number; open: string; shape: string };
const files = new Map<string, Promise<[Meta, ArrayBuffer]>>();

/** Téléchargement des fichiers d'une annonce (sans contexte audio). */
function fetchFiles(key: string): Promise<[Meta, ArrayBuffer]> {
  let pending = files.get(key);
  if (!pending) {
    const get = (url: string) =>
      fetch(url).then((r) => {
        if (!r.ok) throw new Error(url);
        return r;
      });
    pending = Promise.all([
      get(`/voice/${key}.json`).then((r) => r.json() as Promise<Meta>),
      get(`/voice/${key}.mp3`).then((r) => r.arrayBuffer()),
    ]);
    pending.catch(() => files.delete(key));
    files.set(key, pending);
  }
  return pending;
}

function load(id: string, lang: Lang): Promise<Loaded> {
  const key = `${id}.${lang}`;
  let pending = cache.get(key);
  if (!pending) {
    const context = audio();
    pending = fetchFiles(key).then(async ([meta, data]) => ({
      cue: { duration: meta.duration, lines: meta.lines, fps: meta.fps, open: decode64(meta.open), shape: decode64(meta.shape) },
      // Copie : decodeAudioData détache le tampon, qui peut resservir.
      buffer: await context.decodeAudioData(data.slice(0)),
    }));
    pending.catch(() => cache.delete(key));
    cache.set(key, pending);
  }
  return pending;
}

/** Précharge une annonce (survol ou focus d'un bouton « Écouter »). */
export function preloadTransmission(id: string, lang: Lang) {
  void fetchFiles(`${id}.${lang}`).catch(() => undefined);
}

function noiseBuffer(context: AudioContext, seconds: number): AudioBuffer {
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * seconds), context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/** Grésillement d'ouverture ou de fermeture de canal. */
function squelch(duration = 0.18) {
  if (!ctx || !master) return;
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer(ctx, duration);
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 2300;
  band.Q.value = 0.8;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  noise.connect(band).connect(gain).connect(master);
  noise.start();
}

/** Souffle de canal radio, très bas, pendant l'annonce. */
function startBed() {
  if (!ctx || bed) return;
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer(ctx, 2);
  noise.loop = true;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 1800;
  band.Q.value = 0.6;
  const gain = ctx.createGain();
  gain.gain.value = 0.012 * volume;
  noise.connect(band).connect(gain).connect(ctx.destination);
  noise.start();
  bed = { source: noise, gain };
}

function stopBed() {
  try {
    bed?.source.stop();
  } catch {
    // déjà arrêté
  }
  bed = null;
}

function position(): number {
  if (!ctx || !current) return 0;
  return paused ? offset : Math.max(0, ctx.currentTime - startedAt);
}

function lineAt(t: number, lines: [number, number][]): number {
  let index = -1;
  for (let i = 0; i < lines.length; i++) if (t >= lines[i]![0] - 0.05) index = i;
  return index;
}

/** Valeur d'une piste à l'instant t, interpolée entre deux images. */
function sample(track: Uint8Array, fps: number, t: number): number {
  const f = t * fps;
  const i = Math.floor(f);
  if (i < 0 || i >= track.length) return 0;
  const a = track[i]!;
  const b = track[Math.min(track.length - 1, i + 1)]!;
  return (a + (b - a) * (f - i)) / 255;
}

function loop(time: number) {
  if (!current) return;
  const t = position();
  const { cue } = current;
  // Légère avance (40 ms) : la bouche précède le son, comme à l'écran.
  runtime.voiceLevel = paused ? 0 : sample(cue.open, cue.fps, t + 0.04);
  runtime.mouthShape = paused ? 0.5 : sample(cue.shape, cue.fps, t + 0.04) || 0.5;
  const line = lineAt(t, cue.lines);
  if (line !== lastLine || time - lastPublish > 250) {
    lastLine = line;
    lastPublish = time;
    emit("voice:state", { id: current.id, playing: !paused, line, progress: Math.min(1, t / cue.duration) });
  }
  raf = requestAnimationFrame(loop);
}

function startSource(from: number) {
  if (!ctx || !master || !current) return;
  const node = ctx.createBufferSource();
  node.buffer = current.buffer;
  node.connect(master);
  const mySession = session;
  node.onended = () => {
    if (mySession !== session || paused || source !== node) return;
    squelch(0.24);
    stopTransmission(true);
  };
  const when = ctx.currentTime + 0.02;
  node.start(when, from);
  startedAt = when - from;
  source = node;
}

export async function playTransmission(id: string, lang: Lang) {
  if (!isVoiceSupported()) return;
  const context = audio(); // pendant le geste de l'utilisateur
  stopTransmission(false);
  const mySession = ++session;
  volume = readVolume();
  master!.gain.value = volume;
  runtime.voiceActive = true; // le visage se forme pendant le chargement
  emit("voice:state", { id, playing: false, line: -1, progress: 0 });
  squelch();

  let loaded: Loaded;
  try {
    loaded = await load(id, lang);
  } catch {
    if (mySession === session) stopTransmission(true);
    return;
  }
  if (mySession !== session) return;
  if (context.state === "suspended") await context.resume().catch(() => undefined);

  current = { ...loaded, id };
  paused = false;
  offset = 0;
  lastLine = -2;
  startBed();
  startSource(0);
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(loop);
}

export function toggleTransmission() {
  if (!current || !ctx) return;
  if (paused) {
    paused = false;
    startSource(offset);
    startBed();
  } else {
    offset = position();
    paused = true;
    const node = source;
    source = null;
    try {
      node?.stop();
    } catch {
      // déjà arrêté
    }
    stopBed();
  }
}

export function stopTransmission(notify = true) {
  session++;
  const node = source;
  source = null;
  try {
    node?.stop();
  } catch {
    // déjà arrêté
  }
  cancelAnimationFrame(raf);
  stopBed();
  paused = false;
  runtime.voiceLevel = 0;
  runtime.mouthShape = 0.5;
  runtime.voiceActive = false;
  const id = current?.id ?? null;
  current = null;
  if (notify) emit("voice:state", { id, playing: false, line: -1, progress: 1 });
}
