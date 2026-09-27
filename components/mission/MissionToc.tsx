"use client";

import { useEffect, useState } from "react";

type Item = { id: string; n: number; title: string };

/**
 * Sommaire de la mission : colonne collante sur grand écran, bandeau
 * défilant sous l'en-tête sur mobile. La rubrique lue est mise en évidence.
 */
export function MissionToc({ items, label }: { items: Item[]; label: string }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const sections = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [items]);

  // Sur mobile, la rubrique active reste visible dans le bandeau.
  useEffect(() => {
    const link = document.querySelector<HTMLElement>(`.mission-toc a[href="#${active}"]`);
    const list = link?.closest<HTMLElement>(".mission-toc__list");
    if (link && list && list.scrollWidth > list.clientWidth) {
      list.scrollTo({ left: link.offsetLeft - 16, behavior: "smooth" });
    }
  }, [active]);

  return (
    <nav className="mission-toc" aria-label={label}>
      <ol className="mission-toc__list">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="mission-toc__link" aria-current={active === item.id ? "true" : undefined}>
              <span className="mission-toc__n">{String(item.n).padStart(2, "0")}</span>
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
