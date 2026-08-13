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

// ─── Frontend track ───────────────────────────────────────────────────────────

describe("RoadmapTree — Frontend track", () => {
  it("renders all 12 milestones", () => {
    render(<RoadmapTree milestones={FRONTEND_MILESTONES} />);
    expect(screen.getAllByRole("button").length).toBe(12);
  });

  it("opens milestone details and stores the selected step in the URL", () => {
    window.history.replaceState(null, "", "/en/app/roadmap");
    render(<RoadmapTree milestones={FRONTEND_MILESTONES} />);

    const detailPanel = document.querySelector("#roadmap-detail")!;
    // Default selection is the active milestone (responsive-css, step 3)
    expect(within(detailPanel as HTMLElement).getByRole("heading", { name: "CSS and responsive layout" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /JavaScript programming/i }));

    expect(within(detailPanel as HTMLElement).getByRole("heading", { name: "JavaScript programming" })).toBeInTheDocument();
    expect(within(detailPanel as HTMLElement).getByText("DOM & events")).toBeInTheDocument();
    expect(window.location.hash).toBe("#milestone-javascript");
  });

  it("shows the proof target for the selected milestone", () => {
    render(<RoadmapTree milestones={FRONTEND_MILESTONES} />);
    fireEvent.click(screen.getByRole("button", { name: /TypeScript and frontend tooling/i }));
    const detailPanel = document.querySelector("#roadmap-detail")!;
    expect(within(detailPanel as HTMLElement).getByText("Typed application refactor")).toBeInTheDocument();
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

// ─── Full-Stack track ─────────────────────────────────────────────────────────

describe("RoadmapTree — Full-Stack track", () => {
  const milestones = trackMilestones("full-stack-developer");

  it("renders all 14 milestones", () => {
    render(<RoadmapTree milestones={milestones} />);
    expect(screen.getAllByRole("button").length).toBe(14);
  });

  it("shows Server-side programming milestone with correct detail", () => {
    render(<RoadmapTree milestones={milestones} />);
    fireEvent.click(screen.getByRole("button", { name: /Server-side programming/i }));
    const detailPanel = document.querySelector("#roadmap-detail")!;
    expect(within(detailPanel as HTMLElement).getByRole("heading", { name: "Server-side programming" })).toBeInTheDocument();
    expect(within(detailPanel as HTMLElement).getByText("Node.js fundamentals")).toBeInTheDocument();
  });

  it("shows Identity and application security milestone", () => {
    render(<RoadmapTree milestones={milestones} />);
    fireEvent.click(screen.getByRole("button", { name: /Identity and application security/i }));
    const detailPanel = document.querySelector("#roadmap-detail")!;
    expect(within(detailPanel as HTMLElement).getByText("OWASP risks")).toBeInTheDocument();
  });

  it("shows Observability, performance and scale milestone", () => {
    render(<RoadmapTree milestones={milestones} />);
    fireEvent.click(screen.getByRole("button", { name: /Observability, performance and scale/i }));
    const detailPanel = document.querySelector("#roadmap-detail")!;
    expect(within(detailPanel as HTMLElement).getByText("Logs, metrics & traces")).toBeInTheDocument();
  });
});

// ─── AI & Data Analyst track ──────────────────────────────────────────────────

describe("RoadmapTree — AI & Data track", () => {
  const milestones = trackMilestones("ai-data-analyst");

  it("renders all 13 milestones", () => {
    render(<RoadmapTree milestones={milestones} />);
    expect(screen.getAllByRole("button").length).toBe(13);
  });

  it("shows Statistics and probability milestone with correct detail", () => {
    render(<RoadmapTree milestones={milestones} />);
    fireEvent.click(screen.getByRole("button", { name: /Statistics and probability/i }));
    const detailPanel = document.querySelector("#roadmap-detail")!;
    expect(within(detailPanel as HTMLElement).getByRole("heading", { name: "Statistics and probability" })).toBeInTheDocument();
    expect(within(detailPanel as HTMLElement).getByText("Hypothesis tests")).toBeInTheDocument();
  });

  it("shows Responsible applied AI milestone", () => {
    render(<RoadmapTree milestones={milestones} />);
    fireEvent.click(screen.getByRole("button", { name: /Responsible applied AI/i }));
    const detailPanel = document.querySelector("#roadmap-detail")!;
    expect(within(detailPanel as HTMLElement).getByText("LLM-assisted analysis")).toBeInTheDocument();
    expect(within(detailPanel as HTMLElement).getByText("Fairness, privacy & limits")).toBeInTheDocument();
  });

  it("shows Data workflows and reproducibility milestone", () => {
    render(<RoadmapTree milestones={milestones} />);
    // Use getAllByRole to handle the case where the button text wraps across the skill nodes
    const buttons = screen.getAllByRole("button");
    const dataWorkflowsBtn = buttons.find((btn) => btn.textContent?.includes("Data workflows and reproducibility"))!;
    fireEvent.click(dataWorkflowsBtn);
    const detailPanel = document.querySelector("#roadmap-detail")!;
    expect(within(detailPanel as HTMLElement).getByText("ETL/ELT basics")).toBeInTheDocument();
  });
});

describe("RoadmapTree — Content Creator track", () => {
  const milestones = trackMilestones("content-creator");

  it("renders the complete five-stage creator journey", () => {
    render(<RoadmapTree milestones={milestones} />);
    expect(screen.getAllByRole("button")).toHaveLength(5);
    expect(screen.getByRole("heading", { name: "Audience and problem research" })).toBeInTheDocument();
  });

  it("opens the creator mission from the active roadmap stage", () => {
    render(<RoadmapTree milestones={milestones} />);
    const detailPanel = document.querySelector("#roadmap-detail")!;
    expect(within(detailPanel as HTMLElement).getByRole("link", { name: /Continue current mission/i })).toHaveAttribute("href", "/app/missions/content-creator-awareness");
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
