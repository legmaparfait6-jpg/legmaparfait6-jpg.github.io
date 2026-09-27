"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type IncidentPhase, emit, on } from "@/lib/bus";
import type { Lang } from "@/lib/i18n";
import { play } from "@/lib/sound";

type Step = { at: number; phase: IncidentPhase; level: "info" | "warn" | "ok"; tag: string; text: (ticket: string) => string };

/** Chronologie de l'incident : reprend les règles du code de supervision. */
const STEPS: Record<Lang, Step[]> = {
  fr: [
    { at: 0, phase: "probe", level: "info", tag: "POLL", text: () => "switch-03 · ICMP · échec 1/3" },
    { at: 900, phase: "probe", level: "info", tag: "POLL", text: () => "switch-03 · ICMP · échec 2/3" },
    { at: 1800, phase: "down", level: "warn", tag: "POLL", text: () => "switch-03 · ICMP · échec 3/3 → PANNE" },
    { at: 2800, phase: "alert", level: "warn", tag: "ALERTE", text: () => "sévérité critique · switch-03 injoignable" },
    { at: 3900, phase: "ticket", level: "warn", tag: "TICKET", text: (t) => `${t} ouvert · priorité critique · SLA 180 min` },
    { at: 5300, phase: "escalate", level: "warn", tag: "SLA", text: () => "délai dépassé (temps accéléré) → escalade niveau 1 · e-mail envoyé" },
    { at: 6900, phase: "recover", level: "ok", tag: "POLL", text: () => "switch-03 · ICMP OK · équipement de nouveau actif" },
    { at: 7800, phase: "resolved", level: "ok", tag: "RÉSOLU", text: (t) => `${t} → résolu · incident clos` },
  ],
  en: [
    { at: 0, phase: "probe", level: "info", tag: "POLL", text: () => "switch-03 · ICMP · failure 1/3" },
    { at: 900, phase: "probe", level: "info", tag: "POLL", text: () => "switch-03 · ICMP · failure 2/3" },
    { at: 1800, phase: "down", level: "warn", tag: "POLL", text: () => "switch-03 · ICMP · failure 3/3 → DOWN" },
    { at: 2800, phase: "alert", level: "warn", tag: "ALERT", text: () => "critical severity · switch-03 unreachable" },
    { at: 3900, phase: "ticket", level: "warn", tag: "TICKET", text: (t) => `${t} opened · critical priority · SLA 180 min` },
    { at: 5300, phase: "escalate", level: "warn", tag: "SLA", text: () => "deadline exceeded (accelerated time) → escalation level 1 · email sent" },
    { at: 6900, phase: "recover", level: "ok", tag: "POLL", text: () => "switch-03 · ICMP OK · device back online" },
    { at: 7800, phase: "resolved", level: "ok", tag: "RESOLVED", text: (t) => `${t} → resolved · incident closed` },
  ],
};

type Line = { time: string; tag: string; text: string; level: Step["level"] };

const clock = (d: Date) =>
  `${d.toTimeString().slice(0, 8)}.${String(d.getMilliseconds()).padStart(3, "0")}`;

export function LiveLog({
  lang,
  labels,
}: {
  lang: Lang;
  labels: { title: string; badge: string; replay: string; states: Record<IncidentPhase, string> };
}) {
  const steps = STEPS[lang];
  const [lines, setLines] = useState<Line[]>([]);
  const [phase, setPhase] = useState<IncidentPhase>("idle");
  const [running, setRunning] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const played = useRef(false);

  const run = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, "");
    const ticket = `TK-${date}-${1000 + Math.floor(Math.random() * 9000)}`;
    setLines([]);
    setRunning(true);
    steps.forEach((step, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setLines((prev) => [...prev, { time: clock(new Date()), tag: step.tag, text: step.text(ticket), level: step.level }]);
          setPhase(step.phase);
          emit("net:incident", { phase: step.phase });
          if (step.phase === "down") play("alert");
          else if (step.phase === "resolved") play("resolve");
          else play("tick");
          if (i === steps.length - 1) {
            timers.current.push(
              window.setTimeout(() => {
                setRunning(false);
                setPhase("idle");
                emit("net:incident", { phase: "idle" });
              }, 3800),
            );
          }
        }, step.at),
      );
    });
  }, [steps]);

  // Lecture automatique à la première apparition de la section.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !played.current) {
          played.current = true;
          run();
        }
      },
      { threshold: 0.45 },
    );
    observer.observe(el);
    const off = on("ui:incident", () => {
      played.current = true;
      run();
    });
    return () => {
      observer.disconnect();
      off();
      timers.current.forEach((id) => window.clearTimeout(id));
    };
  }, [run]);

  const tone = phase === "recover" || phase === "resolved" || phase === "idle" ? "ok" : phase === "probe" ? "info" : "warn";

  return (
    <div ref={rootRef} className="live__log" data-tone={tone}>
      <div className="live__bar">
        <span className="meta">{labels.title}</span>
        <span className="live__badge">{labels.badge}</span>
      </div>
      <p className="live__state" aria-live="polite">
        <span className={`dot ${tone === "ok" ? "dot--signal" : tone === "warn" ? "dot--progress" : ""}`} aria-hidden="true" />
        {labels.states[phase]}
      </p>
      <ol className="live__lines" aria-label={labels.title}>
        {lines.map((line, i) => (
          <li key={i} className="live__line" data-level={line.level}>
            <span className="live__time">{line.time}</span>
            <span className="live__tag">{line.tag}</span>
            <span className="live__text">{line.text}</span>
          </li>
        ))}
        {lines.length === 0 ? <li className="live__line live__line--idle">…</li> : null}
      </ol>
      <button type="button" className="btn live__replay" onClick={run} disabled={running}>
        {labels.replay}
      </button>
    </div>
  );
}
