import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/i18n/navigation", () => ({ Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a href={href} {...rest}>{children}</a> }));

import { ReviewActionForm } from "@/components/review/review-action-form";
import { getMissionBrief } from "@/lib/domain/mission-briefs";
import { getAppCopy } from "@/lib/i18n/app-copy";

const labels = getAppCopy("en").review;
const brief = getMissionBrief("content-creator-awareness", "en")!;

describe("ReviewActionForm", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  // The rubric is the brief's own deliverables. Content Creator reviews used to
  // be scored on Frontend criteria with a fixed 3 for every one.
  it("scores the mission's own step-2 criteria", () => {
    render(<ReviewActionForm submissionId="s1" criteria={brief.deliverables} labels={labels} />);
    for (const item of brief.deliverables) expect(screen.getByRole("group", { name: new RegExp(item.title) })).toBeInTheDocument();
  });

  it("refuses to decide until every criterion is scored", () => {
    const request = vi.fn();
    vi.stubGlobal("fetch", request);
    render(<ReviewActionForm submissionId="s1" criteria={brief.deliverables} labels={labels} />);

    fireEvent.change(screen.getByLabelText(labels.notes), { target: { value: "Clear audience, captions on every piece." } });
    fireEvent.click(screen.getByRole("button", { name: labels.verify }));

    expect(screen.getByRole("alert")).toHaveTextContent(labels.needScores);
    expect(request).not.toHaveBeenCalled();
  });

  it("sends exactly the scored criteria and the notes", async () => {
    const request = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: "r1" }), { status: 200 }));
    vi.stubGlobal("fetch", request);
    render(<ReviewActionForm submissionId="s1" criteria={brief.deliverables} labels={labels} />);

    brief.deliverables.forEach((item, index) => {
      const group = screen.getByRole("group", { name: new RegExp(item.title) });
      fireEvent.click(group.querySelectorAll("input")[index % 5]);
    });
    fireEvent.change(screen.getByLabelText(labels.notes), { target: { value: "Clear audience, captions on every piece." } });
    fireEvent.click(screen.getByRole("button", { name: labels.requestChanges }));

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(labels.recorded));
    const body = JSON.parse(request.mock.calls[0][1].body);
    expect(body.action).toBe("request_changes");
    expect(Object.keys(body.rubricScores).sort()).toEqual(brief.deliverables.map((item) => item.id).sort());
  });
});
