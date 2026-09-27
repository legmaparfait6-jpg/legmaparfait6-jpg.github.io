import type { L } from "@/lib/i18n";

/**
 * Identité et coordonnées. Source unique pour le portfolio, le CV et le SEO.
 * SITE_URL : à remplacer par le domaine définitif une fois choisi.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://legma-portfolio.vercel.app";

export const profile = {
  name: "Legma Parfait",
  title: { fr: "Développeur Full-Stack & IA", en: "Full-Stack Developer & AI" } satisfies L,
  location: { fr: "Ouagadougou, Burkina Faso", en: "Ouagadougou, Burkina Faso" } satisfies L,
  email: "legmaparfait6@gmail.com",
  phone: { display: "+226 72 61 81 67", href: "+22672618167" },
  github: { user: "legmaparfait6-jpg", url: "https://github.com/legmaparfait6-jpg" },
  cv: {
    fr: "/cv/Legma-Parfait-CV-FR.pdf",
    en: "/cv/Legma-Parfait-CV-EN.pdf",
  } satisfies L,
  education: {
    degree: { fr: "Licence 3 — Informatique de Gestion", en: "Bachelor's degree (3rd year) — Business Computing" } satisfies L,
    school: { fr: "Université de l'Unité Africaine (UA), ex-IAM", en: "Université de l'Unité Africaine (UA), formerly IAM" } satisfies L,
    period: "2025–2026",
  },
  languages: [
    { name: { fr: "Français", en: "French" }, level: { fr: "Courant", en: "Fluent" } },
    { name: { fr: "Anglais", en: "English" }, level: { fr: "Intermédiaire", en: "Intermediate" } },
  ] satisfies { name: L; level: L }[],
  certifications: [
    {
      name: { fr: "Bureautique et design — Word, Excel, PowerPoint, Canva", en: "Office and design — Word, Excel, PowerPoint, Canva" },
      // Organisme et année à renseigner quand ils seront fournis.
      issuer: null as string | null,
      year: null as string | null,
    },
  ],
} as const;
