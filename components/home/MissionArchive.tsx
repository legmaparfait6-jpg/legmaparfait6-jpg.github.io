import type { CSSProperties } from "react";
import { DiveLink } from "@/components/DiveLink";
import { Arrow, Section } from "@/components/Section";
import { StatusBadge } from "@/components/StatusBadge";
import { missions } from "@/content/missions";
import { archive, ui } from "@/content/story";
import { type Lang, t } from "@/lib/i18n";

export function MissionArchive({ lang }: { lang: Lang }) {
  return (
    <Section id="projects" index="05" eyebrow={t(archive.eyebrow, lang)} title={t(archive.title, lang)}>
      <ol className="archive">
        {missions.map((mission, i) => {
          const featured = mission.screenshots.length > 0;
          const cover = mission.screenshots[0];
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
                {featured && cover ? (
                  <div className="mission-row__visual phone" aria-hidden="true">
                    <img src={cover.src} alt="" width={cover.width} height={cover.height} loading="lazy" decoding="async" />
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
