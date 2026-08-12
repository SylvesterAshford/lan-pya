import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { requireUser } from "@/lib/auth";
import { getProfile, getRoles } from "@/lib/data/app-data";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requireUser(locale);
  const [profile, roles] = await Promise.all([getProfile(user.id), getRoles(user.id)]);
  if (!profile?.onboardingComplete) redirect(`/${locale}/onboarding`);
  return <AppShell profile={profile} roles={roles} locale={locale}>{children}</AppShell>;
}
