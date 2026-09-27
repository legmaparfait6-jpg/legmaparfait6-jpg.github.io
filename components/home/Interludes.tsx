import type { CSSProperties } from "react";
import { skillLayers, skillName } from "@/content/skills";
import type { Lang } from "@/lib/i18n";

/**
 * Bus de données : deux bandes de technologies réellement utilisées en
 * mission, qui défilent en sens opposé. Décoratif pour les lecteurs d'écran
 * (la liste complète est dans la carte des compétences).
 */
export function StackBus({ lang }: { lang: Lang }) {
  const used = skillLayers.flatMap((layer) => layer.skills.filter((s) => s.proof === "mission").map((s) => skillName(s, lang)));
  const half = Math.ceil(used.length / 2);
  const rows = [used.slice(0, half), used.slice(half)];

  return (
    <div className="stack-bus" aria-hidden="true">
      {rows.map((row, r) => (
        <div key={r} className="stack-bus__row" data-direction={r === 0 ? "left" : "right"}>
          {/* Contenu doublé : la boucle est continue, sans saut. */}
          {[0, 1].map((copy) => (
            <ul key={copy} className="stack-bus__track">
              {row.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          ))}
        </div>
      ))}
    </div>
  );
}

const STATEMENT = {
  fr: ["Comprendre.", "Concevoir.", "Construire.", "Faire évoluer."],
  en: ["Understand.", "Design.", "Build.", "Evolve."],
};

/**
 * Pause typographique : chaque mot passe du contour au plein au fil du
 * défilement (animation pilotée par le défilement quand le navigateur la
 * prend en charge, texte plein sinon).
 */
export function Statement({ lang }: { lang: Lang }) {
  return (
    <section className="statement" aria-label={STATEMENT[lang].join(" ")}>
      <div className="container">
        <p className="statement__text" aria-hidden="true">
          {STATEMENT[lang].map((word, i) => (
            <span key={word} className="statement__word" style={{ "--i": i } as CSSProperties}>
              {word}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
