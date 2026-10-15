import { BookOpen, ChevronDown, FileText, GraduationCap, PlayCircle, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
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
 * The free lessons for a stage, set apart from the rest of the brief: a navy
 * header that names them and counts the links, over the topic rows. Without
 * it the resources read as a plain topic list and were easy to miss.
 */
export function TopicLessons({
  total,
  locale,
  labels,
  children,
}: {
  total: number;
  locale: string;
  labels: ResourceLabels;
  children: ReactNode;
}) {
  const count = locale === "my" ? toMyanmarDigits(total) : String(total);
  return (
    <section className="topic-lessons" aria-label={labels.title}>
      <header className="topic-lessons-head">
        <span className="topic-lessons-icon" aria-hidden="true"><GraduationCap size={20} /></span>
        <span className="topic-lessons-copy">
          <strong>{labels.title}</strong>
          <small>{labels.intro}</small>
        </span>
        <span className="topic-lessons-total">{labels.total.replace("{n}", count)}</span>
      </header>
      {children}
    </section>
  );
}

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
  number,
  resources,
  locale,
  labels,
}: {
  topic: string;
  /** Position in the stage, from 1; drawn as the row's index. */
  number: number;
  resources: LearningResource[];
  locale: string;
  labels: ResourceLabels;
}) {
  if (!resources.length) return <li className="topic-item">{topic}</li>;

  const my = locale === "my";
  const num = (value: number) => (my ? toMyanmarDigits(value) : String(value));
  const index = my ? toMyanmarDigits(number).padStart(2, "၀") : String(number).padStart(2, "0");
  // The closed row says what is inside without opening it: how many things to
  // watch, how many to read, and whether one is taught in Burmese.
  const watch = resources.filter((item) => item.kind === "video" || item.kind === "course").length;
  const read = resources.length - watch;
  const hasBurmese = resources.some((item) => item.lang === "my");
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
          <span className="topic-num" aria-hidden="true">{index}</span>
          <span className="topic-name">{topic}</span>
          <span className="topic-meta">
            {hasBurmese ? <span className="topic-resource-lang">{labels.burmese}</span> : null}
            <span className="topic-kinds" aria-hidden="true">
              {watch ? <span><PlayCircle size={14} />{num(watch)}</span> : null}
              {read ? <span><BookOpen size={14} />{num(read)}</span> : null}
            </span>
          </span>
          <span className="sr-only">{labels.count.replace("{n}", num(resources.length))}</span>
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
