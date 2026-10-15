import { mergeTrackMilestones } from "@/lib/domain/career-tracks";
import type { Milestone } from "@/lib/domain/types";

/**
 * Community: who is on a path, grouped and ranked.
 *
 * get_community (SQL) decides who may be seen and returns raw facts. This
 * module decides everything a learner reads from them, as pure functions so
 * every rule is covered by unit tests:
 *
 *   rows ──stageOf()──▶ people ──┬─ stageSections() ─▶ Your stage tab
 *        (mergeTrackMilestones,  └─ leaderboard()   ─▶ Leaderboard tab
 *         the roadmap's own rule)
 *
 * Stage uses mergeTrackMilestones on purpose: the roadmap and Community must
 * never place the same learner on different stages.
 */

export type CommunityViewer = { visible: boolean; blocked: boolean; demo: boolean };

export type CommunityRow = {
  handle: string;
  alias: string;
  avatar: string;
  statuses: Milestone["status"][];
  verified: number;
  completed: number;
  points: number;
  note: string | null;
  noteMy: string | null;
  telegram: string | null;
  facebook: string | null;
  linkedin: string | null;
  isMe: boolean;
  isSample: boolean;
};

export type CommunityData = { viewer: CommunityViewer; keys: string[]; rows: CommunityRow[] };

export type CommunityPerson = CommunityRow & {
  /** 0-based index of the stage they are on. Meaningless when `finished`. */
  stageIndex: number;
  finished: boolean;
};

export type SectionKind = "at" | "ahead" | "behind" | "finished" | "elsewhere" | "stage";
export type CommunitySection = { kind: SectionKind; stageIndex: number | null; people: CommunityPerson[] };

export type LeaderboardView = {
  /** Top three in rank order, only when at least three people have points. */
  podium: CommunityPerson[] | null;
  /** Rank number per person, or null in the "fills in" state. */
  rows: { person: CommunityPerson; rank: number | null }[];
};

const STATUSES = new Set<Milestone["status"]>(["complete", "active", "next", "upcoming"]);

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function count(value: unknown): number {
  const number = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}

/** The RPC's jsonb, made safe to render. Unknown shapes become empty. */
export function parseCommunity(data: unknown): CommunityData {
  const root = record(data);
  const viewer = record(root.viewer);
  const keys = Array.isArray(root.keys) ? root.keys.filter((key): key is string => typeof key === "string") : [];
  const rows = (Array.isArray(root.rows) ? root.rows : []).map(record).flatMap((row): CommunityRow[] => {
    const handle = text(row.handle);
    const alias = text(row.alias);
    if (!handle || !alias) return [];
    const statuses = (Array.isArray(row.statuses) ? row.statuses : [])
      .map((status) => (STATUSES.has(status as Milestone["status"]) ? status as Milestone["status"] : "upcoming"));
    return [{
      handle, alias, avatar: text(row.avatar) ?? "traveller", statuses,
      verified: count(row.verified), completed: count(row.completed), points: count(row.points),
      note: text(row.note), noteMy: text(row.note_my),
      telegram: text(row.telegram), facebook: text(row.facebook), linkedin: text(row.linkedin),
      isMe: row.is_me === true, isSample: row.is_sample === true,
    }];
  });
  return {
    viewer: { visible: viewer.visible === true, blocked: viewer.blocked === true, demo: viewer.demo === true },
    keys,
    rows,
  };
}

/**
 * Where a learner stands, by the roadmap's rule: the stage marked active, or
 * the first unfinished one. A learner who has started nothing is on stage 1;
 * one who has finished every stage is `finished`.
 */
export function stageOf(trackKey: string, keys: string[], statuses: Milestone["status"][]) {
  const rows = keys.map((key, index) => ({
    key, status: statuses[index] ?? "upcoming", order: index + 1, title: "", description: "", proof: "",
  })) as Milestone[];
  const merged = mergeTrackMilestones(trackKey, rows);
  const active = merged.findIndex((stage) => stage.status === "active");
  if (active >= 0) return { stageIndex: active, finished: false };
  if (merged.length && merged.every((stage) => stage.status === "complete")) return { stageIndex: merged.length - 1, finished: true };
  return { stageIndex: 0, finished: false };
}

export function toPeople(trackKey: string, data: CommunityData): CommunityPerson[] {
  return data.rows.map((row) => ({ ...row, ...stageOf(trackKey, data.keys, row.statuses) }));
}

/** Further along sorts higher; finishing the path is furthest of all. */
function progressRank(person: CommunityPerson) {
  return person.finished ? Number.MAX_SAFE_INTEGER : person.stageIndex;
}

function byAlias(a: CommunityPerson, b: CommunityPerson) {
  return a.alias.localeCompare(b.alias);
}

/** Inside a section: most verified, then most completed, then by name. */
function bySectionOrder(a: CommunityPerson, b: CommunityPerson) {
  return b.verified - a.verified || b.completed - a.completed || byAlias(a, b);
}

/**
 * The Your stage tab. On the viewer's own path the sections are relative to
 * them (design review DR5: the viewer is in the card, never in a list). On any
 * other path, or before the viewer has a row, people are grouped by stage
 * (DR11). Empty sections are left out rather than shown with nobody in them.
 */
export function stageSections(people: CommunityPerson[], options: { relative: boolean }): CommunitySection[] {
  const me = people.find((person) => person.isMe);
  const others = people.filter((person) => !person.isMe);

  if (options.relative && me) {
    const taken = new Set<string>();
    const pick = (kind: SectionKind, stageIndex: number | null, test: (person: CommunityPerson) => boolean): CommunitySection => {
      const list = others.filter((person) => !taken.has(person.handle) && test(person)).sort(bySectionOrder);
      list.forEach((person) => taken.add(person.handle));
      return { kind, stageIndex, people: list };
    };
    const sections = me.finished
      ? [
        pick("at", null, (person) => person.finished),
        pick("behind", me.stageIndex, (person) => !person.finished && person.stageIndex === me.stageIndex),
      ]
      : [
        pick("at", me.stageIndex, (person) => !person.finished && person.stageIndex === me.stageIndex),
        pick("ahead", me.stageIndex + 1, (person) => !person.finished && person.stageIndex === me.stageIndex + 1),
        pick("behind", me.stageIndex - 1, (person) => !person.finished && person.stageIndex === me.stageIndex - 1),
        pick("finished", null, (person) => person.finished),
      ];
    // Anyone further away still belongs on the page: with a handful of
    // learners, hiding them would show an empty path that is not empty.
    const rest = others.filter((person) => !taken.has(person.handle))
      .sort((a, b) => progressRank(b) - progressRank(a) || bySectionOrder(a, b));
    sections.push({ kind: "elsewhere", stageIndex: null, people: rest });
    return sections.filter((section) => section.people.length);
  }

  const byStage = new Map<number, CommunityPerson[]>();
  const finished: CommunityPerson[] = [];
  for (const person of others) {
    if (person.finished) finished.push(person);
    else byStage.set(person.stageIndex, [...(byStage.get(person.stageIndex) ?? []), person]);
  }
  const sections: CommunitySection[] = [...byStage.entries()]
    .sort(([a], [b]) => a - b)
    .map(([stageIndex, list]) => ({ kind: "stage" as const, stageIndex, people: list.sort(bySectionOrder) }));
  if (finished.length) sections.push({ kind: "finished", stageIndex: null, people: finished.sort(bySectionOrder) });
  return sections;
}

/** Points, then verified missions, then further along, then name. */
export function byRank(a: CommunityPerson, b: CommunityPerson) {
  return b.points - a.points || b.verified - a.verified || progressRank(b) - progressRank(a) || byAlias(a, b);
}

/**
 * The Leaderboard tab. The podium needs three people with points: a podium of
 * one learner and two zeros would rank people for having done nothing yet.
 * Until then the tab lists people by how far along they are, unranked.
 */
export function leaderboard(people: CommunityPerson[]): LeaderboardView {
  const ranked = [...people].sort(byRank);
  const withPoints = ranked.filter((person) => person.points > 0).length;
  if (withPoints >= 3) {
    return {
      podium: ranked.slice(0, 3),
      rows: ranked.slice(3).map((person, index) => ({ person, rank: index + 4 })),
    };
  }
  const byProgress = [...people].sort((a, b) => progressRank(b) - progressRank(a) || bySectionOrder(a, b));
  return { podium: null, rows: byProgress.map((person) => ({ person, rank: null })) };
}

let segmenter: Intl.Segmenter | null | undefined;
function firstGrapheme(value: string) {
  if (segmenter === undefined) segmenter = typeof Intl !== "undefined" && "Segmenter" in Intl ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;
  if (segmenter) return segmenter.segment(value)[Symbol.iterator]().next().value?.segment ?? "";
  return Array.from(value)[0] ?? "";
}

/**
 * Two Latin initials, or one Myanmar character. A Burmese name's first code
 * point can be a bare consonant whose vowel sign follows, so it takes the
 * whole first grapheme instead of slicing a character in half.
 */
export function initialsFor(alias: string) {
  const name = alias.trim();
  if (!name) return "?";
  const first = firstGrapheme(name);
  if (/[က-႟ꩠ-ꩿꧠ-꧿]/.test(first)) return first;
  const words = name.split(/\s+/).filter(Boolean);
  return (first + (words[1] ? firstGrapheme(words[1]) : "")).toUpperCase();
}

export type CommunityLinkKind = "telegram" | "facebook" | "linkedin";

/** The person's links in the order the card shows them; the first is primary. */
export function linksOf(person: Pick<CommunityRow, CommunityLinkKind>) {
  return (["telegram", "facebook", "linkedin"] as const)
    .filter((kind) => Boolean(person[kind]))
    .map((kind) => ({ kind, url: person[kind] as string }));
}

export function noteFor(person: Pick<CommunityRow, "note" | "noteMy">, locale: string) {
  return locale === "my" && person.noteMy ? person.noteMy : person.note;
}
