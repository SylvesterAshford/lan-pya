import { Link } from "@/i18n/navigation";
import { RoadmapTree } from "@/components/app/roadmap-tree";
import { getRoadmap } from "@/lib/data/app-data";
import { CAREER_TRACKS, getCareerTrack } from "@/lib/domain/career-tracks";
import type { Milestone } from "@/lib/domain/types";

export default async function RoadmapPage({ searchParams }: { searchParams: Promise<{ track?: string }> }) {
  const { track: requestedTrack } = await searchParams;
  const track = getCareerTrack(requestedTrack);
  const milestones = (await getRoadmap(track.key)) as Milestone[];
  return (
    <div className="app-page roadmap-page">
      <section className="page-heading roadmap-page-heading">
        <span className="eyebrow">TECHNICAL ROADMAPS</span>
        <h1>Choose a path. See every skill that matters.</h1>
        <p>Each technical path connects foundations, practical skills, production quality, and proof-producing work. Select any milestone to inspect it.</p>
      </section>
      <nav className="track-switcher" aria-label="Career tracks">
        {CAREER_TRACKS.map((item) => <Link className={item.key === track.key ? "active" : ""} href={`/app/roadmap?track=${item.key}`} aria-current={item.key === track.key ? "page" : undefined} key={item.key}><span>{item.shortTitle}</span><strong>{item.milestones.length} milestones</strong><small>{item.description}</small></Link>)}
      </nav>
      <header className="selected-track-heading"><div><span className="eyebrow">SELECTED PATH</span><h2>{track.title}</h2><p>{track.outcome}</p></div><span>{track.milestones.length} stages · complete curriculum</span></header>
      <RoadmapTree milestones={milestones} />
    </div>
  );
}
