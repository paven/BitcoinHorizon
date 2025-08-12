import {test, expect} from '@playwright/test';

test.describe('bitcoin-compare', () => {
    test('shows "Waiting for guess" initially and guess is null or undefined', async ({page}) => {
        await page.goto('http://localhost:5173/index.html');
        // Ensure the component is present
        const compare = await page.locator('bitcoin-compare');
        await expect(compare).toBeVisible();
        // Check for initial text
        await expect(compare).toContainText('Waiting for guess');
        // Check the guess property is null or undefined
        const guess = await compare.evaluate(el => el.guess);
        expect(guess === undefined || guess === null).toBeTruthy();
    });
    test('updates guess when guess-made event is dispatched', async ({page}) => {
        await page.goto('http://localhost:5173/index.html');
        const compare = await page.locator('bitcoin-compare');
        // Dispatch the event from the bitcoin-guess element
        await page.evaluate(() => {
            const guessEl = document.querySelector('bitcoin-guess');
            guessEl.dispatchEvent(new CustomEvent('guess-made', {
                detail: {guess: 'up'},
                bubbles: true,
                composed: true
            }));
        });
        // Wait for the component to update
        await expect(compare).toContainText('Guess: up');
        // Check the property is updated
        const guess = await compare.evaluate(el => el.guess);
        expect(guess).toBe('up');
    });
});
