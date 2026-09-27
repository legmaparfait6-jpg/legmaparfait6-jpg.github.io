"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { emit, runtime } from "@/lib/bus";

/**
 * Lien vers une mission : si la scène 3D est active, la caméra plonge dans
 * la grappe de la mission avant la navigation. Sinon, lien classique.
 */
export function DiveLink({ href, slug, className, children }: { href: string; slug: string; className?: string; children: ReactNode }) {
  const router = useRouter();
  return (
    <Link
      href={href}
      className={className}
      onClick={(e) => {
        if (!runtime.net || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        emit("net:dive", { slug });
        window.setTimeout(() => router.push(href), 480);
      }}
    >
      {children}
    </Link>
  );
}
