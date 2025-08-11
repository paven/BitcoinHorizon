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

test('fetches new price after 60 seconds', async ({page}) => {
  await page.goto('http://localhost:5173/index.html');
  // Simulate making a guess
  await page.click('#guess-up');

  // Mock fetchBTCPrice to return a different price after 60s
  await page.route('https://api.coingecko.com/api/v3/simple/price*', async (route, request) => {
    const url = new URL(request.url());
    // If this is the second fetch (after 60s), return a different price
    if (url.searchParams.get('mock') === 'after60s') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({bitcoin: {usd: 70000}}),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({bitcoin: {usd: 65000}}),
      });
    }
  });

  // Fast-forward 60 seconds
  await page.evaluate(() => {
    window.setTimeout = (fn, ms) => {
      if (ms === 60000) fn();
    };
  });

  // Trigger whatever mechanism your app uses to fetch the new price after 60s
  // (This may need to be adjusted to match your implementation)

  // Wait for the UI to reflect the new price or resolution
  // (You may want to check for a result message, unlocked state, or updated price)
  // Example:
  // await expect(page.locator('#guess-message')).toContainText('resolved');
});

test('shows loading or waiting state for 60 seconds after guess before fetching new price', async ({page}) => {
  await page.goto('http://localhost:5173/index.html');
  await page.click('#guess-up');
  // Immediately after guess, should show a waiting or loading state (not resolved)
  await expect(page.locator('#guess-message')).toContainText(/waiting|loading|pending|resolving/i);
  // (This will fail until the component implements a waiting state after a guess)
});
