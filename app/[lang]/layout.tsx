import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import "../network.css";
import "../experience.css";
import { Analytics } from "@/components/Analytics";
import { CommandPalette } from "@/components/CommandPalette";
import { Header } from "@/components/Header";
import { MobileDock } from "@/components/MobileDock";
import { TransmissionPlayer } from "@/components/voice/TransmissionPlayer";
import { transmissions } from "@/content/transmissions";
import { Footer } from "@/components/Footer";
import { NetworkStage } from "@/components/network/NetworkStage";
import { Probe } from "@/components/network/Probe";
import { RevealObserver } from "@/components/RevealObserver";
import { SoundInit } from "@/components/SoundInit";
import { buildGraph } from "@/content/graph";
import { missions } from "@/content/missions";
import { SITE_URL, profile } from "@/content/profile";
import { live, nav, ui } from "@/content/story";
import { LANGS, isLang, t, typo } from "@/lib/i18n";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const dynamicParams = false;

const HEAD_SCRIPT = `(function(){var d=document.documentElement;d.classList.replace('no-js','js');try{if(sessionStorage.getItem('lp-intro')||matchMedia('(prefers-reduced-motion: reduce)').matches)return;sessionStorage.setItem('lp-intro','1');d.classList.add('is-intro');setTimeout(function(){d.classList.remove('is-intro')},3200)}catch(e){}})()`;

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
    <html lang={lang} className={`no-js ${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Animations d'apparition seulement avec JavaScript ; écran d'amorçage
            une fois par session, jamais si le mouvement est réduit. */}
        <script dangerouslySetInnerHTML={{ __html: HEAD_SCRIPT }} />
      </head>
      <body>
        <div className="boot-screen" aria-hidden="true">
          <span className="boot-screen__line" />
          <p className="boot-screen__label">
            <span>{profile.name}</span>
            <span className="boot-screen__count" />
          </p>
        </div>
        <a className="skip-link" href="#main">
          {t(ui.skip, lang)}
        </a>
        <div className="progress-bar" aria-hidden="true" />
        <NetworkStage graph={buildGraph(lang)} />
        <Header lang={lang} />
        <main id="main">{children}</main>
        <Footer lang={lang} />
        <RevealObserver />
        <Probe />
        <SoundInit />
        <Analytics code={profile.integrations.goatcounterCode} />
        <MobileDock lang={lang} cv={profile.cv[lang]} />
        <TransmissionPlayer
          lang={lang}
          items={transmissions.map((tr) => ({
            id: tr.id,
            anchor: tr.anchor,
            title: tr.title[lang],
            lines: tr.lines[lang].map((line) => typo(line, lang)),
          }))}
        />
        <CommandPalette
          lang={lang}
          missions={missions.map((m) => ({ slug: m.slug, code: m.code, name: m.name }))}
          sections={[
            ...nav.slice(1).map((s) => ({ id: s.id, label: t(s.label, lang) })),
            { id: "live", label: t(live.eyebrow, lang) },
          ]}
          email={profile.email}
          github={profile.github.url}
          cv={profile.cv[lang]}
        />
      </body>
    </html>
  );
}
