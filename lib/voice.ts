/**
 * Voix du système : synthèse vocale du navigateur (aucun fichier audio),
 * timbre robotique assumé (grave, un peu lent), habillée en radio :
 * grésillement d'ouverture et de fermeture, souffle de canal pendant la parole.
 *
 * Chaque phrase est une annonce distincte : le sous-titre change exactement
 * avec la voix. Le niveau publié dans `runtime.voiceLevel` (0 à 1) anime la
 * scène 3D et le portrait au rythme des mots.
 */
import { type Lang } from "./i18n";
import { emit, runtime } from "./bus";

const VOLUME_KEY = "lp-volume";

let ctx: AudioContext | null = null;
let bed: { source: AudioBufferSourceNode; gain: GainNode } | null = null;
let session = 0;
let currentId: string | null = null;
let raf = 0;
let volume = 1;
let speaking = false;
let paused = false;
let pulse = 0;
let lines: string[] = [];
let lineIndex = -1;
let lineStart = 0;
let lastPublish = 0;
let lastPublishedLine = -2;

export function isVoiceSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

function readVolume(): number {
  try {
    const v = Number(localStorage.getItem(VOLUME_KEY));
    return Number.isFinite(v) && v > 0 ? Math.min(1, v) : 1;
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
  if (bed && ctx) bed.gain.gain.setTargetAtTime(0.01 * volume, ctx.currentTime, 0.05);
  try {
    localStorage.setItem(VOLUME_KEY, String(volume));
  } catch {
    // réglage valable pour cette visite seulement
  }
}

/**
 * Voix d'homme, nette, de la langue demandée. Classement :
 *   voix masculine « naturelle » (Edge) > voix masculine installée
 *   > voix inconnue > voix féminine (jamais choisie s'il existe mieux).
 */
const MALE = {
  fr: /henri|paul|thomas|claude|remy|rémy|jerome|jérôme|antoine|nicolas|mathieu|male|homme/i,
  en: /guy|david|mark|daniel|christopher|eric|ryan|brian|andrew|george|james|roger|steffan|male/i,
};
const FEMALE = /hortense|julie|denise|amelie|amélie|audrey|marie|zira|aria|jenny|samantha|susan|hazel|libby|sonia|emma|ava|michelle|female|femme/i;

function score(voice: SpeechSynthesisVoice, lang: Lang): number {
  let s = 0;
  if (MALE[lang].test(voice.name)) s += 10;
  if (FEMALE.test(voice.name)) s -= 20;
  if (/natural|neural|online/i.test(voice.name)) s += 3; // diction plus nette
  if (voice.localService) s += 1;
  return s;
}

function pickVoice(lang: Lang): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith(lang));
  if (voices.length === 0) return null;
  return [...voices].sort((a, b) => score(b, lang) - score(a, lang))[0]!;
}

/** Vrai si le navigateur dispose d'une voix dans la langue (sinon, pas de bouton). */
export async function hasVoices(lang: Lang): Promise<boolean> {
  if (!isVoiceSupported()) return false;
  await voicesReady();
  return window.speechSynthesis.getVoices().some((v) => v.lang.toLowerCase().startsWith(lang));
}

function voicesReady(): Promise<void> {
  if (window.speechSynthesis.getVoices().length > 0) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => resolve();
    window.speechSynthesis.addEventListener("voiceschanged", done, { once: true });
    window.setTimeout(done, 1200);
  });
}

function noiseBuffer(context: AudioContext, seconds: number): AudioBuffer {
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * seconds), context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/** Grésillement d'ouverture ou de fermeture de canal. */
function squelch(duration = 0.18) {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer(ctx, duration);
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 2300;
    band.Q.value = 0.8;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.16 * volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    source.connect(band).connect(gain).connect(ctx.destination);
    source.start();
  } catch {
    // Web Audio indisponible : la voix reste audible
  }
}

/** Souffle de canal radio, très bas, pendant l'annonce. */
function startBed() {
  try {
    ctx ??= new AudioContext();
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer(ctx, 2);
    source.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 1800;
    band.Q.value = 0.6;
    const gain = ctx.createGain();
    // Souffle très bas : il habille la voix sans jamais la couvrir.
    gain.gain.value = 0.01 * volume;
    source.connect(band).connect(gain).connect(ctx.destination);
    source.start();
    bed = { source, gain };
  } catch {
    bed = null;
  }
}

function stopBed() {
  try {
    bed?.source.stop();
  } catch {
    // déjà arrêté
  }
  bed = null;
}

function publish() {
  const progress = lines.length === 0 ? 1 : Math.min(1, (Math.max(lineIndex, 0) + Math.min(1, (performance.now() - lineStart) / 4000)) / lines.length);
  emit("voice:state", { id: currentId, playing: speaking && !paused, line: lineIndex, progress });
}

/** Niveau de la voix : syllabes simulées, renforcées à chaque mot prononcé. */
function loop(time: number) {
  const talking = speaking && !paused;
  const syllables = talking ? 0.35 + 0.35 * Math.abs(Math.sin(time / 85)) * Math.abs(Math.sin(time / 37)) : 0;
  pulse *= 0.86;
  runtime.voiceLevel = Math.min(1, syllables + pulse);
  // Interface : à chaque nouvelle phrase, sinon quatre fois par seconde.
  if (lineIndex !== lastPublishedLine || time - lastPublish > 250) {
    lastPublishedLine = lineIndex;
    lastPublish = time;
    publish();
  }
  raf = requestAnimationFrame(loop);
}

export async function playTransmission(id: string, lang: Lang, script: string[]) {
  if (!isVoiceSupported()) return;
  stopTransmission(false);
  const mySession = ++session;
  volume = readVolume();
  await voicesReady();
  if (mySession !== session) return;

  const voice = pickVoice(lang);
  currentId = id;
  lines = script;
  lineIndex = -1;
  speaking = true;
  paused = false;
  runtime.voiceActive = true;
  squelch();
  startBed();
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(loop);

  script.forEach((text, i) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === "fr" ? "fr-FR" : "en-US";
    if (voice) utterance.voice = voice;
    // Timbre robotique mais diction nette : grave sans excès, débit posé, volume maximal.
    utterance.pitch = 0.72;
    utterance.rate = lang === "fr" ? 0.94 : 0.92;
    // Volume de la synthèse au maximum (1) : le curseur ne sert qu'à baisser.
    utterance.volume = Math.max(0.05, volume);
    utterance.onstart = () => {
      if (mySession !== session) return;
      lineIndex = i;
      lineStart = performance.now();
      pulse = 0.5;
    };
    utterance.onboundary = () => {
      if (mySession === session) pulse = Math.min(1, pulse + 0.45);
    };
    utterance.onend = () => {
      if (mySession !== session || i !== script.length - 1) return;
      squelch(0.24);
      stopTransmission(true);
    };
    utterance.onerror = () => {
      if (mySession === session && i === script.length - 1) stopTransmission(true);
    };
    window.speechSynthesis.speak(utterance);
  });

  // Filet de sécurité : si la voix ne démarre pas, le lecteur ne reste pas bloqué.
  window.setTimeout(() => {
    if (mySession === session && lineIndex === -1) stopTransmission(true);
  }, 4000);
}

export function toggleTransmission() {
  if (!speaking) return;
  if (paused) {
    window.speechSynthesis.resume();
    paused = false;
  } else {
    window.speechSynthesis.pause();
    paused = true;
  }
}

export function stopTransmission(notify = true) {
  session++;
  if (isVoiceSupported()) window.speechSynthesis.cancel();
  cancelAnimationFrame(raf);
  stopBed();
  speaking = false;
  paused = false;
  runtime.voiceLevel = 0;
  runtime.voiceActive = false;
  const id = currentId;
  currentId = null;
  lineIndex = -1;
  if (notify) emit("voice:state", { id, playing: false, line: -1, progress: 1 });
}
