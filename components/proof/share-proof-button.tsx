"use client";

import { useState } from "react";

export function ShareProofButton({ proofId }: { proofId: string }) {
  const [message, setMessage] = useState("");
  const [shareId, setShareId] = useState("");
  async function share() {
    setMessage("Creating private link…");
    const response = await fetch("/api/proof/share", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ proofId, expiresInDays: 7 }) });
    const body = await response.json().catch(() => null);
    if (!response.ok) { setMessage(body?.detail ?? "Could not create link."); return; }
    await navigator.clipboard.writeText(body.data.url);
    setShareId(body.data.shareId);
    setMessage("Private 7-day link copied");
  }
  async function revoke() {
    const response = await fetch(`/api/proof/share/${shareId}`, { method: "DELETE" });
    if (response.ok) { setShareId(""); setMessage("Link revoked immediately"); }
    else setMessage("Could not revoke the link.");
  }
  return <div className="share-action"><button className="button outline compact" type="button" onClick={share}>Share proof</button>{shareId ? <button className="text-link inline" type="button" onClick={revoke}>Revoke</button> : null}{message ? <small role="status">{message}</small> : null}</div>;
}
