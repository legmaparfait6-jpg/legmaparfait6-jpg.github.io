import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  title: "404 — Signal perdu / Signal lost",
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="fr" className={`${geist.variable} ${geistMono.variable}`}>
      <body>
        <main className="container" style={{ minHeight: "100svh", display: "grid", alignContent: "center", gap: 24 }}>
          <p className="status status--active">
            <span className="dot dot--progress" aria-hidden="true" />
            404 · Signal perdu
          </p>
          <h1 style={{ fontSize: "var(--fs-h1)", maxWidth: "16ch" }}>Cette page n&apos;existe pas dans le système.</h1>
          <p lang="en" style={{ color: "var(--text-2)" }}>
            This page does not exist in the system.
          </p>
          <p style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <a className="btn btn--primary" href="/fr/">
              Retour à l&apos;accueil
            </a>
            <a className="btn" href="/en/" lang="en">
              Back to home
            </a>
          </p>
        </main>
      </body>
    </html>
  );
}
