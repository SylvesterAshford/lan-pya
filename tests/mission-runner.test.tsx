import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a href={href} {...rest}>{children}</a>,
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));
vi.mock("@/lib/offline/draft-store", () => ({ loadDraft: vi.fn().mockResolvedValue(null), saveDraft: vi.fn(), clearDraft: vi.fn() }));

import { MissionRunner } from "@/components/missions/mission-runner";
import { getMissionBrief } from "@/lib/domain/mission-briefs";
import { getAppCopy } from "@/lib/i18n/app-copy";

const brief = getMissionBrief("responsive-profile-card", "en")!;
const labels = getAppCopy("en").runner;
const version = { repositoryUrl: "https://github.com/a/card", deploymentUrl: "https://card.vercel.app", screenshotUrl: "", reflection: "I swapped a fixed width for a fluid grid." };

describe("MissionRunner after the work is in", () => {
  afterEach(() => cleanup());

  // The Submit dot was disabled once a mission was verified, and the disabled
  // style faded it, so a finished step read as skipped on the rail.
  it("keeps Submit open and shows what was sent instead of a form", () => {
    render(<MissionRunner locale="en" userId="u1" brief={brief} labels={labels}
      feedback={{ state: "verified", updatedAt: "2026-10-14T00:00:00Z", version, check: null, review: null }} />);

    const submit = screen.getByRole("button", { name: /Step 3 of 5: Submit/ });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);

    expect(screen.getByRole("heading", { name: "What you submitted" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "https://card.vercel.app" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Submit for review/ })).toBeNull();
    // Looking back at Submit does not undo Review and Proof on the rail.
    expect(screen.getByRole("button", { name: /Step 5 of 5: Proof/ }).closest("li")).toHaveClass("done");
  });
});
