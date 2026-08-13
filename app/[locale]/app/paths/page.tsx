import { Link } from "@/i18n/navigation";
import { CAREER_TRACKS, DIGITAL_PATH_PREVIEWS } from "@/lib/domain/career-tracks";

const ARENAS = [
  ["all", "All paths", "See every digital career"],
  ["Technology & Data", "Technology & Data", "Code, systems, and analysis"],
  ["Stories & Community", "Stories & Community", "Teach, publish, and grow an audience"],
  ["Visual Craft", "Visual Craft", "Design, edit, and communicate visually"],
  ["Business & Growth", "Business & Growth", "Reach people and measure what works"],
] as const;

function statusLabel(status: "operational" | "controlled_pilot" | "preview") {
  if (status === "operational") return "Ready to start";
  if (status === "controlled_pilot") return "Controlled pilot";
  return "Coming next";
}

export default async function PathsPage({ searchParams }: { searchParams: Promise<{ interest?: string }> }) {
  const { interest = "all" } = await searchParams;
  const previews = interest === "all" ? DIGITAL_PATH_PREVIEWS : DIGITAL_PATH_PREVIEWS.filter((path) => path.arena === interest);
  return (
    <div className="app-page paths-page">
      <section className="page-heading">
        <h1>Find a path that fits the work you want to do.</h1>
        <p>Lan Pya turns broad digital careers into small, phone-friendly steps and honest proof. Start with one arena; you can change direction later.</p>
      </section>
      <nav className="arena-switcher" aria-label="Career arenas">
        {ARENAS.map(([key, label, description]) => <Link key={key} className={interest === key ? "active" : ""} href={key === "all" ? "/app/paths" : `/app/paths?interest=${encodeURIComponent(key)}`}><strong>{label}</strong><small>{description}</small></Link>)}
      </nav>
      <section className="path-section">
        <div className="section-heading"><div><span className="eyebrow">OPERATIONAL NOW</span><h2>Technical paths</h2></div><Link className="text-link" href="/app/roadmap">View full roadmaps →</Link></div>
        <div className="path-preview-grid">
          {CAREER_TRACKS.map((track) => <article className="panel path-preview operational" key={track.key}><div className="path-card-top"><span className="path-icon">↗</span><span className="status-tag success">Ready to start</span></div><h3>{track.title}</h3><p>{track.description}</p><div className="path-meta"><span>{track.milestones.length} stages</span><span>Portfolio outcome</span></div><Link className="button primary" href={`/app/roadmap?track=${track.key}`}>Explore roadmap</Link></article>)}
        </div>
      </section>
      <section className="path-section">
        <div className="section-heading"><div><span className="eyebrow">DIGITAL CAREER PREVIEWS</span><h2>More ways to make a living online</h2></div><span className="section-note">Built in small slices, reviewed as they mature.</span></div>
        <div className="path-preview-grid">
          {previews.map((path) => <article className={`panel path-preview ${path.status}`} key={path.key}><div className="path-card-top"><span className="path-icon">{path.status === "controlled_pilot" ? "↗" : "+"}</span><span className={`status-tag ${path.status === "controlled_pilot" ? "pilot" : "preview"}`}>{statusLabel(path.status)}</span></div><h3>{path.title}</h3><p>{path.description}</p><div className="path-meta"><span>{path.device}</span><span>First proof: {path.timeToFirstProof}</span></div>{path.status === "controlled_pilot" ? <Link className="button gold" href={`/app/build?path=${path.key}`}>Start pilot mission</Link> : <div className="path-disabled">Preview the shape · {path.stages.length} stages planned</div>}</article>)}
        </div>
      </section>
    </div>
  );
}
