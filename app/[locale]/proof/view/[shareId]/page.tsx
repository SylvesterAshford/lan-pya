import { ShareViewer } from "@/components/proof/share-viewer";

export const dynamic = "force-dynamic";

export default async function SharedProofPage({ params }: { params: Promise<{ locale: string; shareId: string }> }) {
  const { locale, shareId } = await params;
  return <main className="public-proof-page"><header><span className="brand-mark">လ</span><strong>Lan Pya</strong><small>{locale === "my" ? "လမ်းကြောင်းမှ သက်သေဆီသို့" : "From Map to Proof"}</small></header><ShareViewer locale={locale} shareId={shareId} /></main>;
}
