/**
 * Placeholders in the page's own shape while get_community runs, including
 * when the path chip changes: the title, the tabs and three rows. No spinner.
 */
export default function CommunityLoading() {
  return (
    <div className="app-page community-page" aria-busy="true">
      <section className="page-heading compact-heading">
        <span className="community-skeleton title" />
        <span className="community-skeleton line" />
      </section>
      <span className="community-skeleton tabs" />
      <ul className="community-list">
        {[0, 1, 2].map((index) => <li key={index}><span className="community-skeleton row" /></li>)}
      </ul>
    </div>
  );
}
