import {expect, test} from '@playwright/test';
import type {IBTCPriceData} from '../../web/lib/btcPriceStore';
import {BTCPrice, isPriceValid, refreshPrice, store} from '../../web/lib/btcPriceStore';
import type {Model} from 'hybrids';

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
            const price: IBTCPriceData = {
                price: 50000, timestamp: Date.now(), error: '', errorLog: [],
            };
            expect(isPriceValid(price)).toBe(true);
        });

        test('should return false for a price of 0', () => {
            const price: IBTCPriceData = {
                price: 0, timestamp: Date.now(), error: '', errorLog: [],
            };
            expect(isPriceValid(price)).toBe(false);
        });

        test('should return false if there is an error string', () => {
            const price: IBTCPriceData = {
                price: 50000, timestamp: Date.now(), error: 'An error occurred', errorLog: [],
            };
            expect(isPriceValid(price)).toBe(false);
        });

        test('should return false for a stale price (older than 60 seconds)', () => {
            const price: IBTCPriceData = {
                price: 50000, timestamp: Date.now() - 61 * 1000, // 61 seconds old
                error: '', errorLog: [],
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


    /**
     * The hybrids store.get() method resolves immediately with a proxy object
     * while data is fetched in the background. In a non-component context like these tests,
     * we need to manually wait for the data to be ready or for an error to occur.
     * This helper polls the store's status until it's no longer pending.
     */
    async function waitForStoreToSettle(model: Model<any>) {
        // Trigger the fetch, which happens in the background.
        store.get(model);

        // Yield to the event loop to allow the store to enter the pending state
        // before we start polling it. This prevents a race condition.
        await new Promise(resolve => setImmediate(resolve));

        // Poll the store's status until it is no longer pending.
        while (store.pending(model)) {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        return store.get(model);
    }

    test.describe('Store tests', () => {
        test.describe.configure({mode: 'serial'})

        test.describe('BTCPrice Store Data Fetching in Node.js', () => {
            test.describe.configure({mode: 'serial'})

            test('should fetch and return a valid price on API success', async () => {
                const mockPrice = 55000.42;
                const mockResponse = {bitcoin: {usd: mockPrice}};

                global.fetch = async () => new Response(JSON.stringify(mockResponse), {
                    status: 200, headers: {'Content-Type': 'application/json'},
                });

                const priceData = await waitForStoreToSettle(BTCPrice);

                expect(priceData.price).toBe(mockPrice);
                expect(priceData.error).toBe('');
                expect(priceData.timestamp).toBeGreaterThan(Date.now() - 5000);
            });

            test('should keep prior data and log error on subsequent API failure', async () => {
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
                const initialPriceData = await waitForStoreToSettle(BTCPrice) as IBTCPriceData;
                expect(initialPriceData.price).toBe(mockPrice);

                // 2. Invalidate cache and trigger second call - failure
                store.clear(BTCPrice, false); // Invalidate cache
                const subsequentPriceData = await waitForStoreToSettle(BTCPrice) as IBTCPriceData;

                expect(subsequentPriceData.price).toBe(mockPrice); // Price is preserved
                expect(subsequentPriceData.error).toBe('HTTP error! status: 500'); // New error is set
                expect(subsequentPriceData.errorLog).toHaveLength(1); // Error is logged
                expect(subsequentPriceData.errorLog[0].error).toBe('HTTP error! status: 500');
            });

            test('should return an error state on network error (fetch throws)', async () => {
                store.clear(BTCPrice, true);
                const errorMessage = 'Network request failed';

                global.fetch = async () => {
                    throw new Error(errorMessage);
                };
                const priceData = await waitForStoreToSettle(BTCPrice);
                expect(priceData.price).toBe(0);
                expect(priceData.error).toBe(errorMessage);
            });

            test('should handle non-Error rejection from fetch', async () => {
                const rejectionMessage = 'Something bad happened';
                // Mock fetch to reject with a non-Error object (a string)
                global.fetch = async () => Promise.reject(rejectionMessage);

                const priceData = await waitForStoreToSettle(BTCPrice);

                expect(priceData.price).toBe(0);
                // The store's catch block should handle this gracefully
                expect(priceData.error).toBe('Unknown error occurred');
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
                await waitForStoreToSettle(BTCPrice);
                expect(fetchCallCount).toBe(1);

                await waitForStoreToSettle(BTCPrice);
                expect(fetchCallCount).toBe(1); // Should not have increased
            });

            test('refreshPrice should force a new fetch', async () => {
                await waitForStoreToSettle(BTCPrice);
                expect(fetchCallCount).toBe(1);

                refreshPrice();
                await waitForStoreToSettle(BTCPrice);
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
        test('should return an error state on API failure in a clean browser context', async ({page}) => {
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
                        <div>${price.price} | ${price.error}</div>`,
                });

                // Add the component to the DOM, which triggers the store's fetch logic.
                const component = document.createElement('test-component');
                document.body.appendChild(component);

                // We poll the component's `price` property (which is the store model)
                // from our mocked 404 response. This confirms the entire async
                // operation has completed.
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => reject(new Error('Timeout waiting for component to update')), 5000);
                    const interval = setInterval(() => {
                        // The component's `price` property is the store model.
                        if (component.price && component.price.error && component.price.error.includes('404')) {
                            clearInterval(interval);
                            clearTimeout(timeout);
                            resolve();
                        }
                    }, 10);
                });

                // Now that the component has updated, we know the store has settled.
                // We can safely get the model and return its state for assertion.
                const model = store.get(BTCPrice);
                return {
                    price: model.price,
                    error: model.error,
                    errorLog: model.errorLog,
                };
            });

            // 3. Assert the results returned from the browser.
            expect(priceData.price).toBe(0);
            expect(priceData.error).toBe('HTTP error! status: 404');
            expect(priceData.errorLog).toHaveLength(0);
        });
    });
});