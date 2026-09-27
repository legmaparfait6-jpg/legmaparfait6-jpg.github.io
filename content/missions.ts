import type { L } from "@/lib/i18n";

/**
 * Archive des missions. Chaque information provient du code ou des documents
 * des projets. Ce qui n'est pas vérifiable est listé dans `pending` : affiché
 * uniquement en développement, jamais publié.
 */

export type MissionStatus = "delivered" | "active" | "paused" | "preparation" | "academic";

export type FlowStep = { label: L; detail: L };
export type Decision = { title: L; why: L };
export type Screenshot = { src: string; width: number; height: number; alt: L; caption: L };

export type Mission = {
  slug: string;
  code: string;
  name: string;
  status: MissionStatus;
  context: L;
  role: L;
  period: L | null;
  summary: L;
  stack: string[];
  context_long: L;
  problem: L;
  objective: L;
  architecture: { intro: L; flow: FlowStep[] };
  technologies: { group: L; items: string[] }[];
  features: L[];
  screenshots: Screenshot[];
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
    status: "delivered",
    context: { fr: "Stage — Moov Africa", en: "Internship — Moov Africa" },
    role: { fr: "Conception et développement", en: "Design and development" },
    period: null,
    summary: {
      fr: "Découvrir les équipements réseau, les surveiller en continu et transformer chaque panne en incident suivi, avec des délais mesurés.",
      en: "Discover network devices, monitor them continuously and turn every failure into a tracked incident with measured response times.",
    },
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
    status: "active",
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
      fr: "Pré-lancement : 15 modules, 207 tests backend automatisés, tests end-to-end et d'accessibilité, intégration continue. La grille d'abonnement est définie et reste à valider auprès de commerçants.",
      en: "Pre-launch: 15 modules, 207 automated backend tests, end-to-end and accessibility tests, continuous integration. The pricing grid is defined and still to be validated with merchants.",
    },
    evolution: [
      { fr: "Tests terrain avec des commerçants", en: "Field tests with merchants" },
      { fr: "Application mobile Flutter sur la même API", en: "Flutter mobile app on the same API" },
      { fr: "Assistant de commande sur WhatsApp", en: "Ordering assistant on WhatsApp" },
      { fr: "Nouveaux profils métier", en: "New trade profiles" },
    ],
    repo: { fr: "Dépôt privé — démonstration sur demande", en: "Private repository — demo on request" },
    pending: [],
  },
  {
    slug: "forexsaas",
    code: "003",
    name: "ForexSaaS",
    status: "paused",
    context: { fr: "Produit — aide à la décision", en: "Product — decision support" },
    role: { fr: "Conception et développement", en: "Design and development" },
    period: null,
    summary: {
      fr: "Une solution d'aide à la décision qui combine données de marché, analyse technique, analyse fondamentale et automatisation.",
      en: "A decision-support tool combining market data, technical analysis, fundamental analysis and automation.",
    },
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
    status: "preparation",
    context: { fr: "Projet entrepreneurial", en: "Entrepreneurial project" },
    role: { fr: "Fondateur — conception et développement", en: "Founder — design and development" },
    period: null,
    summary: {
      fr: "Une académie numérique qui réunit formation, services digitaux et accompagnement.",
      en: "A digital academy bringing together training, digital services and support.",
    },
    stack: ["HTML", "CSS", "JavaScript", "Django"],
    context_long: {
      fr: "Beaucoup de jeunes et de petites entreprises veulent utiliser les outils numériques, mais manquent d'un accompagnement concret et accessible.",
      en: "Many young people and small businesses want to use digital tools but lack concrete, accessible support.",
    },
    problem: {
      fr: "Les formations disponibles sont souvent théoriques, loin des outils réellement utilisés au quotidien.",
      en: "Available training is often theoretical and far from the tools actually used day to day.",
    },
    objective: {
      fr: "Proposer des parcours pratiques, des services de développement web et un accompagnement vers le numérique.",
      en: "Offer hands-on learning paths, web development services and digital transformation support.",
    },
    architecture: {
      intro: {
        fr: "Une page vitrine pour tester l'offre et le message, avant la plateforme d'inscription.",
        en: "A landing page to test the offer and the message before building the enrolment platform.",
      },
      flow: [
        {
          label: { fr: "Message", en: "Message" },
          detail: { fr: "Page vitrine, retravaillée en quatre versions.", en: "Landing page, reworked across four versions." },
        },
        {
          label: { fr: "Offre", en: "Offer" },
          detail: { fr: "Parcours de formation et réservation de place.", en: "Learning paths and seat booking." },
        },
        {
          label: { fr: "Plateforme", en: "Platform" },
          detail: { fr: "Application Django amorcée.", en: "Django application started." },
        },
      ],
    },
    technologies: [
      { group: { fr: "Vitrine", en: "Landing" }, items: ["HTML", "CSS", "JavaScript"] },
      { group: { fr: "Plateforme", en: "Platform" }, items: ["Python", "Django"] },
    ],
    features: [
      { fr: "Présentation des parcours et des outils enseignés", en: "Learning paths and taught tools" },
      { fr: "Réservation de place", en: "Seat booking" },
      { fr: "Présentation des services digitaux", en: "Digital services presentation" },
    ],
    screenshots: [],
    decisions: [
      {
        title: { fr: "Tester l'offre avant de construire", en: "Test the offer before building" },
        why: {
          fr: "Une page vitrine permet de confronter le message et l'offre au public avant d'investir dans la plateforme.",
          en: "A landing page puts the message and the offer in front of people before investing in the platform.",
        },
      },
    ],
    challenges: [],
    lenses: [
      {
        label: { fr: "Technologie", en: "Technology" },
        text: { fr: "Une vitrine rapide aujourd'hui, une plateforme Django demain.", en: "A fast landing page today, a Django platform tomorrow." },
      },
      {
        label: { fr: "Utilisateur", en: "User" },
        text: { fr: "Des apprenants qui veulent des compétences directement utilisables.", en: "Learners who want skills they can use right away." },
      },
      {
        label: { fr: "Produit", en: "Product" },
        text: { fr: "Formation, services et accompagnement dans une même offre.", en: "Training, services and support in one offer." },
      },
      {
        label: { fr: "Business", en: "Business" },
        text: { fr: "Valider la demande avant de développer.", en: "Validate demand before building." },
      },
    ],
    result: {
      fr: "En préparation : page vitrine réalisée, plateforme amorcée.",
      en: "In preparation: landing page done, platform started.",
    },
    evolution: [
      { fr: "Inscription et paiement Mobile Money", en: "Enrolment and Mobile Money payment" },
      { fr: "Suivi de progression des apprenants", en: "Learner progress tracking" },
    ],
    repo: { fr: "Non publié", en: "Not published" },
    pending: ["Date de lancement prévue"],
  },
  {
    slug: "taxi-compteur",
    code: "005",
    name: "Taxi Compteur",
    status: "academic",
    context: { fr: "Projet académique — mobile", en: "Academic project — mobile" },
    role: { fr: "Développement mobile", en: "Mobile development" },
    period: null,
    summary: {
      fr: "Une application mobile qui met en relation clients et chauffeurs de taxi, avec un tarif calculé selon la distance.",
      en: "A mobile app connecting customers and taxi drivers, with a fare computed from the distance.",
    },
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
];

export const getMission = (slug: string) => missions.find((m) => m.slug === slug);
