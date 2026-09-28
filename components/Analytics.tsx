"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef } from "react";

type GoatCounter = { count: (vars: { path: string; title?: string; event?: boolean }) => void };
declare global {
  interface Window {
    goatcounter?: GoatCounter & { no_onload?: boolean };
  }
}

/**
 * Mesure d'audience anonyme (GoatCounter) : pas de cookie, pas de donnée
 * personnelle, donc pas de bandeau de consentement.
 * Compte les pages vues (y compris les navigations internes) et les
 * téléchargements du CV. Inactif tant qu'aucun code n'est configuré.
 */
export function Analytics({ code }: { code: string }) {
  const pathname = usePathname();
  const first = useRef(true);

  // Navigations internes : le script ne voit que le premier chargement.
  useEffect(() => {
    if (!code) return;
    if (first.current) {
      first.current = false;
      return;
    }
    window.goatcounter?.count({ path: pathname, title: document.title });
  }, [code, pathname]);

  // Téléchargements du CV, comptés comme des événements.
  useEffect(() => {
    if (!code) return;
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>("a[href$='.pdf']");
      if (link) window.goatcounter?.count({ path: `cv-download${new URL(link.href).pathname}`, title: "CV", event: true });
    };
    window.addEventListener("click", onClick, { capture: true });
    return () => window.removeEventListener("click", onClick, { capture: true });
  }, [code]);

  if (!code) return null;
  return (
    <Script
      src="https://gc.zgo.at/count.js"
      data-goatcounter={`https://${code}.goatcounter.com/count`}
      // Chargé une fois la page au repos : jamais en concurrence avec l'affichage.
      strategy="lazyOnload"
    />
  );
}
