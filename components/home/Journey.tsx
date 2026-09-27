import type { CSSProperties } from "react";
import { Section } from "@/components/Section";
import { journey } from "@/content/story";
import { type Lang, t } from "@/lib/i18n";

export function Journey({ lang }: { lang: Lang }) {
  const last = journey.steps.length - 1;
  return (
    <Section id="journey" index="07" eyebrow={t(journey.eyebrow, lang)} title={t(journey.title, lang)}>
      <ol className="journey">
        {journey.steps.map((step, i) => (
          <li
            key={step.name.en}
            className={`journey__step${i === last ? " journey__step--next" : ""}`}
            data-reveal=""
            style={{ "--delay": "80ms" } as CSSProperties}
          >
            <span className="journey__node" aria-hidden="true" />
            <div className="journey__head">
              <span className="meta">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="journey__name">{t(step.name, lang)}</h3>
              {step.date ? <span className="meta">{step.date}</span> : null}
            </div>
            <p className="journey__text">{t(step.text, lang)}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
