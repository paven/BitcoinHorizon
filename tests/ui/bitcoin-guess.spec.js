import { test, expect } from '@playwright/test';

test.describe('bitcoin-guess', () => {
    test('buttons remain disabled if the initial price fetch fails', async ({page}) => {
        // 1. Setup: Mock the API to consistently fail. This simulates a network
        // or server error, a critical edge case for our app to handle.
        await page.route('https://api.coingecko.com/api/v3/simple/price*', async (route) => {
            await route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({error: 'Internal Server Error'}),
            });
        });

        // 2. Action: Navigate to the page. The app will attempt to fetch the price and fail.
        await page.goto('http://localhost:5173/index.html');

        // 3. Assertion: Verify the buttons are, and remain, disabled.
        const guessUpButton = page.locator('bitcoin-guess #guess-up');
        const guessDownButton = page.locator('bitcoin-guess #guess-down');

        await expect(guessUpButton).toBeDisabled();
        await expect(guessDownButton).toBeDisabled();
    });

// 2. Playwright test: bitcoin-guess component renders and buttons exist

test('bitcoin-guess component renders and buttons exist', async ({ page }) => {
  // Use a local server for best results, e.g. http://localhost:8080/index.html
  await page.goto('http://localhost:5173/index.html');
  const guessLocator = page.locator('bitcoin-guess');
  await expect(guessLocator).toBeVisible();
  await expect(page.locator('#guess-up')).toBeVisible();
  await expect(page.locator('#guess-down')).toBeVisible();
});

test('triggers a new price fetch after 60 seconds', async ({page}) => {
    const priceComponent = page.locator('bitcoin-price');
    let fetchCount = 0;

    // 1. Mock the API route to track calls and provide different prices
    // This MUST be done BEFORE navigating.
    await page.route('https://api.coingecko.com/api/v3/simple/price*', async (route) => {
        fetchCount++;
        const price = fetchCount === 1 ? 65000 : 70000; // First call gets 65k, second gets 70k
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({bitcoin: {usd: price}}),
        });
    });

    // 0. Install fake timers and navigate to the page
    await page.clock.install({time: new Date()});
    await page.goto('http://localhost:5173/index.html');

    // 2. Wait for the initial price to load
    await expect(priceComponent).toContainText('65000', {timeout: 10000});
    expect(fetchCount).toBe(1);

    // 3. Make a guess to start the timer
    const upButton = page.locator('#guess-up');
    await expect(upButton).toBeEnabled();
    await upButton.click();

    // 4. Fast-forward time by 60 seconds
    await page.clock.fastForward(60000);

    // 5. Assert that a new price has been fetched and the UI is updated
    await expect(priceComponent).toContainText('70000');
    expect(fetchCount).toBe(2);
});

    test.describe('with a successful price fetch', () => {
        // Before each test in this block, mock a successful API response.
        // This ensures the guess buttons are enabled, allowing us to test their functionality.
        test.beforeEach(async ({page}) => {
            await page.route('https://api.coingecko.com/api/v3/simple/price*', async (route) => {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({bitcoin: {usd: 65000}}),
                });
            });
            await page.goto('http://localhost:5173/index.html');
        });

        test('shows visual feedback for selected guess', async ({page}) => {
            const upButton = page.locator('#guess-up');
            // Click the Up button and check for visual feedback
            await expect(upButton).toBeEnabled();
            await upButton.click();
            await expect(upButton).toHaveClass(/selected|active/); // Adjust class as implemented
            // The Down button should not have the selected/active class
            const downButton = page.locator('#guess-down');
            await expect(downButton).not.toHaveClass(/selected|active/);
            await expect(downButton).toHaveClass(/disabled/);
            // Do not try to click the Down button after a guess is made, as it is now disabled
        });

        test('guess buttons are disabled after a guess is made', async ({page}) => {
            const upButton = page.locator('#guess-up');
            await expect(upButton).toBeEnabled();
            await upButton.click();
            await expect(page.locator('#guess-up')).toBeDisabled();
            await expect(page.locator('#guess-down')).toBeDisabled();
        });

        test('shows loading or waiting state for 60 seconds after guess before fetching new price', async ({page}) => {
            const upButton = page.locator('#guess-up');
            await expect(upButton).toBeEnabled();
            await upButton.click();
            // Immediately after guess, should show a waiting or loading state (not resolved)
            await expect(page.locator('#guess-message')).toContainText(/waiting|loading|pending|resolving/i);
            // (This will fail until the component implements a waiting state after a guess)
        });

        test('dispatches guess-made event when a guess is made', async ({page}) => {
            // Listen for the event in the browser context
            const eventPromise = page.evaluate(() => {
                return new Promise(resolve => {
                    const guessEl = document.querySelector('bitcoin-guess');
                    guessEl.addEventListener('guess-made', (event) => {
                        resolve(event.detail.guess);
                    }, {once: true});
                });
            });
            const upButton = page.locator('#guess-up');
            // Click the Up button to trigger the event
            await expect(upButton).toBeEnabled();
            await upButton.click();
            // Assert the event was dispatched with the correct detail
            const guess = await eventPromise;
            expect(guess).toBe('up');
        });

        test('parent node receives guess-made event when a guess is made', async ({page}) => {
            // Listen for the event on the parent node of bitcoin-guess
            const eventPromise = page.evaluate(() => {
                return new Promise(resolve => {
                    const guessEl = document.querySelector('bitcoin-guess');
                    const parent = guessEl.parentNode;
                    parent.addEventListener('guess-made', (event) => {
                        resolve(event.detail.guess);
                    }, {once: true});
                });
            });
            const downButton = page.locator('#guess-down');
            // Click the Down button to trigger the event
            await expect(downButton).toBeEnabled();
            await downButton.click();
            // Assert the event was dispatched with the correct detail
            const guess = await eventPromise;
            expect(guess).toBe('down');
        });

        test('body receives guess-made event when a guess is made', async ({page}) => {
            // Listen for the event on document.body
            const eventPromise = page.evaluate(() => {
                return new Promise(resolve => {
                    document.body.addEventListener('guess-made', (event) => {
                        resolve(event.detail.guess);
                    }, {once: true});
                });
            });
            const upButton = page.locator('#guess-up');
            // Click the Up button to trigger the event
            await expect(upButton).toBeEnabled();
            await upButton.click();
            // Assert the event was dispatched with the correct detail
            const guess = await eventPromise;
            expect(guess).toBe('up');
        });

        test('guess-made event includes guess and initialPrice details', async ({page}) => {
            // Listen for the event and capture the full event detail
            const eventDetailPromise = page.evaluate(() => {
                return new Promise(resolve => {
                    document.body.addEventListener('guess-made', (event) => {
                        resolve(event.detail);
                    }, {once: true});
                });
            });

            // Make sure the price is visible before clicking
            await expect(page.locator('bitcoin-price')).toContainText('65000');

            // Click the Down button to trigger the event
            const downButton = page.locator('#guess-down');
            await expect(downButton).toBeEnabled();
            await downButton.click();

            // Get the complete event detail
            const eventDetail = await eventDetailPromise;

            // Assert the event contains both guess and initialPrice
            expect(eventDetail).toHaveProperty('guess');
            expect(eventDetail.guess).toBe('down');

            expect(eventDetail).toHaveProperty('initialPrice');
            expect(typeof eventDetail.initialPrice).toBe('number');
            expect(eventDetail.initialPrice).toBe(65000);
        });
});
});
