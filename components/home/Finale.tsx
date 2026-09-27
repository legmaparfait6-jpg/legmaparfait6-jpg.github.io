import type { CSSProperties } from "react";
import { profile } from "@/content/profile";
import { finale, ui } from "@/content/story";
import { type Lang, t } from "@/lib/i18n";
import { RadioTrigger } from "@/components/voice/RadioTrigger";
import { ContactForm } from "./ContactForm";
import { CopyButton } from "./CopyButton";

export function Finale({ lang }: { lang: Lang }) {
  const whatsappText =
    lang === "fr"
      ? "Bonjour Legma, j'ai vu votre portfolio et j'aimerais échanger avec vous."
      : "Hello Legma, I saw your portfolio and would like to talk with you.";

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
      label: "WhatsApp",
      value: lang === "fr" ? "Écrire sur WhatsApp" : "Message on WhatsApp",
      href: `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(whatsappText)}`,
      external: true,
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
    <section id="contact" className="finale" aria-labelledby="contact-title" data-transmission="07-final">
      <div className="container">
        <p className="section__index meta" data-reveal="">
          <span className="dot dot--progress" aria-hidden="true" />
          09 / Contact
          <RadioTrigger id="07-final" lang={lang} />
        </p>
        <h2 id="contact-title" className="finale__title" data-reveal="">
          {t(finale.title, lang)}
        </h2>
        <p className="finale__text" data-reveal="">
          {t(finale.text, lang)}
        </p>

        <div className="finale__grid">
          <div className="finale__form" data-reveal="">
            <h3 className="finale__cta">{t(finale.cta, lang)}</h3>
            <ContactForm lang={lang} accessKey={profile.integrations.web3formsKey} email={profile.email} />
          </div>

          <ul className="contact-list" data-reveal="" style={{ "--delay": "120ms" } as CSSProperties}>
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
      </div>
    </section>
  );
}
