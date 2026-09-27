"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { GraphData, GraphNode } from "@/content/graph";
import { emit, on, runtime } from "@/lib/bus";
import { play } from "@/lib/sound";
import type { Formation, NetworkEngine } from "./engine";

/** Formation et intensité de la scène pour chaque section de l'accueil. */
const SECTION_STATE: Record<string, [Formation, number]> = {
  home: ["galaxy", 1],
  about: ["galaxy", 0.4],
  method: ["galaxy", 0.4],
  live: ["live", 1],
  skills: ["layers", 0.55],
  projects: ["clusters", 0.5],
  ai: ["galaxy", 0.35],
  mobile: ["galaxy", 0.35],
  journey: ["galaxy", 0.35],
  contact: ["finale", 0.95],
};

const INTERACTIVE = "a, button, input, p, h1, h2, h3, li, dd, dt, figure, .trace, .sysmap__panel, .live__log, .cv";

function canRun3D(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData) return false;
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 2) return false;
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

/**
 * Scène 3D persistante (montée dans le layout : elle survit aux changements
 * de page). Chargée après l'affichage du contenu, jamais si le mouvement est
 * réduit, en économie de données ou sans WebGL 2.
 */
export function NetworkStage({ graph }: { graph: GraphData }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<NetworkEngine | null>(null);
  const hoveredRef = useRef<GraphNode | null>(null);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Chargement différé du moteur.
  useEffect(() => {
    if (!canRun3D()) {
      emit("net:ready", { enabled: false });
      return;
    }
    let disposed = false;
    const load = () => {
      void import("./engine").then(({ NetworkEngine }) => {
        const canvas = canvasRef.current;
        if (disposed || !canvas) return;
        const engine = new NetworkEngine(canvas, graph, {
          mobile: window.innerWidth < 768,
          onHover: (node) => {
            hoveredRef.current = node;
            emit("net:hover", node ? { label: node.label, detail: node.detail } : null);
            if (node) play("tick");
          },
        });
        engineRef.current = engine;
        engine.start();
        runtime.net = true;
        setReady(true);
        emit("net:ready", { enabled: true });
      });
    };
    // Safari n'a pas requestIdleCallback : repli sur un court délai.
    const idle = typeof window.requestIdleCallback === "function";
    const handle = idle ? window.requestIdleCallback(load, { timeout: 1200 }) : window.setTimeout(load, 250);

    const onLost = (e: Event) => {
      e.preventDefault();
      engineRef.current?.stop();
      runtime.net = false;
      setReady(false);
    };
    const canvas = canvasRef.current;
    canvas?.addEventListener("webglcontextlost", onLost);

    return () => {
      disposed = true;
      if (idle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      canvas?.removeEventListener("webglcontextlost", onLost);
      engineRef.current?.dispose();
      engineRef.current = null;
      runtime.net = false;
    };
  }, [graph]);

  // Formation selon la page et la section lue.
  useEffect(() => {
    const engine = engineRef.current;
    if (!ready || !engine) return;

    if (/\/cv\/?$/.test(pathname)) {
      engine.setState({ formation: "galaxy", opacity: 0 });
      return;
    }
    const mission = pathname.match(/\/missions\/([^/]+)/);
    if (mission) {
      engine.setState({ formation: "mission", opacity: 0.3, slug: mission[1] });
      return;
    }

    engine.setState({ formation: "galaxy", opacity: 1 });
    const sections = Object.keys(SECTION_STATE)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const [formation, opacity] = SECTION_STATE[entry.target.id]!;
          engine.setState({ formation, opacity });
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [pathname, ready]);

  // Liaison interface → scène.
  useEffect(() => {
    if (!ready) return;
    const engine = engineRef.current!;
    const offs = [
      on("net:focus", ({ nodeId }) => engine.focus(nodeId)),
      on("net:incident", ({ phase }) => engine.setIncident(phase)),
      on("net:dive", ({ slug }) => engine.dive(slug)),
      on("net:burst", ({ x, y }) => engine.burst(x, y)),
    ];

    const fine = window.matchMedia("(pointer: fine)").matches;
    const onMove = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      engine.setPointer(e.clientX, e.clientY, fine && !target?.closest(INTERACTIVE));
    };
    const onLeave = () => engine.setPointer(0, 0, false);
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest(".btn, .chip, .finale__cta, .copy-btn, .chain__item")) {
        engine.burst(e.clientX, e.clientY);
        return;
      }
      // Clic sur un nœud de mission : plongée puis ouverture de la mission.
      const node = hoveredRef.current;
      if (node?.kind === "mission" && !target?.closest(INTERACTIVE)) {
        const slug = node.missions[0]!;
        const lang = pathname.split("/")[1] ?? "fr";
        engine.dive(slug);
        play("open");
        window.setTimeout(() => router.push(`/${lang}/missions/${slug}/`), 520);
      }
    };
    const onResize = () => engine.resize();
    const onVisibility = () => (document.hidden ? engine.stop() : engine.start());

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("click", onClick);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      offs.forEach((off) => off());
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ready, pathname, router]);

  return (
    <div className="net-stage" data-on={ready || undefined} aria-hidden="true">
      <canvas ref={canvasRef} className="net-stage__canvas" />
    </div>
  );
}
