import { Link } from "@/i18n/navigation";
import { getAppCopy } from "@/lib/i18n/app-copy";

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const c = getAppCopy(locale).privacy;
  return <div className="app-page"><section className="page-heading"><span className="eyebrow">{c.heading}</span><h1>{c.title}</h1><p>{c.body}</p></section><div className="privacy-grid"><section className="panel"><h2>{c.store}</h2><ul className="plain-list">{c.stored.map((item) => <li key={item}>{item}</li>)}</ul></section><section className="panel"><h2>{c.public}</h2><ul className="plain-list">{c.publicItems.map((item) => <li key={item}>{item}</li>)}</ul></section></div><section className="panel danger-zone"><div><h2>{c.deleteTitle}</h2><p>{c.deleteBody}</p></div><form action="/api/privacy/delete" method="post"><button className="button danger" type="submit">{c.request}</button></form></section><Link className="text-link" href="/app/today">← {c.back}</Link></div>;
}
