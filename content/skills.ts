import type { L } from "@/lib/i18n";

/**
 * Cartographie des compétences.
 * - level : niveau déclaré (uniquement quand il a été fourni).
 * - missions : slugs des missions où la technologie est réellement utilisée.
 * - proof : "mission" (démontré dans un projet présenté), "practiced" (pratiqué,
 *   sans projet présenté ici), "notions".
 */
export type Proof = "mission" | "practiced" | "notions";

export type Skill = {
  name: string | L;
  level?: L;
  proof: Proof;
  missions: string[];
};

export type SkillLayer = { id: string; label: L; hint: L; skills: Skill[] };

const VERY_GOOD: L = { fr: "Très bon", en: "Very good" };
const GOOD: L = { fr: "Bon", en: "Good" };
const INTERMEDIATE: L = { fr: "Intermédiaire", en: "Intermediate" };

const SUP = "network-supervision";
const FC = "fasocommerce";
const FX = "forexsaas";
const FD = "fasodigit";
const TX = "taxi-compteur";

export const PROOF_LABEL: Record<Proof, L> = {
  mission: { fr: "Utilisé en mission", en: "Used in a mission" },
  practiced: { fr: "Pratiqué", en: "Practised" },
  notions: { fr: "Notions", en: "Basics" },
};

export const skillName = (skill: Skill, lang: "fr" | "en") =>
  typeof skill.name === "string" ? skill.name : skill.name[lang];

export const skillLayers: SkillLayer[] = [
  {
    id: "interface",
    label: { fr: "Interface", en: "Interface" },
    hint: { fr: "Ce que l'utilisateur voit et touche", en: "What users see and touch" },
    skills: [
      { name: "HTML / CSS", proof: "mission", missions: [SUP, FC, FD] },
      { name: "JavaScript", level: GOOD, proof: "mission", missions: [FD, FC] },
      { name: "TypeScript", proof: "mission", missions: [FC] },
      { name: "React", level: INTERMEDIATE, proof: "mission", missions: [FC, FX] },
      { name: "Next.js", level: INTERMEDIATE, proof: "mission", missions: [FC, FX] },
      { name: "Tailwind CSS", proof: "mission", missions: [FC, FX] },
      { name: "Angular", level: INTERMEDIATE, proof: "practiced", missions: [] },
    ],
  },
  {
    id: "services",
    label: { fr: "Services & API", en: "Services & APIs" },
    hint: { fr: "La logique métier et les contrats d'échange", en: "Business logic and data contracts" },
    skills: [
      { name: "Python", level: VERY_GOOD, proof: "mission", missions: [SUP, FC, FX] },
      { name: "FastAPI", proof: "mission", missions: [FC, FX] },
      { name: "Flask", proof: "mission", missions: [SUP] },
      { name: "API REST", proof: "mission", missions: [FC, FX] },
      { name: "Auth JWT", proof: "mission", missions: [FC, FX] },
      { name: "Celery", proof: "mission", missions: [FC, FX] },
      { name: "Laravel", level: INTERMEDIATE, proof: "practiced", missions: [] },
      { name: "Django", proof: "notions", missions: [FD] },
    ],
  },
  {
    id: "data",
    label: { fr: "Données", en: "Data" },
    hint: { fr: "Stocker, versionner, interroger", en: "Store, version, query" },
    skills: [
      { name: "SQL", proof: "mission", missions: [SUP, FC, FX] },
      { name: "PostgreSQL", proof: "mission", missions: [FC, FX] },
      { name: "MySQL", proof: "mission", missions: [SUP] },
      { name: "SQLAlchemy", proof: "mission", missions: [SUP, FC, FX] },
      { name: "Alembic", proof: "mission", missions: [FC, FX] },
      { name: "Redis", proof: "mission", missions: [FC, FX] },
      { name: "pandas", proof: "mission", missions: [FX] },
    ],
  },
  {
    id: "mobile",
    label: { fr: "Mobile", en: "Mobile" },
    hint: { fr: "L'application dans la poche", en: "The app in your pocket" },
    skills: [
      { name: "Flutter", proof: "mission", missions: [TX] },
      { name: "Firebase", proof: "mission", missions: [TX] },
      { name: "Ionic", proof: "notions", missions: [] },
    ],
  },
  {
    id: "network",
    label: { fr: "Réseau", en: "Network" },
    hint: { fr: "Voir ce qui se passe sous l'application", en: "See what happens beneath the app" },
    skills: [
      { name: "Nmap", proof: "mission", missions: [SUP] },
      { name: "SNMP", proof: "mission", missions: [SUP] },
      { name: "ICMP", proof: "mission", missions: [SUP] },
      { name: "TCP/IP", proof: "mission", missions: [SUP] },
    ],
  },
  {
    id: "delivery",
    label: { fr: "Livraison", en: "Delivery" },
    hint: { fr: "Tester, versionner, déployer", en: "Test, version, ship" },
    skills: [
      { name: "Git / GitHub", proof: "mission", missions: [SUP, FC] },
      { name: "GitHub Actions", proof: "mission", missions: [FC] },
      { name: "Docker", proof: "mission", missions: [FC, FX] },
      { name: "pytest", proof: "mission", missions: [FC, FX] },
      { name: "Playwright", proof: "mission", missions: [FC] },
      { name: "Vercel / Netlify", proof: "practiced", missions: [] },
      { name: "WordPress", proof: "practiced", missions: [] },
    ],
  },
  {
    id: "intelligence",
    label: { fr: "Intelligence", en: "Intelligence" },
    hint: { fr: "Automatiser et analyser là où c'est utile", en: "Automate and analyse where it helps" },
    skills: [
      { name: { fr: "Automatisation planifiée", en: "Scheduled automation" }, proof: "mission", missions: [SUP, FX] },
      { name: { fr: "Analyse de données", en: "Data analysis" }, proof: "mission", missions: [FX] },
      { name: "Scoring", proof: "mission", missions: [FX] },
      { name: { fr: "APIs de données", en: "Data APIs" }, proof: "mission", missions: [FX] },
      { name: { fr: "APIs IA", en: "AI APIs" }, proof: "practiced", missions: [] },
    ],
  },
];
