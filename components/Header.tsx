"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/content/profile";
import { nav, ui } from "@/content/story";
import { emit, on } from "@/lib/bus";
import { type Lang, otherLang, t } from "@/lib/i18n";
import { setSound } from "@/lib/sound";

/**
 * En-tête : navigation par section, section active mise en évidence,
 * bouton CV permanent, menu plein écran sur mobile.
 */
export function Header({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const [sound, setSoundState] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => on("ui:sound", ({ enabled }) => setSoundState(enabled)), []);

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
          <button
            type="button"
            className="icon-btn palette-trigger"
            onClick={() => emit("ui:palette", { open: true })}
            aria-label={lang === "fr" ? "Ouvrir la palette de commandes (Ctrl + K)" : "Open the command palette (Ctrl + K)"}
          >
            <kbd>Ctrl K</kbd>
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-pressed={sound}
            aria-label={lang === "fr" ? "Sons d'interface" : "Interface sounds"}
            onClick={() => setSound(!sound)}
          >
            <SoundIcon on={sound} />
          </button>
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
          <button
            type="button"
            className="btn"
            onClick={() => {
              setOpen(false);
              emit("ui:palette", { open: true });
            }}
          >
            {lang === "fr" ? "Commandes ›_" : "Commands ›_"}
          </button>
        </div>
      </div>
    </header>
  );
}

function SoundIcon({ on: enabled }: { on: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.5 6h2l3-2.5v9L4.5 10h-2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      {enabled ? (
        <path d="M10.2 5.8a3 3 0 0 1 0 4.4M12 4a5.5 5.5 0 0 1 0 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      ) : (
        <path d="m10.5 6.5 3 3m0-3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2v8m0 0 3.2-3.2M8 10 4.8 6.8M3 13.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
