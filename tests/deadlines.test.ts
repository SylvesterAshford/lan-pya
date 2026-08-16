import { describe, expect, it } from "vitest";
import {
  byDeadlineAscending,
  formatDeadlineCountdown,
  getAppToday,
  getDeadlineStatus,
  toLocalMidnight,
  toMyanmarDigits,
} from "@/lib/domain/deadlines";

// Fixed "today" so these never drift. 16 August 2026, mid-afternoon local.
const NOW = new Date(2026, 7, 16, 15, 30);

describe("toLocalMidnight", () => {
  it("parses a Postgres date-only string as a LOCAL calendar date", () => {
    // The bug this guards: new Date("2026-08-20") is UTC midnight, which is
    // 19 August in every negative-offset timezone.
    const d = toLocalMidnight("2026-08-20");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(7);
    expect(d.getDate()).toBe(20);
    expect(d.getHours()).toBe(0);
  });

  it("parses the demo-data format", () => {
    const d = toLocalMidnight("20 Aug 2026");
    expect(d.getMonth()).toBe(7);
    expect(d.getDate()).toBe(20);
  });

  it("strips the time from a Date", () => {
    const d = toLocalMidnight(new Date(2026, 7, 20, 23, 59, 59));
    expect(d.getDate()).toBe(20);
    expect(d.getHours()).toBe(0);
  });

  it("returns an invalid date for unparseable input rather than throwing", () => {
    expect(Number.isNaN(toLocalMidnight("not a date").getTime())).toBe(true);
  });
});

describe("getDeadlineStatus", () => {
  it("counts whole days regardless of the time of day", () => {
    // 15:30 on the 16th to midnight on the 20th is 3.35 days of wall time, but
    // the learner should read 4.
    expect(getDeadlineStatus("2026-08-20", NOW).daysRemaining).toBe(4);
  });

  it.each([
    ["2026-08-15", "past", -1, "muted"],
    ["2026-08-16", "today", 0, "amber"],
    ["2026-08-17", "tomorrow", 1, "amber"],
    ["2026-08-18", "soon", 2, "amber"],
    ["2026-08-23", "soon", 7, "amber"],
    ["2026-08-24", "upcoming", 8, "neutral"],
    ["2026-09-12", "upcoming", 27, "neutral"],
  ])("%s is %s (%i days, %s)", (deadline, urgency, days, tone) => {
    const status = getDeadlineStatus(deadline as string, NOW);
    expect(status.urgency).toBe(urgency);
    expect(status.daysRemaining).toBe(days);
    expect(status.tone).toBe(tone);
  });

  it("shows an absolute date only from 8 days out", () => {
    expect(getDeadlineStatus("2026-08-23", NOW).showAbsoluteDate).toBe(false);
    expect(getDeadlineStatus("2026-08-24", NOW).showAbsoluteDate).toBe(true);
  });

  it("treats 7 days as the amber boundary, per Design Spec §3.5", () => {
    expect(getDeadlineStatus("2026-08-23", NOW).tone).toBe("amber");
    expect(getDeadlineStatus("2026-08-24", NOW).tone).toBe("neutral");
  });
});

describe("formatDeadlineCountdown", () => {
  const label = (deadline: string, locale = "en") =>
    formatDeadlineCountdown(locale, getDeadlineStatus(deadline, NOW));

  it("phrases English countdowns", () => {
    expect(label("2026-08-16")).toBe("Closes today");
    expect(label("2026-08-17")).toBe("Closes tomorrow");
    expect(label("2026-08-20")).toBe("Closes in 4 days");
    expect(label("2026-08-15")).toBe("Closed");
  });

  it("returns null beyond a week so the caller renders the date", () => {
    expect(label("2026-09-12")).toBeNull();
  });

  it("phrases Burmese countdowns with Myanmar digits", () => {
    expect(label("2026-08-20", "my")).toBe("၄ ရက် ကျန်");
    expect(label("2026-08-16", "my")).toBe("ယနေ့ နောက်ဆုံးရက်");
    expect(label("2026-08-15", "my")).toBe("ပိတ်သွားပြီ");
    expect(label("2026-09-12", "my")).toBeNull();
  });
});

describe("toMyanmarDigits", () => {
  it("converts every digit", () => {
    expect(toMyanmarDigits(1234567890)).toBe("၁၂၃၄၅၆၇၈၉၀");
    expect(toMyanmarDigits(7)).toBe("၇");
  });
});

describe("byDeadlineAscending", () => {
  it("sorts soonest first", () => {
    const items = [
      { deadline: "2026-09-12" },
      { deadline: "2026-08-20" },
      { deadline: "2026-08-29" },
    ];
    expect([...items].sort(byDeadlineAscending).map((i) => i.deadline)).toEqual([
      "2026-08-20",
      "2026-08-29",
      "2026-09-12",
    ]);
  });

  it("pushes unparseable deadlines to the end", () => {
    const items = [{ deadline: "nonsense" }, { deadline: "2026-08-20" }];
    expect([...items].sort(byDeadlineAscending)[0].deadline).toBe("2026-08-20");
  });
});

describe("getAppToday", () => {
  it("resolves today in Myanmar time, not the server's timezone", () => {
    // 2026-08-16T23:00Z is already 05:30 on the 17th in Yangon (UTC+06:30).
    const lateUtc = new Date("2026-08-16T23:00:00.000Z");
    const today = getAppToday(lateUtc);
    expect(today.getFullYear()).toBe(2026);
    expect(today.getMonth()).toBe(7);
    expect(today.getDate()).toBe(17);
  });

  it("a deadline reads one day nearer for a Yangon learner than a UTC server", () => {
    const lateUtc = new Date("2026-08-16T23:00:00.000Z");
    const yangon = getDeadlineStatus("2026-08-20", getAppToday(lateUtc));
    expect(yangon.daysRemaining).toBe(3);
  });
});
