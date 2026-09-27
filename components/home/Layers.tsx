import type { CSSProperties } from "react";
import { Section } from "@/components/Section";
import { aiLayer, mobileLayer } from "@/content/story";
import { type Lang, t } from "@/lib/i18n";

export function AiLayer({ lang }: { lang: Lang }) {
  return (
    <Section
      id="ai"
      index="06"
      eyebrow={t(aiLayer.eyebrow, lang)}
      title={t(aiLayer.title, lang)}
      lead={t(aiLayer.lead, lang)}
    >
      <ul className="ai-grid" data-reveal="">
        {aiLayer.uses.map((use) => (
          <li key={use.name.en} className="ai-cell" data-state={use.state}>
            <div className="ai-cell__head">
              <h3 className="ai-cell__name">{t(use.name, lang)}</h3>
              <span className={`dot ${use.state === "live" ? "dot--signal" : "dot--progress"}`} aria-hidden="true" />
            </div>
            <p className="ai-cell__text">{t(use.text, lang)}</p>
            <p className="sr-only">{t(aiLayer.legend[use.state], lang)}</p>
          </li>
        ))}
      </ul>
      <p className="ai-legend" aria-hidden="true">
        <span>
          <span className="dot dot--signal" />
          {t(aiLayer.legend.live, lang)}
        </span>
        <span>
          <span className="dot dot--progress" />
          {t(aiLayer.legend.next, lang)}
        </span>
      </p>
    </Section>
  );
}

export function MobileLayer({ lang }: { lang: Lang }) {
  return (
    <Section
      id="mobile"
      index="07"
      eyebrow={t(mobileLayer.eyebrow, lang)}
      title={t(mobileLayer.title, lang)}
      lead={t(mobileLayer.lead, lang)}
    >
      <ol className="chain" data-reveal="" aria-label={mobileLayer.chain.map((c) => t(c, lang)).join(" → ")}>
        {mobileLayer.chain.map((step, i) => (
          <li key={step.en} style={{ display: "contents" }}>
            {i > 0 ? <span className="chain__sep" aria-hidden="true" /> : null}
            <span className="chain__item" data-current={step.en === "Mobile" || undefined}>
              {t(step, lang)}
            </span>
          </li>
        ))}
      </ol>
      <div className="mobile-cards">
        {[mobileLayer.flutter, mobileLayer.web].map((card, i) => (
          <article key={card.title.en} className="mobile-card" data-reveal="" style={{ "--delay": `${i * 100}ms` } as CSSProperties}>
            <h3>{t(card.title, lang)}</h3>
            <p>{t(card.text, lang)}</p>
          </article>
        ))}
        <article className="mobile-card mobile-card--quiet" data-reveal="" style={{ "--delay": "200ms" } as CSSProperties}>
          <h3>{t(mobileLayer.ionic.title, lang)}</h3>
          <p>{t(mobileLayer.ionic.text, lang)}</p>
        </article>
      </div>
    </Section>
  );
}
