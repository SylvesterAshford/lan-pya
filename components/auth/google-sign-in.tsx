"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { isGoogleProviderEnabled } from "@/lib/supabase/auth-providers";

export function GoogleSignIn({ locale }: { locale: string }) {
  const t = useTranslations("Auth");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function signIn() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (!(await isGoogleProviderEnabled())) {
        setBusy(false);
        setNotice(t("providerUnavailable"));
        return;
      }

      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/${locale}/onboarding`,
          scopes: "openid email profile",
        },
      });
      if (authError) throw authError;
    } catch {
      setBusy(false);
      setError(t("error"));
    }
  }

  return (
    <div className="auth-action-stack">
      <button className="button primary full" type="button" onClick={signIn} disabled={busy}>
        <span className="google-mark" aria-hidden>G</span>
        {busy ? "…" : t("google")}
      </button>
      {notice && <p className="provider-note" role="status">{notice}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  );
}
