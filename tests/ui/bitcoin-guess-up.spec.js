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
});
