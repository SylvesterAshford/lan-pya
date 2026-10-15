import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { CaseStudyCard } from "@/components/proof/case-study-card";
import { ResumeBuilder } from "@/components/proof/resume-builder";
import type { ResumeProfile } from "@/components/proof/resume-sheet";
import { missionPlace } from "@/lib/domain/mission-place";
import { buildResumeDraft, displayUrl, type ResumeSource } from "@/lib/domain/resume-draft";
import { getAppCopy } from "@/lib/i18n/app-copy";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a>,
}));

beforeAll(() => {
  // jsdom has no layout; the preview only needs the observer to exist.
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
});
afterEach(() => cleanup());

const c = getAppCopy("en");

function proof(id: string, title: string, extra: Partial<ResumeSource> = {}): ResumeSource {
  return {
    id, title, verifiedAt: "2026-10-15T09:00:00Z", rubricVersion: "v1", reviewerTier: "Trained human reviewer",
    competencies: ["Semantic HTML", "Responsive CSS"], repositoryUrl: "https://github.com/thura/card", deploymentUrl: "https://www.thura-card.vercel.app/",
    state: "active", dataOrigin: "live", missionKey: "responsive-profile-card",
    stageLabel: "Stage 3 · CSS and responsive layout", stageNumber: 3, pathTitle: "Frontend Developer", verifiedLabel: "Oct 15, 2026", ...extra,
  };
}

const profile: ResumeProfile = {
  name: "Thura", email: "thura@example.com", telegram: "t.me/thura_codes", linkedin: null, facebook: null,
  pathTitle: "Frontend Developer", levelLine: "Starter learner · Level 2", stagesDone: 4, stagesTotal: 12,
};

describe("where a mission sits", () => {
  // The Portfolio once labelled every card with the active path, so the
  // Content Creator campaign read "Frontend Developer".
  it("names each mission's own path and stage", () => {
    expect(missionPlace("content-creator-awareness", "en")).toMatchObject({ pathKey: "content-creator", stage: { order: 1 } });
    expect(missionPlace("interactive-opportunity-tracker", "en")).toMatchObject({ pathTitle: "Frontend Developer", stage: { order: 4, title: "JavaScript programming" } });
    expect(missionPlace("unknown-mission", "en")).toBeNull();
  });
});

describe("résumé data", () => {
  it.each([
    ["https://www.thura-card.vercel.app/", "thura-card.vercel.app"],
    ["https://github.com/thura/card", "github.com/thura/card"],
    ["javascript:alert(1)", null],
    ["not a url", null],
    ["", null],
  ])("shortens %j to %j", (value, shown) => {
    expect(displayUrl(value)).toBe(shown);
  });

  it("carries links, review, stage and path onto each line, only for chosen verified work", () => {
    const items = [proof("a", "Card"), proof("b", "Tracker", { state: "invalidated" })];
    const draft = buildResumeDraft("en", items, ["a", "b"]);
    expect(draft.bullets).toHaveLength(1);
    expect(draft.bullets[0]).toMatchObject({
      liveUrl: "thura-card.vercel.app", codeUrl: "github.com/thura/card", reviewerTier: "Trained human reviewer",
      stageLabel: "Stage 3 · CSS and responsive layout", stageNumber: 3, pathTitle: "Frontend Developer", sourceVerifiedLabel: "Oct 15, 2026",
    });
    expect(draft.skills).toEqual(["Semantic HTML", "Responsive CSS"]);
  });
});

describe("Proof-to-Resume Builder", () => {
  const items = [proof("a", "Responsive Profile Card"), proof("b", "Interactive opportunity tracker", { competencies: ["DOM interaction"], stageLabel: "Stage 4 · JavaScript programming", stageNumber: 4 })];
  const renderBuilder = () => render(<ResumeBuilder locale="en" profile={profile} defaultRole="Frontend Developer" items={items} labels={c.studio.resume} />);

  it("redraws the preview as work is picked", () => {
    const { container } = renderBuilder();
    const preview = () => container.querySelector(".resume-preview") as HTMLElement;
    expect(within(preview()).getByText(c.studio.resume.previewEmpty)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: c.studio.resume.openEditor })).toBeDisabled();

    fireEvent.click(screen.getByLabelText(/Responsive Profile Card/));
    expect(within(preview()).getByText("Responsive Profile Card")).toBeInTheDocument();
    expect(within(preview()).getByText("Live: thura-card.vercel.app")).toBeInTheDocument();
    expect(within(preview()).getByText("thura@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: c.studio.resume.openEditor })).toBeEnabled();
  });

  it("switches between the three layouts", () => {
    const { container } = renderBuilder();
    expect(container.querySelector(".resume-preview .rs-modern")).not.toBeNull();
    fireEvent.click(screen.getByRole("radio", { name: /Classic/ }));
    expect(container.querySelector(".resume-preview .rs-classic")).not.toBeNull();
    fireEvent.click(screen.getByRole("radio", { name: /Trail/ }));
    expect(container.querySelector(".resume-preview .rs-trail-doc")).not.toBeNull();
  });

  it("edits the role, the profile and each line in the editor, printing plain text", () => {
    renderBuilder();
    fireEvent.click(screen.getByLabelText(/Interactive opportunity tracker/));
    fireEvent.click(screen.getByRole("button", { name: c.studio.resume.openEditor }));
    const dialog = screen.getByRole("dialog");
    const sheet = dialog.querySelector("#resume-sheet") as HTMLElement;
    expect(sheet).not.toBeNull();

    fireEvent.change(within(sheet).getByLabelText(c.studio.resume.roleLabel), { target: { value: "Junior frontend developer" } });
    fireEvent.change(within(sheet).getByLabelText(c.studio.resume.summaryLabel), { target: { value: "Looking for an internship in Yangon." } });
    fireEvent.change(within(sheet).getByLabelText("Interactive opportunity tracker"), { target: { value: "Built a tracker that filters openings." } });

    expect(sheet.querySelector(".rs-role.print-only")?.textContent).toBe("Junior frontend developer");
    expect(sheet.querySelector(".rs-summary.print-only")?.textContent).toBe("Looking for an internship in Yangon.");
    expect(sheet.querySelector(".rs-line.print-only")?.textContent).toBe("Built a tracker that filters openings.");
  });

  it("does not print an empty profile", () => {
    renderBuilder();
    fireEvent.click(screen.getByLabelText(/Responsive Profile Card/));
    fireEvent.click(screen.getByRole("button", { name: c.studio.resume.openEditor }));
    expect(screen.getByRole("dialog").querySelector(".rs-empty-print")).not.toBeNull();
  });

  it("lists each pick as its title and one line: the stage and what the mission asked for", () => {
    render(<ResumeBuilder locale="en" profile={profile} defaultRole="" labels={c.studio.resume}
      items={[proof("a", "Responsive Profile Card", { stageTag: "Stage 3", brief: "Make a small interface withstand real constraints." })]} />);
    const pick = screen.getByLabelText(/Responsive Profile Card/).closest("label") as HTMLElement;
    expect(within(pick).getByText("Stage 3 · Make a small interface withstand real constraints.")).toBeInTheDocument();
    expect(within(pick).queryByText(/Semantic HTML/)).not.toBeInTheDocument();
  });

  it("says why it is empty when nothing is verified", () => {
    render(<ResumeBuilder locale="en" profile={profile} defaultRole="" items={[]} labels={c.studio.resume} />);
    expect(screen.getByText(c.studio.resume.empty)).toBeInTheDocument();
  });
});

describe("Completed work card", () => {
  it("reads like the Missions list and links to the mission", () => {
    render(
      <CaseStudyCard
        labels={c.studio.work}
        item={{
          id: "1", title: "Three-piece awareness campaign", stageTitle: "Audience and problem research", stageTag: "Stage 1",
          pathTitle: "Content Creator & Social Media Storyteller", summary: "Plan three pieces for one audience.",
          competencies: ["Audience research"], state: "verified", dateLabel: "Verified Aug 12, 2026",
          href: "/app/missions/content-creator-awareness", isDemo: true,
        }}
      />,
    );
    expect(screen.getByText("Verified Aug 12, 2026")).toHaveClass("mission-tag", "verified");
    expect(screen.getByText("Stage 1")).toHaveClass("mission-tag", "stage");
    expect(screen.getByText("Content Creator & Social Media Storyteller")).toBeInTheDocument();
    expect(screen.getByText("Plan three pieces for one audience.")).toBeInTheDocument();
    expect(screen.queryByText(/No summary written/)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: c.studio.work.viewMission })).toHaveAttribute("href", "/app/missions/content-creator-awareness");
  });
});
