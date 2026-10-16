// Public styles first, so component stylesheets (the climb) still follow them
// as they did when these rules lived in globals.css.
import "./public.css";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { RotatingWord } from "@/components/marketing/rotating-word";
import { TheClimb, type ClimbBlock } from "@/components/marketing/the-climb";
import { SiteFooter } from "@/components/marketing/site-footer";

/**
 * The landing page.
 *
 * One argument, told as one climb: you are collecting advice, you should be
 * building proof, and here is what proof turns into. Scrolling walks two
 * students up the trail past three stops (choose, build, prove) and the sun
 * comes up when they reach the summit, which is where the call to action
 * lives. See components/marketing/the-climb.tsx for how, and
 * scrollcraft/builds/lan-pya-climb/BRIEF.md for why.
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

  const actions = (
    <div className="hero-actions">
      <Link className="button gold" href="/login">{t("primary")} <span aria-hidden="true">→</span></Link>
      <Link className="button quiet-light" href="/login?demo=1">{t("secondary")}</Link>
    </div>
  );

  // No eyebrow on the stops: the flag on the trail already names each one.
  const stop = (title: string, body: string) => (
    <>
      <h2>{title}</h2>
      <p>{body}</p>
    </>
  );

  const blocks: ClimbBlock[] = [
    {
      key: "hero",
      content: (
        <div className="hero-copy">
          <span className="hero-kicker">{t("kicker")}</span>
          <h1>
            {t("titleStart")}
            <br />
            <span className="hero-build">{t("titleBuild")} </span>
            <RotatingWord words={becomes} />
          </h1>
          <p>{t("body")}</p>
          {actions}
          <div className="hero-trust"><span>{t("free")}</span><span>{t("transparent")}</span><span>{t("privacy")}</span></div>
        </div>
      ),
    },
    { key: "choose", content: stop(t("chooseTitle"), t("chooseBody")) },
    { key: "build", content: stop(t("buildTitle"), t("buildBody")) },
    { key: "prove", content: stop(t("proveTitle"), t("proveBody")) },
    {
      key: "summit",
      content: (
        <>
          {stop(t("summitTitle"), t("summitBody"))}
          {actions}
        </>
      ),
    },
  ];

  return (
    <main className="welcome-shell">
      <header className="welcome-nav">
        <Link href="/" className="brand-lockup static light" aria-label="Lan Pya home">
          <span className="brand-mark">လ</span>
          <span><strong>Lan Pya</strong><small>လမ်းပြ</small></span>
        </Link>
        <nav className="welcome-nav-links" aria-label={my ? "စာမျက်နှာများ" : "Pages"}>
          <Link href="/pricing" className="welcome-nav-link">{my ? "စျေးနှုန်း" : "Pricing"}</Link>
          <Link href="/login" className="prototype-pill"><i /> {my ? "အကောင့်ဝင်ရန်" : "Sign in"}</Link>
        </nav>
      </header>

      <TheClimb
        blocks={blocks}
        stopLabels={{ choose: t("stopChoose"), build: t("stopBuild"), prove: t("stopProve"), summit: t("stopSummit") }}
        navLabel={t("climbLabel")}
        navStops={{ start: t("navStart"), choose: t("stopChoose"), build: t("stopBuild"), prove: t("stopProve"), summit: t("stopSummit") }}
        travellerAlt={t("climbAlt")}
      />

      <SiteFooter locale={locale} />
    </main>
  );
}
