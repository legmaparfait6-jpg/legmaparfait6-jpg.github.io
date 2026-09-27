/**
 * Sons d'interface synthétisés en direct (Web Audio) : aucun fichier à
 * télécharger. Désactivés par défaut ; le choix est mémorisé localement.
 */
import { emit } from "./bus";

type Cue = "tick" | "click" | "open" | "alert" | "resolve" | "copy";

const STORAGE_KEY = "lp-sound";
let ctx: AudioContext | null = null;
let enabled = false;

export function soundEnabled(): boolean {
  return enabled;
}

export function initSound(): void {
  try {
    enabled = localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    enabled = false;
  }
  emit("ui:sound", { enabled });
}

export function setSound(value: boolean): void {
  enabled = value;
  try {
    localStorage.setItem(STORAGE_KEY, value ? "on" : "off");
  } catch {
    // stockage indisponible : le réglage vaut pour cette visite seulement
  }
  emit("ui:sound", { enabled });
  if (value) play("open");
}

function tone(freq: number, start: number, duration: number, gain: number, type: OscillatorType = "sine", endFreq?: number) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, start + duration);
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.008);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(amp).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function play(cue: Cue): void {
  if (!enabled || typeof window === "undefined") return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const t = ctx.currentTime;
    switch (cue) {
      case "tick":
        tone(2400, t, 0.03, 0.012, "sine");
        break;
      case "click":
        tone(880, t, 0.07, 0.03, "triangle", 1320);
        break;
      case "open":
        tone(520, t, 0.09, 0.025, "sine", 780);
        tone(780, t + 0.07, 0.12, 0.02, "sine", 1040);
        break;
      case "copy":
        tone(1040, t, 0.06, 0.025, "triangle");
        tone(1560, t + 0.06, 0.1, 0.02, "triangle");
        break;
      case "alert":
        tone(440, t, 0.16, 0.035, "square", 330);
        tone(440, t + 0.22, 0.16, 0.035, "square", 330);
        break;
      case "resolve":
        tone(660, t, 0.1, 0.03, "sine");
        tone(880, t + 0.09, 0.1, 0.03, "sine");
        tone(1320, t + 0.18, 0.22, 0.025, "sine");
        break;
    }
  } catch {
    // Web Audio indisponible : silence
  }
}
