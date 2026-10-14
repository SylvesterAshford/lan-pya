import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = "demo@lanpya.app";
const password = "LanPya-Demo-2026!";

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
    user_metadata: { name: "Thura", demo_account: true },
  });
  if (error) throw error;
  demoUser = data.user;
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: "Thura", demo_account: true },
  });
  if (error) throw error;
  demoUser = data.user;
}

const userId = demoUser.id;

const operations = [
  supabase.from("learner_profiles").upsert({
    user_id: userId,
    alias: "Thura",
    locale: "en",
    goal: "Frontend Developer",
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

// Everything the demo shows (paths, positions on both maps, the two verified
// missions, points) is defined once, in the database: reset_demo_account() in
// migrations 20261014064328 to 20261014064430. This script used to
// seed its own version, which drifted from production (a different name, no
// active path, no Frontend points). Calling the function keeps them identical,
// and re-running it puts back anything people changed through the account.
const { data: reset, error: resetError } = await supabase.rpc("reset_demo_account");
if (resetError) throw resetError;
if (!reset?.reset) throw new Error(`Demo account was not reset: ${JSON.stringify(reset)}`);

console.log(`Demo account provisioned: ${email}`);
