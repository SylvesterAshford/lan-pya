import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
vi.mock("@/components/app/changelog-rail", () => ({ ChangelogRail: () => null }));
vi.mock("@/components/home/momentum-track", () => ({ MomentumTrack: () => null }));
vi.mock("@/components/home/this-week", () => ({ ThisWeek: () => null }));
vi.mock("@/components/home/proof-panel", () => ({ ProofPanel: () => null }));
vi.mock("@/components/home/opportunity-signal", () => ({ OpportunitySignal: () => null }));
vi.mock("@/lib/domain/changelog", () => ({ getReleases: () => [] }));

describe("TodayPage mission navigation", () => {
  it("opens the mission climb at the learner's current position", async () => {
    const page = await TodayPage({ params: Promise.resolve({ locale: "en" }) });
    render(page);

    expect(screen.getByRole("link", { name: "Continue mission" }))
      .toHaveAttribute("href", "/app/missions");
  });
});
