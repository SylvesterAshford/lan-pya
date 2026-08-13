"use client";

import { useState } from "react";
import { getAppCopy } from "@/lib/i18n/app-copy";

export function ShareProofButton({ locale, proofId }: { locale: string; proofId: string }) {
  const c = getAppCopy(locale).proof;
  const [message, setMessage] = useState("");
  const [shareId, setShareId] = useState("");
  async function share() {
    setMessage(c.creating);
    const response = await fetch("/api/proof/share", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ proofId, expiresInDays: 7 }) });
    const body = await response.json().catch(() => null);
    if (!response.ok) { setMessage(body?.detail ?? c.shareError); return; }
    await navigator.clipboard.writeText(body.data.url);
    setShareId(body.data.shareId);
    setMessage(c.copied);
  }
  async function revoke() {
    const response = await fetch(`/api/proof/share/${shareId}`, { method: "DELETE" });
    if (response.ok) { setShareId(""); setMessage(c.revoked); }
    else setMessage(c.revokeError);
  }
  return <div className="share-action"><button className="button outline compact" type="button" onClick={share}>{c.share}</button>{shareId ? <button className="text-link inline" type="button" onClick={revoke}>{c.revoke}</button> : null}{message ? <small role="status">{message}</small> : null}</div>;
}
