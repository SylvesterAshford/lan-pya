import { CAREER_TRACKS, DIGITAL_PATH_PREVIEWS } from "@/lib/domain/career-tracks";
import type { CareerPathAvailability, CareerPreferences } from "@/lib/domain/types";

export type CareerPathCatalogItem = {
  key: string;
  title: string;
  description: string;
  outcome: string;
  availability: CareerPathAvailability;
  arena: string;
  device: string;
  timeToFirstProof: string;
  firstMission: string;
};

const TECHNICAL_PATHS: CareerPathCatalogItem[] = CAREER_TRACKS.map((track) => ({
  key: track.key,
  title: track.title,
  description: track.description,
  outcome: track.outcome,
  availability: track.key === "frontend-developer" ? "operational" : "preview",
  arena: "Technology & Data",
  device: "Laptop recommended",
  timeToFirstProof: "1–2 weeks",
  firstMission: track.key === "frontend-developer" ? "Responsive Profile Card" : "Mission design in progress",
}));

export const CAREER_PATH_CATALOG: CareerPathCatalogItem[] = [
  ...TECHNICAL_PATHS,
  ...DIGITAL_PATH_PREVIEWS.map((path) => ({
    key: path.key,
    title: path.title,
    description: path.description,
    outcome: path.outcome,
    availability: path.status,
    arena: path.arena,
    device: path.device,
    timeToFirstProof: path.timeToFirstProof,
    firstMission: path.firstMission,
  })),
];

export type CareerRecommendation = CareerPathCatalogItem & {
  reason: string;
  score: number;
};

type CareerRecommendationInput = CareerPreferences & {
  weeklyHours?: "2–3 hours" | "4–6 hours" | "7+ hours";
};

const immediateGoalLabels: Record<CareerPreferences["immediateGoal"], string | null> = {
  explore: "explore a direction",
  freelance: "prepare for freelance work",
  internship: "prepare for an internship",
  portfolio: "build a portfolio",
  first_job: "work toward a first job",
  not_sure: null,
};

const interestSignals: Record<string, string[]> = {
  "frontend-developer": ["technology", "programming", "startup", "math & physics", "business"],
  "content-creator": ["arts & culture", "social impact", "music", "movie & shows", "book", "self growth"],
  "full-stack-developer": ["technology", "programming", "startup"],
  "ai-data-analyst": ["technology", "math & physics", "finance", "business"],
  "video-editor": ["arts & culture", "movie & shows", "music", "fashion"],
  "brand-visual-designer": ["arts & culture", "fashion", "food"],
  "digital-marketing": ["business", "startup", "social impact", "food", "fashion"],
};

const workSignals: Record<string, string[]> = {
  make: ["frontend-developer", "full-stack-developer"],
  explain: ["content-creator", "digital-marketing"],
  design: ["brand-visual-designer", "video-editor", "frontend-developer"],
  analyze: ["ai-data-analyst", "digital-marketing"],
  organize: ["full-stack-developer", "digital-marketing"],
  grow: ["digital-marketing", "content-creator"],
  not_sure: [],
};

export function getCareerPath(key: string | null | undefined) {
  return CAREER_PATH_CATALOG.find((path) => path.key === key) ?? null;
}

export function getCareerRecommendations(preferences: CareerRecommendationInput): CareerRecommendation[] {
  const normalizedInterests = new Set(preferences.interests.map((item) => item.toLowerCase()));
  const ranked = CAREER_PATH_CATALOG.map((path) => {
    const interestMatches = (interestSignals[path.key] ?? []).filter((signal) => normalizedInterests.has(signal));
    const workMatch = (workSignals[preferences.preferredWork] ?? []).includes(path.key);
    const phoneFriendly = preferences.deviceAccess === "phone_only" && path.device.toLowerCase().includes("phone");
    const score = interestMatches.length * 3 + (workMatch ? 3 : 0) + (phoneFriendly ? 1 : 0) + (path.availability !== "preview" ? 1 : 0);
    const reasonParts = [
      interestMatches.length ? `you picked ${interestMatches.slice(0, 2).join(" and ")}` : null,
      workMatch ? `you prefer to ${preferences.preferredWork}` : null,
      phoneFriendly ? "it can start on your current device" : null,
      immediateGoalLabels[preferences.immediateGoal],
      preferences.weeklyHours === "2–3 hours" ? "you chose a smaller weekly rhythm" : null,
    ].filter(Boolean);
    return { ...path, score, reason: reasonParts.length ? `It fits because ${reasonParts.join(", ")}.` : "It is a practical first path with a clear first proof." };
  });

  return ranked.sort((a, b) => b.score - a.score || Number(b.availability !== "preview") - Number(a.availability !== "preview") || a.title.localeCompare(b.title));
}

export function getEligibleCareerPaths() {
  return CAREER_PATH_CATALOG.filter((path) => path.availability !== "preview");
}
