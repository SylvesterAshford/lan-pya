import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { EmailAuthForm } from "@/components/auth/email-auth-form";
import { SummitStill } from "@/components/auth/summit-still";
import { LoginForm } from "@/components/login-form";
import { getUser } from "@/lib/auth";
import { Link } from "@/i18n/navigation";
import { hasSupabaseEnv } from "@/lib/env";
import { isGoogleProviderEnabled } from "@/lib/supabase/auth-providers";

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
  // Decided here, server-to-server: the browser must never ask *.supabase.co
  // anything, because it is unreachable from Myanmar without a VPN.
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || null;
  const googleEnabled = isSupabaseConfigured && Boolean(googleClientId) && (await isGoogleProviderEnabled());

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
            provider={isSupabaseConfigured ? <GoogleSignIn locale={locale} clientId={googleClientId} enabled={googleEnabled} /> : null}
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

      {/* The landing page's summit at dawn: signing in is coming back to the
          climb. Copy sits on the night sky above it. */}
      <section className="auth-brand-panel auth-brand-panel-login02 auth-brand-summit">
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
        <SummitStill label={my ? "ကျောင်းသားနှစ်ဦး နေထွက်ချိန်တွင် တောင်ထိပ်ပေါ်၌ ရပ်နေသည်" : "Two students standing on the summit as the sun rises"} />
      </section>
    </main>
  );
}
