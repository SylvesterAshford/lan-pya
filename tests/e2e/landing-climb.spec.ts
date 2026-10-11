import { expect, test } from "@playwright/test";

// The landing page is one scroll-driven climb (components/marketing/the-climb.tsx).

test("reduced motion keeps the finished climb through a resize", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto("/en");

  const finished = async () => {
    await expect(page.locator(".ascent")).toHaveClass(/is-still/);
    await expect.poll(() => page.locator(".ascent-stage").evaluate((el) => getComputedStyle(el).getPropertyValue("--dawn"))).toBe("1.000");
    await expect(page.locator("[data-stop]:not(.is-reached)")).toHaveCount(0);
  };

  await finished();
  // A phone rotating, or an address bar collapsing, is a resize.
  await page.setViewportSize({ width: 844, height: 390 });
  await page.waitForTimeout(300);
  await finished();
  await context.close();
});

test("the altimeter walks the climb to the summit call to action", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en");

  for (const stop of ["choose", "build", "prove", "summit"]) {
    await page.locator(`[data-ascent-jump="${stop}"]`).click();
    await expect.poll(() => page.locator("[data-ascent-block].is-on").evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.ascentBlock))).toEqual([stop]);
    await expect(page.locator(`[data-ascent-jump="${stop}"]`)).toHaveAttribute("aria-current", "step");
  }

  await page.locator(".ascent-block-summit").getByRole("link", { name: "Use the demo account", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/login\?demo=1/);
});
