import type { MetadataRoute } from "next";
import { missions } from "@/content/missions";
import { SITE_URL } from "@/content/profile";
import { LANGS } from "@/lib/i18n";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/cv/", ...missions.map((m) => `/missions/${m.slug}/`)];
  return paths.flatMap((path) =>
    LANGS.map((lang) => ({
      url: `${SITE_URL}/${lang}${path}`,
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.7,
      alternates: { languages: Object.fromEntries(LANGS.map((l) => [l, `${SITE_URL}/${l}${path}`])) },
    })),
  );
}
