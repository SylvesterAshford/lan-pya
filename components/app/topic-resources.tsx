import { BookOpen, ChevronDown, FileText, GraduationCap, PlayCircle, type LucideIcon } from "lucide-react";
import { toMyanmarDigits } from "@/lib/domain/deadlines";
import type { LearningResource, ResourceKind } from "@/lib/domain/learning-resources";
import type { getAppCopy } from "@/lib/i18n/app-copy";

export type ResourceLabels = ReturnType<typeof getAppCopy>["roadmap"]["resources"];

const ICONS: Record<ResourceKind, LucideIcon> = {
  video: PlayCircle,
  course: GraduationCap,
  docs: BookOpen,
  article: FileText,
};

/**
 * One topic on a stage, opening onto the free videos and guides for it.
 *
 * A native <details>, so it opens without JavaScript, is announced as
 * expandable, and works the same in the roadmap brief (a client dialog) and on
 * Home (a server component). Topics stay closed: a stage has up to six, each
 * with two to four links, and all of them open at once would bury the proof
 * target under a reading list. A topic with no resources is a plain row.
 */
export function TopicItem({
  topic,
  resources,
  locale,
  labels,
}: {
  topic: string;
  resources: LearningResource[];
  locale: string;
  labels: ResourceLabels;
}) {
  if (!resources.length) return <li className="topic-item">{topic}</li>;

  const my = locale === "my";
  const num = (value: number) => (my ? toMyanmarDigits(value) : String(value));
  const duration = (minutes: number) =>
    minutes < 60
      ? labels.minutes.replace("{n}", num(minutes))
      : labels.hours.replace("{h}", num(Math.floor(minutes / 60))).replace("{m}", num(minutes % 60));
  // A Burmese reader sees the Burmese-language lessons first.
  const ordered = my ? [...resources].sort((a, b) => Number(b.lang === "my") - Number(a.lang === "my")) : resources;

  return (
    <li className="topic-item">
      <details className="topic-details">
        <summary>
          <span className="topic-name">{topic}</span>
          <span className="topic-count">{labels.count.replace("{n}", num(resources.length))}</span>
          <ChevronDown className="topic-chevron" size={16} aria-hidden="true" />
        </summary>
        <ul className="topic-resources">
          {ordered.map((resource) => {
            const Icon = ICONS[resource.kind];
            return (
              <li key={resource.url}>
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                  <Icon size={18} aria-hidden="true" />
                  <span className="topic-resource-copy">
                    <span className="topic-resource-title">{resource.title}</span>
                    <span className="topic-resource-meta">
                      {resource.source} · {labels.kinds[resource.kind]}
                      {resource.minutes ? ` · ${duration(resource.minutes)}` : ""}
                    </span>
                  </span>
                  {resource.lang === "my" ? <span className="topic-resource-lang">{labels.burmese}</span> : null}
                  <span className="sr-only"> ({labels.newTab})</span>
                </a>
              </li>
            );
          })}
        </ul>
      </details>
    </li>
  );
}
