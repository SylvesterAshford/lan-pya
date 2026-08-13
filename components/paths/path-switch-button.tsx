"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

export function PathSwitchButton({ trackKey, children, className = "button outline" }: { trackKey: string; children: React.ReactNode; className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  async function switchPath() {
    setBusy(true);
    setError("");
    const response = await fetch("/api/paths/switch", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ trackKey }) });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.detail ?? "Your path did not change. Please retry.");
      setBusy(false);
      return;
    }
    router.push("/app/build");
    router.refresh();
  }

  if (confirming) {
    return <div className="path-switch-action path-switch-confirm" role="group" aria-label="Confirm path change"><p>Your current progress will stay saved. This path will shape your next mission.</p><div><button type="button" className="button primary compact" disabled={busy} onClick={switchPath}>{busy ? "Changing path…" : "Confirm path"}</button><button type="button" className="button ghost compact" disabled={busy} onClick={() => setConfirming(false)}>Cancel</button></div>{error ? <small className="inline-error" role="alert">{error}</small> : null}</div>;
  }

  return <div className="path-switch-action"><button type="button" className={className} disabled={busy} onClick={() => { setError(""); setConfirming(true); }}>{children}</button>{error ? <small className="inline-error" role="alert">{error}</small> : null}</div>;
}
