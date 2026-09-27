import type { L } from "@/lib/i18n";

/**
 * Identité et coordonnées. Source unique pour le portfolio, le CV et le SEO.
 * SITE_URL : adresse GitHub Pages (dépôt legmaparfait6-jpg.github.io).
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://legmaparfait6-jpg.github.io";

export const profile = {
  name: "Legma Parfait",
  title: { fr: "Développeur Full-Stack & IA", en: "Full-Stack Developer & AI" } satisfies L,
  location: { fr: "Ouagadougou, Burkina Faso", en: "Ouagadougou, Burkina Faso" } satisfies L,
  email: "legmaparfait6@gmail.com",
  phone: { display: "+226 72 61 81 67", href: "+22672618167" },
  github: { user: "legmaparfait6-jpg", url: "https://github.com/legmaparfait6-jpg" },
  whatsapp: "22672618167",
  /**
   * Services externes (identifiants publics par conception, sans secret) :
   * - web3formsKey : clé d'accès Web3Forms, les messages arrivent par e-mail ;
   * - goatcounterCode : code du site GoatCounter (audience anonyme, sans cookies).
   * Vide = fonction désactivée (le formulaire bascule sur l'e-mail).
   */
  integrations: {
    web3formsKey: "bcb76532-3cce-41b7-8b22-e58616ccf48f",
    goatcounterCode: "",
  },
  photo: {
    src: "/profile/legma-parfait.webp",
    width: 612,
    height: 765,
    alt: {
      fr: "Portrait de Legma Parfait, en col roulé noir sur fond gris",
      en: "Portrait of Legma Parfait wearing a black turtleneck on a grey background",
    } satisfies L,
  },
  cv: {
    fr: "/cv/Legma-Parfait-CV-FR.pdf",
    en: "/cv/Legma-Parfait-CV-EN.pdf",
  } satisfies L,
  /** Version une colonne, texte simple, pour les portails de recrutement (ATS). */
  cvAts: {
    fr: "/cv/Legma-Parfait-CV-ATS-FR.pdf",
    en: "/cv/Legma-Parfait-CV-ATS-EN.pdf",
  } satisfies L,
  education: {
    degree: { fr: "Licence 3 — Informatique de Gestion", en: "Bachelor's degree (3rd year) — Business Computing" } satisfies L,
    school: { fr: "Université de l'Unité Africaine (UA), ex‑IAM", en: "Université de l'Unité Africaine (UA), formerly IAM" } satisfies L,
    period: "2025–2026",
  },
  languages: [
    { name: { fr: "Français", en: "French" }, level: { fr: "Courant", en: "Fluent" } },
    { name: { fr: "Anglais", en: "English" }, level: { fr: "Intermédiaire", en: "Intermediate" } },
  ] satisfies { name: L; level: L }[],
  certifications: [
    {
      name: { fr: "Bureautique et design — Word, Excel, PowerPoint, Canva", en: "Office and design — Word, Excel, PowerPoint, Canva" },
      issuer: "SAPSAP XENDER" as string | null,
      year: "2023" as string | null,
    },
  ],
} as const;
