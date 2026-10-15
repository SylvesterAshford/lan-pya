import { toMyanmarDigits } from "@/lib/domain/deadlines";

/**
 * Plans and pricing (founder's B2C and B2B sheets, 2026-10-15).
 *
 * One catalogue for the pricing page, the tests and the waitlist. Prices are
 * whole Myanmar kyat. Savings are worked out from the prices, never typed in,
 * so a price change cannot leave a stale "Save 8%" behind.
 *
 * `available` is the honesty rule from PRODUCT.md: a feature that does not
 * exist in Lan Pya yet is listed with a "Coming soon" tag, never as if it
 * worked. Flip it to true only when the feature ships.
 *
 * Paid plans are not on sale: there is no payment provider yet. Pro and
 * Career+ take a waitlist (join_plan_waitlist); the business plans take an
 * inquiry (submit_partner_inquiry).
 */

export type Bilingual = { en: string; my: string };
export type PlanFeature = Bilingual & { available: boolean };
export type Billing = "monthly" | "six_months" | "three_months";
export type PaidPlanKey = "pro" | "career_plus";
export type PersonalPlanKey = "free" | PaidPlanKey;
export type PriceOption = { billing: Billing; amount: number; months: number };

export type PersonalPlan = {
  key: PersonalPlanKey;
  name: Bilingual;
  tagline: Bilingual;
  /** Empty for Free. The first option is the monthly price. */
  prices: PriceOption[];
  /** Career+ lists only what it adds to Pro. */
  includes: Bilingual | null;
  features: PlanFeature[];
  note: Bilingual;
};

export const PERSONAL_PLANS: PersonalPlan[] = [
  {
    key: "free",
    name: { en: "Free", my: "အခမဲ့" },
    tagline: { en: "Start your journey.", my: "သင့်ခရီးကို စတင်ပါ။" },
    prices: [],
    includes: null,
    features: [
      { en: "Career assessment", my: "Career Compass အကဲဖြတ်မှု", available: true },
      { en: "Personalised roadmap", my: "ကိုယ်ပိုင် လမ်းပြမြေပုံ", available: true },
      { en: "Learning resources", my: "အခမဲ့ သင်ခန်းစာများ", available: true },
      { en: "Basic portfolio", my: "အခြေခံ Portfolio", available: true },
      { en: "1 AI review a month", my: "AI သုံးသပ်ချက် တစ်လ ၁ ကြိမ်", available: false },
    ],
    note: { en: "For getting started", my: "စတင်သူများအတွက်" },
  },
  {
    key: "pro",
    name: { en: "Pro Student", my: "Pro Student" },
    tagline: { en: "More skills. More opportunities.", my: "ကျွမ်းကျင်မှု ပိုများ၊ အခွင့်အလမ်း ပိုများ။" },
    prices: [
      { billing: "monthly", amount: 10_000, months: 1 },
      { billing: "six_months", amount: 55_000, months: 6 },
    ],
    includes: null,
    features: [
      { en: "Unlimited AI review", my: "AI သုံးသပ်ချက် အကန့်အသတ်မဲ့", available: false },
      { en: "AI CV builder", my: "AI CV ပြုလုပ်ပေးမှု", available: false },
      { en: "AI cover letter", my: "AI Cover Letter ရေးပေးမှု", available: false },
      { en: "Portfolio themes", my: "Portfolio ဒီဇိုင်းပုံစံများ", available: false },
      { en: "Weekly career plan", my: "အပတ်စဉ် Career အစီအစဉ်", available: false },
      { en: "Skill gap analysis by a reviewer", my: "Reviewer ၏ ကျွမ်းကျင်မှု လိုအပ်ချက် ဆန်းစစ်ခြင်း", available: false },
      { en: "Priority opportunity matching", my: "အခွင့်အလမ်း ဦးစားပေး ကိုက်ညီမှု", available: false },
    ],
    note: { en: "Up to 3 applications a month", my: "တစ်လလျှင် လျှောက်လွှာ ၃ ခုအထိ" },
  },
  {
    key: "career_plus",
    name: { en: "Career+", my: "Career+" },
    tagline: { en: "Go further. Get hired.", my: "ပိုဝေးဝေး သွားပါ။ အလုပ်ရပါစေ။" },
    prices: [
      { billing: "monthly", amount: 25_000, months: 1 },
      { billing: "three_months", amount: 70_000, months: 3 },
    ],
    includes: { en: "Everything in Pro, plus", my: "Pro ပါ အားလုံးအပြင်" },
    features: [
      { en: "Resume review", my: "Resume သုံးသပ်ပေးမှု", available: false },
      { en: "Priority job applications", my: "အလုပ်လျှောက်လွှာ ဦးစားပေးမှု", available: false },
      { en: "Interview tips from a reviewer", my: "Reviewer ၏ အင်တာဗျူး အကြံပြုချက်များ", available: false },
      { en: "Career coaching from a reviewer", my: "Reviewer ၏ Career လမ်းညွှန်မှု", available: false },
      { en: "Unlimited job applications", my: "အလုပ် အကန့်အသတ်မဲ့ လျှောက်ခွင့်", available: false },
    ],
    note: { en: "For final-year students and graduates", my: "နောက်ဆုံးနှစ် ကျောင်းသားများနှင့် ဘွဲ့ရများအတွက်" },
  },
];

export type FeeRow = { title: Bilingual; detail: Bilingual; value: Bilingual; available: boolean };

export const EMPLOYER_FEES: FeeRow[] = [
  {
    title: { en: "Job opportunity fee", my: "အလုပ်အခွင့်အလမ်း ဝန်ဆောင်ခ" },
    detail: { en: "Paid by the learner to Lan Pya", my: "သင်ယူသူမှ Lan Pya သို့ ပေးချေ" },
    value: { en: "10% service fee", my: "ဝန်ဆောင်ခ ၁၀%" },
    available: true,
  },
  {
    title: { en: "Hiring success fee", my: "ခန့်အပ်မှု အောင်မြင်ကြေး" },
    detail: { en: "Paid by the company to Lan Pya when it hires", my: "ကုမ္ပဏီက ခန့်အပ်ပါက Lan Pya သို့ ပေးချေ" },
    value: { en: "10% of salary", my: "လစာ၏ ၁၀%" },
    available: true,
  },
  {
    title: { en: "AI verification", my: "AI အတည်ပြုမှု" },
    detail: { en: "Automatic checks on submitted work", my: "တင်ပြထားသော လက်ရာကို အလိုအလျောက် စစ်ဆေးခြင်း" },
    value: { en: "Free", my: "အခမဲ့" },
    available: false,
  },
  {
    title: { en: "Expert verification", my: "ကျွမ်းကျင်သူ အတည်ပြုမှု" },
    detail: { en: "A reviewer checks the work", my: "Reviewer က လက်ရာကို စစ်ဆေးသည်" },
    value: { en: "8,000 MMK per project", my: "project တစ်ခုလျှင် ၈,၀၀၀ ကျပ်" },
    available: true,
  },
];

export const UNIVERSITY_PLAN = {
  amount: 300_000,
  features: [
    { en: "Dedicated roadmaps", my: "သီးသန့် လမ်းပြမြေပုံများ", available: false },
    { en: "Student dashboard", my: "ကျောင်းသား Dashboard", available: false },
    { en: "Analytics", my: "ခွဲခြမ်းစိတ်ဖြာမှု", available: false },
  ] satisfies PlanFeature[],
};

export const CORPORATE_PLAN = {
  monthly: 300_000,
  features: [
    { en: "Career events", my: "Career ပွဲများ", available: true },
    { en: "Networking and company sessions", my: "ကုမ္ပဏီ မိတ်ဆက်ပွဲများ", available: true },
    { en: "Branding on Lan Pya", my: "Lan Pya ပေါ်တွင် Brand ပြသမှု", available: true },
    { en: "Job posts", my: "အလုပ်ခေါ်စာ တင်ခြင်း", available: true },
  ] satisfies PlanFeature[],
  longer: [
    { months: 3, amount: 850_000 },
    { months: 6, amount: 1_650_000 },
  ],
};

export function text(value: Bilingual, locale: string) {
  return locale === "my" ? value.my : value.en;
}

/** A whole number with thousands separators, in the reader's digits. */
export function formatNumber(value: number, locale: string) {
  const grouped = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
  return locale === "my" ? grouped.replace(/\d/g, (digit) => toMyanmarDigits(Number(digit))) : grouped;
}

/** Whole kyat: "10,000 MMK", or "၁၀,၀၀၀ ကျပ်" in Burmese. */
export function formatKyat(amount: number, locale: string) {
  return `${formatNumber(amount, locale)} ${locale === "my" ? "ကျပ်" : "MMK"}`;
}

/** What a longer period saves against paying monthly for the same months. */
export function savingsPercent(monthly: number, amount: number, months: number) {
  const full = monthly * months;
  return full > 0 ? Math.round((1 - amount / full) * 100) : 0;
}

export function priceFor(plan: PersonalPlan, billing: Billing) {
  return plan.prices.find((price) => price.billing === billing) ?? null;
}

export function isPaidPlan(key: string): key is PaidPlanKey {
  return key === "pro" || key === "career_plus";
}

/** The billing periods each paid plan is sold in, as the database allows. */
export function isBillingFor(plan: PaidPlanKey, billing: string): billing is Billing {
  return PERSONAL_PLANS.some((item) => item.key === plan && item.prices.some((price) => price.billing === billing));
}
