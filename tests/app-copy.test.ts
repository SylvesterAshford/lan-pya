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
    const localized = localizeOpportunity("my", DEMO_OPPORTUNITIES[0]);
    expect(localized.id).toBe(DEMO_OPPORTUNITIES[0].id);
    expect(localized.title).toBe("Frontend တည်ဆောက်မှု စိန်ခေါ်ပွဲ");
  });
});
