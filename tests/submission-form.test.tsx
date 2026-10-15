import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const refresh = vi.fn();
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ refresh, push: vi.fn() }) }));
const draft = vi.hoisted(() => ({
  loadDraft: vi.fn().mockResolvedValue(null),
  saveDraft: vi.fn().mockResolvedValue(undefined),
  clearDraft: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/offline/draft-store", () => draft);

import { SubmissionForm, validateSubmission } from "@/components/missions/submission-form";
import { getAppCopy } from "@/lib/i18n/app-copy";

const c = getAppCopy("en").mission;
const valid = {
  repositoryUrl: "https://github.com/learner/profile-card",
  deploymentUrl: "https://profile-card.vercel.app",
  screenshotUrl: "",
  reflection: "I traded a grid for flexbox so the card wraps cleanly at 320px.",
};

function renderForm(initial = null as typeof valid | null) {
  return render(
    <SubmissionForm
      locale="en" labels={c} userId="u1" missionKey="responsive-profile-card"
      repositoryLabel="GitHub repository URL" repositoryHint="The repository with your HTML and CSS."
      deploymentLabel="Live deployment URL" deploymentHint="Where the card runs."
      reflectionPlaceholder="What trade-off did you make?" criteriaCount={4}
      initial={initial} backLabel="Back" onBack={() => undefined}
    />,
  );
}

describe("validateSubmission", () => {
  it("accepts two full links and a 40-character reflection", () => {
    expect(validateSubmission(valid, c)).toEqual({});
  });
  it("names each problem in the learner's words", () => {
    const errors = validateSubmission({ repositoryUrl: "", deploymentUrl: "profile-card.vercel.app", screenshotUrl: "not a link", reflection: "Too short" }, c);
    expect(errors.repositoryUrl).toBe(c.errRequired);
    expect(errors.deploymentUrl).toBe(c.errUrl);
    expect(errors.screenshotUrl).toBe(c.errUrl);
    expect(errors.reflection).toBe("Add 31 more characters.");
  });
});

describe("SubmissionForm", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    refresh.mockReset();
  });

  // The browser's own "Please fill out this field" tooltip is replaced by
  // inline errors, and focus goes to the first field that needs work.
  it("shows inline errors and focuses the first invalid field instead of sending", async () => {
    const request = vi.fn();
    vi.stubGlobal("fetch", request);
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: /Submit for review/ }));

    expect(await screen.findAllByText(c.errRequired)).toHaveLength(2);
    expect(screen.getByLabelText("GitHub repository URL")).toHaveFocus();
    expect(screen.getByLabelText("GitHub repository URL")).toHaveAttribute("aria-invalid", "true");
    expect(request).not.toHaveBeenCalled();
  });

  it("counts the reflection toward its 40-character minimum", () => {
    renderForm();
    fireEvent.change(screen.getByLabelText("Reflection"), { target: { value: "Twelve chars" } });
    expect(screen.getByText("12 / 40 minimum")).toBeInTheDocument();
  });

  it("sends the work, clears the draft, and refreshes into the next step", async () => {
    const request = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: "s1" }), { status: 202 }));
    vi.stubGlobal("fetch", request);
    renderForm(valid);

    fireEvent.click(screen.getByRole("button", { name: /Submit for review/ }));

    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(JSON.parse(request.mock.calls[0][1].body)).toMatchObject({ missionKey: "responsive-profile-card", ...valid });
    expect(draft.clearDraft).toHaveBeenCalledWith("u1", "responsive-profile-card");
  });

  it("keeps the draft and says why when the server refuses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: "You already have an active review for this mission." }), { status: 409 })));
    draft.clearDraft.mockClear();
    renderForm(valid);

    fireEvent.click(screen.getByRole("button", { name: /Submit for review/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent("You already have an active review for this mission.");
    expect(draft.clearDraft).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
  });
});
