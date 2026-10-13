import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { TutorLauncher } from "@/components/app/tutor-launcher";
import { requireUser } from "@/lib/auth";
import { getActivePathDashboard, getProfile, getReviewQueue, getRoles } from "@/lib/data/app-data";
import { getTutorScript } from "@/lib/domain/tutor-script";
import { getAppCopy, localizeCareerTerm } from "@/lib/i18n/app-copy";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requireUser(locale);
  const [profile, roles, dashboard] = await Promise.all([getProfile(user.id), getRoles(user.id), getActivePathDashboard()]);
  if (!profile?.onboardingComplete) redirect(`/${locale}/onboarding`);
  // Reviewers see how much is waiting without opening the queue.
  const reviewCount = roles.has("reviewer") || roles.has("reviewer_lead") ? (await getReviewQueue()).filter((item) => !item.claimed_by_me).length : 0;
  const c = getAppCopy(locale);
  const path = dashboard.activePath;

  return (
    <AppShell profile={{ ...profile, goal: path?.title ?? profile.goal }} roles={roles} locale={locale} reviewCount={reviewCount}>
      {children}
      {/* Tutor rides the shell so it is reachable from every screen. */}
      {path ? (
        <TutorLauncher
          pathTitle={localizeCareerTerm(locale, path.key, path.title)}
          qa={getTutorScript(path.key, locale)}
          labels={{
            title: c.pathTabs.tutorTitle, preview: c.pathTabs.tutorPreview,
            greeting: c.pathTabs.tutorGreeting, suggestLead: c.pathTabs.tutorSuggestLead,
            placeholder: c.pathTabs.tutorPlaceholder, disclaimer: c.pathTabs.tutorDisclaimer,
            scripted: c.pathTabs.tutorScripted, newChat: c.pathTabs.tutorNewChat,
            send: c.pathTabs.tutorSend, open: c.pathTabs.tutorOpen,
            close: c.pathTabs.tutorClose, nudge: c.pathTabs.tutorNudge,
          }}
        />
      ) : null}
    </AppShell>
  );
}
