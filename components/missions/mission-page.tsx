import { redirect } from "next/navigation";
import { MissionRunner } from "@/components/missions/mission-runner";
import { requireUser } from "@/lib/auth";
import { getActivePathDashboard, getMissionFeedback, getProfile } from "@/lib/data/app-data";
import { getMissionBrief } from "@/lib/domain/mission-briefs";
import { isSlowCheck } from "@/lib/domain/mission-status";
import { getAppCopy } from "@/lib/i18n/app-copy";

/**
 * The page around one mission's runner. Both mission routes were the same
 * thirty lines apart from two keys; now they share this, and both read the
 * learner's latest submission, link check and review the same way.
 */
export async function MissionPage({ locale, missionKey, pathKey }: { locale: string; missionKey: string; pathKey: string }) {
  const user = await requireUser(locale);
  const c = getAppCopy(locale);
  const dashboard = await getActivePathDashboard();
  if (dashboard.activePath?.key !== pathKey) redirect(`/${locale}/app/paths`);

  const brief = getMissionBrief(missionKey, locale);
  if (!brief) redirect(`/${locale}/app/paths`);

  const [feedback, profile] = await Promise.all([getMissionFeedback(user.id, missionKey), getProfile(user.id)]);

  return (
    <div className="app-page mission-page">
      <section className="page-heading compact-heading">
        <span className="eyebrow">{brief.eyebrow}</span>
        <h1>{brief.title}</h1>
      </section>
      {/* Keyed on the state so a refresh after submitting lands on the step
          the new state owns, rather than keeping the step that was open. */}
      <MissionRunner
        key={feedback?.state ?? "none"}
        locale={locale}
        userId={user.id}
        brief={brief}
        feedback={feedback}
        slowCheck={isSlowCheck(feedback?.state, feedback?.updatedAt)}
        readOnly={profile?.dataOrigin === "seeded_demo"}
        labels={c.runner}
      />
    </div>
  );
}
