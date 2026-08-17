import { BookOpen, Map as MapIcon, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";

export type PathTab = "map" | "missions" | "tutor";

/**
 * Map · Missions · Tutor, matching the split roadmap.sh uses on every path page.
 *
 * Implemented as a query parameter on the existing roadmap route rather than a
 * route move. Mission pages keep their own URLs and the submission flow that
 * creates proof is untouched, which matters more three days from a pitch than
 * a tidier URL does. See DESIGN.md "Path tabs".
 */
export function PathTabs({
  active,
  trackKey,
  stageCount,
  missionCount,
  labels,
}: {
  active: PathTab;
  trackKey: string;
  stageCount: number;
  missionCount: number;
  labels: { map: string; missions: string; tutor: string };
}) {
  const tabs: { key: PathTab; label: string; count?: number; Icon: typeof MapIcon }[] = [
    { key: "map", label: labels.map, count: stageCount, Icon: MapIcon },
    { key: "missions", label: labels.missions, count: missionCount, Icon: Sparkles },
    { key: "tutor", label: labels.tutor, Icon: BookOpen },
  ];

  return (
    <nav className="path-tabs" aria-label={labels.map}>
      {tabs.map(({ key, label, count, Icon }) => (
        <Link
          key={key}
          className={`path-tab${key === active ? " on" : ""}`}
          href={key === "map" ? `/app/roadmap?track=${trackKey}` : `/app/roadmap?track=${trackKey}&tab=${key}`}
          aria-current={key === active ? "page" : undefined}
        >
          <Icon size={16} aria-hidden="true" />
          {label}
          {/* The count is load-bearing honesty: "Missions 1" states the scope of
              a controlled pilot before the learner clicks, not after. */}
          {typeof count === "number" ? <span className="path-tab-count">{count}</span> : null}
        </Link>
      ))}
    </nav>
  );
}
