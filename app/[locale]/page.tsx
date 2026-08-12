import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function MarketingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Marketing");

  return (
    <main className="welcome-shell">
      <header className="welcome-nav">
        <Link href="/" className="brand-lockup static light" aria-label="Lan Pya home">
          <span className="brand-mark">လ</span>
          <span><strong>Lan Pya</strong><small>လမ်းပြ</small></span>
        </Link>
        <Link href="/login" className="prototype-pill"><i /> {locale === "my" ? "အကောင့်ဝင်ရန်" : "Sign in"}</Link>
      </header>

      <section className="welcome-hero">
        <div className="hero-copy">
          <span className="hero-kicker">{t("kicker")}</span>
          <h1>{t("titleStart")}<br /><em>{t("titleEnd")}</em></h1>
          <p>{t("body")}</p>
          <div className="hero-actions">
            <Link className="button gold" href="/login">{t("primary")} <span>→</span></Link>
            <Link className="button quiet-light" href="/login?demo=1">{t("secondary")}</Link>
          </div>
          <div className="hero-trust"><span>{t("free")}</span><span>{t("transparent")}</span><span>{t("privacy")}</span></div>
        </div>
        <div className="proof-window" aria-label="Example Lan Pya proof journey">
          <div className="window-bar"><span /><span /><span /><small>{t("thisWeek")}</small></div>
          <div className="window-body">
            <span className="mini-label">{t("thisWeek")}</span><h2>{t("mission")}</h2><p>{t("missionBody")}</p>
            <div className="window-progress"><span /></div>
            <div className="proof-stages">
              <div className="done"><b>01</b><span>Choose<small>Starting point</small></span></div>
              <div className="active"><b>02</b><span>Build<small>Real mission</small></span></div>
              <div><b>03</b><span>Prove<small>Evidence + rubric</small></span></div>
              <div><b>04</b><span>Connect<small>Ready opportunity</small></span></div>
            </div>
            <div className="window-evidence"><span className="evidence-mark">✓</span><div><strong>{t("evidence")}</strong><small>{t("evidenceBody")}</small></div></div>
          </div>
        </div>
      </section>

      <section className="journey-strip" aria-label="Lan Pya product loop">
        {[["01", "Choose", "Find your honest starting point"], ["02", "Build", "Complete one real-world mission"], ["03", "Prove", "Get evidence-linked feedback"], ["04", "Connect", "See opportunity readiness gaps"]].map(([number, label, detail]) => (
          <article key={number}><span>{number}</span><div><strong>{label}</strong><p>{detail}</p></div></article>
        ))}
      </section>

      <section className="screen-board">
        <div className="screen-board-copy"><span className="hero-kicker">{t("connected")}</span><h2>{t("screensTitle")}</h2><p>{t("screensBody")}</p><Link className="button gold" href="/demo">{t("secondary")} <span>→</span></Link></div>
        <figure><Image src="/lan-pya-screen-board.png" width={1536} height={1024} sizes="(max-width: 800px) 100vw, 56vw" loading="lazy" alt="Lan Pya learner, roadmap, review, opportunity and proof screens" /><figcaption>Original Lan Pya concept board</figcaption></figure>
      </section>
    </main>
  );
}
