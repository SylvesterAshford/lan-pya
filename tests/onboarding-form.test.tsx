import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("OnboardingForm draft privacy", () => {
  it("does not load another account's or a legacy browser-wide draft", async () => {
    window.localStorage.setItem("lan-pya-career-compass-v1:user-one", JSON.stringify({ alias: "First account" }));
    window.localStorage.setItem("lan-pya-career-compass-v1", JSON.stringify({ alias: "Legacy account" }));

    render(<OnboardingForm locale="en" defaultName="Second account" userId="user-two" />);

    expect(await screen.findByLabelText("Display name or alias")).toHaveValue("Second account");
    await waitFor(() => expect(window.localStorage.getItem("lan-pya-career-compass-v1")).toBeNull());
    expect(window.localStorage.getItem("lan-pya-career-compass-v1:user-one")).not.toBeNull();
  });
});
