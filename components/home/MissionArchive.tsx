import type { CSSProperties } from "react";
import { DiveLink } from "@/components/DiveLink";
import { Arrow, Section } from "@/components/Section";
import { StatusBadge } from "@/components/StatusBadge";
import { missions } from "@/content/missions";
import { transmissionFor } from "@/content/transmissions";
import { RadioTrigger } from "@/components/voice/RadioTrigger";
import { WorldIllustration } from "@/components/mission/WorldIllustration";
import { archive, ui } from "@/content/story";
import { type Lang, t } from "@/lib/i18n";

export function MissionArchive({ lang }: { lang: Lang }) {
  const externalLinks = (mission: (typeof missions)[number]) => [
    ...(mission.website
      ? [{
          href: mission.website,
          label: { fr: "Site", en: "Website" },
          accessibleLabel: {
            fr: `Ouvrir le site public de ${mission.name} dans un nouvel onglet`,
            en: `Open the public ${mission.name} website in a new tab`,
          },
        }]
      : []),
    ...(mission.repository
      ? [{
          href: mission.repository,
          label: { fr: "GitHub", en: "GitHub" },
          accessibleLabel: {
            fr: `Ouvrir le dépôt GitHub de ${mission.name} dans un nouvel onglet`,
            en: `Open the ${mission.name} GitHub repository in a new tab`,
          },
        }]
      : []),
  ];

  return (
    <Section id="projects" index="05" eyebrow={t(archive.eyebrow, lang)} title={t(archive.title, lang)}>
      <p className="archive__hint meta" aria-hidden="true">
        {lang === "fr" ? "Glissez pour parcourir les missions" : "Swipe to browse the missions"} →
      </p>
      <ol className="archive">
        {missions.map((mission, i) => {
          const featured = mission.screenshots.length > 0;
          const cover = mission.screenshots[0];
          const links = externalLinks(mission);
          return (
            <li
              key={mission.slug}
              className={`mission-row${featured ? " mission-row--featured" : ""}`}
              data-reveal=""
              style={{ "--delay": `${Math.min(i, 2) * 60}ms` } as CSSProperties}
            >
              <div className="mission-row__code">
                <span className="meta">Mission {mission.code}</span>
                <StatusBadge status={mission.status} lang={lang} />
                {transmissionFor(mission.slug) ? (
                  <span className="mission-row__radio">
                    <RadioTrigger id={transmissionFor(mission.slug)!.id} lang={lang} />
                  </span>
                ) : null}
              </div>

              <div className="mission-row__main">
                <h3 className="mission-row__name">
                  <DiveLink className="mission-row__link" href={`/${lang}/missions/${mission.slug}/`} slug={mission.slug}>
                    {mission.name}
                  </DiveLink>
                </h3>
                <p className="mission-row__context">{t(mission.context, lang)}</p>
                <p className="mission-row__summary">
                  <span className="sr-only">{t(ui.objective, lang)} : </span>
                  {t(mission.summary, lang)}
                </p>
                <ul className="mission-row__stack" aria-label={t(ui.stack, lang)}>
                  {mission.stack.map((tech) => (
                    <li key={tech} className="tag">
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mission-row__aside">
                {!featured ? (
                  <div className="mission-row__world">
                    <WorldIllustration slug={mission.slug} palette={mission.world} className="mission-row__world-art" />
                    {mission.brand ? (
                      <img
                        className="mission-row__brand"
                        src={mission.brand.src}
                        alt=""
                        aria-hidden="true"
                        width={mission.brand.width}
                        height={mission.brand.height}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}
                  </div>
                ) : null}
                {featured && cover ? (
                  <div className="mission-row__visual phone" aria-hidden="true">
                    <img src={cover.src} alt="" width={cover.width} height={cover.height} loading="lazy" decoding="async" />
                  </div>
                ) : null}
                {links.length > 0 ? (
                  <div className="mission-row__external-links">
                    {links.map((link) => (
                      <a
                        key={link.href}
                        className="mission-row__external"
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.accessibleLabel[lang]}
                      >
                        {link.label[lang]}
                        <span aria-hidden="true">↗</span>
                      </a>
                    ))}
                  </div>
                ) : null}
                <span className="mission-row__go" aria-hidden="true">
                  {t(ui.explore, lang)}
                  <span className="mission-row__go-arrow">
                    <Arrow />
                  </span>
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
