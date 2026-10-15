"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { communityLinkErrors, hasAnyLink, NOTE_MAX, normalizeCommunityLinks, type CommunityField, type CommunityLinkErrors } from "@/lib/validation/community-links";
import type { getAppCopy } from "@/lib/i18n/app-copy";

export type CommunitySettingsLabels = ReturnType<typeof getAppCopy>["community"]["settings"];
export type CommunitySettingsValue = {
  visible: boolean; blocked: boolean; telegram: string; facebook: string; linkedin: string; note: string;
};

/**
 * "Show me in Community": the switch, three contact links and a note.
 *
 * One form in two places (design review DR9). On Profile it is the full
 * section with its own switch. In the join sheet it opens where a hidden
 * learner tried to see someone's links, and its one action turns the switch on
 * and saves, so they never leave the card they wanted.
 *
 * Links are checked here with the database's own rules
 * (lib/validation/community-links.ts) so a wrong field is named before the
 * round trip; the route and the database check again.
 */
export function CommunitySettings({
  initial,
  labels,
  mode,
  isDemo = false,
  onSaved,
  onCancel,
}: {
  initial: CommunitySettingsValue;
  labels: CommunitySettingsLabels;
  mode: "profile" | "join";
  isDemo?: boolean;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const id = useId();
  const [visible, setVisible] = useState(initial.visible);
  const [links, setLinks] = useState({ telegram: initial.telegram, facebook: initial.facebook, linkedin: initial.linkedin, note: initial.note });
  const [errors, setErrors] = useState<CommunityLinkErrors>({});
  const [state, setState] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const [message, setMessage] = useState("");

  const normalized = normalizeCommunityLinks(links);
  // The switch turns on once there is a link and every link typed is valid.
  const linkErrors = communityLinkErrors({ ...normalized, note: "" });
  const anyLink = hasAnyLink(normalized) && !Object.keys(linkErrors).length;
  const locked = initial.blocked || isDemo;

  function update(field: CommunityField, value: string) {
    setLinks((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setState("idle");
    // Removing the last link turns the switch off, as the database requires.
    if (field !== "note" && !hasAnyLink(normalizeCommunityLinks({ ...links, [field]: value }))) setVisible(false);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (locked) return;
    const nextVisible = mode === "join" ? true : visible;
    const found = communityLinkErrors(normalized);
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    if (nextVisible && !hasAnyLink(normalized)) {
      setErrors({ telegram: true });
      setMessage(labels.needsLink);
      setState("failed");
      return;
    }
    setState("saving");
    setMessage("");
    const response = await fetch("/api/profile/community", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ visible: nextVisible, ...normalized }),
    }).catch(() => null);
    const body = await response?.json().catch(() => null);
    if (!response?.ok) {
      setState("failed");
      setMessage(body?.detail || labels.failed);
      return;
    }
    setLinks(normalized);
    setVisible(nextVisible);
    setState("saved");
    onSaved?.();
    router.refresh();
  }

  const field = (name: Exclude<CommunityField, "note">, label: string, error: string, hint?: string, placeholder?: string) => (
    <div className="community-field">
      <label htmlFor={`${id}-${name}`}>
        {label}
        {name !== "telegram" ? <span className="community-optional"> ({labels.optional})</span> : null}
      </label>
      <input
        id={`${id}-${name}`}
        value={links[name]}
        onChange={(event) => update(name, event.target.value)}
        onBlur={() => setErrors((current) => ({ ...current, ...pick(communityLinkErrors(normalized), name) }))}
        inputMode={name === "telegram" ? "text" : "url"}
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        disabled={locked}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={`${id}-${name}-help`}
      />
      <small id={`${id}-${name}-help`} className={errors[name] ? "community-field-error" : undefined}>
        {errors[name] ? error : hint}
      </small>
    </div>
  );

  return (
    <form className={`community-settings ${mode}`} onSubmit={save} noValidate>
      {initial.blocked ? <p className="community-notice" role="status">{labels.paused}</p> : null}
      {isDemo ? <p className="community-notice" role="status">{labels.demo}</p> : null}

      {mode === "profile" ? (
        <div className="community-switch-row">
          <span className="community-switch-copy">
            <span className="community-switch-label" id={`${id}-switch`}>{labels.switchLabel}</span>
            <span className="community-switch-help">{anyLink || visible ? labels.privacy : labels.needsLink}</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={visible}
            aria-labelledby={`${id}-switch`}
            className="community-switch"
            disabled={locked || (!visible && !anyLink)}
            onClick={() => { setVisible((value) => !value); setState("idle"); }}
          >
            <span aria-hidden="true" />
          </button>
        </div>
      ) : (
        <p className="community-join-privacy">{labels.privacy}</p>
      )}

      {field("telegram", labels.telegram, labels.telegramError, labels.telegramHint, "@your_name")}
      {field("facebook", labels.facebook, labels.facebookError, undefined, "facebook.com/your.name")}
      {field("linkedin", labels.linkedin, labels.linkedinError, undefined, "linkedin.com/in/your-name")}

      <div className="community-field">
        <label htmlFor={`${id}-note`}>
          {labels.note}<span className="community-optional"> ({labels.optional})</span>
        </label>
        <input
          id={`${id}-note`}
          value={links.note}
          onChange={(event) => update("note", event.target.value)}
          maxLength={NOTE_MAX + 20}
          disabled={locked}
          aria-invalid={errors.note ? true : undefined}
          aria-describedby={`${id}-note-help`}
        />
        <small id={`${id}-note-help`} className={errors.note ? "community-field-error" : undefined}>
          {errors.note ? labels.noteError : labels.noteHint}
        </small>
      </div>

      {state === "failed" && message ? <p className="community-form-error" role="alert">{message}</p> : null}

      <div className="community-form-actions">
        <button type="submit" className="button primary" disabled={locked || state === "saving"}>
          {state === "saving" ? labels.saving : mode === "join" ? labels.joinSave : labels.save}
        </button>
        {mode === "join" && onCancel ? (
          <button type="button" className="button ghost" onClick={onCancel} disabled={state === "saving"}>{labels.notNow}</button>
        ) : null}
        <span className="community-saved" role="status">{state === "saved" && mode === "profile" ? labels.saved : ""}</span>
      </div>
    </form>
  );
}

function pick(errors: CommunityLinkErrors, field: CommunityField): CommunityLinkErrors {
  return errors[field] ? { [field]: true } : {};
}
