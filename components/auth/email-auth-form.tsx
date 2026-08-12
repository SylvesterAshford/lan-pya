"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export const DEMO_ACCOUNT = {
  email: "demo@lanpya.app",
  password: "REDACTED",
} as const;

export function EmailAuthForm({ locale, demoRequested }: { locale: string; demoRequested: boolean }) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState(demoRequested ? DEMO_ACCOUNT.email : "");
  const [password, setPassword] = useState(demoRequested ? DEMO_ACCOUNT.password : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function useDemoAccount() {
    setMode("sign-in");
    setEmail(DEMO_ACCOUNT.email);
    setPassword(DEMO_ACCOUNT.password);
    setError("");
    setNotice(t("demoReady"));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    const supabase = createClient();

    if (mode === "sign-in") {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(t("invalidCredentials"));
        setBusy(false);
        return;
      }
      router.replace(`/${locale}/app/today`);
      router.refresh();
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/${locale}/onboarding`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setBusy(false);
      return;
    }

    if (data.session) {
      router.replace(`/${locale}/onboarding`);
      router.refresh();
      return;
    }

    setNotice(t("checkEmail"));
    setBusy(false);
  }

  return (
    <div className="email-auth-block">
      <div className="auth-mode-switch" aria-label={t("modeLabel")}>
        <button type="button" className={mode === "sign-in" ? "active" : ""} onClick={() => setMode("sign-in")}>{t("signIn")}</button>
        <button type="button" className={mode === "sign-up" ? "active" : ""} onClick={() => setMode("sign-up")}>{t("createAccount")}</button>
      </div>

      <form className="email-auth-form" onSubmit={submit}>
        <label htmlFor="auth-email">{t("email")}</label>
        <input id="auth-email" className="text-input" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
        <label htmlFor="auth-password">{t("password")}</label>
        <input id="auth-password" className="text-input" type="password" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" />
        <button className="button primary full" type="submit" disabled={busy}>{busy ? t("working") : mode === "sign-in" ? t("signIn") : t("createAccount")}</button>
      </form>

      {notice && <p className="provider-note" role="status">{notice}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}

      <section className="demo-login-card" aria-label={t("demoTitle")}>
        <div><span className="eyebrow">{t("demoKicker")}</span><strong>{t("demoTitle")}</strong><p>{t("demoBody")}</p></div>
        <dl><div><dt>{t("email")}</dt><dd>{DEMO_ACCOUNT.email}</dd></div><div><dt>{t("password")}</dt><dd>{DEMO_ACCOUNT.password}</dd></div></dl>
        <button className="button outline full" type="button" onClick={useDemoAccount}>{t("fillDemo")}</button>
      </section>
    </div>
  );
}
