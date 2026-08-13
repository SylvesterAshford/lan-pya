import { describe, expect, it } from "vitest";
import { CAREER_PATH_CATALOG, getCareerPath, getCareerRecommendations, getEligibleCareerPaths } from "@/lib/domain/career-recommendations";
import type { CareerPreferences } from "@/lib/domain/types";

const basePreferences: CareerPreferences = {
  interests: [],
  preferredWork: "not_sure",
  immediateGoal: "not_sure",
  deviceAccess: "not_sure",
  connectivity: "not_sure",
  priorExperience: [],
};

describe("career recommendations", () => {
  it("keeps the catalog discoverable while exposing only operational paths as eligible", () => {
    expect(CAREER_PATH_CATALOG.map((path) => path.key)).toEqual(expect.arrayContaining([
      "frontend-developer", "content-creator", "video-editor", "digital-marketing",
    ]));
    expect(getEligibleCareerPaths().map((path) => path.key)).toEqual(["frontend-developer", "content-creator"]);
    expect(getCareerPath("video-editor")?.availability).toBe("preview");
  });

  it("recommends Content Creator for a phone-first storyteller without inventing a match score", () => {
    const recommendations = getCareerRecommendations({
      ...basePreferences,
      interests: ["Arts & culture", "Social impact"],
      preferredWork: "explain",
      deviceAccess: "phone_only",
    });

    expect(recommendations[0]).toMatchObject({ key: "content-creator", availability: "controlled_pilot" });
    expect(recommendations[0]?.reason).toContain("you picked");
    expect(recommendations[0]?.reason).not.toContain("match");
  });

  it("recommends Frontend for learners interested in programming and making", () => {
    const recommendations = getCareerRecommendations({
      ...basePreferences,
      interests: ["Technology", "Programming"],
      preferredWork: "make",
      deviceAccess: "laptop",
    });

    expect(recommendations[0]).toMatchObject({ key: "frontend-developer", availability: "operational" });
  });
});
