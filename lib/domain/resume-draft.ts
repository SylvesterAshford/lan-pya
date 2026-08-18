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

export type ResumeBullet = {
  id: string;
  /** The mission this line was assembled from. Shown beside the line. */
  sourceTitle: string;
  sourceVerifiedAt: string;
  /** Competencies a reviewer confirmed for this mission. */
  competencies: string[];
  /** The assembled starting text. The learner may replace it entirely. */
  text: string;
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
export function buildResumeDraft(locale: string, items: ProofItem[], selectedIds: string[]): ResumeDraft {
  const chosen = new Set(selectedIds);
  const picked = eligibleForResume(items).filter((item) => chosen.has(item.id));

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
      competencies: item.competencies,
      text: line(locale, item),
    })),
    skills,
  };
}
