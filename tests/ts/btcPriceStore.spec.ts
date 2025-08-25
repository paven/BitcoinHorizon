import {expect, test} from '@playwright/test';
import {BTCPrice, isPriceValid, refreshPrice, store} from '../../web/lib/btcPriceStore';

test.describe('btcPriceStore', () => {
    // First create localStorage mock instance
    let localStorageMock: LocalStorageMock;

    test.beforeEach(async () => {
        // The 'global' object in Node.js is like 'window' in the browser.
        // First create the mock instance
        localStorageMock = new LocalStorageMock();

        // Then assign it to global.localStorage
        if (typeof window === 'undefined') {
            store.clear(BTCPrice, true); // true ensures complete clear
            (global as any).localStorage = localStorageMock;
        }

        // Only clear the store AFTER localStorage is properly set up
        store.clear(BTCPrice, true); // true ensures complete clear
    });

    test.afterEach(() => {
        // Ensure consistent cleanup after each test
        if (typeof window === 'undefined' && localStorageMock) {
            localStorageMock.clear();
        }
        store.clear(BTCPrice, true);
    });


    test.describe('isPriceValid()', () => {
        test('should return true for a valid, recent price', () => {
            const price: BTCPrice = {
                price: 50000, timestamp: Date.now(),
            };
            expect(isPriceValid(price)).toBe(true);
        });

        test('should return false for a price of 0', () => {
            const price: BTCPrice = {
                price: 0, timestamp: Date.now(),
            };
            expect(isPriceValid(price)).toBe(false);
        });

        test('should return false for a stale price (older than 60 seconds)', () => {
            const price: BTCPrice = {
                price: 50000, timestamp: Date.now() - 61 * 1000, // 61 seconds old
            };
            expect(isPriceValid(price)).toBe(false);
        });

    });


// --- Integration Tests for store logic (run in Node.js) ---

// Mock localStorage for the Node.js test environment, as the hybrids store might require it.
    class LocalStorageMock {
        private store: Record<string, string> = {};

        getItem(key: string): string | null {
            return this.store[key] || null;
        }

        setItem(key: string, value: any): void {
            this.store[key] = String(value);
        }

        removeItem(key: string): void {
            delete this.store[key];
        }

        clear(): void {
            this.store = {};
        }
    }

    test.describe('BTC Store tests', () => {
        test.describe.configure({mode: 'serial'})

        // --- Console Mocking ---
        let consoleErrorMessages: any[][] = [];
        const originalConsoleError = console.error;

        test.beforeEach(() => {
            consoleErrorMessages = [];
            console.error = (...args: any[]) => {
                consoleErrorMessages.push(args);
            };
        });

        test.afterEach(() => {
            console.error = originalConsoleError;
        });
        // --- End Console Mocking ---

        test.describe('BTCPrice Store Data Fetching in Node.js', () => {
            test.describe.configure({mode: 'serial'})

            test('should fetch and return a valid price on API success', async () => {
                const mockPrice = 55000.42;
                const mockResponse = {bitcoin: {usd: mockPrice}};

                global.fetch = async () => new Response(JSON.stringify(mockResponse), {
                    status: 200, headers: {'Content-Type': 'application/json'},
                });

                const priceData = await store.resolve(BTCPrice);

                expect(priceData.price).toBe(mockPrice);
                expect(priceData.timestamp).toBeGreaterThan(Date.now() - 5000);
                expect(store.error(priceData)).toBe(false);
            });

            test('should keep prior data, log error, and set error state on subsequent API failure', async () => {
                const mockPrice = 55000.42;
                const mockSuccessResponse = {bitcoin: {usd: mockPrice}};
                let fetchCallCount = 0;
                // Mock fetch to succeed first, then fail
                global.fetch = async () => {
                    fetchCallCount++;
                    if (fetchCallCount === 1) {
                        return new Response(JSON.stringify(mockSuccessResponse), {
                            status: 200, headers: {'Content-Type': 'application/json'}
                        });
                    } else {
                        return new Response('Server Down', {status: 500});
                    }
                };

                // 1. First call - success
                const initialPriceData = await store.resolve(BTCPrice) as BTCPrice;
                expect(initialPriceData.price).toBe(mockPrice);
                expect(store.error(initialPriceData)).toBe(false);

                // 2. Invalidate cache and trigger second call - failure
                store.clear(BTCPrice, false); // Invalidate cache, keep old value
                await expect(store.resolve(BTCPrice)).rejects.toThrow("does not exist");

                // 3. Check that an error was logged to the console
                expect(consoleErrorMessages.length).toBe(1);
                expect(consoleErrorMessages[0][0]).toContain('BTCPrice store fetch error:');
                expect(consoleErrorMessages[0][1]).toContain('HTTP error! status: 500');

                // 4. Check state after rejection
                const subsequentPriceData = store.get(BTCPrice);
                // We cannot access properties on a model in an error state, even if it has stale data.
                // This is a protective measure from `hybrids`.
                // The key assertions are that the model is both `ready` and in an `error` state.
                expect(store.ready(subsequentPriceData)).toBe(true); // Has old data
                const error = store.error(subsequentPriceData);
                expect(error).toBeInstanceOf(Error);
                // The error message comes from hybrids for a "not found" condition on a singleton
                expect((error as Error).message).toContain("does not exist");
            });

            test('should log an error and result in an error state when API fails on initial fetch', async () => {
                // Simulate a server error, which causes our get() to return null
                global.fetch = async () => new Response('Server Down', {status: 500});

                // store.resolve should reject when the get() method returns null
                await expect(store.resolve(BTCPrice)).rejects.toThrow("does not exist");

                // Check console log
                expect(consoleErrorMessages.length).toBe(1);
                expect(consoleErrorMessages[0][0]).toContain('BTCPrice store fetch error:');
                expect(consoleErrorMessages[0][1]).toContain('HTTP error! status: 500');

                const priceData = store.get(BTCPrice);

                // On an initial fetch failure, the model is in an error state and not ready.
                // We cannot access its properties directly.
                expect(store.ready(priceData)).toBe(false);
                expect(store.pending(priceData)).toBe(false);
                const error = store.error(priceData);
                expect(error).toBeInstanceOf(Error);
                expect((error as Error).message).toContain("does not exist");
            });
        });

        test.describe('BTCPrice Store Caching in Node.js', () => {
            let fetchCallCount = 0;

            test.beforeEach(() => {
                fetchCallCount = 0;
                const mockPrice = 55000.42;
                const mockResponse = {bitcoin: {usd: mockPrice}};

                global.fetch = async () => {
                    fetchCallCount++;
                    return new Response(JSON.stringify(mockResponse), {
                        status: 200, headers: {'Content-Type': 'application/json'},
                    });
                };
            });


            test('should use cache for subsequent calls within the cache duration', async () => {
                await store.resolve(BTCPrice);
                expect(fetchCallCount).toBe(1);

                await store.resolve(BTCPrice);
                expect(fetchCallCount).toBe(1); // Should not have increased
            });

            test('refreshPrice should force a new fetch', async () => {
                await store.resolve(BTCPrice);
                expect(fetchCallCount).toBe(1);

                refreshPrice();
                await store.resolve(BTCPrice);
                expect(fetchCallCount).toBe(2);
            });
        });
    });

    // --- Page-Context Integration Test ---
    // This test is moved to a browser context to leverage Playwright's automatic
    // test isolation. Each test run gets a fresh page, a clean JavaScript environment,
    // and a new module cache, which completely prevents state leakage issues
    // like the one with the module-level `lastModel` variable.
    test.describe('Store tests in Page Context', () => {
        test('should show an error state on API failure in a clean browser context', async ({page}) => {
            // 1. Mock the API route to return a 404 error.
            // This is the browser-equivalent of mocking `global.fetch`.
            await page.route('https://api.coingecko.com/api/v3/simple/price*', async route => {
                await route.fulfill({
                    status: 404,
                    body: 'Not Found',
                });
            });
            page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));

            // Use a minimal test page to avoid side effects from other components.
            await page.goto('http://localhost:5173/tests.html');

            // 2. Run the test logic within the browser's context.
            // `page.evaluate` allows us to execute code on the page.
            const priceData = await page.evaluate(async () => {
                // Instead of loading an external component, we define a minimal one here.
                // This ensures the test is completely self-contained and only tests
                // the store's behavior when used by a component.
                const {BTCPrice, store, define, html} = await import('/lib/btcPriceStore.ts');

                // Define a simple test component that connects to the BTCPrice store model.
                define({
                    tag: 'test-component',
                    price: store(BTCPrice), // This property will be managed by the store.
                    render: ({price}) => html`
                        <div>${store.ready(price) ? `$${price.price}` : 'Loading...'}</div>`,
                });

                // Add the component to the DOM, which triggers the store's fetch logic.
                const component = document.createElement('test-component');
                document.body.appendChild(component);

                // We poll until the component's `price` property (the store model)
                // enters an error state. This confirms the async operation has completed.
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => reject(new Error('Timeout waiting for component to update')), 5000);
                    const interval = setInterval(() => {
                        // The component's `price` property is the store model.
                        if (component.price && store.error(component.price)) {
                            clearInterval(interval);
                            clearTimeout(timeout);
                            resolve();
                        }
                    }, 10);
                });

                // Now that the store has settled, return its state for assertion.
                const model = store.get(BTCPrice);
                const error = store.error(model);
                return {
                    // We cannot access properties on a model in an error state.
                    // Instead, we check the state guards.
                    hasError: !!error,
                    isReady: store.ready(model),
                };
            });

            // 3. Assert the results returned from the browser.
            expect(priceData.hasError).toBe(true);
            expect(priceData.isReady).toBe(false);
        });
    });
});