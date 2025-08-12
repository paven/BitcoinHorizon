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
});
