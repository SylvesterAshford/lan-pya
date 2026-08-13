import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { requireUser } from "@/lib/auth";
import { getActivePathDashboard, getProfile, getRoles } from "@/lib/data/app-data";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requireUser(locale);
  const [profile, roles, dashboard] = await Promise.all([getProfile(user.id), getRoles(user.id), getActivePathDashboard()]);
  if (!profile?.onboardingComplete) redirect(`/${locale}/onboarding`);
  return <AppShell profile={{ ...profile, goal: dashboard.activePath?.title ?? profile.goal }} roles={roles} locale={locale}>{children}</AppShell>;
}
