import type { Lang } from "@/lib/i18n";

/**
 * « Transmissions » : annonces de la voix du système (synthèse vocale du
 * navigateur, timbre robotique assumé). La voix présente Legma Parfait à la
 * troisième personne : c'est le système qui parle, pas une imitation.
 * Chaque phrase est prononcée séparément et sert de sous-titre.
 */

export type Transmission = {
  id: string;
  /** Section (id HTML) ou mission (slug) à laquelle l'annonce est rattachée. */
  anchor: string;
  title: Record<Lang, string>;
  lines: Record<Lang, string[]>;
};

export const transmissions: Transmission[] = [
  {
    id: "01-hero",
    anchor: "home",
    title: { fr: "Profil", en: "Profile" },
    lines: {
      fr: [
        "Transmission entrante.",
        "Profil : Legma Parfait. Développeur Full-Stack et IA, basé à Ouagadougou.",
        "Chaque point de ce réseau est une technologie ou un projet réel.",
        "Objectif : transformer des problèmes concrets en systèmes complets, du départ jusqu'au produit en ligne.",
      ],
      en: [
        "Incoming transmission.",
        "Profile: Legma Parfait. Full-stack and AI developer, based in Ouagadougou.",
        "Every point in this network is a real technology or project.",
        "Objective: turn concrete problems into complete systems, from the start to the product online.",
      ],
    },
  },
  {
    id: "02-mission",
    anchor: "about",
    title: { fr: "Parcours", en: "Path" },
    lines: {
      fr: [
        "Parcours.",
        "Licence 3 d'Informatique de Gestion, Université de l'Unité Africaine.",
        "Stage chez Moov Africa : une application de supervision réseau, de la découverte des équipements jusqu'à l'escalade des incidents.",
        "Aujourd'hui : des produits complets, avec l'IA là où elle apporte une vraie valeur.",
      ],
      en: [
        "Path.",
        "Final year of a Business Computing degree, Université de l'Unité Africaine.",
        "Internship at Moov Africa: a network monitoring application, from device discovery to incident escalation.",
        "Today: complete products, with AI where it brings real value.",
      ],
    },
  },
  {
    id: "03-incident",
    anchor: "live",
    title: { fr: "Incident", en: "Incident" },
    lines: {
      fr: [
        "Simulation en cours.",
        "Les règles sont celles de l'application développée en stage.",
        "Trois échecs consécutifs : l'équipement est déclaré en panne.",
        "Une alerte est émise, un ticket s'ouvre avec son délai. Sans réaction à temps, l'escalade est automatique.",
      ],
      en: [
        "Simulation running.",
        "The rules come from the application built during the internship.",
        "Three consecutive failures: the device is declared down.",
        "An alert is raised, a ticket opens with its deadline. Without a timely response, escalation is automatic.",
      ],
    },
  },
  {
    id: "04-fasocommerce",
    anchor: "fasocommerce",
    title: { fr: "FasoCommerce", en: "FasoCommerce" },
    lines: {
      fr: [
        "Mission deux : FasoCommerce.",
        "Constat : de nombreux commerces gèrent tout à la main, avec une connexion limitée et le Mobile Money.",
        "Réponse : une seule plateforme, des modules par métier. Boutique, pressing, restaurant, garage.",
        "Même sans réseau, la caisse continue de vendre.",
      ],
      en: [
        "Mission two: FasoCommerce.",
        "Observation: many businesses manage everything by hand, with limited connectivity and Mobile Money.",
        "Response: one platform, with modules for each trade. Shop, dry cleaning, restaurant, garage.",
        "Even without network, the till keeps selling.",
      ],
    },
  },
  {
    id: "05-forexsaas",
    anchor: "forexsaas",
    title: { fr: "ForexSaaS", en: "ForexSaaS" },
    lines: {
      fr: [
        "Mission trois : ForexSaaS.",
        "Un outil d'aide à la décision : collecte de données de marché, analyse, scores argumentés.",
        "Aucun ordre passé, aucun gain promis. Le système explique, l'humain décide.",
      ],
      en: [
        "Mission three: ForexSaaS.",
        "A decision-support tool: market data collection, analysis, reasoned scores.",
        "No orders placed, no gains promised. The system explains, the human decides.",
      ],
    },
  },
  {
    id: "06-methode",
    anchor: "method",
    title: { fr: "Méthode", en: "Method" },
    lines: {
      fr: [
        "Méthode.",
        "Comprendre avant de coder. Concevoir l'architecture. Construire et tester. Connecter les données.",
        "L'IA intervient ensuite, seulement quand elle apporte une vraie valeur.",
        "Un système n'est jamais terminé : il évolue avec ceux qui l'utilisent.",
      ],
      en: [
        "Method.",
        "Understand before coding. Design the architecture. Build and test. Connect the data.",
        "AI comes next, only when it brings real value.",
        "A system is never finished: it evolves with the people who use it.",
      ],
    },
  },
  {
    id: "07-final",
    anchor: "contact",
    title: { fr: "Canal ouvert", en: "Channel open" },
    lines: {
      fr: [
        "Canal ouvert.",
        "Un projet, une équipe à renforcer, une question : écrivez à Legma Parfait.",
        "Le système n'est jamais terminé. Le prochain chapitre peut s'écrire avec vous.",
        "Fin de transmission.",
      ],
      en: [
        "Channel open.",
        "A project, a team to strengthen, a question: write to Legma Parfait.",
        "The system is never finished. The next chapter can be written with you.",
        "End of transmission.",
      ],
    },
  },
];

export const transmissionFor = (anchor: string) => transmissions.find((t) => t.anchor === anchor);
