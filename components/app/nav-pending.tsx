"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useLinkStatus } from "next/link";

/**
 * Instant feedback for a sidebar tap without a route-level loading.tsx.
 *
 * A loading.tsx made every full page load stream the page as a hidden block
 * that React reveals after a ~300 ms batching delay, so first loads painted
 * later (PERF.md #5). Instead, each sidebar link carries a PendingMark: while
 * its navigation waits on the server, the shell hides the old page and shows
 * the page outline. Full loads render the page in the first HTML, as before.
 */
const ReportPending = createContext<(pending: boolean) => void>(() => {});

export function useNavPending() {
  const [navigating, setNavigating] = useState(false);
  return { navigating, report: setNavigating };
}

export function NavPendingReporter({ report, children }: { report: (pending: boolean) => void; children: React.ReactNode }) {
  return <ReportPending.Provider value={report}>{children}</ReportPending.Provider>;
}

/** Renders nothing; tells the shell while this link's navigation is pending. */
export function PendingMark() {
  const { pending } = useLinkStatus();
  const report = useContext(ReportPending);
  useEffect(() => {
    if (!pending) return;
    report(true);
    return () => report(false);
  }, [pending, report]);
  return null;
}

/** The page's outline: heading, one panel and two rows, in the sunk surface. */
export function PageOutline() {
  return (
    <div className="app-page page-loading" aria-hidden="true">
      <section className="page-heading">
        <span className="page-skeleton page-skeleton-eyebrow" />
        <span className="page-skeleton page-skeleton-title" />
        <span className="page-skeleton page-skeleton-line" />
      </section>
      <span className="page-skeleton page-skeleton-panel" />
      <span className="page-skeleton page-skeleton-row" />
      <span className="page-skeleton page-skeleton-row" />
    </div>
  );
}
