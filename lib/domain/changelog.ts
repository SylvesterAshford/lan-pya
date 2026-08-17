import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Reads CHANGELOG.md so Home can show what actually changed.
 *
 * The top navigation has carried "Updated every Friday" on every screen since
 * launch, which is a promise the product never kept: there was nowhere to see
 * what changed. TODOS.md deferred the rail on the grounds that it needed a
 * content pipeline and that an empty changelog is worse than none.
 *
 * That is no longer true. CHANGELOG.md is maintained on every release and its
 * entries are already written in learner-facing language rather than commit
 * shorthand, so it IS the pipeline. Sourcing the rail from it means the rail
 * cannot drift from what shipped, and it cannot be quietly forgotten, because
 * skipping it would leave the newest release visibly missing.
 *
 * Parsing is deliberately forgiving. A malformed heading drops one entry; it
 * must never break Home.
 */

export type ChangeKind = "added" | "changed" | "fixed" | "known" | "other";

export type ChangeEntry = {
  kind: ChangeKind;
  text: string;
};

export type Release = {
  version: string;
  /** ISO date as written in the file, or null when the heading omits one. */
  date: string | null;
  entries: ChangeEntry[];
};

function classify(heading: string): ChangeKind {
  const value = heading.toLowerCase();
  if (value.includes("add")) return "added";
  if (value.includes("chang")) return "changed";
  if (value.includes("fix")) return "fixed";
  if (value.includes("known")) return "known";
  return "other";
}

/** Strips markdown emphasis and inline code so the rail renders as plain text. */
function plain(value: string): string {
  return value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .trim();
}

export function parseChangelog(source: string): Release[] {
  const releases: Release[] = [];
  let current: Release | null = null;
  let kind: ChangeKind = "other";

  for (const rawLine of source.split("\n")) {
    const line = rawLine.trimEnd();

    // "## [0.9.1.0] - 2026-08-17", tolerating a missing date.
    const release = /^##\s+\[?([0-9][^\]\s]*)\]?\s*(?:[-–]\s*(\d{4}-\d{2}-\d{2}))?/.exec(line);
    if (release) {
      current = { version: release[1], date: release[2] ?? null, entries: [] };
      releases.push(current);
      kind = "other";
      continue;
    }

    const section = /^###\s+(.+)$/.exec(line);
    if (section) {
      kind = classify(section[1]);
      continue;
    }

    const bullet = /^[-*]\s+(.+)$/.exec(line);
    if (bullet && current) {
      const text = plain(bullet[1]);
      if (text) current.entries.push({ kind, text });
    }
  }

  return releases.filter((entry) => entry.entries.length > 0);
}

let cached: Release[] | null = null;

/**
 * Cached for the lifetime of the server process. The file cannot change without
 * a deploy, so re-reading it per request would be pure cost.
 */
export function getReleases(): Release[] {
  if (cached) return cached;
  try {
    const source = readFileSync(join(process.cwd(), "CHANGELOG.md"), "utf8");
    cached = parseChangelog(source);
  } catch {
    // A missing or unreadable changelog must not take Home down. The rail
    // simply does not render.
    cached = [];
  }
  return cached;
}
