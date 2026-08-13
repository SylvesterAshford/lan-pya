"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { getAppCopy } from "@/lib/i18n/app-copy";

export function StartMissionButton({ locale = "en", missionKey, href, label }: { locale?: string; missionKey: string; href: string; label?: string }) {
  const router = useRouter();
  const c = getAppCopy(locale).build;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function start() {
    setBusy(true);
    setError("");
    const response = await fetch("/api/missions/start", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ missionKey }) });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.detail ?? c.startError);
      setBusy(false);
      return;
    }
    router.push(href);
    router.refresh();
  }

  return <div className="mission-start-action"><button type="button" className="button primary" disabled={busy} onClick={start}>{busy ? c.starting : label ?? c.start}</button>{error ? <small className="inline-error" role="alert">{error}</small> : null}</div>;
}
