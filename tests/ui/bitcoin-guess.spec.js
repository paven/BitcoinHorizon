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

test('shows visual feedback for selected guess', async ({page}) => {
  await page.goto('http://localhost:5173/index.html');
  // Click the Up button and check for visual feedback
  await page.click('#guess-up');
  const upButton = page.locator('#guess-up');
  await expect(upButton).toHaveClass(/selected|active/); // Adjust class as implemented
  // The Down button should not have the selected/active class
  const downButton = page.locator('#guess-down');
  await expect(downButton).not.toHaveClass(/selected|active/);

  // Click the Down button and check for visual feedback
  await page.click('#guess-down');
  await expect(downButton).toHaveClass(/selected|active/);
  await expect(upButton).not.toHaveClass(/selected|active/);
});
