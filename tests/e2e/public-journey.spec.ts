import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("@critical marketing opens the signed-in demo account flow", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("From direction");
  await page.getByRole("link", { name: /demo account/i }).click();
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
  if (await page.getByLabel("Email").count()) {
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  }
  await expect(page.getByText(/Connect Supabase|Continue with Google/)).toBeVisible();
});

test("login has no serious accessibility violations", async ({ page }) => {
  await page.goto("/en/login?demo=1");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
});
