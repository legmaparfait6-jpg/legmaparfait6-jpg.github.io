"use client";

import { useEffect, useRef, useState } from "react";
import { type BusEvents, emit, on, runtime } from "@/lib/bus";
import type { Lang } from "@/lib/i18n";
import { isVoiceSupported, playTransmission, setVoiceVolume, stopTransmission, toggleTransmission, voiceVolume } from "@/lib/voice";

export type PlayerItem = { id: string; anchor: string; title: string; lines: string[] };

const TEXT = {
  fr: { transmission: "Transmission", pause: "Pause", play: "Reprendre", stop: "Couper", volume: "Volume", guided: "Visite guidée", guidedOn: "Visite guidée activée : touchez une section pour l'écouter." },
  en: { transmission: "Transmission", pause: "Pause", play: "Resume", stop: "Stop", volume: "Volume", guided: "Guided tour", guidedOn: "Guided tour on: tap a section to hear it." },
} as const;

const BARS = 14;

/**
 * Lecteur des transmissions : témoin radio, barres de niveau, sous-titres
 * synchronisés, pause, arrêt, volume. Gère aussi la visite guidée : quand
 * elle est active, toucher une section la fait raconter.
 */
export function TransmissionPlayer({ lang, items }: { lang: Lang; items: PlayerItem[] }) {
  const tx = TEXT[lang];
  const [state, setState] = useState<BusEvents["voice:state"]>({ id: null, playing: false, line: -1, progress: 0 });
  const [guided, setGuided] = useState(false);
  const [volume, setVolume] = useState(1);
  const barsRef = useRef<HTMLDivElement>(null);
  const active = items.find((i) => i.id === state.id) ?? null;

  useEffect(() => {
    setVolume(voiceVolume());
    const offs = [
      on("voice:state", setState),
      on("voice:play", ({ id }) => {
        const item = items.find((i) => i.id === id);
        if (item && isVoiceSupported()) void playTransmission(item.id, lang, item.lines);
      }),
      on("voice:guided", ({ enabled }) => setGuided(enabled)),
    ];
    return () => offs.forEach((off) => off());
  }, [items, lang]);

  // Visite guidée : toucher une section (hors lien, bouton, champ) la raconte.
  useEffect(() => {
    if (!guided) return;
    document.documentElement.dataset.guided = "";
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || target.closest("a, button, input, textarea, .transmission-player")) return;
      const host = target.closest<HTMLElement>("[data-transmission]");
      if (host?.dataset.transmission) emit("voice:play", { id: host.dataset.transmission });
    };
    document.addEventListener("click", onClick);
    return () => {
      delete document.documentElement.dataset.guided;
      document.removeEventListener("click", onClick);
    };
  }, [guided]);

  // Barres de niveau : mises à jour hors React, à chaque image.
  useEffect(() => {
    if (!state.playing) return;
    let raf = 0;
    const draw = (time: number) => {
      const bars = barsRef.current?.children;
      if (bars) {
        for (let i = 0; i < bars.length; i++) {
          const wave = 0.55 + 0.45 * Math.sin(time / 90 + i * 1.3);
          const h = Math.max(0.12, runtime.voiceLevel * wave * 1.6);
          (bars[i] as HTMLElement).style.transform = `scaleY(${Math.min(1, h)})`;
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [state.playing]);

  if (!active && !guided) return null;

  const index = items.findIndex((i) => i.id === active?.id) + 1;

  return (
    <section className="transmission-player" data-open={active ? "" : undefined} aria-label={tx.transmission}>
      {active ? (
        <>
          <div className="transmission-player__head">
            <span className="transmission-player__led" data-on={state.playing || undefined} aria-hidden="true" />
            <span className="meta">
              {tx.transmission} {String(index).padStart(2, "0")} · {active.title}
            </span>
            <div className="transmission-player__bars" ref={barsRef} aria-hidden="true">
              {Array.from({ length: BARS }, (_, i) => (
                <span key={i} />
              ))}
            </div>
          </div>
          <p className="transmission-player__caption" aria-live="polite">
            {state.line >= 0 ? active.lines[state.line] : active.lines[0]}
          </p>
          <div className="transmission-player__progress" aria-hidden="true">
            <span style={{ transform: `scaleX(${state.progress})` }} />
          </div>
          <div className="transmission-player__controls">
            <button type="button" className="icon-btn" onClick={toggleTransmission} aria-label={state.playing ? tx.pause : tx.play}>
              {state.playing ? "❚❚" : "▶"}
            </button>
            <button type="button" className="icon-btn" onClick={() => stopTransmission(true)} aria-label={tx.stop}>
              ■
            </button>
            <label className="transmission-player__volume">
              <span className="sr-only">{tx.volume}</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setVolume(v);
                  setVoiceVolume(v);
                }}
              />
            </label>
          </div>
        </>
      ) : (
        <p className="transmission-player__hint meta">{tx.guidedOn}</p>
      )}
    </section>
  );
}
