"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getCareerRecommendations, getEligibleCareerPaths } from "@/lib/domain/career-recommendations";
import { useRouter } from "@/i18n/navigation";

const INTERESTS = ["Technology", "Startup", "Social impact", "Business", "Arts & culture", "Fashion", "Food", "Math & physics", "Programming", "Movie & shows", "Music", "Self growth"];
const EXPERIENCE = ["HTML", "Basic CSS", "Responsive design", "JavaScript", "Git & GitHub", "Canva", "Mobile video editing", "Writing or social posts"];
const STORAGE_KEY = "lan-pya-career-compass-v1";

type CompassForm = {
  alias: string;
  weeklyHours: "2–3 hours" | "4–6 hours" | "7+ hours";
  interests: string[];
  preferredWork: "make" | "explain" | "design" | "analyze" | "organize" | "grow" | "not_sure";
  immediateGoal: "explore" | "freelance" | "internship" | "portfolio" | "first_job" | "not_sure";
  deviceAccess: "phone_only" | "phone_and_laptop" | "laptop" | "not_sure";
  connectivity: "reliable" | "limited" | "not_sure";
  priorExperience: string[];
  selectedTrackKey: string | null;
  consent: boolean;
};

function initialForm(defaultName: string, values: Partial<CompassForm> = {}): CompassForm {
  return {
    alias: defaultName,
    weeklyHours: "4–6 hours",
    interests: [],
    preferredWork: "not_sure",
    immediateGoal: "not_sure",
    deviceAccess: "not_sure",
    connectivity: "not_sure",
    priorExperience: [],
    selectedTrackKey: null,
    consent: false,
    ...values,
  };
}

export function OnboardingForm({ locale, defaultName, initialValues }: { locale: string; defaultName: string; initialValues?: Partial<CompassForm> }) {
  const router = useRouter();
  const initialValuesRef = useRef(initialValues);
  const defaultNameRef = useRef(defaultName);
  const [step, setStep] = useState(1);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saveState, setSaveState] = useState("");
  const [form, setForm] = useState<CompassForm>(() => initialForm(defaultName, initialValues));

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) setForm({ ...initialForm(defaultNameRef.current, initialValuesRef.current), ...JSON.parse(saved) });
      } catch {
        // The form remains usable even when browser storage is unavailable.
      } finally {
        setReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form)); } catch { /* keep in-memory answers */ }
  }, [form, ready]);

  const recommendations = useMemo(() => getCareerRecommendations(form), [form]);
  const eligiblePaths = useMemo(() => recommendations.filter((item) => item.availability !== "preview"), [recommendations]);
  const selectedTrackKey = form.selectedTrackKey ?? eligiblePaths[0]?.key ?? getEligibleCareerPaths()[0]?.key ?? null;

  function toggleList(field: "interests" | "priorExperience", value: string, max: number) {
    setForm((current) => {
      const selected = current[field];
      if (selected.includes(value)) return { ...current, [field]: selected.filter((item) => item !== value) };
      if (selected.length >= max) return current;
      return { ...current, [field]: [...selected, value] };
    });
  }

  async function save(confirm = false) {
    const payload = { ...form, selectedTrackKey: confirm ? selectedTrackKey : null, locale, confirm };
    const response = await fetch("/api/career-compass", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.detail ?? "Your answers are still saved on this device. Retry when you are ready.");
      setSaveState("Saved on this device");
      return false;
    }
    setError("");
    setSaveState(confirm ? "" : "Saved privately");
    return true;
  }

  async function next() {
    if (!form.alias.trim()) { setError("Add a display name or alias first."); return; }
    setBusy(true);
    const saved = await save(false);
    setBusy(false);
    if (saved) setStep((current) => Math.min(5, current + 1));
  }

  async function finish() {
    if (!form.consent) { setError("Accept the privacy notice before creating your private path."); return; }
    if (!selectedTrackKey) { setError("Choose one available path to continue."); return; }
    setBusy(true);
    const saved = await save(true);
    setBusy(false);
    if (!saved) return;
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* nothing to clear */ }
    router.push("/app/today");
    router.refresh();
  }

  if (!ready) return <main className="assessment-shell" aria-busy="true" />;

  return (
    <main className="assessment-shell">
      <header className="assessment-top"><div className="brand-lockup static"><span className="brand-mark">လ</span><span><strong>Lan Pya</strong><small>Find your private path</small></span></div><span className="step-count">STEP {step} OF 5</span></header>
      <div className="assessment-progress" aria-label={`Career Compass step ${step} of 5`}><span style={{ width: `${(step / 5) * 100}%` }} /></div>
      <section className="assessment-card">
        {step === 1 ? <><span className="eyebrow">CAREER COMPASS</span><h1>What kinds of work pull you in?</h1><p>Pick up to three interests. “Not sure yet” is welcome, and you can change direction later.</p><label className="field-label" htmlFor="profile-alias">Display name or alias<input id="profile-alias" className="text-input" value={form.alias} maxLength={60} onChange={(event) => setForm({ ...form, alias: event.target.value })} /></label><div className="choice-grid three compass-grid">{INTERESTS.map((interest) => <button type="button" key={interest} className={`choice-card centered ${form.interests.includes(interest) ? "selected" : ""}`} aria-pressed={form.interests.includes(interest)} onClick={() => toggleList("interests", interest, 3)}><strong>{interest}</strong></button>)}</div><p className="choice-hint">{form.interests.length}/3 selected</p></> : null}
        {step === 2 ? <><span className="eyebrow">PREFERRED WORK</span><h1>How would you like to contribute?</h1><p>This helps us explain a direction. It never locks you into a job title.</p><div className="choice-grid three compass-grid">{(["make", "explain", "design", "analyze", "organize", "grow"] as const).map((work) => <button type="button" key={work} className={`choice-card centered ${form.preferredWork === work ? "selected" : ""}`} aria-pressed={form.preferredWork === work} onClick={() => setForm({ ...form, preferredWork: work })}><strong>{work[0].toUpperCase() + work.slice(1)}</strong><small>{({ make: "Build useful things", explain: "Tell clear stories", design: "Shape visual ideas", analyze: "Find answers in data", organize: "Make systems work", grow: "Reach the right people" })[work]}</small></button>)}<button type="button" className={`choice-card centered ${form.preferredWork === "not_sure" ? "selected" : ""}`} aria-pressed={form.preferredWork === "not_sure"} onClick={() => setForm({ ...form, preferredWork: "not_sure" })}><strong>Not sure yet</strong><small>We will keep the suggestion broad</small></button></div></> : null}
        {step === 3 ? <><span className="eyebrow">YOUR SETUP</span><h1>What can you comfortably use today?</h1><p>We adapt the first mission to the device and connection you actually have.</p><div className="field-group"><strong>Device</strong><div className="choice-grid three">{([['phone_only', 'Phone only'], ['phone_and_laptop', 'Phone + laptop'], ['laptop', 'Laptop']] as const).map(([value, label]) => <button type="button" key={value} className={`choice-card centered ${form.deviceAccess === value ? "selected" : ""}`} aria-pressed={form.deviceAccess === value} onClick={() => setForm({ ...form, deviceAccess: value })}><strong>{label}</strong></button>)}</div></div><div className="field-group"><strong>Connection</strong><div className="choice-grid two">{([['reliable', 'Usually reliable'], ['limited', 'Limited or expensive'], ['not_sure', 'Not sure yet']] as const).map(([value, label]) => <button type="button" key={value} className={`choice-card centered ${form.connectivity === value ? "selected" : ""}`} aria-pressed={form.connectivity === value} onClick={() => setForm({ ...form, connectivity: value })}><strong>{label}</strong></button>)}</div></div></> : null}
        {step === 4 ? <><span className="eyebrow">YOUR RHYTHM</span><h1>What can you protect right now?</h1><p>We use your time and near-term goal to make the first proof feel possible, not overwhelming.</p><div className="field-group"><strong>Weekly time</strong><div className="choice-grid three">{(["2–3 hours", "4–6 hours", "7+ hours"] as const).map((hours) => <button type="button" key={hours} className={`choice-card centered ${form.weeklyHours === hours ? "selected" : ""}`} aria-pressed={form.weeklyHours === hours} onClick={() => setForm({ ...form, weeklyHours: hours })}><strong>{hours}</strong><small>each week</small></button>)}</div></div><div className="field-group"><strong>Near-term goal</strong><div className="choice-grid three compass-grid">{([['explore', 'Explore options'], ['portfolio', 'Build a portfolio'], ['internship', 'Find an internship'], ['first_job', 'Work toward a first job'], ['freelance', 'Prepare for freelance'], ['not_sure', 'Not sure yet']] as const).map(([value, label]) => <button type="button" key={value} className={`choice-card centered ${form.immediateGoal === value ? "selected" : ""}`} aria-pressed={form.immediateGoal === value} onClick={() => setForm({ ...form, immediateGoal: value })}><strong>{label}</strong></button>)}</div></div></> : null}
        {step === 5 ? <><span className="eyebrow">YOUR STARTING POINT</span><h1>Here is a path you can start now.</h1><p>We use your answers to explain the suggestion. Practical evidence will always matter more than self-report.</p><div className="experience-picker"><strong>What have you already tried? <small>Optional</small></strong><div className="choice-grid two skill-grid">{EXPERIENCE.map((skill) => <button type="button" key={skill} className={`choice-card ${form.priorExperience.includes(skill) ? "selected" : ""}`} aria-pressed={form.priorExperience.includes(skill)} onClick={() => toggleList("priorExperience", skill, 10)}><span className="choice-check">{form.priorExperience.includes(skill) ? "✓" : ""}</span><strong>{skill}</strong></button>)}</div></div><div className="recommendation-stack">{eligiblePaths.slice(0, 2).map((path, index) => <button type="button" key={path.key} className={`recommendation-choice ${selectedTrackKey === path.key ? "selected" : ""}`} aria-pressed={selectedTrackKey === path.key} onClick={() => setForm({ ...form, selectedTrackKey: path.key })}><span className="recommendation-kicker">{index === 0 ? "RECOMMENDED FOR YOU" : "ALSO AVAILABLE"}</span><strong>{path.title}</strong><small>{path.reason}</small><em>{path.firstMission} · {path.timeToFirstProof}</em></button>)}</div><div className="consent-row"><input id="privacy-consent" aria-label="Create my private path and accept the privacy notice" type="checkbox" checked={form.consent} onChange={(event) => setForm({ ...form, consent: event.target.checked })} /><span><strong>Create my private path</strong><small>Your interests and setup stay private. Reviewers see your work, not these answers.</small></span></div></> : null}
        {error ? <div className="form-error" role="alert">{error}</div> : null}
        <div className="assessment-actions"><button className="button ghost" type="button" disabled={step === 1 || busy} onClick={() => setStep((current) => current - 1)}>Back</button><span className="save-state" aria-live="polite">{saveState}</span>{step < 5 ? <button className="button primary" type="button" disabled={busy} onClick={next}>{busy ? "Saving…" : "Continue →"}</button> : <button className="button primary" type="button" disabled={busy} onClick={finish}>{busy ? "Creating path…" : "Create my path →"}</button>}</div>
      </section>
    </main>
  );
}
