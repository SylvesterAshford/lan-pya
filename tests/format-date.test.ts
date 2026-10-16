import { describe, expect, it } from "vitest";
import { formatAppDate } from "@/lib/i18n/format";

describe("formatAppDate", () => {
  // Browsers ship without Burmese date data, so the Burmese form is spelled
  // out. It must read exactly as ICU writes it, which the server used to send.
  it("writes Burmese dates as ICU does, for every month", () => {
    const icu = new Intl.DateTimeFormat("my-MM", { dateStyle: "medium", timeZone: "Asia/Yangon" });
    for (let month = 0; month < 12; month += 1) {
      const date = new Date(Date.UTC(2026, month, 9, 6));
      expect(formatAppDate("my", date)).toBe(icu.format(date));
    }
    expect(formatAppDate("my", "2026-10-01T09:00:00Z")).toBe("၂၀၂၆ အောက် ၁");
  });

  it("does not depend on the runtime having Burmese data", () => {
    const original = Intl.DateTimeFormat;
    // Chrome's fallback: asked for my-MM, it formats in English.
    Intl.DateTimeFormat = function (locale: string | string[] | undefined, options?: Intl.DateTimeFormatOptions) {
      return new original(locale === "my-MM" ? "en-US" : locale, options);
    } as unknown as typeof Intl.DateTimeFormat;
    try {
      expect(formatAppDate("my", "2026-10-01T09:00:00Z")).toBe("၂၀၂၆ အောက် ၁");
    } finally {
      Intl.DateTimeFormat = original;
    }
  });

  it("dates by the Yangon calendar, not the server's", () => {
    // 20:00 UTC on the 15th is 02:30 on the 16th in Yangon.
    expect(formatAppDate("en", "2026-10-15T20:00:00Z")).toBe("Oct 16, 2026");
    expect(formatAppDate("my", "2026-10-15T20:00:00Z")).toBe("၂၀၂၆ အောက် ၁၆");
    expect(formatAppDate("en", "2026-10-20")).toBe("Oct 20, 2026");
  });
});
