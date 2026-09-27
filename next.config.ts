import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Un package-lock.json existe plus haut dans l'arborescence : on fixe la racine du projet.
  turbopack: { root: path.join(__dirname) },
  // Site 100 % statique : hébergeable sur GitHub Pages ou tout serveur de fichiers.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // Code source lisible dans les outils du navigateur (le dépôt est public).
  productionBrowserSourceMaps: true,
  experimental: {
    // Page 404 unique pour un layout racine dynamique (app/[lang]).
    globalNotFound: true,
    // CSS intégré à la page : aucun aller-retour réseau avant le premier affichage
    // (visiteurs majoritairement nouveaux, CSS d'environ 10 Ko compressé).
    inlineCss: true,
  },
};

export default nextConfig;
