"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

/**
 * Shown to the shared demo account only. Submitting a mission moves the demo
 * on for real, so this puts it back before the next run-through. Quiet and at
 * the foot of the page, where a pitch audience will not be looking.
 */
export function DemoResetButton({ label, busyLabel, doneLabel, errorLabel }: { label: string; busyLabel: string; doneLabel: string; errorLabel: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  async function reset() {
    setState("busy");
    const response = await fetch("/api/demo/reset", { method: "POST" }).catch(() => null);
    if (!response?.ok) { setState("error"); return; }
    // Forget where the traveller last stood, so the next climb animates from
    // the story's starting stop.
    try {
      for (const key of Object.keys(window.localStorage)) if (key.startsWith("lanpya-map-stop:")) window.localStorage.removeItem(key);
    } catch { /* storage unavailable */ }
    setState("done");
    router.refresh();
  }

  return (
    <div className="demo-reset">
      <button type="button" className="button outline compact" onClick={reset} disabled={state === "busy"}>
        <RotateCcw size={15} aria-hidden="true" />
        {state === "busy" ? busyLabel : label}
      </button>
      <span role="status">{state === "done" ? doneLabel : state === "error" ? errorLabel : ""}</span>
    </div>
  );
}
