"use client";

import { useId, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { ChevronDown, ChevronRight, ExternalLink, Target } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { SheetDialog } from "@/components/app/sheet-dialog";
import { Emblem } from "@/components/app/emblem";
import { StageTrail, SummitScene } from "@/components/app/community-scenes";
import type { EmblemKey } from "@/lib/domain/progress";
import { CommunitySettings, type CommunitySettingsValue } from "@/components/app/community-settings";
import type { CommunityLinkKind, CommunityViewer } from "@/lib/domain/community";
import type { getAppCopy } from "@/lib/i18n/app-copy";

export type CommunityLabels = ReturnType<typeof getAppCopy>["community"];

/** One learner, with every string already resolved on the server. */
export type CommunityPersonView = {
  handle: string;
  alias: string;
  initials: string;
  /** "Stage 4 · 2 verified" */
  meta: string;
  /** "Frontend Developer · Stage 4", the card's eyebrow. */
  eyebrow: string;
  /** "2 verified missions" */
  verifiedLabel: string;
  note: string | null;
  /** "420 points" */
  points: string;
  links: { kind: CommunityLinkKind; url: string }[];
  isMe: boolean;
  isSample: boolean;
  /** The emblem of the stage they stand on, the same mark as on the roadmap. */
  emblem: EmblemKey;
};

/** The mini trail in the "You are at" card. */
export type CommunityTrailView = { counts: number[]; current: number; avatar: string; label: string };

export type CommunitySectionView = { key: string; title: string; count: string; people: CommunityPersonView[] };
export type CommunityBoardView = {
  podium: CommunityPersonView[] | null;
  rows: { person: CommunityPersonView; rank: string | null }[];
};

type Tab = "stage" | "leaderboard";
type CardMode = "card" | "report" | "sent" | "join";
const REASONS = ["spam", "fake", "harassment", "other"] as const;

/**
 * Community, both tabs (design doc 2026-10-15, design review A-final).
 *
 * The server has already decided who may be seen (get_community), where each
 * person stands and in what order (lib/domain/community.ts), and every string.
 * This component only switches tabs without a reload (eng review D8), opens a
 * person's card, and runs the two flows that start there: reporting (DR8) and
 * joining from a locked card (DR9).
 */
export function CommunityView({
  locale,
  labels,
  trackKey,
  pathTitle,
  paths,
  activePath,
  isActivePath,
  viewer,
  me,
  sections,
  board,
  settings,
  initialTab,
  trail = null,
  standing = null,
}: {
  locale: string;
  labels: CommunityLabels;
  trackKey: string;
  pathTitle: string;
  paths: { key: string; title: string }[];
  activePath: { key: string; title: string } | null;
  isActivePath: boolean;
  viewer: CommunityViewer;
  me: { title: string; verifiedLabel: string } | null;
  sections: CommunitySectionView[];
  board: CommunityBoardView;
  settings: CommunitySettingsValue;
  initialTab: Tab;
  trail?: CommunityTrailView | null;
  /** "You're #4 · 100 points behind Min Khant", already written; null when unranked. */
  standing?: string | null;
}) {
  const router = useRouter();
  const id = useId();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [open, setOpen] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  const everyone = [...sections.flatMap((section) => section.people), ...board.rows.map((row) => row.person), ...(board.podium ?? [])];
  const person = open ? everyone.find((candidate) => candidate.handle === open) ?? null : null;
  const keep = (candidate: CommunityPersonView) => !removed.has(candidate.handle);
  const shownSections = sections.map((section) => ({ ...section, people: section.people.filter(keep) })).filter((section) => section.people.length);

  function chooseTab(next: Tab) {
    setTab(next);
    // Same data, another order: no request, but the address still says which
    // tab is open so a shared link and the back button agree with the screen.
    const url = new URL(window.location.href);
    if (next === "stage") url.searchParams.delete("tab");
    else url.searchParams.set("tab", next);
    window.history.replaceState(window.history.state, "", url);
  }

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next: Tab = tab === "stage" ? "leaderboard" : "stage";
    chooseTab(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "stage", label: labels.tabs.stage },
    { key: "leaderboard", label: labels.tabs.leaderboard },
  ];

  return (
    <div className="app-page community-page">
      <section className="page-heading compact-heading">
        <h1>{labels.title}</h1>
        <p>{labels.lede}</p>
      </section>

      <div className="community-controls">
        <div className="opp-segmented community-tabs" role="tablist" aria-label={labels.tabs.label}>
          {tabs.map((item) => (
            <button
              key={item.key}
              id={`${id}-tab-${item.key}`}
              type="button"
              role="tab"
              aria-selected={tab === item.key}
              aria-controls={`${id}-panel-${item.key}`}
              tabIndex={tab === item.key ? 0 : -1}
              className={tab === item.key ? "on" : ""}
              onClick={() => chooseTab(item.key)}
              onKeyDown={onTabKey}
            >
              {item.label}
            </button>
          ))}
        </div>
        <CommunityPathSelect label={labels.pathLabel} value={trackKey} paths={paths} tab={tab} />
      </div>

      {viewer.demo ? (
        <p className="community-sample-notice"><strong>{labels.sampleNotice}</strong> {labels.sampleNoticeBody}</p>
      ) : null}

      <div id={`${id}-panel-stage`} role="tabpanel" aria-labelledby={`${id}-tab-stage`} hidden={tab !== "stage"} className="community-panel">
        {isActivePath && me ? (
          <section className="community-you" aria-label={labels.youAreAt}>
            <span className="eyebrow">{labels.youAreAt}</span>
            <strong>{me.title}</strong>
            <small>{me.verifiedLabel}</small>
            {trail ? <StageTrail locale={locale} counts={trail.counts} current={trail.current} avatar={trail.avatar} label={trail.label} stageLabel={labels.rowStage} /> : null}
            {viewer.blocked ? (
              <p className="community-you-line paused">{labels.settings.paused}</p>
            ) : viewer.visible ? (
              <p className="community-you-line on">
                <span className="community-dot" aria-hidden="true" />{labels.visible} · <Link href="/app/profile#community">{labels.edit}</Link>
              </p>
            ) : (
              <p className="community-you-line off">
                {labels.hidden} · <button type="button" className="community-inline-action" onClick={() => setJoining(true)}>{labels.showMe}</button>
              </p>
            )}
          </section>
        ) : (
          <section className="community-you browsing" aria-label={labels.pathLabel}>
            <strong>{labels.browsing.replace("{path}", pathTitle)}</strong>
            {activePath && activePath.key !== trackKey ? (
              <Link className="community-back" href={`/app/community?track=${activePath.key}`}>{labels.backTo.replace("{path}", activePath.title)}</Link>
            ) : null}
          </section>
        )}

        {shownSections.length ? shownSections.map((section) => (
          <section key={section.key} className="community-section" aria-labelledby={`${id}-${section.key}`}>
            <h2 className="eyebrow community-section-title" id={`${id}-${section.key}`}>{section.title} · {section.count}</h2>
            <ul className="community-list">
              {section.people.map((item) => (
                <li key={item.handle}><PersonRow person={item} labels={labels} onOpen={setOpen} /></li>
              ))}
            </ul>
          </section>
        )) : (
          <EmptyPath
            labels={labels}
            locale={locale}
            pathTitle={pathTitle}
            own={isActivePath}
            visible={viewer.visible && !viewer.blocked}
            onJoin={() => setJoining(true)}
          />
        )}
      </div>

      <div id={`${id}-panel-leaderboard`} role="tabpanel" aria-labelledby={`${id}-tab-leaderboard`} hidden={tab !== "leaderboard"} className="community-panel">
        {board.podium ? (
          <div className="community-summit">
          <SummitScene />
          <ol className="community-podium" aria-label={labels.podiumLabel}>
            {board.podium.map((item, index) => (
              <li key={item.handle} className={`community-place place-${index + 1}`}>
                <button type="button" onClick={() => setOpen(item.handle)}>
                  <Avatar person={item} large />
                  <span className="sr-only">{labels.rank.replace("{n}", String(index + 1))}, </span>
                  <span className="community-place-name">{item.alias}</span>
                  <span className="community-place-points">{item.points}</span>
                  {item.isSample ? <span className="community-tag sample">{labels.sample}</span> : null}
                  {item.isMe ? <span className="community-tag you">{labels.you}</span> : null}
                  <span className="community-step" aria-hidden="true">
                    {index + 1}
                    {/* The summit flag, planted on the winner's step. */}
                    {index === 0 ? (
                      <svg className="community-flag" viewBox="0 0 24 32" focusable="false">
                        <line x1="3" y1="32" x2="3" y2="2" className="cs-pole" />
                        <path d="M3 2 L22 7 L3 13 Z" className="cs-flag" />
                      </svg>
                    ) : null}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          </div>
        ) : (
          <div className="community-fills">
            <strong>{labels.fillsTitle}</strong>
            <p>{labels.fillsBody}</p>
          </div>
        )}
        {standing ? <p className="community-standing"><Target size={18} aria-hidden="true" />{standing}</p> : null}
        {board.rows.filter((row) => keep(row.person)).length ? (
          <ol className="community-list ranked">
            {board.rows.filter((row) => keep(row.person)).map(({ person: item, rank }) => (
              <li key={item.handle}>
                <PersonRow person={item} labels={labels} onOpen={setOpen} rank={rank} showPoints />
              </li>
            ))}
          </ol>
        ) : null}
        <p className="community-points-note">{labels.pointsNote}</p>
      </div>

      {person ? (
        <PersonCard
          key={person.handle}
          person={person}
          labels={labels}
          viewer={viewer}
          settings={settings}
          onClose={() => setOpen(null)}
          onReported={() => {
            setRemoved((current) => new Set(current).add(person.handle));
            setOpen(null);
            router.refresh();
          }}
        />
      ) : null}

      {joining ? (
        <SheetDialog labelledBy={`${id}-join`} eyebrow={labels.settings.section} closeLabel={labels.card.close} onClose={() => setJoining(false)}>
          <h2 className="community-card-title" id={`${id}-join`}>{labels.settings.joinTitle}</h2>
          <CommunitySettings initial={settings} labels={labels.settings} mode="join" isDemo={viewer.demo} onSaved={() => setJoining(false)} onCancel={() => setJoining(false)} />
        </SheetDialog>
      ) : null}
    </div>
  );
}

/** The path chip: a native select, so it is keyboard and screen-reader ready. */
export function CommunityPathSelect({ label, value, paths, tab = "stage" }: { label: string; value: string; paths: { key: string; title: string }[]; tab?: Tab }) {
  const router = useRouter();
  return (
    <label className="community-path">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => router.push(`/app/community?track=${event.target.value}${tab === "leaderboard" ? "&tab=leaderboard" : ""}`)}
      >
        {value ? null : <option value="">{label}</option>}
        {paths.map((path) => <option key={path.key} value={path.key}>{path.title}</option>)}
      </select>
      <ChevronDown size={14} aria-hidden="true" />
    </label>
  );
}

/** Initials, with the emblem of the stage the person stands on pinned to the corner. */
function Avatar({ person, large = false }: { person: CommunityPersonView; large?: boolean }) {
  return (
    <span className={`community-avatar-wrap${large ? " large" : ""}`} aria-hidden="true">
      <span className="community-avatar">{person.initials}</span>
      <span className="community-avatar-emblem"><Emblem kind={person.emblem} size={large ? 22 : 18} /></span>
    </span>
  );
}

function PersonRow({
  person,
  labels,
  onOpen,
  rank = null,
  showPoints = false,
}: {
  person: CommunityPersonView;
  labels: CommunityLabels;
  onOpen: (handle: string) => void;
  rank?: string | null;
  showPoints?: boolean;
}) {
  return (
    <button type="button" className={`community-row${person.isMe ? " me" : ""}`} onClick={() => onOpen(person.handle)}>
      {rank ? <span className="community-rank"><span className="sr-only">{labels.rank.replace("{n}", rank)}</span><span aria-hidden="true">{rank}</span></span> : null}
      <Avatar person={person} />
      <span className="community-row-main">
        <span className="community-row-name">
          {person.alias}
          {person.isMe ? <span className="community-tag you">{labels.you}</span> : null}
          {person.isSample ? <span className="community-tag sample">{labels.sample}</span> : null}
        </span>
        <span className="community-row-meta">{person.meta}</span>
        {person.note && !showPoints ? <span className="community-row-note">“{person.note}”</span> : null}
      </span>
      {showPoints ? <span className="community-row-points">{person.points}</span> : <ChevronRight className="community-row-chevron" size={18} aria-hidden="true" />}
    </button>
  );
}

function PersonCard({
  person,
  labels,
  viewer,
  settings,
  onClose,
  onReported,
}: {
  person: CommunityPersonView;
  labels: CommunityLabels;
  viewer: CommunityViewer;
  settings: CommunitySettingsValue;
  onClose: () => void;
  onReported: () => void;
}) {
  const id = useId();
  const [mode, setMode] = useState<CardMode>("card");
  const [reason, setReason] = useState<(typeof REASONS)[number]>("spam");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sampleKind, setSampleKind] = useState<string | null>(null);
  const name = person.alias;
  const canSeeLinks = viewer.visible || person.isMe;
  const canReport = viewer.visible && !viewer.blocked && !viewer.demo && !person.isMe && !person.isSample;
  const kindLabel = (kind: CommunityLinkKind) => (kind === "telegram" ? "Telegram" : kind === "facebook" ? labels.card.facebook : labels.card.linkedin);

  async function sendReport(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    setError("");
    const response = await fetch("/api/community/report", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ handle: person.handle, reason }),
    }).catch(() => null);
    const body = await response?.json().catch(() => null);
    setSending(false);
    // Already gone counts as done: the learner wanted them out of the list.
    if (response?.ok || response?.status === 404) {
      setMode("sent");
      return;
    }
    setError(body?.detail || labels.report.failed);
  }

  const eyebrow = mode === "report" || mode === "sent"
    ? labels.report.eyebrow
    : mode === "join"
      ? labels.settings.joinEyebrow.replace("{name}", name)
      : person.isSample ? labels.card.sampleEyebrow : person.eyebrow;

  return (
    <SheetDialog labelledBy={`${id}-title`} eyebrow={eyebrow} closeLabel={labels.card.close} onClose={mode === "sent" ? onReported : onClose}>
      {mode === "card" ? (
        <>
          <div className="community-card-head">
            <span className="community-avatar large" aria-hidden="true">{person.initials}</span>
            <div>
              <h2 className="community-card-title" id={`${id}-title`}>{name}</h2>
              <span className="community-tag verified">{person.verifiedLabel}</span>
            </div>
          </div>
          {person.note ? <p className="community-card-note">“{person.note}”</p> : null}

          {canSeeLinks ? (
            <div className="community-links">
              {person.links.map((link, index) => {
                const className = `button ${index === 0 ? "primary" : "outline"} community-link`;
                const text = link.kind === "telegram" ? labels.card.message : kindLabel(link.kind);
                if (person.isSample) {
                  return (
                    <button key={link.kind} type="button" className={className} onClick={() => setSampleKind(kindLabel(link.kind))}>
                      {text}<ExternalLink size={16} aria-hidden="true" />
                    </button>
                  );
                }
                return (
                  <a key={link.kind} className={className} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={labels.card.linkName.replace("{kind}", text)}>
                    {text}<ExternalLink size={16} aria-hidden="true" />
                  </a>
                );
              })}
              {sampleKind ? <p className="community-card-hint" role="status">{labels.card.sampleLinks.replace("{kind}", sampleKind)}</p> : null}
              {!person.isMe ? <p className="community-card-hint">{labels.card.hint}</p> : null}
            </div>
          ) : (
            <div className="community-locked">
              <p>{labels.card.lockedBody}</p>
              <button type="button" className="button primary" disabled={viewer.blocked} onClick={() => setMode("join")}>
                {labels.card.locked.replace("{name}", name)}
              </button>
              {viewer.blocked ? <p className="community-card-hint">{labels.settings.paused}</p> : null}
            </div>
          )}

          <div className="community-card-foot">
            <span>{canSeeLinks && !person.isMe ? labels.card.opensOutside : ""}</span>
            {canReport ? <button type="button" className="community-inline-action" onClick={() => setMode("report")}>{labels.card.report}</button> : null}
          </div>
        </>
      ) : null}

      {mode === "report" ? (
        <form onSubmit={sendReport} className="community-report">
          <fieldset>
            <legend id={`${id}-title`} className="community-card-title">{labels.report.title.replace("{name}", name)}</legend>
            <p className="community-card-hint">{labels.report.anonymous}</p>
            {REASONS.map((key) => (
              <label key={key} className={`community-reason${reason === key ? " on" : ""}`}>
                <input type="radio" name={`${id}-reason`} value={key} checked={reason === key} onChange={() => setReason(key)} />
                {labels.report.reasons[key]}
              </label>
            ))}
          </fieldset>
          {error ? <p className="community-form-error" role="alert">{error}</p> : null}
          <div className="community-report-actions">
            <button type="submit" className="button outline community-report-send" disabled={sending}>{sending ? labels.report.sending : labels.report.send}</button>
            <button type="button" className="button ghost" onClick={() => setMode("card")} disabled={sending}>{labels.report.cancel}</button>
          </div>
        </form>
      ) : null}

      {mode === "sent" ? (
        <div className="community-sent" role="status">
          <h2 className="community-card-title" id={`${id}-title`}>{labels.report.sentTitle}</h2>
          <p>{labels.report.sentBody.replace("{name}", name)}</p>
          <button type="button" className="button primary" onClick={onReported}>{labels.report.done}</button>
        </div>
      ) : null}

      {mode === "join" ? (
        <>
          <h2 className="community-card-title" id={`${id}-title`}>{labels.settings.joinTitle}</h2>
          <CommunitySettings initial={settings} labels={labels.settings} mode="join" isDemo={viewer.demo} onSaved={() => setMode("card")} onCancel={() => setMode("card")} />
        </>
      ) : null}
    </SheetDialog>
  );
}

function EmptyPath({
  labels,
  locale,
  pathTitle,
  own,
  visible,
  onJoin,
}: {
  labels: CommunityLabels;
  locale: string;
  pathTitle: string;
  own: boolean;
  visible: boolean;
  onJoin: () => void;
}) {
  // The invite links to wherever this copy of Lan Pya is running; the server
  // render has no window, so the button waits for the browser's answer.
  const origin = useSyncExternalStore(noSubscribe, () => window.location.origin, () => "");
  const [copied, setCopied] = useState(false);

  if (!own) return <p className="community-empty-browse">{labels.emptyBrowse.replace("{path}", pathTitle)}</p>;

  const invite = `${origin}/${locale}`;
  const text = labels.empty.inviteText.replace("{path}", pathTitle);
  const share = `https://t.me/share/url?url=${encodeURIComponent(invite)}&text=${encodeURIComponent(text)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${text} ${invite}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(labels.empty.copy, invite);
    }
  }

  return (
    <section className="community-empty">
      <h2>{labels.empty.title}</h2>
      <p>{labels.empty.body.replace("{path}", pathTitle)}</p>
      <div className="community-empty-actions">
        {visible ? (
          <>
            <a className="button primary" href={origin ? share : undefined} target="_blank" rel="noopener noreferrer" aria-disabled={!origin}>
              {labels.empty.invite}
            </a>
            <button type="button" className="button outline" onClick={copy}>
              {copied ? labels.empty.copied : labels.empty.copy}
            </button>
            <span className="sr-only" role="status">{copied ? labels.empty.copied : ""}</span>
          </>
        ) : (
          <button type="button" className="button primary" onClick={onJoin}>{labels.showMe}</button>
        )}
      </div>
    </section>
  );
}

const noSubscribe = () => () => {};
