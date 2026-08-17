import { describe, expect, it } from "vitest";
import { emblemForStage, EMBLEM_ORDER, LEVELS, resolveProgress, type Evidence } from "@/lib/domain/progress";

const none: Evidence = { completedMissions: 0, verifiedCount: 0, stagesTouched: 0 };
const ev = (over: Partial<Evidence>): Evidence => ({ ...none, ...over });

describe("resolveProgress — the ladder", () => {
  it("starts every learner at Explorer with no evidence", () => {
    const p = resolveProgress(0, none);
    expect(p.level.key).toBe("explorer");
    expect(p.next?.key).toBe("starter");
    expect(p.xpToNext).toBe(100);
    expect(p.isMax).toBe(false);
  });

  it("does NOT promote on XP alone — the evidence gate must also pass", () => {
    // 5000 XP and nothing completed. The shipped RPC ladder (floor(xp/100)+1)
    // would call this Level 51; the founder plan requires evidence at each rung.
    const p = resolveProgress(5000, none);
    expect(p.level.key).toBe("explorer");
  });

  it("promotes to Starter once XP and one completed mission are both present", () => {
    expect(resolveProgress(100, ev({ completedMissions: 1 })).level.key).toBe("starter");
    // XP present, evidence missing.
    expect(resolveProgress(100, none).level.key).toBe("explorer");
    // Evidence present, XP missing.
    expect(resolveProgress(99, ev({ completedMissions: 1 })).level.key).toBe("explorer");
  });

  it("stops at the first failed rung instead of skipping ahead", () => {
    // Enough XP for Practitioner and enough verified proofs for its gate, but
    // zero completed missions, so the Starter gate fails and the climb stops.
    const p = resolveProgress(900, ev({ verifiedCount: 4, stagesTouched: 3 }));
    expect(p.level.key).toBe("explorer");
  });

  it("requires BOTH halves of the Practitioner gate", () => {
    const base = { completedMissions: 4, verifiedCount: 3 };
    // Three verified proofs but confined to one stage.
    expect(resolveProgress(700, ev({ ...base, stagesTouched: 1 })).level.key).toBe("maker");
    expect(resolveProgress(700, ev({ ...base, stagesTouched: 2 })).level.key).toBe("practitioner");
  });

  it("reaches Trailblazer and reports it as the ceiling", () => {
    const p = resolveProgress(1200, ev({ completedMissions: 6, verifiedCount: 5, stagesTouched: 3 }));
    expect(p.level.key).toBe("trailblazer");
    expect(p.isMax).toBe(true);
    expect(p.next).toBeNull();
    expect(p.xpToNext).toBe(0);
    expect(p.fraction).toBe(1);
    expect(p.gates).toHaveLength(0);
  });

  it("never exceeds five levels no matter how much XP is accumulated", () => {
    const p = resolveProgress(999_999, ev({ completedMissions: 99, verifiedCount: 99, stagesTouched: 99 }));
    expect(p.level.rank).toBe(5);
  });
});

describe("resolveProgress — the meter", () => {
  it("measures fill across the current band, not the absolute total", () => {
    // 400 XP sits in the 300..700 Maker band: a quarter of the way, not 57%.
    const p = resolveProgress(400, ev({ completedMissions: 2, verifiedCount: 1 }));
    expect(p.level.key).toBe("maker");
    expect(p.fraction).toBeCloseTo(0.25, 5);
  });

  it("clamps the fill to 0..1 when XP overshoots a blocked gate", () => {
    // Plenty of XP for the next band but the gate blocks promotion, so the bar
    // must read full rather than overflowing past 100%.
    const p = resolveProgress(5000, ev({ completedMissions: 1 }));
    expect(p.level.key).toBe("starter");
    expect(p.fraction).toBe(1);
  });

  it("treats missing or nonsense XP as zero rather than throwing", () => {
    expect(resolveProgress(Number.NaN, none).xp).toBe(0);
    expect(resolveProgress(-50, none).xp).toBe(0);
    expect(resolveProgress(12.7, none).xp).toBe(12);
  });

  it("lists both the XP gate and the evidence gate for the next level", () => {
    const p = resolveProgress(120, ev({ completedMissions: 1 }));
    expect(p.gates).toHaveLength(2);
    expect(p.gates[0].met).toBe(false);      // 120 of 300 XP
    expect(p.gates[0].need).toBe(300);
    expect(p.gates[1].met).toBe(false);      // no human-reviewed mission yet
  });
});

describe("the ladder matches the founder plan", () => {
  it("uses the documented XP minimums", () => {
    expect(LEVELS.map((l) => l.minXp)).toEqual([0, 100, 300, 700, 1200]);
  });

  it("uses the documented level names in order", () => {
    expect(LEVELS.map((l) => l.en)).toEqual(["Explorer", "Starter", "Maker", "Practitioner", "Trailblazer"]);
  });

  it("gives every level a Burmese name — no English fallback in the app", () => {
    for (const level of LEVELS) {
      expect(level.my.length).toBeGreaterThan(0);
      expect(level.my).not.toBe(level.en);
    }
  });
});

describe("emblemForStage", () => {
  it("gives the first stage Foundations and the last Verified", () => {
    expect(emblemForStage(0, 5)).toBe("foundations");
    expect(emblemForStage(4, 5)).toBe("verified");
  });

  it("spreads five emblems evenly across a five-stage path", () => {
    expect([0, 1, 2, 3, 4].map((i) => emblemForStage(i, 5))).toEqual(EMBLEM_ORDER);
  });

  it("still spans the full set on a long roadmap", () => {
    // Content Creator and Full-Stack run 13-14 stages; the marks must not all
    // collapse onto one emblem.
    const marks = Array.from({ length: 14 }, (_, i) => emblemForStage(i, 14));
    expect(new Set(marks).size).toBe(EMBLEM_ORDER.length);
    expect(marks[0]).toBe("foundations");
    expect(marks[13]).toBe("verified");
  });

  it("survives degenerate roadmaps without throwing or going out of range", () => {
    expect(emblemForStage(0, 1)).toBe("foundations");
    expect(emblemForStage(0, 0)).toBe("foundations");
    expect(EMBLEM_ORDER).toContain(emblemForStage(99, 3));
  });
});
