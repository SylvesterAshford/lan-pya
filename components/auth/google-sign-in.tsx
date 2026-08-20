"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { isGoogleProviderEnabled } from "@/lib/supabase/auth-providers";
import { Button } from "@/components/ui/button";

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
      <Button className="h-11 w-full text-base" variant="outline" type="button" onClick={signIn} disabled={busy}>
        <span className="google-mark" aria-hidden>G</span>
        {busy ? t("working") : t("google")}
      </Button>
      {notice && <p className="provider-note" role="status">{notice}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  );
}
