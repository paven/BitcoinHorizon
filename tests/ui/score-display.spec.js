import {test, expect} from '@playwright/test';

test.describe('score-display', () => {
    test('renders and shows an initial score of 0', async ({page}) => {
        await page.goto('http://localhost:5173/index.html');

        const scoreDisplay = page.locator('score-display');
        await expect(scoreDisplay).toBeVisible();
        await expect(scoreDisplay).toContainText('Score: 0');
    });

    test('increments score when a guess is correct', async ({page}) => {
        let fetchCount = 0;
        await page.route('https://api.coingecko.com/api/v3/simple/price*', async (route) => {
            fetchCount++;
            const price = fetchCount === 1 ? 68000 : 72000; // Price goes up
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({bitcoin: {usd: price}}),
            });
        });

        await page.goto('http://localhost:5173/index.html');

        const scoreDisplay = page.locator('score-display');
        const priceComponent = page.locator('bitcoin-price');
        const guessUpButton = page.locator('bitcoin-guess #guess-up');
        const compareComponent = page.locator('bitcoin-compare');

        await expect(scoreDisplay).toContainText('Score: 0');
        await expect(priceComponent).toContainText('68000');

        await guessUpButton.click();
        await priceComponent.dispatchEvent('refresh-btc-price');
        await expect(compareComponent).toContainText('Result: Correct');

        await expect(scoreDisplay).toContainText('Score: 1');
    });

    test('does not increment score when a guess is incorrect', async ({page}) => {
        let fetchCount = 0;
        await page.route('https://api.coingecko.com/api/v3/simple/price*', async (route) => {
            fetchCount++;
            const price = fetchCount === 1 ? 68000 : 65000; // Price goes down
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({bitcoin: {usd: price}}),
            });
        });

        await page.goto('http://localhost:5173/index.html');

        await page.locator('bitcoin-guess #guess-up').click();
        await page.locator('bitcoin-price').dispatchEvent('refresh-btc-price');

        await expect(page.locator('bitcoin-compare')).toContainText('Result: Incorrect');
        await expect(page.locator('score-display')).toContainText('Score: 0');
    });
});