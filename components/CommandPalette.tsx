"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { emit, on, runtime } from "@/lib/bus";
import type { Lang } from "@/lib/i18n";
import { play, setSound, soundEnabled } from "@/lib/sound";

type Command = { id: string; group: string; label: string; hint?: string; keywords: string; run: () => void | string[] };

type Props = {
  lang: Lang;
  missions: { slug: string; code: string; name: string }[];
  sections: { id: string; label: string }[];
  email: string;
  github: string;
  cv: string;
};

const TEXT = {
  fr: {
    placeholder: "Tapez une commande… (ping, open, cv, incident)",
    empty: "Aucune commande ne correspond.",
    goto: "Aller à",
    open: "Ouvrir la mission",
    actions: "Actions",
    system: "Système",
    cv: "Télécharger le CV",
    copy: "Copier l'e-mail",
    copied: "E-mail copié · paquet livré ✓",
    github: "Ouvrir GitHub",
    incident: "Lancer l'incident simulé",
    ping: "ping legma",
    soundOn: "Activer les sons",
    soundOff: "Couper les sons",
    lang: "Switch to English",
    title: "Palette de commandes",
    hint: "↑↓ naviguer · Entrée valider · Échap fermer",
  },
  en: {
    placeholder: "Type a command… (ping, open, cv, incident)",
    empty: "No matching command.",
    goto: "Go to",
    open: "Open mission",
    actions: "Actions",
    system: "System",
    cv: "Download CV",
    copy: "Copy email",
    copied: "Email copied · packet delivered ✓",
    github: "Open GitHub",
    incident: "Run the simulated incident",
    ping: "ping legma",
    soundOn: "Turn sounds on",
    soundOff: "Turn sounds off",
    lang: "Passer en français",
    title: "Command palette",
    hint: "↑↓ navigate · Enter run · Esc close",
  },
} as const;

/** Palette de commandes (Ctrl/⌘ + K ou « / ») façon terminal. */
export function CommandPalette({ lang, missions, sections, email, github, cv }: Props) {
  const tx = TEXT[lang];
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [output, setOutput] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const listId = useId();

  const close = useCallback(() => {
    setOpen(false);
    emit("ui:palette", { open: false });
    restoreRef.current?.focus();
  }, []);

  const goHomeSection = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else router.push(`/${lang}/#${id}`);
    },
    [lang, router],
  );

  const commands = useMemo<Command[]>(() => {
    const list: Command[] = [
      {
        id: "ping",
        group: tx.system,
        label: tx.ping,
        keywords: "ping legma status",
        run: () => {
          const ms = (0.3 + Math.random() * 0.4).toFixed(2);
          return [
            `PING legma (Ouagadougou, BF)`,
            `64 bytes from legma: role=full-stack+ai time=${ms} ms`,
            `stack: python · fastapi · next.js · postgresql · flutter`,
            `--- ${lang === "fr" ? "joignable à" : "reachable at"} ${email} ---`,
          ];
        },
      },
      {
        id: "transmission",
        group: tx.system,
        label: "play transmission",
        hint: lang === "fr" ? "Écouter la voix du système" : "Hear the system voice",
        keywords: "voice voix radio transmission listen écouter audio",
        run: () => emit("voice:play", { id: "01-hero" }),
      },
      {
        id: "guided",
        group: tx.system,
        label: "guided tour",
        hint: lang === "fr" ? "Visite guidée : touchez une section pour l'écouter" : "Guided tour: tap a section to hear it",
        keywords: "guided visite guidée tour voix voice",
        run: () => emit("voice:guided", { enabled: true }),
      },
      {
        id: "incident",
        group: tx.system,
        label: tx.incident,
        keywords: "incident simulation supervision sla live",
        run: () => {
          goHomeSection("live");
          window.setTimeout(() => emit("ui:incident", { replay: true }), 700);
        },
      },
      ...missions.map<Command>((m) => ({
        id: `open-${m.slug}`,
        group: tx.open,
        label: `open ${m.slug}`,
        hint: `${m.code} · ${m.name}`,
        keywords: `open mission ${m.slug} ${m.name}`.toLowerCase(),
        run: () => {
          if (runtime.net) emit("net:dive", { slug: m.slug });
          window.setTimeout(() => router.push(`/${lang}/missions/${m.slug}/`), runtime.net ? 480 : 0);
        },
      })),
      ...sections.map<Command>((s) => ({
        id: `goto-${s.id}`,
        group: tx.goto,
        label: `goto ${s.id}`,
        hint: s.label,
        keywords: `goto aller ${s.id} ${s.label}`.toLowerCase(),
        run: () => goHomeSection(s.id),
      })),
      {
        id: "cv",
        group: tx.actions,
        label: "get cv",
        hint: tx.cv,
        keywords: "cv resume download télécharger",
        run: () => {
          const a = document.createElement("a");
          a.href = cv;
          a.download = "";
          a.click();
        },
      },
      {
        id: "copy",
        group: tx.actions,
        label: "copy email",
        hint: tx.copy,
        keywords: "copy email mail contact copier",
        run: () => {
          void navigator.clipboard?.writeText(email);
          play("copy");
          return [tx.copied, email];
        },
      },
      {
        id: "github",
        group: tx.actions,
        label: "open github",
        hint: tx.github,
        keywords: "github code repo",
        run: () => {
          window.open(github, "_blank", "noopener,noreferrer");
        },
      },
      {
        id: "sound",
        group: tx.system,
        label: soundEnabled() ? "sound off" : "sound on",
        hint: soundEnabled() ? tx.soundOff : tx.soundOn,
        keywords: "sound son audio",
        run: () => setSound(!soundEnabled()),
      },
      {
        id: "lang",
        group: tx.system,
        label: lang === "fr" ? "lang en" : "lang fr",
        hint: tx.lang,
        keywords: "lang language langue english français",
        run: () => router.push(window.location.pathname.replace(/^\/(fr|en)/, `/${lang === "fr" ? "en" : "fr"}`)),
      },
    ];
    return list;
    // `open` fait partie des dépendances pour relire soundEnabled() à chaque ouverture.
  }, [tx, missions, sections, email, github, cv, lang, router, goHomeSection, open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => `${c.label} ${c.hint ?? ""} ${c.keywords}`.toLowerCase().includes(q));
  }, [commands, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement | null)?.closest("input, textarea, [contenteditable]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        restoreRef.current = document.activeElement as HTMLElement | null;
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    const off = on("ui:palette", ({ open: next }) => {
      if (next) restoreRef.current = document.activeElement as HTMLElement | null;
      setOpen(next);
    });
    return () => {
      window.removeEventListener("keydown", onKey);
      off();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    setOutput([]);
    play("open");
    const id = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => setActive(0), [query]);

  const execute = (cmd: Command | undefined) => {
    if (!cmd) return;
    play("click");
    const result = cmd.run();
    if (Array.isArray(result)) {
      setOutput(result);
      return;
    }
    close();
  };

  if (!open) return null;

  return (
    <div className="palette" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="palette__panel" role="dialog" aria-modal="true" aria-label={tx.title}>
        <div className="palette__input-row">
          <span className="palette__prompt" aria-hidden="true">
            ›
          </span>
          <input
            ref={inputRef}
            className="palette__input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tx.placeholder}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={filtered[active] ? `${listId}-${filtered[active]!.id}` : undefined}
            aria-autocomplete="list"
            spellCheck={false}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, filtered.length - 1));
                play("tick");
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
                play("tick");
              } else if (e.key === "Enter") {
                e.preventDefault();
                execute(filtered[active]);
              } else if (e.key === "Escape") {
                e.preventDefault();
                close();
              } else if (e.key === "Tab") {
                e.preventDefault();
              }
            }}
          />
          <kbd className="palette__kbd">Esc</kbd>
        </div>

        {output.length > 0 ? (
          <pre className="palette__output" aria-live="polite">
            {output.join("\n")}
          </pre>
        ) : null}

        <ul id={listId} className="palette__list" role="listbox" aria-label={tx.title}>
          {filtered.length === 0 ? <li className="palette__empty">{tx.empty}</li> : null}
          {filtered.map((cmd, i) => (
            <li
              key={cmd.id}
              id={`${listId}-${cmd.id}`}
              role="option"
              aria-selected={i === active}
              className="palette__item"
              onMouseEnter={() => setActive(i)}
              onClick={() => execute(cmd)}
            >
              <span className="palette__label">{cmd.label}</span>
              {cmd.hint ? <span className="palette__hint">{cmd.hint}</span> : null}
              <span className="palette__group">{cmd.group}</span>
            </li>
          ))}
        </ul>
        <p className="palette__foot meta">{tx.hint}</p>
      </div>
    </div>
  );
}
