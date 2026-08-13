import { Link } from "@/i18n/navigation";
import { RoadmapTree } from "@/components/app/roadmap-tree";
import { getRoadmap } from "@/lib/data/app-data";
import { CAREER_TRACKS, getCareerTrack } from "@/lib/domain/career-tracks";
import type { Milestone } from "@/lib/domain/types";
import { getAppCopy, localizeCareerTerm } from "@/lib/i18n/app-copy";

export default async function RoadmapPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ track?: string }> }) {
  const { locale } = await params;
  const c = getAppCopy(locale).roadmap;
  const { track: requestedTrack } = await searchParams;
  const track = getCareerTrack(requestedTrack);
  const milestones = (await getRoadmap(track.key)) as Milestone[];
  return (
    <div className="app-page roadmap-page">
      <section className="page-heading roadmap-page-heading">
        <span className="eyebrow">{c.heading}</span>
        <h1>{c.title}</h1>
        <p>{c.body}</p>
      </section>
      <nav className="track-switcher" aria-label={c.careerTracks}>
        {CAREER_TRACKS.map((item) => <Link className={item.key === track.key ? "active" : ""} href={`/app/roadmap?track=${item.key}`} aria-current={item.key === track.key ? "page" : undefined} key={item.key}><span>{localizeCareerTerm(locale, item.key, item.shortTitle)}</span><strong>{item.milestones.length} {c.milestones}</strong><small>{item.description}</small></Link>)}
      </nav>
      <header className="selected-track-heading"><div><span className="eyebrow">{c.selected}</span><h2>{localizeCareerTerm(locale, track.key, track.title)}</h2><p>{track.outcome}</p></div><span>{track.milestones.length} {c.stages} · {c.completeCurriculum}</span></header>
      <RoadmapTree locale={locale} milestones={milestones} />
    </div>
  );
}
