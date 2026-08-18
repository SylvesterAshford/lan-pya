import { BookOpen, Briefcase, Check, Hammer, Lock, ShieldCheck } from "lucide-react";
import { toMyanmarDigits } from "@/lib/domain/deadlines";

/**
 * Momentum track — Learn -> Build -> Prove -> Opportunity.
 *
 * The four stages are the product's own promise ("From Map to Proof") drawn as
 * one line, so a learner can see where they actually stand without reading four
 * separate panels. It is a *reading* of the dashboard numbers, never a second
 * source of truth: every state below is derived from `completedMilestones` and
 * `verifiedCount`, which come from `ActivePathDashboard`.
 *
 * ── State derivation (the whole rule set, nothing implicit) ──────────────────
 *
 *   Learn        done      completedMilestones >= 1
 *                          Never locked: it is the entry point, and a learner
 *                          with an active path can always read the map.
 *
 *   Build        done      verifiedCount >= 1
 *                          A verified proof cannot exist without built work, so
 *                          verification is the honest evidence that Build
 *                          happened. Not locked at zero — nothing stops a
 *                          learner starting a mission — merely `upcoming`.
 *
 *   Prove        done      verifiedCount >= 3
 *                          Three human-reviewed missions is the Practitioner
 *                          evidence gate in DESIGN.md "Path Progress"; the same
 *                          bar is used here rather than inventing a new one.
 *
 *   Opportunity  locked    verifiedCount === 0
 *                          The one lock the data supports: opportunity
 *                          readiness is scored against proof, so with no
 *                          verified proof there is nothing to match against.
 *                  done    never. Applying to, or winning, an opportunity is
 *                          not recorded anywhere in this product, so this stage
 *                          must not claim completion. It ends at `current`.
 *
 *   current      the earliest stage that is neither done nor locked.
 *                Exactly one stage is current, and the rules above make it fall
 *                out correctly: nothing completed -> Learn; milestones but no
 *                proof -> Build; 1-2 verified proofs -> Prove; 3+ -> Opportunity.
 *                A stage after the current one and before a lock is `upcoming`.
 *
 *   inProgressCount is deliberately NOT part of the state derivation. Work sitting
 *   in review is not evidence that a stage is finished, and promoting Prove on the
 *   strength of a pending submission would be exactly the unearned claim this
 *   product argues against. It is reported as a fact in the summary line instead.
 *
 * Colour is never the only cue (DESIGN.md colour rule 7): done carries a check
 * badge, locked carries a padlock, current carries a ring and `aria-current`.
 */

type StageState = "done" | "current" | "upcoming" | "locked";

const STAGE_ICON = {
  learn: BookOpen,
  build: Hammer,
  prove: ShieldCheck,
  opportunity: Briefcase,
} as const;

export function MomentumTrack({
  locale,
  completedMilestones,
  verifiedCount,
  inProgressCount,
  labels,
}: {
  locale: string;
  completedMilestones: number;
  verifiedCount: number;
  inProgressCount: number;
  labels: {
    title: string;
    summary: string;
    learn: string;
    learnBody: string;
    build: string;
    buildBody: string;
    prove: string;
    proveBody: string;
    opportunity: string;
    opportunityBody: string;
  };
}) {
  const my = locale === "my";
  const num = (value: number) => (my ? toMyanmarDigits(value) : String(value));

  const done = {
    learn: completedMilestones >= 1,
    build: verifiedCount >= 1,
    prove: verifiedCount >= 3,
    opportunity: false,
  };
  const locked = {
    learn: false,
    build: false,
    prove: false,
    opportunity: verifiedCount === 0,
  };

  const order = ["learn", "build", "prove", "opportunity"] as const;
  const currentKey = order.find((key) => !done[key] && !locked[key]);

  const stages = order.map((key) => {
    const state: StageState = done[key]
      ? "done"
      : locked[key]
        ? "locked"
        : key === currentKey
          ? "current"
          : "upcoming";
    return {
      key,
      state,
      Icon: STAGE_ICON[key],
      name: labels[key],
      body: labels[`${key}Body` as const],
    };
  });

  // A connector is solid teal once the learner has reached the node it runs
  // into, dashed grey beyond that. Reached means done or current, so the solid
  // run always ends at the stage the learner is standing on.
  const reached = stages.map((stage) => stage.state === "done" || stage.state === "current");

  const summary = labels.summary
    .replace("{a}", num(completedMilestones))
    .replace("{b}", num(inProgressCount));

  return (
    <section className="momentum" aria-labelledby="momentum-heading">
      <div className="momentum-lede">
        <h2 id="momentum-heading" className="momentum-title">
          {labels.title}
        </h2>
        <p className="momentum-summary">{summary}</p>
      </div>

      <ol className="momentum-track">
        {stages.map((stage, index) => {
          const lineIn = index > 0 && reached[index];
          const lineOut = index < stages.length - 1 && stage.state === "done";
          return (
            <li
              key={stage.key}
              className={[
                "momentum-stage",
                `is-${stage.state}`,
                index === 0 ? "is-first" : "",
                index === stages.length - 1 ? "is-last" : "",
                lineIn ? "line-in-solid" : "",
                lineOut ? "line-out-solid" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-current={stage.state === "current" ? "step" : undefined}
            >
              <span className="momentum-mark">
                <span className="momentum-disc">
                  <stage.Icon size={18} aria-hidden="true" strokeWidth={2} />
                </span>
                {stage.state === "done" ? (
                  <span className="momentum-badge is-done">
                    <Check size={11} aria-hidden="true" strokeWidth={3} />
                  </span>
                ) : null}
                {stage.state === "locked" ? (
                  <span className="momentum-badge is-locked">
                    <Lock size={11} aria-hidden="true" strokeWidth={2.5} />
                  </span>
                ) : null}
              </span>
              <span className="momentum-name">{stage.name}</span>
              <span className="momentum-body">{stage.body}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
