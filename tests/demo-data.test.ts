import { describe, expect, it } from "vitest";
import { DEMO_OPPORTUNITIES, DEMO_PROOF, FRONTEND_MILESTONES } from "@/lib/domain/demo-data";
import { CAREER_TRACKS } from "@/lib/domain/career-tracks";

describe("seeded demonstration invariants", () => {
  it("shows the complete frontend path", () => expect(FRONTEND_MILESTONES).toHaveLength(12));
  it("never disguises demo proof as live", () => expect(DEMO_PROOF.dataOrigin).toBe("seeded_demo"));
  it("labels every demo opportunity", () => expect(DEMO_OPPORTUNITIES.every((item) => item.dataOrigin === "seeded_demo")).toBe(true));
  it("explains readiness without a magic score", () => expect(new Set(DEMO_OPPORTUNITIES.map((item) => item.readiness))).toEqual(new Set(["Ready now", "Build toward", "Cannot determine"])));
  it("includes every approved career track", () => expect(CAREER_TRACKS.map((track) => track.key)).toEqual(["frontend-developer", "full-stack-developer", "ai-data-analyst"]));
  it("covers production skills rather than stopping at beginner syntax", () => {
    const allTitles = CAREER_TRACKS.flatMap((track) => track.milestones.map((milestone) => milestone.title)).join(" ");
    expect(allTitles).toMatch(/Testing, accessibility and performance/);
    expect(allTitles).toMatch(/Identity and application security/);
    expect(allTitles).toMatch(/Observability, performance and scale/);
    expect(allTitles).toMatch(/Statistics and probability/);
    expect(allTitles).toMatch(/Responsible applied AI/);
  });
});
