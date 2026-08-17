import { redirect } from "next/navigation";
import { MissionRunner } from "@/components/missions/mission-runner";
import { requireUser } from "@/lib/auth";
import { getActivePathDashboard } from "@/lib/data/app-data";
import { getMissionBrief } from "@/lib/domain/mission-briefs";
import { getAppCopy } from "@/lib/i18n/app-copy";

export default async function MissionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requireUser(locale);
  const c = getAppCopy(locale);
  const dashboard = await getActivePathDashboard();
  if (dashboard.activePath?.key !== "frontend-developer") redirect(`/${locale}/app/paths`);

  const brief = getMissionBrief("responsive-profile-card", locale);
  if (!brief) redirect(`/${locale}/app/paths`);

  return (
    <div className="app-page mission-page">
      <section className="page-heading compact-heading">
        <span className="eyebrow">{brief.eyebrow}</span>
        <h1>{brief.title}</h1>
      </section>
      <MissionRunner
        locale={locale}
        userId={user.id}
        brief={brief}
        submissionState={dashboard.nextMission?.submissionState ?? null}
        labels={c.runner}
      />
    </div>
  );
}
