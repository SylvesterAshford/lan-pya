import type { ProofItem } from "@/lib/domain/types";

/**
 * Proof-to-Resume assembly.
 *
 * This composes a draft out of records the learner already has. It does not
 * generate prose and there is no model behind it, for the same reason the
 * tutor has none (DESIGN.md "The AI Tutor"): a sentence a model writes about
 * someone's work is a claim nobody verified, and this product's whole position
 * is that it never makes one.
 *
 * The rules, in order of importance:
 *
 * 1. Only verified evidence is eligible. A submission in review is work, not
 *    proof, and a résumé is exactly where that difference matters.
 * 2. Only what the learner selected goes in. Selection is theirs; the builder
 *    never helpfully adds a project back.
 * 3. Every bullet carries the mission it came from, so a reader can ask for
 *    the evidence and the writer can check it.
 * 4. Nothing is inferred. No adjectives about quality, no seniority, no
 *    impact, no outcome, no duration. Every clause below traces to a stored
 *    field: the title, the competencies a reviewer confirmed, the review tier
 *    and the date it was verified.
 *
 * The learner edits every line afterwards. That is the point — this is a
 * starting draft assembled from their record, not a document about them.
 */

/** Verified proof, placed on its path by the caller (lib/domain/mission-place). */
export type ResumeSource = ProofItem & {
  /** "Stage 3 · CSS and responsive layout", already localised; null when unplaced. */
  stageLabel?: string | null;
  /** The stage's number on its path, for the Trail template's stop markers. */
  stageNumber?: number | null;
  /** "Stage 3", already localised: the short form for the picker. */
  stageTag?: string | null;
  /** One sentence on what the mission asked for, shown under its title in the picker. */
  brief?: string | null;
  pathTitle?: string | null;
  /** The verification date as the reader writes dates; the ISO date if absent. */
  verifiedLabel?: string;
};

export type ResumeBullet = {
  id: string;
  /** The mission this line was assembled from. Shown beside the line. */
  sourceTitle: string;
  sourceVerifiedAt: string;
  /** The verification date, formatted for the reader. */
  sourceVerifiedLabel: string;
  /** Competencies a reviewer confirmed for this mission. */
  competencies: string[];
  /** The assembled starting text. The learner may replace it entirely. */
  text: string;
  /** Who reviewed it, as stored on the proof ("Trained human reviewer"). */
  reviewerTier: string;
  /** The learner's own submitted links, shortened for print; null when absent. */
  liveUrl: string | null;
  codeUrl: string | null;
  stageLabel: string | null;
  stageNumber: number | null;
  pathTitle: string | null;
};

export type ResumeDraft = {
  bullets: ResumeBullet[];
  /** Competencies across the selection, de-duplicated, in first-seen order. */
  skills: string[];
};

/** Verified, still-standing proof. Everything else is ineligible, and the
 *  caller should say so rather than silently dropping it. */
export function eligibleForResume(items: ProofItem[]): ProofItem[] {
  return items.filter((item) => item.state === "active");
}

/**
 * A submitted link, shortened for a printed page: no scheme, no "www.", no
 * trailing slash. Anything that is not an http(s) URL is dropped rather than
 * printed, because a résumé link that does not open is worse than none.
 */
export function displayUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    const path = `${url.host.replace(/^www\./, "")}${url.pathname}`.replace(/\/$/, "");
    return path || null;
  } catch {
    return null;
  }
}

function line(locale: string, item: ProofItem): string {
  const competencies = item.competencies.join(", ");
  if (locale === "my") {
    return competencies
      ? `${item.title} — ${competencies} တို့ကို လက်တွေ့ဆောင်ရွက်ပြီး အတည်ပြုထားသည်။`
      : `${item.title} — အတည်ပြုထားသည်။`;
  }
  return competencies
    ? `${item.title} — built and verified, demonstrating ${competencies}.`
    : `${item.title} — built and verified.`;
}

/**
 * Assemble a draft from the selected ids.
 *
 * Order follows the order the learner sees, not verification date: they chose
 * the list, so the draft reads in the order they chose it.
 */
export function buildResumeDraft(locale: string, items: ResumeSource[], selectedIds: string[]): ResumeDraft {
  const chosen = new Set(selectedIds);
  const picked = items.filter((item) => item.state === "active" && chosen.has(item.id));

  const skills: string[] = [];
  for (const item of picked) {
    for (const competency of item.competencies) {
      if (!skills.includes(competency)) skills.push(competency);
    }
  }

  return {
    bullets: picked.map((item) => ({
      id: item.id,
      sourceTitle: item.title,
      sourceVerifiedAt: item.verifiedAt,
      sourceVerifiedLabel: item.verifiedLabel ?? item.verifiedAt.slice(0, 10),
      competencies: item.competencies,
      text: line(locale, item),
      reviewerTier: item.reviewerTier,
      liveUrl: displayUrl(item.deploymentUrl),
      codeUrl: displayUrl(item.repositoryUrl),
      stageLabel: item.stageLabel ?? null,
      stageNumber: item.stageNumber ?? null,
      pathTitle: item.pathTitle ?? null,
    })),
    skills,
  };
}
