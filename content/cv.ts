import type { L } from "@/lib/i18n";

/**
 * Contenu du CV (une page A4, lisible par les ATS). Les faits proviennent des
 * mêmes sources que les missions du portfolio.
 */

export const cv = {
  headings: {
    profile: { fr: "Profil", en: "Profile" },
    experience: { fr: "Expérience", en: "Experience" },
    projects: { fr: "Projets", en: "Projects" },
    skills: { fr: "Compétences", en: "Skills" },
    education: { fr: "Formation", en: "Education" },
    certifications: { fr: "Certifications", en: "Certifications" },
    languages: { fr: "Langues", en: "Languages" },
  } satisfies Record<string, L>,

  profile: {
    fr: "Étudiant en Licence 3 d'Informatique de Gestion, orienté développement Full-Stack et intégration de solutions IA. Expérience pratique dans la conception de solutions web et de supervision réseau, avec un intérêt particulier pour les applications SaaS, l'automatisation et la transformation de problématiques métier en solutions numériques.",
    en: "Final-year Business Computing student focused on full-stack development and AI integration. Hands-on experience designing web and network monitoring solutions, with a strong interest in SaaS applications, automation and turning business problems into digital solutions.",
  } satisfies L,

  experience: [
    {
      role: { fr: "Stagiaire développeur — supervision réseau", en: "Developer intern — network monitoring" },
      org: "Moov Africa",
      place: "Ouagadougou",
      period: null as L | null,
      bullets: [
        {
          fr: "Conception et développement d'une application web de supervision réseau en Python / Flask (SQLAlchemy, MySQL).",
          en: "Designed and built a network monitoring web application in Python / Flask (SQLAlchemy, MySQL).",
        },
        {
          fr: "Découverte automatique des équipements (Nmap, ping ICMP parallélisé) et collecte SNMP : disponibilité, latence, CPU, RAM, interfaces.",
          en: "Automatic device discovery (Nmap, parallel ICMP ping) and SNMP collection: availability, latency, CPU, RAM, interfaces.",
        },
        {
          fr: "Cycle d'incident complet : alertes par seuils, tickets avec SLA par priorité, escalade automatique sur trois niveaux, notifications e-mail.",
          en: "Full incident lifecycle: threshold alerts, tickets with per-priority SLAs, automatic three-level escalation, email notifications.",
        },
        {
          fr: "Rapports SLA / MTTR exportables en CSV et PDF ; tâches planifiées pour la supervision, la sauvegarde et la rétention des données. Application validée en environnement de laboratoire.",
          en: "SLA / MTTR reports exported to CSV and PDF; scheduled jobs for monitoring, backups and data retention. Application validated in a lab environment.",
        },
      ] satisfies L[],
    },
  ],

  projects: [
    {
      name: "FasoCommerce",
      desc: { fr: "Plateforme SaaS de gestion pour commerces et services (pré-lancement)", en: "SaaS management platform for shops and services (pre-launch)" },
      stack: "Next.js · TypeScript · FastAPI · PostgreSQL · Docker",
      period: { fr: "Depuis juin 2026", en: "Since June 2026" } as L | null,
      bullets: [
        {
          fr: "Architecture en monolithe modulaire : 15 modules activables selon le métier (commerce, restaurant, pressing, auto-école, garage).",
          en: "Modular monolith architecture: 15 modules switched on per trade (retail, restaurant, dry cleaning, driving school, garage).",
        },
        {
          fr: "Caisse utilisable hors ligne, paiement Mobile Money, commandes WhatsApp, tickets pour imprimante thermique.",
          en: "Offline-capable point of sale, Mobile Money payment, WhatsApp orders, thermal printer receipts.",
        },
        {
          fr: "Qualité : 207 tests backend (pytest), tests end-to-end et d'accessibilité (Playwright), intégration continue (GitHub Actions).",
          en: "Quality: 207 backend tests (pytest), end-to-end and accessibility tests (Playwright), continuous integration (GitHub Actions).",
        },
      ] satisfies L[],
    },
    {
      name: "ForexSaaS",
      desc: { fr: "Outil d'aide à la décision sur données de marché", en: "Decision-support tool on market data" },
      stack: "Python · FastAPI · pandas · Celery · Next.js",
      period: null as L | null,
      bullets: [
        {
          fr: "Chaîne collecte → analyse → scoring → alertes, alimentée par trois sources de données (Twelve Data, FRED, Finnhub).",
          en: "Collection → analysis → scoring → alerts pipeline fed by three data sources (Twelve Data, FRED, Finnhub).",
        },
        {
          fr: "Scores de confluence et de confiance, calcul du risque par paire de devises, backtesting sur données historiques.",
          en: "Confluence and confidence scores, per-pair risk calculation, backtesting on historical data.",
        },
      ] satisfies L[],
    },
    {
      name: "Taxi Compteur",
      desc: { fr: "Application mobile (projet académique)", en: "Mobile app (academic project)" },
      stack: "Flutter · Firebase",
      period: null as L | null,
      bullets: [
        {
          fr: "Courses en temps réel entre clients et chauffeurs, suivi GPS, tarif calculé selon la distance.",
          en: "Real-time rides between customers and drivers, GPS tracking, distance-based fare.",
        },
      ] satisfies L[],
    },
  ],

  skills: [
    {
      group: { fr: "Backend", en: "Backend" },
      items: {
        fr: "Python (très bon), Flask, FastAPI, Laravel (intermédiaire), API REST, authentification JWT, SQLAlchemy, Celery",
        en: "Python (very good), Flask, FastAPI, Laravel (intermediate), REST APIs, JWT authentication, SQLAlchemy, Celery",
      },
    },
    {
      group: { fr: "Frontend", en: "Frontend" },
      items: {
        fr: "JavaScript (bon), TypeScript, React, Next.js, Angular (intermédiaire), HTML, CSS, Tailwind CSS",
        en: "JavaScript (good), TypeScript, React, Next.js, Angular (intermediate), HTML, CSS, Tailwind CSS",
      },
    },
    {
      group: { fr: "Mobile", en: "Mobile" },
      items: { fr: "Flutter, Firebase, Ionic (notions)", en: "Flutter, Firebase, Ionic (basics)" },
    },
    {
      group: { fr: "Données", en: "Data" },
      items: { fr: "SQL, PostgreSQL, MySQL, Alembic, Redis, pandas", en: "SQL, PostgreSQL, MySQL, Alembic, Redis, pandas" },
    },
    {
      group: { fr: "DevOps et qualité", en: "DevOps and quality" },
      items: {
        fr: "Git, GitHub Actions, Docker, pytest, Playwright, Vercel, Netlify",
        en: "Git, GitHub Actions, Docker, pytest, Playwright, Vercel, Netlify",
      },
    },
    {
      group: { fr: "Réseaux", en: "Networking" },
      items: { fr: "Nmap, SNMP, ICMP, TCP/IP, supervision", en: "Nmap, SNMP, ICMP, TCP/IP, monitoring" },
    },
    {
      group: { fr: "IA et automatisation", en: "AI and automation" },
      items: {
        fr: "Tâches planifiées, analyse de données, intégration d'API, conception de workflows",
        en: "Scheduled jobs, data analysis, API integration, workflow design",
      },
    },
    {
      group: { fr: "CMS", en: "CMS" },
      items: { fr: "WordPress", en: "WordPress" },
    },
  ] satisfies { group: L; items: L }[],
};
