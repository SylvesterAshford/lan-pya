import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { requireUser } from "@/lib/auth";
import { getProfile } from "@/lib/data/app-data";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requireUser(locale);
  const profile = await getProfile(user.id);
  if (profile?.onboardingComplete) redirect(`/${locale}/app/today`);
  const defaultName = String(user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Learner");
  return <OnboardingForm locale={locale} defaultName={defaultName} />;
}
