import { redirect } from "next/navigation";

/**
 * The old path chooser.
 *
 * Roadmaps now opens on the roadmap itself. Choosing and switching paths is
 * account management, so it lives on the profile with the rest of it; this
 * route stays as a redirect because links to it exist in the wild and in the
 * changelog.
 */
export default async function PathsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/app/roadmap`);
}
