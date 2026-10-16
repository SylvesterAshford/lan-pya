import { toMyanmarDigits } from "@/lib/domain/deadlines";
import type { OpportunityCard } from "@/lib/domain/types";

/**
 * Locale helpers with no dictionary behind them. Client components import
 * from here, not from app-copy, which holds every English and Burmese string
 * (about 28 KB compressed) and would ship all of it to the browser.
 */
export function localizeReadiness(locale: string, readiness: OpportunityCard["readiness"]) {
  if (locale !== "my") return readiness;
  return ({ "Ready now": "ယခုအဆင်သင့်", "Build toward": "ပြင်ဆင်ရန်လို", Explore: "စူးစမ်းရန်", "Cannot determine": "မသတ်မှတ်နိုင်" } as const)[readiness];
}

// Burmese month abbreviations exactly as ICU writes them ("my-MM", short).
// Spelled out because browsers ship without Burmese date data: Chrome formats
// "my-MM" in English, so a date the server wrote in Burmese changed language
// on hydration and React rebuilt the page (error #418 on Opportunities).
const MY_MONTHS = ["ဇန်", "ဖေ", "မတ်", "ဧ", "မေ", "ဇွန်", "ဇူ", "ဩ", "စက်", "အောက်", "နို", "ဒီ"];
const YANGON_PARTS = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Yangon", year: "numeric", month: "numeric", day: "numeric" });
const YANGON_MEDIUM = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Yangon", dateStyle: "medium" });

/**
 * A date on the audience's calendar (Asia/Yangon), written the same way on
 * the server and in every browser. Without a time zone the server (UTC) and a
 * reader's phone could disagree about the day near midnight.
 */
export function formatAppDate(locale: string, value: string | Date) {
  const date = new Date(value);
  if (locale !== "my") return YANGON_MEDIUM.format(date);
  const part = (type: string) => Number(YANGON_PARTS.formatToParts(date).find((p) => p.type === type)?.value);
  return `${toMyanmarDigits(part("year"))} ${MY_MONTHS[part("month") - 1]} ${toMyanmarDigits(part("day"))}`;
}
