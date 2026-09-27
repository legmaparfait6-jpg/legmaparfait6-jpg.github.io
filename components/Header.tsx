"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/content/profile";
import { nav, ui } from "@/content/story";
import { type Lang, otherLang, t } from "@/lib/i18n";

/**
 * En-tête : navigation par section, section active mise en évidence,
 * bouton CV permanent, menu plein écran sur mobile.
 */
export function Header({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const toggleRef = useRef<HTMLButtonElement>(null);

  const isHome = pathname === `/${lang}/` || pathname === `/${lang}`;
  const switchHref = pathname.replace(/^\/(fr|en)/, `/${otherLang(lang)}`);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Section active : celle qui occupe le haut de l'écran.
  useEffect(() => {
    if (!isHome) return;
    const sections = nav
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [isHome]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  const sectionHref = (id: string) => (id === "home" ? `/${lang}/` : `/${lang}/#${id}`);

  return (
    <header className="header" data-scrolled={scrolled || undefined}>
      <div className="container header__inner">
        <Link href={`/${lang}/`} className="brand" aria-label={`${profile.name} — ${t(nav[0]!.label, lang)}`}>
          <span className="brand__mark" aria-hidden="true">
            LP
          </span>
          <span className="brand__name">{profile.name}</span>
        </Link>

        <nav className="nav" aria-label={lang === "fr" ? "Navigation principale" : "Main navigation"}>
          <ul className="nav__list">
            {nav.map((item) => (
              <li key={item.id}>
                <a
                  className="nav__link"
                  href={sectionHref(item.id)}
                  aria-current={isHome && active === item.id ? "true" : undefined}
                >
                  {t(item.label, lang)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header__actions">
          <Link className="lang-switch" href={switchHref} hrefLang={otherLang(lang)} aria-label={t(ui.switchLang, lang)}>
            {otherLang(lang).toUpperCase()}
          </Link>
          <a className="btn btn--cv" href={profile.cv[lang]} download>
            <DownloadIcon />
            {t(ui.cv, lang)}
          </a>
          <button
            ref={toggleRef}
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t(ui.close, lang) : t(ui.menu, lang)}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="menu-toggle__bars" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className="mobile-menu" hidden={!open}>
        <nav aria-label={lang === "fr" ? "Navigation mobile" : "Mobile navigation"}>
          <ul className="mobile-menu__list">
            {nav.map((item, i) => (
              <li key={item.id}>
                <a className="mobile-menu__link" href={sectionHref(item.id)} onClick={() => setOpen(false)}>
                  <span className="meta">{String(i).padStart(2, "0")}</span>
                  {t(item.label, lang)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mobile-menu__foot">
          <a className="btn btn--primary" href={profile.cv[lang]} download>
            <DownloadIcon />
            {t(ui.downloadCv, lang)}
          </a>
          <Link className="btn" href={switchHref} hrefLang={otherLang(lang)}>
            {t(ui.switchLang, lang)}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2v8m0 0 3.2-3.2M8 10 4.8 6.8M3 13.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
