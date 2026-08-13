import { Link } from "@/i18n/navigation";
import { getRoadmap, getTodayDashboard } from "@/lib/data/app-data";

export default async function TodayPage() {
  const [dashboard, roadmap] = await Promise.all([getTodayDashboard(), getRoadmap()]);
  const completed = roadmap.filter((item) => item.status === "complete").length;
  const progress = roadmap.length ? Math.round((completed / roadmap.length) * 100) : 0;
  const streak = Number(dashboard?.streak_days ?? 0);
  const verified = Number(dashboard?.verified_count ?? 0);
  const xp = Number(dashboard?.xp ?? 0);
  const level = Number(dashboard?.level ?? 1);
  return (
    <div className="app-page">
      <section className="page-heading"><h1>What will you build today?</h1><p>Lan Pya keeps the path practical: choose a mission, make something real, and turn it into evidence you can carry forward.</p></section>
      <section className="metric-grid" aria-label="Journey summary">
        <article><span>Roadmap</span><strong>{progress}%</strong><small>{completed} of {roadmap.length} milestones grounded</small></article>
        <article><span>Practice rhythm</span><strong>{streak} days</strong><small>Consistency without pressure</small></article>
        <article><span>Trusted proof</span><strong>{verified}</strong><small>Human-verified submissions</small></article>
        {xp > 0 ? <article><span>Quest level</span><strong>{level}</strong><small>{xp} XP from verified missions</small></article> : null}
      </section>
      <div className="dashboard-grid">
        <section className="panel next-mission"><span className="eyebrow">NEXT QUEST · +100 XP</span><h2>Responsive Profile Card</h2><p>Build a personal card that remains readable from a small phone to a desktop and uses meaningful HTML.</p><ul className="check-list"><li>Semantic structure</li><li>Responsive layout</li><li>Visible focus styles</li><li>Public repository and deployment</li></ul><div className="quest-footer"><span>Mission 3 of {roadmap.length}</span><Link className="button primary" href="/app/build">Open Build →</Link></div></section>
        <section className="panel"><div className="panel-heading"><h2>Your evidence loop</h2><span>Transparent by design</span></div><ol className="evidence-loop"><li className="done"><b>1</b><span><strong>Place</strong><small>Start from a short check</small></span></li><li className="active"><b>2</b><span><strong>Build</strong><small>Complete the mission</small></span></li><li><b>3</b><span><strong>Review</strong><small>Automated checks + a person</small></span></li><li><b>4</b><span><strong>Prove</strong><small>Publish only what you choose</small></span></li></ol></section>
      </div>
      <section className="panel trust-panel"><div><span className="eyebrow">WHAT COUNTS</span><h2>Evidence outranks confidence.</h2></div><p>Self-reported skills help us choose a starting point. Only completed work tied to a versioned rubric becomes trusted proof.</p></section>
    </div>
  );
}
