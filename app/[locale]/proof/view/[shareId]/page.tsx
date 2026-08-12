import { ShareViewer } from "@/components/proof/share-viewer";

export const dynamic = "force-dynamic";

export default async function SharedProofPage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  return <main className="public-proof-page"><header><span className="brand-mark">လ</span><strong>Lan Pya</strong><small>From Map to Proof</small></header><ShareViewer shareId={shareId} /></main>;
}
