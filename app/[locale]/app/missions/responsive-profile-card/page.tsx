import { MissionPage } from "@/components/missions/mission-page";

export default async function ResponsiveProfileCardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <MissionPage locale={locale} missionKey="responsive-profile-card" pathKey="frontend-developer" />;
}
