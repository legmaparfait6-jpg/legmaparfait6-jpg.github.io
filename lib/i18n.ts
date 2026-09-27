export const LANGS = ["fr", "en"] as const;
export type Lang = (typeof LANGS)[number];

/** Texte disponible dans les deux langues. */
export type L = Record<Lang, string>;

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

const NARROW_NBSP = " ";

/**
 * Typographie : apostrophe courbe dans les deux langues ; en français,
 * espace fine insécable avant « ? ! ; : » et à l'intérieur des guillemets,
 * pour qu'aucun signe ne se retrouve seul en début de ligne.
 */
export function typo(text: string, lang: Lang): string {
  let out = text.replace(/(\p{L})'(\p{L})/gu, "$1’$2");
  if (lang === "fr") {
    out = out
      .replace(/ ([?!;:»])/g, `${NARROW_NBSP}$1`)
      .replace(/« /g, `«${NARROW_NBSP}`);
  }
  return out;
}

export function t(text: L, lang: Lang): string {
  return typo(text[lang], lang);
}

/** Préfixe d'URL d'une langue : /fr ou /en. */
export function href(lang: Lang, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `/${lang}${clean === "/" ? "/" : clean.endsWith("/") ? clean : `${clean}/`}`;
}

export const otherLang = (lang: Lang): Lang => (lang === "fr" ? "en" : "fr");
