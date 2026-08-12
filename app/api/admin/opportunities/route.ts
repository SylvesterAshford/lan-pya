import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";

const schema = z.object({ title: z.string().trim().min(3).max(160), organization: z.string().trim().min(2).max(160), sourceUrl: z.string().url().max(500) });

export async function POST(request: Request) {
  const form = await request.formData(); const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return problem(400, "invalid-opportunity", "Add a title, organization, and valid source URL.");
  const supabase = await createClient(); const { data, error } = await supabase.rpc("admin_create_opportunity", { p_title: parsed.data.title, p_organization: parsed.data.organization, p_source_url: parsed.data.sourceUrl });
  if (error) return problem(403, "opportunity-not-created", "Admin access is required to create opportunity drafts.");
  return ok({ opportunityId: data, status: "draft" }, 201);
}
