// Génère les CV PDF (FR et EN) à partir des pages /fr/cv/ et /en/cv/ de l'export.
// Le navigateur (Edge ou Chrome) imprime la page en A4 : le texte reste réel,
// donc sélectionnable et lisible par les ATS.
//
// Usage : npm run build && npm run cv:pdf   (puis rebuild pour publier les PDF)
// Variable facultative : BROWSER_PATH=chemin/vers/chrome.exe
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { startServer } from "./serve.mjs";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const PORT = 4174;
const TARGETS = [
  { lang: "fr", file: "Legma-Parfait-CV-FR.pdf" },
  { lang: "en", file: "Legma-Parfait-CV-EN.pdf" },
];

const CANDIDATES = [
  process.env.BROWSER_PATH,
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const browser = CANDIDATES.find((p) => existsSync(p));
if (!browser) {
  console.error("Aucun navigateur Chromium trouvé. Définissez BROWSER_PATH.");
  process.exit(1);
}
if (!existsSync(join(ROOT, "out"))) {
  console.error("Dossier out/ introuvable : lancez d'abord `npm run build`.");
  process.exit(1);
}

// Profil jetable : sans lui, un Edge déjà ouvert capte la commande et le
// mode headless ne se termine jamais.
const profileDir = mkdtempSync(join(tmpdir(), "cv-pdf-"));

const server = await startServer(PORT);
const publicDir = join(ROOT, "public", "cv");
const outDir = join(ROOT, "out", "cv");
mkdirSync(publicDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

try {
  for (const { lang, file } of TARGETS) {
    const target = join(publicDir, file);
    // Appel asynchrone : un appel synchrone bloquerait le serveur local qui
    // doit justement répondre au navigateur.
    await promisify(execFile)(
      browser,
      [
        "--headless=new",
        `--user-data-dir=${profileDir}`,
        "--disable-gpu",
        "--no-first-run",
        "--no-pdf-header-footer",
        "--run-all-compositor-stages-before-draw",
        "--virtual-time-budget=8000",
        `--print-to-pdf=${target}`,
        `http://localhost:${PORT}/${lang}/cv/`,
      ],
      { timeout: 60_000 },
    );
    copyFileSync(target, join(outDir, file));
    console.log(`${file}  ${Math.round(statSync(target).size / 1024)} Ko`);
  }
} finally {
  server.close();
  rmSync(profileDir, { recursive: true, force: true });
}
