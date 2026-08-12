import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import { DEMO_ACCOUNT, EmailAuthForm } from "@/components/auth/email-auth-form";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}));

const messages = {
  Auth: {
    modeLabel: "Choose sign in or create account",
    signIn: "Sign in",
    createAccount: "Create account",
    email: "Email",
    password: "Password",
    working: "Please wait…",
    invalidCredentials: "Invalid credentials",
    checkEmail: "Check your email",
    demoKicker: "TRY THE COMPLETE APP",
    demoTitle: "Demo account",
    demoBody: "Prepared product data.",
    fillDemo: "Fill demo email and password",
    demoReady: "Demo credentials are ready.",
  },
};

describe("EmailAuthForm", () => {
  it("prefills the signed-in demo account instead of rendering a public demo page", () => {
    render(<NextIntlClientProvider locale="en" messages={messages}><EmailAuthForm locale="en" demoRequested /></NextIntlClientProvider>);

    expect(screen.getByLabelText("Email")).toHaveValue(DEMO_ACCOUNT.email);
    expect(screen.getByLabelText("Password")).toHaveValue(DEMO_ACCOUNT.password);
    expect(screen.getAllByRole("button", { name: "Sign in" })[1]).toBeEnabled();
  });
});
