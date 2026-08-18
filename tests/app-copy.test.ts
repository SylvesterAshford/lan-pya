import { describe, expect, it } from "vitest";
import { CAREER_TRACKS } from "@/lib/domain/career-tracks";
import { DEMO_OPPORTUNITIES } from "@/lib/domain/demo-data";
import { localizeCareerTerm, localizeOpportunity, localizeRoadmapMilestone } from "@/lib/i18n/app-copy";

describe("application localization", () => {
  it("renders the selected career as one language", () => {
    expect(localizeCareerTerm("my", "content-creator", "fallback")).toBe("ဒစ်ဂျစ်တယ်အကြောင်းအရာ ဖန်တီးသူ");
  });

  it("localizes the active creator roadmap content", () => {
    const milestone = CAREER_TRACKS.find((track) => track.key === "content-creator")!.milestones[0];
    const localized = localizeRoadmapMilestone("my", milestone);
    expect(localized.title).toBe("ပရိသတ်နှင့် ပြဿနာ လေ့လာမှု");
    expect(localized.left).toContain("ပရိသတ်နှင့် စကားပြောခြင်း");
  });

  it("localizes known seeded opportunities without changing live source identity", () => {
    const intern = DEMO_OPPORTUNITIES.find((item) => item.id === "seed-internship")!;
    const localized = localizeOpportunity("my", intern);
    expect(localized.id).toBe(intern.id);
    expect(localized.sourceUrl).toBe(intern.sourceUrl);
    expect(localized.title).toBe("ဒစ်ဂျစ်တယ် စွန့်ဦးတီထွင်မှု အစီအစဉ် အလုပ်သင်");
  });
});
