import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { toMyanmarDigits } from "@/lib/domain/deadlines";
import type { Milestone } from "@/lib/domain/types";
import type { getAppCopy } from "@/lib/i18n/app-copy";

/**
 * The stage the learner is on, opened up: what it covers, the topics in it,
 * the proof it asks for, and the two stages after it. Home's left column used
 * to hold only "Up next", which is often empty, leaving a blank half-page
 * beside the card about the learner. This is never empty while a path is
 * chosen, and every line comes from the roadmap the learner is following.
 * Topics are the natural place to hang learning resources later (TODOS.md).
 */
export function StagePanel({
  locale,
  stage,
  total,
  upcoming,
  trackKey,
  labels,
}: {
  locale: string;
  stage: Milestone;
  total: number;
  upcoming: Milestone[];
  trackKey: string;
  labels: ReturnType<typeof getAppCopy>["home"]["stage"];
}) {
  const num = (value: number) => (locale === "my" ? toMyanmarDigits(value) : String(value));
  const groups = [
    { label: stage.leftLabel, items: stage.left ?? [] },
    { label: stage.rightLabel, items: stage.right ?? [] },
  ].filter((group) => group.items.length);

  return (
    <section className="stage-panel" aria-labelledby="stage-panel-title">
      <span className="stage-panel-eyebrow">{labels.title} · {labels.stageOf.replace("{a}", num(stage.order)).replace("{b}", num(total))}</span>
      <h2 id="stage-panel-title">{stage.title}</h2>
      {stage.description ? <p className="stage-panel-body">{stage.description}</p> : null}

      {groups.length ? (
        <div className="stage-topics">
          {groups.map((group) => (
            <div key={group.label ?? group.items[0]}>
              {group.label ? <span className="stage-topics-label">{group.label}</span> : null}
              <ul>
                {group.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      ) : null}

      <dl className="stage-facts">
        {stage.proof ? <div><dt>{labels.proof}</dt><dd>{stage.proof}</dd></div> : null}
        {stage.estimate ? <div><dt>{labels.pace}</dt><dd>{stage.estimate}</dd></div> : null}
      </dl>

      {upcoming.length ? (
        <div className="stage-next">
          <span className="stage-topics-label">{labels.next}</span>
          <ol>
            {upcoming.map((item) => (
              <li key={item.key}>
                <span className="stage-next-num" aria-hidden="true">{num(item.order)}</span>
                <span>{item.title}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <Link className="stage-panel-link" href={`/app/roadmap?track=${trackKey}`}>
        {labels.open}<ArrowRight size={15} aria-hidden="true" />
      </Link>
    </section>
  );
}
