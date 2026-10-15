import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  initialsFor,
  leaderboard,
  linksOf,
  noteFor,
  parseCommunity,
  stageOf,
  stageSections,
  type CommunityPerson,
} from "@/lib/domain/community";
import {
  communityLinkErrors,
  FACEBOOK_ID_URL,
  FACEBOOK_URL,
  hasAnyLink,
  LINKEDIN_URL,
  normalizeCommunityLinks,
  normalizeTelegram,
  TELEGRAM_URL,
} from "@/lib/validation/community-links";

const supabase = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn(async () => supabase) }));

import { getCommunity } from "@/lib/data/app-data";

const FRONTEND = "frontend-developer";
const KEYS = ["orientation", "semantic-html", "responsive-css", "javascript", "git-collaboration", "async-web-apis", "typescript-tooling", "component-framework", "application-data", "frontend-quality", "modern-delivery", "hiring-capstone"];

/** Statuses for someone on 1-based stage `n` of a 12-stage path. */
function on(n: number) {
  return KEYS.map((_, index) => (index + 1 < n ? "complete" : index + 1 === n ? "active" : "upcoming")) as CommunityPerson["statuses"];
}

function person(alias: string, stage: number | "finished", extra: Partial<CommunityPerson> = {}): CommunityPerson {
  const finished = stage === "finished";
  return {
    handle: `h-${alias}`, alias, avatar: "traveller", statuses: finished ? KEYS.map(() => "complete") : on(stage),
    verified: 0, completed: 0, points: 0, note: null, noteMy: null, telegram: null, facebook: null, linkedin: null,
    isMe: false, isSample: false, stageIndex: finished ? KEYS.length - 1 : stage - 1, finished, ...extra,
  };
}

describe("community links", () => {
  it.each([
    ["@aye_learns", "https://t.me/aye_learns"],
    ["aye_learns", "https://t.me/aye_learns"],
    ["t.me/aye_learns", "https://t.me/aye_learns"],
    ["https://t.me/aye_learns/", "https://t.me/aye_learns"],
    ["  @aye_learns  ", "https://t.me/aye_learns"],
  ])("normalises Telegram %s", (typed, stored) => {
    expect(normalizeTelegram(typed)).toBe(stored);
  });

  it("leaves a group invite as typed so validation refuses it", () => {
    expect(normalizeTelegram("https://t.me/+AbCdEf")).toBe("https://t.me/+AbCdEf");
    expect(communityLinkErrors({ telegram: "https://t.me/+AbCdEf", facebook: "", linkedin: "", note: "" })).toEqual({ telegram: true });
  });

  it.each([
    ["telegram", "https://t.me/ab"],
    ["facebook", "https://facebook.com/x"],
    ["facebook", "https://evil.example/facebook.com/aye.learns"],
    ["linkedin", "https://linkedin.com/company/acme"],
    ["linkedin", "http://www.linkedin.com/in/aye"],
  ] as const)("refuses a bad %s link: %s", (field, value) => {
    const links = { telegram: "", facebook: "", linkedin: "", note: "", [field]: value };
    expect(communityLinkErrors(links)).toEqual({ [field]: true });
  });

  it.each([
    { telegram: "https://t.me/aye_learns", facebook: "", linkedin: "" },
    { telegram: "", facebook: "https://www.facebook.com/aye.learns", linkedin: "" },
    { telegram: "", facebook: "https://m.facebook.com/aye.learns/", linkedin: "" },
    { telegram: "", facebook: "https://facebook.com/profile.php?id=123456", linkedin: "" },
    { telegram: "", facebook: "", linkedin: "https://www.linkedin.com/in/aye-learns/" },
  ])("accepts %o", (links) => {
    expect(communityLinkErrors({ ...links, note: "" })).toEqual({});
  });

  it("adds https:// to Facebook and LinkedIn links typed without it", () => {
    expect(normalizeCommunityLinks({ telegram: "", facebook: "facebook.com/aye.learns", linkedin: "www.linkedin.com/in/aye", note: " hi " }))
      .toEqual({ telegram: "", facebook: "https://facebook.com/aye.learns", linkedin: "https://www.linkedin.com/in/aye", note: "hi" });
  });

  it("limits the note to 120 characters", () => {
    expect(communityLinkErrors({ telegram: "", facebook: "", linkedin: "", note: "n".repeat(121) })).toEqual({ note: true });
    expect(communityLinkErrors({ telegram: "", facebook: "", linkedin: "", note: "n".repeat(120) })).toEqual({});
  });

  it("knows when there is a link to be listed with", () => {
    expect(hasAnyLink({ telegram: "", facebook: "", linkedin: "" })).toBe(false);
    expect(hasAnyLink({ telegram: "", facebook: "", linkedin: "https://linkedin.com/in/aye" })).toBe(true);
  });

  // The database's CHECK constraints are the real rules; these copies only
  // name the wrong field early. If the two drift, a link the form accepts is
  // refused by the database with a vaguer message, so drift fails here.
  it("matches the database's patterns exactly", () => {
    const dir = join(process.cwd(), "supabase/migrations");
    const sql = readdirSync(dir).map((file) => readFileSync(join(dir, file), "utf8")).find((text) => text.includes("learner_profiles_telegram_url_check"));
    expect(sql).toBeTruthy();
    const patterns = [...(sql as string).matchAll(/~ '([^']+)'/g)].map((match) => match[1]);
    const source = (pattern: RegExp) => pattern.source.replace(/\\\//g, "/");
    for (const pattern of [TELEGRAM_URL, FACEBOOK_URL, FACEBOOK_ID_URL, LINKEDIN_URL]) {
      expect(patterns).toContain(source(pattern));
    }
  });
});

describe("community data", () => {
  it("parses the RPC and drops rows it cannot show", () => {
    const data = parseCommunity({
      viewer: { visible: true, blocked: false, demo: true },
      keys: ["a", "b", 3],
      rows: [
        { handle: "x", alias: "Aye", statuses: ["complete", "weird"], verified: "2", points: -5, telegram: "https://t.me/aye_learns", is_me: true },
        { handle: "", alias: "Nobody" },
        { alias: "No handle" },
        { handle: "y", alias: "Bo", note: "  ", note_my: "မင်္ဂလာ", is_sample: true },
      ],
    });
    expect(data.viewer).toEqual({ visible: true, blocked: false, demo: true });
    expect(data.keys).toEqual(["a", "b"]);
    expect(data.rows.map((row) => row.alias)).toEqual(["Aye", "Bo"]);
    expect(data.rows[0]).toMatchObject({ statuses: ["complete", "upcoming"], verified: 2, points: 0, isMe: true, isSample: false });
    expect(data.rows[1]).toMatchObject({ note: null, noteMy: "မင်္ဂလာ", isSample: true, telegram: null });
  });

  it("treats a missing payload as empty, not as an error", () => {
    expect(parseCommunity(null)).toEqual({ viewer: { visible: false, blocked: false, demo: false }, keys: [], rows: [] });
  });

  describe("getCommunity", () => {
    beforeEach(() => supabase.rpc.mockReset());

    // Eng review D6: an outage must never read as "nobody is here".
    it("reports a failure instead of an empty community", async () => {
      supabase.rpc.mockResolvedValue({ data: null, error: { message: "timeout" } });
      await expect(getCommunity(FRONTEND)).resolves.toEqual({ ok: false });
    });

    it("returns parsed rows", async () => {
      supabase.rpc.mockResolvedValue({ data: { viewer: { visible: false }, keys: KEYS, rows: [{ handle: "x", alias: "Aye", statuses: on(4) }] }, error: null });
      const result = await getCommunity(FRONTEND);
      expect(supabase.rpc).toHaveBeenCalledWith("get_community", { p_track_key: FRONTEND });
      expect(result.ok && result.data.rows[0].alias).toBe("Aye");
    });
  });
});

describe("where a learner stands", () => {
  it("is the active stage", () => {
    expect(stageOf(FRONTEND, KEYS, on(4))).toEqual({ stageIndex: 3, finished: false });
  });

  it("is the first unfinished stage when nothing is active, like the roadmap", () => {
    const statuses = KEYS.map((_, index) => (index < 3 ? "complete" : "upcoming")) as CommunityPerson["statuses"];
    expect(stageOf(FRONTEND, KEYS, statuses)).toEqual({ stageIndex: 3, finished: false });
  });

  it("is stage 1 for someone who has not started", () => {
    const statuses = KEYS.map((_, index) => (index === 0 ? "next" : "upcoming")) as CommunityPerson["statuses"];
    expect(stageOf(FRONTEND, KEYS, statuses)).toEqual({ stageIndex: 0, finished: false });
  });

  it("is finished when every stage is complete", () => {
    expect(stageOf(FRONTEND, KEYS, KEYS.map(() => "complete"))).toEqual({ stageIndex: 11, finished: true });
  });
});

describe("Your stage sections", () => {
  const me = person("Thura", 4, { isMe: true });

  it("never lists the viewer and groups others around their stage", () => {
    const sections = stageSections([
      me,
      person("Kaung Zaw", 4, { completed: 2 }),
      person("Hnin Wai", 4, { verified: 2 }),
      person("Su Myat", 5, { verified: 4 }),
      person("Aung", 3),
      person("Min Khant", 6),
      person("Ei", 1),
      person("Nwe", "finished"),
    ], { relative: true });
    expect(sections.map((section) => [section.kind, section.people.map((p) => p.alias)])).toEqual([
      ["at", ["Hnin Wai", "Kaung Zaw"]],
      ["ahead", ["Su Myat"]],
      ["behind", ["Aung"]],
      ["finished", ["Nwe"]],
      ["elsewhere", ["Min Khant", "Ei"]],
    ]);
  });

  it("sorts inside a section by verified, then completed, then name", () => {
    const [at] = stageSections([me, person("Cy", 4, { completed: 1 }), person("Bo", 4, { verified: 1 }), person("Al", 4, { completed: 1 })], { relative: true });
    expect(at.people.map((p) => p.alias)).toEqual(["Bo", "Al", "Cy"]);
  });

  it("leaves out empty sections, so a lone viewer gets none", () => {
    expect(stageSections([me], { relative: true })).toEqual([]);
  });

  it("puts a finished viewer with the others who finished", () => {
    const sections = stageSections([person("Thura", "finished", { isMe: true }), person("Nwe", "finished"), person("Ei", 12)], { relative: true });
    expect(sections.map((section) => section.kind)).toEqual(["at", "behind"]);
  });

  // DR11: on a path the viewer is not on, there is no "ahead" or "behind".
  it("groups by stage when browsing another path", () => {
    const sections = stageSections([person("Bo", 2), person("Al", 1), person("Cy", 2, { verified: 1 }), person("Nwe", "finished")], { relative: false });
    expect(sections.map((section) => [section.kind, section.stageIndex, section.people.map((p) => p.alias)])).toEqual([
      ["stage", 0, ["Al"]],
      ["stage", 1, ["Cy", "Bo"]],
      ["finished", null, ["Nwe"]],
    ]);
  });
});

describe("Leaderboard", () => {
  it("shows no podium until three people have points", () => {
    const board = leaderboard([person("Al", 2, { points: 100 }), person("Bo", 5), person("Cy", 3, { points: 100 })]);
    expect(board.podium).toBeNull();
    expect(board.rows.map((row) => [row.person.alias, row.rank])).toEqual([["Bo", null], ["Cy", null], ["Al", null]]);
  });

  it("ranks by points, then verified, then stage, then name", () => {
    const board = leaderboard([
      person("Dee", 4, { points: 100, verified: 1 }),
      person("Al", 2, { points: 300, verified: 3 }),
      person("Bo", 4, { points: 300, verified: 3 }),
      person("Cy", 4, { points: 300, verified: 4 }),
      person("Eve", 4, { points: 100, verified: 1 }),
      person("Fin", "finished", { points: 0 }),
    ]);
    expect(board.podium?.map((p) => p.alias)).toEqual(["Cy", "Bo", "Al"]);
    expect(board.rows.map((row) => [row.person.alias, row.rank])).toEqual([["Dee", 4], ["Eve", 5], ["Fin", 6]]);
  });
});

describe("display helpers", () => {
  it.each([
    ["Su Myat Noe", "SM"],
    ["thura", "T"],
    ["  Hnin   Wai ", "HW"],
    ["သူရ", "သူ"],
    ["", "?"],
  ])("initials for %j are %j", (alias, initials) => {
    expect(initialsFor(alias)).toBe(initials);
  });

  it("lists links Telegram first, skipping missing ones", () => {
    expect(linksOf({ telegram: null, facebook: "https://facebook.com/aye.learns", linkedin: "https://linkedin.com/in/aye" }).map((link) => link.kind))
      .toEqual(["facebook", "linkedin"]);
  });

  it("shows a sample's Burmese note to a Burmese reader", () => {
    expect(noteFor({ note: "Hello", noteMy: "မင်္ဂလာပါ" }, "my")).toBe("မင်္ဂလာပါ");
    expect(noteFor({ note: "Hello", noteMy: "မင်္ဂလာပါ" }, "en")).toBe("Hello");
    expect(noteFor({ note: "Hello", noteMy: null }, "my")).toBe("Hello");
  });
});

describe("game layer helpers", () => {
  it("finds the viewer's rank and the gap to the next person", async () => {
    const { rankStanding } = await import("@/lib/domain/community");
    const board = leaderboard([
      person("Me", 4, { isMe: true, points: 100, verified: 1 }),
      person("A", 4, { points: 300 }),
      person("B", 4, { points: 200 }),
      person("C", 4, { points: 200 }),
    ]);
    expect(rankStanding(board)).toEqual({ rank: 4, points: 100, above: { alias: "C", gap: 100 } });
    expect(rankStanding(leaderboard([person("Me", 1, { isMe: true })]))).toBeNull();
  });
});
