import { MissionPage } from "@/components/missions/mission-page";

export default async function VideoEditorMissionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <MissionPage locale={locale} missionKey="video-editor-vertical-story" pathKey="video-editor" />;
}
