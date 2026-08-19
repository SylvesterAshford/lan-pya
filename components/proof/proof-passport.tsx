import { Mascot } from "@/components/app/mascot";
import { PointsBadge } from "@/components/app/points-badge";
import { toMyanmarDigits } from "@/lib/domain/deadlines";

/**
 * The proof passport — the block at the top of the Evidence Studio.
 *
 * Founder concept: `public/design/lan-pya-portfolio-evidence-studio.svg`, the
 * navy card at translate(58 244). It carries who the learner is, three counts,
 * and the evidence trail.
 *
 * ---------------------------------------------------------------------------
 * Everything here is passed in
 * ---------------------------------------------------------------------------
 *
 * This page is the product's whole argument: proof beats claims. So this
 * component computes no figure of its own. `completedMissions`,
 * `humanVerified` and `skillsEvidenced` are rendered exactly as given, zero
 * included — a passport that reads 0 / 0 / 0 is the honest picture of an
 * account that has not finished anything yet, and padding it with a friendlier
 * default would be the one lie this screen cannot afford.
 *
 * The same rule covers `availability`. It is `null` when the learner has not
 * said what they are open to, and null renders `labels.noAvailability`. It
 * never fills in "Open to internships", which is a claim a recruiter could
 * act on and nobody made.
 *
 * The trail's four phases come from `trail[].done` and nowhere else. With all
 * four false the strip draws four hollow stops and reads "0/4": not started,
 * stated rather than implied.
 *
 * Every figure — the counts, the level number and the trail ratio — goes
 * through `toMyanmarDigits` under `my`, and every word arrives already
 * localised in `labels`, so no string in this file is user-visible language.
 */
export function ProofPassport({
  locale,
  alias,
  mascotVariant,
  levelName,
  levelRank,
  availability,
  completedMissions,
  humanVerified,
  skillsEvidenced,
  trail,
  labels,
}: {
  locale: string;
  alias: string;
  mascotVariant: string;
  /** Already localised by the caller; this component never picks a name. */
  levelName: string;
  levelRank: number;
  /** Already localised. `null` when the learner has not said — never guessed. */
  availability: string | null;
  completedMissions: number;
  humanVerified: number;
  skillsEvidenced: number;
  trail: { key: "research" | "design" | "build" | "publish"; label: string; done: boolean }[];
  labels: {
    title: string;
    /** Carries "{level}" and "{n}" placeholders. */
    learnerLine: string;
    completed: string;
    verified: string;
    skills: string;
    trailTitle: string;
    noAvailability: string;
  };
}) {
  const my = locale === "my";
  const num = (value: number) => (my ? toMyanmarDigits(value) : String(value));

  // split/join rather than replaceAll: the tsconfig target is ES2017 and this
  // is read on budget Android phones, so nothing here needs a 2021 String
  // method to do a substitution.
  const learnerLine = labels.learnerLine
    .split("{level}")
    .join(levelName)
    .split("{n}")
    .join(num(levelRank));

  const doneCount = trail.reduce((total, step) => total + (step.done ? 1 : 0), 0);

  const counts: { key: string; label: string; value: number }[] = [
    { key: "completed", label: labels.completed, value: completedMissions },
    { key: "verified", label: labels.verified, value: humanVerified },
    { key: "skills", label: labels.skills, value: skillsEvidenced },
  ];

  return (
    <section className="passport" aria-labelledby="passport-name">
      {/* The card is stretched to the height of the résumé builder beside it,
          which leaves a band of empty navy across its middle. This fills it
          with the same ridge line the mission map climbs rather than with
          ornament: the passport is the record of that climb, so the two
          screens share one piece of visual language. Purely decorative, so it
          is hidden from assistive technology and sits behind the content. */}
      <svg className="passport-ridge" viewBox="0 0 600 400" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        {/* Contours across the upper half and the ridge along the foot, so the
            card is drawn on ground rather than on a slab of flat navy. Same
            language as the mission map and the sign-in panel: this is the
            record of a climb, so it sits on one. */}
        <g className="ridge-contours">
          <path d="M-20 96 C 120 62, 260 118, 400 84 C 500 60, 560 78, 620 66" />
          <path d="M-20 156 C 130 120, 270 176, 410 142 C 508 118, 566 136, 620 124" />
          <path d="M-20 220 C 140 182, 282 238, 420 204 C 516 180, 572 198, 620 186" />
        </g>
        <path d="M0 300 L86 250 L142 282 L214 218 L268 266 L338 208 L402 262 L470 228 L536 278 L600 244 L600 400 L0 400 Z" className="ridge-far" />
        <path d="M0 340 L74 306 L150 330 L228 286 L296 322 L372 276 L446 318 L520 292 L600 326 L600 400 L0 400 Z" className="ridge-near" />
      </svg>
      <div className="passport-identity">
        <span className="passport-figure">
          <Mascot size={72} variant={mascotVariant} />
          {/* The level insignia, emblem only. It is hidden from assistive
              technology on purpose: the line directly beside it already states
              the level name and number in words, and the badge's own label
              would read a points figure this component was not given. Nothing
              countable is drawn in `mark` mode, so no unbacked number reaches
              the screen either. */}
          <span className="passport-insignia" aria-hidden="true">
            <PointsBadge
              locale={locale}
              points={0}
              rank={levelRank}
              levelName=""
              labels={{ points: "" }}
              size={40}
              mark
            />
          </span>
        </span>

        <div className="passport-who">
          <p className="passport-eyebrow">{labels.title}</p>
          <h2 className="passport-name" id="passport-name">
            {alias}
          </h2>
          <p className="passport-level">{learnerLine}</p>
          <p className={availability ? "passport-availability" : "passport-availability is-unset"}>
            {availability ?? labels.noAvailability}
          </p>
        </div>
      </div>

      <dl className="passport-counts">
        {counts.map((count) => (
          <div className="passport-count" key={count.key}>
            {/* dt before dd in the DOM, which is the order the spec and screen
                readers expect; CSS `order` lifts the figure above its label
                without inverting the markup. */}
            <dt>{count.label}</dt>
            <dd>{num(count.value)}</dd>
          </div>
        ))}
      </dl>

      <div className="passport-trail">
        <p className="passport-trail-head">
          <span className="passport-trail-title">{labels.trailTitle}</span>{" "}
          {/* How much of the trail is walked, as a ratio of two real numbers.
              This is what keeps the strip honest with no state vocabulary in
              `labels` to lean on: four hollow stops could be read as an empty
              decoration, "0/4" cannot. Digits only, so it needs no
              translation. */}
          <span className="passport-trail-ratio">
            {num(doneCount)}/{num(trail.length)}
          </span>
        </p>
        <ol className="passport-trail-list">
          {trail.map((step) => (
            <li className="passport-step" key={step.key} data-state={step.done ? "done" : "pending"}>
              <span className="passport-step-stop">
                {/* A real text node, not a background colour and not an
                    aria-hidden decoration: the check is announced, survives
                    greyscale, and is language-independent. A stop with nothing
                    in it is a stop not yet reached. */}
                {step.done ? "✓" : ""}
              </span>
              <span className="passport-step-label">{step.label}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
