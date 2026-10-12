import { describe, expect, it } from "vitest";
import { onboardingPath, postAuthPath } from "@/lib/auth-redirect";

const origin = "https://lan-pya-rust.vercel.app";

describe("postAuthPath", () => {
  it("keeps a relative path on this site", () => {
    expect(postAuthPath("/my/onboarding?x=1", origin, "/en/onboarding")).toBe("/my/onboarding?x=1");
  });

  it("reduces an absolute URL on this site to its path, as email templates send", () => {
    expect(postAuthPath(`${origin}/my/onboarding`, origin, "/en/onboarding")).toBe("/my/onboarding");
  });

  it("refuses other origins and protocol-relative paths", () => {
    expect(postAuthPath("https://evil.example/steal", origin, "/en/onboarding")).toBe("/en/onboarding");
    expect(postAuthPath("//evil.example/steal", origin, "/en/onboarding")).toBe("/en/onboarding");
    expect(postAuthPath("javascript:alert(1)", origin, "/en/onboarding")).toBe("/en/onboarding");
  });

  it("falls back when there is nothing to follow", () => {
    expect(postAuthPath(null, origin, "/en/onboarding")).toBe("/en/onboarding");
    expect(postAuthPath("", origin, "/en/onboarding")).toBe("/en/onboarding");
  });
});

describe("onboardingPath", () => {
  it("keeps Burmese readers in Burmese and defaults everything else to English", () => {
    expect(onboardingPath("my")).toBe("/my/onboarding");
    expect(onboardingPath("en")).toBe("/en/onboarding");
    expect(onboardingPath("fr")).toBe("/en/onboarding");
    expect(onboardingPath(null)).toBe("/en/onboarding");
  });
});
