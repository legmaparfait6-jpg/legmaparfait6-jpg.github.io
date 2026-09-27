import { notFound } from "next/navigation";
import { About } from "@/components/home/About";
import { Finale } from "@/components/home/Finale";
import { Hero } from "@/components/home/Hero";
import { Journey } from "@/components/home/Journey";
import { AiLayer, MobileLayer } from "@/components/home/Layers";
import { LiveOps } from "@/components/home/LiveOps";
import { Method } from "@/components/home/Method";
import { MissionArchive } from "@/components/home/MissionArchive";
import { Skills } from "@/components/home/Skills";
import { SITE_URL, profile } from "@/content/profile";
import { isLang, t } from "@/lib/i18n";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: t(profile.title, lang),
    email: `mailto:${profile.email}`,
    telephone: profile.phone.href,
    url: `${SITE_URL}/${lang}/`,
    image: `${SITE_URL}${profile.photo.src}`,
    sameAs: [profile.github.url],
    address: { "@type": "PostalAddress", addressLocality: "Ouagadougou", addressCountry: "BF" },
    alumniOf: { "@type": "CollegeOrUniversity", name: "Université de l'Unité Africaine" },
    knowsAbout: ["Python", "FastAPI", "Flask", "Next.js", "React", "TypeScript", "PostgreSQL", "Flutter", "SNMP", "Nmap"],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      <Hero lang={lang} />
      <About lang={lang} />
      <Method lang={lang} />
      <LiveOps lang={lang} />
      <Skills lang={lang} />
      <MissionArchive lang={lang} />
      <AiLayer lang={lang} />
      <MobileLayer lang={lang} />
      <Journey lang={lang} />
      <Finale lang={lang} />
    </>
  );
}
