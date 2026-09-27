/**
 * Bus d'événements entre l'interface et la scène 3D.
 * L'interface n'importe jamais le moteur (chargé à la demande) : elle émet
 * des événements, le moteur les écoute s'il est présent.
 */

export type IncidentPhase = "idle" | "probe" | "down" | "alert" | "ticket" | "escalate" | "recover" | "resolved";

export type BusEvents = {
  "net:focus": { nodeId: string | null };
  "net:burst": { x: number; y: number };
  "net:dive": { slug: string };
  "net:incident": { phase: IncidentPhase };
  "net:hover": { label: string; detail: string } | null;
  "net:ready": { enabled: boolean };
  "ui:palette": { open: boolean };
  "ui:sound": { enabled: boolean };
  "ui:incident": { replay: true };
  "voice:play": { id: string };
  "voice:state": { id: string | null; playing: boolean; line: number; progress: number };
  "voice:guided": { enabled: boolean };
};

/**
 * État partagé minimal : la scène 3D est-elle active ? Ouverture de la bouche
 * (0 à 1) et forme des lèvres (0 arrondies, 1 étirées) pendant une annonce ;
 * une transmission est-elle en cours ?
 */
export const runtime = { net: false, voiceLevel: 0, mouthShape: 0.5, voiceActive: false };

type Name = keyof BusEvents;

export function emit<N extends Name>(name: N, detail: BusEvents[N]): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function on<N extends Name>(name: N, handler: (detail: BusEvents[N]) => void): () => void {
  const listener = (e: Event) => handler((e as CustomEvent<BusEvents[N]>).detail);
  window.addEventListener(name, listener);
  return () => window.removeEventListener(name, listener);
}
