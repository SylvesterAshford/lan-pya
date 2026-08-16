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

export type CareerPathAvailability = "operational" | "controlled_pilot" | "preview";

export type CareerPreferences = {
  interests: string[];
  preferredWork: "make" | "explain" | "design" | "analyze" | "organize" | "grow" | "not_sure";
  immediateGoal: "explore" | "freelance" | "internship" | "portfolio" | "first_job" | "not_sure";
  deviceAccess: "phone_only" | "phone_and_laptop" | "laptop" | "not_sure";
  connectivity: "reliable" | "limited" | "not_sure";
  priorExperience: string[];
};

export type ActivePath = {
  key: string;
  title: string;
  description: string;
  availability: CareerPathAvailability;
};

export type PausedMissionWork = {
  missionKey: string;
  missionTitle: string;
  pathKey: string;
  pathTitle: string;
};

export type ActivePathDashboard = {
  activePath: ActivePath | null;
  progressPercent: number;
  completedMilestones: number;
  totalMilestones: number;
  verifiedCount: number;
  streakDays: number;
  xp: number;
  level: number;
  xpToNext: number;
  nextMission: {
    key: string;
    title: string;
    brief: Record<string, unknown>;
    workState: "available" | "active" | "paused";
    submissionState: SubmissionState | null;
  } | null;
  pausedWork: PausedMissionWork[];
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
  /** Published shape of the journey is visible, but this stage has no content
   *  yet. Renders dashed and non-interactive. Design Spec §3.3 node states. */
  comingSoon?: boolean;
};

export type CareerTrack = {
  key: string;
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
