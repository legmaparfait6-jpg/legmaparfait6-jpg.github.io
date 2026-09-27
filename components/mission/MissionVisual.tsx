import type { CSSProperties } from "react";
import type { Mission } from "@/content/missions";
import { type Lang, t } from "@/lib/i18n";

/**
 * Visuel d'en-tête d'une mission : l'écran réel du produit quand il existe,
 * sinon le numéro de mission en grand, parcouru par son flux d'architecture.
 */
export function MissionVisual({ mission, lang }: { mission: Mission; lang: Lang }) {
  const shot = mission.screenshots[1] ?? mission.screenshots[0];

  if (shot) {
    return (
      <figure className="mission-visual mission-visual--shot">
        <div className="phone">
          <img src={shot.src} alt={t(shot.alt, lang)} width={shot.width} height={shot.height} decoding="async" />
        </div>
        <figcaption className="meta">{t(shot.caption, lang)}</figcaption>
      </figure>
    );
  }

  const steps = mission.architecture.flow;
  return (
    <div className="mission-visual mission-visual--glyph" aria-hidden="true">
      <span className="mission-visual__code">{mission.code}</span>
      <ol className="mission-visual__flow" style={{ "--n": steps.length } as CSSProperties}>
        {steps.map((step, i) => (
          <li key={step.label.en} style={{ "--i": i } as CSSProperties}>
            {t(step.label, lang)}
          </li>
        ))}
      </ol>
    </div>
  );
}
