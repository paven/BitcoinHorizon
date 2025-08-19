import {test, expect} from '@playwright/test';

test.describe('bitcoin-guess button interactions', () => {
    test.beforeEach(async ({page}) => {
        // Mock the API route to ensure the guess buttons are enabled for these tests.
        await page.route('https://api.coingecko.com/api/v3/simple/price*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({bitcoin: {usd: 68000}}),
            });
        });
        await page.goto('http://localhost:5173/index.html');
    });

    test('clicking Up sets guess to up and isGuessActive true', async ({page}) => {
        const guessEl = await page.locator('bitcoin-guess');
        await expect(guessEl).toBeVisible();
        await page.click('#guess-up');
        // Evaluate the custom element's properties
        const guess = await guessEl.evaluate(el => el.guess);
        const isGuessActive = await guessEl.evaluate(el => el.isGuessActive);
        expect(guess).toBe('up');
        expect(isGuessActive).toBe(true);
    });

    test('clicking Down sets guess to down and isGuessActive true', async ({page}) => {
        const guessEl = await page.locator('bitcoin-guess');
        await expect(guessEl).toBeVisible();
        await page.click('#guess-down');
        // Evaluate the custom element's properties
        const guess = await guessEl.evaluate(el => el.guess);
        const isGuessActive = await guessEl.evaluate(el => el.isGuessActive);
        expect(guess).toBe('down');
        expect(isGuessActive).toBe(true);
    });

    test('dispatches guess-made event with timestamp when a guess is made', async ({page}) => {
        const guessUpButton = page.locator('#guess-up');

        // Listen for the 'guess-made' event and capture its detail
        const guessMadeDetail = page.evaluate(() => {
            return new Promise(resolve => {
                document.addEventListener('guess-made', e => resolve(e.detail), {once: true});
            });
        });

        // Click the button to trigger the event
        await guessUpButton.click();

        // Await the event detail and assert its contents
        const detail = await guessMadeDetail;
        expect(detail).toHaveProperty('timestamp');
        expect(typeof detail.timestamp).toBe('number');
        expect(detail.timestamp).toBeGreaterThan(Date.now() - 5000); // Check if timestamp is recent
    });
});
