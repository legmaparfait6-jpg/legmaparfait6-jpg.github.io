import { Arrow } from "@/components/Section";
import { profile } from "@/content/profile";
import { finale, ui } from "@/content/story";
import { type Lang, t } from "@/lib/i18n";
import { CopyButton } from "./CopyButton";

export function Finale({ lang }: { lang: Lang }) {
  const rows = [
    {
      label: t(finale.labels.email!, lang),
      value: profile.email,
      href: `mailto:${profile.email}`,
      copy: profile.email,
    },
    {
      label: t(finale.labels.phone!, lang),
      value: profile.phone.display,
      href: `tel:${profile.phone.href}`,
      copy: profile.phone.display,
    },
    {
      label: t(finale.labels.github!, lang),
      value: `github.com/${profile.github.user}`,
      href: profile.github.url,
      external: true,
    },
    {
      label: t(finale.labels.cv!, lang),
      value: t(ui.downloadCv, lang),
      href: profile.cv[lang],
      download: true,
    },
  ];

  return (
    <section id="contact" className="finale" aria-labelledby="contact-title">
      <div className="container">
        <p className="section__index meta" data-reveal="">
          <span className="dot dot--progress" aria-hidden="true" />
          09 / {lang === "fr" ? "Contact" : "Contact"}
        </p>
        <h2 id="contact-title" className="finale__title" data-reveal="">
          {t(finale.title, lang)}
        </h2>
        <p className="finale__text" data-reveal="">
          {t(finale.text, lang)}
        </p>
        <a className="finale__cta" href={`mailto:${profile.email}`} data-reveal="">
          {t(finale.cta, lang)}
          <span className="finale__cta-arrow">
            <Arrow />
          </span>
        </a>

        <ul className="contact-list" data-reveal="">
          {rows.map((row) => (
            <li key={row.label} className="contact-list__row">
              <span className="contact-list__label meta">{row.label}</span>
              <a
                className="contact-list__value"
                href={row.href}
                {...(row.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                {...(row.download ? { download: true } : {})}
              >
                {row.value}
              </a>
              {row.copy ? (
                <CopyButton value={row.copy} label={t(ui.copy, lang)} done={t(ui.copied, lang)} />
              ) : (
                <span aria-hidden="true" />
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
