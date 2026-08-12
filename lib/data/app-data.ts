import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getCareerTrack, mergeTrackMilestones } from "@/lib/domain/career-tracks";
import type { Milestone, OpportunityCard, Profile, ProofItem } from "@/lib/domain/types";

type UnknownRecord = Record<string, unknown>;

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("learner_profiles").select("*").eq("user_id", userId).maybeSingle();
  if (!data) return null;
  return {
    id: String(data.user_id), alias: String(data.alias ?? "Learner"),
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

export async function getTodayDashboard() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_today_dashboard");
  return (data ?? null) as UnknownRecord | null;
}

export async function getRoadmap(trackKey = "frontend-developer"): Promise<Milestone[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_roadmap", { p_track_key: trackKey });
  if (!error && Array.isArray(data)) return mergeTrackMilestones(trackKey, data as Milestone[]);

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
  return ((data ?? []) as UnknownRecord[]).map((row) => ({
    id: String(row.id), title: String(row.title), organization: String(row.organization), type: String(row.type),
    location: String(row.location), deadline: String(row.deadline), readiness: row.readiness as OpportunityCard["readiness"],
    supported: Array.isArray(row.supported) ? row.supported.map(String) : [], gaps: Array.isArray(row.gaps) ? row.gaps.map(String) : [],
    unknown: Array.isArray(row.unknown) ? row.unknown.map(String) : [], sourceUrl: String(row.source_url),
    lastVerifiedAt: String(row.last_verified_at), dataOrigin: row.data_origin === "seeded_demo" ? "seeded_demo" : "live",
  }));
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
