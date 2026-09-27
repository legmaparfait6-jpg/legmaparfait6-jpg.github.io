// Génère les CV PDF (FR et EN, versions complète et ATS) à partir de l'export.
//
// Pilote le navigateur déjà installé (Edge, sinon Chrome) via playwright-core :
// on attend que les polices soient chargées et on imprime les fonds (bandeau
// sombre). Le texte reste réel : sélectionnable et lisible par les ATS.
//
// Usage : npm run build && npm run cv:pdf   (puis rebuild pour publier les PDF)
import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { startServer } from "./serve.mjs";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const PORT = 4174;
const TARGETS = [
  { path: "/fr/cv/", file: "Legma-Parfait-CV-FR.pdf" },
  { path: "/en/cv/", file: "Legma-Parfait-CV-EN.pdf" },
  // Version une colonne, texte simple, pour les portails de recrutement (ATS).
  { path: "/fr/cv/ats/", file: "Legma-Parfait-CV-ATS-FR.pdf", plain: true },
  { path: "/en/cv/ats/", file: "Legma-Parfait-CV-ATS-EN.pdf", plain: true },
];

if (!existsSync(join(ROOT, "out"))) {
  console.error("Dossier out/ introuvable : lancez d'abord `npm run build`.");
  process.exit(1);
}

async function launch() {
  for (const channel of ["msedge", "chrome"]) {
    try {
      return await chromium.launch({ channel });
    } catch {
      // navigateur absent : on essaie le suivant
    }
  }
  throw new Error("Ni Edge ni Chrome n'ont été trouvés.");
}

const server = await startServer(PORT);
const browser = await launch();
const publicDir = join(ROOT, "public", "cv");
const outDir = join(ROOT, "out", "cv");
mkdirSync(publicDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

try {
  const page = await browser.newPage();
  // Pas d'écran d'amorçage ni de scène 3D pendant l'impression.
  await page.emulateMedia({ reducedMotion: "reduce", media: "print" });
  for (const { path, file, plain } of TARGETS) {
    await page.goto(`http://localhost:${PORT}${path}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const target = join(publicDir, file);
    // Version ATS : aucun fond, texte noir sur papier blanc.
    await page.pdf({ path: target, printBackground: !plain, preferCSSPageSize: true });
    copyFileSync(target, join(outDir, file));
    console.log(`${file}  ${Math.round(statSync(target).size / 1024)} Ko`);
  }
} finally {
  await browser.close();
  server.close();
}
