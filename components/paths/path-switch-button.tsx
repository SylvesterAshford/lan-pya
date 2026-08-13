"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { getAppCopy } from "@/lib/i18n/app-copy";

export function PathSwitchButton({ locale, trackKey, children, className = "button outline" }: { locale: string; trackKey: string; children: React.ReactNode; className?: string }) {
  const router = useRouter();
  const c = getAppCopy(locale);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  async function switchPath() {
    setBusy(true);
    setError("");
    const response = await fetch("/api/paths/switch", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ trackKey }) });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.detail ?? c.paths.changeError);
      setBusy(false);
      return;
    }
    router.push("/app/build");
    router.refresh();
  }

  if (confirming) {
    return <div className="path-switch-action path-switch-confirm" role="group" aria-label={c.paths.confirmTitle}><p>{c.paths.confirmBody}</p><div><button type="button" className="button primary compact" disabled={busy} onClick={switchPath}>{busy ? c.paths.changing : c.paths.confirm}</button><button type="button" className="button ghost compact" disabled={busy} onClick={() => setConfirming(false)}>{c.paths.cancel}</button></div>{error ? <small className="inline-error" role="alert">{error}</small> : null}</div>;
  }

  return <div className="path-switch-action"><button type="button" className={className} disabled={busy} onClick={() => { setError(""); setConfirming(true); }}>{children}</button>{error ? <small className="inline-error" role="alert">{error}</small> : null}</div>;
}
