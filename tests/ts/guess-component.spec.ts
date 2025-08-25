import {expect, test} from '@playwright/test';

// Attach browser log handler only once per worker
let browserLogAttached = false;

test.describe('GuessComponent', () => {
    test.beforeEach(async ({page}) => {
        if (!browserLogAttached) {
            page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
            browserLogAttached = true;
        }
        await page.goto('http://localhost:5173/tests.html');
        console.log('Navigated to test page');
    });

    test('should render loading, then ready state, and handle a guess', async ({page}) => {
        const mockPrice = 50000;
        await page.route('https://api.coingecko.com/api/v3/simple/price*', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({bitcoin: {usd: mockPrice}}),
            });
        });
        console.log('API route mocked');
        await page.waitForLoadState('networkidle');
        // Use addScriptTag to load the component script
        await page.addScriptTag({url: 'http://localhost:5173/components/guess-component.ts', type: 'module'});
        console.log('Component script loaded');
        await page.waitForLoadState('networkidle');

        await page.evaluate(() => {
            const el = document.createElement('guess-component');
            document.body.appendChild(el);
        });
        // Set the playerId property
        let guessComponentLocator = page.locator('guess-component');
        await guessComponentLocator.evaluate((el: any) => {
            el.playerId = 'test-player';
        });

        await page.waitForLoadState('networkidle');
        const guessUpButton = guessComponentLocator.locator('#guess-up');
        console.log('Component visible');

        await expect(guessUpButton).toBeVisible();
        console.log('Up button is visible');

        expect(guessUpButton).toBeEnabled();
        console.log('Up button is enabled');

        await guessUpButton.click();
        console.log("guessUpButton", await guessUpButton.getAttribute('onclick'));
        console.log('Clicked Up button');

        // Wait for the store to update and the button to become disabled
        await page.waitForTimeout(100);

        console.log('Waiting for buttons to become disabled...');
        await expect(guessUpButton).toBeDisabled();

        console.log('Checking guess in store...');
        // This works because in your component code (makeGuess), you explicitly assign the guesses array to window.__guesses__:
        // window.__guesses__ = store.get([Guess]);

        const result = await page.evaluate(() => {
            return window.__guesses__ || [];
        });
        console.log('Store checked, result:', result);

        await expect(result.length).toBe(1);
        await expect(result[0].playerId).toBe('test-player');
        await expect(result[0].initialPrice).toBe(mockPrice);
        await expect(result[0].direction).toBe('up');
        console.log('Assertions complete');
    });
});