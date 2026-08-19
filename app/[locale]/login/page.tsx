import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { ArrowLeft, Eye, Lock, ShieldCheck } from "lucide-react";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { EmailAuthForm } from "@/components/auth/email-auth-form";
import { SummitTrail } from "@/components/marketing/summit-trail";
import { getUser } from "@/lib/auth";
import { Link } from "@/i18n/navigation";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * Sign in.
 *
 * The left panel is the promise, the right panel is the door. The panel used
 * to carry a diagram of the roadmap's node graph, which asked somebody at the
 * sign-in screen to read a chart; it carries the same summit the landing page
 * does now, so the two screens are recognisably one product.
 *
 * The climb on the left reads upward, bottom to top, the same direction as the
 * mission map and the roadmap: where you start is at the bottom, and the
 * destination is above it.
 *
 * Google sits above the email form because it is one tap against seven fields.
 * Both are real: the button checks the provider is actually enabled before it
 * offers itself, and the form is the same one that has always been here.
 */
export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ demo?: string }>;
}) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const isSupabaseConfigured = hasSupabaseEnv();
  if (isSupabaseConfigured && (await getUser())) redirect(`/${locale}/app/today`);
  const t = await getTranslations("Auth");
  const my = locale === "my";

  // The four stops, drawn the way the mission map draws them: the destination
  // at the top, the starting point at the bottom. Deliberately no ticks and no
  // "you are here" — nobody is signed in on this screen, so any claim about
  // how far this reader has come would be decoration pretending to be data.
  const climb = my
    ? ["ချိတ်ဆက်", "သက်သေပြ", "တည်ဆောက်", "ရွေးချယ်"]
    : ["Connect", "Prove", "Build", "Choose"];

  const promises = my
    ? [[Lock, "မူလအတိုင်း ကိုယ်ရေးကိုယ်တာလုံခြုံ"], [ShieldCheck, "Supabase ဖြင့် လုံခြုံသော ဝင်ရောက်မှု"], [Eye, "ခွင့်ပြုချက်မပါဘဲ အများမြင် ပရိုဖိုင် မရှိ"]] as const
    : [[Lock, "Private by default"], [ShieldCheck, "Supabase-secured access"], [Eye, "No public profile without consent"]] as const;

  return (
    <main className="auth-shell">
      <section className="auth-brand-panel">
        {/* Elevation contours. The product is a map, so the ground behind the
            promise is drawn the way ground is drawn on one: lines of equal
            height sweeping across a slope, tightening where it steepens, with
            a few closed rings where a peak sits under the light. Cheaper than
            an image, themed by the same tokens, and it fills the panel without
            competing with anything on top of it. */}
        <div className="auth-terrain" aria-hidden="true">
          <span className="auth-glow" />
          <svg className="auth-contours" viewBox="0 0 720 900" preserveAspectRatio="none">
            <g className="auth-contour-lines">
              <path d="M-60 92 C 140 34, 330 118, 500 66 C 620 30, 700 58, 780 44" />
              <path d="M-60 178 C 150 116, 340 204, 508 152 C 626 116, 704 146, 780 130" />
              <path d="M-60 268 C 160 202, 352 294, 516 242 C 632 206, 708 238, 780 220" />
              <path d="M-60 362 C 170 292, 364 388, 524 336 C 638 300, 712 334, 780 314" />
              <path d="M-60 462 C 180 388, 376 486, 532 434 C 644 398, 716 434, 780 412" />
              <path d="M-60 568 C 190 490, 388 588, 540 536 C 650 500, 720 538, 780 514" />
              <path d="M-60 680 C 200 598, 400 696, 548 644 C 656 608, 724 648, 780 622" />
              <path d="M-60 798 C 210 712, 412 810, 556 758 C 662 722, 728 764, 780 736" />
            </g>
            {/* A peak, where the light is. Closed rings are how a map says one. */}
            <g className="auth-contour-peak">
              {[1, 0.72, 0.48, 0.28].map((k) => (
                <ellipse key={k} cx="566" cy="196" rx={124 * k} ry={70 * k} />
              ))}
            </g>
          </svg>
        </div>

        <div className="auth-scene" aria-hidden="true"><SummitTrail /></div>

        <Link href="/" className="brand-lockup static light">
          <span className="brand-mark">လ</span>
          <span><strong>Lan Pya</strong><small>လမ်းပြ</small></span>
        </Link>

        <div className="auth-brand-copy">
          <span className="hero-kicker">{my ? "သင့်လမ်းကြောင်းသည် သင့်ဟာသာ" : "YOUR PATH STAYS YOURS"}</span>
          <h1>
            {my
              ? <>သင့်အနာဂတ်နောက်ကွယ်မှ<br />လက်ရာဆီ <em>ပြန်လာပါ။</em></>
              : <>Welcome back to the<br />work behind <em>your future.</em></>}
          </h1>
          <p>
            {my
              ? "သင့်လမ်းကြောင်း၊ လက်တွေ့လုပ်ငန်းနှင့် သက်သေများသည် သင်မမျှဝေမချင်း ကိုယ်ရေးကိုယ်တာအဖြစ် ဆက်ရှိနေမည်။"
              : "Your roadmap, missions, and proof remain private until you choose to share."}
          </p>
        </div>

        <ol className="auth-climb">
          {climb.map((label, index) => (
            <li key={label} className={index === climb.length - 1 ? "start" : ""}>
              <span className="auth-climb-dot" aria-hidden="true" />
              <span>{label}</span>
              {index === climb.length - 1 ? <em>{my ? "ဤနေရာမှ စတင်သည်" : "Starts here"}</em> : null}
            </li>
          ))}
        </ol>

        <ul className="auth-promises">
          {promises.map(([Icon, label]) => (
            <li key={label}><Icon size={15} aria-hidden="true" />{label}</li>
          ))}
        </ul>
      </section>

      <section className="auth-form-panel">
        <div className="auth-top">
          <Link href="/" className="auth-back"><ArrowLeft size={16} aria-hidden="true" />{my ? "ပင်မစာမျက်နှာသို့" : "Back to home"}</Link>
          <nav className="auth-lang" aria-label={my ? "ဘာသာစကား" : "Language"}>
            <Link href="/login" locale="en" hrefLang="en" className={locale === "en" ? "on" : ""}>EN</Link>
            <span aria-hidden="true">/</span>
            <Link href="/login" locale="my" hrefLang="my" className={my ? "on" : ""}>မြန်မာ</Link>
          </nav>
        </div>

        <div className="auth-card">
          <span className="eyebrow">{my ? "ပြန်လည်ကြိုဆိုပါသည်" : "WELCOME BACK"}</span>
          <h1>{t("title")}</h1>
          <p>{t("body")}</p>

          {isSupabaseConfigured ? (
            <>
              {/* One tap before seven fields. */}
              <GoogleSignIn locale={locale} />
              <div className="auth-divider"><span>{t("or")}</span></div>
              <EmailAuthForm locale={locale} demoRequested={query.demo === "1"} />
            </>
          ) : (
            <div className="configuration-note">
              <strong>{my ? "အကောင့်ဝင်ရန် Supabase ချိတ်ဆက်ပါ။" : "Connect Supabase to enable sign-in."}</strong>
              <p>{my ? "`.env.example` ကို `.env.local` အဖြစ်ကူးပြီး project URL နှင့် publishable key ထည့်ပါ။" : "Copy `.env.example` to `.env.local` and add the project URL and publishable key."}</p>
            </div>
          )}

          <p className="privacy-copy"><Lock size={14} aria-hidden="true" />{t("privacy")}</p>
        </div>
      </section>
    </main>
  );
}
