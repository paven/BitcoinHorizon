import {expect, test} from '@playwright/test';
import {setupCountdown} from "../../web/lib/btcGuessStore";


test.describe('guess-evaluator component', () => {
    test.beforeEach(async ({page}) => {
        await page.addInitScript(() => {
            window.localStorage.clear();
        });
    });

    test.skip('renders countdown for a pending last guess', async ({page}) => {
        const guess = {
            direction: 'down',
            status: 'new',
            outcome: 'pending',
            initialPrice: 110212,
            initialTimestamp: Date.now(),
            playerId: '',
        };

        await page.goto('http://localhost:5173/tests.html');
        await page.waitForLoadState('networkidle');

        // Use the same model definition as the app and delete all guesses individually
        await page.evaluate(async (guess) => {
            // Import from the same path as the app uses everywhere
            const {Guess, store} = await import('/lib/btcGuessStore.js');
            const all = store.get([Guess]);
            for (const item of all) {
                await store.set(item, null);
            }
            await store.set(Guess, guess);
        }, guess);

        await page.evaluate(() => {
            const el = document.createElement('guess-evaluator');
            document.body.appendChild(el);
        });

        await page.waitForFunction(() => {
            const el = document.querySelector('guess-evaluator');
            return el && el.textContent && el.textContent.includes('Guess pending. Resolves in:');
        }, {timeout: 2000});

        const countdownText = await page.locator('guess-evaluator').textContent();
        expect(countdownText).toContain('Guess pending. Resolves in:');
    });

    test.skip('setupCountdown sets secondsLeft and intervalId for a new guess', async ({page}) => {
        const guess = {
            direction: 'up',
            status: 'new',
            outcome: 'pending',
            initialPrice: 12345,
            initialTimestamp: Date.now(),
            playerId: 'test-player',
        };

        await page.goto('http://localhost:5173/tests.html');
        await page.waitForLoadState('networkidle');

        await page.evaluate(async (guess) => {
            const {Guess, store} = await import('/lib/btcGuessStore.js');
            const all = store.get([Guess]);
            for (const item of all) {
                await store.set(item, null);
            }
            await store.set(Guess, guess);
        }, guess);

        // Add the component and access its internals
        await page.evaluate(() => {
            const el = document.createElement('guess-evaluator');
            document.body.appendChild(el);
        });

        // Wait for the component to initialize
        await page.waitForFunction(() => {
            const el = document.querySelector('guess-evaluator');
            return el && el.guess && typeof el.secondsLeft === 'number';
        });

        // Check that secondsLeft is set and intervalId is not null
        const {secondsLeft, intervalId} = await page.evaluate(() => {
            const el = document.querySelector('guess-evaluator');
            return {
                secondsLeft: el.secondsLeft,
                intervalId: el.intervalId,
            };
        });

        expect(typeof secondsLeft).toBe('number');
        expect(secondsLeft).toBeGreaterThanOrEqual(0);
        expect(intervalId).not.toBeNull();

        // Clean up: remove the component
        await page.evaluate(() => {
            const el = document.querySelector('guess-evaluator');
            if (el) el.remove();
        });
    });

    // --- Purely functional test for setupCountdown ---

    test.skip('setupCountdown sets secondsLeft and intervalId for a valid guess (pure function)', async () => {
        // Arrange: mock host and guess
        const now = Date.now();
        const guess = {
            direction: 'up',
            status: 'new',
            outcome: 'pending',
            initialPrice: 12345,
            initialTimestamp: now - 5000, // 5 seconds ago
            playerId: 'test-player',
        };
        const GuessStoreModule = await import('../../web/lib/btcGuessStore');

        const guessSetReturn = GuessStoreModule.store.set(GuessStoreModule.Guess, guess);

        var ticks = 0
        while (GuessStoreModule.store.error(guessSetReturn)) ticks++;
        console.log('ticks', ticks);
        console.log("Error?", GuessStoreModule.store.error(guessSetReturn));
        console.log("ready?", GuessStoreModule.store.ready(guessSetReturn));
        console.log("pending?", GuessStoreModule.store.pending(guessSetReturn));
        console.log("pgWTF?", GuessStoreModule.store.pgWTF(guessSetReturn))


        const host: any = {
            guess: await GuessStoreModule.lastGuess(),
            secondsLeft: 0,
            intervalId: false,
            render: () => {
            },
        };

        // Act
        setupCountdown(host);

        // Assert
        expect(host.guess).toBeDefined();
        expect(GuessStoreModule.store.ready(host.guess)).toBe(true);
        expect(host.guess.initialTimestamp).toBe(guess.initialTimestamp);
        expect(host.secondsLeft).toBeGreaterThanOrEqual(54); // 60 - 5 = 55, allow 1s drift
        expect(typeof host.intervalId).toBe('number');

        // Cleanup
        GuessStoreModule.lastGuess = originalLastGuess;
    });
});
