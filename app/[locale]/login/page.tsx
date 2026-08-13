import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { EmailAuthForm } from "@/components/auth/email-auth-form";
import { getUser } from "@/lib/auth";
import { Link } from "@/i18n/navigation";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function LoginPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ demo?: string }> }) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const isSupabaseConfigured = hasSupabaseEnv();
  if (isSupabaseConfigured && (await getUser())) redirect(`/${locale}/app/today`);
  const t = await getTranslations("Auth");
  const my = locale === "my";

  return (
    <main className="auth-shell">
      <section className="auth-brand-panel">
        <Link href="/" className="brand-lockup static light"><span className="brand-mark">လ</span><span><strong>Lan Pya</strong><small>လမ်းပြ</small></span></Link>
        <div><span className="hero-kicker">{my ? "လမ်းကြောင်းမှ သက်သေဆီသို့" : "FROM MAP TO PROOF"}</span><h1>{my ? <>သင့်အလုပ်လမ်းကြောင်း။<br />သင့်သက်သေ။<br /><em>သင့်နောက်တံခါး။</em></> : <>Your career.<br />Your evidence.<br /><em>Your next door.</em></>}</h1></div>
        <div className="auth-brand-features"><span>{my ? "အမြဲတမ်း အခမဲ့" : "Free forever"}</span><span>{my ? "ပွင့်လင်းမြင်သာမှု" : "Transparent"}</span><span>{my ? "ကိုယ်ရေးကိုယ်တာကို ဦးစားပေး" : "Private by default"}</span></div>
      </section>
      <section className="auth-form-panel">
        <div className="auth-card">
          <span className="eyebrow">{my ? "ကိုယ်ရေးကိုယ်တာကို ဦးစားပေး" : "PRIVATE BY DEFAULT"}</span>
          <h1>{t("title")}</h1><p>{t("body")}</p>
          {isSupabaseConfigured ? (
            <>
              <EmailAuthForm locale={locale} demoRequested={query.demo === "1"} />
              <div className="auth-divider"><span>{t("or")}</span></div>
              <GoogleSignIn locale={locale} />
            </>
          ) : (
            <div className="configuration-note">
              <strong>{my ? "အကောင့်ဝင်ရန် Supabase ချိတ်ဆက်ပါ။" : "Connect Supabase to enable sign-in."}</strong>
              <p>{my ? "`.env.example` ကို `.env.local` အဖြစ်ကူးပြီး project URL နှင့် publishable key ထည့်ပါ။" : "Copy `.env.example` to `.env.local` and add the project URL and publishable key."}</p>
            </div>
          )}
          <p className="privacy-copy">{t("privacy")}</p>
        </div>
      </section>
    </main>
  );
}
