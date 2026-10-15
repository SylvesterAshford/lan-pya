/**
 * What a screen shows between the tap and its data. Next.js prefetches this
 * with every sidebar link, so on a slow connection the page's outline appears
 * at once instead of the old screen sitting still until the server answers.
 * The sidebar stays; only the page area is replaced. No spinner. Community
 * keeps its own, closer to its shape.
 */
export default function AppLoading() {
  return (
    <div className="app-page page-loading" aria-busy="true">
      <section className="page-heading">
        <span className="page-skeleton page-skeleton-eyebrow" />
        <span className="page-skeleton page-skeleton-title" />
        <span className="page-skeleton page-skeleton-line" />
      </section>
      <span className="page-skeleton page-skeleton-panel" />
      <span className="page-skeleton page-skeleton-row" />
      <span className="page-skeleton page-skeleton-row" />
    </div>
  );
}
