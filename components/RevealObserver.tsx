"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Un seul observateur pour toute la page : chaque élément [data-reveal]
 * reçoit [data-visible] quand il entre à l'écran. Le style est en CSS.
 */
export function RevealObserver() {
  const pathname = usePathname();
  const firstPath = useRef(pathname);

  // Après la première navigation interne, les pages jouent leur transition d'entrée.
  useEffect(() => {
    if (pathname !== firstPath.current) document.documentElement.classList.add("has-navigated");
  }, [pathname]);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-visible])");
    if (!("IntersectionObserver" in window)) {
      elements.forEach((el) => el.setAttribute("data-visible", ""));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
