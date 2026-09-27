import { STATUS_LABEL, missions } from "@/content/missions";
import { skillId, skillLayers, skillName } from "@/content/skills";
import { type Lang, t } from "@/lib/i18n";

/**
 * Graphe du « Réseau Vivant » : chaque nœud principal est une vraie
 * technologie ou une vraie mission, chaque lien une utilisation réelle.
 * Les nœuds d'ambiance (infrastructure décorative) sont générés par le moteur.
 */
export type GraphNode = {
  id: string;
  label: string;
  detail: string;
  kind: "mission" | "skill";
  layer: number;
  missions: string[];
};

export type GraphData = {
  nodes: GraphNode[];
  edges: [number, number][];
  layerCount: number;
  missionSlugs: string[];
};

export function buildGraph(lang: Lang): GraphData {
  const nodes: GraphNode[] = [];
  const edges: [number, number][] = [];
  const missionIndex = new Map<string, number>();

  missions.forEach((m) => {
    missionIndex.set(m.slug, nodes.length);
    nodes.push({
      id: `m:${m.slug}`,
      label: m.name,
      detail: `Mission ${m.code} · ${t(STATUS_LABEL[m.status], lang)}`,
      kind: "mission",
      layer: -1,
      missions: [m.slug],
    });
  });

  // Anneau entre missions : le portfolio forme un seul système.
  for (let i = 0; i < missions.length; i++) edges.push([i, (i + 1) % missions.length]);

  skillLayers.forEach((layer, layerIdx) => {
    let previous = -1;
    layer.skills.forEach((skill) => {
      const index = nodes.length;
      const count = skill.missions.length;
      const usage =
        count === 0
          ? lang === "fr" ? "pas encore en mission" : "not yet in a mission"
          : `${count} mission${count > 1 ? "s" : ""}`;
      nodes.push({
        id: skillId(layer.id, skill),
        label: skillName(skill, lang),
        detail: `${t(layer.label, lang)} · ${usage}`,
        kind: "skill",
        layer: layerIdx,
        missions: skill.missions,
      });
      for (const slug of skill.missions) {
        const target = missionIndex.get(slug);
        if (target !== undefined) edges.push([index, target]);
      }
      // Chaîne dans la couche : la couche est un sous-système cohérent.
      if (previous >= 0) edges.push([previous, index]);
      previous = index;
    });
  });

  return { nodes, edges, layerCount: skillLayers.length, missionSlugs: missions.map((m) => m.slug) };
}
