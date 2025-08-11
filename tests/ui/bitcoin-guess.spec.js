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
  await expect(downButton).toHaveClass(/disabled/);
  // Do not try to click the Down button after a guess is made, as it is now disabled
});

test('Down button shows disabled visual feedback when Up is chosen', async ({page}) => {
  await page.goto('http://localhost:5173/index.html');
  await page.click('#guess-up');
  const downButton = page.locator('#guess-down');
  // Check that the Down button does NOT have the 'selected' class
  await expect(downButton).not.toHaveClass(/selected/);
  // Check that the Down button DOES have the 'disabled' class
  await expect(downButton).toHaveClass(/disabled/);
  // Optionally, check for a faded style or other disabled indicator
  // Example: await expect(downButton).toHaveCSS('opacity', '0.8');
});

test('guess buttons are disabled after a guess is made', async ({page}) => {
  await page.goto('http://localhost:5173/index.html');
  await page.click('#guess-up');
  await expect(page.locator('#guess-up')).toBeDisabled();
  await expect(page.locator('#guess-down')).toBeDisabled();
});
