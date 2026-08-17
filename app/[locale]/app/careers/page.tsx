import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { MeNav } from "@/components/app/me-nav";
import { PreviewPathsDisclosure } from "@/components/paths/preview-paths-disclosure";
import { requireUser } from "@/lib/auth";
import { getActivePathDashboard } from "@/lib/data/app-data";
import { CAREER_PATH_CATALOG, getAvailabilityLabel, type CareerPathCatalogItem } from "@/lib/domain/career-recommendations";
import { toMyanmarDigits } from "@/lib/domain/deadlines";
import { getAppCopy, localizeArena, localizeCareerTerm, localizePathDescription } from "@/lib/i18n/app-copy";

/**
 * The full career catalog.
 *
 * It used to sit under Roadmaps, below the learner's own path and their
 * recommendations. Three sections of browsing on the screen a learner opens to
 * find their next step is noise: Roadmaps answers "where am I", this answers
 * "what else is there". Different questions, different places.
 */
export default async function CareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  await requireUser(locale);
  const c = getAppCopy(locale);
  const dashboard = await getActivePathDashboard();
  const activeKey = dashboard.activePath?.key;
  const num = (value: number) => (locale === "my" ? toMyanmarDigits(value) : String(value));

  const startable = CAREER_PATH_CATALOG.filter((path) => getAvailabilityLabel(path) !== "preview");
  const previews = CAREER_PATH_CATALOG.filter((path) => getAvailabilityLabel(path) === "preview");

  const groupByArena = (items: CareerPathCatalogItem[]) =>
    Object.entries(
      items.reduce<Record<string, CareerPathCatalogItem[]>>((groups, path) => {
        (groups[path.arena] ??= []).push(path);
        return groups;
      }, {}),
    );

  const label = (path: CareerPathCatalogItem) => {
    switch (getAvailabilityLabel(path)) {
      case "operational": return { text: c.paths.available, tone: "op" };
      case "controlled_pilot": return { text: c.paths.pilot, tone: "pilot" };
      case "no_missions_yet": return { text: c.paths.noMissionsYet, tone: "prev" };
      default: return { text: c.paths.preview, tone: "prev" };
    }
  };

  const substance = (path: CareerPathCatalogItem) => {
    const state = getAvailabilityLabel(path);
    if (state === "operational" || state === "controlled_pilot") {
      return [`${path.stageCount} ${c.careers.stages}`, `${c.paths.firstMission}: ${path.firstMission}`].filter(Boolean).join(" · ");
    }
    if (state === "no_missions_yet") return `${path.stageCount} ${c.careers.stages}`;
    return localizePathDescription(locale, path.key, path.description);
  };

  const renderArenas = (items: CareerPathCatalogItem[]) => groupByArena(items).map(([arena, paths]) => (
    <section className="arena-group" key={arena}>
      <header className="arena-head">
        <h3>{localizeArena(locale, arena)}</h3>
        <span className="arena-count">· {num(paths.length)}</span>
      </header>
      {paths.map((path) => {
        const state = label(path);
        const isActive = path.key === activeKey;
        return (
          <Link className={`path-row${isActive ? " is-active" : ""}`} href={`/app/roadmap?track=${path.key}`} key={path.key}>
            <span className="path-row-copy">
              <strong>{localizeCareerTerm(locale, path.key, path.title)}</strong>
              <small>{substance(path)}</small>
            </span>
            {isActive ? <span className="avail here">{c.careers.yourPathHere}</span> : <span className={`avail ${state.tone}`}>{state.text}</span>}
            <ChevronRight className="path-row-chevron" size={16} aria-hidden="true" />
          </Link>
        );
      })}
    </section>
  ));

  return (
    <div className="app-page me-page">
      <MeNav locale={locale} active="careers" />
      <section className="page-heading compact-heading">
        <span className="eyebrow">{c.careers.heading}</span>
        <h1>{c.careers.title}</h1>
        <p>{c.careers.body}</p>
      </section>

      {renderArenas(startable)}

      {previews.length ? (
        <PreviewPathsDisclosure
          showLabel={c.paths.showPreviews.replace("{n}", num(previews.length))}
          hideLabel={c.paths.hidePreviews}
        >
          {renderArenas(previews)}
        </PreviewPathsDisclosure>
      ) : null}
    </div>
  );
}
