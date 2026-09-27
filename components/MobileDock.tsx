"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Lang } from "@/lib/i18n";

/**
 * Barre d'actions mobile : apparaît une fois le hero passé, comme dans une
 * application. Masquée sur grand écran et sur la page CV.
 */
export function MobileDock({ lang, cv }: { lang: Lang; cv: string }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  if (/\/cv\/?$/.test(pathname)) return null;

  const items = [
    { href: `/${lang}/#projects`, label: lang === "fr" ? "Missions" : "Missions", icon: "grid" },
    { href: cv, label: "CV", icon: "download", download: true },
    { href: `/${lang}/#contact`, label: lang === "fr" ? "Contact" : "Contact", icon: "mail" },
  ] as const;

  return (
    <nav className="dock" data-visible={visible || undefined} aria-label={lang === "fr" ? "Actions rapides" : "Quick actions"}>
      {items.map((item) => (
        <a key={item.label} className="dock__item" href={item.href} {...("download" in item ? { download: true } : {})}>
          <DockIcon name={item.icon} />
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  );
}

function DockIcon({ name }: { name: "grid" | "download" | "mail" }) {
  const common = { width: 18, height: 18, viewBox: "0 0 18 18", fill: "none", "aria-hidden": true } as const;
  if (name === "grid")
    return (
      <svg {...common}>
        <rect x="2.5" y="2.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
        <rect x="10.5" y="2.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
        <rect x="2.5" y="10.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
        <rect x="10.5" y="10.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  if (name === "download")
    return (
      <svg {...common}>
        <path d="M9 2.5v9m0 0 3.5-3.5M9 11.5 5.5 8M3 15h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  return (
    <svg {...common}>
      <rect x="2.5" y="4" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="m3.5 5.5 5.5 4 5.5-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
