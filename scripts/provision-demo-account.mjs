import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = "demo@lanpya.app";
const password = "REDACTED";

if (!url || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: listed, error: listError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listError) throw listError;

let demoUser = listed.users.find((user) => user.email === email);

if (demoUser) {
  const { data, error } = await supabase.auth.admin.updateUserById(demoUser.id, {
    password,
    email_confirm: true,
    user_metadata: { name: "Thiri", demo_account: true },
  });
  if (error) throw error;
  demoUser = data.user;
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: "Thiri", demo_account: true },
  });
  if (error) throw error;
  demoUser = data.user;
}

const userId = demoUser.id;

const operations = [
  supabase.from("learner_profiles").upsert({
    user_id: userId,
    alias: "Thiri",
    locale: "en",
    goal: "Frontend Web Developer",
    weekly_hours: "4–6 hours",
    onboarding_complete: true,
    data_origin: "seeded_demo",
  }),
  supabase.from("memberships").upsert({ user_id: userId, role: "learner", status: "active" }, { onConflict: "user_id,role" }),
  supabase.from("placement_assessments").upsert({
    id: "16000000-0000-0000-0000-000000000001",
    user_id: userId,
    skills: ["HTML", "Basic CSS", "Responsive design"],
    knowledge_score: 4,
    micro_task_score: 3,
    algorithm_version: "placement-v1",
    result_milestone_key: "responsive-css",
  }),
];

for (const operation of operations) {
  const { error } = await operation;
  if (error) throw error;
}

// Frontend track has 12 milestones (positions 1–12).
// Demo state: steps 1–2 verified, step 3 active (responsive-css), steps 4–12 upcoming.
const milestoneIds = Array.from({ length: 12 }, (_, i) =>
  `11000000-0000-0000-0000-${String(i + 1).padStart(12, "0")}`,
);

const { error: progressError } = await supabase.from("milestone_progress").upsert(
  milestoneIds.map((milestoneId, index) => ({
    id: `16100000-0000-0000-0000-${String(index + 1).padStart(12, "0")}`,
    user_id: userId,
    milestone_id: milestoneId,
    status: index < 2 ? "complete" : index === 2 ? "active" : "upcoming",
    source: "placement",
  })),
  { onConflict: "user_id,milestone_id" },
);
if (progressError) throw progressError;

const submissionId = "16200000-0000-0000-0000-000000000001";
const proofId = "16400000-0000-0000-0000-000000000001";

const seededRecords = [
  supabase.from("submissions").upsert({
    id: submissionId,
    user_id: userId,
    mission_id: "12000000-0000-0000-0000-000000000001",
    state: "verified",
    attempt: 1,
    current_version: 1,
    data_origin: "seeded_demo",
  }),
  supabase.from("submission_versions").upsert({
    id: "16300000-0000-0000-0000-000000000001",
    submission_id: submissionId,
    version: 1,
    repository_url: "https://github.com/example/responsive-profile-card",
    deployment_url: "https://example.com/responsive-profile-card",
    screenshot_url: null,
    reflection: "This prepared demo record shows how responsive layout, semantic HTML, and accessible structure become one inspectable proof item.",
    immutable_payload_hash: "demo-responsive-profile-card-v1",
  }, { onConflict: "submission_id,version" }),
];

for (const operation of seededRecords) {
  const { error } = await operation;
  if (error) throw error;
}

const { error: proofError } = await supabase.from("proof_items").upsert({
  id: proofId,
  user_id: userId,
  submission_id: submissionId,
  state: "active",
  snapshot: {
    title: "Responsive Profile Card",
    rubric_version: "responsive-profile-card-rubric-v1",
    reviewer_tier: "Prepared demo review",
    competencies: ["Semantic HTML", "Responsive CSS", "Accessible structure"],
    repository_url: "https://github.com/example/responsive-profile-card",
    deployment_url: "https://example.com/responsive-profile-card",
  },
  verified_at: "2026-08-10T10:00:00.000Z",
  data_origin: "seeded_demo",
});
if (proofError) throw proofError;

const { error: competencyError } = await supabase.from("proof_competencies").upsert([
  { proof_id: proofId, competency_id: "13000000-0000-0000-0000-000000000001" },
  { proof_id: proofId, competency_id: "13000000-0000-0000-0000-000000000002" },
  { proof_id: proofId, competency_id: "13000000-0000-0000-0000-000000000003" },
]);
if (competencyError) throw competencyError;

// ─── Content Creator: the demo account's ACTIVE path ──────────────────────────
//
// get_active_path_dashboard scopes every Home figure to the learner's active
// path. The demo account is active on content-creator, so seeding only the
// frontend track left Home reading "0/1 milestones, 0% complete, 0 XP" while
// the roadmap showed real progress. Seed the active path too.
//
// Requires migration 20260816185145_content_creator_full_track, which adds
// stages 2-5. Without it only stage 1 exists and this seeds 1/1 rather than 2/5.

const CONTENT_TRACK_ID = "40000000-0000-0000-0000-000000000001";
const CONTENT_MISSION_ID = "42000000-0000-0000-0000-000000000001";

const { data: contentMilestones, error: contentMilestoneError } = await supabase
  .from("roadmap_milestones")
  .select("id,key,position")
  .eq("track_id", CONTENT_TRACK_ID)
  .order("position");
if (contentMilestoneError) throw contentMilestoneError;

if (contentMilestones.length < 5) {
  console.warn(
    `Content Creator has ${contentMilestones.length} milestone(s) in the database, expected 5. ` +
    "Apply migration 20260816185145_content_creator_full_track first, then re-run.",
  );
}

// Stages 1-2 verified, stage 3 in progress, the rest ahead. A prepared account
// mid-journey, per PRODUCT.md: seeded records behave like a prepared account and
// stay visibly distinct from live learner evidence.
const { error: contentProgressError } = await supabase.from("milestone_progress").upsert(
  contentMilestones.map((milestone, index) => ({
    id: `16500000-0000-0000-0000-${String(index + 1).padStart(12, "0")}`,
    user_id: userId,
    milestone_id: milestone.id,
    status: index < 2 ? "complete" : index === 2 ? "active" : "upcoming",
    // milestone_progress_source_check allows placement | proof | admin only.
    source: "placement",
  })),
  { onConflict: "user_id,milestone_id" },
);
if (contentProgressError) throw contentProgressError;

const contentSubmissionId = "16600000-0000-0000-0000-000000000001";
const contentProofId = "16700000-0000-0000-0000-000000000001";

const contentRecords = [
  supabase.from("submissions").upsert({
    id: contentSubmissionId,
    user_id: userId,
    mission_id: CONTENT_MISSION_ID,
    state: "verified",
    attempt: 1,
    current_version: 1,
    data_origin: "seeded_demo",
  }),
  supabase.from("submission_versions").upsert({
    id: "16800000-0000-0000-0000-000000000001",
    submission_id: contentSubmissionId,
    version: 1,
    repository_url: "https://example.com/lan-pya-demo/audience-brief",
    deployment_url: "https://example.com/lan-pya-demo/campaign",
    screenshot_url: null,
    reflection:
      "A prepared demo record: one named audience, evidence for the problem, and the campaign direction that followed from it.",
    immutable_payload_hash: "demo-content-awareness-v1",
  }, { onConflict: "submission_id,version" }),
];

for (const operation of contentRecords) {
  const { error } = await operation;
  if (error) throw error;
}

const { error: contentProofError } = await supabase.from("proof_items").upsert({
  id: contentProofId,
  user_id: userId,
  submission_id: contentSubmissionId,
  state: "active",
  snapshot: {
    title: "Audience and campaign brief",
    rubric_version: "content-creator-awareness-rubric-v1",
    reviewer_tier: "Prepared demo review",
    competencies: ["Audience research", "Content strategy", "Accessible publishing", "Ethical communication"],
    repository_url: "https://example.com/lan-pya-demo/audience-brief",
    deployment_url: "https://example.com/lan-pya-demo/campaign",
  },
  verified_at: "2026-08-12T09:00:00.000Z",
  data_origin: "seeded_demo",
});
if (contentProofError) throw contentProofError;

// XP is path-scoped: career_quest_xp joins on track_id so Content Creator XP
// never moves a Frontend level. One verified core mission is worth 100.
const { error: xpError } = await supabase.from("career_quest_xp").upsert({
  user_id: userId,
  submission_id: contentSubmissionId,
  track_id: CONTENT_TRACK_ID,
  amount: 100,
  reason: "verified_core_mission",
}, { onConflict: "submission_id" });
if (xpError) throw xpError;

console.log(`Demo account provisioned: ${email}`);
