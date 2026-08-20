import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("@critical marketing opens the signed-in demo account flow", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Stop collecting advice");
  await page.getByRole("link", { name: "Use the demo account", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/login\?demo=1/);
  if (await page.getByLabel("Email").count()) {
    await expect(page.getByLabel("Email")).toHaveValue("demo@lanpya.app");
    await expect(page.getByLabel("Password")).not.toHaveValue("");
  } else {
    await expect(page.getByText("Connect Supabase to enable sign-in.")).toBeVisible();
  }
});

test("@critical login uses Supabase configuration path", async ({ page }) => {
  await page.goto("/en/login");
  await expect(page.getByRole("heading", { level: 1 }).last()).toBeVisible();
  await expect(page.locator(".auth-brand-panel")).toBeVisible();
  await expect(page.locator(".auth-mobile-brand")).toBeHidden();
  if (await page.getByLabel("Email").count()) {
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  }
  await expect(page.getByText(/Connect Supabase|Continue with Google/)).toBeVisible();
});

test("@critical mobile login leads with the sign-in task", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/login");

  await expect(page.locator(".auth-form-panel")).toBeVisible();
  await expect(page.locator(".auth-mobile-brand")).toBeVisible();
  await expect(page.locator(".auth-brand-panel")).toBeHidden();
  await expect(page.getByRole("heading", { level: 1 }).last()).toBeInViewport();
  await expect(page.locator(".auth-form-panel")).toHaveCSS("padding-top", "24px");
  const privacyCopy = page.locator(".privacy-copy");
  await expect(privacyCopy.locator("span")).toBeVisible();
  await expect(privacyCopy).toHaveCSS("align-items", "flex-start");
  await expect(privacyCopy).toHaveCSS("justify-content", "flex-start");
  await expect(privacyCopy).toHaveCSS("text-align", "left");
  await expect(privacyCopy.locator("svg")).toHaveCSS("margin-top", "2px");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("@critical tablet login puts the form before supporting content", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/en/login");

  const formPanel = page.locator(".auth-form-panel");
  const brandPanel = page.locator(".auth-brand-panel");
  await expect(page.locator(".auth-mobile-brand")).toBeVisible();
  await expect(brandPanel).toBeVisible();
  const [formBox, brandBox] = await Promise.all([formPanel.boundingBox(), brandPanel.boundingBox()]);
  expect(formBox).not.toBeNull();
  expect(brandBox).not.toBeNull();
  expect(formBox!.y).toBeLessThan(brandBox!.y);
});

test("login has no serious accessibility violations", async ({ page }) => {
  await page.goto("/en/login?demo=1");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
});
