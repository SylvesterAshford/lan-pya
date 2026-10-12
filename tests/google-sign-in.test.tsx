import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it } from "vitest";
import { GoogleSignIn } from "@/components/auth/google-sign-in";

const messages = {
  Auth: {
    google: "Continue with Google",
    working: "Please wait…",
    providerUnavailable: "Google sign-in is not enabled yet.",
    error: "Sign-in could not start.",
  },
};

function renderButton(props: { clientId: string | null; enabled: boolean }) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <GoogleSignIn locale="en" {...props} />
    </NextIntlClientProvider>,
  );
}

describe("GoogleSignIn", () => {
  afterEach(() => {
    cleanup();
    document.head.querySelectorAll('script[src*="accounts.google.com"]').forEach((el) => el.remove());
  });

  it("explains Google is unavailable when the server says it is not set up", () => {
    renderButton({ clientId: null, enabled: false });

    fireEvent.click(screen.getByRole("button", { name: "Continue with Google" }));

    expect(screen.getByRole("status")).toHaveTextContent("Google sign-in is not enabled yet.");
    expect(document.querySelector('script[src*="accounts.google.com"]')).toBeNull();
  });

  it("loads Google's own button, and never Supabase, when Google is set up", () => {
    renderButton({ clientId: "test-client.apps.googleusercontent.com", enabled: true });

    const script = document.querySelector<HTMLScriptElement>('script[src*="accounts.google.com"]');
    expect(script?.src).toBe("https://accounts.google.com/gsi/client");
    expect(document.querySelector('script[src*="supabase"]')).toBeNull();
    expect(screen.queryByRole("button", { name: "Continue with Google" })).not.toBeInTheDocument();
  });
});
