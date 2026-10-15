// node scripts/perf-tap.mjs [base] [label]. Fast 3G sidebar taps: ms until the screen first responds (URL changes or a
// loading outline appears) and until the new page's content is in place.
import { chromium } from "@playwright/test";
const base = process.argv[2] ?? "https://lan-pya-rust.vercel.app"; const label = process.argv[3] ?? "x";
const PAGES = { "/en/app/roadmap": ".roadmap-page, .mission-map, h1", "/en/app/missions": "h1", "/en/app/proof": ".resume-block", "/en/app/opportunities": "h1", "/en/app/profile": "h1" };
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
await page.goto(`${base}/en/login?demo=1`);
await page.locator("form.email-auth-form").getByRole("button", { name: "Sign in" }).click();
await page.waitForURL(/\/en\/app\/today/, { timeout: 120000 });
const cdp = await ctx.newCDPSession(page);
await cdp.send("Network.enable");
const rows = [];
for (const [path] of Object.entries(PAGES)) {
  const feedback = [], content = [];
  for (let i = 0; i < 3; i++) {
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    await page.goto(`${base}/en/app/today`, { waitUntil: "load" });
    await page.waitForTimeout(2500); // let Link prefetches finish, as a reader would
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 562.5, downloadThroughput: (1.6 * 1024 * 1024 / 8) * 0.9, uploadThroughput: (750 * 1024 / 8) * 0.9 });
    const startUrl = page.url();
    const t0 = Date.now();
    await page.locator(`nav a[href="${path}"], aside a[href="${path}"], a[href="${path}"]`).first().click();
    await page.waitForFunction((start) => location.href !== start || !!document.querySelector(".page-loading"), startUrl, { polling: 16, timeout: 60000 });
    feedback.push(Date.now() - t0);
    await page.waitForFunction((p) => location.pathname === p && !document.querySelector(".page-loading") && !!document.querySelector("main h1, h1"), path, { polling: 16, timeout: 60000 });
    content.push(Date.now() - t0);
  }
  const med = (xs) => [...xs].sort((a, b) => a - b)[1];
  rows.push({ path, feedback: med(feedback), content: med(content), all: { feedback, content } });
  console.log(label, path, "feedback", med(feedback), "content", med(content), JSON.stringify({ feedback, content }));
}
await browser.close();
