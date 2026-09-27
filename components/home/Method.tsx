import type { CSSProperties } from "react";
import { Section } from "@/components/Section";
import { method } from "@/content/story";
import { type Lang, t } from "@/lib/i18n";

export function Method({ lang }: { lang: Lang }) {
  return (
    <Section id="method" index="02" eyebrow={t(method.eyebrow, lang)} title={t(method.title, lang)}>
      <ol className="method">
        {method.steps.map((step, i) => (
          <li
            key={step.name}
            className="method__step"
            data-reveal=""
            style={{ "--delay": `${(i % 3) * 110}ms` } as CSSProperties}
          >
            <div className="method__top">
              <span className="method__state" aria-hidden="true" />
              <span className="meta">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <h3 className="method__name">{step.name}</h3>
            <p className="method__text">{t(step.text, lang)}</p>
            <p className="method__proof">{t(step.proof, lang)}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
