import { Mascot } from "@/components/app/mascot";
import { PointsBadge } from "@/components/app/points-badge";
import { toMyanmarDigits } from "@/lib/domain/deadlines";
import { localizeLevel, type PathProgress } from "@/lib/domain/progress";

/**
 * Profile hero.
 *
 * Follows the founder's reference layout: a character avatar, a level pill,
 * the name, an identity line, and a row of stat tiles.
 *
 * With one deliberate omission. The reference puts "Leaderboard Rank #200+"
 * under the name, and LAN_PYA_CAREER_QUEST_PLAN.md rules that out: "No global
 * absolute leaderboard at launch", because the research it cites found public
 * absolute rankings discourage lower-ranked learners and reduce perceived
 * competence. The slot instead carries the path and how long the learner has
 * been walking it, which says more about a person than a rank does and is
 * checkable rather than comparative.
 *
 * The third tile is proofs rather than the reference's "Bounty", because
 * bounties do not exist in this product and inventing a zero to fill a tile
 * would be filling space with a promise.
 *
 * Every number here is derived from records the learner can inspect.
 */
export function ProfileHero({
  alias,
  headline,
  avatar,
  editor,
  pathTitle,
  since,
  progress,
  missions,
  proofs,
  isDemo,
  locale,
  labels,
}: {
  alias: string;
  /** The learner's own line. Falls back to the derived path line when unset,
   *  so clearing it restores a real sentence rather than blanking the slot. */
  headline: string | null;
  avatar: string;
  /** Rendered next to the name. Passed in because the hero is a server
   *  component and the editor needs to be a client one. */
  editor?: React.ReactNode;
  pathTitle: string | null;
  /** Formatted month the learner started this path, or null when unknown. */
  since: string | null;
  progress: PathProgress | null;
  missions: number;
  proofs: number;
  isDemo: boolean;
  locale: string;
  labels: { missions: string; steps: string; proofs: string; since: string; noPath: string; demo: string; level: string };
}) {
  const my = locale === "my";
  const num = (value: number) => (my ? toMyanmarDigits(value) : String(value));

  return (
    <section className="profile-hero">
      <div className="profile-hero-figure">
        <Mascot size={132} variant={avatar} />
        {progress ? (
          <span className="profile-level-pill">
            <span className="profile-level-dot" data-hue={progress.level.hue} aria-hidden="true" />
            {localizeLevel(locale, progress.level)}
            <small>{labels.level} {num(progress.level.rank)}</small>
          </span>
        ) : null}
      </div>

      <div className="profile-hero-copy">
        <div className="profile-hero-name">
          <h2>{alias}</h2>
          {editor}
        </div>
        <div className="profile-hero-meta">
        <p className="profile-hero-line">
          {headline ?? (
            <>
              {pathTitle ?? labels.noPath}
              {since ? <span className="profile-since"> · {labels.since} {since}</span> : null}
            </>
          )}
        </p>
        {isDemo ? <span className="avail prev profile-demo">{labels.demo}</span> : null}
        </div>

        <dl className="profile-stats">
          <div>
            <dd>{num(missions)}</dd>
            <dt>{labels.missions}</dt>
          </div>
          <div>
            <dd>{num(progress?.xp ?? 0)}</dd>
            <dt>{labels.steps}</dt>
          </div>
          <div>
            <dd>{num(proofs)}</dd>
            <dt>{labels.proofs}</dt>
          </div>
        </dl>
      </div>

      {/* The collectible badge, not the dotted ring. Same slot, same rule: the
          number and the level name are the learner's real ones, passed in from
          the same `progress` record the tiles above are counted from. */}
      {progress ? (
        <div className="profile-hero-ring">
          <PointsBadge
            locale={locale}
            points={progress.xp}
            rank={progress.level.rank}
            levelName={localizeLevel(locale, progress.level)}
            labels={{ points: labels.steps }}
            size={168}
          />
        </div>
      ) : null}
    </section>
  );
}
