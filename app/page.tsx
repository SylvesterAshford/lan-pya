"use client";

import { useEffect, useMemo, useState } from "react";

type View = "today" | "roadmap" | "mission" | "proof" | "opportunities";
type Readiness = "Ready now" | "Build toward" | "Explore";

type DemoState = {
  onboarded: boolean;
  name: string;
  role: string;
  skills: string[];
  goal: string;
  weeklyHours: string;
  repoUrl: string;
  liveUrl: string;
  fileName: string;
  reflection: string;
  aiDisclosure: boolean;
  reviewComplete: boolean;
  proofAdded: boolean;
  shareEnabled: boolean;
  savedOpportunities: string[];
};

type Opportunity = {
  id: string;
  type: string;
  title: string;
  org: string;
  location: string;
  deadline: string;
  readiness: Readiness;
  match: string;
  gaps: string[];
  description: string;
  source: string;
};

const STORAGE_KEY = "lan-pya-hackathon-demo-v1";

const DEFAULT_STATE: DemoState = {
  onboarded: false,
  name: "",
  role: "University student",
  skills: [],
  goal: "Frontend Developer",
  weeklyHours: "4–6 hours",
  repoUrl: "",
  liveUrl: "",
  fileName: "",
  reflection: "",
  aiDisclosure: false,
  reviewComplete: false,
  proofAdded: false,
  shareEnabled: false,
  savedOpportunities: [],
};

const SAMPLE_STATE: DemoState = {
  ...DEFAULT_STATE,
  onboarded: true,
  name: "Thiri",
  role: "University student",
  skills: ["HTML", "Basic CSS"],
  weeklyHours: "4–6 hours",
};

const NAV_ITEMS: { id: View; label: string; burmese: string }[] = [
  { id: "today", label: "Today", burmese: "ဒီနေ့" },
  { id: "roadmap", label: "Roadmap", burmese: "လမ်းကြောင်း" },
  { id: "mission", label: "Mission", burmese: "လက်တွေ့လုပ်ငန်း" },
  { id: "proof", label: "Proof", burmese: "သက်သေပြချက်" },
  { id: "opportunities", label: "Opportunities", burmese: "အခွင့်အလမ်း" },
];

const MILESTONES = [
  {
    title: "Web foundations",
    subtitle: "How the web works, editor setup, browser tools",
    status: "complete",
    proof: "Orientation check",
  },
  {
    title: "HTML essentials",
    subtitle: "Semantic structure, forms, accessible content",
    status: "complete",
    proof: "Profile page",
  },
  {
    title: "CSS foundations",
    subtitle: "Layout, typography, color, reusable classes",
    status: "active",
    proof: "Responsive profile card",
  },
  {
    title: "Responsive design",
    subtitle: "Mobile-first layouts, breakpoints, testing",
    status: "next",
    proof: "Community landing page",
  },
  {
    title: "JavaScript foundations",
    subtitle: "Data, functions, events, DOM interactions",
    status: "upcoming",
    proof: "Opportunity tracker",
  },
  {
    title: "APIs and React",
    subtitle: "Async data, components, state, resilient UI",
    status: "upcoming",
    proof: "Live opportunity explorer",
  },
  {
    title: "Hiring capstone",
    subtitle: "Partner brief, review, defense, proof packet",
    status: "upcoming",
    proof: "Employer-reviewed capstone",
  },
];

const OPPORTUNITIES: Opportunity[] = [
  {
    id: "nexa-challenge",
    type: "Challenge",
    title: "Junior Frontend Build Challenge",
    org: "NexaLabs Myanmar",
    location: "Remote · Myanmar",
    deadline: "18 Aug 2026",
    readiness: "Ready now",
    match: "92% match",
    gaps: [],
    description:
      "A two-hour responsive interface challenge with feedback from the NexaLabs product team. Strong submissions enter their internship shortlist.",
    source: "Partner submitted · checked today",
  },
  {
    id: "gdg-workshop",
    type: "Workshop",
    title: "Accessible Web Interfaces",
    org: "GDG Yangon",
    location: "Yangon · Hybrid",
    deadline: "22 Aug 2026",
    readiness: "Ready now",
    match: "88% match",
    gaps: [],
    description:
      "A practical workshop on semantic HTML, keyboard navigation, and accessible testing for early-career web developers.",
    source: "Community listing · checked yesterday",
  },
  {
    id: "pixel-intern",
    type: "Internship",
    title: "Frontend Engineering Intern",
    org: "PixelCraft Studio",
    location: "Yangon · On-site",
    deadline: "29 Aug 2026",
    readiness: "Build toward",
    match: "74% match",
    gaps: ["JavaScript", "1 deployed project"],
    description:
      "A twelve-week paid internship supporting a small product team. Applicants need JavaScript foundations and one deployed project.",
    source: "Original company post · checked today",
  },
  {
    id: "asean-hack",
    type: "Hackathon",
    title: "ASEAN Youth Digital Challenge",
    org: "Future Makers Network",
    location: "Remote · Regional",
    deadline: "05 Sep 2026",
    readiness: "Build toward",
    match: "69% match",
    gaps: ["JavaScript", "Team project"],
    description:
      "A regional product hackathon for teams of three to five. Build a digital solution around youth access and inclusion.",
    source: "Organizer page · checked 2 days ago",
  },
  {
    id: "design-scholarship",
    type: "Scholarship",
    title: "Product Design Foundation Scholarship",
    org: "Build Myanmar",
    location: "Online",
    deadline: "12 Sep 2026",
    readiness: "Explore",
    match: "58% match",
    gaps: ["Design portfolio", "Motivation essay"],
    description:
      "A six-week foundation program for young people exploring interface and product design, with twenty full scholarships available.",
    source: "Organizer page · checked today",
  },
];

function getInitials(name: string) {
  const trimmed = name.trim();
  return trimmed ? trimmed.slice(0, 2).toUpperCase() : "LP";
}

function readinessClass(readiness: Readiness) {
  if (readiness === "Ready now") return "ready";
  if (readiness === "Build toward") return "build";
  return "explore";
}

export default function Home() {
  const [demo, setDemo] = useState<DemoState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [assessmentStep, setAssessmentStep] = useState(0);
  const [view, setView] = useState<View>("today");
  const [evaluating, setEvaluating] = useState(false);
  const [formError, setFormError] = useState("");
  const [filter, setFilter] = useState("All");
  const [expandedOpportunity, setExpandedOpportunity] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) setDemo({ ...DEFAULT_STATE, ...JSON.parse(stored) });
      } catch {
        // A prototype should remain usable even if browser storage is unavailable.
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
    } catch {
      // Local persistence is a convenience, not a dependency.
    }
  }, [demo, hydrated]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const criteria = useMemo(() => {
    const hasEvidence = Boolean(demo.repoUrl || demo.liveUrl || demo.fileName);
    const validLink = Boolean(
      (demo.liveUrl && /^https?:\/\//i.test(demo.liveUrl)) ||
        (demo.repoUrl && /^https?:\/\//i.test(demo.repoUrl)),
    );
    const clearReflection = demo.reflection.trim().length >= 40;
    return [
      {
        name: "Evidence supplied",
        met: hasEvidence,
        detail: hasEvidence
          ? "A repository, live link, or screenshot is attached."
          : "Add at least one inspectable artifact.",
      },
      {
        name: "Inspectable result",
        met: validLink || Boolean(demo.fileName),
        detail:
          validLink || demo.fileName
            ? "The submission includes an artifact a reviewer can inspect."
            : "Use a full http(s) link or attach a screenshot.",
      },
      {
        name: "Decision reflection",
        met: clearReflection,
        detail: clearReflection
          ? "The reflection explains choices and a concrete difficulty."
          : "Explain one design choice and one difficulty in at least 40 characters.",
      },
    ];
  }, [demo.fileName, demo.liveUrl, demo.reflection, demo.repoUrl]);

  const metCount = criteria.filter((criterion) => criterion.met).length;
  const progress = demo.proofAdded ? 43 : demo.reviewComplete ? 36 : 29;

  const visibleOpportunities = OPPORTUNITIES.filter(
    (opportunity) => filter === "All" || opportunity.readiness === filter,
  );

  function updateDemo(patch: Partial<DemoState>) {
    setDemo((current) => ({ ...current, ...patch }));
  }

  function finishAssessment() {
    updateDemo({
      onboarded: true,
      name: demo.name.trim() || "Thiri",
    });
    setAssessmentStep(0);
    setView("today");
    setToast("Your starting point is ready.");
  }

  function openSampleDemo() {
    setDemo(SAMPLE_STATE);
    setAssessmentStep(0);
    setView("today");
  }

  function resetDemo() {
    if (!window.confirm("Reset the prototype and return to the welcome screen?")) return;
    setDemo(DEFAULT_STATE);
    setAssessmentStep(0);
    setView("today");
    window.localStorage.removeItem(STORAGE_KEY);
  }

  function submitMission(event: React.FormEvent) {
    event.preventDefault();
    if (!demo.repoUrl && !demo.liveUrl && !demo.fileName) {
      setFormError("Add a repository, live link, or screenshot so the work can be inspected.");
      return;
    }
    setFormError("");
    setEvaluating(true);
    window.setTimeout(() => {
      setEvaluating(false);
      updateDemo({ reviewComplete: true });
      setToast("Review ready. Every finding links back to evidence.");
    }, 1300);
  }

  function addToProof() {
    updateDemo({ proofAdded: true });
    setView("proof");
    setToast("Project added privately to your Proof Profile.");
  }

  async function enableShare() {
    updateDemo({ shareEnabled: true });
    const url = `${window.location.origin}/?proof=${encodeURIComponent(
      demo.name.toLowerCase().replace(/\s+/g, "-") || "learner",
    )}-frontend`;
    try {
      await navigator.clipboard.writeText(url);
      setToast("Private proof link enabled and copied.");
    } catch {
      setToast("Private proof link enabled.");
    }
  }

  function toggleSaved(id: string) {
    const saved = demo.savedOpportunities.includes(id);
    updateDemo({
      savedOpportunities: saved
        ? demo.savedOpportunities.filter((item) => item !== id)
        : [...demo.savedOpportunities, id],
    });
    setToast(saved ? "Removed from saved opportunities." : "Saved with its current deadline.");
  }

  if (!hydrated) {
    return (
      <main className="boot-screen" aria-label="Loading Lan Pya">
        <div className="brand-mark large">LP</div>
      </main>
    );
  }

  if (!demo.onboarded) {
    return (
      <Welcome
        demo={demo}
        assessmentStep={assessmentStep}
        setAssessmentStep={setAssessmentStep}
        updateDemo={updateDemo}
        finishAssessment={finishAssessment}
        openSampleDemo={openSampleDemo}
      />
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand-lockup" onClick={() => setView("today")}>
          <span className="brand-mark">လ</span>
          <span>
            <strong>Lan Pya</strong>
            <small>From Map to Proof</small>
          </span>
        </button>

        <nav className="side-nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item, index) => (
            <button
              key={item.id}
              className={view === item.id ? "active" : ""}
              onClick={() => setView(item.id)}
            >
              <span className="nav-number">0{index + 1}</span>
              <span>
                {item.label}
                <small>{item.burmese}</small>
              </span>
            </button>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="demo-note">
            <span className="live-dot" /> Hackathon prototype
            <small>Local demo data · clearly labeled</small>
          </div>
          <button className="text-button" onClick={resetDemo}>
            Reset demo
          </button>
        </div>
      </aside>

      <main className="app-main">
        <header className="topbar">
          <div>
            <span className="eyebrow">FRONTEND DEVELOPER PATH</span>
            <strong>CSS foundations · Week 2</strong>
          </div>
          <div className="topbar-actions">
            <div className="progress-mini" aria-label={`${progress}% path progress`}>
              <span style={{ width: `${progress}%` }} />
            </div>
            <span className="progress-label">{progress}%</span>
            <button
              className="avatar"
              aria-label="Open profile"
              onClick={() => setToast("Profile settings are intentionally out of scope for this demo.")}
            >
              {getInitials(demo.name)}
            </button>
          </div>
        </header>

        {view === "today" && (
          <TodayView
            demo={demo}
            progress={progress}
            onMission={() => setView("mission")}
            onRoadmap={() => setView("roadmap")}
            onOpportunities={() => setView("opportunities")}
          />
        )}
        {view === "roadmap" && (
          <RoadmapView
            onMission={() => setView("mission")}
            onChallenge={() =>
              setToast("Placement challenge noted. The pilot team would review your evidence next.")
            }
          />
        )}
        {view === "mission" && (
          <MissionView
            demo={demo}
            updateDemo={updateDemo}
            criteria={criteria}
            metCount={metCount}
            evaluating={evaluating}
            formError={formError}
            onSubmit={submitMission}
            onAddProof={addToProof}
            onHelp={() =>
              setToast("Help request drafted. In the pilot, a cohort manager would reply here.")
            }
          />
        )}
        {view === "proof" && <ProofView demo={demo} onShare={enableShare} onMission={() => setView("mission")} />}
        {view === "opportunities" && (
          <OpportunitiesView
            filter={filter}
            setFilter={setFilter}
            opportunities={visibleOpportunities}
            expanded={expandedOpportunity}
            setExpanded={setExpandedOpportunity}
            saved={demo.savedOpportunities}
            onSave={toggleSaved}
            onMission={() => setView("mission")}
            onOpenSource={() =>
              setToast("This is a demo listing, so no external organizer page is linked.")
            }
          />
        )}
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {NAV_ITEMS.map((item, index) => (
          <button
            key={item.id}
            className={view === item.id ? "active" : ""}
            onClick={() => setView(item.id)}
          >
            <span>0{index + 1}</span>
            {item.label === "Opportunities" ? "Explore" : item.label}
          </button>
        ))}
      </nav>

      {toast && (
        <div className="toast" role="status">
          <span>✓</span> {toast}
        </div>
      )}
    </div>
  );
}

function Welcome({
  demo,
  assessmentStep,
  setAssessmentStep,
  updateDemo,
  finishAssessment,
  openSampleDemo,
}: {
  demo: DemoState;
  assessmentStep: number;
  setAssessmentStep: (step: number) => void;
  updateDemo: (patch: Partial<DemoState>) => void;
  finishAssessment: () => void;
  openSampleDemo: () => void;
}) {
  if (assessmentStep > 0) {
    return (
      <main className="assessment-shell">
        <div className="assessment-top">
          <div className="brand-lockup static">
            <span className="brand-mark">လ</span>
            <span>
              <strong>Lan Pya</strong>
              <small>လမ်းပျောက်နေရာမှ လမ်းပြပေးမယ်</small>
            </span>
          </div>
          <span className="step-count">Step {assessmentStep} of 3</span>
        </div>
        <div className="assessment-progress">
          <span style={{ width: `${(assessmentStep / 3) * 100}%` }} />
        </div>

        <section className="assessment-card">
          {assessmentStep === 1 && (
            <>
              <span className="eyebrow">LET’S START WITH YOU</span>
              <h1>Where are you starting from?</h1>
              <p>There is no wrong answer. You can change this later.</p>
              <label className="field-label" htmlFor="learner-name">
                What should we call you?
              </label>
              <input
                id="learner-name"
                className="text-input"
                value={demo.name}
                onChange={(event) => updateDemo({ name: event.target.value })}
                placeholder="Your name"
              />
              <fieldset>
                <legend>Which sounds most like you?</legend>
                <div className="choice-grid two">
                  {["High school student", "University student", "Recent graduate", "Self-learner"].map(
                    (role) => (
                      <button
                        type="button"
                        className={`choice-card ${demo.role === role ? "selected" : ""}`}
                        key={role}
                        onClick={() => updateDemo({ role })}
                      >
                        <span className="choice-check">{demo.role === role ? "✓" : ""}</span>
                        <strong>{role}</strong>
                      </button>
                    ),
                  )}
                </div>
              </fieldset>
            </>
          )}

          {assessmentStep === 2 && (
            <>
              <span className="eyebrow">A QUICK SKILL CHECK</span>
              <h1>What have you tried before?</h1>
              <p>Choose what you could explain or use today. “Not sure yet” is completely fine.</p>
              <div className="choice-grid two skill-grid">
                {["HTML", "Basic CSS", "Responsive design", "JavaScript", "Git & GitHub", "Not sure yet"].map(
                  (skill) => {
                    const selected = demo.skills.includes(skill);
                    return (
                      <button
                        type="button"
                        className={`choice-card ${selected ? "selected" : ""}`}
                        key={skill}
                        onClick={() =>
                          updateDemo({
                            skills: selected
                              ? demo.skills.filter((item) => item !== skill)
                              : skill === "Not sure yet"
                                ? [skill]
                                : [...demo.skills.filter((item) => item !== "Not sure yet"), skill],
                          })
                        }
                      >
                        <span className="choice-check">{selected ? "✓" : ""}</span>
                        <strong>{skill}</strong>
                      </button>
                    );
                  },
                )}
              </div>
              <div className="placement-note">
                <strong>How placement works</strong>
                <p>Practical evidence outranks self-reporting. You can always test into a later milestone.</p>
              </div>
            </>
          )}

          {assessmentStep === 3 && (
            <>
              <span className="eyebrow">MAKE IT REALISTIC</span>
              <h1>What can fit into your week?</h1>
              <p>Your roadmap should work with your life, not punish you for having one.</p>
              <fieldset>
                <legend>Weekly time</legend>
                <div className="choice-grid three">
                  {["2–3 hours", "4–6 hours", "7+ hours"].map((hours) => (
                    <button
                      type="button"
                      className={`choice-card centered ${demo.weeklyHours === hours ? "selected" : ""}`}
                      key={hours}
                      onClick={() => updateDemo({ weeklyHours: hours })}
                    >
                      <strong>{hours}</strong>
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="result-preview">
                <div className="result-icon">03</div>
                <div>
                  <span className="eyebrow">RECOMMENDED START</span>
                  <h2>CSS foundations</h2>
                  <p>
                    You already know basic HTML. Start here, then prove it with a responsive profile card.
                  </p>
                </div>
              </div>
            </>
          )}

          <div className="assessment-actions">
            <button
              className="button ghost"
              onClick={() => setAssessmentStep(Math.max(1, assessmentStep - 1))}
              disabled={assessmentStep === 1}
            >
              Back
            </button>
            {assessmentStep < 3 ? (
              <button className="button primary" onClick={() => setAssessmentStep(assessmentStep + 1)}>
                Continue <span>→</span>
              </button>
            ) : (
              <button className="button primary" onClick={finishAssessment}>
                Open my roadmap <span>→</span>
              </button>
            )}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="welcome-shell">
      <header className="welcome-nav">
        <div className="brand-lockup static light">
          <span className="brand-mark">လ</span>
          <span>
            <strong>Lan Pya</strong>
            <small>လမ်းပြ</small>
          </span>
        </div>
        <span className="prototype-pill"><i /> Hackathon prototype</span>
      </header>

      <section className="welcome-hero">
        <div className="hero-copy">
          <span className="hero-kicker">CAREER CLARITY FOR MYANMAR YOUTH</span>
          <h1>
            Stop collecting advice.<br />
            Start building <em>proof.</em>
          </h1>
          <p>
            Lan Pya turns one career goal into a clear next step, real work, trusted feedback, and an opportunity you can act on.
          </p>
          <div className="hero-actions">
            <button className="button gold" onClick={() => setAssessmentStep(1)}>
              Map my starting point <span>→</span>
            </button>
            <button className="button quiet-light" onClick={openSampleDemo}>
              Open ready-made demo
            </button>
          </div>
          <div className="hero-trust">
            <span>Free prototype</span>
            <span>No opaque career score</span>
            <span>Private by default</span>
          </div>
        </div>

        <div className="proof-window" aria-label="Example Lan Pya proof journey">
          <div className="window-bar">
            <span /> <span /> <span />
            <small>THIRI’S NEXT STEP</small>
          </div>
          <div className="window-body">
            <span className="mini-label">THIS WEEK</span>
            <h2>Build a responsive profile card</h2>
            <p>Turn HTML + CSS into one inspectable piece of work.</p>
            <div className="window-progress"><span /></div>
            <div className="proof-stages">
              <div className="done"><b>01</b><span>Choose<small>Starting point</small></span></div>
              <div className="active"><b>02</b><span>Build<small>Real mission</small></span></div>
              <div><b>03</b><span>Prove<small>Evidence + rubric</small></span></div>
              <div><b>04</b><span>Connect<small>Ready opportunity</small></span></div>
            </div>
            <div className="window-evidence">
              <span className="evidence-mark">✓</span>
              <div><strong>Evidence, not just a badge</strong><small>Every claim links to the work and review method.</small></div>
            </div>
          </div>
        </div>
      </section>

      <section className="journey-strip" aria-label="Lan Pya product loop">
        {[
          ["01", "Choose", "Find your honest starting point"],
          ["02", "Build", "Complete one real-world mission"],
          ["03", "Prove", "Get transparent, evidence-linked feedback"],
          ["04", "Connect", "See opportunities and readiness gaps"],
        ].map(([number, label, detail]) => (
          <article key={number}>
            <span>{number}</span>
            <div><strong>{label}</strong><p>{detail}</p></div>
          </article>
        ))}
      </section>

      <section className="screen-board">
        <div className="screen-board-copy">
          <span className="hero-kicker">ONE CONNECTED EXPERIENCE</span>
          <h2>From first question to proof you can share.</h2>
          <p>
            The prototype keeps the dashboard, roadmap, task review, opportunities, and portfolio in one consistent workspace—so progress never disappears between tools.
          </p>
          <button className="button gold" onClick={openSampleDemo}>Explore these screens <span>→</span></button>
        </div>
        <figure>
          {/* The user-supplied concept board is intentionally shown intact as source material. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/lan-pya-screen-board.png"
            alt="Lan Pya screen system showing the landing page, onboarding, dashboard, roadmap, task review, opportunities, and portfolio"
          />
          <figcaption>Original concept board · translated into the interactive prototype</figcaption>
        </figure>
      </section>
    </main>
  );
}

function TodayView({
  demo,
  progress,
  onMission,
  onRoadmap,
  onOpportunities,
}: {
  demo: DemoState;
  progress: number;
  onMission: () => void;
  onRoadmap: () => void;
  onOpportunities: () => void;
}) {
  return (
    <div className="page today-page">
      <section className="page-intro today-intro">
        <div>
          <span className="eyebrow">မင်္ဂလာပါ, {demo.name}</span>
          <h1>One useful move today.</h1>
          <p>Your roadmap is wide. Your next step should be clear.</p>
        </div>
        <button className="button ghost compact" onClick={onRoadmap}>View full roadmap</button>
      </section>

      <section className="stat-strip" aria-label="Learning snapshot">
        <article><span>Level</span><strong>3</strong><small>CSS explorer</small></article>
        <article><span>Proof XP</span><strong>{demo.proofAdded ? "840" : "620"}</strong><small>{demo.proofAdded ? "+220 from evidence" : "Next proof +220"}</small></article>
        <article><span>Learning rhythm</span><strong>4 days</strong><small>Built from activity—not pressure</small></article>
        <article><span>Path progress</span><strong>{progress}%</strong><small>Frontend foundation</small></article>
      </section>

      <section className="next-action-card">
        <div className="next-action-copy">
          <div className="card-topline"><span className="status-dot active" /> YOUR NEXT PROOF</div>
          <h2>{demo.reviewComplete ? "Review your evidence" : "Build a responsive profile card"}</h2>
          <p>
            {demo.reviewComplete
              ? "Your prototype review is ready. Inspect each criterion before adding the work to your private profile."
              : "Use HTML and CSS to turn a student profile into a clear, mobile-friendly interface."}
          </p>
          <div className="meta-row">
            <span>60–90 min</span>
            <span>CSS foundations</span>
            <span>Creates proof</span>
          </div>
          <button className="button primary" onClick={onMission}>
            {demo.reviewComplete ? "Open review" : "Continue mission"} <span>→</span>
          </button>
        </div>
        <div className="next-action-aside">
          <span className="aside-label">WHY THIS, NOW?</span>
          <p>You already know basic HTML. This mission tests whether your CSS can communicate structure on any screen.</p>
          <div className="signal-row"><span>Evidence used</span><strong>HTML check + self-report</strong></div>
          <div className="signal-row"><span>Confidence</span><strong>Medium · changeable</strong></div>
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="panel progress-panel">
          <div className="panel-heading">
            <div><span className="eyebrow">YOUR PATH</span><h3>Frontend Developer</h3></div>
            <strong>{progress}%</strong>
          </div>
          <div className="big-progress"><span style={{ width: `${progress}%` }} /></div>
          <div className="mini-roadmap">
            <div className="complete"><b>✓</b><span>HTML<small>Proof added</small></span></div>
            <i />
            <div className="active"><b>03</b><span>CSS<small>In progress</small></span></div>
            <i />
            <div><b>04</b><span>Responsive<small>Up next</small></span></div>
          </div>
          <button className="link-button" onClick={onRoadmap}>See all 7 milestones <span>→</span></button>
        </section>

        <section className="panel opportunity-preview">
          <div className="panel-heading">
            <div><span className="eyebrow">CLOSING SOON</span><h3>Ready opportunity</h3></div>
            <span className="readiness ready">Ready now</span>
          </div>
          <span className="opportunity-type">CHALLENGE</span>
          <h4>Junior Frontend Build Challenge</h4>
          <p>NexaLabs Myanmar · Remote</p>
          <div className="deadline-row"><span>Deadline</span><strong>18 Aug 2026</strong></div>
          <button className="button outline full" onClick={onOpportunities}>See why you match <span>→</span></button>
        </section>
      </div>

      <section className="achievement-strip">
        <div className="panel-heading">
          <div><span className="eyebrow">RECENT SIGNALS</span><h3>Progress worth explaining</h3></div>
          <small>Evidence first, points second</small>
        </div>
        <div className="achievement-list">
          <article><span className="achievement-icon html">H</span><div><strong>HTML foundation</strong><small>Knowledge check complete</small></div></article>
          <article><span className="achievement-icon rhythm">4</span><div><strong>Learning rhythm</strong><small>Four active days</small></div></article>
          <article><span className="achievement-icon proof">P</span><div><strong>{demo.proofAdded ? "First proof added" : "Proof within reach"}</strong><small>{demo.proofAdded ? "Private profile updated" : "Finish Mission 03"}</small></div></article>
        </div>
      </section>

      <section className="trust-banner">
        <div className="trust-icon">↗</div>
        <div>
          <span className="eyebrow">HONEST BY DESIGN</span>
          <h3>Your work stays private until you choose to share it.</h3>
          <p>Automated feedback is a developmental signal, not an employer guarantee. Every trust label names who reviewed what.</p>
        </div>
      </section>
    </div>
  );
}

function RoadmapView({
  onMission,
  onChallenge,
}: {
  onMission: () => void;
  onChallenge: () => void;
}) {
  return (
    <div className="page roadmap-page">
      <section className="page-intro">
        <div>
          <span className="eyebrow">YOUR MAP</span>
          <h1>Frontend Developer</h1>
          <p>Seven milestones. Every milestone ends in something another person can inspect.</p>
        </div>
        <div className="pace-card"><span>Weekly pace</span><strong>4–6 hours</strong><small>Change anytime</small></div>
      </section>

      <section className="roadmap-layout">
        <div className="roadmap-list">
          {MILESTONES.map((milestone, index) => (
            <article className={`milestone ${milestone.status}`} key={milestone.title}>
              <div className="milestone-node">{milestone.status === "complete" ? "✓" : String(index + 1).padStart(2, "0")}</div>
              <div className="milestone-line" />
              <div className="milestone-content">
                <div className="milestone-heading">
                  <div><span>{milestone.status === "active" ? "CURRENT MILESTONE" : `MILESTONE ${index + 1}`}</span><h3>{milestone.title}</h3></div>
                  <span className={`milestone-status ${milestone.status}`}>{milestone.status === "complete" ? "Complete" : milestone.status === "active" ? "In progress" : milestone.status === "next" ? "Next" : "Upcoming"}</span>
                </div>
                <p>{milestone.subtitle}</p>
                <div className="proof-output"><span>Proof output</span><strong>{milestone.proof}</strong></div>
                {milestone.status === "active" && <button className="button primary compact" onClick={onMission}>Open current mission <span>→</span></button>}
              </div>
            </article>
          ))}
        </div>

        <aside className="roadmap-aside">
          <span className="eyebrow">PLACEMENT NOTE</span>
          <h3>Why you started at CSS</h3>
          <p>Your HTML knowledge check passed, while responsive layout evidence is still missing.</p>
          <dl><div><dt>Evidence</dt><dd>HTML check</dd></div><div><dt>Signal</dt><dd>Basic CSS self-report</dd></div><div><dt>Override</dt><dd>Available</dd></div></dl>
          <button className="link-button" onClick={onChallenge}>Challenge this placement <span>→</span></button>
        </aside>
      </section>
    </div>
  );
}

function MissionView({
  demo,
  updateDemo,
  criteria,
  metCount,
  evaluating,
  formError,
  onSubmit,
  onAddProof,
  onHelp,
}: {
  demo: DemoState;
  updateDemo: (patch: Partial<DemoState>) => void;
  criteria: { name: string; met: boolean; detail: string }[];
  metCount: number;
  evaluating: boolean;
  formError: string;
  onSubmit: (event: React.FormEvent) => void;
  onAddProof: () => void;
  onHelp: () => void;
}) {
  return (
    <div className="page mission-page">
      <section className="mission-title">
        <div>
          <span className="eyebrow">MISSION 03 · CSS FOUNDATIONS</span>
          <h1>Responsive profile card</h1>
          <p>Make a student profile that feels clear on a phone and a laptop.</p>
        </div>
        <div className="mission-state"><span className="status-dot active" /> {demo.reviewComplete ? "Feedback ready" : "In progress"}</div>
      </section>

      <div className="mission-layout">
        <div className="mission-primary">
          <section className="panel brief-panel">
            <span className="eyebrow">THE BRIEF</span>
            <h2>Design for a real student, not an empty template.</h2>
            <p>Create a profile card for a Myanmar student applying to a campus club. It should communicate identity, interests, and one clear action without breaking on a 360px screen.</p>
            <div className="brief-callout"><span>Scenario</span><p>Thiri is a second-year student. She wants hackathon teammates to understand her interests and contact her quickly.</p></div>
            <h3>Required outcome</h3>
            <ul className="requirement-list">
              <li><span>01</span>Semantic structure with a clear heading order</li>
              <li><span>02</span>Responsive layout from 360px to desktop</li>
              <li><span>03</span>Readable contrast and visible keyboard focus</li>
              <li><span>04</span>One working contact or portfolio action</li>
            </ul>
          </section>

          <form className="panel submission-panel" onSubmit={onSubmit}>
            <div className="panel-heading">
              <div><span className="eyebrow">YOUR EVIDENCE</span><h2>Submit a version for review</h2></div>
              <span className="private-label">Private</span>
            </div>
            <p className="section-help">Links and files stay private until you explicitly enable sharing.</p>

            <div className="form-grid">
              <label><span>Live URL</span><input className="text-input" type="url" placeholder="https://your-project.example" value={demo.liveUrl} onChange={(event) => updateDemo({ liveUrl: event.target.value })} /></label>
              <label><span>Repository URL</span><input className="text-input" type="url" placeholder="https://github.com/you/project" value={demo.repoUrl} onChange={(event) => updateDemo({ repoUrl: event.target.value })} /></label>
            </div>

            <label className="upload-field">
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => updateDemo({ fileName: event.target.files?.[0]?.name || "" })} />
              <span className="upload-icon">＋</span>
              <strong>{demo.fileName || "Add a screenshot"}</strong>
              <small>{demo.fileName ? "Stored for this local demo only" : "PNG, JPG, or WebP · prototype does not upload"}</small>
            </label>

            <label><span className="field-label">Decision reflection</span><textarea className="text-input textarea" placeholder="What choice did you make, what was difficult, and what would you improve?" value={demo.reflection} onChange={(event) => updateDemo({ reflection: event.target.value })} /></label>

            <div className="check-row"><input id="ai-disclosure" type="checkbox" checked={demo.aiDisclosure} onChange={(event) => updateDemo({ aiDisclosure: event.target.checked })} /><label htmlFor="ai-disclosure"><strong>I used AI or another assistant</strong><small>This is not cheating. Reviewers care whether you understand and can defend the work.</small></label></div>

            {formError && <div className="form-error" role="alert">{formError}</div>}

            <div className="submission-actions">
              <span>Draft saved on this device</span>
              <button className="button primary" type="submit" disabled={evaluating}>
                {evaluating ? "Reviewing evidence…" : demo.reviewComplete ? "Run review again" : "Submit for prototype review"}
              </button>
            </div>
          </form>

          {evaluating && (
            <section className="evaluation-loading" aria-live="polite">
              <div className="loading-bars"><span /><span /><span /></div>
              <div><strong>Checking evidence safely</strong><p>Validating links, applying the published rubric, and preparing cited feedback.</p></div>
            </section>
          )}

          {demo.reviewComplete && !evaluating && (
            <section className="review-card">
              <div className="review-heading">
                <div><span className="eyebrow">PROTOTYPE REVIEW · DEVELOPMENTAL SIGNAL</span><h2>{metCount === 3 ? "Meets this mission standard" : "A strong start with clear next steps"}</h2></div>
                <div className="criteria-count"><strong>{metCount}/3</strong><span>criteria met</span></div>
              </div>
              <div className="demo-disclaimer"><strong>Honest prototype label:</strong> This review uses simple deterministic checks and simulated AI-style feedback. It is not expert verification.</div>
              <div className="criteria-list">
                {criteria.map((criterion) => (
                  <div key={criterion.name} className={criterion.met ? "met" : "not-yet"}>
                    <span>{criterion.met ? "✓" : "↗"}</span>
                    <div><strong>{criterion.name}</strong><p>{criterion.detail}</p></div>
                    <b>{criterion.met ? "Met" : "Not yet"}</b>
                  </div>
                ))}
              </div>
              <div className="review-footer">
                <p><strong>Evidence trail:</strong> Submission v1 · Mission rubric v1.2 · Prototype reviewer · {new Date().toLocaleDateString("en-GB")}</p>
                <button className="button gold dark-text" onClick={onAddProof}>Add privately to Proof Profile <span>→</span></button>
              </div>
            </section>
          )}
        </div>

        <aside className="mission-aside">
          <section className="rubric-card">
            <span className="eyebrow">PUBLISHED RUBRIC</span>
            <h3>What reviewers inspect</h3>
            {["Structure communicates meaning", "Layout adapts without overflow", "Interaction remains usable", "Reflection shows understanding"].map((item, index) => <div key={item}><span>0{index + 1}</span><p>{item}</p></div>)}
            <small>Rubric version 1.2 · updated 09 Aug</small>
          </section>
          <section className="help-card"><span>Stuck?</span><h3>A human fallback is part of the product.</h3><p>For the pilot, a cohort manager can help with tools, uploads, or unclear feedback.</p><button className="button outline full" type="button" onClick={onHelp}>Ask for help</button></section>
        </aside>
      </div>
    </div>
  );
}

function ProofView({ demo, onShare, onMission }: { demo: DemoState; onShare: () => void; onMission: () => void }) {
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  return (
    <div className="page proof-page">
      <section className="page-intro">
        <div><span className="eyebrow">PROOF PROFILE</span><h1>Evidence that travels with you.</h1><p>Your work is private by default. Share only the project and claims you choose.</p></div>
        {demo.proofAdded && <button className="button primary" onClick={onShare}>{demo.shareEnabled ? "Copy private link" : "Enable private link"} <span>↗</span></button>}
      </section>

      {!demo.proofAdded ? (
        <section className="empty-proof">
          <div className="empty-proof-number">01</div>
          <span className="eyebrow">YOUR FIRST PROOF IS CLOSE</span>
          <h2>Finish the responsive profile mission.</h2>
          <p>Once reviewed, you can add the project privately and decide if or when to share it.</p>
          <button className="button primary" onClick={onMission}>Open mission <span>→</span></button>
        </section>
      ) : (
        <div className="proof-layout">
          <section className="public-profile-card">
            <div className="profile-cover"><span>FRONTEND PATH · MYANMAR</span><b>LP / PROOF 001</b></div>
            <div className="profile-identity"><div className="profile-avatar">{getInitials(demo.name)}</div><div><h2>{demo.name}</h2><p>{demo.role} building toward a Frontend Developer role.</p></div><span className="visibility-badge">{demo.shareEnabled ? "Link enabled" : "Private"}</span></div>
            <div className="profile-stats"><div><strong>1</strong><span>Project proof</span></div><div><strong>3</strong><span>Skills evidenced</span></div><div><strong>43%</strong><span>Path progress</span></div></div>
            <div className="profile-project">
              <div className="project-visual"><span>360</span><div><i /><i /><i /></div><small>RESPONSIVE</small></div>
              <div className="project-copy"><span className="eyebrow">CSS FOUNDATIONS · MISSION 03</span><h3>Responsive student profile</h3><p>A mobile-first profile card designed for a student seeking hackathon teammates.</p><div className="skill-tags"><span>Semantic HTML</span><span>Responsive CSS</span><span>Accessibility</span></div></div>
            </div>
            <div className="verification-record">
              <div className="verification-mark">A</div>
              <div><span className="eyebrow">AUTOMATED REVIEW · PROTOTYPE</span><h3>Developmental evidence record</h3><p>Criteria, artifacts, evaluator type, and version history remain inspectable.</p></div>
              <button onClick={() => setEvidenceOpen((current) => !current)}>{evidenceOpen ? "Hide evidence ↑" : "View evidence →"}</button>
            </div>
            {evidenceOpen && (
              <div className="evidence-detail" aria-live="polite">
                <div><span>Artifact</span><strong>{demo.fileName || demo.liveUrl || demo.repoUrl || "Responsive profile submission"}</strong></div>
                <div><span>Evaluation</span><strong>Deterministic prototype review</strong></div>
                <div><span>Rubric</span><strong>CSS foundations · v1.2</strong></div>
                <div><span>Trust label</span><strong>Developmental signal—not expert verification</strong></div>
              </div>
            )}
          </section>

          <aside className="proof-controls">
            <section><span className="eyebrow">SHARING CONTROL</span><h3>{demo.shareEnabled ? "Private link enabled" : "Still private"}</h3><p>{demo.shareEnabled ? "Anyone with the link can see only this proof packet. Revoke it at any time." : "Nothing is public. Preview what an employer would see before enabling a link."}</p><button className="button outline full" onClick={onShare}>{demo.shareEnabled ? "Copy link again" : "Preview and enable"}</button></section>
            <section className="proof-contents"><span className="eyebrow">INCLUDED</span>{["Selected project artifact", "Criterion-level review", "Evaluator type and date", "Rubric version"].map((item) => <p key={item}><span>✓</span>{item}</p>)}<span className="eyebrow omitted">OMITTED BY DEFAULT</span>{["Diagnostic answers", "Demographic fields", "Private drafts"].map((item) => <p className="muted" key={item}><span>—</span>{item}</p>)}</section>
          </aside>
        </div>
      )}
    </div>
  );
}

function OpportunitiesView({
  filter,
  setFilter,
  opportunities,
  expanded,
  setExpanded,
  saved,
  onSave,
  onMission,
  onOpenSource,
}: {
  filter: string;
  setFilter: (filter: string) => void;
  opportunities: Opportunity[];
  expanded: string | null;
  setExpanded: (id: string | null) => void;
  saved: string[];
  onSave: (id: string) => void;
  onMission: () => void;
  onOpenSource: () => void;
}) {
  return (
    <div className="page opportunities-page">
      <section className="page-intro">
        <div><span className="eyebrow">OPPORTUNITY READINESS</span><h1>See the door and the distance.</h1><p>We never hide a relevant opportunity. We show what is known, what is missing, and what you can do next.</p></div>
        <div className="freshness"><span className="live-dot" /><div><strong>5 listings checked</strong><small>Latest check: today</small></div></div>
      </section>

      <div className="filter-row" role="group" aria-label="Filter by readiness">
        {["All", "Ready now", "Build toward", "Explore"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}<span>{item === "All" ? OPPORTUNITIES.length : OPPORTUNITIES.filter((opportunity) => opportunity.readiness === item).length}</span></button>)}
      </div>

      <div className="opportunity-list">
        {opportunities.map((opportunity) => {
          const isExpanded = expanded === opportunity.id;
          const isSaved = saved.includes(opportunity.id);
          return (
            <article className={`opportunity-card ${isExpanded ? "expanded" : ""}`} key={opportunity.id}>
              <div className="opportunity-main">
                <div className="opportunity-date"><span>{opportunity.deadline.split(" ")[0]}</span><strong>{opportunity.deadline.split(" ")[1]}</strong><small>{opportunity.deadline.split(" ")[2]}</small></div>
                <div className="opportunity-copy"><div className="opportunity-labels"><span className="opportunity-type">{opportunity.type.toUpperCase()}</span><span className={`readiness ${readinessClass(opportunity.readiness)}`}>{opportunity.readiness}</span></div><h2>{opportunity.title}</h2><p>{opportunity.org} · {opportunity.location}</p>{opportunity.gaps.length > 0 && <div className="gap-row"><span>Missing:</span>{opportunity.gaps.map((gap) => <b key={gap}>{gap}</b>)}</div>}</div>
                <div className="opportunity-actions"><strong>{opportunity.match}</strong><button className="button outline compact" onClick={() => setExpanded(isExpanded ? null : opportunity.id)}>{isExpanded ? "Close" : "View fit"}</button><button className={`save-button ${isSaved ? "saved" : ""}`} onClick={() => onSave(opportunity.id)} aria-label={isSaved ? "Remove saved opportunity" : "Save opportunity"}>{isSaved ? "Saved" : "Save"}</button></div>
              </div>
              {isExpanded && <div className="opportunity-details"><div><span className="eyebrow">WHY IT FITS</span><p>{opportunity.description}</p><small>{opportunity.source}</small></div>{opportunity.readiness === "Build toward" ? <button className="button primary" onClick={onMission}>Work on nearest gap <span>→</span></button> : <button className="button primary" onClick={onOpenSource}>Open original source <span>↗</span></button>}</div>}
            </article>
          );
        })}
      </div>

      <section className="opportunity-principle"><span>Not eligible yet?</span><p>Lan Pya treats “not yet” as a route, not a rejection. Unknown requirements stay visible and no sensitive trait is inferred.</p></section>
    </div>
  );
}
