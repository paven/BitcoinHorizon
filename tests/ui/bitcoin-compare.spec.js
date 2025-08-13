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
        // Mock the API route to ensure the test is reliable and not dependent on a live service.
        await page.route('https://api.coingecko.com/api/v3/simple/price*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({bitcoin: {usd: 68000}}),
            });
        });

        await page.goto('http://localhost:5173/index.html');

        const priceComponent = page.locator('bitcoin-price');
        const compareComponent = page.locator('bitcoin-compare');
        const guessUpButton = page.locator('bitcoin-guess #guess-up');

        // 1. Wait for the initial price to load and get its value
        await expect(priceComponent.locator('strong')).toBeVisible({timeout: 10000});
        const initialPrice = await priceComponent.evaluate(el => el.price.price);
        expect(initialPrice).toBe(68000);

        // 2. Make a guess
        await guessUpButton.click();

        // 3. Assert that the compare component now shows the initial price
        await expect(compareComponent).toContainText(`Initial Price: ${initialPrice}`);
    });

    test('receives and displays the new price after a refresh', async ({page}) => {
        let fetchCount = 0;
        // Mock the API to return different prices on subsequent calls
        await page.route('https://api.coingecko.com/api/v3/simple/price*', async (route) => {
            fetchCount++;
            const price = fetchCount === 1 ? 68000 : 72000;
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({bitcoin: {usd: price}}),
            });
        });

        await page.goto('http://localhost:5173/index.html');

        const priceComponent = page.locator('bitcoin-price');
        const compareComponent = page.locator('bitcoin-compare');
        const guessUpButton = page.locator('bitcoin-guess #guess-up');

        // 1. Wait for initial price and make a guess
        await expect(priceComponent).toContainText('68000');
        await guessUpButton.click();
        await expect(compareComponent).toContainText('Initial Price: 68000');

        // 2. Manually trigger a price refresh (simulating the 60s timer)
        await priceComponent.dispatchEvent('refresh-btc-price');

        // 3. Assert that the compare component now shows the new price
        await expect(priceComponent).toContainText('72000'); // First, confirm the price component updated
        await expect(compareComponent).toContainText('New Price: 72000');
    });
});
