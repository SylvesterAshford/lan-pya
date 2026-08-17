/**
 * Category artwork for opportunity cards.
 *
 * Design Spec §8 forbids photography on core screens: stock imagery of students
 * reads generic, risks depicting identifiable people, and costs mobile data that
 * this audience pays for. So each category gets generated geometry instead —
 * a few hundred bytes, sharp at any zoom, and distinct enough to recognise a
 * listing type before reading the label.
 *
 * Colour stays inside the teal family. Amber means urgency and purple means the
 * global track; neither is available for decoration (DESIGN.md colour rules), so
 * the categories differ by composition rather than hue.
 */

type Category = "challenge" | "internship" | "scholarship" | "fellowship" | "hackathon" | "event" | "webinar" | "job" | "default";

function normalise(type: string): Category {
  const value = type.toLowerCase();
  if (value.includes("challenge")) return "challenge";
  if (value.includes("intern")) return "internship";
  if (value.includes("scholar")) return "scholarship";
  if (value.includes("fellow")) return "fellowship";
  if (value.includes("hack")) return "hackathon";
  if (value.includes("webinar")) return "webinar";
  if (value.includes("event")) return "event";
  if (value.includes("job")) return "job";
  return "default";
}

export function CategoryArt({ type, className }: { type: string; className?: string }) {
  const category = normalise(type);

  return (
    <svg className={className} viewBox="0 0 320 132" role="presentation" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="132" fill="var(--teal-050)" />

      {category === "challenge" ? (
        <g>
          {/* Angle brackets converging on a target: a build task with a bar to clear. */}
          <path d="M92 44 L64 66 L92 88" fill="none" stroke="var(--teal-500)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M228 44 L256 66 L228 88" fill="none" stroke="var(--teal-500)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="160" cy="66" r="30" fill="none" stroke="var(--teal-700)" strokeWidth="6" />
          <circle cx="160" cy="66" r="11" fill="var(--teal-700)" />
        </g>
      ) : null}

      {category === "internship" ? (
        <g transform="translate(0,-16)">
          {/* A building rising in steps: structured time inside an organisation. */}
          <rect x="88" y="72" width="42" height="46" rx="4" fill="var(--teal-100)" />
          <rect x="138" y="46" width="42" height="72" rx="4" fill="var(--teal-500)" />
          <rect x="188" y="60" width="42" height="58" rx="4" fill="var(--teal-700)" />
          <g fill="var(--teal-050)" opacity="0.85">
            <rect x="148" y="58" width="9" height="9" rx="1.5" /><rect x="163" y="58" width="9" height="9" rx="1.5" />
            <rect x="148" y="74" width="9" height="9" rx="1.5" /><rect x="163" y="74" width="9" height="9" rx="1.5" />
            <rect x="198" y="72" width="9" height="9" rx="1.5" /><rect x="213" y="72" width="9" height="9" rx="1.5" />
          </g>
        </g>
      ) : null}

      {category === "scholarship" ? (
        <g transform="translate(0,-20)">
          {/* A rosette: recognition, awarded rather than applied-for. */}
          <circle cx="160" cy="56" r="27" fill="var(--teal-700)" />
          <circle cx="160" cy="56" r="15" fill="var(--teal-050)" />
          <path d="M143 78 L134 118 L160 104 L186 118 L177 78 Z" fill="var(--teal-500)" />
          <path d="M160 44 L164 53 L173 53 L166 59 L169 68 L160 62 L151 68 L154 59 L147 53 L156 53 Z" fill="var(--teal-500)" />
        </g>
      ) : null}

      {category === "fellowship" ? (
        <g>
          {/* Three linked rings: a cohort you join, not a task you finish. */}
          <circle cx="126" cy="66" r="26" fill="none" stroke="var(--teal-500)" strokeWidth="6" />
          <circle cx="160" cy="66" r="26" fill="none" stroke="var(--teal-700)" strokeWidth="6" />
          <circle cx="194" cy="66" r="26" fill="none" stroke="var(--teal-500)" strokeWidth="6" />
        </g>
      ) : null}

      {category === "hackathon" ? (
        <g>
          {/* A spark on a timeline: short, fast, fixed window. */}
          <path d="M56 92 L120 92 L142 40 L178 106 L200 76 L264 76" fill="none" stroke="var(--teal-700)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="142" cy="40" r="9" fill="var(--teal-500)" />
        </g>
      ) : null}

      {category === "webinar" || category === "event" ? (
        <g>
          {/* Broadcast arcs from a point: one to many, at a set time. */}
          <circle cx="160" cy="72" r="13" fill="var(--teal-700)" />
          {[30, 50, 70].map((r, i) => (
            <path key={r} d={`M${160 - r} 72 A ${r} ${r} 0 0 1 ${160 + r} 72`} fill="none" stroke="var(--teal-500)" strokeWidth="5" strokeLinecap="round" opacity={0.85 - i * 0.22} />
          ))}
        </g>
      ) : null}

      {category === "job" || category === "default" ? (
        <g transform="translate(0,-8)">
          {/* A door with a path leading to it. */}
          <path d="M48 108 Q108 108 128 78 T208 52" fill="none" stroke="var(--teal-500)" strokeWidth="5" strokeLinecap="round" strokeDasharray="3 9" />
          <rect x="206" y="30" width="58" height="88" rx="5" fill="var(--teal-700)" />
          <rect x="218" y="44" width="34" height="60" rx="3" fill="var(--teal-050)" />
          <circle cx="245" cy="76" r="4" fill="var(--teal-700)" />
        </g>
      ) : null}
    </svg>
  );
}
