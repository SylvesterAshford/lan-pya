import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CORPORATE_PLAN,
  EMPLOYER_FEES,
  formatKyat,
  isBillingFor,
  PERSONAL_PLANS,
  priceFor,
  savingsPercent,
  UNIVERSITY_PLAN,
} from "@/lib/domain/plans";

const plan = (key: string) => PERSONAL_PLANS.find((item) => item.key === key)!;

describe("plan catalogue", () => {
  it("prices the founder's sheet", () => {
    expect(plan("pro").prices.map((price) => [price.billing, price.amount])).toEqual([["monthly", 10_000], ["six_months", 55_000]]);
    expect(plan("career_plus").prices.map((price) => [price.billing, price.amount])).toEqual([["monthly", 25_000], ["three_months", 70_000]]);
    expect(plan("free").prices).toEqual([]);
    expect(UNIVERSITY_PLAN.amount).toBe(300_000);
    expect(CORPORATE_PLAN.monthly).toBe(300_000);
  });

  // Savings are computed, never typed, so a price change cannot strand a stale badge.
  it.each([
    ["Pro, six months", 10_000, 55_000, 6, 8],
    ["Career+, three months", 25_000, 70_000, 3, 7],
    ["Corporate, three months", 300_000, 850_000, 3, 6],
    ["Corporate, six months", 300_000, 1_650_000, 6, 8],
  ])("%s saves %i%%", (_name, monthly, amount, months, percent) => {
    expect(savingsPercent(monthly, amount, months)).toBe(percent);
  });

  // The sheet printed (990,000) for the 3-month corporate plan; 3 x 300,000 is 900,000.
  it("compares the 3-month corporate plan with 900,000", () => {
    expect(CORPORATE_PLAN.monthly * CORPORATE_PLAN.longer[0].months).toBe(900_000);
  });

  it("only claims what Lan Pya can do today", () => {
    expect(plan("free").features.filter((feature) => feature.available).map((feature) => feature.en))
      .toEqual(["Career assessment", "Personalised roadmap", "Learning resources", "Basic portfolio"]);
    for (const key of ["pro", "career_plus"]) {
      expect(plan(key).features.every((feature) => !feature.available)).toBe(true);
    }
    expect(EMPLOYER_FEES.find((fee) => fee.title.en === "AI verification")?.available).toBe(false);
  });

  it("has every line in both languages", () => {
    const lines = [
      ...PERSONAL_PLANS.flatMap((item) => [item.name, item.tagline, item.note, ...item.features, ...(item.includes ? [item.includes] : [])]),
      ...EMPLOYER_FEES.flatMap((fee) => [fee.title, fee.detail, fee.value]),
      ...UNIVERSITY_PLAN.features,
      ...CORPORATE_PLAN.features,
    ];
    for (const line of lines) {
      expect(line.en.trim()).not.toBe("");
      expect(line.my.trim()).not.toBe("");
    }
  });

  it("formats kyat in both languages", () => {
    expect(formatKyat(55_000, "en")).toBe("55,000 MMK");
    expect(formatKyat(1_650_000, "en")).toBe("1,650,000 MMK");
    expect(formatKyat(10_000, "my")).toBe("၁၀,၀၀၀ ကျပ်");
  });

  it("finds a price by period", () => {
    expect(priceFor(plan("pro"), "six_months")?.amount).toBe(55_000);
    expect(priceFor(plan("pro"), "three_months")).toBeNull();
  });

  // The database refuses any other pair; the route and the cards must agree.
  it("sells the same periods the database allows", () => {
    expect(isBillingFor("pro", "monthly")).toBe(true);
    expect(isBillingFor("pro", "six_months")).toBe(true);
    expect(isBillingFor("pro", "three_months")).toBe(false);
    expect(isBillingFor("career_plus", "three_months")).toBe(true);
    expect(isBillingFor("career_plus", "six_months")).toBe(false);
    const dir = join(process.cwd(), "supabase/migrations");
    const sql = readdirSync(dir).map((file) => readFileSync(join(dir, file), "utf8")).find((body) => body.includes("plan_waitlist_billing_check")) ?? "";
    expect(sql).toContain("(plan = 'pro' and billing in ('monthly', 'six_months'))");
    expect(sql).toContain("(plan = 'career_plus' and billing in ('monthly', 'three_months'))");
  });
});
