import { STATUS_LABEL, type MissionStatus } from "@/content/missions";
import { type Lang, t } from "@/lib/i18n";

const DOT: Partial<Record<MissionStatus, string>> = {
  delivered: "dot--signal",
  active: "dot--progress",
};

export function StatusBadge({ status, lang }: { status: MissionStatus; lang: Lang }) {
  return (
    <p className={`status status--${status}`}>
      <span className={`dot ${DOT[status] ?? ""}`} aria-hidden="true" />
      <span>
        <span className="sr-only">{lang === "fr" ? "Statut : " : "Status: "}</span>
        {t(STATUS_LABEL[status], lang)}
      </span>
    </p>
  );
}
