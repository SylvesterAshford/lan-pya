// Speed measurement for PERF.md: node scripts/perf.mjs [base] [label] [runs]
// Writes perf-<label>.json to the current directory. Signs in as the demo
// account through /en/login?demo=1, so run it against a site that has one.
// Unthrottled: `runs` hard loads per page, median TTFB / LCP.
// Fast 3G (562ms RTT, 1.44 Mb/s down) + 4x CPU: one cold load per page in a
// fresh context (empty HTTP cache), TTFB / FCP / LCP / bytes / requests.
// Soft nav: sidebar click Today -> each page, time until the URL settles and
// the main heading is painted.
import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";

const base = process.argv[2] ?? "https://lan-pya-rust.vercel.app";
const label = process.argv[3] ?? "baseline";
const runs = Number(process.argv[4] ?? 5);
const PUBLIC = ["/en", "/en/login", "/en/pricing"];
const APP = ["/en/app/today", "/en/app/roadmap", "/en/app/missions", "/en/app/proof", "/en/app/community", "/en/app/opportunities", "/en/app/profile"];
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s.length ? Math.round(s[Math.floor(s.length / 2)]) : null; };

const LCP_INIT = () => {
  window.__lcp = 0;
  new PerformanceObserver((list) => { for (const e of list.getEntries()) window.__lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
};

async function metrics(page) {
  await page.waitForTimeout(300);
  return page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const res = performance.getEntriesByType("resource");
    const fcp = performance.getEntriesByName("first-contentful-paint")[0];
    const bytes = (nav?.transferSize ?? 0) + res.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    const by = (re) => res.filter((r) => re.test(r.name)).reduce((s, r) => s + (r.transferSize || 0), 0);
    return {
      ttfb: nav ? nav.responseStart - nav.startTime : null,
      fcp: fcp?.startTime ?? null, lcp: window.__lcp || null,
      dcl: nav?.domContentLoadedEventEnd ?? null, load: nav?.loadEventEnd ?? null,
      html: nav?.transferSize ?? 0, bytes, js: by(/\.js(\?|$)/), css: by(/\.css(\?|$)/), font: by(/\.woff2?(\?|$)/), img: by(/\.(png|jpe?g|webp|avif|svg)(\?|$)|_next\/image/),
      requests: res.length + 1,
    };
  });
}

async function signIn(ctx) {
  const page = await ctx.newPage();
  for (let i = 0; i < 10; i++) { try { await page.goto(`${base}/en/login?demo=1`, { timeout: 60000 }); break; } catch { await page.waitForTimeout(2000); } }
  await page.locator("form.email-auth-form").getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/en\/app\/today/, { timeout: 120000 });
  return page;
}

const browser = await chromium.launch();
const result = { label, base, at: new Date().toISOString(), warm: {}, slow: {}, soft: {} };

// 1. Unthrottled, warm-ish (same context, so static assets are cached; TTFB is the server).
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(LCP_INIT);
  const page = await signIn(ctx);
  for (const path of [...PUBLIC, ...APP]) {
    const samples = [];
    for (let i = 0; i < runs; i++) { await page.goto(`${base}${path}`, { waitUntil: "load" }); samples.push(await metrics(page)); }
    result.warm[path] = { ttfb: median(samples.map((s) => s.ttfb)), lcp: median(samples.map((s) => s.lcp)), ttfbAll: samples.map((s) => Math.round(s.ttfb)) };
    console.log("warm", path, JSON.stringify(result.warm[path]));
  }
  // 3. Soft navigation through the sidebar.
  for (const path of APP.slice(1)) {
    const samples = [];
    for (let i = 0; i < Math.min(runs, 3); i++) {
      await page.goto(`${base}/en/app/today`, { waitUntil: "load" });
      const link = page.locator(`a[href="${path}"]`).first();
      const t0 = Date.now();
      await link.click();
      await page.waitForURL((u) => u.pathname === path, { timeout: 60000 });
      await page.waitForLoadState("load");
      samples.push(Date.now() - t0);
    }
    result.soft[path] = { ms: median(samples), all: samples };
    console.log("soft", path, JSON.stringify(result.soft[path]));
  }
  await ctx.close();
}

// 2. Fast 3G + 4x CPU, cold cache: a fresh context per page.
const SLOW = { offline: false, latency: 562.5, downloadThroughput: (1.6 * 1024 * 1024 / 8) * 0.9, uploadThroughput: (750 * 1024 / 8) * 0.9 };
{
  const authCtx = await browser.newContext();
  await signIn(authCtx);
  const state = await authCtx.storageState();
  await authCtx.close();
  for (const path of [...PUBLIC, ...APP]) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, storageState: PUBLIC.includes(path) ? undefined : state, serviceWorkers: "block" });
    await ctx.addInitScript(LCP_INIT);
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", SLOW);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.goto(`${base}${path}`, { waitUntil: "load", timeout: 180000 });
    const m = await metrics(page);
    result.slow[path] = Object.fromEntries(Object.entries(m).map(([k, v]) => [k, typeof v === "number" ? Math.round(v) : v]));
    console.log("slow", path, JSON.stringify(result.slow[path]));
    await ctx.close();
  }
}

await browser.close();
writeFileSync(`perf-${label}.json`, JSON.stringify(result, null, 2));
console.log("wrote", `perf-${label}.json`);
