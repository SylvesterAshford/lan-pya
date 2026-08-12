import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const VERSION = "url-checker-v1";
const AUTOMATED_HOSTS = new Set(["github.com", "www.github.com", "vercel.app", "netlify.app", "pages.dev"]);
const PRIVATE_HOST = /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?)/i;

type Job = { job_id: string; submission_id: string; _queue_msg_id: number };
type Observation = { check: string; status: "pass" | "fail" | "inconclusive"; detail: string };

function allowed(url: URL) {
  if (url.protocol !== "https:" || PRIVATE_HOST.test(url.hostname)) return false;
  return [...AUTOMATED_HOSTS].some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
}

async function checkUrl(raw: string, label: string): Promise<Observation> {
  let url: URL;
  try { url = new URL(raw); } catch { return { check: label, status: "fail", detail: "URL is malformed." }; }
  if (!allowed(url)) return { check: label, status: "inconclusive", detail: "Host is outside the automated allowlist and requires human review." };
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, { method: "GET", redirect: "manual", signal: controller.signal, headers: { "user-agent": "LanPyaEvidenceChecker/1.0" } });
    if (response.status >= 300 && response.status < 400) return { check: label, status: "inconclusive", detail: "Redirect requires human review to avoid unsafe destination fetching." };
    return response.ok ? { check: label, status: "pass", detail: `Reachable (${response.status}).` } : { check: label, status: "fail", detail: `Returned HTTP ${response.status}.` };
  } catch { return { check: label, status: "inconclusive", detail: "Could not confirm reachability." }; }
  finally { clearTimeout(timeout); }
}

async function optionalAiFeedback(observations: Observation[]) {
  if (Deno.env.get("AI_FEEDBACK_ENABLED") !== "true") return null;
  const endpoint = Deno.env.get("AI_FEEDBACK_ENDPOINT"); const apiKey = Deno.env.get("AI_FEEDBACK_API_KEY");
  if (!endpoint || !apiKey) return null;
  try {
    const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(endpoint, { method: "POST", signal: controller.signal, headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" }, body: JSON.stringify({ model: Deno.env.get("AI_FEEDBACK_MODEL"), task: "Explain these deterministic web-evidence observations in two supportive sentences. Do not decide verification.", observations }) });
    clearTimeout(timeout);
    if (!response.ok) return null;
    const body = await response.json();
    return typeof body.feedback === "string" ? body.feedback.slice(0, 1000) : null;
  } catch { return null; }
}

Deno.serve(async (request) => {
  const expected = Deno.env.get("CRON_SECRET");
  if (expected && request.headers.get("authorization") !== `Bearer ${expected}`) return new Response("Unauthorized", { status: 401 });
  const url = Deno.env.get("SUPABASE_URL"); const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return new Response("Missing Supabase configuration", { status: 500 });
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data: jobs, error } = await supabase.rpc("dequeue_evaluation_jobs", { p_batch: 5 });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  const results = [];
  for (const job of (jobs ?? []) as Job[]) {
    const { data: submission } = await supabase.from("submission_versions").select("repository_url,deployment_url").eq("submission_id", job.submission_id).order("version", { ascending: false }).limit(1).maybeSingle();
    let outcome = "error"; let observations: Observation[] = []; let summary = "Submission evidence could not be loaded.";
    if (submission) {
      observations = await Promise.all([checkUrl(submission.repository_url, "repository"), checkUrl(submission.deployment_url, "deployment")]);
      outcome = observations.some((item) => item.status === "inconclusive") ? "inconclusive" : observations.some((item) => item.status === "fail") ? "feedback" : "pass";
      summary = outcome === "pass" ? "Both allowlisted evidence URLs are reachable." : outcome === "feedback" ? "One or more evidence URLs need correction." : "At least one URL requires human inspection.";
      const aiFeedback = await optionalAiFeedback(observations);
      if (aiFeedback) summary += ` Optional AI wording (non-verifying): ${aiFeedback}`;
    }
    const { error: completeError } = await supabase.rpc("complete_evaluation", { p_job_id: job.job_id, p_submission_id: job.submission_id, p_outcome: outcome, p_observations: observations, p_summary: summary, p_evaluator_version: VERSION });
    if (!completeError) await supabase.rpc("archive_evaluation_message", { p_msg_id: job._queue_msg_id });
    results.push({ submissionId: job.submission_id, outcome, completed: !completeError });
  }
  return Response.json({ processed: results.length, results });
});
