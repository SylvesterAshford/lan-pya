import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => cleanup());
import TodayPage from "@/app/[locale]/app/today/page";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock("@/lib/auth", () => ({
  requireUser: async () => ({ id: "learner-1" }),
}));

vi.mock("@/lib/data/app-data", () => ({
  getActivePathDashboard: async () => ({
    activePath: {
      key: "frontend-developer",
      title: "Frontend Developer",
      description: "",
      availability: "operational",
    },
    progressPercent: 25,
    completedMilestones: 2,
    completedMissions: 1,
    totalMilestones: 12,
    verifiedCount: 1,
    streakDays: 0,
    xp: 200,
    level: 2,
    xpToNext: 100,
    nextMission: {
      key: "responsive-profile-card",
      title: "Responsive Profile Card",
      brief: {},
      workState: "active",
      submissionState: null,
    },
    pausedWork: [],
  }),
  getOpportunities: async () => [],
  getPathHistory: async () => [{ state: "active", lastActivatedAt: "", deactivatedAt: null, key: "frontend-developer", title: "Frontend Developer", availability: "operational" }],
  getProfile: async () => ({
    id: "learner-1",
    alias: "Learner",
    headline: null,
    avatar: "traveller",
    locale: "en",
    goal: "Frontend Developer",
    weeklyHours: "4–6 hours",
    onboardingComplete: true,
    dataOrigin: "live",
  }),
  getProofItems: async () => [],
  getRoadmap: async () => [{
    key: "css-responsive-layout",
    order: 3,
    title: "CSS and responsive layout",
    description: "",
    proof: "Responsive profile card",
    status: "active",
  }],
}));

vi.mock("@/components/home/todays-climb", () => ({
  TodaysClimb: ({ missionHref, labels }: { missionHref: string; labels: { continueMission: string } }) => (
    <a href={missionHref}>{labels.continueMission}</a>
  ),
}));

vi.mock("@/components/app/level-up-moment", () => ({ LevelUpMoment: () => null }));

describe("TodayPage mission navigation", () => {
  it("opens the mission climb at the learner's current position", async () => {
    const page = await TodayPage({ params: Promise.resolve({ locale: "en" }) });
    render(page);

    expect(screen.getByRole("link", { name: "Continue mission" }))
      .toHaveAttribute("href", "/app/missions");
  });
});

describe("TodayPage minimal layout", () => {
  // Every line under the greeting is read from the learner's records.
  it("states where the learner stands from their own data", async () => {
    render(await TodayPage({ params: Promise.resolve({ locale: "en" }) }));
    expect(screen.getByText("Stage 3 of 1 · Frontend Developer · 200 points · Starter", { exact: false })).toBeInTheDocument();
  });

  it("shows an empty Up next and a card about the learner rather than filler", async () => {
    render(await TodayPage({ params: Promise.resolve({ locale: "en" }) }));
    expect(screen.getByRole("heading", { name: "Up next" })).toBeInTheDocument();
    expect(screen.getByText("Nothing is waiting on you. Your stage is above.")).toBeInTheDocument();
    // The card beside it is about this learner: their name, path and position.
    expect(screen.getByRole("heading", { name: "Learner" })).toBeInTheDocument();
    expect(screen.getByText("Now · Stage 3 of 1")).toBeInTheDocument();
    expect(screen.getByText("None yet")).toBeInTheDocument();
  });
});

