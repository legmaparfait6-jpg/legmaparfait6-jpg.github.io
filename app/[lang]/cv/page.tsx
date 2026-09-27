import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "./cv.css";
import { DownloadIcon } from "@/components/Header";
import { cv } from "@/content/cv";
import { SITE_URL, profile } from "@/content/profile";
import { ui } from "@/content/story";
import { isLang, t, typo } from "@/lib/i18n";
import { PrintButton } from "./PrintButton";

type Params = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return {
    title: "CV",
    description: t(cv.profile, lang),
    alternates: { canonical: `/${lang}/cv/`, languages: { fr: "/fr/cv/", en: "/en/cv/" } },
  };
}

export default async function CvPage({ params }: Params) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const h = cv.headings;
  const siteHost = SITE_URL.replace(/^https?:\/\//, "");

  return (
    <div className="cv-page">
      <div className="cv-toolbar container">
        <p className="meta">CV · {profile.name}</p>
        <div className="cv-toolbar__actions">
          <a className="btn btn--primary" href={profile.cv[lang]} download>
            <DownloadIcon />
            {t(ui.downloadCv, lang)} (PDF)
          </a>
          <PrintButton label={lang === "fr" ? "Imprimer" : "Print"} />
        </div>
      </div>

      <article className="cv" lang={lang} aria-label={`CV — ${profile.name}`}>
        <header className="cv__header">
          <div>
            <h1 className="cv__name">{profile.name}</h1>
            <p className="cv__title">{t(profile.title, lang)}</p>
          </div>
          <ul className="cv__contact">
            <li>{t(profile.location, lang)}</li>
            <li>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
            </li>
            <li>
              <a href={`tel:${profile.phone.href}`}>{profile.phone.display}</a>
            </li>
            <li>
              <a href={profile.github.url}>github.com/{profile.github.user}</a>
            </li>
            <li>
              <a href={`${SITE_URL}/${lang}/`}>{siteHost}</a>
            </li>
          </ul>
        </header>

        <section className="cv__section">
          <h2 className="cv__h2">{t(h.profile, lang)}</h2>
          <p className="cv__profile">{t(cv.profile, lang)}</p>
        </section>

        <section className="cv__section">
          <h2 className="cv__h2">{t(h.experience, lang)}</h2>
          {cv.experience.map((job) => (
            <div key={job.org} className="cv__entry">
              <div className="cv__entry-head">
                <h3 className="cv__h3">
                  {t(job.role, lang)} — {job.org}
                </h3>
                <span className="cv__when">{job.period ? t(job.period, lang) : job.place}</span>
              </div>
              <ul className="cv__bullets">
                {job.bullets.map((b) => (
                  <li key={b.en}>{t(b, lang)}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="cv__section">
          <h2 className="cv__h2">{t(h.projects, lang)}</h2>
          {cv.projects.map((p) => (
            <div key={p.name} className="cv__entry">
              <div className="cv__entry-head">
                <h3 className="cv__h3">
                  {p.name} — <span className="cv__desc">{t(p.desc, lang)}</span>
                </h3>
                {p.period ? <span className="cv__when">{t(p.period, lang)}</span> : null}
              </div>
              <p className="cv__stack">{p.stack}</p>
              <ul className="cv__bullets">
                {p.bullets.map((b) => (
                  <li key={b.en}>{t(b, lang)}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="cv__section">
          <h2 className="cv__h2">{t(h.skills, lang)}</h2>
          <dl className="cv__skills">
            {cv.skills.map((s) => (
              <div key={s.group.en} className="cv__skill-row">
                <dt>{t(s.group, lang)}</dt>
                <dd>{t(s.items, lang)}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="cv__columns">
          <section className="cv__section">
            <h2 className="cv__h2">{t(h.education, lang)}</h2>
            <div className="cv__entry">
              <div className="cv__entry-head">
                <h3 className="cv__h3">{t(profile.education.degree, lang)}</h3>
                <span className="cv__when">{profile.education.period}</span>
              </div>
              <p className="cv__stack">{t(profile.education.school, lang)}</p>
            </div>
          </section>

          <section className="cv__section">
            <h2 className="cv__h2">{t(h.certifications, lang)}</h2>
            <ul className="cv__plain">
              {profile.certifications.map((c) => (
                <li key={c.name.en}>
                  {typo(c.name[lang], lang)}
                  {c.issuer ? ` — ${c.issuer}` : ""}
                  {c.year ? ` (${c.year})` : ""}
                </li>
              ))}
            </ul>
          </section>

          <section className="cv__section">
            <h2 className="cv__h2">{t(h.languages, lang)}</h2>
            <ul className="cv__plain">
              {profile.languages.map((l) => (
                <li key={l.name.en}>
                  {t(l.name, lang)} — {t(l.level, lang)}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </article>
    </div>
  );
}
