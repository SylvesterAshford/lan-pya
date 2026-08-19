import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { RotatingWord } from "@/components/marketing/rotating-word";
import { SummitTrail } from "@/components/marketing/summit-trail";

/**
 * The landing page.
 *
 * One argument, told once: you are collecting advice, you should be building
 * proof, and here is what proof turns into. Everything on the page serves that
 * sentence or gets cut — which is what happened to the browser-chrome mission
 * mockup and the roadmap node graph that used to sit here. Both were showing
 * the product's furniture to somebody who had not yet been given a reason to
 * care about it.
 *
 * Governed by DESIGN.md "Marketing surfaces", not by the app's type scale.
 */
export default async function MarketingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Marketing");
  const my = locale === "my";

  // What the headline's last word becomes. The first entry is what a reduced
  // motion reader and every screen reader gets, so it has to stand alone.
  const becomes = my
    ? ["သက်သေ", "လက်ရာမှတ်တမ်း", "အင်တာဗျူး", "အလုပ်"]
    : ["proof", "a portfolio", "an interview", "a job"];

  // The three cards pinned to the trail. Bottom to top, they are the product's
  // whole promise: do the work, have it checked, get somewhere with it.
  const pins = [
    { key: "mission", state: "done", label: t("pinMissionLabel"), title: t("pinMissionTitle"), meta: t("pinMissionMeta") },
    { key: "proof", state: "done", label: t("pinProofLabel"), title: t("pinProofTitle"), meta: t("pinProofMeta") },
    { key: "door", state: "ahead", label: t("pinDoorLabel"), title: t("pinDoorTitle"), meta: t("pinDoorMeta") },
  ];

  const journey = my
    ? [["ရွေးချယ်", "သင့်အတွက် မှန်ကန်သောအစ"], ["တည်ဆောက်", "တကယ့်လုပ်ငန်းတစ်ခု"], ["သက်သေပြ", "လူတစ်ဦးက စစ်ဆေးသည်"], ["ချိတ်ဆက်", "အခွင့်အလမ်းသို့"]]
    : [["Choose", "An honest starting point"], ["Build", "One real mission"], ["Prove", "A person reviews it"], ["Connect", "Into an opportunity"]];

  return (
    <main className="welcome-shell">
      <header className="welcome-nav">
        <Link href="/" className="brand-lockup static light" aria-label="Lan Pya home">
          <span className="brand-mark">လ</span>
          <span><strong>Lan Pya</strong><small>လမ်းပြ</small></span>
        </Link>
        <Link href="/login" className="prototype-pill"><i /> {my ? "အကောင့်ဝင်ရန်" : "Sign in"}</Link>
      </header>

      <section className="welcome-hero">
        {/* Atmosphere, drawn in CSS rather than shipped as an image: a dawn
            bleeding in from the top right and two long arcs suggesting the
            curve of something much bigger than the viewport. */}
        <div className="hero-sky" aria-hidden="true">
          <span className="hero-glow" />
          <svg className="hero-arcs" viewBox="0 0 1440 900" preserveAspectRatio="none">
            <path d="M-200 880 C 240 560, 700 420, 1640 300" />
            <path d="M-200 980 C 300 700, 820 560, 1640 460" />
          </svg>
        </div>

        <div className="hero-copy">
          <span className="hero-kicker">{t("kicker")}</span>
          <h1>
            {t("titleStart")}
            <br />
            <span className="hero-build">{t("titleBuild")} </span>
            <RotatingWord words={becomes} />
          </h1>
          <p>{t("body")}</p>
          <div className="hero-actions">
            <Link className="button gold" href="/login">{t("primary")} <span aria-hidden="true">→</span></Link>
            <Link className="button quiet-light" href="/login?demo=1">{t("secondary")}</Link>
          </div>
          <div className="hero-trust"><span>{t("free")}</span><span>{t("transparent")}</span><span>{t("privacy")}</span></div>
        </div>

        <div className="hero-scene">
          <SummitTrail />
          <ul className="hero-pins">
            {pins.map((pin) => (
              <li key={pin.key} className={`hero-pin ${pin.key} ${pin.state}`}>
                <span className="hero-pin-label">{pin.label}</span>
                <strong>{pin.title}</strong>
                <small>{pin.meta}</small>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The climb, said plainly, on light ground. The curve is the same ridge
          the hero ends on, so the page reads as one landscape rather than two
          stacked sections. */}
      <section className="journey">
        <svg className="journey-crest" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 90 C 380 0, 1060 0, 1440 90 Z" />
        </svg>
        <h2>{t("journeyTitle")}</h2>
        <ol className="journey-steps">
          {journey.map(([label, detail], index) => (
            <li key={label}>
              <span className="journey-num">{String(index + 1).padStart(2, "0")}</span>
              <strong>{label}</strong>
              <small>{detail}</small>
            </li>
          ))}
        </ol>
        <p className="journey-foot">{t("journeyFoot")}</p>
        <Link className="button gold" href="/login">{t("primary")} <span aria-hidden="true">→</span></Link>
      </section>
    </main>
  );
}
