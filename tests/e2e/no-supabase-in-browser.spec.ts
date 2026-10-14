import { expect, test, type Page } from "@playwright/test";

// Learners in Myanmar cannot reach *.supabase.co without a VPN. Every Supabase
// call therefore has to happen on the server; the browser may talk only to this
// site and Google. This walks the paths a learner takes and fails if the
// browser sends a single request to Supabase.

// Dev servers compile each route on first hit; give the walk room for that.
test.setTimeout(120_000);

// Block Supabase in the browser exactly as a Myanmar connection does, and
// record any attempt. The flows below must still work, which proves they never
// depended on the browser reaching Supabase.
async function blockSupabase(page: Page) {
  const hits: string[] = [];
  await page.route(/https?:\/\/[^/]*supabase\.(co|in)\//, (route) => {
    hits.push(route.request().url());
    return route.abort("blockedbyclient");
  });
  return hits;
}

test("@critical the browser never contacts Supabase on public pages", async ({ page }) => {
  const hits = await blockSupabase(page);

  await page.goto("/en");
  await page.goto("/en/login");
  await page.goto("/my/login");
  await page.waitForLoadState("networkidle");

  expect(hits).toEqual([]);
});

test("@critical signing in and using the workspace never contacts Supabase from the browser", async ({ page }) => {
  test.skip(!(await page.request.get("/en/login").then((r) => r.ok())), "app not reachable");
  const hits = await blockSupabase(page);

  await page.goto("/en/login?demo=1");
  test.skip((await page.getByLabel("Email").count()) === 0, "Supabase is not configured for this run");

  await page.locator("form.email-auth-form").getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/en\/app\/today/, { timeout: 90_000 });
  await page.goto("/en/app/profile");

  // Saving the profile goes through this site's /api/profile/update. The demo
  // account is read-only, so the server refuses with its own message; either
  // way the request never leaves for Supabase from the browser.
  await page.locator(".profile-edit-open").click();
  const saved = page.waitForResponse((response) => response.url().includes("/api/profile/update"));
  await page.locator("form.profile-editor").getByRole("button", { name: /save/i }).click();
  expect((await saved).status()).toBe(403);
  await page.waitForLoadState("networkidle");

  expect(hits).toEqual([]);
});
