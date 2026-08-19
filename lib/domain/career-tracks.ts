import type { CareerPathPreview, CareerTrack, Milestone } from "./types";

type StageInput = Omit<Milestone, "status">;

function stage(input: StageInput): Milestone {
  return { ...input, status: "upcoming" };
}

const FRONTEND: Milestone[] = [
  stage({ key: "orientation", order: 1, phase: "Foundations", title: "Web foundations and tools", description: "Understand how the web works and set up a dependable development environment.", proof: "Environment and web concepts check", leftLabel: "Understand", left: ["How the internet works", "HTTP & HTTPS", "DNS & domains"], rightLabel: "Use", right: ["Editor & terminal", "Browser devtools"], estimate: "1–2 weeks" }),
  stage({ key: "semantic-html", order: 2, phase: "Foundations", title: "Semantic HTML and forms", description: "Structure meaningful pages that remain usable with assistive technology.", proof: "Accessible profile page", leftLabel: "Structure", left: ["Semantic elements", "Document outline"], rightLabel: "Build", right: ["Forms & validation", "Accessible content", "ARIA basics"], estimate: "2–3 weeks" }),
  stage({ key: "responsive-css", order: 3, phase: "Building", title: "CSS and responsive layout", description: "Build clear interfaces that adapt from small phones to large screens.", proof: "Responsive profile card", leftLabel: "Style", left: ["Cascade & specificity", "Box model & spacing", "Custom properties"], rightLabel: "Layout", right: ["Flexbox & Grid", "Mobile-first design", "Container queries"], estimate: "3–4 weeks" }),
  stage({ key: "javascript", order: 4, phase: "Building", title: "JavaScript programming", description: "Use the language fundamentals that power browser interaction and application logic.", proof: "Interactive opportunity tracker", leftLabel: "Language", left: ["Data & control flow", "Functions & scope", "Modules"], rightLabel: "Browser", right: ["DOM & events", "Debugging & errors"], estimate: "5–7 weeks" }),
  stage({ key: "git-collaboration", order: 5, phase: "Building", title: "Git and collaboration", description: "Track changes, collaborate safely, and explain the history of a project.", proof: "Reviewed repository workflow", leftLabel: "Track", left: ["Commits & branches"], rightLabel: "Collaborate", right: ["Pull requests", "Merge conflicts"], estimate: "2–3 weeks" }),
  stage({ key: "async-web-apis", order: 6, phase: "Building", title: "Async JavaScript and web APIs", description: "Connect interfaces to real data and handle slow or failed network states.", proof: "Resilient data explorer", leftLabel: "Connect", left: ["Promises & async", "Fetch & REST"], rightLabel: "Handle", right: ["Loading & errors", "Storage & browser APIs"], estimate: "3–4 weeks" }),
  stage({ key: "typescript-tooling", order: 7, phase: "Engineering", title: "TypeScript and frontend tooling", description: "Make larger projects safer, consistent, and repeatable to build.", proof: "Typed application refactor", leftLabel: "Type", left: ["Types & interfaces", "Narrowing & generics"], rightLabel: "Tool", right: ["Packages & scripts", "Lint, format & build"], estimate: "3–4 weeks" }),
  stage({ key: "component-framework", order: 8, phase: "Engineering", title: "Component architecture", description: "Build reusable interfaces with a modern component framework and design system thinking.", proof: "Component-based product interface", leftLabel: "Compose", left: ["React components", "Props, state & hooks", "Composition patterns"], rightLabel: "Design", right: ["Reusable patterns", "Design system basics"], estimate: "5–7 weeks" }),
  stage({ key: "application-data", order: 9, phase: "Engineering", title: "Routing, state and application data", description: "Coordinate navigation, shared state, server data, authentication, and real-time updates.", proof: "Authenticated multi-page application", leftLabel: "Navigate", left: ["Routing & layouts", "State management", "Data caching"], rightLabel: "Integrate", right: ["Auth & permissions", "REST, GraphQL & realtime"], estimate: "5–7 weeks" }),
  stage({ key: "frontend-quality", order: 10, phase: "Production & hiring", title: "Testing, accessibility and performance", description: "Ship interfaces that are testable, inclusive, fast, and observable.", proof: "Audited production interface", leftLabel: "Verify", left: ["Unit & component tests", "End-to-end tests"], rightLabel: "Improve", right: ["WCAG accessibility", "Core Web Vitals", "Profiling"], estimate: "4–6 weeks" }),
  stage({ key: "modern-delivery", order: 11, phase: "Production & hiring", title: "Rendering and production delivery", description: "Choose suitable rendering, security, discoverability, and offline strategies.", proof: "Production-ready progressive web app", leftLabel: "Render", left: ["SSR, SSG & hydration", "SEO & metadata"], rightLabel: "Deliver", right: ["PWA & offline", "Browser security & monitoring"], estimate: "4–5 weeks" }),
  stage({ key: "hiring-capstone", order: 12, phase: "Production & hiring", title: "Portfolio and hiring capstone", description: "Combine product judgment, engineering quality, and clear communication in one credible project.", proof: "Partner-reviewed frontend capstone", leftLabel: "Prove", left: ["Product decisions", "Architecture choices"], rightLabel: "Present", right: ["Portfolio case study", "Interview practice"], estimate: "6–8 weeks" }),
];

const FULL_STACK: Milestone[] = [
  stage({ key: "fullstack-foundations", order: 1, phase: "Foundations", title: "Web and programming foundations", description: "Build a shared mental model for browsers, servers, networks, terminals, and source code.", proof: "Client-server concepts check", leftLabel: "Web", left: ["HTTP & DNS", "Browser/server model"], rightLabel: "Tools", right: ["Terminal & editor", "Git fundamentals"], estimate: "2–3 weeks" }),
  stage({ key: "fullstack-frontend", order: 2, phase: "Foundations", title: "Frontend foundations", description: "Create semantic, responsive, and interactive browser interfaces.", proof: "Responsive interactive website", leftLabel: "Core", left: ["HTML & accessibility", "CSS & responsive UI", "Layout systems"], rightLabel: "Program", right: ["JavaScript & DOM", "Forms & validation"], estimate: "6–8 weeks" }),
  stage({ key: "fullstack-tooling", order: 3, phase: "Foundations", title: "TypeScript and development workflow", description: "Use typed code, packages, branches, automation, and repeatable builds.", proof: "Typed collaborative repository", leftLabel: "Type", left: ["TypeScript", "Modules & packages"], rightLabel: "Work", right: ["Branching & reviews"], estimate: "3–4 weeks" }),
  stage({ key: "fullstack-ui", order: 4, phase: "Foundations", title: "Frontend application architecture", description: "Build component-driven applications with routing, state, and server data.", proof: "Frontend product dashboard", leftLabel: "Compose", left: ["React & components", "Routing & layouts", "Component patterns"], rightLabel: "Coordinate", right: ["State management", "Data fetching"], estimate: "6–8 weeks" }),
  stage({ key: "server-programming", order: 5, phase: "Backend & data", title: "Server-side programming", description: "Create server processes, business logic, configuration, and dependable error handling.", proof: "Node.js service", leftLabel: "Runtime", left: ["Node.js fundamentals", "Async & concurrency"], rightLabel: "Structure", right: ["Modules & services", "Errors & logging"], estimate: "5–7 weeks" }),
  stage({ key: "api-design", order: 6, phase: "Backend & data", title: "HTTP and API design", description: "Design stable interfaces between clients, services, and external systems.", proof: "Documented production API", leftLabel: "Model", left: ["REST resources", "Validation & errors", "Status codes"], rightLabel: "Operate", right: ["Pagination & versioning", "API documentation"], estimate: "4–5 weeks" }),
  stage({ key: "relational-data", order: 7, phase: "Backend & data", title: "Relational data and SQL", description: "Model durable business data and query it correctly and efficiently.", proof: "Normalized application database", leftLabel: "Model", left: ["Tables & relations", "Constraints & migrations", "Normalization"], rightLabel: "Query", right: ["SQL & joins", "Indexes & transactions", "Query planning"], estimate: "5–7 weeks" }),
  stage({ key: "data-systems", order: 8, phase: "Backend & data", title: "Caching, documents and search", description: "Choose non-relational tools only when application requirements justify them.", proof: "Measured data-system extension", leftLabel: "Store", left: ["Document databases"], rightLabel: "Accelerate", right: ["Caching", "Search & queues"], estimate: "3–5 weeks" }),
  stage({ key: "identity-security", order: 9, phase: "Quality & security", title: "Identity and application security", description: "Protect accounts, data, sessions, and privileged operations across the stack.", proof: "Security-reviewed authenticated app", leftLabel: "Identity", left: ["Sessions & tokens", "Authorization"], rightLabel: "Protect", right: ["OWASP risks", "Secrets & data privacy", "Rate limiting"], estimate: "4–6 weeks" }),
  stage({ key: "backend-quality", order: 10, phase: "Quality & security", title: "Backend architecture and quality", description: "Keep business logic maintainable with clear boundaries and automated verification.", proof: "Tested service architecture", leftLabel: "Design", left: ["Layered architecture", "Background jobs"], rightLabel: "Verify", right: ["Unit & integration tests", "Contract testing"], estimate: "4–6 weeks" }),
  stage({ key: "system-integration", order: 11, phase: "Quality & security", title: "End-to-end product integration", description: "Connect UI, API, database, files, email, and external services into one reliable product.", proof: "Integrated team application", leftLabel: "Connect", left: ["Frontend to API", "Uploads & email"], rightLabel: "Assure", right: ["End-to-end tests", "Failure recovery"], estimate: "5–7 weeks" }),
  stage({ key: "delivery-cloud", order: 12, phase: "Production & hiring", title: "Containers, delivery and cloud", description: "Package, deploy, configure, and update an application safely.", proof: "Automated staging deployment", leftLabel: "Package", left: ["Docker basics"], rightLabel: "Deliver", right: ["CI/CD", "Cloud deployment"], estimate: "4–6 weeks" }),
  stage({ key: "reliability-scale", order: 13, phase: "Production & hiring", title: "Observability, performance and scale", description: "Measure a running system and improve bottlenecks before adding complexity.", proof: "Measured reliability improvement", leftLabel: "Observe", left: ["Logs, metrics & traces", "Health & alerts"], rightLabel: "Improve", right: ["Caching & performance", "Scaling patterns"], estimate: "4–6 weeks" }),
  stage({ key: "fullstack-capstone", order: 14, phase: "Production & hiring", title: "Production full-stack capstone", description: "Own a product from user need through architecture, deployment, operations, and explanation.", proof: "Partner-reviewed production product", leftLabel: "Build", left: ["Product scope", "Technical decisions"], rightLabel: "Prove", right: ["Production operations", "Portfolio & interview"], estimate: "8–10 weeks" }),
];

const AI_DATA: Milestone[] = [
  stage({ key: "analytics-foundations", order: 1, phase: "Foundations", title: "Analytical thinking and data literacy", description: "Turn vague requests into answerable questions, measures, and responsible data decisions.", proof: "Business question analysis brief", leftLabel: "Frame", left: ["Business questions", "Metrics & dimensions"], rightLabel: "Judge", right: ["Data types & quality", "Bias & privacy"], estimate: "2–3 weeks" }),
  stage({ key: "spreadsheets", order: 2, phase: "Foundations", title: "Spreadsheets for analysis", description: "Clean, calculate, summarize, and communicate small datasets with dependable spreadsheet work.", proof: "Auditable spreadsheet report", leftLabel: "Prepare", left: ["Formulas & references", "Cleaning & validation"], rightLabel: "Analyze", right: ["Lookups & pivots", "Charts & summaries"], estimate: "3–4 weeks" }),
  stage({ key: "analyst-sql", order: 3, phase: "Query & reason", title: "SQL and relational data", description: "Retrieve, combine, aggregate, and validate structured data for real questions.", proof: "SQL analysis notebook", leftLabel: "Query", left: ["SELECT, filter & group", "Joins & subqueries", "CTEs & window functions"], rightLabel: "Control", right: ["Data modeling", "Query performance"], estimate: "5–7 weeks" }),
  stage({ key: "statistics", order: 4, phase: "Query & reason", title: "Statistics and probability", description: "Reason about variation, relationships, uncertainty, and claims without overstating results.", proof: "Statistical decision memo", leftLabel: "Describe", left: ["Distributions", "Sampling & uncertainty", "Central limit"], rightLabel: "Infer", right: ["Hypothesis tests", "Correlation & regression"], estimate: "5–7 weeks" }),
  stage({ key: "python-analysis", order: 5, phase: "Programming", title: "Python for analysis", description: "Use programming fundamentals to make repeatable data work and automate routine analysis.", proof: "Reproducible Python analysis", leftLabel: "Program", left: ["Python fundamentals", "Functions & files"], rightLabel: "Work", right: ["Notebooks & environments"], estimate: "5–7 weeks" }),
  stage({ key: "dataframes", order: 6, phase: "Programming", title: "DataFrames and data preparation", description: "Reshape, join, clean, validate, and document datasets before analysis.", proof: "Cleaned dataset with quality report", leftLabel: "Transform", left: ["Pandas operations", "Join & reshape"], rightLabel: "Assure", right: ["Missing data", "Validation & lineage"], estimate: "4–6 weeks" }),
  stage({ key: "exploratory-analysis", order: 7, phase: "Programming", title: "Exploratory data analysis", description: "Find useful patterns, anomalies, segments, and limitations through disciplined exploration.", proof: "Exploratory analysis report", leftLabel: "Explore", left: ["Summary statistics", "Segments & outliers"], rightLabel: "Explain", right: ["Assumptions & limits"], estimate: "4–5 weeks" }),
  stage({ key: "visual-story", order: 8, phase: "Communicate", title: "Visualization and data storytelling", description: "Choose honest visual encodings and explain insights for a specific audience and decision.", proof: "Decision-ready visual story", leftLabel: "Visualize", left: ["Chart selection", "Visual encoding"], rightLabel: "Communicate", right: ["Narrative structure", "Recommendations"], estimate: "3–5 weeks" }),
  stage({ key: "bi-dashboards", order: 9, phase: "Communicate", title: "Dashboards and business intelligence", description: "Design trustworthy metrics, data models, filters, and refreshable reporting experiences.", proof: "Interactive KPI dashboard", leftLabel: "Model", left: ["KPI definitions", "Dimensional modeling"], rightLabel: "Deliver", right: ["Power BI or Tableau", "Dashboard usability", "Refresh & trust"], estimate: "5–7 weeks" }),
  stage({ key: "experiments-forecasting", order: 10, phase: "Advanced & hiring", title: "Experiments and forecasting", description: "Evaluate interventions and time-based patterns using methods appropriate to the available data.", proof: "Experiment or forecast evaluation", leftLabel: "Test", left: ["A/B test design", "Causal cautions"], rightLabel: "Forecast", right: ["Time series basics", "Error & validation"], estimate: "5–7 weeks" }),
  stage({ key: "data-workflows", order: 11, phase: "Advanced & hiring", title: "Data workflows and reproducibility", description: "Move from one-off files to documented, versioned, scheduled, and testable analysis workflows.", proof: "Versioned analytics pipeline", leftLabel: "Organize", left: ["Git & project structure"], rightLabel: "Automate", right: ["ETL/ELT basics", "Tests & scheduling"], estimate: "4–6 weeks" }),
  stage({ key: "applied-ai", order: 12, phase: "Advanced & hiring", title: "Responsible applied AI", description: "Use predictive and generative systems as evaluated tools, not unexplained sources of truth.", proof: "Evaluated AI-assisted analysis", leftLabel: "Understand", left: ["ML problem types", "Training & evaluation"], rightLabel: "Apply", right: ["LLM-assisted analysis", "Fairness & privacy", "Model limits"], estimate: "5–7 weeks" }),
  stage({ key: "analyst-capstone", order: 13, phase: "Advanced & hiring", title: "Analytics portfolio capstone", description: "Answer a real stakeholder question from raw data through recommendation and reproducible evidence.", proof: "Partner-reviewed analytics case study", leftLabel: "Deliver", left: ["Question to dataset", "Analysis to decision"], rightLabel: "Present", right: ["Portfolio case study", "Case interview practice"], estimate: "7–9 weeks" }),
];

const CONTENT_CREATOR: Milestone[] = [
  stage({ key: "content-awareness-campaign", order: 1, phase: "Plan", title: "Audience and problem research", description: "Choose one specific audience, learn what they need, and turn that evidence into a useful campaign direction.", proof: "Audience and campaign brief", leftLabel: "Research", left: ["Audience interviews", "Problem evidence", "Competitor scan"], rightLabel: "Frame", right: ["Campaign goal", "Ethical boundaries"], estimate: "1–2 weeks" }),
  stage({ key: "content-story-system", order: 2, phase: "Plan", title: "Story and scripting", description: "Shape one clear message into connected pieces that fit the audience and channel.", proof: "Three-piece story and script set", leftLabel: "Write", left: ["Hook and structure", "Voice and clarity"], rightLabel: "Plan", right: ["Content series", "Call to action"], estimate: "1–2 weeks" }),
  stage({ key: "content-mobile-production", order: 3, phase: "Produce", title: "Mobile production", description: "Produce clear, platform-native content with a dependable phone-first workflow.", proof: "Published-ready visual and video drafts", leftLabel: "Capture", left: ["Framing and light", "Clean audio"], rightLabel: "Edit", right: ["Pacing and layout"], estimate: "2–3 weeks" }),
  stage({ key: "content-safe-publishing", order: 4, phase: "Produce", title: "Accessible and safe publishing", description: "Publish content people can understand and trust without hiding sources, uncertainty, or material AI assistance.", proof: "Accessible publishing checklist", leftLabel: "Include", left: ["Captions and text", "Readable structure"], rightLabel: "Protect", right: ["Source disclosure", "Consent and safety"], estimate: "1–2 weeks" }),
  stage({ key: "content-case-study", order: 5, phase: "Prove", title: "Campaign case study", description: "Package the campaign, audience evidence, decisions, results, and lessons into portfolio-ready proof.", proof: "Partner-reviewed campaign case study", leftLabel: "Measure", left: ["Useful signals", "Audience response"], rightLabel: "Explain", right: ["Decision rationale", "Portfolio narrative"], estimate: "2–3 weeks" }),
];

FRONTEND[0].status = "complete";
FRONTEND[1].status = "complete";
FRONTEND[2].status = "active";
FRONTEND[3].status = "next";
FULL_STACK[0].status = "next";
AI_DATA[0].status = "next";
CONTENT_CREATOR[0].status = "active";

export const CAREER_TRACKS: CareerTrack[] = [
  { key: "frontend-developer", title: "Frontend Developer", shortTitle: "Frontend", description: "Build accessible, responsive, production-quality web interfaces.", outcome: "From web foundations to a partner-reviewed frontend product.", milestones: FRONTEND },
  { key: "full-stack-developer", title: "Full-Stack Developer", shortTitle: "Full-Stack", description: "Build and operate complete products across browser, server, data, and cloud.", outcome: "From client-server foundations to a production full-stack system.", milestones: FULL_STACK },
  { key: "ai-data-analyst", title: "AI & Data Analyst", shortTitle: "AI & Data", description: "Turn data into responsible analysis, decisions, dashboards, and evaluated AI workflows.", outcome: "From data literacy to a partner-reviewed analytics case study.", milestones: AI_DATA },
  { key: "content-creator", title: "Content Creator & Social Media Storyteller", shortTitle: "Content Creator", description: "Explain useful ideas through clear, ethical, platform-native content.", outcome: "From audience research to a partner-reviewed campaign case study.", milestones: CONTENT_CREATOR },
];

export const DIGITAL_PATH_PREVIEWS: CareerPathPreview[] = [
  {
    key: "content-creator",
    title: "Content Creator & Social Media Storyteller",
    shortTitle: "Content Creator",
    description: "Explain useful ideas through clear, ethical, platform-native content.",
    outcome: "Build a three-piece awareness campaign that can become portfolio evidence.",
    status: "controlled_pilot",
    device: "Phone-friendly; laptop optional",
    timeToFirstProof: "1–2 weeks",
    arena: "Stories & Community",
    stages: ["Audience and problem research", "Story and scripting", "Mobile production", "Accessibility and safe publishing", "Campaign case study"],
    firstMission: "Three-piece awareness campaign",
  },
  {
    key: "video-editor",
    title: "Video Editor & Motion Content",
    shortTitle: "Video Editor",
    description: "Turn raw footage into clear, accessible stories for modern platforms.",
    outcome: "Create a thirty-second vertical story edit with captions and licensed audio.",
    status: "preview",
    device: "Phone or laptop with an editor",
    timeToFirstProof: "2–3 weeks",
    arena: "Visual Craft",
    stages: ["Editing workflow", "Cuts and pacing", "Sound and colour", "Captions and motion", "Client-ready delivery"],
    firstMission: "Thirty-second vertical story edit",
  },
  {
    key: "brand-visual-designer",
    title: "Brand & Visual Content Designer",
    shortTitle: "Visual Designer",
    description: "Solve communication problems with accessible visual systems, not isolated decoration.",
    outcome: "Build a mini campaign identity kit across five responsive formats.",
    status: "preview",
    device: "Phone or laptop with a design tool",
    timeToFirstProof: "2–3 weeks",
    arena: "Visual Craft",
    stages: ["Visual problem framing", "Type and hierarchy", "Colour and composition", "Campaign systems", "Client-ready case study"],
    firstMission: "Mini campaign identity kit",
  },
  {
    key: "digital-marketing",
    title: "Digital Marketing & Growth",
    shortTitle: "Digital Marketing",
    description: "Plan ethical, measurable campaigns without requiring learners to buy ads.",
    outcome: "Create a no-spend campaign plan with a clear audience, channel hypothesis, and measurement plan.",
    status: "preview",
    device: "Phone-friendly; laptop helpful",
    timeToFirstProof: "2–3 weeks",
    arena: "Business & Growth",
    stages: ["Customer research", "Positioning and goals", "Content strategy", "Measurement", "Growth case study"],
    firstMission: "No-spend campaign plan",
  },
];

export function getCareerTrack(trackKey: string | undefined) {
  return CAREER_TRACKS.find((track) => track.key === trackKey) ?? CAREER_TRACKS[0];
}

export function mergeTrackMilestones(trackKey: string, rows: Milestone[]) {
  const catalog = getCareerTrack(trackKey).milestones;
  if (!rows.length) return catalog;
  const statusByKey = new Map(rows.map((row) => [row.key, row.status]));
  const merged = catalog.map((item) => {
    const storedStatus = statusByKey.get(item.key);
    const keepCreatorPilotActive = trackKey === "content-creator" && item.status === "active" && storedStatus !== "complete";
    return { ...item, status: keepCreatorPilotActive ? "active" as const : storedStatus ?? item.status };
  });
  const activeIndex = merged.findIndex((item) => item.status === "active");
  if (activeIndex >= 0 && merged[activeIndex + 1]?.status === "upcoming") merged[activeIndex + 1].status = "next";
  if (activeIndex < 0 && !merged.some((item) => item.status === "complete") && merged[0]?.status === "upcoming") merged[0].status = "next";
  return merged;
}

/**
 * Track fork — Design Spec v1.1 §3.3 "The fork".
 *
 * DISPLAY ONLY. The fork renders and is announced to assistive technology, but
 * there is no schema behind it: a learner's track choice is not persisted and
 * downstream nodes are not filtered by branch. Adding that needs a migration
 * (see TODOS.md "Real fork schema"). Until then this must stay labelled as a
 * preview wherever it appears, per the honest-availability rule in PRODUCT.md.
 */
/**
 * The fork every path reaches: work at home, or work for people abroad.
 *
 * "Local", not "Yangon". The distinction is domestic versus remote-and-abroad,
 * which is true for a learner in Mandalay or Taunggyi exactly as it is in
 * Yangon; naming one city told everyone else the branch was not for them.
 *
 * It is also the default for every track rather than an entry only the
 * frontend path had. The choice is a fact about the job market, not about
 * frontend, so a path without it was simply missing the ending.
 */
const DEFAULT_FORK: { en: TrackFork; my: TrackFork } = {
  en: {
    note: "The path splits here — both stay open",
    local: { title: "Local track", subtitle: "Local jobs · Burmese-first" },
    global: { title: "Global track", subtitle: "Remote & abroad · English-first" },
  },
  my: {
    note: "ဤနေရာတွင် လမ်းခွဲသည် — နှစ်ခုစလုံး ဖွင့်ထားသည်",
    local: { title: "ပြည်တွင်း လမ်းကြောင်း", subtitle: "ပြည်တွင်းအလုပ် · မြန်မာဘာသာ ဦးစားပေး" },
    global: { title: "နိုင်ငံတကာ လမ်းကြောင်း", subtitle: "အဝေးမှ / ပြည်ပ · အင်္ဂလိပ်ဘာသာ ဦးစားပေး" },
  },
};

/** Per-track overrides, when a path's fork genuinely differs. */
const TRACK_FORKS: Record<string, { en: TrackFork; my: TrackFork }> = {};

export type TrackFork = {
  note: string;
  local: { title: string; subtitle: string };
  global: { title: string; subtitle: string };
};

export function getTrackFork(trackKey: string, locale: string): TrackFork | undefined {
  const entry = TRACK_FORKS[trackKey] ?? DEFAULT_FORK;
  return locale === "my" ? entry.my : entry.en;
}
