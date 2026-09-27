import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";
import { Arrow } from "@/components/Section";
import { StatusBadge } from "@/components/StatusBadge";
import { getMission, missions } from "@/content/missions";
import { profile } from "@/content/profile";
import { ui } from "@/content/story";
import { type Lang, isLang, t } from "@/lib/i18n";

export const dynamicParams = false;

export function generateStaticParams() {
  return missions.map((m) => ({ slug: m.slug }));
}

type Params = { params: Promise<{ lang: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang, slug } = await params;
  const mission = getMission(slug);
  if (!mission || !isLang(lang)) return {};
  return {
    title: `${mission.name} — Mission ${mission.code}`,
    description: t(mission.summary, lang),
    alternates: {
      canonical: `/${lang}/missions/${slug}/`,
      languages: { fr: `/fr/missions/${slug}/`, en: `/en/missions/${slug}/` },
    },
    openGraph: { title: `${mission.name} — ${profile.name}`, description: t(mission.summary, lang), url: `/${lang}/missions/${slug}/` },
  };
}

const LABELS = {
  context: { fr: "Contexte", en: "Context" },
  problem: { fr: "Problème", en: "Problem" },
  objective: { fr: "Objectif", en: "Objective" },
  architecture: { fr: "Architecture", en: "Architecture" },
  technologies: { fr: "Technologies", en: "Technologies" },
  features: { fr: "Fonctionnalités", en: "Features" },
  screenshots: { fr: "Captures", en: "Screenshots" },
  decisions: { fr: "Décisions techniques", en: "Technical decisions" },
  challenges: { fr: "Difficultés", en: "Challenges" },
  result: { fr: "Résultat", en: "Result" },
  evolution: { fr: "Évolution possible", en: "Possible evolution" },
  links: { fr: "Code et démo", en: "Code and demo" },
  lenses: { fr: "Technologie, utilisateur, produit, business", en: "Technology, user, product, business" },
  role: { fr: "Rôle", en: "Role" },
  period: { fr: "Période", en: "Period" },
  frame: { fr: "Cadre", en: "Setting" },
  next: { fr: "Mission suivante", en: "Next mission" },
  contact: { fr: "Échanger sur ce projet", en: "Talk about this project" },
};

function Block({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="dossier__block" data-reveal="">
      <header className="dossier__head">
        <span className="meta">{String(n).padStart(2, "0")}</span>
        <h2 className="dossier__title">{title}</h2>
      </header>
      <div>{children}</div>
    </section>
  );
}

export default async function MissionPage({ params }: Params) {
  const { lang, slug } = await params;
  const mission = getMission(slug);
  if (!mission || !isLang(lang)) notFound();
  const l = (key: keyof typeof LABELS) => t(LABELS[key], lang as Lang);

  const index = missions.findIndex((m) => m.slug === slug);
  const next = missions[(index + 1) % missions.length]!;

  // Numérotation continue des rubriques présentes (aucune rubrique vide n'est affichée).
  let n = 0;
  const num = () => ++n;

  return (
    <article>
      <header className="mission-hero">
        <div className="container">
          <Link className="back-link" href={`/${lang}/#projects`}>
            <Arrow direction="left" />
            {t(ui.backToArchive, lang)}
          </Link>
          <div className="mission-hero__code">
            <span className="meta">Mission {mission.code}</span>
            <StatusBadge status={mission.status} lang={lang} />
          </div>
          <h1 className="mission-hero__title">{mission.name}</h1>
          <p className="mission-hero__summary">{t(mission.summary, lang)}</p>
          <dl className="mission-meta">
            <div className="mission-meta__item">
              <dt className="meta">{l("frame")}</dt>
              <dd className="mission-meta__value">{t(mission.context, lang)}</dd>
            </div>
            <div className="mission-meta__item">
              <dt className="meta">{l("role")}</dt>
              <dd className="mission-meta__value">{t(mission.role, lang)}</dd>
            </div>
            {mission.period ? (
              <div className="mission-meta__item">
                <dt className="meta">{l("period")}</dt>
                <dd className="mission-meta__value">{t(mission.period, lang)}</dd>
              </div>
            ) : null}
            <div className="mission-meta__item">
              <dt className="meta">{t(ui.stack, lang)}</dt>
              <dd className="mission-meta__value">{mission.stack.join(" · ")}</dd>
            </div>
          </dl>
          {mission.disclaimer ? (
            <p className="disclaimer" role="note">
              <span className="dot dot--progress" aria-hidden="true" style={{ marginTop: "0.5em" }} />
              {t(mission.disclaimer, lang)}
            </p>
          ) : null}
          {process.env.NODE_ENV === "development" && mission.pending.length > 0 ? (
            <p className="pending">
              {t(ui.pending, lang)} : {mission.pending.join(" · ")}
            </p>
          ) : null}
        </div>
      </header>

      <div className="container dossier">
        <Block n={num()} title={l("context")}>
          <p className="dossier__body dossier__body--lead">{t(mission.context_long, lang)}</p>
        </Block>

        <Block n={num()} title={l("problem")}>
          <p className="dossier__body">{t(mission.problem, lang)}</p>
        </Block>

        <Block n={num()} title={l("objective")}>
          <p className="dossier__body dossier__body--lead">{t(mission.objective, lang)}</p>
        </Block>

        <Block n={num()} title={l("architecture")}>
          <div className="dossier__body">
            <p>{t(mission.architecture.intro, lang)}</p>
            <ol className="flow flow--live" style={{ "--n": mission.architecture.flow.length } as CSSProperties}>
              {mission.architecture.flow.map((step, i) => (
                <li key={step.label.en} className="flow__step" style={{ "--i": i } as CSSProperties}>
                  <span className="flow__label">{t(step.label, lang)}</span>
                  <span className="flow__detail">{t(step.detail, lang)}</span>
                </li>
              ))}
            </ol>
          </div>
        </Block>

        <Block n={num()} title={l("technologies")}>
          <div className="tech-groups">
            {mission.technologies.map((group) => (
              <div key={group.group.en} className="tech-group">
                <span className="meta">{t(group.group, lang)}</span>
                <ul className="tech-group__items">
                  {group.items.map((item) => (
                    <li key={item} className="tag">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Block>

        <Block n={num()} title={l("features")}>
          <ul className="checklist">
            {mission.features.map((f) => (
              <li key={f.en}>{t(f, lang)}</li>
            ))}
          </ul>
        </Block>

        {mission.screenshots.length > 0 || mission.screenshotsNote ? (
          <Block n={num()} title={l("screenshots")}>
            {mission.screenshots.length > 0 ? (
              <ul className="gallery">
                {mission.screenshots.map((s) => (
                  <li key={s.src} className="gallery__item">
                    <figure>
                      <div className="phone">
                        <img src={s.src} alt={t(s.alt, lang)} width={s.width} height={s.height} loading="lazy" decoding="async" />
                      </div>
                      <figcaption className="meta" style={{ marginTop: 12 }}>
                        {t(s.caption, lang)}
                      </figcaption>
                    </figure>
                  </li>
                ))}
              </ul>
            ) : null}
            {mission.screenshotsNote ? (
              <p className="note" style={{ marginTop: mission.screenshots.length > 0 ? 16 : 0 }}>
                {t(mission.screenshotsNote, lang)}
              </p>
            ) : null}
          </Block>
        ) : null}

        {mission.lenses ? (
          <Block n={num()} title={l("lenses")}>
            <div className="cards cards--4">
              {mission.lenses.map((lens) => (
                <div key={lens.label.en} className="card">
                  <span className="meta">{t(lens.label, lang)}</span>
                  <p className="card__text">{t(lens.text, lang)}</p>
                </div>
              ))}
            </div>
          </Block>
        ) : null}

        <Block n={num()} title={l("decisions")}>
          <div className="cards cards--2">
            {mission.decisions.map((d) => (
              <div key={d.title.en} className="card">
                <h3 className="card__title">{t(d.title, lang)}</h3>
                <p className="card__text">{t(d.why, lang)}</p>
              </div>
            ))}
          </div>
        </Block>

        {mission.challenges.length > 0 ? (
          <Block n={num()} title={l("challenges")}>
            <div className="cards cards--2">
              {mission.challenges.map((c) => (
                <div key={c.title.en} className="card">
                  <h3 className="card__title">{t(c.title, lang)}</h3>
                  <p className="card__text">{t(c.why, lang)}</p>
                </div>
              ))}
            </div>
          </Block>
        ) : null}

        <Block n={num()} title={l("result")}>
          <p className="dossier__body dossier__body--lead">{t(mission.result, lang)}</p>
        </Block>

        <Block n={num()} title={l("evolution")}>
          <ul className="checklist checklist--next">
            {mission.evolution.map((e) => (
              <li key={e.en}>{t(e, lang)}</li>
            ))}
          </ul>
        </Block>

        <Block n={num()} title={l("links")}>
          <div className="dossier__body">
            <p>{t(mission.repo, lang)}</p>
            <p>
              <a className="btn" href={`mailto:${profile.email}?subject=${encodeURIComponent(`${mission.name}`)}`}>
                {l("contact")}
                <span className="btn__arrow">
                  <Arrow />
                </span>
              </a>
            </p>
          </div>
        </Block>

        <Link className="next-mission" href={`/${lang}/missions/${next.slug}/`}>
          <span className="meta">
            {l("next")} · {next.code}
          </span>
          <span className="next-mission__name">{next.name} →</span>
        </Link>
      </div>
    </article>
  );
}
