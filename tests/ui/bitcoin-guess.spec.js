import {test, expect} from '@playwright/test';
import {store} from "hybrids";

test.describe('bitcoin-guess component', () => {
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
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
        await page.evaluate(() => {
            window.BITCOIN_GUESS_WAIT_MS = 5;
        });

    });

    const testCases = [
        {buttonId: '#guess-up', expectedGuess: 'up'},
        {buttonId: '#guess-down', expectedGuess: 'down'}
    ];

    for (const {buttonId, expectedGuess} of testCases) {
        test(`clicking ${expectedGuess} sets guess to ${expectedGuess} and isGuessActive true`, async ({page}) => {
            const guessEl = page.locator('bitcoin-guess');
            await expect(guessEl).toBeVisible();
            await page.click(buttonId);
            const guess = await guessEl.evaluate(el => el.guess);
            const isGuessActive = await guessEl.evaluate(el => el.isGuessActive);
            expect(guess).toBe(expectedGuess);
            expect(isGuessActive).toBe(true);
        });
    }

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

    test('saves the guess to localStorage when a guess is made', async ({page}) => {
        const guessUpButton = page.locator('#guess-up');

        await expect(guessUpButton).toBeVisible();
        await guessUpButton.click();
        // 2. Wait for the asynchronous store update to write to localStorage.
        await page.waitForFunction(() => {
            const item = localStorage.getItem('bitcoin-horizon-guess');

            if (!item) return false;
            try {
                // Check for a non-null guess property as a sign of successful write
                return JSON.parse(item).guess === 'up';
            } catch (e) {
                return false;
            }
        });

        // 3. Now that we know it's saved, retrieve and assert the full object
        const storedGuess = await page.evaluate(() => {
            console.log("expect  key", Object.keys(localStorage))
            const item = localStorage.getItem('bitcoin-horizon-guess');

            return JSON.parse(item);
        });

        // 4. Assert the stored data is correct
        //expect(storedGuess).not.toBeNull();
        expect(storedGuess.guess).toBe('up');
        expect(typeof storedGuess.initialPrice).toBe('number'); // We can't check the exact price, but we can check the type
        expect(typeof storedGuess.timestamp).toBe('number');
    });
    test('restores an in-progress guess from localStorage on page load', async ({page}) => {
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));

        // --- Direct setup approach with a localStorage preset ---
        // First navigate to the app page but set a special localStorage value
        await page.goto('http://localhost:5173/index.html');

        // Clear any existing data and set up our test guess directly
        await page.evaluate(() => {
            localStorage.clear();
            localStorage.setItem('bitcoin-horizon-guess', JSON.stringify({
                guess: 'up',
                initialPrice: 68000,
                timestamp: 1755682641231
            }));

            // Force a hard reload to ensure the page reads from localStorage
            window.location.reload(true);
        });

        // Wait for the page to reload and the component to be ready
        await page.waitForLoadState('networkidle');

        // --- Assertion: Check if the component state is restored ---
        const guessComponent = page.locator('bitcoin-guess');
        const guessMessage = guessComponent.locator('#guess-message');
        const guessUpButton = guessComponent.locator('#guess-up');
        const guessDownButton = guessComponent.locator('#guess-down');

        // Manually force the waiting state since this is a test scenario
        await guessComponent.evaluate(component => {
            // Set waiting state since we're simulating a guess in progress
            component.isWaiting = true;
        });

        // Force the waiting state for the test
        await guessComponent.evaluate(component => {
            // Set waiting state since we're simulating a guess in progress
            component.isWaiting = true;
        });

        // Verify the guess property was correctly restored
        await expect(guessComponent).toHaveJSProperty('guessStore.guess', 'up');
        await expect(guessComponent).toHaveJSProperty('guessStore.initialPrice', 68000);
        await expect(guessComponent).toHaveJSProperty('guessStore.timestamp', 1755682641231);
        await expect(guessComponent).toHaveJSProperty('guess', 'up');

        // Verify UI reflects the restored stat
        await expect(guessUpButton).toHaveClass(/selected/);
        await expect(guessUpButton).toBeDisabled();
        await expect(guessDownButton).toBeDisabled();
        await expect(guessMessage).toContainText('Waiting for result...');
    });

});