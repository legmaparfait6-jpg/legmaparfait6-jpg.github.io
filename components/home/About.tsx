import type { CSSProperties } from "react";
import { Section } from "@/components/Section";
import { about } from "@/content/story";
import { type Lang, t } from "@/lib/i18n";

export function About({ lang }: { lang: Lang }) {
  return (
    <Section id="about" index="01" eyebrow={t(about.eyebrow, lang)} title={t(about.title, lang)}>
      <div className="about">
        <div className="about__text" data-reveal="">
          {about.paragraphs.map((p, i) => (
            <p key={i}>{t(p, lang)}</p>
          ))}
        </div>
        <dl className="facts" data-reveal="" style={{ "--delay": "120ms" } as CSSProperties}>
          {about.facts.map((fact) => (
            <div key={fact.label.en} className="facts__row">
              <dt className="meta">{t(fact.label, lang)}</dt>
              <dd className="facts__value">{t(fact.value, lang)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
