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

export function formatAppDate(locale: string, value: string | Date) {
  return new Intl.DateTimeFormat(locale === "my" ? "my-MM" : "en-US", { dateStyle: "medium" }).format(new Date(value));
}
