// Étape post-build de l'export statique.
//
// Le routeur de Next.js demande les préchargements de segments sous un nom
// « aplati » (ex. /fr/__next.$d$lang.__PAGE__.txt : les « / » du chemin de
// segment deviennent des « . »), alors que l'export les écrit dans des
// sous-dossiers (/fr/__next.$d$lang/__PAGE__.txt). Sans correction, chaque
// préchargement produit une 404 dans la console.
// Ce script crée une copie de chaque fichier sous le nom attendu, ce qui
// fonctionne sur n'importe quel hébergeur statique.
import { copyFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = resolve(fileURLToPath(new URL("..", import.meta.url)), "out");

function walk(dir, visit) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      visit(path, name);
      walk(path, visit);
    }
  }
}

function filesIn(dir) {
  return readdirSync(dir, { recursive: true })
    .map((p) => join(dir, String(p)))
    .filter((p) => statSync(p).isFile());
}

if (!existsSync(OUT)) {
  console.error("postbuild : dossier out/ introuvable.");
  process.exit(1);
}

let created = 0;
walk(OUT, (dir, name) => {
  if (!name.startsWith("__next.")) return;
  const parent = resolve(dir, "..");
  for (const file of filesIn(dir)) {
    const nested = relative(dir, file).split(sep).join(".");
    const flat = join(parent, `${name}.${nested}`);
    if (!existsSync(flat)) {
      copyFileSync(file, flat);
      created += 1;
    }
  }
});

console.log(`postbuild : ${created} fichier(s) de préchargement aplati(s).`);
