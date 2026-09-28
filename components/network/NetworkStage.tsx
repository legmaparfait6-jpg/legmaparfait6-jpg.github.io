"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { GraphData, GraphNode } from "@/content/graph";
import { emit, on, runtime } from "@/lib/bus";
import { play } from "@/lib/sound";
import type { Formation, NetworkEngine } from "./engine";
import type { PortraitData } from "./portrait-build";

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
 * Visage en particules. Leur nombre suit la puissance de l'appareil :
 * téléphone, processeur modeste ou ordinateur récent. Le calcul se fait dans
 * un Worker ; à défaut, sur le fil principal.
 */
async function loadPortrait(mobile: boolean): Promise<PortraitData | null> {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const modest = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
  // Trame du visage (écart en pixels de la photo) et finesse du relief.
  const spacing = mobile ? 1.9 : modest ? 1.6 : 1.3;
  const cols = mobile ? 110 : modest ? 130 : 150;
  const fromWorker = await new Promise<PortraitData | null | undefined>((resolve) => {
    if (typeof Worker === "undefined" || typeof OffscreenCanvas === "undefined") return resolve(undefined);
    try {
      const worker = new Worker(new URL("./portrait-worker.ts", import.meta.url), { type: "module" });
      worker.onmessage = (e: MessageEvent<PortraitData | null>) => {
        resolve(e.data ?? undefined);
        worker.terminate();
      };
      worker.onerror = () => {
        resolve(undefined);
        worker.terminate();
      };
      worker.postMessage({ spacing, cols });
    } catch {
      resolve(undefined);
    }
  });
  if (fromWorker) return fromWorker;
  try {
    const { buildPortrait, loadPortraitPixels } = await import("./portrait-build");
    const rig = await fetch("/profile/portrait-rig.json").then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))));
    return buildPortrait(rig, await loadPortraitPixels(rig), spacing, cols);
  } catch {
    return null; // sans portrait, la scène reste complète
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
      document.documentElement.dataset.net = "off"; // la photo remplace le visage 3D
      emit("net:ready", { enabled: false });
      return;
    }
    let disposed = false;
    const mobile = window.innerWidth < 768;
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

        // Visage en particules : maillage (≈ 40 Ko compressé) + photo déjà publiée.
        // Nombre de particules selon l'appareil.
        void loadPortrait(mobile).then((data) => {
          if (disposed || !data) return;
          engine.setPortrait(data);
          engine.setAnchor(document.querySelector<HTMLElement>("[data-portrait-anchor]"));
          document.documentElement.dataset.portrait = "";
        });
      });
    };
    // La scène ne concurrence jamais le premier affichage : elle démarre après
    // le chargement complet de la page, puis quand le navigateur est libre.
    // Sur mobile (processeur plus lent), elle attend davantage.
    // Safari n'a pas requestIdleCallback : repli sur un délai.
    const idle = typeof window.requestIdleCallback === "function";
    let timer = 0;
    let idleHandle = 0;
    const schedule = () => {
      timer = window.setTimeout(
        () => {
          if (idle) idleHandle = window.requestIdleCallback(load, { timeout: 2000 });
          else load();
        },
        mobile ? 2500 : 600,
      );
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

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
      window.removeEventListener("load", schedule);
      window.clearTimeout(timer);
      if (idleHandle) window.cancelIdleCallback(idleHandle);
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
      engine.setState({ formation: "mission", opacity: 0.2, slug: mission[1] });
      return;
    }

    engine.setState({ formation: "galaxy", opacity: 1, portrait: true });
    const sections = Object.keys(SECTION_STATE)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const [formation, opacity] = SECTION_STATE[entry.target.id]!;
          engine.setState({ formation, opacity, portrait: entry.target.id === "home" });
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
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") engine.look(e.clientX, e.clientY);
    };
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
    // Le cadre du visage n'existe que sur l'accueil.
    engine.setAnchor(document.querySelector<HTMLElement>("[data-portrait-anchor]"));
    const onResize = () => engine.resize();
    const onVisibility = () => (document.hidden ? engine.stop() : engine.start());

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("click", onClick);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      offs.forEach((off) => off());
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
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
