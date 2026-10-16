// node scripts/perf-gap.mjs [rounds]: warm LCP of Community and three other screens,
// every screen in every round, so network drift hits them all alike.
import { chromium } from "@playwright/test";
const base = "https://lan-pya-rust.vercel.app"; const rounds = Number(process.argv[2] ?? 7);
const PAGES = ["/en/app/community", "/en/app/today", "/en/app/proof", "/en/app/profile"];
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.addInitScript(() => { window.__lcp = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true }); });
const page = await ctx.newPage();
await page.goto(`${base}/en/login?demo=1`); await page.locator("form.email-auth-form").getByRole("button", { name: "Sign in" }).click(); await page.waitForURL(/today/, { timeout: 120000 });
const lcp = Object.fromEntries(PAGES.map((p) => [p, []])); const ttfb = Object.fromEntries(PAGES.map((p) => [p, []]));
for (let r = 0; r < rounds; r++) for (const p of PAGES) {
  await page.goto(`${base}${p}`, { waitUntil: "load" }); await page.waitForTimeout(300);
  const m = await page.evaluate(() => ({ lcp: window.__lcp, ttfb: performance.getEntriesByType("navigation")[0].responseStart }));
  lcp[p].push(m.lcp); ttfb[p].push(m.ttfb);
}
const med = (xs) => { const s = [...xs].sort((a, b) => a - b); return Math.round(s[Math.floor(s.length / 2)]); };
for (const p of PAGES) console.log(p.padEnd(20), "LCP", med(lcp[p]), "TTFB", med(ttfb[p]));
const others = PAGES.slice(1).map((p) => med(lcp[p]));
console.log("community gap to the mean of the others:", med(lcp[PAGES[0]]) - Math.round(others.reduce((a, b) => a + b) / others.length), "ms");
await browser.close();
