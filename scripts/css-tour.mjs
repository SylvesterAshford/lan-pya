// Visual tour for CSS changes: node scripts/css-tour.mjs <base> <outDir>, then
// python3 scripts/css-diff.py <before> <after> <diffs>.
// Every screen, both languages, desktop and phone, plus the states that only
// appear after a click. Reduced motion so frames are comparable.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
const base = process.argv[2]; const out = process.argv[3];
mkdirSync(out, { recursive: true });
const PUBLIC = ["/en", "/my", "/en/login", "/my/login", "/en/pricing", "/my/pricing", "/en/demo"];
const APP = ["/app/today", "/app/roadmap", "/app/missions", "/app/missions/responsive-profile-card", "/app/missions/content-creator-awareness", "/app/proof", "/app/community", "/app/community?tab=leaderboard", "/app/opportunities", "/app/profile", "/app/careers", "/app/privacy", "/onboarding"];
const browser = await chromium.launch();
const errors = [];
async function shoot(page, name) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true, animations: "disabled", caret: "hide" });
}
const safe = (p) => p.replace(/[/?=&]/g, "_").replace(/^_/, "");
for (const [w, h, tag] of [[1280, 900, "d"], [390, 844, "m"]]) {
  const pub = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: "reduce", serviceWorkers: "block" });
  const pp = await pub.newPage();
  pp.on("pageerror", (e) => errors.push(String(e)));
  for (const p of PUBLIC) { await pp.goto(`${base}${p}`, { waitUntil: "networkidle" }); await shoot(pp, `${tag}-${safe(p)}`); }
  await pub.close();

  const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: "reduce", serviceWorkers: "block" });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(`${base}/en/login?demo=1`);
  await page.locator("form.email-auth-form").getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/en\/app\/today/, { timeout: 120000 });
  for (const locale of ["en", "my"]) {
    for (const p of APP) { await page.goto(`${base}/${locale}${p}`, { waitUntil: "networkidle" }); await shoot(page, `${tag}-${locale}-${safe(p)}`); }
  }
  // States behind a click (English).
  const step = async (name, fn) => { try { await fn(); await shoot(page, `${tag}-state-${name}`); } catch (e) { errors.push(`${name}: ${String(e).split("\n")[0]}`); } };
  await step("resume-editor", async () => {
    await page.goto(`${base}/en/app/proof`, { waitUntil: "networkidle" });
    await page.locator(".resume-picks label").first().click();
    await page.getByRole("button", { name: "Edit and save as PDF" }).click(); await page.getByRole("dialog").waitFor();
  });
  await page.keyboard.press("Escape");
  await step("tutor", async () => {
    await page.goto(`${base}/en/app/today`, { waitUntil: "networkidle" });
    await page.locator(".tutor-fab").click(); await page.locator(".tutor-dialog").waitFor();
  });
  await page.keyboard.press("Escape");
  await step("roadmap-stage", async () => {
    await page.goto(`${base}/en/app/roadmap`, { waitUntil: "networkidle" });
    await page.locator("[data-stage-key], .rm-node, .roadmap-stage").first().click(); await page.getByRole("dialog").waitFor();
  });
  await page.keyboard.press("Escape");
  await step("community-card", async () => {
    await page.goto(`${base}/en/app/community`, { waitUntil: "networkidle" });
    await page.locator(".community-list button").first().click(); await page.getByRole("dialog").waitFor();
  });
  await page.keyboard.press("Escape");
  if (tag === "m") await step("mobile-nav", async () => {
    await page.goto(`${base}/en/app/today`, { waitUntil: "networkidle" });
    await page.locator(".app-mobile-bar button").first().click(); await page.waitForTimeout(400);
  });
  await ctx.close();
}
console.log("errors", JSON.stringify(errors));
await browser.close();
