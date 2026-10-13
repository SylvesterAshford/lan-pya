import { MissionPage } from "@/components/missions/mission-page";

export default async function ContentCreatorMissionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <MissionPage locale={locale} missionKey="content-creator-awareness" pathKey="content-creator" />;
}
