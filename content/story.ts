import type { L } from "@/lib/i18n";

/** Textes des sections narratives du portfolio. */

export const nav: { id: string; label: L }[] = [
  { id: "home", label: { fr: "Accueil", en: "Home" } },
  { id: "about", label: { fr: "Parcours", en: "About" } },
  { id: "skills", label: { fr: "Compétences", en: "Skills" } },
  { id: "projects", label: { fr: "Projets", en: "Projects" } },
  { id: "journey", label: { fr: "Évolution", en: "Journey" } },
  { id: "contact", label: { fr: "Contact", en: "Contact" } },
];

export const ui = {
  skip: { fr: "Aller au contenu", en: "Skip to content" },
  menu: { fr: "Menu", en: "Menu" },
  close: { fr: "Fermer", en: "Close" },
  cv: { fr: "CV", en: "CV" },
  downloadCv: { fr: "Télécharger le CV", en: "Download CV" },
  switchLang: { fr: "English version", en: "Version française" },
  explore: { fr: "Explorer", en: "Explore" },
  backToArchive: { fr: "Retour à l'archive", en: "Back to the archive" },
  status: { fr: "Statut", en: "Status" },
  stack: { fr: "Stack", en: "Stack" },
  objective: { fr: "Objectif", en: "Objective" },
  copy: { fr: "Copier", en: "Copy" },
  copied: { fr: "Copié", en: "Copied" },
  pending: { fr: "À compléter (visible en développement uniquement)", en: "To complete (visible in development only)" },
  footer: { fr: "Conçu et développé par Legma Parfait.", en: "Designed and built by Legma Parfait." },
} satisfies Record<string, L>;

export const hero = {
  boot: [
    { fr: "Initialisation du système", en: "Initializing system" },
    { fr: "Analyse", en: "Analyzing" },
    { fr: "Construction", en: "Building" },
    { fr: "Système en ligne", en: "System online" },
  ] satisfies L[],
  headline: {
    fr: "Je construis des systèmes, pas seulement des interfaces.",
    en: "I build systems, not just interfaces.",
  } satisfies L,
  approach: {
    fr: "Je pars d'un problème réel, je conçois l'architecture, puis je livre le backend, les API, le web et le mobile — en ajoutant de l'automatisation et de l'IA là où elles apportent une vraie valeur.",
    en: "I start from a real problem, design the architecture, then ship the backend, APIs, web and mobile — adding automation and AI where they bring real value.",
  } satisfies L,
  ctaWork: { fr: "Explorer mes missions", en: "Explore my work" } satisfies L,
  traceLabel: { fr: "Du problème au produit", en: "From problem to product" } satisfies L,
  trace: [
    { fr: "Problème", en: "Problem" },
    { fr: "Analyse", en: "Analysis" },
    { fr: "Architecture", en: "Architecture" },
    { fr: "Backend", en: "Backend" },
    { fr: "API", en: "API" },
    { fr: "Frontend", en: "Frontend" },
    { fr: "Mobile", en: "Mobile" },
    { fr: "IA", en: "AI" },
    { fr: "Déploiement", en: "Deployment" },
    { fr: "Évolution", en: "Evolution" },
  ] satisfies L[],
};

export const about = {
  eyebrow: { fr: "La mission", en: "The mission" } satisfies L,
  title: {
    fr: "Un problème concret, puis un système pour le résoudre.",
    en: "A concrete problem, then a system to solve it.",
  } satisfies L,
  paragraphs: [
    {
      fr: "Je suis étudiant en Licence 3 d'Informatique de Gestion à l'Université de l'Unité Africaine (ex‑IAM), à Ouagadougou.",
      en: "I am a final-year Business Computing student at the Université de l'Unité Africaine (formerly IAM) in Ouagadougou.",
    },
    {
      fr: "Mon stage chez Moov Africa m'a placé face à une question simple : quels équipements du réseau répondent, lesquels sont en panne, et qui doit intervenir ? J'y ai développé une application de supervision — découverte des équipements, collecte SNMP, incidents, tickets et SLA.",
      en: "My internship at Moov Africa started from a simple question: which network devices respond, which are down, and who must act? I built a monitoring application there — device discovery, SNMP collection, incidents, tickets and SLAs.",
    },
    {
      fr: "Depuis, je construis des produits complets : FasoCommerce, une plateforme de gestion pour les commerces et services du Burkina Faso, et ForexSaaS, un outil d'aide à la décision fondé sur l'analyse de données de marché.",
      en: "Since then, I have been building complete products: FasoCommerce, a management platform for shops and services in Burkina Faso, and ForexSaaS, a decision-support tool built on market data analysis.",
    },
    {
      fr: "Mon cap : le développement full-stack, avec l'IA comme couche utile du produit — jamais comme décor.",
      en: "My direction: full-stack development, with AI as a useful layer of the product — never as decoration.",
    },
  ] satisfies L[],
  facts: [
    { label: { fr: "Formation", en: "Education" }, value: { fr: "Licence 3 Informatique de Gestion · 2025–2026", en: "BSc Business Computing, final year · 2025–2026" } },
    { label: { fr: "Expérience", en: "Experience" }, value: { fr: "Stage — Moov Africa", en: "Internship — Moov Africa" } },
    { label: { fr: "Base", en: "Based in" }, value: { fr: "Ouagadougou, Burkina Faso", en: "Ouagadougou, Burkina Faso" } },
    { label: { fr: "Orientation", en: "Focus" }, value: { fr: "Full-Stack + IA", en: "Full-Stack + AI" } },
  ] satisfies { label: L; value: L }[],
};

export const method = {
  eyebrow: { fr: "De l'idée au système", en: "From idea to system" } satisfies L,
  title: { fr: "Ma façon de travailler, étape par étape.", en: "How I work, step by step." } satisfies L,
  steps: [
    {
      name: "Understand",
      text: { fr: "Comprendre le problème avant d'écrire du code.", en: "Understand the problem before writing code." },
      proof: {
        fr: "Supervision : qui doit être alerté, et en combien de temps ? D'où un SLA propre à chaque priorité.",
        en: "Supervision: who must be alerted, and how fast? Hence one SLA per priority.",
      },
    },
    {
      name: "Design",
      text: { fr: "Concevoir l'expérience et l'architecture.", en: "Design the experience and the architecture." },
      proof: {
        fr: "FasoCommerce : un socle commun, 15 modules activables selon le métier.",
        en: "FasoCommerce: one shared core, 15 modules switched on per trade.",
      },
    },
    {
      name: "Build",
      text: { fr: "Développer, tester, versionner.", en: "Build, test, version." },
      proof: {
        fr: "FasoCommerce : 207 tests backend automatisés, intégration continue à chaque envoi.",
        en: "FasoCommerce: 207 automated backend tests, continuous integration on every push.",
      },
    },
    {
      name: "Connect",
      text: { fr: "Connecter les API, les services et les données.", en: "Connect APIs, services and data." },
      proof: {
        fr: "ForexSaaS : trois sources de données collectées par des tâches planifiées.",
        en: "ForexSaaS: three data sources collected by scheduled jobs.",
      },
    },
    {
      name: "Intelligence",
      text: { fr: "Ajouter automatisation et IA quand elles apportent une réelle valeur.", en: "Add automation and AI when they bring real value." },
      proof: {
        fr: "ForexSaaS : des scores argumentés qui combinent analyse technique et fondamentale.",
        en: "ForexSaaS: reasoned scores combining technical and fundamental analysis.",
      },
    },
    {
      name: "Evolve",
      text: { fr: "Améliorer et faire évoluer le système.", en: "Improve and evolve the system." },
      proof: {
        fr: "FasoCommerce : une feuille de route par phases, de F0 à F6.",
        en: "FasoCommerce: a phased roadmap, from F0 to F6.",
      },
    },
  ] satisfies { name: string; text: L; proof: L }[],
};

export const live = {
  eyebrow: { fr: "En direct", en: "Live ops" } satisfies L,
  title: {
    fr: "Une panne, détectée, escaladée, résolue.",
    en: "An outage, detected, escalated, resolved.",
  } satisfies L,
  lead: {
    fr: "Voici ce que fait l'application de supervision développée pendant mon stage, rejouée en simulation : les mêmes règles, un temps accéléré.",
    en: "This is what the monitoring application I built during my internship does, replayed as a simulation: the same rules, accelerated time.",
  } satisfies L,
  badge: { fr: "Simulation", en: "Simulation" } satisfies L,
  logTitle: { fr: "supervision · journal", en: "monitoring · log" } satisfies L,
  replay: { fr: "Relancer la simulation", en: "Replay the simulation" } satisfies L,
  mission: { fr: "Voir la mission 001", en: "See mission 001" } satisfies L,
  rulesTitle: { fr: "Règles réelles appliquées", en: "Real rules applied" } satisfies L,
  rules: [
    { fr: "Panne déclarée après 3 échecs consécutifs", en: "Outage declared after 3 consecutive failures" },
    { fr: "SLA critique : 180 minutes", en: "Critical SLA: 180 minutes" },
    { fr: "Escalade automatique jusqu'au niveau 3", en: "Automatic escalation up to level 3" },
    { fr: "Ticket au format TK-AAAAMMJJ-NNNN", en: "Ticket format TK-YYYYMMDD-NNNN" },
  ] satisfies L[],
  states: {
    idle: { fr: "Tous les équipements répondent", en: "All devices responding" },
    probe: { fr: "Sonde en cours", en: "Probing" },
    down: { fr: "Équipement en panne", en: "Device down" },
    alert: { fr: "Alerte critique", en: "Critical alert" },
    ticket: { fr: "Ticket ouvert", en: "Ticket open" },
    escalate: { fr: "Escalade", en: "Escalation" },
    recover: { fr: "Rétablissement", en: "Recovering" },
    resolved: { fr: "Incident résolu", en: "Incident resolved" },
  } satisfies Record<string, L>,
};

export const skillsIntro = {
  eyebrow: { fr: "Carte du système", en: "System map" } satisfies L,
  title: {
    fr: "Des technologies reliées par des projets, pas une liste de logos.",
    en: "Technologies connected by projects, not a wall of logos.",
  } satisfies L,
  help: {
    fr: "Sélectionnez une technologie pour voir où elle est utilisée.",
    en: "Select a technology to see where it is used.",
  } satisfies L,
  usedIn: { fr: "Utilisé dans", en: "Used in" } satisfies L,
  level: { fr: "Niveau déclaré", en: "Stated level" } satisfies L,
  noMission: {
    fr: "Pas encore présenté dans une mission de ce portfolio.",
    en: "Not yet shown in a mission of this portfolio.",
  } satisfies L,
};

export const archive = {
  eyebrow: { fr: "Archive des missions", en: "Mission archive" } satisfies L,
  title: {
    fr: "Chaque projet, du problème au résultat.",
    en: "Every project, from problem to result.",
  } satisfies L,
};

export const aiLayer = {
  eyebrow: { fr: "Couche IA", en: "AI layer" } satisfies L,
  title: { fr: "Build with AI.", en: "Build with AI." } satisfies L,
  lead: {
    fr: "Je ne suis pas chercheur en IA. Je suis un développeur qui apprend à intégrer l'IA dans des produits utiles — en commençant par des données propres et des automatisations fiables.",
    en: "I am not an AI researcher. I am a developer learning to build AI into useful products — starting with clean data and reliable automation.",
  } satisfies L,
  legend: {
    live: { fr: "En place dans un projet", en: "Live in a project" } satisfies L,
    next: { fr: "Piste d'intégration", en: "Integration path" } satisfies L,
  },
  uses: [
    {
      name: { fr: "Automatisation", en: "Automation" },
      state: "live",
      text: { fr: "Supervision chaque minute, escalade SLA, collecte de données planifiée.", en: "Monitoring every minute, SLA escalation, scheduled data collection." },
    },
    {
      name: { fr: "Analyse", en: "Analysis" },
      state: "live",
      text: { fr: "Analyse technique et fondamentale des marchés dans ForexSaaS.", en: "Technical and fundamental market analysis in ForexSaaS." },
    },
    {
      name: { fr: "Traitement de données", en: "Data processing" },
      state: "live",
      text: { fr: "Collecte multi-sources, normalisation, rétention.", en: "Multi-source collection, normalisation, retention." },
    },
    {
      name: { fr: "Workflows intelligents", en: "Smart workflows" },
      state: "live",
      text: { fr: "Des règles qui décident de l'escalade d'un ticket ou du score d'un contexte.", en: "Rules that decide a ticket's escalation or a setup's score." },
    },
    {
      name: { fr: "APIs IA", en: "AI APIs" },
      state: "next",
      text: { fr: "Brancher des modèles via API, comme n'importe quel service externe.", en: "Plug models in through APIs, like any external service." },
    },
    {
      name: { fr: "Assistants", en: "Assistants" },
      state: "next",
      text: { fr: "Un assistant de commande sur WhatsApp pour les commerçants de FasoCommerce.", en: "A WhatsApp ordering assistant for FasoCommerce merchants." },
    },
    {
      name: { fr: "Génération", en: "Generation" },
      state: "next",
      text: { fr: "Fiches produits et messages clients rédigés à partir du catalogue.", en: "Product sheets and customer messages drafted from the catalogue." },
    },
    {
      name: { fr: "Fonctionnalités intégrées", en: "Built-in features" },
      state: "next",
      text: { fr: "Détection d'anomalies sur l'historique CPU/RAM de la supervision.", en: "Anomaly detection on monitoring CPU/RAM history." },
    },
  ] satisfies { name: L; state: "live" | "next"; text: L }[],
};

export const mobileLayer = {
  eyebrow: { fr: "Couche mobile", en: "Mobile layer" } satisfies L,
  title: {
    fr: "Une idée qui ne s'arrête pas au navigateur.",
    en: "An idea that doesn't stop at the browser.",
  } satisfies L,
  lead: {
    fr: "Une solution bien conçue expose une API. À partir de là, le web, le mobile et l'IA ne sont que des clients de plus.",
    en: "A well-designed solution exposes an API. From there, web, mobile and AI are just more clients.",
  } satisfies L,
  chain: [
    { fr: "Une idée", en: "One idea" },
    { fr: "API", en: "API" },
    { fr: "Web", en: "Web" },
    { fr: "Mobile", en: "Mobile" },
    { fr: "IA", en: "AI" },
  ] satisfies L[],
  flutter: {
    title: { fr: "Flutter — Taxi Compteur", en: "Flutter — Taxi Compteur" } satisfies L,
    text: {
      fr: "Projet académique : modes client et chauffeur, demande de course en temps réel (Firebase), suivi GPS, prix calculé selon la distance, écran de paiement Mobile Money.",
      en: "Academic project: customer and driver modes, real-time ride requests (Firebase), GPS tracking, distance-based fare, Mobile Money payment screen.",
    } satisfies L,
  },
  web: {
    title: { fr: "Web mobile d'abord — FasoCommerce", en: "Mobile-first web — FasoCommerce" } satisfies L,
    text: {
      fr: "Pensé pour le téléphone et les connexions limitées : la caisse continue de vendre sans réseau.",
      en: "Built for phones and limited connectivity: the till keeps selling without network.",
    } satisfies L,
  },
  ionic: {
    title: { fr: "Ionic", en: "Ionic" } satisfies L,
    text: { fr: "Notions.", en: "Basics." } satisfies L,
  },
};

export const journey = {
  eyebrow: { fr: "Évolution", en: "Journey" } satisfies L,
  title: { fr: "Les étapes, dans l'ordre où elles se construisent.", en: "The steps, in the order they build up." } satisfies L,
  steps: [
    {
      name: { fr: "Formation", en: "Education" },
      text: { fr: "Licence 3 Informatique de Gestion — Université de l'Unité Africaine (ex‑IAM).", en: "BSc Business Computing — Université de l'Unité Africaine (formerly IAM)." },
      date: "2025–2026",
    },
    {
      name: { fr: "Développement web", en: "Web development" },
      text: { fr: "HTML, CSS, JavaScript, PHP et WordPress : les fondations.", en: "HTML, CSS, JavaScript, PHP and WordPress: the foundations." },
      date: null,
    },
    {
      name: { fr: "Systèmes réseau", en: "Network systems" },
      text: { fr: "Stage chez Moov Africa : une application de supervision réseau.", en: "Internship at Moov Africa: a network monitoring application." },
      date: null,
    },
    {
      name: { fr: "SaaS", en: "SaaS" },
      text: { fr: "FasoCommerce et ForexSaaS : penser produit, abonnements, utilisateurs.", en: "FasoCommerce and ForexSaaS: thinking in products, subscriptions and users." },
      date: null,
    },
    {
      name: { fr: "Full-Stack", en: "Full-Stack" },
      text: { fr: "Next.js, FastAPI, PostgreSQL, tests automatisés, CI et Docker.", en: "Next.js, FastAPI, PostgreSQL, automated tests, CI and Docker." },
      date: null,
    },
    {
      name: { fr: "IA", en: "AI" },
      text: { fr: "Automatisation, analyse de données et intégration de services IA.", en: "Automation, data analysis and AI service integration." },
      date: null,
    },
    {
      name: { fr: "Prochaine étape", en: "Next level" },
      text: { fr: "Rejoindre une équipe ou un projet où construire des systèmes utiles.", en: "Join a team or a project to build useful systems." },
      date: null,
    },
  ] satisfies { name: L; text: L; date: string | null }[],
};

export const finale = {
  title: { fr: "Le système n'est jamais terminé.", en: "The system is never finished." } satisfies L,
  text: {
    fr: "Chaque projet est une nouvelle étape. Chaque problème peut devenir une opportunité de construire quelque chose de meilleur.",
    en: "Every project is a new step. Every problem can become an opportunity to build something better.",
  } satisfies L,
  cta: { fr: "Construisons quelque chose.", en: "Let's build something." } satisfies L,
  labels: {
    email: { fr: "E-mail", en: "Email" },
    phone: { fr: "Téléphone", en: "Phone" },
    github: { fr: "GitHub", en: "GitHub" },
    cv: { fr: "CV", en: "CV" },
  } satisfies Record<string, L>,
};
