// Interleaved A/B on prod English pages, Fast 3G + 4x CPU, cold. Both arms pass
// the HTML through Playwright (so both are buffered alike); arm "old" adds
// the two Padauk preloads at the top of <head>, as next/font used to.
import { chromium } from "@playwright/test";
const base = "https://lan-pya-rust.vercel.app"; const n = Number(process.argv[2] ?? 5);
const PRELOADS = ["/fonts/padauk-myanmar-400.v1.woff2", "/fonts/padauk-myanmar-700.v1.woff2"].map((h) => `<link rel="preload" href="${h}" as="font" type="font/woff2" crossorigin="anonymous">`).join("");
const browser = await chromium.launch();
const auth = await browser.newContext(); const p0 = await auth.newPage();
await p0.goto(`${base}/en/login?demo=1`); await p0.locator("form.email-auth-form").getByRole("button", { name: "Sign in" }).click(); await p0.waitForURL(/today/, { timeout: 120000 });
const state = await auth.storageState(); await auth.close();
const med = (xs) => { const s = [...xs].sort((a, b) => a - b); return Math.round(s[Math.floor(s.length / 2)]); };
for (const path of ["/en", "/en/app/today", "/en/app/profile", "/en/app/roadmap"]) {
  const out = { old: [], new: [] };
  for (let i = 0; i < n * 2; i++) {
    const arm = i % 2 === 0 ? "old" : "new";
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, storageState: path === "/en" ? undefined : state, serviceWorkers: "block" });
    const page = await ctx.newPage();
    await page.route((url) => url.pathname === path, async (route) => {
      if (route.request().resourceType() !== "document") return route.continue().catch(() => {});
      const res = await route.fetch();
      let body = await res.text();
      if (arm === "old") body = body.replace("<head>", `<head>${PRELOADS}`);
      await route.fulfill({ response: res, body });
    });
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 562.5, downloadThroughput: (1.6 * 1024 * 1024 / 8) * 0.9, uploadThroughput: (750 * 1024 / 8) * 0.9 });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.goto(`${base}${path}`, { waitUntil: "load", timeout: 180000 });
    await page.waitForTimeout(300);
    out[arm].push(await page.evaluate(() => ({
      fcp: performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0,
      css: Math.max(0, ...performance.getEntriesByType("resource").filter((r) => r.renderBlockingStatus === "blocking").map((r) => r.responseEnd)),
      padauk: performance.getEntriesByType("resource").filter((r) => /padauk/.test(r.name)).length,
    })));
    await ctx.close();
  }
  console.log(path.padEnd(16), "FCP old", med(out.old.map((r) => r.fcp)), "new", med(out.new.map((r) => r.fcp)), "| CSS old", med(out.old.map((r) => r.css)), "new", med(out.new.map((r) => r.css)), "| padauk files old", out.old[0].padauk, "new", out.new[0].padauk, JSON.stringify({ old: out.old.map((r) => Math.round(r.fcp)), new: out.new.map((r) => Math.round(r.fcp)) }));
}
await browser.close();
