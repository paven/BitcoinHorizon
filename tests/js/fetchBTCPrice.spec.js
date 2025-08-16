import { test, expect } from '@playwright/test';
import { fetchBTCPrice } from '../../web/lib/fetchBTCPrice.js';
import {latestPriceStore} from '../../web/lib/priceStore.js';

test.beforeEach(() => {
  // Reset the store to a default state before each test to ensure isolation.
  latestPriceStore.price = undefined;
  latestPriceStore.error = undefined;
});

test('fetchBTCPrice returns a valid price object on success', async () => {
  // Create a mock fetch function for a successful response.
  const mockFetch = async () => ({
    ok: true,
    json: async () => ({bitcoin: {usd: 65000}}),
  });

  const result = await fetchBTCPrice(mockFetch);

  expect(result.price).toBe(65000);
  expect(result.error).toBeNull();
});

test('fetchBTCPrice updates the store on success', async () => {
  const mockFetch = async () => ({
    ok: true,
    json: async () => ({bitcoin: {usd: 65000}}),
  });

  // Verify initial store state
  expect(latestPriceStore.price).toBeUndefined();

  await fetchBTCPrice(mockFetch);

  // Assert the store was updated
  expect(latestPriceStore.price).toBe(65000);
  expect(latestPriceStore.error).toBeNull();
});

test('fetchBTCPrice updates the store with an error on failure', async () => {
  // Create a mock fetch function for a failed response.
  const mockFetch = async () => ({
    ok: false,
    status: 500,
  });

  await fetchBTCPrice(mockFetch);

  expect(latestPriceStore.price).toBeNull();
  expect(latestPriceStore.error).toContain('HTTP error! status: 500');
});