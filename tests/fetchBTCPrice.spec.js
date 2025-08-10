import { test, expect } from '@playwright/test';



import { fetchBTCPrice } from '../web/lib/fetchBTCPrice.js';

test('fetchBTCPrice returns a valid BTC/USD price',  async() => {
  var result2 = { price: null, error: null };
  const result = await fetchBTCPrice(result2);
  console.log('[fetchBTCPrice.spec.js] Fetched BTC result:', result);
  expect(typeof result.price).toBe('number');
  expect(isNaN(result.price)).toBe(false);
  expect(result.price).toBeGreaterThan(0);
  expect(result2).toBe(result);
});

test('fetchBTCPrice returns promise of a valid BTC/USD price 2',  async() => {
  var result2 = { price: null, error: null };
  const result = await fetchBTCPrice(result2);

  expect(result2).toBe(result);

  console.log('[fetchBTCPrice.spec.js] Fetched BTC result:', result2);
  expect(typeof result2.price).toBe('number');
  expect(isNaN(result2.price)).toBe(false);
  expect(result2.price).toBeGreaterThan(0);

  console.log('[fetchBTCPrice.spec.js] Fetched final BTC result:', result);
  console.log('[fetchBTCPrice.spec.js] Fetched final BTC result2:', result2);
  expect(result2).toBe(result);
});