import { MissionPage } from "@/components/missions/mission-page";

export default async function OpportunityTrackerMissionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <MissionPage locale={locale} missionKey="interactive-opportunity-tracker" pathKey="frontend-developer" />;
}
