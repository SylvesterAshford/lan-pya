import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { demoReadOnly, ok, problem } from "@/lib/http";
import { communityLinkErrors, hasAnyLink, normalizeCommunityLinks } from "@/lib/validation/community-links";

/**
 * Community settings: the "Show me in Community" switch, three contact links
 * and a note, written through `update_community_settings`. Telegram arrives in
 * whatever form the learner typed (@name, name, t.me/name) and is normalised
 * here; the database's CHECK constraints are the final word on every format.
 */
const schema = z.object({
  visible: z.boolean(),
  telegram: z.string().max(200),
  facebook: z.string().max(200),
  linkedin: z.string().max(200),
  note: z.string().max(500),
});

const FIELD_NAMES = { telegram: "the Telegram username", facebook: "the Facebook link", linkedin: "the LinkedIn link", note: "the note" } as const;

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return problem(400, "invalid-community-settings", "Send the switch, the three links and the note.");

  const links = normalizeCommunityLinks(parsed.data);
  const wrong = (Object.keys(communityLinkErrors(links)) as (keyof typeof FIELD_NAMES)[]).map((field) => FIELD_NAMES[field]);
  if (wrong.length) return problem(400, "invalid-community-links", `Check ${wrong.join(" and ")}.`);
  if (parsed.data.visible && !hasAnyLink(links)) {
    return problem(400, "community-needs-link", "Add a Telegram, Facebook or LinkedIn link before turning Community on.");
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return problem(401, "authentication-required", "Sign in before changing Community settings.");

  const { data, error } = await supabase.rpc("update_community_settings", {
    p_visible: parsed.data.visible,
    p_telegram: links.telegram,
    p_facebook: links.facebook,
    p_linkedin: links.linkedin,
    p_note: links.note,
  });
  const demo = demoReadOnly(error); if (demo) return demo;
  if (error?.message?.includes("community listing paused")) {
    return problem(409, "community-paused", "Your Community listing is paused while we look at a report.");
  }
  if (error?.code === "23514") return problem(400, "invalid-community-links", "One of the links is not in a format Lan Pya can show.");
  if (error) return problem(400, "community-not-saved", "Not saved. Check your connection and try again.", true);
  return ok(data);
}
