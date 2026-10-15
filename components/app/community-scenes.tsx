import { Mascot } from "@/components/app/mascot";
import { toMyanmarDigits } from "@/lib/domain/deadlines";

/**
 * The two pictures on the Community page, drawn in the mission map's own
 * palette (the --map-* tokens) so Community looks like part of the same climb.
 *
 * The summit sits behind the podium: the leaders stand at the top of the
 * mountain the trail climbs, flag planted. The mini trail sits in the "You are
 * at" card: one stop per stage, the traveller on the viewer's stage, and how
 * many others stand at each stop. Both are decoration over facts the page
 * already states in words, so they are hidden from assistive technology or
 * carry one summary label.
 */
export function SummitScene() {
  return (
    <svg className="community-summit-art" viewBox="0 0 640 220" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      {/* The terrain stays in the lower half, so the names above the podium
          sit in open sky and stay readable. */}
      <rect width="640" height="220" className="cs-sky" />
      <circle cx="590" cy="48" r="30" className="cs-halo" />
      <circle cx="590" cy="48" r="19" className="cs-sun" />
      <path d="M60 46 q10 -10 22 0 q10 -8 20 2 h-42z M500 30 q8 -8 18 0 q8 -6 16 2 h-34z" className="cs-cloud" />
      <path d="M0 176 L80 152 L150 166 L230 142 L300 162 L390 140 L470 163 L560 142 L640 160 L640 220 L0 220 Z" className="cs-ridge-far" />
      <path d="M560 160 L604 112 L648 160 Z M10 168 L44 128 L78 168 Z" className="cs-peak" />
      <path d="M604 112 L596 124 L603 121 L607 127 L612 120 Z M44 128 L38 138 L43 136 L47 141 L51 135 Z" className="cs-snow" />
      <path d="M0 198 L90 182 L180 194 L260 178 L340 192 L430 180 L520 196 L640 184 L640 220 L0 220 Z" className="cs-ridge-near" />
      {/* The trail climbs in from the left and runs up to the podium. */}
      <path d="M0 214 C 60 206, 110 200, 150 192 S 220 182, 250 180" className="cs-trail" />
    </svg>
  );
}

export function StageTrail({
  locale,
  counts,
  current,
  avatar,
  label,
  stageLabel,
}: {
  locale: string;
  /** Other learners per stage; its length is the number of stages. */
  counts: number[];
  /** The viewer's stage, 0-based; the last stop when they finished. */
  current: number;
  avatar: string;
  /** One sentence that says what the picture shows, for screen readers. */
  label: string;
  /** "Stage {n}", already localised. */
  stageLabel: string;
}) {
  const num = (value: number) => (locale === "my" ? toMyanmarDigits(value) : String(value));
  return (
    <div className="stage-trail" role="img" aria-label={label}>
      <ol className="stage-trail-stops" style={{ gridTemplateColumns: `repeat(${counts.length}, minmax(0, 1fr))` }} aria-hidden="true">
        {counts.map((count, index) => (
          <li key={index} className={index < current ? "done" : index === current ? "here" : ""}>
            <span className="stage-trail-count">{count ? num(count) : ""}</span>
            {index === current ? <span className="stage-trail-traveller"><Mascot size={30} variant={avatar} /></span> : null}
            <span className="stage-trail-stop" />
          </li>
        ))}
      </ol>
      <div className="stage-trail-ends" aria-hidden="true">
        <span>{stageLabel.replace("{n}", num(1))}</span>
        <span>{stageLabel.replace("{n}", num(counts.length))}</span>
      </div>
    </div>
  );
}
