import { redirect } from "next/navigation";

/**
 * The old "One mission at a time" page.
 *
 * Missions now open on the trail map (/app/missions), which shows the same
 * next mission, the stage it belongs to and the climb around it. Two pages
 * describing one mission drifted apart, and choosing a path landed learners on
 * the stale one. This route stays as a redirect because links to it exist in
 * the wild and in the changelog.
 */
export default async function BuildPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/app/missions`);
}
