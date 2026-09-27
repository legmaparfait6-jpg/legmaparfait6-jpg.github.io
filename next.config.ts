import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Un package-lock.json existe plus haut dans l'arborescence : on fixe la racine du projet.
  turbopack: { root: path.join(__dirname) },
  // Site 100 % statique : hébergeable sur Vercel, Netlify ou tout serveur de fichiers.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  experimental: {
    // Page 404 unique pour un layout racine dynamique (app/[lang]).
    globalNotFound: true,
  },
};

export default nextConfig;
