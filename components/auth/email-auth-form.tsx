"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export const DEMO_ACCOUNT = {
  email: "demo@lanpya.app",
  password: "LanPya-Demo-2026!",
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

  function changeMode(nextMode: "sign-in" | "sign-up") {
    setMode(nextMode);
    setError("");
    setNotice("");
  }

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
      setError(t("accountError"));
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
        <Button type="button" variant={mode === "sign-in" ? "default" : "ghost"} className="h-11 flex-1" aria-pressed={mode === "sign-in"} onClick={() => changeMode("sign-in")}>{t("signIn")}</Button>
        <Button type="button" variant={mode === "sign-up" ? "default" : "ghost"} className="h-11 flex-1" aria-pressed={mode === "sign-up"} onClick={() => changeMode("sign-up")}>{t("createAccount")}</Button>
      </div>

      <form className="email-auth-form" onSubmit={submit}>
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="auth-email">{t("email")}</FieldLabel>
            <Input id="auth-email" className="h-11 bg-background px-3 text-base md:text-base" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" aria-invalid={Boolean(error)} />
          </Field>
          <Field>
            <FieldLabel htmlFor="auth-password">{t("password")}</FieldLabel>
            <Input id="auth-password" className="h-11 bg-background px-3 text-base md:text-base" type="password" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={Boolean(error)} />
          </Field>
          <Field>
            <Button className="h-11 w-full text-base" type="submit" disabled={busy}>{busy ? t("working") : mode === "sign-in" ? t("signIn") : t("createAccount")}</Button>
          </Field>
        </FieldGroup>
      </form>

      {notice && <p className="provider-note" role="status">{notice}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}

      <section className="demo-login-card auth-demo-callout" aria-label={t("demoTitle")}>
        <div><strong>{t("demoTitle")}</strong><p>{t("demoBody")}</p></div>
        <dl><div><dt>{t("email")}</dt><dd>{DEMO_ACCOUNT.email}</dd></div><div><dt>{t("password")}</dt><dd>{DEMO_ACCOUNT.password}</dd></div></dl>
        <Button className="h-11 w-full text-base" variant="outline" type="button" onClick={useDemoAccount}>{t("fillDemo")}</Button>
      </section>
    </div>
  );
}
