"use client";

import { useEffect, useState } from "react";

export function CopyButton({ value, label, done }: { value: string; label: string; done: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Presse-papiers indisponible (contexte non sécurisé) : le lien reste utilisable.
    }
  };

  return (
    <button type="button" className="copy-btn" data-copied={copied || undefined} onClick={copy} aria-label={`${label} ${value}`}>
      <span aria-live="polite">{copied ? done : label}</span>
    </button>
  );
}
