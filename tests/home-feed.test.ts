import { describe, expect, it } from "vitest";
import { buildUpNext, MAX_UP_NEXT } from "@/lib/domain/home-feed";

const now = new Date("2026-10-14T00:00:00");
const opp = (id: string, deadline: string, supported: string[] = []) => ({ id, title: id, organization: "Org", deadline, supported });

describe("buildUpNext", () => {
  it("puts a mission that needs the learner first, then paused work, then open opportunities", () => {
    const items = buildUpNext({
      mission: { key: "responsive-profile-card", title: "Responsive Profile Card", submissionState: "changes_requested" },
      paused: [{ missionKey: "content-creator-awareness", missionTitle: "Campaign", pathTitle: "Content Creator" }],
      opportunities: [opp("later", "2026-11-30"), opp("soon", "2026-10-16", ["Semantic HTML"])],
      now,
    });
    expect(items.map((item) => item.key)).toEqual(["mission-responsive-profile-card", "paused-content-creator-awareness", "opp-soon", "opp-later"]);
  });

  // The old opportunity card showed the first listing even when it had closed.
  it("never lists a closed opportunity", () => {
    const items = buildUpNext({ mission: null, paused: [], opportunities: [opp("closed", "2026-08-24")], now });
    expect(items).toEqual([]);
  });

  it("leaves out a mission with nothing to act on", () => {
    for (const submissionState of [null, "draft", "verified"] as const) {
      expect(buildUpNext({ mission: { key: "m", title: "M", submissionState }, paused: [], opportunities: [], now })).toEqual([]);
    }
  });

  // A path switch and back left the current mission marked paused, so it was
  // listed twice: once as awaiting review, once as paused.
  it("never lists the current mission again as paused work", () => {
    const items = buildUpNext({
      mission: { key: "responsive-profile-card", title: "Responsive Profile Card", submissionState: "human_review_queued" },
      paused: [{ missionKey: "responsive-profile-card", missionTitle: "Responsive Profile Card", pathTitle: "Frontend Developer" }],
      opportunities: [],
      now,
    });
    expect(items.map((item) => item.key)).toEqual(["mission-responsive-profile-card"]);
  });

  it("caps the list", () => {
    const many = Array.from({ length: 9 }, (_, i) => opp(`o${i}`, "2026-12-01"));
    expect(buildUpNext({ mission: null, paused: [], opportunities: many, now })).toHaveLength(MAX_UP_NEXT);
  });
});
