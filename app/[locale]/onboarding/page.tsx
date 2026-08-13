import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { requireUser } from "@/lib/auth";
import { getActivePathDashboard, getCareerPreferences, getProfile } from "@/lib/data/app-data";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requireUser(locale);
  const [profile, preferences, dashboard] = await Promise.all([getProfile(user.id), getCareerPreferences(user.id), getActivePathDashboard()]);
  const defaultName = String(user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Learner");
  return <OnboardingForm locale={locale} defaultName={defaultName} userId={user.id} initialValues={profile ? {
    alias: profile.alias,
    weeklyHours: profile.weeklyHours as "2–3 hours" | "4–6 hours" | "7+ hours",
    interests: preferences?.interests ?? [],
    preferredWork: preferences?.preferredWork ?? "not_sure",
    immediateGoal: preferences?.immediateGoal ?? "not_sure",
    deviceAccess: preferences?.deviceAccess ?? "not_sure",
    connectivity: preferences?.connectivity ?? "not_sure",
    priorExperience: preferences?.priorExperience ?? [],
    selectedTrackKey: dashboard.activePath?.key ?? null,
    consent: profile.onboardingComplete,
  } : undefined} />;
}
