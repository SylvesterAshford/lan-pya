import type { Milestone, OpportunityCard, Profile, ProofItem } from "./types";
import { CAREER_TRACKS } from "./career-tracks";

export const DEMO_PROFILE: Profile = {
  id: "seeded-thiri",
  alias: "Thiri",
  locale: "en",
  goal: "Frontend Web Developer",
  weeklyHours: "4–6 hours",
  onboardingComplete: true,
  dataOrigin: "seeded_demo",
};

export const FRONTEND_MILESTONES: Milestone[] = CAREER_TRACKS[0].milestones;

export const DEMO_PROOF: ProofItem = {
  id: "seed-proof-responsive-card",
  title: "Responsive Profile Card",
  verifiedAt: "2026-08-10T09:30:00.000Z",
  rubricVersion: "responsive-profile-card-rubric-v1",
  reviewerTier: "Seeded demonstration reviewer",
  competencies: ["Semantic HTML", "Responsive CSS", "Accessible structure"],
  repositoryUrl: "https://github.com/example/lan-pya-profile-card",
  deploymentUrl: "https://example.vercel.app",
  state: "active",
  dataOrigin: "seeded_demo",
};

export const DEMO_OPPORTUNITIES: OpportunityCard[] = [
  { id: "seed-frontend-challenge", title: "Junior Frontend Build Challenge", organization: "Lan Pya Pilot Partner", type: "Challenge", location: "Remote · Myanmar", deadline: "20 Aug 2026", readiness: "Ready now", supported: ["Semantic HTML", "Responsive CSS"], gaps: [], unknown: [], sourceUrl: "https://example.com/frontend-challenge", lastVerifiedAt: "2026-08-11T03:00:00.000Z", dataOrigin: "seeded_demo" },
  { id: "seed-internship", title: "Frontend Engineering Internship", organization: "Myanmar Product Studio", type: "Internship", location: "Yangon · Hybrid", deadline: "29 Aug 2026", readiness: "Build toward", supported: ["Semantic HTML", "Responsive CSS"], gaps: ["JavaScript foundations", "Deployment history"], unknown: [], sourceUrl: "https://example.com/frontend-internship", lastVerifiedAt: "2026-08-11T03:00:00.000Z", dataOrigin: "seeded_demo" },
  { id: "seed-scholarship", title: "Digital Skills Scholarship", organization: "Future Skills Myanmar", type: "Scholarship", location: "Online", deadline: "12 Sep 2026", readiness: "Cannot determine", supported: ["Frontend interest"], gaps: [], unknown: ["Current university enrollment"], sourceUrl: "https://example.com/digital-scholarship", lastVerifiedAt: "2026-08-11T03:00:00.000Z", dataOrigin: "seeded_demo" }
];
