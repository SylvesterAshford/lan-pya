"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { Milestone } from "@/lib/domain/types";
import { RoadmapCanvas, type ForkConfig } from "@/components/app/roadmap-canvas";
import { RoadmapDetailDialog } from "@/components/app/roadmap-detail-dialog";
import { getAppCopy } from "@/lib/i18n/app-copy";

/**
 * The roadmap workspace: canvas at full content width, step brief on demand.
 *
 * The brief was a permanent column here until it became a dialog. Nothing
 * opens on load — a reader arrives at the map, not at a step somebody else
 * picked for them.
 */
export function RoadmapTree({
  locale = "en",
  milestones,
  fork,
}: {
  locale?: string;
  milestones: Milestone[];
  fork?: ForkConfig;
}) {
  const c = getAppCopy(locale).roadmap;
  const statusLabels: Record<Milestone["status"], string> = {
    complete: c.verified,
    active: c.inProgress,
    next: c.next,
    upcoming: c.upcoming,
  };
  const current =
    milestones.find((item) => item.status === "active") ??
    milestones.find((item) => item.status === "next") ??
    milestones[0];

  // Null, always, on first render: the dialog is a response to a click.
  const [openKey, setOpenKey] = useState<string | null>(null);
  const selected = useMemo(
    () => milestones.find((item) => item.key === openKey) ?? null,
    [milestones, openKey],
  );

  // The element that opened the dialog, so focus can go back to exactly where
  // the reader left it. A stage node is an SVG <g>, not an HTMLElement, which
  // is why this is typed on the shared Element interface.
  const triggerRef = useRef<SVGGElement | HTMLElement | null>(null);

  const completedCount = milestones.filter((item) => item.status === "complete").length;
  const progress = milestones.length ? Math.round((completedCount / milestones.length) * 100) : 0;

  function selectMilestone(key: string, trigger: SVGGElement | HTMLElement | null) {
    triggerRef.current = trigger;
    setOpenKey(key);
    window.history.replaceState(null, "", `#milestone-${key}`);
  }

  const closeDetail = useCallback(() => {
    setOpenKey(null);
    // Returning focus to the node keeps a keyboard reader in the map instead
    // of dropping them at the top of the document.
    triggerRef.current?.focus?.();
    triggerRef.current = null;
  }, []);

  /** "Jump to my position ↓" means jump, not open: it moves the reader to the
   *  node on the canvas and hands them focus so Enter opens the brief. */
  function jumpToCurrent() {
    if (!current) return;
    // Milestone keys are authored slugs, so no escaping is needed here.
    const node = document.querySelector<SVGGElement>(`[data-node-key="${current.key}"]`);
    node?.scrollIntoView?.({ behavior: "smooth", block: "center" });
    node?.focus?.();
  }

  // "Continue current mission" goes to the climb, not to a mission detail page.
  // It used to guess a page from the milestone key, which meant every stage on
  // every track landed on one of two hardcoded missions — usually the wrong
  // one, and never the learner's actual position. The climb centres itself on
  // the current stop on arrival, so this lands exactly where the label says.
  const missionsHref = "/app/missions";

  if (!current) return null;

  return (
    <div className="roadmap-workspace">
      <section className="roadmap-canvas" aria-label={locale === "my" ? "သင်ယူမှုလမ်းကြောင်း" : "Learning roadmap"}>
        <header className="roadmap-toolbar">
          <div className="roadmap-progress-copy">
            <span>
              {completedCount}/{milestones.length} {c.milestones} {c.verified.toLowerCase()}
            </span>
            <strong>{progress}%</strong>
          </div>
          <div
            className="roadmap-progress-track"
            aria-label={`${progress}% complete`}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
          <button type="button" className="roadmap-position-link" onClick={jumpToCurrent}>
            {current.status === "active" ? c.jump : c.startHere}
          </button>
        </header>

        <div className="roadmap-legend" aria-label={c.careerTracks}>
          <span><i className="rm-sw rm-sw-stage" />{c.stage ?? "Stage"}</span>
          <span><i className="rm-sw rm-sw-milestone" />{c.milestone ?? "Milestone"}</span>
          <span><i className="rm-sw rm-sw-done" />{c.verified}</span>
          <span><i className="rm-sw rm-sw-path" />{c.path ?? "Path"}</span>
        </div>

        <div className="roadmap-canvas-scroll">
          <RoadmapCanvas
            milestones={milestones}
            selectedKey={openKey ?? ""}
            onSelect={selectMilestone}
            fork={fork}
            labels={{
              stage: c.step,
              verified: c.verified,
              inProgress: c.inProgress,
              upcoming: c.upcoming,
              comingSoon: c.comingSoon ?? c.upcoming,
              // Same wording the climb on Missions uses for the same idea, so
              // the two screens name the learner's position identically.
              youAreHere: locale === "my" ? "သင် ဤနေရာတွင်" : "You are here",
              phase: locale === "my" ? "အဆင့်ပိုင်း" : "Phase",
            }}
          />
        </div>
      </section>

      {selected ? (
        <RoadmapDetailDialog
          locale={locale}
          copy={c}
          milestone={selected}
          statusLabel={statusLabels[selected.status]}
          totalSteps={milestones.length}
          missionHref={missionsHref}
          onClose={closeDetail}
        />
      ) : null}
    </div>
  );
}
