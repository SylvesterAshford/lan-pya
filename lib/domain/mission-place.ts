import { getCareerTrack } from "@/lib/domain/career-tracks";
import { getMissionStage } from "@/lib/domain/mission-briefs";
import type { Milestone } from "@/lib/domain/types";
import { localizeCareerTerm, localizeRoadmapMilestone } from "@/lib/i18n/app-copy";

/**
 * Where a mission sits: its path and the stage it proves, in the reader's
 * language. Missions, Portfolio and the résumé all name a piece of work by
 * this place ("Stage 3 · CSS and responsive layout") so the same work reads
 * the same everywhere and can be matched to its stop on the map.
 */
export type MissionPlace = { pathKey: string; pathTitle: string; stage: Milestone };

export function missionPlace(missionKey: string | null | undefined, locale: string): MissionPlace | null {
  const place = getMissionStage(missionKey);
  if (!place) return null;
  const track = getCareerTrack(place.pathKey);
  if (track.key !== place.pathKey) return null;
  const stage = track.milestones.find((item) => item.key === place.stageKey);
  if (!stage) return null;
  return {
    pathKey: place.pathKey,
    pathTitle: localizeCareerTerm(locale, place.pathKey, track.title),
    stage: localizeRoadmapMilestone(locale, stage),
  };
}
