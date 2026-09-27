"use client";

import { useEffect, useState } from "react";
import { emit, on } from "@/lib/bus";
import type { Lang } from "@/lib/i18n";
import { hasVoices, preloadTransmission } from "@/lib/voice";

/** Vrai une fois monté, si le navigateur peut lire l'audio (Web Audio). */
function useVoiceSupport(lang: Lang) {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    let alive = true;
    void hasVoices(lang).then((ok) => alive && setSupported(ok));
    return () => {
      alive = false;
    };
  }, [lang]);
  return supported;
}

/**
 * Bouton « Écouter » d'une transmission. Affiché une fois monté, si le
 * navigateur dispose de Web Audio ; le survol précharge l'annonce.
 */
export function RadioTrigger({ id, lang, variant = "icon" }: { id: string; lang: Lang; variant?: "icon" | "button" }) {
  const supported = useVoiceSupport(lang);
  const [playing, setPlaying] = useState(false);

  useEffect(() => on("voice:state", (s) => setPlaying(s.playing && s.id === id)), [id]);

  if (!supported) return null;

  const label = lang === "fr" ? (playing ? "Transmission en cours" : "Écouter") : playing ? "Transmission playing" : "Listen";

  return (
    <button
      type="button"
      className={variant === "button" ? "btn radio-trigger radio-trigger--button" : "radio-trigger"}
      data-playing={playing || undefined}
      onClick={() => emit("voice:play", { id })}
      onPointerEnter={() => preloadTransmission(id, lang)}
      onFocus={() => preloadTransmission(id, lang)}
      aria-label={variant === "icon" ? label : undefined}
    >
      <RadioIcon />
      {variant === "button" ? (lang === "fr" ? "Écouter la transmission" : "Listen to the transmission") : null}
    </button>
  );
}

/** Interrupteur de la visite guidée. */
export function GuidedToggle({ lang }: { lang: Lang }) {
  const supported = useVoiceSupport(lang);
  const [enabled, setEnabled] = useState(false);
  useEffect(() => on("voice:guided", ({ enabled: v }) => setEnabled(v)), []);
  if (!supported) return null;
  return (
    <button
      type="button"
      className="guided-toggle"
      aria-pressed={enabled}
      onClick={() => emit("voice:guided", { enabled: !enabled })}
    >
      <span className="guided-toggle__switch" aria-hidden="true" />
      {lang === "fr" ? "Visite guidée" : "Guided tour"}
    </button>
  );
}

function RadioIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="9" r="1.6" fill="currentColor" />
      <path d="M5.2 11.8a4 4 0 0 1 0-5.6M10.8 6.2a4 4 0 0 1 0 5.6M3.1 13.9a7 7 0 0 1 0-9.8M12.9 4.1a7 7 0 0 1 0 9.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
