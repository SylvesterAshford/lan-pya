import { describe, expect, it } from "vitest";
import { CAREER_TRACKS } from "@/lib/domain/career-tracks";
import { LEARNING_RESOURCES, getStageResources } from "@/lib/domain/learning-resources";
import { localizeRoadmapMilestone } from "@/lib/i18n/app-copy";

const stages = CAREER_TRACKS.flatMap((track) => track.milestones);
const topicsOf = (stage: (typeof stages)[number]) => [...(stage.left ?? []), ...(stage.right ?? [])];

// Links are checked against the live web by `npm run check:resources`, not
// here: a unit test that needs the network fails for reasons unrelated to the
// code. These hold the shape the roadmap depends on.
describe("learning resources", () => {
  it("cover every stage on every path, topic by topic, in catalogue order", () => {
    for (const stage of stages) {
      expect(LEARNING_RESOURCES[stage.key]?.map((entry) => entry.topic), stage.key).toEqual(topicsOf(stage));
    }
  });

  it("list no stage the catalogue does not have", () => {
    const keys = new Set(stages.map((stage) => stage.key));
    expect(Object.keys(LEARNING_RESOURCES).filter((key) => !keys.has(key))).toEqual([]);
  });

  it("give every topic something to watch and at least one more resource", () => {
    for (const [stage, topics] of Object.entries(LEARNING_RESOURCES)) {
      for (const { topic, resources } of topics) {
        expect(resources.length, `${stage} / ${topic}`).toBeGreaterThanOrEqual(2);
        expect(resources.some((item) => item.kind === "video" || item.kind === "course"), `${stage} / ${topic}`).toBe(true);
      }
    }
  });

  it("link only over https, and never twice in one topic", () => {
    for (const topics of Object.values(LEARNING_RESOURCES)) {
      for (const { topic, resources } of topics) {
        const urls = resources.map((item) => item.url);
        expect(urls.every((url) => url.startsWith("https://")), topic).toBe(true);
        expect(new Set(urls).size, topic).toBe(urls.length);
      }
    }
  });

  it("give every single video a running time", () => {
    const videos = Object.values(LEARNING_RESOURCES).flat().flatMap((entry) => entry.resources).filter((item) => item.kind === "video");
    expect(videos.filter((item) => !item.minutes)).toEqual([]);
  });

  it("include lessons taught in Burmese", () => {
    const burmese = Object.values(LEARNING_RESOURCES).flat().flatMap((entry) => entry.resources).filter((item) => item.lang === "my");
    expect(burmese.length).toBeGreaterThan(0);
  });

  // Resources are matched to topics by position, because the Burmese catalogue
  // renames the topics. A Burmese list of a different length would put links
  // under the wrong topic.
  it("sit on Burmese topic lists the same length as the English ones", () => {
    for (const stage of stages) {
      const my = localizeRoadmapMilestone("my", stage);
      expect([my.left?.length, my.right?.length], stage.key).toEqual([stage.left?.length, stage.right?.length]);
    }
  });

  it("show nothing for a stage whose topic count no longer matches", () => {
    expect(getStageResources("javascript", 5)).toHaveLength(5);
    expect(getStageResources("javascript", 4)).toBeNull();
    expect(getStageResources("not-a-stage", 1)).toBeNull();
  });
});
