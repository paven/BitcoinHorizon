import { test, expect } from '@playwright/test';

// 2. Playwright test: bitcoin-guess component renders and buttons exist

test('bitcoin-guess component renders and buttons exist', async ({ page }) => {
  // Use a local server for best results, e.g. http://localhost:8080/index.html
  await page.goto('http://localhost:5173/index.html');
  const guessLocator = page.locator('bitcoin-guess');
  await expect(guessLocator).toBeVisible();
  await expect(page.locator('#guess-up')).toBeVisible();
  await expect(page.locator('#guess-down')).toBeVisible();
});