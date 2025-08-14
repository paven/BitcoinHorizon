import {test, expect} from '@playwright/test';

test.describe('Session Persistence', () => {
    test('score persists after reloading the page', async ({page}) => {
        // --- Setup: Make a correct guess to get a score of 1 ---
        let fetchCount = 0;
        await page.route('https://api.coingecko.com/api/v3/simple/price*', async (route) => {
            fetchCount++;
            // The test setup (goto, clear, reload) causes two initial fetches.
            const price = fetchCount < 3 ? 68000 : 72000; // Price goes up for a correct guess
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({bitcoin: {usd: price}}),
            });
        });

        // To ensure a clean slate, navigate to the page, clear localStorage,
        // and then reload. This ensures the test starts with a known empty state
        // and the mock API is active.
        await page.goto('http://localhost:5173/index.html');
        await page.evaluate(() => window.localStorage.clear());
        await page.reload();

        const scoreDisplay = page.locator('score-display');
        const guessUpButton = page.locator('bitcoin-guess #guess-up');
        const priceComponent = page.locator('bitcoin-price');

        // Verify initial state
        await expect(scoreDisplay).toContainText('Score: 0');
        await expect(priceComponent).toContainText('68000');

        // Make a correct guess
        await guessUpButton.click();
        await priceComponent.dispatchEvent('refresh-btc-price');

        // Verify score is 1 before reload
        await expect(scoreDisplay).toContainText('Score: 1');

        // Explicitly wait for the asynchronous `store.set` operation to complete
        // by polling localStorage. This keeps the test robust without modifying
        // production code with test-specific `await`s.
        await page.waitForFunction(() => {
            const storedGame = localStorage.getItem('bitcoin-horizon-game');
            if (!storedGame) return false;
            try {
                return JSON.parse(storedGame).score === 1;
            } catch (e) {
                return false;
            }
        });

        // --- Action: Reload the page ---
        await page.reload();

        // --- Assertion: Check if score is still 1 after reloading ---
        await expect(scoreDisplay).toContainText('Score: 1');
    });
});