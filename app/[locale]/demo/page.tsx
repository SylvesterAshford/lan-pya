import { redirect } from "next/navigation";

export default async function DemoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(`/${locale}/login?demo=1`);
}
