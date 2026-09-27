import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RevealObserver } from "@/components/RevealObserver";
import { SITE_URL, profile } from "@/content/profile";
import { ui } from "@/content/story";
import { LANGS, isLang, t } from "@/lib/i18n";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: "#0a0b0d",
  colorScheme: "dark",
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const title = `${profile.name} — ${t(profile.title, lang)}`;
  const description =
    lang === "fr"
      ? "Développeur Full-Stack & IA basé à Ouagadougou. Je transforme des problèmes et des besoins métier en solutions numériques concrètes : backend, API, web, mobile et automatisation."
      : "Full-Stack & AI developer based in Ouagadougou. I turn problems and business needs into concrete digital solutions: backend, APIs, web, mobile and automation.";

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s — ${profile.name}` },
    description,
    authors: [{ name: profile.name }],
    creator: profile.name,
    alternates: {
      canonical: `/${lang}/`,
      languages: { fr: "/fr/", en: "/en/", "x-default": "/fr/" },
    },
    openGraph: {
      type: "website",
      siteName: profile.name,
      title,
      description,
      locale: lang === "fr" ? "fr_FR" : "en_US",
      url: `/${lang}/`,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/og.png"] },
    icons: { icon: "/favicon.svg" },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <html lang={lang} className={`no-js ${geist.variable} ${geistMono.variable}`}>
      <head>
        {/* Active les animations d'apparition uniquement quand JavaScript est disponible. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.replace('no-js','js')",
          }}
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          {t(ui.skip, lang)}
        </a>
        <div className="progress-bar" aria-hidden="true" />
        <Header lang={lang} />
        <main id="main">{children}</main>
        <Footer lang={lang} />
        <RevealObserver />
      </body>
    </html>
  );
}
