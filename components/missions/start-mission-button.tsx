"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

export function StartMissionButton({ missionKey, href, label = "Start mission" }: { missionKey: string; href: string; label?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function start() {
    setBusy(true);
    setError("");
    const response = await fetch("/api/missions/start", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ missionKey }) });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.detail ?? "This mission could not start. Please retry.");
      setBusy(false);
      return;
    }
    router.push(href);
    router.refresh();
  }

  return <div className="mission-start-action"><button type="button" className="button primary" disabled={busy} onClick={start}>{busy ? "Starting…" : label}</button>{error ? <small className="inline-error" role="alert">{error}</small> : null}</div>;
}
