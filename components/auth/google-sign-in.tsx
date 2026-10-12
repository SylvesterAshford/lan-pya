"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

/**
 * Continue with Google, without the browser ever contacting Supabase.
 *
 * Google Identity Services renders Google's own button and returns an ID token
 * straight to this page; the token is posted to /api/auth/google, which signs
 * in with Supabase server-to-server. The browser talks only to
 * accounts.google.com and this site. Supabase's redirect-based OAuth sent the
 * browser to *.supabase.co, which is unreachable in Myanmar without a VPN.
 *
 * `clientId` and `enabled` are decided on the server. When Google is not set
 * up, a plain button explains that instead of loading Google's script.
 */

type GoogleCredentialResponse = { credential?: string };
type GoogleId = {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    nonce: string;
    use_fedcm_for_prompt?: boolean;
  }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void;
};
declare global {
  interface Window { google?: { accounts?: { id?: GoogleId } } }
}

const GIS_SRC = "https://accounts.google.com/gsi/client";

function loadGoogleScript() {
  return new Promise<GoogleId>((resolve, reject) => {
    const ready = () => (window.google?.accounts?.id ? resolve(window.google.accounts.id) : reject(new Error("gis-missing")));
    if (window.google?.accounts?.id) return ready();
    let script = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = GIS_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", ready, { once: true });
    script.addEventListener("error", () => reject(new Error("gis-load")), { once: true });
  });
}

/** Raw nonce for Supabase, and its SHA-256 hex digest for Google. */
async function makeNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const raw = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const hashed = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
  return { raw, hashed };
}

export function GoogleSignIn({ locale, clientId, enabled }: { locale: string; clientId: string | null; enabled: boolean }) {
  const t = useTranslations("Auth");
  const slot = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const live = enabled && Boolean(clientId);

  useEffect(() => {
    if (!live || !clientId) return;
    let cancelled = false;

    (async () => {
      try {
        const [gis, nonce] = await Promise.all([loadGoogleScript(), makeNonce()]);
        if (cancelled || !slot.current) return;

        gis.initialize({
          client_id: clientId,
          nonce: nonce.hashed,
          use_fedcm_for_prompt: true,
          callback: async ({ credential }) => {
            if (!credential) { setError(t("error")); return; }
            setBusy(true);
            setError("");
            const response = await fetch("/api/auth/google", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ credential, nonce: nonce.raw, locale }),
            }).catch(() => null);
            const body = await response?.json().catch(() => null);
            if (!response?.ok || !body?.data?.next) {
              setBusy(false);
              setError(t("error"));
              return;
            }
            // A full navigation, so the new session cookie is sent with it.
            window.location.assign(body.data.next);
          },
        });

        gis.renderButton(slot.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "center",
          width: Math.min(400, Math.max(200, Math.round(slot.current.getBoundingClientRect().width))),
          locale: locale === "my" ? "my" : "en",
        });
      } catch {
        if (!cancelled) setError(t("error"));
      }
    })();

    return () => { cancelled = true; };
  }, [clientId, live, locale, t]);

  if (!live) {
    return (
      <div className="auth-action-stack">
        <Button className="h-11 w-full text-base" variant="outline" type="button" onClick={() => setNotice(t("providerUnavailable"))}>
          <span className="google-mark" aria-hidden>G</span>
          {t("google")}
        </Button>
        {notice && <p className="provider-note" role="status">{notice}</p>}
      </div>
    );
  }

  return (
    <div className="auth-action-stack">
      <div ref={slot} className="google-gis-slot" aria-busy={busy} />
      {busy && <p className="provider-note" role="status">{t("working")}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  );
}
