import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
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
    accountError: "Your account could not be created.",
  },
};

describe("EmailAuthForm", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("prefills the signed-in demo account instead of rendering a public demo page", () => {
    render(<NextIntlClientProvider locale="en" messages={messages}><EmailAuthForm locale="en" demoRequested /></NextIntlClientProvider>);

    expect(screen.getByLabelText("Email")).toHaveValue(DEMO_ACCOUNT.email);
    expect(screen.getByLabelText("Password")).toHaveValue(DEMO_ACCOUNT.password);
    expect(screen.getAllByRole("button", { name: "Sign in" })[1]).toBeEnabled();
  });

  it("exposes and updates the selected authentication mode", () => {
    render(<NextIntlClientProvider locale="en" messages={messages}><EmailAuthForm locale="en" demoRequested={false} /></NextIntlClientProvider>);

    const signIn = screen.getAllByRole("button", { name: "Sign in" })[0];
    const createAccount = screen.getAllByRole("button", { name: "Create account" })[0];

    expect(signIn).toHaveAttribute("aria-pressed", "true");
    expect(createAccount).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(createAccount);

    expect(signIn).toHaveAttribute("aria-pressed", "false");
    expect(createAccount).toHaveAttribute("aria-pressed", "true");
  });



  it("signs in through this site's server, never by calling Supabase from the browser", async () => {
    const request = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: { signedIn: true } }), { status: 200 }));
    vi.stubGlobal("fetch", request);
    render(<NextIntlClientProvider locale="en" messages={messages}><EmailAuthForm locale="en" demoRequested /></NextIntlClientProvider>);

    fireEvent.click(screen.getAllByRole("button", { name: "Sign in" })[1]);

    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    const [url, init] = request.mock.calls[0];
    expect(url).toBe("/api/auth/login");
    expect(JSON.parse(init.body)).toEqual({ email: DEMO_ACCOUNT.email, password: DEMO_ACCOUNT.password });
    expect(String(url)).not.toContain("supabase");
  });

  it("shows the credential error when the server rejects the sign-in", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 401 })));
    render(<NextIntlClientProvider locale="en" messages={messages}><EmailAuthForm locale="en" demoRequested /></NextIntlClientProvider>);

    fireEvent.click(screen.getAllByRole("button", { name: "Sign in" })[1]);

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid credentials");
  });
});
