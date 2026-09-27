import type { ReactNode } from "react";
import { RadioTrigger } from "@/components/voice/RadioTrigger";
import type { Lang } from "@/lib/i18n";

type SectionProps = {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  lead?: string;
  /** Annonce de la voix du système rattachée à la section. */
  transmission?: { id: string; lang: Lang };
  children: ReactNode;
};

/** En-tête commun : index numéroté, sur-titre, titre et chapeau. */
export function Section({ id, index, eyebrow, title, lead, transmission, children }: SectionProps) {
  const headingId = `${id}-title`;
  return (
    <section id={id} className="section" aria-labelledby={headingId} data-transmission={transmission?.id}>
      <div className="container">
        <header className="section__head" data-reveal="">
          <p className="section__index meta">
            <span className="dot dot--signal" aria-hidden="true" />
            {index} / {eyebrow}
            {transmission ? <RadioTrigger id={transmission.id} lang={transmission.lang} /> : null}
          </p>
          <h2 id={headingId} className="section__title">
            {title}
          </h2>
          {lead ? <p className="section__lead">{lead}</p> : null}
        </header>
        {children}
      </div>
    </section>
  );
}

export function Arrow({ direction = "right" }: { direction?: "right" | "left" }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={direction === "left" ? { transform: "rotate(180deg)" } : undefined}
    >
      <path d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
