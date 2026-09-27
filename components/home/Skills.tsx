import { Section } from "@/components/Section";
import { missions } from "@/content/missions";
import { PROOF_LABEL, skillId, skillLayers, skillName } from "@/content/skills";
import { skillsIntro } from "@/content/story";
import { type Lang, t } from "@/lib/i18n";
import { type MapLayer, SystemMap } from "./SystemMap";

export function Skills({ lang }: { lang: Lang }) {
  const layers: MapLayer[] = skillLayers.map((layer) => ({
    id: layer.id,
    label: t(layer.label, lang),
    hint: t(layer.hint, lang),
    skills: layer.skills.map((skill) => ({
      id: skillId(layer.id, skill),
      name: skillName(skill, lang),
      level: skill.level ? t(skill.level, lang) : null,
      proof: skill.proof,
      missions: skill.missions,
    })),
  }));

  return (
    <Section
      id="skills"
      index="04"
      eyebrow={t(skillsIntro.eyebrow, lang)}
      title={t(skillsIntro.title, lang)}
    >
      <SystemMap
        layers={layers}
        missions={missions.map((m) => ({ slug: m.slug, code: m.code, name: m.name, href: `/${lang}/missions/${m.slug}/` }))}
        labels={{
          help: t(skillsIntro.help, lang),
          usedIn: t(skillsIntro.usedIn, lang),
          level: t(skillsIntro.level, lang),
          noMission: t(skillsIntro.noMission, lang),
          proof: {
            mission: t(PROOF_LABEL.mission, lang),
            practiced: t(PROOF_LABEL.practiced, lang),
            notions: t(PROOF_LABEL.notions, lang),
          },
        }}
        initial="services-python"
      />
    </Section>
  );
}
