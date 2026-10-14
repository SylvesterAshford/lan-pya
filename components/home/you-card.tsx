import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LevelMeter } from "@/components/app/level-meter";
import { Mascot } from "@/components/app/mascot";
import { toMyanmarDigits } from "@/lib/domain/deadlines";
import type { PathProgress } from "@/lib/domain/progress";
import type { getAppCopy } from "@/lib/i18n/app-copy";

export type YouPath = { key: string; title: string; stage: number; total: number; current: boolean };

const SKILLS_SHOWN = 6;

/**
 * Who the learner is, in brief, beside what they should do next: their
 * character and name, their level on this path, every path they have walked
 * with where they stand on it, and the skills their verified work proves.
 * Every line is read from their records; nothing here is the same for two
 * learners.
 */
export function YouCard({
  locale,
  alias,
  headline,
  mascotVariant,
  progress,
  paths,
  verifiedCount,
  skills,
  labels,
}: {
  locale: string;
  alias: string;
  headline: string | null;
  mascotVariant: string;
  progress: PathProgress;
  paths: YouPath[];
  verifiedCount: number;
  skills: string[];
  labels: ReturnType<typeof getAppCopy>["home"]["you"];
}) {
  const num = (value: number) => (locale === "my" ? toMyanmarDigits(value) : String(value));
  const current = paths.find((path) => path.current);
  const more = skills.length - SKILLS_SHOWN;

  return (
    <aside className="you-card" aria-labelledby="you-card-name">
      <header className="you-head">
        <span className="you-avatar" aria-hidden="true"><Mascot size={64} variant={mascotVariant} /></span>
        <span className="you-id">
          <h2 id="you-card-name">{alias}</h2>
          <small>{headline || (current ? labels.learning.replace("{path}", current.title) : labels.noPath)}</small>
        </span>
      </header>

      <LevelMeter progress={progress} locale={locale} variant="compact" />

      <dl className="you-facts">
        <div>
          <dt>{labels.paths}</dt>
          <dd>
            <ul className="you-paths">
              {paths.map((path) => (
                <li key={path.key}>
                  <span className={`you-path-dot${path.current ? " is-current" : ""}`} aria-hidden="true" />
                  <span className="you-path-copy">
                    <strong>{path.title}</strong>
                    <small>
                      {path.current ? labels.now : labels.paused}
                      {path.total ? ` · ${labels.stageOf.replace("{a}", num(path.stage)).replace("{b}", num(path.total))}` : ""}
                    </small>
                  </span>
                </li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt>{labels.verified}</dt>
          <dd>{verifiedCount ? (verifiedCount === 1 ? labels.verifiedOne : labels.verifiedMany.replace("{n}", num(verifiedCount))) : labels.none}</dd>
        </div>
        {skills.length ? (
          <div>
            <dt>{labels.skills}</dt>
            <dd>
              <ul className="you-skills">
                {skills.slice(0, SKILLS_SHOWN).map((skill) => <li key={skill}>{skill}</li>)}
                {more > 0 ? <li className="is-more">{labels.more.replace("{n}", num(more))}</li> : null}
              </ul>
            </dd>
          </div>
        ) : null}
      </dl>

      <footer className="you-links">
        <Link href="/app/profile">{labels.profile}<ArrowRight size={15} aria-hidden="true" /></Link>
        <Link href="/app/proof">{labels.portfolio}<ArrowRight size={15} aria-hidden="true" /></Link>
      </footer>
    </aside>
  );
}
