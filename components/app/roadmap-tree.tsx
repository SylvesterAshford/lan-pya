"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { Milestone } from "@/lib/domain/types";
import { StatusPill } from "@/components/app/status-pill";
import { getAppCopy } from "@/lib/i18n/app-copy";

type RoadmapDetail = {
  leftLabel: string;
  left: string[];
  rightLabel: string;
  right: string[];
  estimate: string;
};


function detailFor(c: ReturnType<typeof getAppCopy>["roadmap"], milestone: Milestone): RoadmapDetail {
  if (milestone.left?.length && milestone.right?.length) {
    return {
      leftLabel: milestone.leftLabel ?? c.learn,
      left: milestone.left,
      rightLabel: milestone.rightLabel ?? c.prove,
      right: milestone.right,
      estimate: milestone.estimate ?? c.selfPaced,
    };
  }
  // Fallback for milestones that only carry title/description/proof (e.g. from DB rows).
  return {
    leftLabel: c.learn,
    left: [milestone.description],
    rightLabel: c.prove,
    right: [milestone.proof],
    estimate: c.selfPaced,
  };
}

export function RoadmapTree({ locale = "en", milestones }: { locale?: string; milestones: Milestone[] }) {
  const c = getAppCopy(locale).roadmap;
  const statusLabels: Record<Milestone["status"], string> = { complete: c.verified, active: c.inProgress, next: c.next, upcoming: c.upcoming };
  const current = milestones.find((item) => item.status === "active") ?? milestones.find((item) => item.status === "next") ?? milestones[0];
  const [selectedKey, setSelectedKey] = useState(current?.key ?? "");
  const selected = useMemo(
    () => milestones.find((item) => item.key === selectedKey) ?? current,
    [current, milestones, selectedKey],
  );
  const completedCount = milestones.filter((item) => item.status === "complete").length;
  const progress = milestones.length ? Math.round((completedCount / milestones.length) * 100) : 0;

  function selectMilestone(key: string) {
    setSelectedKey(key);
    window.history.replaceState(null, "", `#milestone-${key}`);
  }

  if (!selected) return null;
  const selectedDetail = detailFor(c, selected);

  return (
    <div className="roadmap-workspace">
    <section
      className="roadmap-canvas"
      aria-label={locale === "my" ? "သင်ယူမှုလမ်းကြောင်း" : "Learning roadmap"}
    >
        <header className="roadmap-toolbar">
          <div className="roadmap-progress-copy">
            <span>{completedCount}/{milestones.length} {c.milestones} {c.verified.toLowerCase()}</span>
            <strong>{progress}%</strong>
          </div>
          <div className="roadmap-progress-track" aria-label={`${progress}% complete`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <span style={{ width: `${progress}%` }} />
          </div>
          {current ? <a className="roadmap-position-link" href={`#milestone-${current.key}`} onClick={() => selectMilestone(current.key)}>{current.status === "active" ? c.jump : c.startHere}</a> : null}
        </header>

        <div className="roadmap-legend" aria-label={c.careerTracks}>
          <span><i className="complete" />{c.verified}</span>
          <span><i className="active" />{c.inProgress}</span>
          <span><i className="upcoming" />{c.visibleNext}</span>
        </div>

        <div className="roadmap-tree">
          {milestones.map((milestone) => {
            const detail = detailFor(c, milestone);
            const isSelected = milestone.key === selected.key;
            return (
              <article className={`roadmap-stage ${milestone.status} ${isSelected ? "selected" : ""}`} id={`milestone-${milestone.key}`} key={milestone.key}>
                <div className="roadmap-branch left">
                  <span className="roadmap-branch-label">{detail.leftLabel}</span>
                  {detail.left.map((skill) => <span className="roadmap-skill-node" key={skill}>{skill}</span>)}
                </div>

                <button className="roadmap-core-node" type="button" aria-pressed={isSelected} onClick={() => selectMilestone(milestone.key)}>
                  <span className="roadmap-step">{c.step} {milestone.order}</span>
                  <span className="roadmap-node-status">{statusLabels[milestone.status]}</span>
                  <strong>{milestone.title}</strong>
                  <span className="roadmap-core-proof">{milestone.proof}</span>
                </button>

                <div className="roadmap-branch right">
                  <span className="roadmap-branch-label">{detail.rightLabel}</span>
                  {detail.right.map((skill) => <span className="roadmap-skill-node" key={skill}>{skill}</span>)}
                </div>

                {isSelected ? <div className="roadmap-mobile-selection"><span>{c.proofTarget}</span><strong>{milestone.proof}</strong>{milestone.status === "active" ? <Link href="/app/missions/responsive-profile-card">{c.continueMission}</Link> : null}</div> : null}
              </article>
            );
          })}
        </div>
      </section>

      <aside className={`roadmap-detail-panel ${selected.status}`} id="roadmap-detail" aria-live="polite">
        <div className="roadmap-detail-heading">
          <span className="eyebrow">{c.selected} · {String(selected.order).padStart(2, "0")}</span>
          <StatusPill tone={selected.status === "complete" ? "success" : selected.status === "active" ? "warning" : "neutral"}>{statusLabels[selected.status]}</StatusPill>
        </div>
        <h2>{selected.title}</h2>
        <p>{selected.description}</p>

        <dl className="roadmap-detail-meta">
          <div><dt>{c.estimated}</dt><dd>{selectedDetail.estimate}</dd></div>
          <div><dt>{c.placement}</dt><dd>{c.step} {selected.order}/{milestones.length}</dd></div>
        </dl>

        <div className="roadmap-detail-section">
          <span className="roadmap-detail-label">{c.whatCover}</span>
          <ul>{[...selectedDetail.left, ...selectedDetail.right].map((skill) => <li key={skill}>{skill}</li>)}</ul>
        </div>

        <div className="roadmap-proof-target">
          <span>{c.proofTarget}</span>
          <strong>{selected.proof}</strong>
          <small>{c.completion}</small>
        </div>

        {selected.status === "active" ? <Link className="button primary full" href="/app/missions/responsive-profile-card">{c.continueMission}</Link> : null}
        {selected.status === "complete" ? <Link className="button outline full" href="/app/proof">{c.viewProof}</Link> : null}
        {selected.status === "next" || selected.status === "upcoming" ? <p className="roadmap-visible-note">{c.visibleNote}</p> : null}
      </aside>
    </div>
  );
}
