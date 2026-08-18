import "server-only";

import { createClient } from "@/lib/supabase/server";
import { CAREER_TRACKS, getCareerTrack, mergeTrackMilestones } from "@/lib/domain/career-tracks";
import { byDeadlineAscending } from "@/lib/domain/deadlines";
import type { ActivePathDashboard, CareerPreferences, Milestone, OpportunityCard, PausedMissionWork, Profile, ProofItem, SubmissionState } from "@/lib/domain/types";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as UnknownRecord : {};
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function asNumber(value: unknown): number {
  return typeof value === "number" ? value : Number(value ?? 0) || 0;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("learner_profiles").select("*").eq("user_id", userId).maybeSingle();
  if (!data) return null;
  return {
    id: String(data.user_id), alias: String(data.alias ?? "Learner"),
    headline: data.headline ? String(data.headline) : null, avatar: String(data.avatar ?? "traveller"),
    locale: data.locale === "my" ? "my" : "en", goal: String(data.goal ?? "Frontend Web Developer"),
    weeklyHours: String(data.weekly_hours ?? "4–6 hours"), onboardingComplete: Boolean(data.onboarding_complete),
    dataOrigin: data.data_origin === "seeded_demo" ? "seeded_demo" : "live",
  };
}

export async function getRoles(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("memberships").select("role").eq("user_id", userId).eq("status", "active");
  return new Set((data ?? []).map((row) => String(row.role)));
}

export async function getCareerPreferences(userId: string): Promise<CareerPreferences | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("career_preferences").select("*").eq("user_id", userId).maybeSingle();
  if (!data) return null;
  const preferredWork = String(data.preferred_work ?? "not_sure") as CareerPreferences["preferredWork"];
  const immediateGoal = String(data.immediate_goal ?? "not_sure") as CareerPreferences["immediateGoal"];
  const deviceAccess = String(data.device_access ?? "not_sure") as CareerPreferences["deviceAccess"];
  const connectivity = String(data.connectivity ?? "not_sure") as CareerPreferences["connectivity"];
  return { interests: asStringArray(data.interests), preferredWork, immediateGoal, deviceAccess, connectivity, priorExperience: asStringArray(data.prior_experience) };
}

export async function getActivePathDashboard(): Promise<ActivePathDashboard> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_active_path_dashboard");
  const record = asRecord(data);
  const path = asRecord(record.active_path);
  const mission = asRecord(record.next_mission);
  const pausedWork = Array.isArray(record.paused_work)
    ? record.paused_work.map((item): PausedMissionWork => {
      const work = asRecord(item);
      return { missionKey: String(work.mission_key ?? ""), missionTitle: String(work.mission_title ?? "Mission"), pathKey: String(work.path_key ?? ""), pathTitle: String(work.path_title ?? "Previous path") };
    }).filter((item) => item.missionKey)
    : [];

  return {
    activePath: path.key ? {
      key: String(path.key), title: String(path.title ?? "Your path"), description: String(path.description ?? ""),
      availability: path.availability === "controlled_pilot" || path.availability === "preview" ? path.availability : "operational",
    } : null,
    progressPercent: asNumber(record.progress_percent),
    completedMilestones: asNumber(record.completed_milestones),
    totalMilestones: asNumber(record.total_milestones),
    verifiedCount: asNumber(record.verified_count),
    streakDays: asNumber(record.streak_days),
    xp: asNumber(record.xp),
    level: Math.max(1, asNumber(record.level)),
    xpToNext: asNumber(record.xp_to_next),
    nextMission: mission.key ? {
      key: String(mission.key), title: String(mission.title ?? "Your first mission"), brief: asRecord(mission.brief),
      workState: mission.work_state === "active" || mission.work_state === "paused" ? mission.work_state : "available",
      submissionState: mission.submission_state ? String(mission.submission_state) as SubmissionState : null,
    } : null,
    pausedWork,
  };
}

export async function getPathHistory(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("learner_path_history")
    .select("state,last_activated_at,deactivated_at,career_tracks(key,title,availability)")
    .eq("user_id", userId)
    .order("last_activated_at", { ascending: false });
  return (data ?? []).map((row) => {
    const trackValue = row.career_tracks;
    const track = Array.isArray(trackValue) ? asRecord(trackValue[0]) : asRecord(trackValue);
    return {
      state: String(row.state ?? "previous"),
      lastActivatedAt: String(row.last_activated_at ?? ""),
      deactivatedAt: row.deactivated_at ? String(row.deactivated_at) : null,
      key: String(track.key ?? ""),
      title: String(track.title ?? "Previous path"),
      availability: String(track.availability ?? "preview"),
    };
  }).filter((item) => item.key);
}

export async function getTodayDashboard() {
  return getActivePathDashboard();
}

export async function getRoadmap(trackKey = "frontend-developer"): Promise<Milestone[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_roadmap", { p_track_key: trackKey });
  if (!error && Array.isArray(data)) {
    const isCatalogTrack = CAREER_TRACKS.some((track) => track.key === trackKey);
    return isCatalogTrack ? mergeTrackMilestones(trackKey, data as Milestone[]) : data as Milestone[];
  }

  if (trackKey === "frontend-developer") {
    const legacy = await supabase.rpc("get_frontend_roadmap");
    if (Array.isArray(legacy.data)) return mergeTrackMilestones(trackKey, legacy.data as Milestone[]);
  }

  return getCareerTrack(trackKey).milestones;
}

export async function getProofItems(): Promise<ProofItem[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("proof_items").select("id,state,verified_at,snapshot,data_origin").order("verified_at", { ascending: false });
  return (data ?? []).map((row) => {
    const snapshot = (row.snapshot ?? {}) as UnknownRecord;
    return {
      id: String(row.id), title: String(snapshot.title ?? "Verified project"), verifiedAt: String(row.verified_at),
      rubricVersion: String(snapshot.rubric_version ?? "Unknown"), reviewerTier: String(snapshot.reviewer_tier ?? "Human reviewer"),
      competencies: Array.isArray(snapshot.competencies) ? snapshot.competencies.map(String) : [],
      repositoryUrl: String(snapshot.repository_url ?? ""), deploymentUrl: String(snapshot.deployment_url ?? ""),
      state: row.state === "invalidated" || row.state === "deleted" ? row.state : "active",
      dataOrigin: row.data_origin === "seeded_demo" ? "seeded_demo" : "live",
    };
  });
}

export async function getOpportunities(): Promise<OpportunityCard[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_opportunity_readiness");
  return ((data ?? []) as UnknownRecord[]).map((row): OpportunityCard => ({
    id: String(row.id), title: String(row.title), organization: String(row.organization), type: String(row.type),
    location: String(row.location), deadline: String(row.deadline), readiness: row.readiness as OpportunityCard["readiness"],
    supported: Array.isArray(row.supported) ? row.supported.map(String) : [], gaps: Array.isArray(row.gaps) ? row.gaps.map(String) : [],
    unknown: Array.isArray(row.unknown) ? row.unknown.map(String) : [], sourceUrl: String(row.source_url),
    lastVerifiedAt: String(row.last_verified_at), dataOrigin: row.data_origin === "seeded_demo" ? "seeded_demo" : "live",
  }))
    // The feed heading promises "sorted by deadline"; do not rely on the RPC's
    // ordering to keep that promise. Design Spec §3.5: soonest first.
    .sort(byDeadlineAscending);
}

export async function getReviewQueue() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_reviewer_queue");
  return (data ?? []) as UnknownRecord[];
}

export async function getAdminSummary() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_admin_summary");
  return (data ?? {}) as UnknownRecord;
}
