import type { CSSProperties } from "react";
import type { Mission } from "@/content/missions";
import { WorldIllustration } from "@/components/mission/WorldIllustration";
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
    <div className={`mission-visual mission-visual--glyph${mission.brand ? " mission-visual--with-brand" : ""}`} aria-hidden={mission.brand ? undefined : true}>
      <WorldIllustration slug={mission.slug} palette={mission.world} className="mission-visual__world" />
      {mission.brand ? (
        <img
          className="mission-visual__brand"
          src={mission.brand.src}
          alt={t(mission.brand.alt, lang)}
          width={mission.brand.width}
          height={mission.brand.height}
          decoding="async"
        />
      ) : (
        <span className="mission-visual__code">{mission.code}</span>
      )}
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
