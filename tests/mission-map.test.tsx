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
        missionHref="/app/missions/responsive-profile-card"
        proofHref="/app/proof"
        labels={{
          stageOf: "Stage {a} of {b}",
          steps: "points",
          youAreHere: "You are here",
          complete: "Complete",
          locked: "Locked",
          nextMission: "Next mission",
          continueMission: "Continue mission",
        }}
      />,
    );

    expect(container.querySelector(".map-card.current")).toHaveTextContent("You are here");
    const expectedTop = Math.max(0, 850 - window.innerHeight / 2);
    act(() => { vi.advanceTimersByTime(60); });
    expect(scrollTo).toHaveBeenCalledWith({ top: expectedTop, behavior: "auto" });
  });
});
