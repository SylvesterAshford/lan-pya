// node scripts/check-offline.mjs <base>: against a production build (the service
// worker only registers there), cut the connection and tap a sidebar link; the
// offline page should appear at the requested address.
import { chromium } from "@playwright/test";
const base = process.argv[2];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${base}/en/login?demo=1`); await page.locator("form.email-auth-form").getByRole("button", { name: "Sign in" }).click(); await page.waitForURL(/today/, { timeout: 120000 });
await page.evaluate(async () => { await navigator.serviceWorker.ready; }); await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await ctx.setOffline(true);
const t0 = Date.now();
await page.locator('a[href="/en/app/missions"]').first().click();
for (let i = 0; i < 16; i++) {
  await page.waitForTimeout(500);
  const state = await page.evaluate(() => ({ url: location.pathname, outline: !!document.querySelector(".page-loading"), h1: document.querySelector("h1")?.textContent?.slice(0, 30) })).catch(() => ({ url: "navigating" }));
  if (i % 3 === 0 || state.h1?.startsWith("You")) console.log(`${Date.now() - t0}ms`, JSON.stringify(state));
  if (state.h1?.startsWith("You")) break;
}
await browser.close();
