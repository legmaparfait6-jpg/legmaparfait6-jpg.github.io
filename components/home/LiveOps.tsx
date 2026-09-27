import { Arrow, Section } from "@/components/Section";
import { live } from "@/content/story";
import { type Lang, t } from "@/lib/i18n";
import { LiveLog } from "./LiveLog";

export function LiveOps({ lang }: { lang: Lang }) {
  const states = Object.fromEntries(Object.entries(live.states).map(([k, v]) => [k, t(v, lang)])) as Record<
    keyof typeof live.states,
    string
  >;
  return (
    <Section
      id="live"
      index="03"
      eyebrow={t(live.eyebrow, lang)}
      title={t(live.title, lang)}
      lead={t(live.lead, lang)}
      transmission={{ id: "03-incident", lang }}
    >
      <div className="live">
        <LiveLog
          lang={lang}
          labels={{ title: t(live.logTitle, lang), badge: t(live.badge, lang), replay: t(live.replay, lang), states }}
        />
        <aside className="live__rules" data-reveal="">
          <p className="meta">{t(live.rulesTitle, lang)}</p>
          <ul className="checklist">
            {live.rules.map((rule) => (
              <li key={rule.en}>{t(rule, lang)}</li>
            ))}
          </ul>
          <a className="back-link" href={`/${lang}/missions/network-supervision/`}>
            {t(live.mission, lang)}
            <Arrow />
          </a>
        </aside>
      </div>
    </Section>
  );
}
