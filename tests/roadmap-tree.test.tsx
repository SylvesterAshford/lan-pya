import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RoadmapTree } from "@/components/app/roadmap-tree";
import { FRONTEND_MILESTONES } from "@/lib/domain/demo-data";
import { CAREER_TRACKS, mergeTrackMilestones } from "@/lib/domain/career-tracks";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) =>
    <a href={href} {...props}>{children}</a>,
}));

afterEach(() => cleanup());

// ─── helpers ──────────────────────────────────────────────────────────────────

function trackMilestones(key: string) {
  return CAREER_TRACKS.find((t) => t.key === key)!.milestones;
}

/** Stage nodes on the canvas are the only buttons that open the step dialog,
 *  which separates them from toolbar actions like "Jump to my position". */
function stageNodes() {
  return screen.getAllByRole("button").filter((b) => b.getAttribute("aria-haspopup") === "dialog");
}

function stageNode(name: RegExp | string) {
  return screen.getByRole("button", { name });
}

/** Click a stage node and return the dialog it opened. */
function openStage(name: RegExp | string) {
  fireEvent.click(stageNode(name));
  return screen.getByRole("dialog");
}

// ─── where am I ───────────────────────────────────────────────────────────────

// The canvas used to draw the in-progress stage with the same fill as the nine
// stages after it, separated only by a ring at 55% opacity. These lock in the
// replacement: position is carried by state classes and by the accessible
// name, so it survives greyscale and reaches a screen reader.
describe("RoadmapTree — current position", () => {
  it("marks exactly one stage as active, and it is the active milestone", () => {
    render(<RoadmapTree milestones={FRONTEND_MILESTONES} />);
    const active = stageNodes().filter((n) => n.classList.contains("active"));
    expect(active).toHaveLength(1);
    const expected = FRONTEND_MILESTONES.find((m) => m.status === "active")!;
    expect(active[0].getAttribute("aria-label")).toContain(expected.title);
  });

  it("says 'You are here' in the current stage's accessible name, and nowhere else", () => {
    render(<RoadmapTree milestones={FRONTEND_MILESTONES} />);
    const named = stageNodes().filter((n) => /You are here/i.test(n.getAttribute("aria-label") ?? ""));
    expect(named).toHaveLength(1);
    expect(named[0].classList.contains("active")).toBe(true);
  });

  it("gives the active, next and upcoming stages three distinct states", () => {
    render(<RoadmapTree milestones={FRONTEND_MILESTONES} />);
    // Read the attribute, not `.className`: on an SVG element that property is
    // an SVGAnimatedString rather than a string, so `toContain` sees no match.
    const classOf = (status: string) => {
      const m = FRONTEND_MILESTONES.find((x) => x.status === status)!;
      return stageNode(new RegExp(m.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")).getAttribute("class") ?? "";
    };
    // "next" used to collapse into "upcoming", leaving the one stage a learner
    // should start next with no drawing of its own.
    expect(classOf("active")).toContain("active");
    expect(classOf("next")).toContain("next");
    expect(classOf("upcoming")).toContain("todo");
    expect(classOf("next")).not.toContain("todo");
  });
});

// ─── phase grouping ───────────────────────────────────────────────────────────

describe("RoadmapTree — phases", () => {
  it("names the stage's phase in its accessible name", () => {
    render(<RoadmapTree milestones={FRONTEND_MILESTONES} />);
    const first = FRONTEND_MILESTONES[0];
    expect(stageNode(new RegExp(first.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")).getAttribute("aria-label"))
      .toContain(first.phase!);
  });

  it("draws one band per run of consecutive stages sharing a phase", () => {
    const { container } = render(<RoadmapTree milestones={FRONTEND_MILESTONES} />);
    const distinct = new Set(FRONTEND_MILESTONES.map((m) => m.phase));
    expect(container.querySelectorAll(".rm-phase")).toHaveLength(distinct.size);
    // Exactly one band is lit: the one holding the stage you are on.
    expect(container.querySelectorAll(".rm-phase.lit")).toHaveLength(1);
  });
});

// ─── the dialog contract ──────────────────────────────────────────────────────

describe("RoadmapTree — step brief dialog", () => {
  it("renders no dialog until a node is clicked", () => {
    render(<RoadmapTree milestones={FRONTEND_MILESTONES} />);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(stageNodes().every((node) => node.getAttribute("aria-expanded") === "false")).toBe(true);
  });

  it("is a modal named by the step title", () => {
    render(<RoadmapTree milestones={FRONTEND_MILESTONES} />);
    const dialog = openStage(/JavaScript programming/i);
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName("JavaScript programming");
    expect(stageNode(/JavaScript programming/i)).toHaveAttribute("aria-expanded", "true");
  });

  it("moves focus into the dialog on open and back to the node on close", () => {
    render(<RoadmapTree milestones={FRONTEND_MILESTONES} />);
    const node = stageNode(/JavaScript programming/i);
    fireEvent.click(node);
    const dialog = screen.getByRole("dialog");
    expect(dialog.contains(document.activeElement)).toBe(true);

    fireEvent.click(within(dialog).getByRole("button", { name: /close/i }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(node);
  });

  it("closes on Escape and returns focus to the node", () => {
    render(<RoadmapTree milestones={FRONTEND_MILESTONES} />);
    const node = stageNode(/Git and collaboration/i);
    fireEvent.click(node);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(node);
  });

  it("closes when the scrim is clicked", () => {
    const { container } = render(<RoadmapTree milestones={FRONTEND_MILESTONES} />);
    openStage(/JavaScript programming/i);
    fireEvent.click(container.querySelector(".roadmap-detail-overlay")!);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("traps Tab inside the dialog", () => {
    render(<RoadmapTree milestones={FRONTEND_MILESTONES} />);
    const dialog = openStage(/JavaScript programming/i);
    const focusables = Array.from(dialog.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"));
    expect(focusables.length).toBeGreaterThan(0);

    // From the dialog container, Tab lands on the first control inside it.
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(focusables[0]);

    // From the last control, Tab wraps rather than escaping to the page.
    focusables[focusables.length - 1].focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(focusables[0]);

    // Shift+Tab from the first control wraps backwards.
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(focusables[focusables.length - 1]);
  });

  it("locks the page behind the dialog and releases it on close", () => {
    render(<RoadmapTree milestones={FRONTEND_MILESTONES} />);
    openStage(/JavaScript programming/i);
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(document.body.style.overflow).toBe("");
  });

  it("carries no aria-live region — the dialog announces itself", () => {
    const { container } = render(<RoadmapTree milestones={FRONTEND_MILESTONES} />);
    openStage(/JavaScript programming/i);
    expect(container.querySelector("[aria-live]")).toBeNull();
  });
});

// ─── Frontend track ───────────────────────────────────────────────────────────

describe("RoadmapTree — Frontend track", () => {
  it("renders all 12 milestones", () => {
    render(<RoadmapTree milestones={FRONTEND_MILESTONES} />);
    expect(stageNodes().length).toBe(12);
  });

  it("opens milestone details and stores the selected step in the URL", () => {
    window.history.replaceState(null, "", "/en/app/roadmap");
    render(<RoadmapTree milestones={FRONTEND_MILESTONES} />);

    const dialog = openStage(/JavaScript programming/i);
    expect(within(dialog).getByRole("heading", { name: "JavaScript programming" })).toBeInTheDocument();
    // Branch skills live only here on a phone, where the canvas drops them.
    expect(within(dialog).getByText("DOM & events")).toBeInTheDocument();
    expect(window.location.hash).toBe("#milestone-javascript");
  });

  it("shows the proof target for the selected milestone", () => {
    render(<RoadmapTree milestones={FRONTEND_MILESTONES} />);
    const dialog = openStage(/TypeScript and frontend tooling/i);
    expect(within(dialog).getByText("Typed application refactor")).toBeInTheDocument();
  });

  it("shows progress bar reflecting completed milestones", () => {
    render(<RoadmapTree milestones={FRONTEND_MILESTONES} />);
    // Steps 1–2 are complete out of 12 → 17%
    const progressbar = screen.getByRole("progressbar");
    expect(Number(progressbar.getAttribute("aria-valuenow"))).toBe(Math.round((2 / 12) * 100));
  });

  it("aria-label on the canvas section is generic (not track-specific)", () => {
    render(<RoadmapTree milestones={FRONTEND_MILESTONES} />);
    expect(screen.getByRole("region", { name: "Learning roadmap" })).toBeInTheDocument();
  });
});

// ─── Burmese ──────────────────────────────────────────────────────────────────

describe("RoadmapTree — Burmese", () => {
  it("labels the close control and renders Myanmar digits in the dialog", () => {
    render(<RoadmapTree locale="my" milestones={FRONTEND_MILESTONES} />);
    const dialog = openStage(/JavaScript programming/i);
    expect(within(dialog).getByRole("button", { name: "အဆင့်အသေးစိတ် ပိတ်မည်" })).toBeInTheDocument();
    // Step 4 of 12 → "၄/၁၂", and the eyebrow pads to "၀၄".
    expect(within(dialog).getByText(/၀၄/)).toBeInTheDocument();
    expect(within(dialog).getByText(/၄\/၁၂/)).toBeInTheDocument();
  });
});

// ─── Full-Stack track ─────────────────────────────────────────────────────────

describe("RoadmapTree — Full-Stack track", () => {
  const milestones = trackMilestones("full-stack-developer");

  it("renders all 14 milestones", () => {
    render(<RoadmapTree milestones={milestones} />);
    expect(stageNodes().length).toBe(14);
  });

  it("shows Server-side programming milestone with correct detail", () => {
    render(<RoadmapTree milestones={milestones} />);
    const dialog = openStage(/Server-side programming/i);
    expect(within(dialog).getByRole("heading", { name: "Server-side programming" })).toBeInTheDocument();
    expect(within(dialog).getByText("Node.js fundamentals")).toBeInTheDocument();
  });

  it("shows Identity and application security milestone", () => {
    render(<RoadmapTree milestones={milestones} />);
    expect(within(openStage(/Identity and application security/i)).getByText("OWASP risks")).toBeInTheDocument();
  });

  it("shows Observability, performance and scale milestone", () => {
    render(<RoadmapTree milestones={milestones} />);
    expect(within(openStage(/Observability, performance and scale/i)).getByText("Logs, metrics & traces")).toBeInTheDocument();
  });
});

// ─── AI & Data Analyst track ──────────────────────────────────────────────────

describe("RoadmapTree — AI & Data track", () => {
  const milestones = trackMilestones("ai-data-analyst");

  it("renders all 13 milestones", () => {
    render(<RoadmapTree milestones={milestones} />);
    expect(stageNodes().length).toBe(13);
  });

  it("shows Statistics and probability milestone with correct detail", () => {
    render(<RoadmapTree milestones={milestones} />);
    const dialog = openStage(/Statistics and probability/i);
    expect(within(dialog).getByRole("heading", { name: "Statistics and probability" })).toBeInTheDocument();
    expect(within(dialog).getByText("Hypothesis tests")).toBeInTheDocument();
  });

  it("shows Responsible applied AI milestone", () => {
    render(<RoadmapTree milestones={milestones} />);
    const dialog = openStage(/Responsible applied AI/i);
    expect(within(dialog).getByText("LLM-assisted analysis")).toBeInTheDocument();
    expect(within(dialog).getByText("Fairness & privacy")).toBeInTheDocument();
    expect(within(dialog).getByText("Model limits")).toBeInTheDocument();
  });

  it("shows Data workflows and reproducibility milestone", () => {
    render(<RoadmapTree milestones={milestones} />);
    // Long titles wrap across two <text> elements, so textContent has no space
    // at the break. The aria-label carries the whole title — query on that.
    expect(within(openStage(/Data workflows and reproducibility/i)).getByText("ETL/ELT basics")).toBeInTheDocument();
  });
});

describe("RoadmapTree — Content Creator track", () => {
  const milestones = trackMilestones("content-creator");

  it("renders the complete five-stage creator journey", () => {
    render(<RoadmapTree milestones={milestones} />);
    expect(stageNodes()).toHaveLength(5);
    expect(within(openStage(/Audience and problem research/i)).getByRole("heading", { name: "Audience and problem research" })).toBeInTheDocument();
  });

  // The CTA used to guess a mission page from the milestone key, so every
  // stage on every track landed on one of two hardcoded missions. It now goes
  // to the climb, which centres itself on the learner's current stop.
  it("sends the learner to the climb, not to a guessed mission page", () => {
    render(<RoadmapTree milestones={milestones} />);
    const active = milestones.find((m) => m.status === "active")!;
    const dialog = openStage(new RegExp(active.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
    expect(within(dialog).getByRole("link", { name: /Continue current mission/i }))
      .toHaveAttribute("href", "/app/missions");
  });
});

// ─── mergeTrackMilestones ─────────────────────────────────────────────────────

describe("career-tracks — mergeTrackMilestones", () => {
  it("preserves catalog length for each track", () => {
    expect(mergeTrackMilestones("frontend-developer", []).length).toBe(12);
    expect(mergeTrackMilestones("full-stack-developer", []).length).toBe(14);
    expect(mergeTrackMilestones("ai-data-analyst", []).length).toBe(13);
    expect(mergeTrackMilestones("content-creator", []).length).toBe(5);
  });

  it("promotes the milestone after the active one to 'next'", () => {
    // Use ai-data-analyst: no hardcoded statuses in career-tracks.ts except step 1 = 'next'
    // Pass analytics-foundations as 'active' → analytics-foundations next step (spreadsheets) should become 'next'
    const rows = [{ key: "analytics-foundations", status: "active" as const, order: 1, title: "", description: "", proof: "" }];
    const result = mergeTrackMilestones("ai-data-analyst", rows);
    expect(result.find((m) => m.key === "analytics-foundations")?.status).toBe("active");
    expect(result.find((m) => m.key === "spreadsheets")?.status).toBe("next");
  });

  it("falls back to catalog when no progress rows are provided", () => {
    // Full-stack track has no hardcoded status overrides — first milestone is 'next' by default
    const result = mergeTrackMilestones("full-stack-developer", []);
    expect(result[0].status).toBe("next");
    expect(result[1].status).toBe("upcoming");
  });
});
