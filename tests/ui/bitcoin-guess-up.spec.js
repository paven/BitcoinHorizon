import {test, expect} from '@playwright/test';

test('clicking Up sets guess to up and isGuessActive true', async ({page}) => {
    await page.goto('http://localhost:5173/index.html');
    const guessEl = await page.locator('bitcoin-guess');
    await expect(guessEl).toBeVisible();
    await page.click('#guess-up');
    // Evaluate the custom element's properties
    const guess = await guessEl.evaluate(el => el.guess);
    const isGuessActive = await guessEl.evaluate(el => el.isGuessActive);
    expect(guess).toBe('up');
    expect(isGuessActive).toBe(true);
});
