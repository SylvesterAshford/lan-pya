import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { ArrowLeft, Eye, Lock, ShieldCheck } from "lucide-react";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { EmailAuthForm } from "@/components/auth/email-auth-form";
import { LoginForm } from "@/components/login-form";
import { getUser } from "@/lib/auth";
import { Link } from "@/i18n/navigation";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

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

  const climb = my
    ? ["ချိတ်ဆက်", "သက်သေပြ", "တည်ဆောက်", "ရွေးချယ်"]
    : ["Connect", "Prove", "Build", "Choose"];

  const promises = my
    ? [[Lock, "မူလအတိုင်း ကိုယ်ရေးကိုယ်တာလုံခြုံ"], [ShieldCheck, "Supabase ဖြင့် လုံခြုံသော ဝင်ရောက်မှု"], [Eye, "ခွင့်ပြုချက်မပါဘဲ အများမြင် ပရိုဖိုင် မရှိ"]] as const
    : [[Lock, "Private by default"], [ShieldCheck, "Supabase-secured access"], [Eye, "No public profile without consent"]] as const;

  return (
    <main className="auth-shell auth-shell-login02">
      <section className="auth-form-panel auth-form-panel-login02">
        <header className="auth-login-brand-row">
          <Link href="/" className="brand-lockup static auth-desktop-brand">
            <span className="brand-mark">လ</span>
            <span><strong>Lan Pya</strong><small>လမ်းပြ</small></span>
          </Link>
          <Link href="/" className="brand-lockup static auth-mobile-brand">
            <span className="brand-mark">လ</span>
            <span><strong>Lan Pya</strong><small>လမ်းပြ</small></span>
          </Link>
          <Link href="/" className="auth-back auth-header-back"><ArrowLeft size={16} aria-hidden="true" />{my ? "ပင်မစာမျက်နှာသို့" : "Back to home"}</Link>
          <nav className="auth-lang" aria-label={my ? "ဘာသာစကား" : "Language"}>
            <Link href="/login" locale="en" hrefLang="en" className={locale === "en" ? "on" : ""}>EN</Link>
            <span aria-hidden="true">/</span>
            <Link href="/login" locale="my" hrefLang="my" className={my ? "on" : ""}>မြန်မာ</Link>
          </nav>
        </header>

        <div className="auth-login-form-wrap">
          <LoginForm
            title={t("title")}
            description={t("body")}
            provider={isSupabaseConfigured ? <GoogleSignIn locale={locale} /> : null}
            separator={t("or")}
            credentials={isSupabaseConfigured ? (
              <EmailAuthForm locale={locale} demoRequested={query.demo === "1"} />
            ) : (
              <div className="configuration-note">
                <strong>{my ? "အကောင့်ဝင်ရန် Supabase ချိတ်ဆက်ပါ။" : "Connect Supabase to enable sign-in."}</strong>
                <p>{my ? "`.env.example` ကို `.env.local` အဖြစ်ကူးပြီး project URL နှင့် publishable key ထည့်ပါ။" : "Copy `.env.example` to `.env.local` and add the project URL and publishable key."}</p>
              </div>
            )}
            privacy={t("privacy")}
          />
        </div>
      </section>

      <section className="auth-brand-panel auth-brand-panel-login02">
        <div className="auth-route-atmosphere" aria-hidden="true">
          <svg viewBox="0 0 760 900" preserveAspectRatio="xMidYMid slice">
            <path className="auth-ridge auth-ridge-far" d="M0 842 104 772l72 46 122-108 88 76 112-148 102 112 160-86v236H0Z" />
            <path className="auth-ridge auth-ridge-near" d="M0 882 122 808l108 58 132-92 104 78 144-96 150 78v66H0Z" />
            <path className="auth-orbit" d="M-80 238C104 126 226 292 390 188s260-46 452-132" />
            <path className="auth-orbit" d="M-88 622c174-102 302 40 462-66s286-66 472-6" />
          </svg>
        </div>

        <div className="auth-brand-stage">
          <div className="auth-brand-copy">
            <h1>
              {my
                ? <>သင့်အနာဂတ်နောက်ကွယ်မှ လက်ရာဆီ <em>ပြန်လာပါ။</em></>
                : <>Welcome back to the work behind <em>your future.</em></>}
            </h1>
            <p>
              {my
                ? "သင့်လမ်းကြောင်း၊ လက်တွေ့လုပ်ငန်းနှင့် သက်သေများသည် သင်မမျှဝေမချင်း ကိုယ်ရေးကိုယ်တာအဖြစ် ဆက်ရှိနေမည်။"
                : "Your roadmap, missions, and proof remain private until you choose to share."}
            </p>
          </div>

          <div className="auth-route-map" role="img" aria-label={my ? "ရွေးချယ်မှုမှ ချိတ်ဆက်မှုအထိ လမ်းကြောင်း" : "Path from choosing to connecting"}>
            <svg viewBox="0 0 480 250" aria-hidden="true">
              <path className="auth-route-shadow" d="M52 218c42 0 54-44 101-44 51 0 61-55 113-55 53 0 66-57 124-57 18 0 31-7 42-18" />
              <path className="auth-route-line" d="M52 218c42 0 54-44 101-44 51 0 61-55 113-55 53 0 66-57 124-57 18 0 31-7 42-18" />
              <path className="auth-route-dashes" d="M52 218c42 0 54-44 101-44 51 0 61-55 113-55 53 0 66-57 124-57 18 0 31-7 42-18" />
              <path className="auth-summit-flag" d="M437 28v38m0-36 26 9-26 9" />
            </svg>
            <ol className="auth-route-stops">
              {climb.map((label, index) => (
                <li key={label} className={`auth-route-stop stop-${index + 1}${index === climb.length - 1 ? " start" : ""}`}>
                  <span className="auth-route-node" aria-hidden="true" />
                  <span className="auth-route-copy">
                    <span className="auth-route-label">{label}</span>
                    {index === climb.length - 1 ? <em>{my ? "ဤနေရာမှ စတင်သည်" : "Starts here"}</em> : null}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <ul className={`auth-promises auth-promise-strip${my ? " is-myanmar" : ""}`}>
            {promises.map(([Icon, label]) => (
              <li key={label}><Icon size={16} aria-hidden="true" /><span>{label}</span></li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
