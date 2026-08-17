"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LevelInsignia } from "@/components/app/emblem";

/**
 * Level-up moment.
 *
 * Fires once, the first time a learner loads a screen at a rank higher than
 * the one last seen on this device. The last-seen rank lives in localStorage,
 * keyed per path, so this needs no new server state and cannot fire twice for
 * the same promotion.
 *
 * It is deliberately not celebratory in the arcade sense. The founder plan
 * forbids confetti, streak fire, and bounce reward animation, and the mapped
 * emotion for verified proof is "proud but practical: celebrate once, then
 * show the evidence". So this is a single 240ms fade with the insignia
 * settling from 0.96 to 1, a list of what was actually satisfied, and the
 * employability disclaimer. The honesty line is what makes the moment
 * defensible rather than hype.
 *
 * A learner who has never seen a rank on this device gets nothing: arriving
 * on a new phone must not replay an achievement from months ago.
 */

const KEY = "lanpya.level.seen";

/** Nothing to subscribe to: this only distinguishes server render from client
 *  render, which is a one-way transition. Same SSR-safe shape the roadmap
 *  canvas uses for its viewport query. */
const noopSubscribe = () => () => {};
const useIsClient = () => useSyncExternalStore(noopSubscribe, () => true, () => false);

function readRank(key: string): number | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    const value = Number.parseInt(raw, 10);
    return Number.isFinite(value) ? value : null;
  } catch {
    // Private browsing or blocked storage. Without a baseline there is no way
    // to know a promotion is new, so the caller stays silent.
    return null;
  }
}

export type LevelUpLabels = {
  reached: string;      // "You reached {level}"
  subtitle: string;     // "Level {n} of 5 on {path}"
  earnedLead: string;   // "What you satisfied"
  dismiss: string;      // "Continue"
  honesty: string;
  close: string;
};

export function LevelUpMoment({
  pathKey,
  rank,
  hue,
  levelName,
  pathTitle,
  satisfied,
  labels,
}: {
  pathKey: string;
  rank: number;
  hue: 1 | 2 | 3 | 4 | 5;
  levelName: string;
  pathTitle: string;
  satisfied: string[];
  labels: LevelUpLabels;
}) {
  const storageKey = `${KEY}.${pathKey}`;
  const isClient = useIsClient();
  const [dismissed, setDismissed] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Captured once, on the first client render. It must be held rather than
  // re-read, because the effect below overwrites the stored value immediately
  // and a live read would flip to "already seen" and close the dialog on the
  // very next render. `isClient` keeps the hydration render identical to the
  // server's, so capturing here causes no mismatch.
  const [baseline] = useState<number | null>(() =>
    (typeof window === "undefined" ? null : readRank(storageKey)));

  // Record the current rank on every visit, so a first visit establishes the
  // baseline instead of announcing a level the learner has held for months.
  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, String(rank));
    } catch { /* storage unavailable; nothing to record */ }
  }, [storageKey, rank]);

  const open = isClient && !dismissed && baseline !== null && rank > baseline;
  const setOpen = (next: boolean) => setDismissed(!next);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    dialogRef.current?.querySelector<HTMLButtonElement>(".levelup-dismiss")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div className="levelup-overlay" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div className="levelup-dialog" role="dialog" aria-modal="true" aria-labelledby="levelup-title" ref={dialogRef}>
        <LevelInsignia rank={rank} hue={hue} size={88} />
        <h2 id="levelup-title">{labels.reached.replace("{level}", levelName)}</h2>
        <p className="levelup-sub">
          {labels.subtitle.replace("{n}", String(rank)).replace("{path}", pathTitle)}
        </p>

        {satisfied.length ? (
          <>
            <span className="levelup-lead">{labels.earnedLead}</span>
            <ul className="levelup-list">
              {satisfied.map((item) => (
                <li key={item}>
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                    <circle cx="8" cy="8" r="7" fill="var(--teal-500)" />
                    <path d="M5 8.5 L7 10.5 L11 5.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <button type="button" className="button primary levelup-dismiss" onClick={() => setOpen(false)}>
          {labels.dismiss}
        </button>
        <p className="levelup-honesty">{labels.honesty}</p>
      </div>
    </div>
  );
}
