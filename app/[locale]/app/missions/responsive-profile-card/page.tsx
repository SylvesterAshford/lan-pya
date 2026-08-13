import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { SubmissionForm } from "@/components/missions/submission-form";
import { getActivePathDashboard } from "@/lib/data/app-data";

export default async function MissionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requireUser(locale);
  const dashboard = await getActivePathDashboard();
  if (dashboard.activePath?.key !== "frontend-developer") redirect(`/${locale}/app/build`);
  return <div className="app-page"><section className="page-heading"><span className="eyebrow">MILESTONE 3 · REQUIRED PROOF</span><h1>Responsive Profile Card</h1><p>Make a small interface withstand real constraints: content, keyboard navigation, and screens from 320px upward.</p></section><div className="mission-layout"><section className="panel mission-brief"><div className="brief-tag">MISSION BRIEF · v1</div><h2>Build for a real learner.</h2><p>Create a profile card with a name, learning goal, current skills, and one clear action. Use only HTML and CSS for the core experience.</p><h3>Acceptance criteria</h3><ul className="rubric-list"><li><b>30%</b><span><strong>Semantic structure</strong><small>Headings, lists, and controls convey meaning.</small></span></li><li><b>30%</b><span><strong>Responsive behavior</strong><small>No clipping or horizontal scroll at 320px.</small></span></li><li><b>25%</b><span><strong>Accessible interaction</strong><small>Keyboard focus, contrast, and readable labels.</small></span></li><li><b>15%</b><span><strong>Explanation</strong><small>Reflection connects choices to outcomes.</small></span></li></ul><div className="mission-guardrail"><strong>Ground-truth rule</strong><p>A passing automated scan is never enough. A reviewer checks the rendered result and your explanation.</p></div></section><SubmissionForm userId={user.id} /></div></div>;
}
