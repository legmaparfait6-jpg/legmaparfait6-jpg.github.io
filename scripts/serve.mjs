// Serveur statique minimal pour prévisualiser l'export (dossier out/) tel qu'il
// sera servi en production : index.html par dossier, 404.html sinon.
// Usage : node scripts/serve.mjs [port]
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createGzip } from "node:zlib";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)), "out");
const PORT = Number(process.argv[2] ?? process.env.PORT ?? 4173);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".pdf": "application/pdf",
  ".ico": "image/x-icon",
};

function resolveFile(urlPath) {
  const safe = normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, "");
  const candidate = join(ROOT, safe);
  if (!candidate.startsWith(ROOT)) return null;
  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  const index = join(candidate, "index.html");
  if (existsSync(index)) return index;
  return null;
}

export function startServer(port = PORT) {
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    // Comme Vercel/Netlify avec trailingSlash : /fr/cv -> /fr/cv/
    if (!extname(url.pathname) && !url.pathname.endsWith("/") && resolveFile(`${url.pathname}/`)) {
      res.writeHead(308, { Location: `${url.pathname}/${url.search}` });
      return res.end();
    }
    const file = resolveFile(url.pathname);
    const status = file ? 200 : 404;
    const path = file ?? join(ROOT, "404.html");
    const type = TYPES[extname(path)] ?? "application/octet-stream";
    // Comme GitHub Pages : compression gzip et cache de 10 minutes, sauf pour
    // les pages HTML, toujours revalidées (sinon une page modifiée resterait
    // en cache pendant les tests).
    const compress = /text|javascript|json|xml|svg/.test(type) && /\bgzip\b/.test(req.headers["accept-encoding"] ?? "");
    res.writeHead(status, {
      "Content-Type": type,
      "Cache-Control": type.startsWith("text/html") ? "no-cache" : "max-age=600",
      ...(compress ? { "Content-Encoding": "gzip", Vary: "Accept-Encoding" } : {}),
    });
    const stream = createReadStream(path);
    (compress ? stream.pipe(createGzip()) : stream).pipe(res);
  });
  return new Promise((ok) => server.listen(port, () => ok(server)));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!existsSync(ROOT)) {
    console.error("Dossier out/ introuvable : lancez d'abord `npm run build`.");
    process.exit(1);
  }
  await startServer();
  console.log(`Export servi sur http://localhost:${PORT}`);
}
