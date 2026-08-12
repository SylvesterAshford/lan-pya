import { afterEach, describe, expect, it, vi } from "vitest";
import { isGoogleProviderEnabled } from "@/lib/supabase/auth-providers";

describe("Supabase auth provider availability", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  });

  it("returns false without Supabase configuration", async () => {
    expect(await isGoogleProviderEnabled()).toBe(false);
  });

  it("uses the live Auth settings response instead of assuming Google is enabled", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable-test-key";
    const request = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ external: { google: false } }), { status: 200 }),
    );
    vi.stubGlobal("fetch", request);

    expect(await isGoogleProviderEnabled()).toBe(false);
    expect(request).toHaveBeenCalledWith(
      "https://example.supabase.co/auth/v1/settings",
      expect.objectContaining({
        cache: "no-store",
        headers: { apikey: "publishable-test-key" },
      }),
    );
  });

  it("enables Google immediately when the live settings endpoint enables it", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable-test-key";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ external: { google: true } }), { status: 200 }),
      ),
    );

    expect(await isGoogleProviderEnabled()).toBe(true);
  });
});
