/**
 * Path progress — levels, gates, and stage emblems.
 *
 * The XP ledger already exists (`career_quest_xp`, added 2026-08-13) and
 * `get_active_path_dashboard` already returns a summed `xp`. What it does NOT
 * return correctly is the level: the RPC computes `floor(xp / 100) + 1`, an
 * uncapped ladder with no evidence requirement, which would call a learner
 * "Level 8" for accumulating points alone.
 *
 * LAN_PYA_CAREER_QUEST_PLAN.md is explicit that "higher levels require both XP
 * and specified mission evidence, preventing activity farming". So the ladder
 * is computed here instead, from the raw `xp` plus the evidence counts the same
 * RPC already returns. No migration, and the rule stays in one readable place.
 *
 * Levels are path-scoped. Switching paths never transfers steps into another
 * career, which is why every function here takes one path's numbers.
 *
 * The unit is "steps", not XP. The ledger column and the RPC still say `xp`
 * because renaming a shipped database column three days before a pitch buys
 * nothing; the rename is a product-language decision, not a schema one.
 */

export type LevelKey = "explorer" | "starter" | "maker" | "practitioner" | "trailblazer";

export type Evidence = {
  /** Missions the learner has finished on this path. */
  completedMissions: number;
  /** Human-reviewed or partner-verified proofs on this path. */
  verifiedCount: number;
  /** Roadmap stages with at least one completed milestone. */
  stagesTouched: number;
};

export type Gate = {
  /** Shown to the learner as the requirement for the next level. */
  en: string;
  my: string;
  met: boolean;
  /** Present when the gate is countable, so the UI can show "1 of 3". */
  have?: number;
  need?: number;
};

export type LevelDefinition = {
  key: LevelKey;
  rank: number;
  en: string;
  my: string;
  minXp: number;
  /** Emblem-palette slot used for this level's insignia. */
  hue: 1 | 2 | 3 | 4 | 5;
  gate: (evidence: Evidence) => Gate;
};

const noGate = (): Gate => ({ en: "Account and path exploration complete", my: "အကောင့်နှင့် လမ်းကြောင်း စူးစမ်းမှု ပြီးဆုံးပြီ", met: true });

/**
 * The ladder, verbatim from the founder plan's Levels table. Level names
 * describe progress inside Lan Pya only; none of them claim employability,
 * which is why the UI always pairs the name with that disclaimer.
 */
export const LEVELS: LevelDefinition[] = [
  { key: "explorer", rank: 1, en: "Explorer", my: "စူးစမ်းသူ", minXp: 0, hue: 1, gate: noGate },
  {
    key: "starter", rank: 2, en: "Starter", my: "စတင်သူ", minXp: 100, hue: 2,
    gate: (e) => ({ en: "At least one completed mission", my: "ပြီးဆုံးသော မစ်ရှင် တစ်ခုအနည်းဆုံး", met: e.completedMissions >= 1, have: e.completedMissions, need: 1 }),
  },
  {
    key: "maker", rank: 3, en: "Maker", my: "ဖန်တီးသူ", minXp: 300, hue: 3,
    gate: (e) => ({ en: "At least one human-reviewed mission", my: "လူသား စစ်ဆေးပြီး မစ်ရှင် တစ်ခုအနည်းဆုံး", met: e.verifiedCount >= 1, have: e.verifiedCount, need: 1 }),
  },
  {
    key: "practitioner", rank: 4, en: "Practitioner", my: "ကျွမ်းကျင်သူ", minXp: 700, hue: 4,
    // The plan says "three human-reviewed core missions spanning two path
    // stages". The dashboard exposes both counts, so both halves are checked.
    gate: (e) => ({
      en: "Three human-reviewed missions across two stages",
      my: "အဆင့်နှစ်ခုတွင် လူသားစစ်ဆေးပြီး မစ်ရှင် သုံးခု",
      met: e.verifiedCount >= 3 && e.stagesTouched >= 2,
      have: Math.min(e.verifiedCount, 3), need: 3,
    }),
  },
  {
    key: "trailblazer", rank: 5, en: "Trailblazer", my: "လမ်းဖောက်သူ", minXp: 1200, hue: 5,
    // The plan gates this on a verified *capstone* plus four other reviewed
    // missions. Capstone is not yet a distinct mission type in the schema, so
    // this approximates it as five verified proofs and is documented as such
    // in DESIGN.md rather than silently claiming the full rule.
    gate: (e) => ({ en: "A verified capstone plus four reviewed missions", my: "အတည်ပြု capstone နှင့် စစ်ဆေးပြီး မစ်ရှင် လေးခု", met: e.verifiedCount >= 5, have: Math.min(e.verifiedCount, 5), need: 5 }),
  },
];

export type PathProgress = {
  level: LevelDefinition;
  next: LevelDefinition | null;
  xp: number;
  /** XP still required for the next level. Zero at the ceiling. */
  xpToNext: number;
  /** 0..1 across the current level band, for the meter fill. */
  fraction: number;
  /** Every requirement for the next level, met or not. */
  gates: Gate[];
  isMax: boolean;
};

/**
 * Resolve a learner's level. A level is reached only when BOTH its XP minimum
 * and its evidence gate are satisfied, and the ladder does not skip: failing
 * one rung's gate stops the climb even if XP would allow a higher one.
 */
export function resolveProgress(xp: number, evidence: Evidence): PathProgress {
  const safeXp = Number.isFinite(xp) && xp > 0 ? Math.floor(xp) : 0;

  let current = LEVELS[0];
  for (const level of LEVELS.slice(1)) {
    if (safeXp >= level.minXp && level.gate(evidence).met) current = level;
    else break;
  }

  const next = LEVELS.find((level) => level.rank === current.rank + 1) ?? null;
  const isMax = next === null;

  // Fill measures distance across the current band, so a learner at 340 of a
  // 300..700 band reads as 10% rather than 48% of some absolute total.
  const bandStart = current.minXp;
  const bandEnd = next ? next.minXp : current.minXp;
  const span = bandEnd - bandStart;
  const fraction = isMax || span <= 0 ? 1 : Math.max(0, Math.min(1, (safeXp - bandStart) / span));

  const gates: Gate[] = [];
  if (next) {
    gates.push({
      en: `${next.minXp} steps`,
      my: `ခြေလှမ်း ${next.minXp}`,
      met: safeXp >= next.minXp,
      have: Math.min(safeXp, next.minXp),
      need: next.minXp,
    });
    gates.push(next.gate(evidence));
  }

  return {
    level: current,
    next,
    xp: safeXp,
    xpToNext: next ? Math.max(0, next.minXp - safeXp) : 0,
    fraction,
    gates,
    isMax,
  };
}

/* ------------------------------------------------------------------ */
/* Stage emblems                                                       */
/* ------------------------------------------------------------------ */

export type EmblemKey = "foundations" | "build" | "review" | "capstone" | "verified";

export const EMBLEM_ORDER: EmblemKey[] = ["foundations", "build", "review", "capstone", "verified"];

/**
 * Map a roadmap stage to its emblem. Stages are ordered, so position in the
 * roadmap decides the emblem: the map's own structure carries the meaning
 * rather than a separate list someone has to keep in sync.
 *
 * Paths longer than five stages repeat the last emblem, because inventing a
 * sixth shape for a 14-stage roadmap would produce marks nobody can tell apart.
 */
export function emblemForStage(stageIndex: number, totalStages: number): EmblemKey {
  if (stageIndex <= 0) return "foundations";
  if (totalStages <= 1) return "foundations";
  const slot = Math.round((stageIndex / (totalStages - 1)) * (EMBLEM_ORDER.length - 1));
  return EMBLEM_ORDER[Math.max(0, Math.min(EMBLEM_ORDER.length - 1, slot))];
}

export function localizeLevel(locale: string, level: LevelDefinition): string {
  return locale === "my" ? level.my : level.en;
}

export function localizeGate(locale: string, gate: Gate): string {
  return locale === "my" ? gate.my : gate.en;
}
