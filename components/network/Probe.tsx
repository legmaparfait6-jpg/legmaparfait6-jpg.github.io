"use client";

import { useEffect, useRef, useState } from "react";
import { on } from "@/lib/bus";

/**
 * Sonde : quand le pointeur survole un nœud du réseau, une étiquette affiche
 * ce qu'il représente réellement (technologie, couche, missions).
 * Le curseur natif est conservé.
 */
export function Probe() {
  const ref = useRef<HTMLDivElement>(null);
  const [info, setInfo] = useState<{ label: string; detail: string } | null>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const offHover = on("net:hover", setInfo);
    let x = 0;
    let y = 0;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (ref.current) ref.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      offHover();
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="probe" data-visible={info ? "" : undefined} aria-hidden="true">
      <span className="probe__ring" />
      {info ? (
        <span className="probe__card">
          <span className="probe__label">{info.label}</span>
          <span className="probe__detail">{info.detail}</span>
        </span>
      ) : null}
    </div>
  );
}
