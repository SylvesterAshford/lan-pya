export type DataOrigin = "live" | "seeded_demo";
export type Readiness = "Ready now" | "Build toward" | "Explore" | "Cannot determine";
export type SubmissionState =
  | "draft"
  | "submitted"
  | "deterministic_running"
  | "automated_feedback_ready"
  | "automated_inconclusive"
  | "automated_skipped"
  | "human_review_queued"
  | "human_review_in_progress"
  | "changes_requested"
  | "verified"
  | "rejected"
  | "appeal_requested"
  | "closed";

export type Profile = {
  id: string;
  alias: string;
  locale: "en" | "my";
  goal: string;
  weeklyHours: string;
  onboardingComplete: boolean;
  dataOrigin: DataOrigin;
};

export type Milestone = {
  key: string;
  order: number;
  title: string;
  description: string;
  proof: string;
  status: "complete" | "active" | "next" | "upcoming";
  leftLabel?: string;
  left?: string[];
  rightLabel?: string;
  right?: string[];
  estimate?: string;
};

export type CareerTrack = {
  key: "frontend-developer" | "full-stack-developer" | "ai-data-analyst";
  title: string;
  shortTitle: string;
  description: string;
  outcome: string;
  milestones: Milestone[];
};

export type PathStatus = "operational" | "controlled_pilot" | "preview";

export type CareerPathPreview = {
  key: string;
  title: string;
  shortTitle: string;
  description: string;
  outcome: string;
  status: PathStatus;
  device: string;
  timeToFirstProof: string;
  arena: string;
  stages: string[];
  firstMission: string;
};

export type OpportunityCard = {
  id: string;
  title: string;
  organization: string;
  type: string;
  location: string;
  deadline: string;
  readiness: Readiness;
  supported: string[];
  gaps: string[];
  unknown: string[];
  sourceUrl: string;
  lastVerifiedAt: string;
  dataOrigin: DataOrigin;
};

export type ProofItem = {
  id: string;
  title: string;
  verifiedAt: string;
  rubricVersion: string;
  reviewerTier: string;
  competencies: string[];
  repositoryUrl: string;
  deploymentUrl: string;
  state: "active" | "invalidated" | "deleted";
  dataOrigin: DataOrigin;
};
