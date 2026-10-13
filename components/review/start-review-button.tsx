"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

/** Claims a submission for this reviewer, then reloads the page into the rubric. */
export function StartReviewButton({ submissionId, labels }: { submissionId: string; labels: { start: string; starting: string; startError: string } }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function start() {
    setBusy(true);
    setError("");
    const response = await fetch(`/api/review/${submissionId}/claim`, { method: "POST" }).catch(() => null);
    if (!response?.ok) {
      setError(labels.startError);
      setBusy(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="review-start">
      <button type="button" className="button primary compact" disabled={busy} onClick={start}>{busy ? labels.starting : labels.start}</button>
      {error ? <p className="submit-error-text" role="alert">{error}</p> : null}
    </div>
  );
}
