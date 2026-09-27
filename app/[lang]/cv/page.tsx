import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import type { ReactNode } from "react";
import "./cv.css";
import { DownloadIcon } from "@/components/Header";
import { cv } from "@/content/cv";
import { SITE_URL, profile } from "@/content/profile";
import { ui } from "@/content/story";
import { type L, type Lang, isLang, t, typo } from "@/lib/i18n";
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

/** **texte** → <strong>texte</strong>, avec la typographie de la langue. */
function rich(text: L, lang: Lang): ReactNode {
  return t(text, lang)
    .split(/\*\*(.+?)\*\*/g)
    .map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
}

const name = (value: string | L, lang: Lang) => (typeof value === "string" ? value : t(value, lang));

function Icon({ d }: { d: string }) {
  return (
    <svg className="cv__icon" viewBox="0 0 16 16" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ICONS = {
  mail: "M2.5 4h11v8h-11zM3 4.5l5 3.8 5-3.8",
  phone: "M5 2.5 3 3c-.5 3.8 4.7 9 8.5 8.5l.5-2-2.5-1.3-1.2 1.2c-1.4-.6-2.7-1.9-3.3-3.3l1.2-1.2z",
  pin: "M8 14s4.5-4.2 4.5-7.3a4.5 4.5 0 0 0-9 0C3.5 9.8 8 14 8 14zM8 8.3a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2z",
  code: "M5.5 4.5 2 8l3.5 3.5M10.5 4.5 14 8l-3.5 3.5",
  chat: "M3 12.5 3.8 10A5 5 0 1 1 6 12.2zM6 7.5h4M6 9.2h2.5",
  globe: "M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12zM2 8h12M8 2c1.8 1.7 2.6 3.7 2.6 6S9.8 12.3 8 14C6.2 12.3 5.4 10.3 5.4 8S6.2 3.7 8 2z",
};

export default async function CvPage({ params }: Params) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const h = cv.headings;
  const portfolioUrl = `${SITE_URL}/${lang}/`;
  const siteHost = SITE_URL.replace(/^https?:\/\//, "");
  // QR code généré au build (SVG), aucun script côté visiteur.
  const qr = await QRCode.toString(portfolioUrl, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#0c0d10", light: "#ffffff" },
  });

  return (
    <div className="cv-page">
      <div className="cv-toolbar container">
        <p className="meta">CV · {profile.name}</p>
        <div className="cv-toolbar__actions">
          <a className="btn btn--primary" href={profile.cv[lang]} download>
            <DownloadIcon />
            {t(ui.downloadCv, lang)} (PDF)
          </a>
          <a className="btn" href={profile.cvAts[lang]} download>
            <DownloadIcon />
            {t(h.ats, lang)}
          </a>
          <PrintButton label={lang === "fr" ? "Imprimer" : "Print"} />
        </div>
      </div>

      <article className="cv" lang={lang} aria-label={`CV — ${profile.name}`}>
        <header className="cv__header">
          <div className="cv__identity">
            <h1 className="cv__name">{profile.name}</h1>
            <p className="cv__title">{t(profile.title, lang)}</p>
            <p className="cv__tagline">{t(cv.tagline, lang)}</p>
            {/* Téléphone : contact en un geste (masqué à l'impression). */}
            <ul className="cv__quick">
              <li>
                <a href={`tel:${profile.phone.href}`}>
                  <Icon d={ICONS.phone} />
                  {lang === "fr" ? "Appeler" : "Call"}
                </a>
              </li>
              <li>
                <a href={`mailto:${profile.email}`}>
                  <Icon d={ICONS.mail} />
                  E-mail
                </a>
              </li>
              <li>
                <a href={`https://wa.me/${profile.whatsapp}`}>
                  <Icon d={ICONS.chat} />
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
          <a className="cv__qr" href={portfolioUrl} aria-label={`${t(h.portfolio, lang)} : ${siteHost}`}>
            <span className="cv__qr-code" dangerouslySetInnerHTML={{ __html: qr }} />
            <span className="cv__qr-label">{t(h.portfolio, lang)}</span>
          </a>
        </header>

        <div className="cv__main">
          <section className="cv__section">
            <h2 className="cv__h2">{t(h.profile, lang)}</h2>
            <p className="cv__profile">{t(cv.profile, lang)}</p>
          </section>

          <section className="cv__section">
            <h2 className="cv__h2">{t(h.experience, lang)}</h2>
            {cv.experience.map((job) => (
              <div key={job.org} className="cv__entry cv__entry--timeline">
                <div className="cv__entry-head">
                  <h3 className="cv__h3">
                    {t(job.role, lang)}
                    <span className="cv__org"> — {job.org}</span>
                  </h3>
                </div>
                <p className="cv__sub">
                  {t(job.period, lang)} · {job.place}
                </p>
                <ul className="cv__bullets">
                  {job.bullets.map((b) => (
                    <li key={b.en}>{rich(b, lang)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section className="cv__section">
            <h2 className="cv__h2">{t(h.projects, lang)}</h2>
            {cv.projects.map((p) => (
              <div key={p.name} className="cv__entry cv__entry--timeline">
                <div className="cv__entry-head">
                  <h3 className="cv__h3">
                    {p.name}
                    <span className="cv__status">{t(p.status, lang)}</span>
                  </h3>
                  {p.period ? <span className="cv__when">{t(p.period, lang)}</span> : null}
                </div>
                <p className="cv__sub">{typo(p.desc[lang], lang)}</p>
                <p className="cv__stack">{p.stack}</p>
                {p.metrics.length > 0 ? (
                  <ul className="cv__metrics">
                    {p.metrics.map((m) => (
                      <li key={m.en}>{t(m, lang)}</li>
                    ))}
                  </ul>
                ) : null}
                <ul className="cv__bullets">
                  {p.bullets.map((b) => (
                    <li key={b.en}>{rich(b, lang)}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
          <div className="cv__row">
            <section className="cv__section">
              <h2 className="cv__h2">{t(h.education, lang)}</h2>
              <p className="cv__edu-degree">{t(profile.education.degree, lang)}</p>
              <p className="cv__edu-school">{t(profile.education.school, lang)}</p>
              <p className="cv__when">{profile.education.period}</p>
            </section>

            <section className="cv__section">
              <h2 className="cv__h2">{t(h.certifications, lang)}</h2>
              {profile.certifications.map((c) => (
                <div key={c.name.en}>
                  <p className="cv__edu-degree">{typo(c.name[lang], lang)}</p>
                  <p className="cv__edu-school">
                    {c.issuer}
                    {c.year ? ` · ${c.year}` : ""}
                  </p>
                </div>
              ))}
            </section>
          </div>
        </div>

        <aside className="cv__aside">
          <section className="cv__section">
            <h2 className="cv__h2">{t(h.contact, lang)}</h2>
            <ul className="cv__contact">
              <li>
                <Icon d={ICONS.mail} />
                <a href={`mailto:${profile.email}`}>{profile.email}</a>
              </li>
              <li>
                <Icon d={ICONS.phone} />
                <a href={`tel:${profile.phone.href}`}>{profile.phone.display}</a>
              </li>
              <li>
                <Icon d={ICONS.pin} />
                <span>{t(profile.location, lang)}</span>
              </li>
              <li>
                <Icon d={ICONS.code} />
                <a href={profile.github.url}>github.com/{profile.github.user}</a>
              </li>
              <li>
                <Icon d={ICONS.globe} />
                <a href={portfolioUrl}>{siteHost}</a>
              </li>
            </ul>
          </section>

          <section className="cv__section">
            <h2 className="cv__h2">{t(h.skills, lang)}</h2>
            <div className="cv__skills">
              {cv.skills.map((group) => (
                <div key={group.group.en} className="cv__skill-group">
                  <h3 className="cv__skill-title">{t(group.group, lang)}</h3>
                  <ul className="cv__chips">
                    {group.items.map((item) => (
                      <li key={name(item.name, "en")}>
                        {name(item.name, lang)}
                        {item.level ? <span className="cv__level"> · {t(item.level, lang)}</span> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="cv__section">
            <h2 className="cv__h2">{t(h.languages, lang)}</h2>
            <ul className="cv__langs">
              {profile.languages.map((l) => (
                <li key={l.name.en}>
                  <span>{t(l.name, lang)}</span>
                  <span className="cv__level">{t(l.level, lang)}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </article>
    </div>
  );
}
