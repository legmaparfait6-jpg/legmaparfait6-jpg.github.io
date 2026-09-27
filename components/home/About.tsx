import type { CSSProperties } from "react";
import { Section } from "@/components/Section";
import { profile } from "@/content/profile";
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

        <div className="about__aside">
          {/* Fiche d'identité : le portrait apparaît par balayage, comme une identification. */}
          <figure className="portrait" data-reveal="" style={{ "--delay": "80ms" } as CSSProperties}>
            <div className="portrait__frame">
              <img
                src={profile.photo.src}
                width={profile.photo.width}
                height={profile.photo.height}
                alt={t(profile.photo.alt, lang)}
                loading="lazy"
                decoding="async"
              />
              <span className="portrait__scan" aria-hidden="true" />
              <span className="portrait__corner portrait__corner--tl" aria-hidden="true" />
              <span className="portrait__corner portrait__corner--tr" aria-hidden="true" />
              <span className="portrait__corner portrait__corner--bl" aria-hidden="true" />
              <span className="portrait__corner portrait__corner--br" aria-hidden="true" />
            </div>
            <figcaption className="portrait__caption">
              <span className="meta">{profile.name}</span>
              <span className="status status--delivered">
                <span className="dot dot--signal" aria-hidden="true" />
                {lang === "fr" ? "En ligne" : "Online"}
              </span>
            </figcaption>
          </figure>

          <dl className="facts" data-reveal="" style={{ "--delay": "160ms" } as CSSProperties}>
            {about.facts.map((fact) => (
              <div key={fact.label.en} className="facts__row">
                <dt className="meta">{t(fact.label, lang)}</dt>
                <dd className="facts__value">{t(fact.value, lang)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  );
}
