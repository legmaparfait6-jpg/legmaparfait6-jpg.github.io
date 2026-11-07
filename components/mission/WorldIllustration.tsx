import type { MissionWorld } from "@/content/missions";

/** Petite carte orbitale illustrative; elle ne représente pas une capture de l'application. */
export function WorldIllustration({ slug, palette, className }: { slug: string; palette: MissionWorld; className?: string }) {
  const id = slug.replace(/[^a-z0-9-]/gi, "-");
  const gradient = `world-${id}-surface`;
  const haze = `world-${id}-haze`;
  const clip = `world-${id}-clip`;

  return (
    <svg className={className} viewBox="0 0 360 250" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={gradient} cx="34%" cy="27%" r="80%">
          <stop stopColor={palette.light} />
          <stop offset=".48" stopColor={palette.surface} />
          <stop offset="1" stopColor="#080b13" />
        </radialGradient>
        <radialGradient id={haze}>
          <stop stopColor={palette.light} stopOpacity=".34" />
          <stop offset="1" stopColor={palette.surface} stopOpacity="0" />
        </radialGradient>
        <clipPath id={clip}>
          <circle cx="190" cy="125" r="62" />
        </clipPath>
        <filter id={`world-${id}-blur`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>

      <ellipse cx="195" cy="126" rx="115" ry="92" fill={`url(#${haze})`} filter={`url(#world-${id}-blur)`} />
      <g stroke={palette.accent} strokeOpacity=".3">
        <ellipse cx="190" cy="125" rx="143" ry="43" transform="rotate(-18 190 125)" />
        <ellipse cx="190" cy="125" rx="120" ry="30" transform="rotate(22 190 125)" strokeOpacity=".16" />
      </g>
      <circle cx="190" cy="125" r="69" fill={palette.light} fillOpacity=".07" />
      <circle cx="190" cy="125" r="62" fill={`url(#${gradient})`} stroke={palette.accent} strokeOpacity=".76" />
      <g clipPath={`url(#${clip})`} fill={palette.accent} fillOpacity=".34">
        <path d="M116 105c21-18 38-10 48-22 13-16 31-13 40-6l-7 19 18 8-10 14-23 3-12 14-18-7-8 12-20-11-16 2-13-11z" />
        <path d="m219 143 17-9 13 9-5 18-15 9-14-10z" />
        <path d="M129 162c25 4 34 21 60 17l12 17-29 18-34-11-17-22z" fillOpacity=".16" />
      </g>
      <path d="M137 91c15-17 38-27 61-28" stroke={palette.accent} strokeWidth="2" strokeLinecap="round" strokeOpacity=".58" />
      <circle cx="49" cy="75" r="2" fill={palette.accent} />
      <circle cx="297" cy="89" r="3" fill={palette.accent} />
      <circle cx="283" cy="192" r="1.6" fill="#e8edf7" fillOpacity=".8" />
      <circle cx="85" cy="186" r="1.4" fill="#e8edf7" fillOpacity=".56" />
      <circle cx="319" cy="150" r="1.2" fill="#e8edf7" fillOpacity=".66" />
    </svg>
  );
}
