import {expect, test} from '@playwright/test';

async function mockPrice(page, prices = [68000], fetchUrl = 'https://api.coingecko.com/api/v3/simple/price*', fetchCount = 0) {
    const priceList = Array.isArray(prices) ? prices : [prices];

    await page.route(fetchUrl, async (route) => {
        const price = priceList[fetchCount] ?? priceList[priceList.length - 1];
        fetchCount++;
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({bitcoin: {usd: price}}),
        });
    });
}

test.describe('bitcoin-compare', () => {
    test.beforeEach(async ({page}) => {
        // Go to the page once for the test suite.
        // Individual tests will handle clearing state, mocking, and reloading.
        // Clear storage to ensure a clean state before applying mocks and reloading.
        await mockPrice(page, [68000], 'https://api.coingecko.com/api/v3/simple/price*');
        await page.goto('http://localhost:5173/index.html');
        await page.evaluate(() => window.localStorage.clear());
        await page.goto('about:blank');

    });
    test('shows "Waiting for guess" initially and guess is null or undefined', async ({page}) => {
        await page.goto('http://localhost:5173/index.html')

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
        await page.goto('http://localhost:5173/index.html')

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
        await page.goto('http://localhost:5173/index.html')

        const compare = page.locator('bitcoin-compare');
        const guessUpButton = page.locator('bitcoin-guess #guess-up');

        // Check initial state
        await expect(compare).toContainText('Waiting for guess');

        // Click the button in the other component
        await expect(guessUpButton).toBeEnabled();

        await guessUpButton.click();

        // Assert the change in this component
        await expect(compare).toContainText('Guess: up');
    });

    test('receives and displays initial price when a guess is made', async ({page}) => {
        await page.goto('http://localhost:5173/index.html')

        const priceComponent = page.locator('bitcoin-price');
        const compareComponent = page.locator('bitcoin-compare');
        const guessUpButton = page.locator('bitcoin-guess #guess-up');

        // 1. Wait for the initial price to load and get its value
        await expect(priceComponent).toBeVisible({timeout: 10000});
        const initialPrice = await priceComponent.evaluate(el => el.price.price);
        expect(initialPrice).toBe(68000);

        // 2. Make a guess
        await expect(guessUpButton).toBeEnabled();
        await guessUpButton.click();

        // 3. Assert that the compare component now shows the initial price
        await expect(compareComponent).toContainText(`Initial Price: ${initialPrice}`);
    });

    test('receives and displays the new price after a refresh', async ({page}) => {
        await mockPrice(page, [68000, 72000]);
        await page.goto('http://localhost:5173/index.html');

        const priceComponent = page.locator('bitcoin-price');
        const compareComponent = page.locator('bitcoin-compare');
        const guessUpButton = page.locator('bitcoin-guess #guess-up');

        // 1. Wait for initial price and make a guess
        await expect(priceComponent).toContainText('68000');
        await expect(guessUpButton).toBeEnabled();
        await guessUpButton.click();
        await expect(compareComponent).toContainText('Initial Price: 68000');

        // 2. Manually trigger a price refresh (simulating the 60s timer)
        await priceComponent.dispatchEvent('refresh-btc-price');

        // 3. Assert that the compare component now shows the new price
        await expect(priceComponent).toContainText('72000'); // First, confirm the price component updated
        await expect(compareComponent).toContainText('New Price: 72000');
    });

    test('shows "Correct" when price goes up and guess was "up"', async ({page}) => {
        await mockPrice(page, [68000, 72000], 'https://api.coingecko.com/api/v3/simple/price*');
        page.goto('http://localhost:5173/index.html')
        const priceComponent = page.locator('bitcoin-price');
        const compareComponent = page.locator('bitcoin-compare');
        const guessUpButton = page.locator('bitcoin-guess #guess-up');

        await expect(priceComponent).toContainText('68000');
        await expect(guessUpButton).toBeEnabled();
        await guessUpButton.click();

        await priceComponent.dispatchEvent('refresh-btc-price');

        await expect(compareComponent).toContainText('Result: Correct');
    });

    test('shows "Incorrect" when price goes down and guess was "up"', async ({page}) => {
        await mockPrice(page, [68000, 65000], 'https://api.coingecko.com/api/v3/simple/price*');
        await page.goto('http://localhost:5173/index.html')

        const priceComponent = page.locator('bitcoin-price');
        const compareComponent = page.locator('bitcoin-compare');
        const guessUpButton = page.locator('bitcoin-guess #guess-up');

        await expect(priceComponent).toContainText('68000');
        await expect(guessUpButton).toBeEnabled();
        await guessUpButton.click();

        await priceComponent.dispatchEvent('refresh-btc-price');

        await expect(compareComponent).toContainText('Result: Incorrect');
    });

    test('unlocks guess buttons after guess is resolved', async ({page}) => {
        await mockPrice(page, [68000, 72000], 'https://api.coingecko.com/api/v3/simple/price*');
        page.goto('http://localhost:5173/index.html')

        const guessUpButton = page.locator('bitcoin-guess #guess-up');
        const guessDownButton = page.locator('bitcoin-guess #guess-down');

        await expect(guessUpButton).toBeEnabled();
        await guessUpButton.click();
        await expect(guessUpButton).toBeDisabled();

        await page.locator('bitcoin-price').dispatchEvent('refresh-btc-price');

        await expect(guessUpButton).toBeEnabled();
        await expect(guessDownButton).toBeEnabled();
    });
});
