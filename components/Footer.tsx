import { profile } from "@/content/profile";
import { ui } from "@/content/story";
import { type Lang, t } from "@/lib/i18n";

export function Footer({ lang }: { lang: Lang }) {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p className="meta">
          © {new Date().getFullYear()} {profile.name} · {t(profile.location, lang)}
        </p>
        <p className="meta">{t(ui.footer, lang)}</p>
      </div>
    </footer>
  );
}
