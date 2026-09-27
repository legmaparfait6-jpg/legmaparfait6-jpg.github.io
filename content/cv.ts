import type { L } from "@/lib/i18n";

/**
 * Contenu du CV (une page A4, lisible par les ATS). Les faits proviennent des
 * mêmes sources que les missions du portfolio.
 * Dans les puces, **texte** est mis en gras (éléments clés, lus en premier).
 */

export type CvSkill = { name: string | L; level?: L };

const VERY_GOOD: L = { fr: "très bon", en: "very good" };
const GOOD: L = { fr: "bon", en: "good" };
const INTERMEDIATE: L = { fr: "intermédiaire", en: "intermediate" };
const BASICS: L = { fr: "notions", en: "basics" };

export const cv = {
  headings: {
    profile: { fr: "Profil", en: "Profile" },
    experience: { fr: "Expérience", en: "Experience" },
    projects: { fr: "Projets", en: "Projects" },
    skills: { fr: "Compétences", en: "Skills" },
    contact: { fr: "Contact", en: "Contact" },
    education: { fr: "Formation", en: "Education" },
    certifications: { fr: "Certification", en: "Certification" },
    languages: { fr: "Langues", en: "Languages" },
    portfolio: { fr: "Portfolio", en: "Portfolio" },
    ats: { fr: "Version ATS (PDF)", en: "ATS version (PDF)" },
  } satisfies Record<string, L>,

  tagline: {
    fr: "Je construis des systèmes, pas seulement des interfaces.",
    en: "I build systems, not just interfaces.",
  } satisfies L,

  profile: {
    fr: "Développeur Full-Stack en dernière année de Licence d'Informatique de Gestion. En stage chez Moov Africa, conception d'une application de supervision réseau complète : découverte des équipements, collecte SNMP, tickets avec SLA et escalade automatique. Créateur de FasoCommerce, plateforme SaaS modulaire en pré-lancement (15 modules, 207 tests backend). Intègre l'IA et l'automatisation là où elles apportent une vraie valeur.",
    en: "Full-stack developer in the final year of a Business Computing degree. During an internship at Moov Africa, designed a complete network monitoring application: device discovery, SNMP collection, SLA-driven tickets and automatic escalation. Creator of FasoCommerce, a modular SaaS platform in pre-launch (15 modules, 207 backend tests). Brings in AI and automation where they add real value.",
  } satisfies L,

  experience: [
    {
      role: { fr: "Stagiaire développeur — supervision réseau", en: "Developer intern — network monitoring" },
      org: "Moov Africa",
      place: "Ouagadougou",
      period: { fr: "Stage de fin de Licence", en: "Final-year internship" } as L,
      bullets: [
        {
          fr: "Conception et développement d'une **application web de supervision réseau** en **Python / Flask** (SQLAlchemy, MySQL).",
          en: "Designed and built a **network monitoring web application** in **Python / Flask** (SQLAlchemy, MySQL).",
        },
        {
          fr: "**Découverte automatique** des équipements (Nmap, ping ICMP parallélisé) et **collecte SNMP** : disponibilité, latence, CPU, RAM, interfaces.",
          en: "**Automatic discovery** of devices (Nmap, parallel ICMP ping) and **SNMP collection**: availability, latency, CPU, RAM, interfaces.",
        },
        {
          fr: "Cycle d'incident complet : alertes par seuils, tickets avec **SLA par priorité**, **escalade automatique** sur trois niveaux, notifications e-mail.",
          en: "Full incident lifecycle: threshold alerts, tickets with **per-priority SLAs**, **automatic escalation** over three levels, email notifications.",
        },
        {
          fr: "Rapports **SLA / MTTR** en CSV et PDF ; tâches planifiées (supervision, sauvegarde, rétention). Validée en environnement de laboratoire.",
          en: "**SLA / MTTR** reports in CSV and PDF; scheduled jobs (monitoring, backups, retention). Validated in a lab environment.",
        },
      ] satisfies L[],
    },
  ],

  projects: [
    {
      name: "FasoCommerce",
      status: { fr: "Pré-lancement", en: "Pre-launch" } as L,
      desc: { fr: "Plateforme SaaS de gestion pour commerces et services", en: "SaaS management platform for shops and services" },
      stack: "Next.js · TypeScript · FastAPI · PostgreSQL · Docker",
      period: { fr: "Depuis juin 2026", en: "Since June 2026" } as L | null,
      metrics: [
        { fr: "15 modules", en: "15 modules" },
        { fr: "13 profils métier", en: "13 trade profiles" },
        { fr: "207 tests backend", en: "207 backend tests" },
      ] satisfies L[],
      bullets: [
        {
          fr: "**Monolithe modulaire** : chaque commerce active les modules de son métier (restaurant, pressing, auto-école, garage…).",
          en: "**Modular monolith**: each business turns on the modules its trade needs (restaurant, dry cleaning, driving school, garage…).",
        },
        {
          fr: "**Caisse hors ligne**, paiement **Mobile Money**, commandes WhatsApp ; tests **end-to-end et d'accessibilité**, intégration continue.",
          en: "**Offline point of sale**, **Mobile Money** payment, WhatsApp orders; **end-to-end and accessibility** tests, continuous integration.",
        },
      ] satisfies L[],
    },
    {
      name: "ForexSaaS",
      status: { fr: "En pause", en: "Paused" } as L,
      desc: { fr: "Outil d'aide à la décision sur données de marché", en: "Decision-support tool on market data" },
      stack: "Python · FastAPI · pandas · Celery · Next.js",
      period: null as L | null,
      metrics: [
        { fr: "3 sources de données", en: "3 data sources" },
        { fr: "5 analyseurs", en: "5 analysers" },
      ] satisfies L[],
      bullets: [
        {
          fr: "Chaîne **collecte → analyse → scoring → alertes** (Twelve Data, FRED, Finnhub), tâches Celery découplées.",
          en: "**Collection → analysis → scoring → alerts** pipeline (Twelve Data, FRED, Finnhub), decoupled Celery jobs.",
        },
        {
          fr: "Scores de confluence et de confiance, calcul du risque par paire, **backtesting** sur données historiques.",
          en: "Confluence and confidence scores, per-pair risk calculation, **backtesting** on historical data.",
        },
      ] satisfies L[],
    },
    {
      name: "Taxi Compteur",
      status: { fr: "Projet académique", en: "Academic project" } as L,
      desc: { fr: "Application mobile de courses en temps réel", en: "Real-time ride-hailing mobile app" },
      stack: "Flutter · Firebase",
      period: null as L | null,
      metrics: [] as L[],
      bullets: [
        {
          fr: "Modes client et chauffeur, **suivi GPS**, tarif calculé selon la distance, synchronisation **temps réel** Firebase.",
          en: "Customer and driver modes, **GPS tracking**, distance-based fare, **real-time** Firebase sync.",
        },
      ] satisfies L[],
    },
  ],

  skills: [
    {
      group: { fr: "Backend", en: "Backend" },
      items: [
        { name: "Python", level: VERY_GOOD },
        { name: "FastAPI" },
        { name: "Flask" },
        { name: "Laravel", level: INTERMEDIATE },
        { name: { fr: "API REST", en: "REST APIs" } },
        { name: "JWT" },
      ],
    },
    {
      group: { fr: "Frontend", en: "Frontend" },
      items: [
        { name: "JavaScript", level: GOOD },
        { name: "TypeScript" },
        { name: "React", level: INTERMEDIATE },
        { name: "Next.js", level: INTERMEDIATE },
        { name: "Angular", level: INTERMEDIATE },
        { name: "HTML / CSS" },
        { name: "WordPress" },
      ],
    },
    {
      group: { fr: "Mobile", en: "Mobile" },
      items: [{ name: "Flutter" }, { name: "Firebase" }, { name: "Ionic", level: BASICS }],
    },
    {
      group: { fr: "Données", en: "Data" },
      items: [{ name: "PostgreSQL" }, { name: "MySQL" }, { name: "SQL" }, { name: "Redis" }, { name: "pandas" }],
    },
    {
      group: { fr: "DevOps et qualité", en: "DevOps and quality" },
      items: [
        { name: "Git" },
        { name: "GitHub Actions" },
        { name: "Docker" },
        { name: "pytest" },
        { name: "Playwright" },
        { name: "Vercel / Netlify" },
      ],
    },
    {
      group: { fr: "Réseaux", en: "Networking" },
      items: [{ name: "Nmap" }, { name: "SNMP" }, { name: "ICMP" }, { name: "TCP/IP" }],
    },
    {
      group: { fr: "IA et automatisation", en: "AI and automation" },
      items: [
        { name: { fr: "Tâches planifiées", en: "Scheduled jobs" } },
        { name: { fr: "Analyse de données", en: "Data analysis" } },
        { name: { fr: "Intégration d'API", en: "API integration" } },
      ],
    },
  ] satisfies { group: L; items: CvSkill[] }[],
};
