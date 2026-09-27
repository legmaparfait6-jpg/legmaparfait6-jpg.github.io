"use client";

import { useEffect } from "react";
import { initSound, play } from "@/lib/sound";

/** Restaure la préférence son et ajoute un retour sonore discret aux clics. */
export function SoundInit() {
  useEffect(() => {
    initSound();
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement | null)?.closest("a, button")) play("click");
    };
    window.addEventListener("click", onClick, { capture: true });
    return () => window.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
