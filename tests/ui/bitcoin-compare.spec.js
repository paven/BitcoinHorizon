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

    test('updates when user clicks a guess button in bitcoin-guess', async ({page}) => {
        await page.goto('http://localhost:5173/index.html');

        const compare = page.locator('bitcoin-compare');
        const guessUpButton = page.locator('bitcoin-guess #guess-up');

        // Check initial state
        await expect(compare).toContainText('Waiting for guess');

        // Click the button in the other component
        await guessUpButton.click();

        // Assert the change in this component
        await expect(compare).toContainText('Guess: up');
    });

    test('receives and displays initial price when a guess is made', async ({page}) => {
        await page.goto('http://localhost:5173/index.html');

        const priceComponent = page.locator('bitcoin-price');
        const compareComponent = page.locator('bitcoin-compare');
        const guessUpButton = page.locator('bitcoin-guess #guess-up');

        // 1. Wait for the initial price to load and get its value
        await expect(priceComponent.locator('strong')).toBeVisible({timeout: 10000});
        const initialPrice = await priceComponent.evaluate(el => el.price.price);

        // 2. Make a guess
        await guessUpButton.click();

        // 3. Assert that the compare component now shows the initial price
        await expect(compareComponent).toContainText(`Initial Price: ${initialPrice}`);
    });
});
