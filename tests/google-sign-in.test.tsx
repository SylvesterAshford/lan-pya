import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import { GoogleSignIn } from "@/components/auth/google-sign-in";

describe("GoogleSignIn", () => {
  it("keeps the Google action enabled until a live click-time provider check", () => {
    render(
      <NextIntlClientProvider
        locale="en"
        messages={{
          Auth: {
            google: "Continue with Google",
            working: "Please wait…",
            providerUnavailable: "Google sign-in is not enabled yet.",
            error: "Sign-in could not start.",
          },
        }}
      >
        <GoogleSignIn locale="en" />
      </NextIntlClientProvider>,
    );

    expect(screen.getByRole("button", { name: "Continue with Google" })).toBeEnabled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
