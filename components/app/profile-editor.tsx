"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, X } from "lucide-react";
import { Mascot, MASCOT_VARIANTS } from "@/components/app/mascot";
import { createClient } from "@/lib/supabase/client";

/**
 * Profile editor.
 *
 * The hero line used to be derived entirely from the active path — true, but
 * not the learner's own words. This lets them write their own, and keeps the
 * derived line as the fallback when they clear it rather than leaving a blank
 * space where an identity was.
 *
 * The character picker only appears once there is more than one character to
 * pick between; see MASCOT_VARIANTS. Rendering a chooser whose options are the
 * same drawing would be a control that does nothing.
 *
 * Writes go through `update_learner_profile`, the same definer-function route
 * every other write in this schema takes. The form states what failed rather
 * than swallowing it, because a rename that silently did not save is worse
 * than one that visibly did not.
 */
export function ProfileEditor({
  alias,
  headline,
  avatar,
  labels,
}: {
  alias: string;
  headline: string | null;
  avatar: string;
  labels: {
    edit: string; name: string; headline: string; headlineHint: string;
    character: string; save: string; saving: string; cancel: string; failed: string;
  };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(alias);
  const [line, setLine] = useState(headline ?? "");
  const [pick, setPick] = useState(avatar);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error: rpcError } = await supabase.rpc("update_learner_profile", {
      p_alias: name.trim(),
      p_headline: line.trim(),
      p_avatar: pick,
    });
    setBusy(false);
    if (rpcError) {
      setError(rpcError.message || labels.failed);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button type="button" className="button ghost compact profile-edit-open" onClick={() => setOpen(true)}>
        <Pencil size={14} aria-hidden="true" />{labels.edit}
      </button>
    );
  }

  return (
    <form className="profile-editor" onSubmit={save}>
      <label>
        <span>{labels.name}</span>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required />
      </label>

      <label>
        <span>{labels.headline}</span>
        <input value={line} onChange={(e) => setLine(e.target.value)} maxLength={80} placeholder={labels.headlineHint} />
      </label>

      {MASCOT_VARIANTS.length > 1 ? (
        <fieldset className="profile-editor-characters">
          <legend>{labels.character}</legend>
          {MASCOT_VARIANTS.map((variant) => (
            <label key={variant.key} className={pick === variant.key ? "on" : ""}>
              <input
                type="radio"
                name="avatar"
                value={variant.key}
                checked={pick === variant.key}
                onChange={() => setPick(variant.key)}
              />
              <Mascot size={64} variant={variant.key} />
            </label>
          ))}
        </fieldset>
      ) : null}

      {error ? <p className="profile-editor-error" role="alert">{error}</p> : null}

      <div className="profile-editor-actions">
        <button type="submit" className="button primary compact" disabled={busy}>
          <Check size={15} aria-hidden="true" />{busy ? labels.saving : labels.save}
        </button>
        <button type="button" className="button ghost compact" onClick={() => setOpen(false)} disabled={busy}>
          <X size={15} aria-hidden="true" />{labels.cancel}
        </button>
      </div>
    </form>
  );
}
