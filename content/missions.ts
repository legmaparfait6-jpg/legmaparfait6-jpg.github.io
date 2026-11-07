import type { L } from "@/lib/i18n";

/**
 * Archive des missions. Chaque information provient du code ou des documents
 * des projets. Ce qui n'est pas vérifiable est listé dans `pending` : affiché
 * uniquement en développement, jamais publié.
 */

export type MissionStatus = "live" | "delivered" | "active" | "paused" | "preparation" | "academic";

export type FlowStep = { label: L; detail: L };
export type Decision = { title: L; why: L };
export type Screenshot = { src: string; width: number; height: number; alt: L; caption: L };
export type BrandAsset = { src: string; width: number; height: number; alt: L };
export type MissionWorld = { surface: string; light: string; accent: string };

export type Mission = {
  slug: string;
  code: string;
  name: string;
  /** Palette propre à l'illustration orbitale du projet. */
  world: MissionWorld;
  status: MissionStatus;
  context: L;
  role: L;
  period: L | null;
  summary: L;
  /** Chiffres clés, tous vérifiables dans le code du projet. */
  figures: { value: string; label: L }[];
  stack: string[];
  context_long: L;
  problem: L;
  objective: L;
  architecture: { intro: L; flow: FlowStep[] };
  technologies: { group: L; items: string[] }[];
  features: L[];
  screenshots: Screenshot[];
  brand?: BrandAsset;
  /** Public product site, when one has been verified. */
  website?: string;
  /** Verified source repository, when one is configured. */
  repository?: string;
  screenshotsNote?: L;
  decisions: Decision[];
  challenges: Decision[];
  result: L;
  evolution: L[];
  lenses?: { label: L; text: L }[];
  disclaimer?: L;
  repo: L;
  pending: string[];
};

export const STATUS_LABEL: Record<MissionStatus, L> = {
  live: { fr: "En ligne", en: "Live" },
  delivered: { fr: "Livré", en: "Delivered" },
  active: { fr: "Pré-lancement", en: "Pre-launch" },
  paused: { fr: "En pause", en: "Paused" },
  preparation: { fr: "En préparation", en: "In preparation" },
  academic: { fr: "Projet académique", en: "Academic project" },
};

const shot = (name: string, height: number, alt: L, caption: L): Screenshot => ({
  src: `/missions/fasocommerce/${name}.webp`,
  width: 540,
  height,
  alt,
  caption,
});

export const missions: Mission[] = [
  {
    slug: "network-supervision",
    code: "001",
    name: "Network Supervision",
    world: { surface: "#174873", light: "#59a9dc", accent: "#a9e6ff" },
    status: "delivered",
    context: { fr: "Stage — Moov Africa", en: "Internship — Moov Africa" },
    role: { fr: "Conception et développement", en: "Design and development" },
    period: null,
    summary: {
      fr: "Découvrir les équipements réseau, les surveiller en continu et transformer chaque panne en incident suivi, avec des délais mesurés.",
      en: "Discover network devices, monitor them continuously and turn every failure into a tracked incident with measured response times.",
    },
    figures: [
      { value: "7", label: { fr: "étapes de traitement", en: "processing stages" } },
      { value: "3", label: { fr: "niveaux d'escalade", en: "escalation levels" } },
      { value: "1 min", label: { fr: "cycle de supervision", en: "monitoring cycle" } },
      { value: "4", label: { fr: "tâches planifiées", en: "scheduled jobs" } },
    ],
    stack: ["Python", "Flask", "Nmap", "SNMP", "MySQL"],
    context_long: {
      fr: "Stage de fin de Licence chez Moov Africa. Une équipe réseau doit savoir en permanence quels équipements répondent, lesquels se dégradent, et qui doit intervenir.",
      en: "Final-year internship at Moov Africa. A network team needs to know at all times which devices respond, which are degrading, and who must act.",
    },
    problem: {
      fr: "Sans outil centralisé, une panne est découverte tard, le suivi des incidents est dispersé et les délais de résolution ne peuvent pas être mesurés.",
      en: "Without a central tool, failures are found late, incident follow-up is scattered and resolution times cannot be measured.",
    },
    objective: {
      fr: "Une application web qui découvre les équipements, les surveille en continu, transforme les anomalies en incidents traçables et mesure la qualité de service (SLA, MTTR).",
      en: "A web application that discovers devices, monitors them continuously, turns anomalies into traceable incidents and measures service quality (SLA, MTTR).",
    },
    architecture: {
      intro: {
        fr: "Une application Flask organisée en routes, services et modèles. Un planificateur exécute la supervision, le contrôle des SLA, la sauvegarde et la purge en arrière-plan.",
        en: "A Flask application split into routes, services and models. A scheduler runs monitoring, SLA checks, backups and data retention in the background.",
      },
      flow: [
        {
          label: { fr: "Découverte", en: "Discovery" },
          detail: {
            fr: "Nmap repère les hôtes actifs, un ping ICMP parallèle (50 threads) les confirme, SNMP identifie le type d'équipement.",
            en: "Nmap finds live hosts, a parallel ICMP ping (50 threads) confirms them, SNMP identifies the device type.",
          },
        },
        {
          label: { fr: "Validation", en: "Validation" },
          detail: {
            fr: "Un équipement découvert attend une validation humaine avant d'être surveillé.",
            en: "A discovered device waits for human validation before being monitored.",
          },
        },
        {
          label: { fr: "Supervision", en: "Monitoring" },
          detail: {
            fr: "Chaque minute, en parallèle : disponibilité, latence, perte de paquets, CPU et RAM via SNMP.",
            en: "Every minute, in parallel: availability, latency, packet loss, CPU and RAM over SNMP.",
          },
        },
        {
          label: { fr: "Alertes", en: "Alerts" },
          detail: {
            fr: "Seuils et échecs consécutifs produisent une alerte avec un niveau de sévérité.",
            en: "Thresholds and consecutive failures raise an alert with a severity level.",
          },
        },
        {
          label: { fr: "Incidents & tickets", en: "Incidents & tickets" },
          detail: {
            fr: "Chaque ticket reçoit une échéance SLA selon la priorité de l'incident.",
            en: "Each ticket gets an SLA deadline based on the incident priority.",
          },
        },
        {
          label: { fr: "Escalade", en: "Escalation" },
          detail: {
            fr: "SLA dépassé : escalade automatique jusqu'au niveau 3 et notification par e-mail.",
            en: "SLA breached: automatic escalation up to level 3 and email notification.",
          },
        },
        {
          label: { fr: "Rapports", en: "Reports" },
          detail: {
            fr: "Indicateurs SLA et MTTR, exports CSV et PDF.",
            en: "SLA and MTTR indicators, CSV and PDF exports.",
          },
        },
      ],
    },
    technologies: [
      { group: { fr: "Application", en: "Application" }, items: ["Python", "Flask", "SQLAlchemy", "Flask-Login", "Flask-WTF"] },
      { group: { fr: "Réseau", en: "Network" }, items: ["python-nmap", "pysnmp", "icmplib"] },
      { group: { fr: "Données et tâches", en: "Data and jobs" }, items: ["MySQL", "APScheduler"] },
      { group: { fr: "Rapports et alertes", en: "Reports and alerts" }, items: ["ReportLab", "Flask-Mail"] },
    ],
    features: [
      { fr: "Découverte automatique des équipements d'un sous-réseau", en: "Automatic discovery of the devices on a subnet" },
      { fr: "Supervision continue : disponibilité, latence, CPU, RAM, interfaces", en: "Continuous monitoring: availability, latency, CPU, RAM, interfaces" },
      { fr: "Historique CPU/RAM et communauté SNMP propre à chaque équipement", en: "CPU/RAM history and per-device SNMP community" },
      { fr: "Cycle d'incident complet : alerte, incident, ticket, résolution", en: "Full incident lifecycle: alert, incident, ticket, resolution" },
      { fr: "SLA par priorité et escalade automatique sur trois niveaux", en: "Per-priority SLA and automatic three-level escalation" },
      { fr: "Maintenances planifiées qui suspendent les alertes", en: "Scheduled maintenance that silences alerts" },
      { fr: "Rapports SLA/MTTR exportables en CSV et PDF", en: "SLA/MTTR reports exported to CSV and PDF" },
      { fr: "Gestion des utilisateurs et des rôles", en: "User and role management" },
      { fr: "Sauvegarde quotidienne de la base et purge des métriques à 30 jours", en: "Daily database backup and 30-day metrics retention" },
    ],
    screenshots: [],
    screenshotsNote: {
      fr: "Interface interne au stage : captures non publiées.",
      en: "Internal internship interface: screenshots not published.",
    },
    decisions: [
      {
        title: { fr: "Une découverte en deux phases", en: "Two-phase discovery" },
        why: {
          fr: "Nmap repère vite les hôtes actifs. Le ping parallèle confirme chacun et mesure sa latence, puis SNMP précise le type d'équipement, avec une règle de repli quand SNMP ne répond pas.",
          en: "Nmap quickly finds live hosts. A parallel ping confirms each one and measures latency, then SNMP refines the device type, with a fallback rule when SNMP does not answer.",
        },
      },
      {
        title: { fr: "Un SLA par priorité", en: "One SLA per priority" },
        why: {
          fr: "Un incident critique n'a pas le même délai qu'un incident mineur. Chaque ticket reçoit son échéance, et l'escalade suit ces délais plutôt qu'un seuil fixe.",
          en: "A critical incident does not share the deadline of a minor one. Each ticket gets its own due time, and escalation follows it instead of a fixed threshold.",
        },
      },
      {
        title: { fr: "Des échecs consécutifs avant l'alerte", en: "Consecutive failures before alerting" },
        why: {
          fr: "Compter les échecs successifs de disponibilité, de CPU et de RAM évite d'ouvrir un incident sur une perte de paquet isolée.",
          en: "Counting consecutive availability, CPU and RAM failures avoids opening an incident on a single lost packet.",
        },
      },
      {
        title: { fr: "Sécurisé par défaut", en: "Secure by default" },
        why: {
          fr: "L'application refuse de démarrer sans clé secrète hors mode debug. Protection CSRF, cookies de session HttpOnly et secrets en variables d'environnement.",
          en: "The app refuses to start without a secret key outside debug mode. CSRF protection, HttpOnly session cookies and secrets in environment variables.",
        },
      },
    ],
    challenges: [
      {
        title: { fr: "Un planificateur lancé deux fois", en: "A scheduler started twice" },
        why: {
          fr: "En mode debug, le rechargeur de Werkzeug crée deux processus. Le planificateur ne démarre désormais que dans le processus serveur.",
          en: "In debug mode, the Werkzeug reloader spawns two processes. The scheduler now starts only in the server process.",
        },
      },
      {
        title: { fr: "Des journaux en double", en: "Duplicate logs" },
        why: {
          fr: "Journalisation centralisée sur le logger racine, avec rotation des fichiers (5 × 5 Mo).",
          en: "Logging centralised on the root logger, with file rotation (5 × 5 MB).",
        },
      },
      {
        title: { fr: "Le volume des métriques", en: "Metrics volume" },
        why: {
          fr: "Purge automatique au-delà de 30 jours, index ajoutés sur les colonnes filtrées, sauvegarde quotidienne.",
          en: "Automatic purge after 30 days, indexes on filtered columns, daily backup.",
        },
      },
    ],
    result: {
      fr: "Application fonctionnelle, validée en environnement de laboratoire (maquette) dans le cadre du stage.",
      en: "Working application, validated in a lab (mock-up) environment as part of the internship.",
    },
    evolution: [
      { fr: "Tableau de bord en temps réel (WebSocket)", en: "Real-time dashboard (WebSocket)" },
      { fr: "Alertes SMS ou WhatsApp pour les astreintes", en: "SMS or WhatsApp alerts for on-call staff" },
      { fr: "Détection d'anomalies sur l'historique CPU/RAM", en: "Anomaly detection on CPU/RAM history" },
      { fr: "Déploiement conteneurisé", en: "Containerised deployment" },
    ],
    repo: { fr: "Dépôt privé — projet de stage", en: "Private repository — internship project" },
    pending: ["Dates du stage", "Service d'accueil / encadrant"],
  },
  {
    slug: "fasocommerce",
    code: "002",
    name: "FasoCommerce",
    world: { surface: "#71451e", light: "#d49538", accent: "#ffe2a0" },
    status: "live",
    context: { fr: "Produit — SaaS", en: "Product — SaaS" },
    role: {
      fr: "Conception, architecture et développement full-stack",
      en: "Design, architecture and full-stack development",
    },
    period: { fr: "Depuis juin 2026", en: "Since June 2026" },
    summary: {
      fr: "Une plateforme de gestion pensée pour le téléphone, où chaque commerce ou service active les modules dont son métier a besoin.",
      en: "A phone-first management platform where each shop or service turns on the modules its trade needs.",
    },
    figures: [
      { value: "15", label: { fr: "modules activables", en: "switchable modules" } },
      { value: "13", label: { fr: "profils métier", en: "trade profiles" } },
      { value: "453", label: { fr: "tests backend", en: "backend tests" } },
      { value: "3", label: { fr: "rôles d'équipe", en: "team roles" } },
    ],
    stack: ["Next.js", "TypeScript", "FastAPI", "PostgreSQL", "Docker"],
    context_long: {
      fr: "Au Burkina Faso, beaucoup de commerces et de services gèrent ventes, stock, dettes clients et commandes WhatsApp à la main. Leur réalité : une connexion limitée, le paiement par Mobile Money et des métiers très différents.",
      en: "In Burkina Faso, many shops and services track sales, stock, customer debts and WhatsApp orders by hand. Their reality: limited connectivity, Mobile Money payments and very different trades.",
    },
    problem: {
      fr: "Les logiciels existants supposent une connexion stable, un paiement par carte et un seul type de commerce. Une épicerie, un pressing, un restaurant et un garage ont pourtant des besoins différents.",
      en: "Existing software assumes a stable connection, card payments and a single kind of business. A grocery, a dry cleaner, a restaurant and a garage have different needs.",
    },
    objective: {
      fr: "Une plateforme unique, pensée pour le téléphone, qui s'adapte au métier par modules — sans jamais bloquer une vente.",
      en: "A single, phone-first platform that adapts to each trade through modules — and never blocks a sale.",
    },
    architecture: {
      intro: {
        fr: "Monolithe modulaire : un socle commun (équipe, paiements, clients, notifications) et des modules activables. Le code teste un module, jamais un métier : ajouter un métier revient à ajouter un profil, sans migration.",
        en: "Modular monolith: a shared core (team, payments, customers, notifications) and switchable modules. Code checks a module, never a trade: adding a trade means adding a profile, with no migration.",
      },
      flow: [
        {
          label: { fr: "Interface", en: "Interface" },
          detail: {
            fr: "Next.js 15, React 19, TypeScript. Mobile d'abord, appels API relatifs proxifiés.",
            en: "Next.js 15, React 19, TypeScript. Mobile first, relative API calls behind a proxy.",
          },
        },
        {
          label: { fr: "API", en: "API" },
          detail: {
            fr: "FastAPI : routes minces, services partagés, une permission vérifiée par établissement.",
            en: "FastAPI: thin routes, shared services, one permission checked per business.",
          },
        },
        {
          label: { fr: "Données", en: "Data" },
          detail: {
            fr: "PostgreSQL 16, schéma versionné par migrations Alembic.",
            en: "PostgreSQL 16, schema versioned with Alembic migrations.",
          },
        },
        {
          label: { fr: "Tâches", en: "Jobs" },
          detail: {
            fr: "Redis et Celery pour les notifications et les traitements asynchrones.",
            en: "Redis and Celery for notifications and background work.",
          },
        },
        {
          label: { fr: "Fichiers", en: "Files" },
          detail: {
            fr: "MinIO pour les images des produits.",
            en: "MinIO for product images.",
          },
        },
        {
          label: { fr: "Production", en: "Production" },
          detail: {
            fr: "Docker Compose et Caddy (HTTPS automatique, en-têtes de sécurité).",
            en: "Docker Compose and Caddy (automatic HTTPS, security headers).",
          },
        },
      ],
    },
    technologies: [
      { group: { fr: "Frontend", en: "Frontend" }, items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "zustand", "zod"] },
      { group: { fr: "Backend", en: "Backend" }, items: ["Python", "FastAPI", "SQLAlchemy 2", "Alembic", "JWT"] },
      { group: { fr: "Données et infra", en: "Data and infra" }, items: ["PostgreSQL", "Redis", "Celery", "MinIO", "Docker", "Caddy"] },
      { group: { fr: "Qualité", en: "Quality" }, items: ["pytest", "Playwright", "GitHub Actions"] },
    ],
    features: [
      { fr: "Boutique en ligne et commandes par WhatsApp", en: "Online store and WhatsApp orders" },
      { fr: "Caisse, y compris hors ligne, synchronisée au retour du réseau", en: "Point of sale, including offline, synced when the network returns" },
      { fr: "Stock, vente au carton ou à la pièce", en: "Stock, sold by the case or by the unit" },
      { fr: "Carnet de dettes (vente à crédit)", en: "Debt book (credit sales)" },
      { fr: "Promotions datées et carte de fidélité", en: "Scheduled promotions and loyalty card" },
      { fr: "Tickets pour imprimante thermique 58 / 80 mm", en: "Receipts for 58 / 80 mm thermal printers" },
      { fr: "Paiement Mobile Money direct, CinetPay en option", en: "Direct Mobile Money payment, CinetPay as an option" },
      { fr: "Modules métier : restaurant, auto-école, garage, pressing, rendez-vous", en: "Trade modules: restaurant, driving school, garage, dry cleaning, bookings" },
      { fr: "Équipe, rôles personnalisés et journal d'activité", en: "Team, custom roles and activity log" },
      { fr: "Factures, avoirs, fournisseurs, achats, dépenses, export Excel", en: "Invoices, credit notes, suppliers, purchases, expenses, Excel export" },
      { fr: "Abonnements avec mode limité qui ne bloque jamais la caisse", en: "Subscriptions with a limited mode that never blocks the till" },
    ],
    screenshots: [
      shot("boutique", 1048,
        { fr: "Boutique en ligne d'une épicerie : rayons, recherche, bouton WhatsApp", en: "Online store of a grocery: aisles, search, WhatsApp button" },
        { fr: "Boutique en ligne", en: "Online store" }),
      shot("caisse", 958,
        { fr: "Écran de caisse après une vente encaissée, avec impression du ticket", en: "Point-of-sale screen after a completed sale, with receipt printing" },
        { fr: "Caisse", en: "Point of sale" }),
      shot("hors-ligne", 958,
        { fr: "Vente enregistrée sur le téléphone sans réseau, synchronisée plus tard", en: "Sale stored on the phone without network, synced later" },
        { fr: "Vente hors ligne", en: "Offline sale" }),
      shot("ticket", 673,
        { fr: "Ticket de caisse au format 80 mm prêt à imprimer ou à envoyer par WhatsApp", en: "80 mm receipt ready to print or send via WhatsApp" },
        { fr: "Ticket thermique", en: "Thermal receipt" }),
      shot("cuisine", 958,
        { fr: "Écran cuisine d'un restaurant : commandes par table et statut de préparation", en: "Restaurant kitchen screen: orders by table and preparation status" },
        { fr: "Module restaurant", en: "Restaurant module" }),
      shot("devis-garage", 934,
        { fr: "Création d'un devis de garage : véhicule, pièces, main-d'œuvre, total", en: "Creating a garage quote: vehicle, parts, labour, total" },
        { fr: "Module garage", en: "Garage module" }),
    ],
    screenshotsNote: {
      fr: "Captures issues des tests automatisés, avec des données de démonstration.",
      en: "Screenshots from the automated tests, with demo data.",
    },
    decisions: [
      {
        title: { fr: "Des modules, pas des métiers", en: "Modules, not trades" },
        why: {
          fr: "Un profil (charcuterie, pressing…) n'est qu'un point de départ qui active des modules. Le commerçant peut ensuite les modifier, et un nouveau métier ne demande aucune migration.",
          en: "A profile (butcher, dry cleaner…) is only a starting point that switches modules on. Merchants can adjust them, and a new trade needs no migration.",
        },
      },
      {
        title: { fr: "Des permissions, pas des rôles", en: "Permissions, not roles" },
        why: {
          fr: "Chaque endpoint demande une permission précise sur un établissement. Les rôles d'équipe (gérant, caissier…) ne sont que des ensembles de permissions.",
          en: "Each endpoint asks for a precise permission on a business. Team roles (manager, cashier…) are just sets of permissions.",
        },
      },
      {
        title: { fr: "La vente n'est jamais bloquée", en: "A sale is never blocked" },
        why: {
          fr: "Réseau coupé ou abonnement impayé : la caisse continue. Une vente hors ligne est enregistrée avec son heure réelle au retour de la connexion.",
          en: "No network or unpaid subscription: the till keeps working. An offline sale is recorded with its real time once the connection returns.",
        },
      },
      {
        title: { fr: "Des jetons hors de portée du JavaScript", en: "Tokens out of JavaScript's reach" },
        why: {
          fr: "Jetons en cookies httpOnly, jamais dans le localStorage, et un en-tête anti-CSRF exigé pour les requêtes sensibles.",
          en: "Tokens in httpOnly cookies, never in localStorage, with an anti-CSRF header required on sensitive requests.",
        },
      },
    ],
    challenges: [
      {
        title: { fr: "Une connexion limitée", en: "Limited connectivity" },
        why: {
          fr: "Interface légère, pensée pour le téléphone, et caisse capable de fonctionner sans réseau.",
          en: "A light, phone-first interface and a till that works without network.",
        },
      },
      {
        title: { fr: "Protéger la connexion", en: "Protecting sign-in" },
        why: {
          fr: "Tentatives limitées par numéro et par adresse IP réelle, fournie par le proxy et non par le client.",
          en: "Attempts limited per phone number and per real IP address, supplied by the proxy rather than the client.",
        },
      },
      {
        title: { fr: "La conformité dès la conception", en: "Compliance by design" },
        why: {
          fr: "Pages légales, registre des traitements, aucun traceur sans consentement, et des tests d'accessibilité automatisés (WCAG 2.1 AA).",
          en: "Legal pages, processing register, no tracker without consent, and automated accessibility tests (WCAG 2.1 AA).",
        },
      },
    ],
    result: {
      fr: "En ligne sur commerce.fasodigit.com et ouvert à la vente depuis novembre 2026, avec 30 jours d'essai gratuit. 15 modules, 453 tests backend automatisés, tests end-to-end et d'accessibilité, intégration continue et déploiement par GitHub Actions.",
      en: "Live at commerce.fasodigit.com and open for sale since November 2026, with a 30-day free trial. 15 modules, 453 automated backend tests, end-to-end and accessibility tests, continuous integration and deployment through GitHub Actions.",
    },
    evolution: [
      { fr: "Accompagnement des premiers commerçants abonnés", en: "Hands-on support for the first subscribed merchants" },
      { fr: "Application mobile Flutter sur la même API", en: "Flutter mobile app on the same API" },
      { fr: "Assistant de commande sur WhatsApp", en: "Ordering assistant on WhatsApp" },
      { fr: "Nouveaux profils métier", en: "New trade profiles" },
    ],
    website: "https://commerce.fasodigit.com/",
    repo: { fr: "Dépôt privé — démonstration sur demande", en: "Private repository — demo on request" },
    pending: [],
  },
  {
    slug: "forexsaas",
    code: "003",
    name: "ForexSaaS",
    world: { surface: "#3c286e", light: "#8b71d6", accent: "#d9c8ff" },
    status: "paused",
    context: { fr: "Produit — aide à la décision", en: "Product — decision support" },
    role: { fr: "Conception et développement", en: "Design and development" },
    period: null,
    summary: {
      fr: "Une solution d'aide à la décision qui combine données de marché, analyse technique, analyse fondamentale et automatisation.",
      en: "A decision-support tool combining market data, technical analysis, fundamental analysis and automation.",
    },
    figures: [
      { value: "3", label: { fr: "sources de données", en: "data sources" } },
      { value: "5", label: { fr: "analyseurs", en: "analysers" } },
      { value: "3", label: { fr: "moteurs de score", en: "scoring engines" } },
      { value: "1", label: { fr: "module de backtesting", en: "backtesting module" } },
    ],
    stack: ["Python", "FastAPI", "pandas", "Celery", "Next.js"],
    context_long: {
      fr: "Le marché des devises produit en continu des données techniques (prix) et fondamentales (indicateurs macro-économiques). Les analyser à la main prend du temps et reste subjectif.",
      en: "The currency market continuously produces technical data (prices) and fundamental data (macroeconomic indicators). Analysing them by hand is slow and subjective.",
    },
    problem: {
      fr: "Croiser analyse technique, contexte macro-économique et gestion du risque oblige à consulter plusieurs sources et à refaire les mêmes calculs chaque jour.",
      en: "Combining technical analysis, macro context and risk management means checking several sources and repeating the same calculations every day.",
    },
    objective: {
      fr: "Collecter ces données, les analyser et présenter des scores argumentés. L'outil n'exécute aucun ordre et ne promet aucun rendement : l'utilisateur décide.",
      en: "Collect this data, analyse it and present reasoned scores. The tool places no orders and promises no returns: the user decides.",
    },
    architecture: {
      intro: {
        fr: "Une chaîne de traitement en tâches planifiées — collecte, analyse, scoring, alertes — exposée par une API et visualisée dans un tableau de bord.",
        en: "A pipeline of scheduled jobs — collection, analysis, scoring, alerts — exposed through an API and shown in a dashboard.",
      },
      flow: [
        {
          label: { fr: "Collecte", en: "Collection" },
          detail: {
            fr: "Prix OHLCV (Twelve Data), indicateurs macro-économiques (FRED), données Finnhub, historiques.",
            en: "OHLCV prices (Twelve Data), macroeconomic indicators (FRED), Finnhub data, history.",
          },
        },
        {
          label: { fr: "Analyse", en: "Analysis" },
          detail: {
            fr: "Indicateurs techniques, structure de marché, sessions de cotation, concepts ICT, calcul du risque.",
            en: "Technical indicators, market structure, trading sessions, ICT concepts, risk calculation.",
          },
        },
        {
          label: { fr: "Scoring", en: "Scoring" },
          detail: {
            fr: "Scores de confluence et de confiance qui expliquent pourquoi un contexte est favorable ou non.",
            en: "Confluence and confidence scores explaining why a setup is favourable or not.",
          },
        },
        {
          label: { fr: "Backtesting", en: "Backtesting" },
          detail: {
            fr: "Évaluation des règles sur données historiques et mesure de performance.",
            en: "Rules evaluated on historical data, with performance metrics.",
          },
        },
        {
          label: { fr: "Alertes", en: "Alerts" },
          detail: { fr: "Notifications par e-mail.", en: "Email notifications." },
        },
        {
          label: { fr: "Tableau de bord", en: "Dashboard" },
          detail: {
            fr: "Next.js : graphiques en chandeliers, jauges de score, panneaux macro et backtest.",
            en: "Next.js: candlestick charts, score gauges, macro and backtest panels.",
          },
        },
      ],
    },
    technologies: [
      { group: { fr: "Backend", en: "Backend" }, items: ["Python", "FastAPI", "SQLAlchemy", "Alembic"] },
      { group: { fr: "Données", en: "Data" }, items: ["pandas", "NumPy", "ta"] },
      { group: { fr: "Tâches et stockage", en: "Jobs and storage" }, items: ["Celery", "Redis", "PostgreSQL"] },
      { group: { fr: "Interface et infra", en: "Interface and infra" }, items: ["Next.js", "React", "Tailwind CSS", "Docker"] },
    ],
    features: [
      { fr: "Collecte planifiée de trois sources de données", en: "Scheduled collection from three data sources" },
      { fr: "Analyse technique et analyse de la structure de marché", en: "Technical analysis and market structure analysis" },
      { fr: "Contexte macro-économique intégré à l'analyse", en: "Macroeconomic context built into the analysis" },
      { fr: "Scores de confluence et de confiance", en: "Confluence and confidence scores" },
      { fr: "Calcul du risque adapté à chaque paire de devises", en: "Risk calculation adapted to each currency pair" },
      { fr: "Backtesting sur données historiques", en: "Backtesting on historical data" },
      { fr: "Alertes par e-mail et tableau de bord d'administration", en: "Email alerts and admin dashboard" },
    ],
    screenshots: [],
    decisions: [
      {
        title: { fr: "Aider à décider, pas décider", en: "Support the decision, don't make it" },
        why: {
          fr: "Le système n'exécute aucun ordre. Il explique un contexte à partir de critères lisibles : la décision reste humaine.",
          en: "The system places no orders. It explains a setup through readable criteria: the decision stays human.",
        },
      },
      {
        title: { fr: "Des tâches découplées", en: "Decoupled jobs" },
        why: {
          fr: "Collecte, analyse, notification et rétention sont des tâches Celery distinctes : chacune peut échouer ou être relancée sans bloquer les autres.",
          en: "Collection, analysis, notification and retention are separate Celery jobs: each can fail or be retried without blocking the others.",
        },
      },
      {
        title: { fr: "Des choix documentés", en: "Documented choices" },
        why: {
          fr: "Les décisions techniques structurantes sont consignées dans des ADR (Architecture Decision Records).",
          en: "Key technical decisions are recorded as ADRs (Architecture Decision Records).",
        },
      },
    ],
    challenges: [
      {
        title: { fr: "La précision des paires en yen", en: "Yen pair precision" },
        why: {
          fr: "Un pip vaut 0,01 sur les paires JPY contre 0,0001 sur les autres. Le calcul du risque et le backtesting ont été corrigés pour en tenir compte.",
          en: "A pip is 0.01 on JPY pairs versus 0.0001 elsewhere. Risk calculation and backtesting were fixed accordingly.",
        },
      },
      {
        title: { fr: "Itérer par sprints", en: "Iterating in sprints" },
        why: {
          fr: "Le projet a avancé par sprints successifs, chacun apportant une brique : collecte, analyse, scoring, backtesting, calibration.",
          en: "The project moved forward in successive sprints, each adding a block: collection, analysis, scoring, backtesting, calibration.",
        },
      },
    ],
    result: {
      fr: "En pause. Backend de collecte, d'analyse, de scoring et de backtesting, et tableau de bord Next.js.",
      en: "Paused. Collection, analysis, scoring and backtesting backend, plus a Next.js dashboard.",
    },
    evolution: [
      { fr: "Consolider le code dans un dépôt versionné et testé", en: "Consolidate the code in a versioned, tested repository" },
      { fr: "Étendre la couverture de tests", en: "Extend test coverage" },
      { fr: "Pondérer les scores par apprentissage, validé par backtesting", en: "Weight scores with machine learning, validated by backtesting" },
    ],
    disclaimer: {
      fr: "Outil d'aide à la décision : aucune exécution d'ordre, aucune garantie de rendement, aucun conseil financier.",
      en: "Decision-support tool: no order execution, no guaranteed returns, no financial advice.",
    },
    repo: { fr: "Code non publié", en: "Code not published" },
    pending: ["Période de développement"],
  },
  {
    slug: "fasodigit",
    code: "004",
    name: "FasoDigit",
    world: { surface: "#18553e", light: "#34bb78", accent: "#b5ffd2" },
    status: "live",
    context: { fr: "Projet entrepreneurial — académie et services", en: "Entrepreneurial project — academy and services" },
    role: { fr: "Fondateur — conception, développement et exploitation", en: "Founder — design, development and operations" },
    period: { fr: "En ligne depuis octobre 2026", en: "Live since October 2026" },
    summary: {
      fr: "Une académie en ligne (guides, formations avec attestation vérifiable, Club, CV) et des solutions sur mesure pour les commerces, sur un même site.",
      en: "An online academy (guides, courses with verifiable certificates, a reading Club, CVs) and custom solutions for businesses, on one site.",
    },
    figures: [
      { value: "2", label: { fr: "parcours : Académie et Services", en: "paths: Academy and Services" } },
      { value: "482", label: { fr: "tests automatisés", en: "automated tests" } },
    ],
    stack: ["Python", "Django", "PostgreSQL", "nginx", "React"],
    context_long: {
      fr: "Beaucoup de jeunes et de petites entreprises au Burkina Faso veulent utiliser le numérique, mais manquent de contenus pratiques et d'un interlocuteur qui construit avec eux.",
      en: "Many young people and small businesses in Burkina Faso want to go digital but lack practical content and someone who builds with them.",
    },
    problem: {
      fr: "Les formations disponibles sont souvent théoriques, difficiles à payer en ligne et sans preuve reconnue à la fin.",
      en: "Available training is often theoretical, hard to pay for online and ends without a recognised proof.",
    },
    objective: {
      fr: "Vendre des contenus utiles payables par Orange Money ou Wave, délivrer des attestations vérifiables et présenter les services de développement sur rendez-vous.",
      en: "Sell useful content payable with Orange Money or Wave, issue verifiable certificates and present development services by appointment.",
    },
    architecture: {
      intro: {
        fr: "Application Django découpée par domaine (guides, formations, attestations, Club, CV, ambassadeurs, espace client, administration), base PostgreSQL, servie par nginx sur un serveur privé virtuel. Un studio intégré produit les images et vidéos des réseaux sociaux.",
        en: "A Django application split by domain (guides, courses, certificates, Club, CV, ambassadors, customer area, admin), PostgreSQL database, served by nginx on a virtual private server. A built-in studio produces social media images and videos.",
      },
      flow: [
        { label: { fr: "Découvrir", en: "Discover" }, detail: { fr: "Pages Académie et Services, vidéos de démonstration de 30 secondes.", en: "Academy and Services pages, 30-second demo videos." } },
        { label: { fr: "Payer", en: "Pay" }, detail: { fr: "Commande en ligne, paiement Orange Money ou Wave, confirmation dans l'administration.", en: "Online order, Orange Money or Wave payment, confirmed in the admin." } },
        { label: { fr: "Apprendre", en: "Learn" }, detail: { fr: "Guide reçu sur WhatsApp, modules de formation, examen en ligne.", en: "Guide delivered on WhatsApp, course modules, online exam." } },
        { label: { fr: "Prouver", en: "Prove" }, detail: { fr: "Attestation avec QR code, vérifiable par un employeur.", en: "Certificate with a QR code an employer can verify." } },
      ],
    },
    technologies: [
      { group: { fr: "Application", en: "Application" }, items: ["Python", "Django", "HTML / CSS", "JavaScript"] },
      { group: { fr: "Données et serveur", en: "Data and server" }, items: ["PostgreSQL", "nginx", "VPS Linux"] },
      { group: { fr: "Studio de contenus", en: "Content studio" }, items: ["Pillow", "ffmpeg", "React (Remotion)"] },
    ],
    features: [
      { fr: "Catalogue de guides pratiques, achat en quelques gestes et livraison sur WhatsApp", en: "Catalogue of practical guides, purchase in a few steps and delivery on WhatsApp" },
      { fr: "Formations en ligne, parcours métier et attestations vérifiables par QR code", en: "Online courses, career paths and QR-verifiable certificates" },
      { fr: "Club de lecture sans engagement et générateur de CV professionnel", en: "Commitment-free reading Club and professional CV builder" },
      { fr: "Programme ambassadeurs avec code, liens suivis et commission sur les ventes", en: "Ambassador programme with a code, tracked links and sales commission" },
      { fr: "Espace client et administration guidée « Je veux… »", en: "Customer area and guided “I want to…” admin" },
      { fr: "Studio intégré : images, affiches et vidéos animées pour les réseaux sociaux", en: "Built-in studio: images, posters and animated videos for social media" },
    ],
    screenshots: [],
    website: "https://fasodigit.com/",
    decisions: [
      {
        title: { fr: "Le paiement qu'utilisent vraiment les clients", en: "The payment customers actually use" },
        why: {
          fr: "Orange Money et Wave plutôt que la carte bancaire : chaque commande est confirmée à la main dans l'administration avant la livraison.",
          en: "Orange Money and Wave rather than bank cards: each order is confirmed by hand in the admin before delivery.",
        },
      },
      {
        title: { fr: "Une preuve vérifiable", en: "A verifiable proof" },
        why: {
          fr: "Chaque attestation porte un QR code qui renvoie vers sa page de vérification sur le site.",
          en: "Each certificate carries a QR code linking to its verification page on the site.",
        },
      },
    ],
    challenges: [],
    lenses: [
      {
        label: { fr: "Technologie", en: "Technology" },
        text: { fr: "Un monolithe Django testé, déployé sur un serveur que je gère.", en: "A tested Django monolith, deployed on a server I run." },
      },
      {
        label: { fr: "Utilisateur", en: "User" },
        text: { fr: "Des apprenants et des commerçants qui veulent des résultats utilisables tout de suite.", en: "Learners and merchants who want results they can use right away." },
      },
      {
        label: { fr: "Produit", en: "Product" },
        text: { fr: "L'Académie en ligne, les Services sur rendez-vous.", en: "The Academy online, Services by appointment." },
      },
      {
        label: { fr: "Business", en: "Business" },
        text: { fr: "Des contenus à petit prix qui font connaître les services.", en: "Low-priced content that introduces the services." },
      },
    ],
    result: {
      fr: "En ligne sur fasodigit.com depuis octobre 2026 : Académie, Club, CV, attestations et pages Services, avec 482 tests automatisés.",
      en: "Live at fasodigit.com since October 2026: Academy, Club, CV, certificates and Services pages, with 482 automated tests.",
    },
    evolution: [
      { fr: "Nouveaux guides et formations", en: "New guides and courses" },
      { fr: "Photos et vidéos tournées sur le terrain", en: "Photos and videos shot in the field" },
    ],
    repo: { fr: "Dépôt privé", en: "Private repository" },
    pending: [],
  },
  {
    slug: "taxi-compteur",
    code: "005",
    name: "Taxi Compteur",
    world: { surface: "#6d321e", light: "#df7647", accent: "#ffc487" },
    status: "academic",
    context: { fr: "Projet académique — mobile", en: "Academic project — mobile" },
    role: { fr: "Développement mobile", en: "Mobile development" },
    period: null,
    summary: {
      fr: "Une application mobile qui met en relation clients et chauffeurs de taxi, avec un tarif calculé selon la distance.",
      en: "A mobile app connecting customers and taxi drivers, with a fare computed from the distance.",
    },
    figures: [
      { value: "2", label: { fr: "modes : client et chauffeur", en: "modes: customer and driver" } },
      { value: "≈ 1 900", label: { fr: "lignes de Dart", en: "lines of Dart" } },
    ],
    stack: ["Flutter", "Dart", "Firebase"],
    context_long: {
      fr: "Projet réalisé dans le cadre de la formation, autour de la mobilité urbaine.",
      en: "Project built during my studies, around urban mobility.",
    },
    problem: {
      fr: "Sans compteur, le prix d'une course se négocie et le client ne suit pas l'arrivée de son chauffeur.",
      en: "Without a meter, fares are negotiated and customers cannot follow their driver's arrival.",
    },
    objective: {
      fr: "Demander une course, suivre son chauffeur et payer un prix calculé selon la distance parcourue.",
      en: "Request a ride, follow the driver and pay a fare based on the distance travelled.",
    },
    architecture: {
      intro: {
        fr: "Application Flutter adossée à Firebase : authentification et base de données temps réel partagée entre clients et chauffeurs.",
        en: "Flutter app backed by Firebase: authentication and a real-time database shared by customers and drivers.",
      },
      flow: [
        { label: { fr: "Client", en: "Customer" }, detail: { fr: "Recherche de destination et demande de course.", en: "Destination search and ride request." } },
        { label: { fr: "Temps réel", en: "Real time" }, detail: { fr: "Firebase Realtime Database transmet la demande.", en: "Firebase Realtime Database relays the request." } },
        { label: { fr: "Chauffeur", en: "Driver" }, detail: { fr: "Acceptation ou refus, puis course guidée par GPS.", en: "Accept or decline, then a GPS-guided ride." } },
        { label: { fr: "Paiement", en: "Payment" }, detail: { fr: "Prix calculé selon la distance, paiement Mobile Money.", en: "Distance-based fare, Mobile Money payment." } },
      ],
    },
    technologies: [
      { group: { fr: "Mobile", en: "Mobile" }, items: ["Flutter", "Dart"] },
      { group: { fr: "Services", en: "Services" }, items: ["Firebase Auth", "Firebase Realtime Database"] },
      { group: { fr: "Cartographie", en: "Maps" }, items: ["flutter_map", "geolocator"] },
    ],
    features: [
      { fr: "Modes client et chauffeur", en: "Customer and driver modes" },
      { fr: "Recherche de destination sur carte", en: "Destination search on a map" },
      { fr: "Demande, acceptation ou refus de course", en: "Ride request, acceptance or refusal" },
      { fr: "Suivi GPS et prix calculé selon la distance", en: "GPS tracking and distance-based fare" },
      { fr: "Écran de paiement Mobile Money et historique des courses", en: "Mobile Money payment screen and ride history" },
    ],
    screenshots: [],
    decisions: [
      {
        title: { fr: "Le temps réel sans serveur", en: "Real time without a server" },
        why: {
          fr: "Firebase Realtime Database synchronise la course entre les deux téléphones sans backend à maintenir.",
          en: "Firebase Realtime Database syncs the ride between both phones with no backend to maintain.",
        },
      },
    ],
    challenges: [
      {
        title: { fr: "Les permissions de localisation", en: "Location permissions" },
        why: {
          fr: "Service désactivé ou permission refusée : l'application l'explique à l'utilisateur au lieu d'échouer en silence.",
          en: "Service disabled or permission denied: the app explains it to the user instead of failing silently.",
        },
      },
    ],
    result: {
      fr: "Prototype fonctionnel réalisé dans le cadre de la formation.",
      en: "Working prototype built as part of my studies.",
    },
    evolution: [
      { fr: "Intégration réelle d'un paiement Mobile Money", en: "Real Mobile Money integration" },
      { fr: "Backend dédié pour la tarification et l'historique", en: "Dedicated backend for pricing and history" },
    ],
    repo: { fr: "Non publié", en: "Not published" },
    pending: ["Année et cadre du projet académique"],
  },
  {
    slug: "codeburkina",
    code: "006",
    name: "CodeBurkina",
    world: { surface: "#315623", light: "#82ae42", accent: "#f1d477" },
    status: "active",
    context: { fr: "Prototype éducatif — web et mobile", en: "Education prototype — web and mobile" },
    role: { fr: "Conception et développement de l’application", en: "Application design and development" },
    period: null,
    summary: {
      fr: "Un prototype Flutter pour réviser le code de la route au Burkina Faso, avec cours, quiz et progression enregistrée sur l’appareil.",
      en: "A Flutter prototype for studying road rules in Burkina Faso, with lessons, quizzes and on-device progress tracking.",
    },
    figures: [
      { value: "10", label: { fr: "cours dans les données locales", en: "lessons in the local data" } },
      { value: "15", label: { fr: "questions dans le jeu de données fourni", en: "questions in the bundled dataset" } },
    ],
    stack: ["Flutter", "Dart", "Provider", "SharedPreferences"],
    context_long: {
      fr: "Le projet vise les personnes qui préparent l’examen du code de la route au Burkina Faso. Les documents du dossier explorent un apprentissage utilisable avec une connexion limitée.",
      en: "The project is aimed at people preparing for the driving theory exam in Burkina Faso. Its documentation explores learning with limited connectivity.",
    },
    problem: {
      fr: "Réviser sur téléphone avec des cours et des quiz accessibles même lorsque la connexion est limitée.",
      en: "Study on a phone with lessons and quizzes available when connectivity is limited.",
    },
    objective: {
      fr: "Proposer un prototype de révision mobile et web, avec des contenus embarqués et une progression conservée localement.",
      en: "Build a mobile and web study prototype with bundled learning content and locally saved progress.",
    },
    architecture: {
      intro: {
        fr: "Application Flutter structurée en écrans de présentation, entités métier et source de données locale. Provider porte l’état de l’application; les cours et questions sont lus depuis des fichiers JSON embarqués, et la progression est enregistrée avec SharedPreferences.",
        en: "A Flutter application organized into presentation screens, domain entities and a local data source. Provider holds app state; lessons and questions are loaded from bundled JSON files, and progress is saved with SharedPreferences.",
      },
      flow: [
        { label: { fr: "Contenus", en: "Content" }, detail: { fr: "Cours et questions lus depuis les fichiers JSON inclus dans l’application.", en: "Lessons and questions loaded from JSON files bundled with the app." } },
        { label: { fr: "Révision", en: "Study" }, detail: { fr: "Écrans de cours, synthèse vocale, quiz par module et examen chronométré.", en: "Lesson screens, text to speech, module quizzes and a timed exam." } },
        { label: { fr: "Progression", en: "Progress" }, detail: { fr: "Scores, XP et questions manquées conservés localement.", en: "Scores, XP and missed questions saved locally." } },
        { label: { fr: "Partage", en: "Sharing" }, detail: { fr: "Fiches PDF, attestation générée et carte de score partageable.", en: "PDF lesson sheets, a generated certificate and a shareable score card." } },
      ],
    },
    technologies: [
      { group: { fr: "Application", en: "Application" }, items: ["Flutter", "Dart", "Provider"] },
      { group: { fr: "Données locales", en: "Local data" }, items: ["JSON", "SharedPreferences"] },
      { group: { fr: "Fonctions", en: "Features" }, items: ["FlutterTts", "PDF", "Printing", "Share Plus"] },
      { group: { fr: "Web", en: "Web" }, items: ["Flutter Web", "Service Worker", "Web App Manifest"] },
    ],
    features: [
      { fr: "Consultation des cours et de scénarios illustrés par des panneaux routiers", en: "Lessons and illustrated road-sign scenarios" },
      { fr: "Lecture des cours par synthèse vocale française et génération de fiches PDF", en: "French text-to-speech for lessons and generated PDF study sheets" },
      { fr: "Quiz par module, examen blanc chronométré et affichage du score", en: "Module quizzes, a timed mock exam and score display" },
      { fr: "Suivi local des résultats, des XP et des questions manquées", en: "Local tracking of results, XP and missed questions" },
      { fr: "Carte de score partageable et génération d’une attestation PDF", en: "Shareable score card and generated PDF certificate" },
      { fr: "Écrans de compte, de progression et de rattachement à un partenaire", en: "Account, progress and partner-linking screens" },
      { fr: "Service worker et manifeste web présents pour la version Flutter Web; le fonctionnement hors ligne en production reste à vérifier", en: "Service worker and web manifest included for Flutter Web; production offline behavior remains to be verified" },
    ],
    screenshots: [],
    screenshotsNote: {
      fr: "Aucune capture d’écran du prototype n’est incluse dans le dossier accessible.",
      en: "No prototype screenshots are included in the accessible project folder.",
    },
    decisions: [
      {
        title: { fr: "Contenus embarqués", en: "Bundled content" },
        why: { fr: "Les cours et les questions sont fournis dans des fichiers locaux, ce qui évite un chargement réseau pour les consulter.", en: "Lessons and questions are bundled locally, so viewing them does not require a network request." },
      },
      {
        title: { fr: "Progression enregistrée sur l’appareil", en: "Progress saved on the device" },
        why: { fr: "Le prototype conserve les résultats et préférences avec SharedPreferences, sans service backend visible dans le code examiné.", en: "The prototype stores results and preferences with SharedPreferences, with no backend service visible in the reviewed code." },
      },
    ],
    challenges: [],
    result: {
      fr: "Prototype Flutter avec interface web, données de cours locales, quiz et persistance de la progression. Le dépôt accessible ne permet pas de confirmer une publication ou un usage en production.",
      en: "Flutter prototype with a web interface, local lesson data, quizzes and saved progress. The accessible files do not confirm a production release or use.",
    },
    evolution: [
      { fr: "Compléter et valider la banque de questions avec des références pédagogiques vérifiables.", en: "Expand and validate the question bank against verifiable learning references." },
      { fr: "Vérifier les parcours de paiement, de licence et de partenariat avant toute présentation comme service opérationnel.", en: "Verify payment, licensing and partner flows before presenting them as operational services." },
      { fr: "Valider l’installation, le cache hors ligne et les parcours sur appareils réels.", en: "Validate installation, offline caching and key flows on real devices." },
    ],
    disclaimer: {
      fr: "Les mentions de conformité ONASER, de paiements et de partenariats figurant dans les documents stratégiques ne prouvent pas une validation officielle ni une exploitation effective. L’attestation générée est un document de l’application, pas un certificat délivré par l’ONASER.",
      en: "References to ONASER compliance, payments and partnerships in strategy documents do not establish official approval or live operations. The generated attestation is an app document, not a certificate issued by ONASER.",
    },
    repo: { fr: "Code source local; aucun dépôt Git n’est configuré dans le dossier accessible.", en: "Local source files; no Git repository is configured in the accessible folder." },
    pending: ["Dépôt GitHub exact et lien de démonstration", "Période du projet et rôle personnel précis", "État de publication et validation des contenus réglementaires"],
  },
  {
    slug: "jl-express",
    code: "007",
    name: "JL EXPRESS",
    world: { surface: "#124765", light: "#159de0", accent: "#a5e9ff" },
    status: "delivered",
    context: { fr: "Réalisation pour un client — application mobile", en: "Client project — mobile app" },
    role: { fr: "Conception et développement de l’application", en: "Application design and development" },
    period: { fr: "Octobre 2026", en: "October 2026" },
    summary: {
      fr: "Une application livrée à un coursier de Ouagadougou : ses missions, ses clients, l’argent du jour et la monnaie à rendre, plus un studio pour créer ses publicités WhatsApp.",
      en: "An app delivered to a courier in Ouagadougou: jobs, clients, the day’s money and change to give back, plus a studio to create WhatsApp ads.",
    },
    figures: [
      { value: "4", label: { fr: "parcours métier : missions, clients, finances et Studio", en: "business areas: jobs, clients, finance and Studio" } },
      { value: "PDF", label: { fr: "reçus et rapports d’activité", en: "receipts and activity reports" } },
    ],
    stack: ["Flutter", "Dart", "SharedPreferences", "PDF", "QR"],
    context_long: {
      fr: "JL EXPRESS regroupe la gestion quotidienne d’une activité de livraison et la création de visuels professionnels dans une seule application Flutter. Les données métier sont conservées sur l’appareil.",
      en: "JL EXPRESS brings day-to-day delivery management and professional visual creation together in one Flutter app. Business data is stored on the device.",
    },
    problem: {
      fr: "Un livreur doit suivre ses missions, ses clients, les montants encaissés et les dépenses sans disperser ces informations entre plusieurs outils.",
      en: "A courier needs to track jobs, clients, collected payments and expenses without scattering that information across tools.",
    },
    objective: {
      fr: "Rassembler les opérations courantes et la création de supports partageables dans un outil mobile qui fonctionne avec des données locales.",
      en: "Bring daily operations and shareable business materials into one mobile tool backed by local data.",
    },
    architecture: {
      intro: {
        fr: "Application Flutter organisée par fonctionnalités. AppStore conserve le profil, les missions, les clients et les dépenses; StudioStore gère les créations. Les objets sont sérialisés en JSON dans SharedPreferences, sans backend ni synchronisation configurés.",
        en: "A feature-based Flutter app. AppStore holds the profile, jobs, clients and expenses; StudioStore manages saved designs. Objects are serialized as JSON in SharedPreferences, with no backend or sync configured.",
      },
      flow: [
        { label: { fr: "Profil", en: "Profile" }, detail: { fr: "Coordonnées, activité, services et préférences locales.", en: "Contact details, business activity, services and local preferences." } },
        { label: { fr: "Missions et clients", en: "Jobs and clients" }, detail: { fr: "Création, suivi d’état, trajets, montants et historique des clients.", en: "Create and track job status, routes, amounts and client history." } },
        { label: { fr: "Finances", en: "Finance" }, detail: { fr: "Encaissements, dépenses, montants à recevoir et calcul de monnaie.", en: "Collections, expenses, amounts due and change calculation." } },
        { label: { fr: "Documents et Studio", en: "Documents and Studio" }, detail: { fr: "Reçus, rapport PDF et visuels exportables à partir de modèles.", en: "Receipts, PDF reports and template-based visuals for export." } },
      ],
    },
    technologies: [
      { group: { fr: "Application", en: "Application" }, items: ["Flutter", "Dart", "Material"] },
      { group: { fr: "Stockage local", en: "Local storage" }, items: ["SharedPreferences", "JSON"] },
      { group: { fr: "Documents et partage", en: "Documents and sharing" }, items: ["pdf", "printing", "share_plus"] },
      { group: { fr: "Studio", en: "Studio" }, items: ["image_picker", "image", "gal", "qr_flutter"] },
    ],
    features: [
      { fr: "Profil du livreur et gestion des missions avec client, trajet, statut et montant", en: "Courier profile and jobs with client, route, status and amount" },
      { fr: "Répertoire clients et calcul des sommes restant à encaisser", en: "Client directory and calculation of outstanding collections" },
      { fr: "Saisie des dépenses et vues financières par période", en: "Expense entry and financial views by period" },
      { fr: "Reçus de mission et rapport d’activité exportables en PDF", en: "Job receipts and activity reports exportable as PDFs" },
      { fr: "Studio de création : modèles, personnalisation, QR code, photos et export PNG, JPG ou PDF", en: "Design Studio with templates, customization, QR codes, photos and PNG, JPG or PDF export" },
    ],
    screenshots: [
      { src: "/missions/jl-express/accueil.webp", width: 540, height: 1218, alt: { fr: "Écran d’accueil : prochaine mission, sommes à recevoir, encaissé, dépenses et net", en: "Home screen: next job, amounts due, collected, expenses and net" }, caption: { fr: "Accueil", en: "Home" } },
      { src: "/missions/jl-express/argent.webp", width: 540, height: 1218, alt: { fr: "Écran Argent : encaissé, dépenses, net et à recevoir, filtrés par période", en: "Money screen: collected, expenses, net and due, filtered by period" }, caption: { fr: "Argent du jour", en: "Daily money" } },
      { src: "/missions/jl-express/monnaie.webp", width: 540, height: 1218, alt: { fr: "Calcul de la monnaie à rendre au client à partir du montant de la course", en: "Change calculator based on the job amount" }, caption: { fr: "Monnaie à rendre", en: "Change to give back" } },
      { src: "/missions/jl-express/studio.webp", width: 540, height: 1218, alt: { fr: "Studio : choix du type de visuel et des modèles de statut WhatsApp", en: "Studio: choice of visual type and WhatsApp status templates" }, caption: { fr: "Studio", en: "Studio" } },
      { src: "/missions/jl-express/creations.webp", width: 540, height: 1218, alt: { fr: "Créations enregistrées : cartes, affiches et statuts", en: "Saved designs: cards, posters and statuses" }, caption: { fr: "Mes créations", en: "My designs" } },
    ],
    brand: {
      src: "/missions/jl-express/logo.webp",
      width: 800,
      height: 735,
      alt: {
        fr: "Logo JL EXPRESS avec la signature Livrer. Gérer. Avancer.",
        en: "JL EXPRESS logo with the tagline Deliver. Manage. Move forward.",
      },
    },
    screenshotsNote: {
      fr: "Captures de l’application livrée. À la demande du client, son visage, son nom et ses numéros n’apparaissent nulle part ; les montants affichés sont à zéro.",
      en: "Screenshots of the delivered app. At the client’s request, their face, name and phone numbers never appear; amounts shown are zero.",
    },
    decisions: [
      {
        title: { fr: "Stockage hors ligne", en: "Offline storage" },
        why: { fr: "Les stores gardent les données localement avec SharedPreferences, sans dépendre d’un service serveur.", en: "The stores keep data locally with SharedPreferences, without relying on a server service." },
      },
      {
        title: { fr: "Studio fondé sur des modèles", en: "Template-based Studio" },
        why: { fr: "Les créations combinent un modèle, le profil courant et des champs personnalisés, puis peuvent être exportées ou partagées.", en: "Creations combine a template, the current profile and custom fields, then can be exported or shared." },
      },
    ],
    challenges: [],
    result: {
      fr: "Application Android livrée au client en octobre 2026. Le client s’est dit satisfait et prêt à nous recommander.",
      en: "Android app delivered to the client in October 2026. The client said they were satisfied and ready to recommend us.",
    },
    evolution: [
      { fr: "Publication sur le Play Store avec un identifiant et une signature définitifs.", en: "Play Store release with a final application ID and signing key." },
      { fr: "Sauvegarde des données en ligne, pour ne rien perdre en changeant de téléphone.", en: "Online data backup, so nothing is lost when changing phones." },
      { fr: "Ajouter une restauration guidée des données et renforcer les tests des parcours Finance, Clients et stockage.", en: "Add guided data recovery and broaden Finance, Clients and storage-flow tests." },
    ],
    disclaimer: {
      fr: "Application locale : les données restent sur le téléphone du livreur. Cette version n’a ni compte en ligne ni synchronisation.",
      en: "Local app: data stays on the courier’s phone. This version has no online account or sync.",
    },
    repo: { fr: "Dépôt source GitHub.", en: "GitHub source repository." },
    repository: "https://github.com/legmaparfait6-jpg/jl-express",
    pending: [],
  },
  {
    slug: "fasoconsult",
    code: "008",
    name: "FasoConsult",
    world: { surface: "#0f4f52", light: "#2bb5a8", accent: "#a8f5ea" },
    status: "active",
    context: { fr: "Projet d’équipe — plateforme de santé", en: "Team project — health platform" },
    role: { fr: "Membre de l’équipe de réalisation", en: "Member of the delivery team" },
    period: { fr: "Depuis octobre 2026", en: "Since October 2026" },
    summary: {
      fr: "Une plateforme de santé : tickets de consultation, dossier médical partagé, ordonnances numériques et pharmacies de garde, pour les patients et les soignants.",
      en: "A health platform: consultation tickets, a shared medical record, digital prescriptions and on-duty pharmacies, for patients and caregivers.",
    },
    figures: [
      { value: "8", label: { fr: "types d’utilisateurs décrits", en: "user types described" } },
      { value: "4", label: { fr: "documents de conception et un prototype", en: "design documents and a prototype" } },
    ],
    stack: ["Flutter", "React", "API REST", "PostgreSQL"],
    context_long: {
      fr: "Au Burkina Faso, le parcours de soins repose encore largement sur des dossiers papier et des carnets de santé ; le patient transporte lui-même son histoire médicale d’un centre de santé à l’hôpital.",
      en: "In Burkina Faso, care still relies largely on paper records and health booklets; patients carry their own medical history from a health centre to the hospital.",
    },
    problem: {
      fr: "Des heures d’attente avant une consultation, des dossiers perdus lors des transferts et des soignants qui ne voient pas l’historique du patient.",
      en: "Hours of waiting before a consultation, records lost during transfers and caregivers who cannot see the patient’s history.",
    },
    objective: {
      fr: "Un code dossier unique par patient, des tickets de consultation numériques et un dossier médical partagé, protégé et journalisé.",
      en: "A unique record code per patient, digital consultation tickets and a shared, protected and logged medical record.",
    },
    architecture: {
      intro: {
        fr: "Architecture proposée dans le cahier des charges : application mobile Flutter pour les patients et le terrain, plateforme web pour les professionnels, API REST sécurisée et base PostgreSQL. Les choix définitifs se valident en phase de conception.",
        en: "Architecture proposed in the specification: a Flutter mobile app for patients and field agents, a web platform for professionals, a secured REST API and a PostgreSQL database. Final choices are validated during design.",
      },
      flow: [
        { label: { fr: "Patient", en: "Patient" }, detail: { fr: "Ticket de consultation, dossier médical, ordonnances et pharmacies sur mobile.", en: "Consultation ticket, medical record, prescriptions and pharmacies on mobile." } },
        { label: { fr: "Accueil et soignants", en: "Front desk and caregivers" }, detail: { fr: "File du jour, recherche du patient, consultation et références.", en: "Daily queue, patient search, consultation and referrals." } },
        { label: { fr: "Pharmacie", en: "Pharmacy" }, detail: { fr: "Lecture des ordonnances reçues, garde et horaires.", en: "Reading received prescriptions, on-duty hours." } },
        { label: { fr: "Administration", en: "Administration" }, detail: { fr: "Structures, droits par rôle et journal des accès.", en: "Facilities, role-based rights and access log." } },
      ],
    },
    technologies: [
      { group: { fr: "Proposées", en: "Proposed" }, items: ["Flutter", "React", "API REST (OAuth2, OpenAPI)", "PostgreSQL", "OpenStreetMap"] },
      { group: { fr: "Conception", en: "Design" }, items: ["Cahier des charges", "Guide fonctionnel", "Charte graphique", "Prototype HTML"] },
    ],
    features: [
      { fr: "Tickets de consultation numériques pour réduire l’attente", en: "Digital consultation tickets to reduce waiting" },
      { fr: "Dossier médical partagé, accessible selon le rôle et journalisé", en: "Shared medical record, role-based and logged" },
      { fr: "Ordonnances numériques transmises aux pharmacies", en: "Digital prescriptions sent to pharmacies" },
      { fr: "Pharmacies de garde sur la carte", en: "On-duty pharmacies on a map" },
      { fr: "Mode hors ligne : actions mises en attente puis envoyées au retour du réseau", en: "Offline mode: actions queued and sent when the network returns" },
    ],
    screenshots: [],
    decisions: [
      {
        title: { fr: "Écrire avant de coder", en: "Write before coding" },
        why: {
          fr: "Chaque exigence porte un identifiant et une priorité ; le guide fonctionnel décrit chaque parcours écran par écran et sert de base à la recette.",
          en: "Each requirement has an identifier and a priority; the functional guide describes every flow screen by screen and drives acceptance testing.",
        },
      },
    ],
    challenges: [],
    result: {
      fr: "Pré-lancement : cahier des charges, guide fonctionnel, charte graphique et prototype HTML réalisés ; le développement est en cours.",
      en: "Pre-launch: specification, functional guide, visual identity and HTML prototype done; development is in progress.",
    },
    evolution: [
      { fr: "Développement du socle : comptes, identification du patient, dossier médical", en: "Core development: accounts, patient identification, medical record" },
      { fr: "Essais sur le terrain avec des structures de santé", en: "Field trials with health facilities" },
    ],
    repo: { fr: "Dépôt d’équipe privé", en: "Private team repository" },
    pending: ["Rôle personnel précis dans l’équipe"],
  },
  {
    slug: "scolarite",
    code: "009",
    name: "Scolarité",
    world: { surface: "#2a3470", light: "#6a7ee0", accent: "#c9d2ff" },
    status: "active",
    context: { fr: "Application web — gestion scolaire", en: "Web app — school management" },
    role: { fr: "Conception et développement", en: "Design and development" },
    period: null,
    summary: {
      fr: "Une application web pour gérer la scolarité d’un établissement, en cours de développement.",
      en: "A web app to manage a school’s administration, under development.",
    },
    figures: [],
    stack: ["Python", "Django"],
    context_long: {
      fr: "Projet en cours de construction, sur la même base technique que le site FasoDigit.",
      en: "A project under construction, on the same technical base as the FasoDigit site.",
    },
    problem: {
      fr: "Le suivi administratif d’un établissement scolaire se fait encore souvent sur papier ou dans des tableurs séparés.",
      en: "A school’s administration is still often tracked on paper or in separate spreadsheets.",
    },
    objective: {
      fr: "Rassembler le suivi de la scolarité dans une seule application web.",
      en: "Bring school administration into a single web application.",
    },
    architecture: {
      intro: {
        fr: "Projet Django : un projet de configuration et une application dédiée à l’éducation, prêts à recevoir les modèles de données.",
        en: "A Django project: a configuration project and an education app, ready for the data models.",
      },
      flow: [],
    },
    technologies: [{ group: { fr: "Application", en: "Application" }, items: ["Python", "Django"] }],
    features: [],
    screenshots: [],
    decisions: [],
    challenges: [],
    result: {
      fr: "Pré-lancement : structure Django en place, fonctionnalités en cours de développement.",
      en: "Pre-launch: Django structure in place, features under development.",
    },
    evolution: [],
    repo: { fr: "Non publié", en: "Not published" },
    pending: ["Fonctionnalités prévues", "Établissement ou public visé", "Période du projet"],
  },
  {
    slug: "centre-commercial",
    code: "010",
    name: "SuperMarché",
    world: { surface: "#5e1f3b", light: "#d2557f", accent: "#ffc0d4" },
    status: "active",
    context: { fr: "Projet d’équipe — IAM Ouaga · application de bureau", en: "Team project — IAM Ouaga · desktop app" },
    role: { fr: "Développement, dans une équipe de cinq", en: "Development, in a team of five" },
    period: { fr: "2025", en: "2025" },
    summary: {
      fr: "Une application de caisse et de stock pour un centre commercial de Ouagadougou : facture avec TVA calculée, fichier clients et gestion des produits.",
      en: "A till and stock app for a shopping centre in Ouagadougou: invoices with computed VAT, a customer file and product management.",
    },
    figures: [
      { value: "4", label: { fr: "tables MySQL : clients, produits, factures, lignes", en: "MySQL tables: customers, products, invoices, lines" } },
      { value: "18 %", label: { fr: "TVA calculée sur chaque facture", en: "VAT computed on every invoice" } },
    ],
    stack: ["Python", "Tkinter", "MySQL"],
    context_long: {
      fr: "Projet réalisé en équipe à l’Institut Africain de Management de Ouagadougou, autour de la gestion d’un supermarché.",
      en: "A team project at the African Institute of Management in Ouagadougou, around running a supermarket.",
    },
    problem: {
      fr: "Stock suivi à la main, calculs de taxe imprécis et aucun suivi des clients.",
      en: "Stock tracked by hand, inaccurate tax calculations and no customer tracking.",
    },
    objective: {
      fr: "Automatiser la caisse et la facturation, calculer la TVA et garder l’historique des clients et des produits.",
      en: "Automate the till and invoicing, compute VAT and keep a history of customers and products.",
    },
    architecture: {
      intro: {
        fr: "Application de bureau Python : interface Tkinter, couche d’accès aux données avec mysql-connector, base MySQL.",
        en: "A Python desktop app: Tkinter interface, data-access layer with mysql-connector, MySQL database.",
      },
      flow: [
        { label: { fr: "Caisse", en: "Till" }, detail: { fr: "Client, produits et quantités ajoutés au panier.", en: "Customer, products and quantities added to the cart." } },
        { label: { fr: "Facture", en: "Invoice" }, detail: { fr: "Total brut, TVA de 18 % et total net calculés, facture enregistrée et imprimable.", en: "Gross total, 18% VAT and net total computed, invoice saved and printable." } },
        { label: { fr: "Stock", en: "Stock" }, detail: { fr: "Espace d’administration : ajouter, modifier ou supprimer un produit.", en: "Admin area: add, edit or delete a product." } },
      ],
    },
    technologies: [
      { group: { fr: "Application", en: "Application" }, items: ["Python", "Tkinter", "Pillow"] },
      { group: { fr: "Données", en: "Data" }, items: ["MySQL", "mysql-connector"] },
    ],
    features: [
      { fr: "Fiche client retrouvée par numéro de téléphone", en: "Customer record found by phone number" },
      { fr: "Panier, facture numérotée et calcul automatique de la TVA", en: "Cart, numbered invoice and automatic VAT calculation" },
      { fr: "Enregistrement des factures et de leurs lignes en base", en: "Invoices and their lines saved in the database" },
      { fr: "Gestion du stock : ajout, modification et suppression des produits", en: "Stock management: add, edit and delete products" },
    ],
    screenshots: [],
    decisions: [],
    challenges: [],
    result: {
      fr: "Pré-lancement : caisse, facturation et gestion du stock développées et présentées à l’IAM ; le projet continue.",
      en: "Pre-launch: till, invoicing and stock management built and presented at IAM; the project continues.",
    },
    evolution: [
      { fr: "Tableau de bord des ventes", en: "Sales dashboard" },
      { fr: "Version mobile", en: "Mobile version" },
    ],
    repo: { fr: "Non publié", en: "Not published" },
    pending: [],
  },
];

export const getMission = (slug: string) => missions.find((m) => m.slug === slug);
