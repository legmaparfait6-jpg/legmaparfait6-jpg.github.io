"use client";

import { useEffect, useMemo, useState } from "react";
import { emit } from "@/lib/bus";

export type MapSkill = { id: string; name: string; level: string | null; proof: "mission" | "practiced" | "notions"; missions: string[] };
export type MapLayer = { id: string; label: string; hint: string; skills: MapSkill[] };
export type MapMission = { slug: string; code: string; name: string; href: string };

type Labels = {
  help: string;
  usedIn: string;
  level: string;
  noMission: string;
  proof: Record<MapSkill["proof"], string>;
};

/**
 * Carte du système : chaque technologie est reliée aux missions qui
 * l'utilisent. Sélectionner une technologie met en évidence celles qui
 * travaillent avec elle dans les mêmes projets.
 */
export function SystemMap({
  layers,
  missions,
  labels,
  initial,
}: {
  layers: MapLayer[];
  missions: MapMission[];
  labels: Labels;
  initial: string;
}) {
  const [selectedId, setSelectedId] = useState(initial);
  const [touched, setTouched] = useState(false);

  // La sélection allume le nœud correspondant dans la scène 3D (après une
  // première interaction, pour ne pas perturber le démarrage).
  useEffect(() => {
    if (touched) emit("net:focus", { nodeId: selectedId });
  }, [selectedId, touched]);
  useEffect(() => () => emit("net:focus", { nodeId: null }), []);

  const all = useMemo(() => layers.flatMap((l) => l.skills.map((s) => ({ ...s, layer: l.id }))), [layers]);
  const selected = all.find((s) => s.id === selectedId) ?? all[0]!;
  const related = useMemo(() => {
    const set = new Set<string>();
    if (selected.missions.length === 0) return set;
    for (const s of all) {
      if (s.id !== selected.id && s.missions.some((m) => selected.missions.includes(m))) set.add(s.id);
    }
    return set;
  }, [all, selected]);
  const activeLayers = useMemo(
    () => new Set(all.filter((s) => s.id === selected.id || related.has(s.id)).map((s) => s.layer)),
    [all, selected, related],
  );
  const usedIn = missions.filter((m) => selected.missions.includes(m.slug));

  return (
    <div className="sysmap" data-selecting="">
      <div className="sysmap__layers" data-reveal="">
        <p className="sr-only">{labels.help}</p>
        {layers.map((layer) => (
          <div key={layer.id} className="sysmap__layer" data-active={activeLayers.has(layer.id) || undefined}>
            <div className="sysmap__label">
              <span className="sysmap__name">{layer.label}</span>
              <span className="sysmap__hint">{layer.hint}</span>
            </div>
            <div className="sysmap__chips" role="group" aria-label={layer.label}>
              {layer.skills.map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  className="chip"
                  data-proof={skill.proof}
                  data-related={related.has(skill.id) || undefined}
                  aria-pressed={skill.id === selected.id}
                  aria-controls="sysmap-panel"
                  onClick={() => {
                    setTouched(true);
                    setSelectedId(skill.id);
                  }}
                >
                  <span className="chip__proof" aria-hidden="true" />
                  {skill.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <aside id="sysmap-panel" className="sysmap__panel" aria-live="polite" data-reveal="">
        <p className="meta">{labels.help}</p>
        <p className="sysmap__selected">{selected.name}</p>

        <p className={`status ${selected.proof === "mission" ? "status--delivered" : ""}`}>
          <span className={`dot ${selected.proof === "mission" ? "dot--signal" : ""}`} aria-hidden="true" />
          {labels.proof[selected.proof]}
        </p>

        {selected.level ? (
          <div className="sysmap__row">
            <span className="meta">{labels.level}</span>
            <strong>{selected.level}</strong>
          </div>
        ) : null}

        <div className="sysmap__row">
          <span className="meta">{labels.usedIn}</span>
          {usedIn.length > 0 ? (
            <div className="sysmap__missions">
              {usedIn.map((m) => (
                <a key={m.slug} className="sysmap__mission" href={m.href}>
                  <span>
                    <span className="meta">{m.code}</span> · {m.name}
                  </span>
                  <span aria-hidden="true">→</span>
                </a>
              ))}
            </div>
          ) : (
            <p className="note">{labels.noMission}</p>
          )}
        </div>

        <div className="sysmap__legend" aria-hidden="true">
          <span>
            <i className="legend-proof legend-proof--mission" />
            {labels.proof.mission}
          </span>
          <span>
            <i className="legend-proof" />
            {labels.proof.practiced}
          </span>
          <span>
            <i className="legend-proof legend-proof--notions" />
            {labels.proof.notions}
          </span>
        </div>
      </aside>
    </div>
  );
}
