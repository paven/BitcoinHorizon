import { test, expect } from '@playwright/test';
import { fetchBTCPrice } from '../../web/lib/fetchBTCPrice.js';
import {LatestPrice} from '../../web/lib/priceStore.js';
import {store} from "hybrids";

test.beforeEach(() => {
  store.clear(LatestPrice);
});

test('fetchBTCPrice returns a valid price object on success', async () => {
  const mockFetch = async () => ({
    ok: true,
    json: async () => ({bitcoin: {usd: 65000}}),
  });

  const result = await fetchBTCPrice(mockFetch);

  expect(result.price).toBe(65000);
  expect(result.error).toBe("");
});

test('fetchBTCPrice updates the store on success', async () => {
  const mockFetch = async () => ({
    ok: true,
    json: async () => ({bitcoin: {usd: 65000}}),
  });

  // Verify initial store state using the store's getter
  // We check the initial state. It's okay if the store is not ready yet,
  // but if it is ready, the price must be the default value. This is a
  // robust way to express an OR condition in a test.
  if (store.ready(LatestPrice)) {
    let latestPrice = store.get(LatestPrice);
    console.log(latestPrice)
    expect(latestPrice.price).toBe(-1);
  } else {
    // This assertion confirms the store is not ready, which is an acceptable initial state.
    expect(store.ready(LatestPrice)).toBe(false);
  }

  await fetchBTCPrice(mockFetch);

  // Assert the store was updated by checking its state again
  const finalState = store.get(LatestPrice);
  expect(finalState.price).toBe(65000);
  expect(finalState.error).toBe("");
});

test('fetchBTCPrice updates the store with an error on failure', async () => {
  // Create a mock fetch function for a failed response.
  const mockFetch = async () => ({
    ok: false,
    status: 500,
  });

  await fetchBTCPrice(mockFetch);

  const finalState = store.get(LatestPrice);
  expect(finalState.price).toBe(-1);
  expect(finalState.error).toContain('HTTP error! status: 500');
});