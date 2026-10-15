import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MissionMap } from "@/components/missions/mission-map";
import type { Milestone } from "@/lib/domain/types";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

const milestones: Milestone[] = [
  { key: "done", order: 1, title: "Foundations", description: "", proof: "", status: "complete" },
  { key: "current", order: 2, title: "Responsive layout", description: "", proof: "", status: "active" },
  { key: "next", order: 3, title: "Interactions", description: "", proof: "", status: "next" },
];

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("MissionMap current-position landing", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("matchMedia", () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
    }));
  });

  it("centres the current stop when the missions page opens", () => {
    const scrollTo = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      x: 0, y: 800, top: 800, right: 200, bottom: 900, left: 0, width: 200, height: 100,
      toJSON: () => ({}),
    });

    const { container } = render(
      <MissionMap
        milestones={milestones}
        locale="en"
        pathTitle="Frontend Developer"
        steps={200}
        stageLinks={{ current: "/app/missions/responsive-profile-card" }}
        labels={{
          stageOf: "Stage {a} of {b}",
          steps: "points",
          youAreHere: "You are here",
          complete: "Verified",
          placed: "Placed by skills check",
          awaiting: "Awaiting review",
          locked: "Locked",
          nextMission: "Next mission",
          continueMission: "Continue mission",
          comingSoon: "Mission coming soon",
        }}
      />,
    );

    expect(container.querySelector(".map-card.current")).toHaveTextContent("You are here");
    const expectedTop = Math.max(0, 850 - window.innerHeight / 2);
    act(() => { vi.advanceTimersByTime(60); });
    expect(scrollTo).toHaveBeenCalledWith({ top: expectedTop, behavior: "auto" });
  });
});

describe("MissionMap done stops", () => {
  beforeEach(() => {
    vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
    vi.stubGlobal("scrollTo", vi.fn());
  });

  // The map drew every finished stage with the same check, so two stages the
  // skills check placed a learner past read like two more completed missions.
  it("tells placed, awaiting-review and verified stages apart", () => {
    const stops: Milestone[] = [
      { key: "a", order: 1, title: "Web foundations", description: "", proof: "", status: "complete", source: "placement" },
      { key: "b", order: 2, title: "Semantic HTML", description: "", proof: "", status: "complete", source: "checked" },
      { key: "c", order: 3, title: "CSS layout", description: "", proof: "", status: "complete", source: "proof" },
      { key: "d", order: 4, title: "JavaScript", description: "", proof: "", status: "active" },
    ];
    const { container } = render(
      <MissionMap
        milestones={stops} locale="en" pathTitle="Frontend Developer" steps={0}
        labels={{ stageOf: "Stage {a} of {b}", steps: "points", youAreHere: "You are here", complete: "Verified", placed: "Placed by skills check", awaiting: "Awaiting review", locked: "Locked", nextMission: "Next mission", continueMission: "Continue mission", comingSoon: "Mission coming soon" }}
      />,
    );
    const statuses = [...container.querySelectorAll(".map-card-status")].map((node) => node.textContent);
    expect(statuses).toEqual(["Placed by skills check", "Awaiting review", "Verified", "You are here · Mission coming soon"]);
    expect(container.querySelectorAll(".map-card-check").length).toBe(2);
  });
});


describe("MissionMap traveller walk", () => {
  const labels = { stageOf: "Stage {a} of {b}", steps: "points", youAreHere: "You are here", complete: "Verified", placed: "Placed by skills check", awaiting: "Awaiting review", locked: "Locked", nextMission: "Next mission", continueMission: "Continue mission", comingSoon: "Mission coming soon" };
  let animate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
    vi.stubGlobal("scrollTo", vi.fn());
    // jsdom draws nothing, so the road has no length of its own.
    Object.assign(SVGElement.prototype, {
      getTotalLength: () => 100,
      getPointAtLength: (at: number) => ({ x: at, y: at }),
    });
    animate = vi.fn(() => ({ cancel: vi.fn(), onfinish: null }));
    Object.assign(Element.prototype, { animate });
  });

  // Submitting a mission moves the learner on; the map shows the move rather
  // than a new picture, walking from where they last stood.
  it("walks the traveller up from the stop the learner last stood at", () => {
    window.localStorage.setItem("lanpya-map-stop:fe", "done");
    render(<MissionMap milestones={milestones} pathKey="fe" locale="en" pathTitle="Frontend Developer" steps={0} labels={labels} />);
    expect(animate).toHaveBeenCalledTimes(1);
    const [frames] = animate.mock.calls[0] as [Keyframe[]];
    expect(frames.length).toBeGreaterThan(10);
    expect(frames.at(-1)?.transform).toMatch(/translate\(/);
    // Remembered only once the walk has finished.
    expect(window.localStorage.getItem("lanpya-map-stop:fe")).toBe("done");
    const walk = animate.mock.results[0].value as { onfinish: (() => void) | null };
    act(() => { walk.onfinish?.(); });
    expect(window.localStorage.getItem("lanpya-map-stop:fe")).toBe("current");
  });

  it("stands still on a first visit and remembers the stop", () => {
    render(<MissionMap milestones={milestones} pathKey="fe" locale="en" pathTitle="Frontend Developer" steps={0} labels={labels} />);
    expect(animate).not.toHaveBeenCalled();
    expect(window.localStorage.getItem("lanpya-map-stop:fe")).toBe("current");
  });
});

describe("MissionMap stop links", () => {
  beforeEach(() => {
    vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
    vi.stubGlobal("scrollTo", vi.fn());
  });
  const labels = { stageOf: "Stage {a} of {b}", steps: "points", youAreHere: "You are here", complete: "Verified", placed: "Placed by skills check", awaiting: "Awaiting review", locked: "Locked", nextMission: "Next mission", continueMission: "Continue mission", comingSoon: "Mission coming soon" };

  // The stop you stand on opened "the next mission", which could be the stage
  // before it while that one waited for review.
  it("opens each stop's own stage, and says when the current one has no mission", () => {
    const stops: Milestone[] = [
      { key: "js", order: 4, title: "JavaScript", description: "", proof: "", status: "complete", source: "checked" },
      { key: "git", order: 5, title: "Git", description: "", proof: "", status: "active" },
    ];
    const { container } = render(
      <MissionMap milestones={stops} locale="en" pathTitle="Frontend" steps={0} labels={labels}
        stageLinks={{ js: "/app/missions/interactive-opportunity-tracker" }} comingSoonHref="/app/roadmap?track=fe" />,
    );
    const done = container.querySelector(".map-card.done");
    const current = container.querySelector(".map-card.current");
    expect(done?.getAttribute("href")).toBe("/app/missions/interactive-opportunity-tracker");
    expect(current?.getAttribute("href")).toBe("/app/roadmap?track=fe");
    expect(current).toHaveTextContent("You are here · Mission coming soon");
  });
});
