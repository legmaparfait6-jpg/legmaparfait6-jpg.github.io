import type { CSSProperties } from "react";
import { DownloadIcon } from "@/components/Header";
import { Arrow } from "@/components/Section";
import { GuidedToggle, RadioTrigger } from "@/components/voice/RadioTrigger";
import { profile } from "@/content/profile";
import { hero, ui } from "@/content/story";
import { type Lang, t } from "@/lib/i18n";

export function Hero({ lang }: { lang: Lang }) {
  const lastIndex = hero.trace.length - 1;

  return (
    <section id="home" className="hero" aria-labelledby="home-title" data-transmission="01-hero">
      <div className="container hero__grid">
        <div className="hero__intro">
          {/* Séquence d'activation : CSS pur, 1 s, remplacée par l'état final si le mouvement est réduit. */}
          <p className="hero__boot meta" aria-hidden="true">
            <span className="dot boot-dot" />
            <span className="boot">
              {hero.boot.map((step, i) => (
                <span key={i}>{t(step, lang)}{i < hero.boot.length - 1 ? "…" : ""}</span>
              ))}
            </span>
          </p>

          <p className="hero__name">
            <strong>{profile.name}</strong> · {t(profile.location, lang)}
          </p>

          <h1 id="home-title" className="hero__title">
            {t(hero.headline, lang)}
          </h1>

          <p className="hero__role">{t(profile.title, lang)}</p>

          <p className="hero__approach">{t(hero.approach, lang)}</p>

          <div className="hero__ctas">
            <a className="btn btn--primary" href="#projects">
              {t(hero.ctaWork, lang)}
              <span className="btn__arrow">
                <Arrow />
              </span>
            </a>
            <a className="btn" href={profile.cv[lang]} download>
              <DownloadIcon />
              {t(ui.downloadCv, lang)}
            </a>
          </div>

          <div className="hero__voice">
            <RadioTrigger id="01-hero" lang={lang} variant="button" />
            <GuidedToggle lang={lang} />
          </div>
        </div>

        <figure className="trace" aria-labelledby="trace-caption">
          <div className="trace__head">
            <figcaption id="trace-caption" className="meta">
              {t(hero.traceLabel, lang)}
            </figcaption>
            <span className="meta" aria-hidden="true">
              {String(hero.trace.length).padStart(2, "0")}
            </span>
          </div>
          <div className="trace__track">
          <span className="trace__pulse" aria-hidden="true" />
          <ol className="trace__list">
            {hero.trace.map((stage, i) => (
              <li
                key={stage.en}
                className="trace__stage"
                data-layer={i === lastIndex ? "evolve" : stage.en === "AI" ? "ai" : undefined}
                style={{ "--i": i } as CSSProperties}
              >
                <span className="trace__node" aria-hidden="true" />
                <span className="trace__label">{t(stage, lang)}</span>
              </li>
            ))}
          </ol>
          </div>
          <div className="trace__foot">
            <span className="dot dot--progress" aria-hidden="true" />
            <span className="meta">{lang === "fr" ? "Le système évolue" : "The system evolves"}</span>
          </div>
        </figure>
      </div>
    </section>
  );
}
