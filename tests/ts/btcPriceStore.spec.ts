import {test, expect} from '@playwright/test';
import {isPriceValid, BTCPrice, store, refreshPrice} from '../../web/lib/btcPriceStore';
import type {Model} from 'hybrids';

test.describe('btcPriceStore', () => {

    test.describe('isPriceValid()', () => {
        test('should return true for a valid, recent price', () => {
            const price = {
                price: 50000,
                timestamp: Date.now(),
                error: '',
            };
            expect(isPriceValid(price)).toBe(true);
        });

        test('should return false for a price of 0', () => {
            const price = {
                price: 0,
                timestamp: Date.now(),
                error: '',
            };
            expect(isPriceValid(price)).toBe(false);
        });

        test('should return false if there is an error string', () => {
            const price = {
                price: 50000,
                timestamp: Date.now(),
                error: 'An error occurred',
            };
            expect(isPriceValid(price)).toBe(false);
        });

        test('should return false for a stale price (older than 60 seconds)', () => {
            const price = {
                price: 50000,
                timestamp: Date.now() - 61 * 1000, // 61 seconds old
                error: '',
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

// The 'global' object in Node.js is like 'window' in the browser.
// We only define this mock if we are in a Node environment.
    if (typeof window === 'undefined') {
        (global as any).localStorage = new LocalStorageMock();
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

    test.describe('BTCPrice Store Data Fetching in Node.js', () => {
        const originalFetch = global.fetch;

        test.afterEach(() => {
            global.fetch = originalFetch;
            store.clear(BTCPrice);
            if (typeof window === 'undefined') {
                (global as any).localStorage.clear();
            }
        });

        test('should fetch and return a valid price on API success', async () => {
            const mockPrice = 55000.42;
            const mockResponse = {bitcoin: {usd: mockPrice}};

            global.fetch = async () => new Response(JSON.stringify(mockResponse), {
                status: 200,
                headers: {'Content-Type': 'application/json'},
            });

            const priceData = await waitForStoreToSettle(BTCPrice);

            expect(priceData.price).toBe(mockPrice);
            expect(priceData.error).toBe('');
            expect(priceData.timestamp).toBeGreaterThan(Date.now() - 5000);
        });

        test('should return an error state on API failure (non-200 response)', async () => {
            global.fetch = async () => new Response('Not Found', {status: 404});
            const priceData = await waitForStoreToSettle(BTCPrice);

            expect(priceData.price).toBe(0);
            expect(priceData.error).toBe('HTTP error! status: 404');
        });

        test('should return an error state on network error (fetch throws)', async () => {
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
        const originalFetch = global.fetch;
        let fetchCallCount = 0;

        test.beforeEach(() => {
            fetchCallCount = 0;
            const mockPrice = 55000.42;
            const mockResponse = {bitcoin: {usd: mockPrice}};

            global.fetch = async () => {
                fetchCallCount++;
                return new Response(JSON.stringify(mockResponse), {
                    status: 200,
                    headers: {'Content-Type': 'application/json'},
                });
            };
        });

        test.afterEach(() => {
            global.fetch = originalFetch;
            store.clear(BTCPrice);
            if (typeof window === 'undefined') {
                (global as any).localStorage.clear();
            }
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