import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "./ats.css";
import { cv } from "@/content/cv";
import { SITE_URL, profile } from "@/content/profile";
import { type L, type Lang, isLang, t, typo } from "@/lib/i18n";

type Params = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return {
    title: lang === "fr" ? "CV — version ATS" : "CV — ATS version",
    // Doublon du CV principal : utile en PDF, pas dans les moteurs de recherche.
    robots: { index: false },
  };
}

/** Texte brut : les marques de mise en valeur (**…**) sont retirées. */
const plain = (text: L, lang: Lang) => t(text, lang).replace(/\*\*(.+?)\*\*/g, "$1");
const label = (value: string | L, lang: Lang) => (typeof value === "string" ? value : t(value, lang));

/**
 * CV « ATS » : une colonne, titres standard, texte simple, aucun élément
 * graphique. Même contenu que le CV principal (content/cv.ts), pour les
 * portails de recrutement qui analysent mal les mises en page en colonnes.
 */
export default async function AtsCvPage({ params }: Params) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const h = cv.headings;
  const site = `${SITE_URL}/${lang}/`;
  // Deux-points : espace fine insécable en français, aucune espace en anglais.
  const colon = lang === "fr" ? " :" : ":";

  return (
    <article className="ats" lang={lang}>
      <header>
        <h1>{profile.name}</h1>
        <p className="ats__title">{t(profile.title, lang)}</p>
        <p>
          {profile.email} | {profile.phone.display} | {t(profile.location, lang)}
        </p>
        <p>
          GitHub{colon} github.com/{profile.github.user} | Portfolio{colon} {site.replace(/^https:\/\//, "")}
        </p>
      </header>

      <section>
        <h2>{t(h.profile, lang)}</h2>
        <p>{t(cv.profile, lang)}</p>
      </section>

      <section>
        <h2>{t(h.experience, lang)}</h2>
        {cv.experience.map((job) => (
          <div key={job.org} className="ats__entry">
            <h3>
              {t(job.role, lang)} — {job.org}
            </h3>
            <p className="ats__meta">
              {t(job.period, lang)} | {job.place}
            </p>
            <ul>
              {job.bullets.map((b) => (
                <li key={b.en}>{plain(b, lang)}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section>
        <h2>{t(h.projects, lang)}</h2>
        {cv.projects.map((p) => (
          <div key={p.name} className="ats__entry">
            <h3>
              {p.name} — {typo(p.desc[lang], lang)}
            </h3>
            <p className="ats__meta">
              {t(p.status, lang)}
              {p.period ? ` | ${t(p.period, lang)}` : ""} | {p.stack.replaceAll(" · ", ", ")}
            </p>
            <ul>
              {p.metrics.length > 0 ? <li>{p.metrics.map((m) => t(m, lang)).join(", ")}.</li> : null}
              {p.bullets.map((b) => (
                <li key={b.en}>{plain(b, lang)}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section>
        <h2>{t(h.skills, lang)}</h2>
        <ul className="ats__skills">
          {cv.skills.map((group) => (
            <li key={group.group.en}>
              <strong>
                {t(group.group, lang)}
                {colon}
              </strong>{" "}
              {group.items.map((item) => (item.level ? `${label(item.name, lang)} (${t(item.level, lang)})` : label(item.name, lang))).join(", ")}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>{t(h.education, lang)}</h2>
        <p>
          <strong>{t(profile.education.degree, lang)}</strong> — {t(profile.education.school, lang)} | {profile.education.period}
        </p>
      </section>

      <section>
        <h2>{t(h.certifications, lang)}</h2>
        {profile.certifications.map((c) => (
          <p key={c.name.en}>
            {typo(c.name[lang], lang)}
            {c.issuer ? ` — ${c.issuer}` : ""}
            {c.year ? ` | ${c.year}` : ""}
          </p>
        ))}
      </section>

      <section>
        <h2>{t(h.languages, lang)}</h2>
        <p>{profile.languages.map((l) => `${t(l.name, lang)} (${t(l.level, lang).toLowerCase()})`).join(", ")}</p>
      </section>
    </article>
  );
}
