"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { Milestone } from "@/lib/domain/types";
import { StatusPill } from "@/components/app/status-pill";

type RoadmapDetail = {
  leftLabel: string;
  left: string[];
  rightLabel: string;
  right: string[];
  estimate: string;
};

const ROADMAP_DETAILS: Record<string, RoadmapDetail> = {
  orientation: {
    leftLabel: "Understand",
    left: ["Browser & web", "Editor setup"],
    rightLabel: "Practice",
    right: ["Files & terminal", "Web terminology"],
    estimate: "1–2 weeks",
  },
  "semantic-html": {
    leftLabel: "Learn",
    left: ["Page structure", "Forms & labels"],
    rightLabel: "Practice",
    right: ["Accessibility basics", "Profile page"],
    estimate: "2–3 weeks",
  },
  "responsive-css": {
    leftLabel: "Learn",
    left: ["Cascade & spacing", "Flexbox & Grid"],
    rightLabel: "Build",
    right: ["Mobile-first layout", "Responsive card"],
    estimate: "3–4 weeks",
  },
  javascript: {
    leftLabel: "Learn",
    left: ["Data & functions", "Events & DOM"],
    rightLabel: "Build",
    right: ["Debugging", "Opportunity tracker"],
    estimate: "4–6 weeks",
  },
  "git-deploy": {
    leftLabel: "Learn",
    left: ["Git workflow", "GitHub repository"],
    rightLabel: "Publish",
    right: ["Project README", "Live deployment"],
    estimate: "2–3 weeks",
  },
  "api-quality": {
    leftLabel: "Learn",
    left: ["Fetch & JSON", "Loading & errors"],
    rightLabel: "Strengthen",
    right: ["Keyboard access", "Performance"],
    estimate: "4–5 weeks",
  },
  "hiring-capstone": {
    leftLabel: "Combine",
    left: ["Product decisions", "Iteration"],
    rightLabel: "Present",
    right: ["Portfolio story", "Partner brief"],
    estimate: "4–6 weeks",
  },
};

const STATUS_LABELS: Record<Milestone["status"], string> = {
  complete: "Verified",
  active: "In progress",
  next: "Next",
  upcoming: "Upcoming",
};

function detailFor(milestone: Milestone): RoadmapDetail {
  if (milestone.left?.length && milestone.right?.length) {
    return {
      leftLabel: milestone.leftLabel ?? "Learn",
      left: milestone.left,
      rightLabel: milestone.rightLabel ?? "Prove",
      right: milestone.right,
      estimate: milestone.estimate ?? "Self-paced",
    };
  }
  return ROADMAP_DETAILS[milestone.key] ?? {
    leftLabel: "Learn",
    left: [milestone.description],
    rightLabel: "Prove",
    right: [milestone.proof],
    estimate: "Self-paced",
  };
}

export function RoadmapTree({ milestones }: { milestones: Milestone[] }) {
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
  const selectedDetail = detailFor(selected);

  return (
    <div className="roadmap-workspace">
      <section className="roadmap-canvas" aria-label="Frontend learning roadmap">
        <header className="roadmap-toolbar">
          <div className="roadmap-progress-copy">
            <span>{completedCount} of {milestones.length} milestones verified</span>
            <strong>{progress}%</strong>
          </div>
          <div className="roadmap-progress-track" aria-label={`${progress}% complete`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <span style={{ width: `${progress}%` }} />
          </div>
          {current ? <a className="roadmap-position-link" href={`#milestone-${current.key}`} onClick={() => selectMilestone(current.key)}>{current.status === "active" ? "Jump to my position ↓" : "Start here ↓"}</a> : null}
        </header>

        <div className="roadmap-legend" aria-label="Roadmap status legend">
          <span><i className="complete" />Verified</span>
          <span><i className="active" />In progress</span>
          <span><i className="upcoming" />Visible next</span>
        </div>

        <div className="roadmap-tree">
          {milestones.map((milestone) => {
            const detail = detailFor(milestone);
            const isSelected = milestone.key === selected.key;
            return (
              <article className={`roadmap-stage ${milestone.status} ${isSelected ? "selected" : ""}`} id={`milestone-${milestone.key}`} key={milestone.key}>
                <div className="roadmap-branch left">
                  <span className="roadmap-branch-label">{detail.leftLabel}</span>
                  {detail.left.map((skill) => <span className="roadmap-skill-node" key={skill}>{skill}</span>)}
                </div>

                <button className="roadmap-core-node" type="button" aria-pressed={isSelected} onClick={() => selectMilestone(milestone.key)}>
                  <span className="roadmap-step">Step {milestone.order}</span>
                  <span className="roadmap-node-status">{STATUS_LABELS[milestone.status]}</span>
                  <strong>{milestone.title}</strong>
                  <span className="roadmap-core-proof">{milestone.proof}</span>
                </button>

                <div className="roadmap-branch right">
                  <span className="roadmap-branch-label">{detail.rightLabel}</span>
                  {detail.right.map((skill) => <span className="roadmap-skill-node" key={skill}>{skill}</span>)}
                </div>

                {isSelected ? <div className="roadmap-mobile-selection"><span>Proof target</span><strong>{milestone.proof}</strong>{milestone.status === "active" ? <Link href="/app/missions/responsive-profile-card">Continue mission →</Link> : null}</div> : null}
              </article>
            );
          })}
        </div>
      </section>

      <aside className={`roadmap-detail-panel ${selected.status}`} id="roadmap-detail" aria-live="polite">
        <div className="roadmap-detail-heading">
          <span className="eyebrow">SELECTED MILESTONE · {String(selected.order).padStart(2, "0")}</span>
          <StatusPill tone={selected.status === "complete" ? "success" : selected.status === "active" ? "warning" : "neutral"}>{STATUS_LABELS[selected.status]}</StatusPill>
        </div>
        <h2>{selected.title}</h2>
        <p>{selected.description}</p>

        <dl className="roadmap-detail-meta">
          <div><dt>Estimated pace</dt><dd>{selectedDetail.estimate}</dd></div>
          <div><dt>Placement</dt><dd>Step {selected.order} of {milestones.length}</dd></div>
        </dl>

        <div className="roadmap-detail-section">
          <span className="roadmap-detail-label">What you will cover</span>
          <ul>{[...selectedDetail.left, ...selectedDetail.right].map((skill) => <li key={skill}>{skill}</li>)}</ul>
        </div>

        <div className="roadmap-proof-target">
          <span>PROOF TARGET</span>
          <strong>{selected.proof}</strong>
          <small>Completion is grounded in submitted work, not a self-reported checkbox.</small>
        </div>

        {selected.status === "active" ? <Link className="button primary full" href="/app/missions/responsive-profile-card">Continue current mission →</Link> : null}
        {selected.status === "complete" ? <Link className="button outline full" href="/app/proof">View verified proof →</Link> : null}
        {selected.status === "next" || selected.status === "upcoming" ? <p className="roadmap-visible-note">This step stays visible now. Your starting point can move when new evidence is verified.</p> : null}
      </aside>
    </div>
  );
}
