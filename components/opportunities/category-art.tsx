import {
  Braces,
  Briefcase,
  CalendarDays,
  Compass,
  GraduationCap,
  Trophy,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

/**
 * Category mark for opportunity listings.
 *
 * Lucide, the icon set this app already draws every other icon from. It is
 * open source under ISC, so it is free to use here, and it is drawn by people
 * rather than generated — which the bespoke geometry that used to live in this
 * file was not, and looked it.
 *
 * A category mark, deliberately, not a logo. The listing's organisation gets
 * its own mark only when it is a verified partner (see lib/domain/partners.ts);
 * putting any other recognisable logo on a listing would tell the reader an
 * organisation is involved that is not.
 *
 * Design Spec §8 still rules out photography on core screens: stock imagery of
 * students reads generic, risks depicting identifiable people, and costs mobile
 * data this audience pays for. An icon costs nothing and stays sharp at any
 * zoom.
 *
 * Colour stays inside the teal family. Amber means urgency and purple means the
 * global track; neither is available for decoration (DESIGN.md colour rules).
 */

type Category = "challenge" | "internship" | "scholarship" | "fellowship" | "hackathon" | "event" | "webinar" | "job" | "default";

function normalise(type: string): Category {
  const value = type.toLowerCase();
  if (value.includes("challenge")) return "challenge";
  if (value.includes("intern")) return "internship";
  if (value.includes("scholar")) return "scholarship";
  if (value.includes("fellow")) return "fellowship";
  if (value.includes("hack")) return "hackathon";
  if (value.includes("webinar")) return "webinar";
  if (value.includes("event")) return "event";
  if (value.includes("job")) return "job";
  return "default";
}

const MARKS: Record<Category, LucideIcon> = {
  challenge: Trophy,
  internship: Briefcase,
  scholarship: GraduationCap,
  fellowship: Users,
  hackathon: Braces,
  event: CalendarDays,
  webinar: Video,
  job: Briefcase,
  default: Compass,
};

export function CategoryArt({ type, className }: { type: string; className?: string }) {
  const Mark = MARKS[normalise(type)];
  return (
    <span className={`category-art${className ? ` ${className}` : ""}`} aria-hidden="true">
      <Mark strokeWidth={1.75} />
    </span>
  );
}
