import { test, expect } from '@playwright/test';
import nock from 'nock';
import { fetchBTCPrice } from '../../web/lib/fetchBTCPrice.js';
import {latestPriceStore} from '../../web/lib/priceStore.js';

test.beforeEach(() => {
  nock.cleanAll();
  // Reset the store to a default state before each test to ensure isolation.
  latestPriceStore.price = undefined;
  latestPriceStore.error = undefined;
});

test('fetchBTCPrice returns a valid price object on success', async () => {
  nock('https://api.coingecko.com')
    .get('/api/v3/simple/price')
    .query({ ids: 'bitcoin', vs_currencies: 'usd' })
    .reply(200, { bitcoin: { usd: 65000 } });

  const result = await fetchBTCPrice();

  expect(result.price).toBe(65000);
  expect(result.error).toBeNull();
});

test('fetchBTCPrice updates the store on success', async () => {
  nock('https://api.coingecko.com')
    .get('/api/v3/simple/price')
    .query({ ids: 'bitcoin', vs_currencies: 'usd' })
    .reply(200, { bitcoin: { usd: 65000 } });

  // Verify initial store state
  expect(latestPriceStore.price).toBeUndefined();

  await fetchBTCPrice();

  // Assert the store was updated
  expect(latestPriceStore.price).toBe(65000);
  expect(latestPriceStore.error).toBeNull();
});

test('fetchBTCPrice updates the store with an error on failure', async () => {
  nock('https://api.coingecko.com').get('/api/v3/simple/price').query(true).reply(500);

  await fetchBTCPrice();

  expect(latestPriceStore.price).toBeNull();
  expect(latestPriceStore.error).toContain('HTTP error! status: 500');
});