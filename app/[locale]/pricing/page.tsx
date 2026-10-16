import "../public.css";
import { setRequestLocale } from "next-intl/server";
import { PricingView } from "@/components/pricing/pricing-view";
import { getUser } from "@/lib/auth";
import { getPlanWaitlist, getProfile } from "@/lib/data/app-data";
import { isBillingFor, type Billing, type PaidPlanKey } from "@/lib/domain/plans";
import { getAppCopy } from "@/lib/i18n/app-copy";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * Plans and pricing. Public, so the landing page can link here, and the same
 * page a signed-in learner reaches from "Upgrade" in the sidebar: signed in it
 * says "Your current plan" on Free and lets them join a paid plan's waitlist.
 *
 *   ?tab  personal (default) | business
 */
export default async function PricingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { locale } = await params;
  const { tab } = await searchParams;
  setRequestLocale(locale);
  const user = hasSupabaseEnv() ? await getUser() : null;
  const [profile, waitlistRows] = user ? await Promise.all([getProfile(user.id), getPlanWaitlist(user.id)]) : [null, {}];

  const waitlist: Partial<Record<PaidPlanKey, Billing>> = {};
  for (const plan of ["pro", "career_plus"] as const) {
    const billing = waitlistRows[plan];
    if (billing && isBillingFor(plan, billing)) waitlist[plan] = billing;
  }

  return (
    <PricingView
      locale={locale}
      labels={getAppCopy(locale).pricing}
      signedIn={Boolean(user)}
      isDemo={profile?.dataOrigin === "seeded_demo"}
      waitlist={waitlist}
      initialTab={tab === "business" ? "business" : "personal"}
    />
  );
}
