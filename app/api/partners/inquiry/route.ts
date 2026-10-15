import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ok, problem } from "@/lib/http";

/**
 * An inquiry from an employer, university or company about the business
 * plans. Partners have no Lan Pya account, so this works signed out; the
 * database limits lengths and ignores the same contact twice in ten minutes.
 * `website` is a field people never see: a form that fills it in is a bot,
 * and is told it succeeded so it does not retry.
 */
const schema = z.object({
  kind: z.enum(["employer", "university", "corporate"]),
  organization: z.string().trim().min(2).max(120),
  contactName: z.string().trim().min(2).max(80),
  contact: z.string().trim().min(5).max(120),
  message: z.string().trim().max(1000),
  website: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return problem(400, "invalid-inquiry", "Add your organisation, your name, and an email, phone number or Telegram.");
  }
  if (parsed.data.website) return ok({ received: true });

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_partner_inquiry", {
    p_kind: parsed.data.kind,
    p_organization: parsed.data.organization,
    p_contact_name: parsed.data.contactName,
    p_contact: parsed.data.contact,
    p_message: parsed.data.message,
  });
  if (error) return problem(400, "inquiry-not-sent", "Not sent. Check your connection and try again.", true);
  return ok(data);
}
