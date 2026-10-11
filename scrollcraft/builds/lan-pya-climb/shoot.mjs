// Walks the climb at fixed progress points and screenshots each one.
// usage: node shoot.mjs <url> <outDir> <width> <height> [reduced]
import { chromium } from "playwright-core";
const [url, out, w, h, reduced] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1, reducedMotion: reduced ? "reduce" : "no-preference" });
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push(String(e)));
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
const points = reduced ? [0, 0.5, 1] : [0, 0.08, 0.2, 0.42, 0.63, 0.76, 0.84, 0.9, 1];
for (const p of points) {
  await page.evaluate((p) => {
    const el = document.querySelector(".ascent");
    const r = el.getBoundingClientRect();
    const top = window.scrollY + r.top;
    const travel = el.offsetHeight - innerHeight;
    window.scrollTo(0, reducedTop(p));
    function reducedTop(p) { return travel > 0 ? top + p * travel : p * (document.body.scrollHeight - innerHeight); }
  }, p);
  await page.waitForTimeout(1300);
  const info = await page.evaluate(() => ({
    on: [...document.querySelectorAll("[data-ascent-block].is-on")].map((e) => e.dataset.ascentBlock).join(","),
    reached: [...document.querySelectorAll("[data-stop].is-reached")].map((e) => e.dataset.stop).join(","),
    walk: getComputedStyle(document.querySelector(".ascent-stage")).getPropertyValue("--walk"),
    dawn: getComputedStyle(document.querySelector(".ascent-stage")).getPropertyValue("--dawn"),
    overflowX: document.documentElement.scrollWidth > innerWidth,
  }));
  const name = `${out}/p${String(Math.round(p * 100)).padStart(3, "0")}.png`;
  await page.screenshot({ path: name });
  console.log(p, JSON.stringify(info));
}
console.log("errors:", errors.length ? errors : "none");
await browser.close();
