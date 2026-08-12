"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

const SKILLS = ["HTML", "Basic CSS", "Responsive design", "JavaScript", "Git & GitHub"];

export function OnboardingForm({ locale, defaultName }: { locale: string; defaultName: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ alias: defaultName, weeklyHours: "4–6 hours", skills: [] as string[], knowledgeScore: 0, microTaskScore: 0, consent: false });

  function toggleSkill(skill: string) {
    setForm((current) => ({ ...current, skills: current.skills.includes(skill) ? current.skills.filter((item) => item !== skill) : [...current.skills, skill] }));
  }

  async function finish() {
    if (!form.consent) { setError("Please accept the privacy notice to create your private profile."); return; }
    setBusy(true); setError("");
    const response = await fetch("/api/profile", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...form, locale }) });
    if (!response.ok) { const body = await response.json().catch(() => null); setError(body?.detail ?? "Your profile could not be saved. Please retry."); setBusy(false); return; }
    router.push("/app/today"); router.refresh();
  }

  return (
    <main className="assessment-shell">
      <header className="assessment-top"><div className="brand-lockup static"><span className="brand-mark">လ</span><span><strong>Lan Pya</strong><small>Set up your private path</small></span></div><span className="step-count">STEP {step} OF 3</span></header>
      <div className="assessment-progress"><span style={{ width: `${(step / 3) * 100}%` }} /></div>
      <section className="assessment-card">
        {step === 1 ? <><span className="eyebrow">WHO YOU ARE</span><h1>What should we call you?</h1><p>An alias is completely fine. Your email is never placed in proof by default.</p><label className="field-label" htmlFor="profile-alias">Display name or alias<input id="profile-alias" className="text-input" value={form.alias} maxLength={60} onChange={(e) => setForm({ ...form, alias: e.target.value })} /></label><div className="choice-grid three">{["2–3 hours", "4–6 hours", "7+ hours"].map((hours) => <button type="button" key={hours} className={`choice-card centered ${form.weeklyHours === hours ? "selected" : ""}`} onClick={() => setForm({ ...form, weeklyHours: hours })}><strong>{hours}</strong><small>each week</small></button>)}</div></> : null}
        {step === 2 ? <><span className="eyebrow">A QUICK SKILL CHECK</span><h1>What have you tried before?</h1><p>Choose only what you could explain or use today. Evidence will always outrank self-report.</p><div className="choice-grid two skill-grid">{SKILLS.map((skill) => <button type="button" key={skill} className={`choice-card ${form.skills.includes(skill) ? "selected" : ""}`} onClick={() => toggleSkill(skill)}><span className="choice-check">{form.skills.includes(skill) ? "✓" : ""}</span><strong>{skill}</strong></button>)}</div><div className="placement-note"><strong>How placement works</strong><p>You can test into a later milestone; this answer never locks content.</p></div></> : null}
        {step === 3 ? <><span className="eyebrow">PLACEMENT EVIDENCE</span><h1>Use a short check, or start safely.</h1><p>These fixed scores represent the five-question knowledge check and optional four-point micro-task. In the live instrument each answer is shown individually.</p><label className="field-label" htmlFor="knowledge-score">Knowledge check score: {form.knowledgeScore}/5<input id="knowledge-score" type="range" min="0" max="5" value={form.knowledgeScore} onChange={(e) => setForm({ ...form, knowledgeScore: Number(e.target.value) })} /></label><label className="field-label" htmlFor="micro-task-score">Micro-task score: {form.microTaskScore}/4<input id="micro-task-score" type="range" min="0" max="4" value={form.microTaskScore} onChange={(e) => setForm({ ...form, microTaskScore: Number(e.target.value) })} /></label><div className="consent-row"><input id="privacy-consent" aria-label="Create my private profile and accept the privacy notice" type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} /><span><strong>Create my private profile</strong><small>I understand which account and placement data Lan Pya stores.</small></span></div></> : null}
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="assessment-actions"><button className="button ghost" type="button" disabled={step === 1 || busy} onClick={() => setStep(step - 1)}>Back</button>{step < 3 ? <button className="button primary" type="button" disabled={!form.alias.trim()} onClick={() => setStep(step + 1)}>Continue →</button> : <button className="button primary" type="button" disabled={busy} onClick={finish}>{busy ? "Saving…" : "Open my roadmap →"}</button>}</div>
      </section>
    </main>
  );
}
