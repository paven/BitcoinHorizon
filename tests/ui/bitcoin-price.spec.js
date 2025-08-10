import { test, expect } from '@playwright/test';

// Mock the CoinGecko API for all tests in this file
const mockBTCPriceRoute = async (page) => {
  await page.route('https://api.coingecko.com/api/v3/simple/price*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ bitcoin: { usd: 65000 } }),
    });
  });
};

test('bitcoin-price component fetches and displays BTC/USD price', async ({ page }) => {
  console.log('[test] Starting bitcoin-price component test');
  await mockBTCPriceRoute(page);
  await page.goto('http://localhost:5173/index.html');
  // Wait for the component to render and fetch the price
  const priceLocator = page.locator('bitcoin-price');
  await expect(priceLocator).toBeVisible();
  // Wait for the light DOM to update from loading to price
  await page.waitForFunction(() => {
    const el = document.querySelector('bitcoin-price');
    if (!el) return false;
    const text = el.textContent;
    return text && text.includes('BTC/USD:');
  });
  // Check that the price is a number
  const priceText = await page.evaluate(() => {
    const el = document.querySelector('bitcoin-price');
    return el ? el.textContent : '';
  });
  expect(priceText).toMatch(/BTC\/USD: ?[0-9,]+/);
});

test('bitcoin-price component dispatches btc-price-updated event with price', async ({ page }) => {
  let eventDetail;
  await mockBTCPriceRoute(page);
  await page.goto('http://localhost:5173/tests.html');
  await page.setContent('<section id="price-section"></section>');

  // Log the DOM after page.goto and setContent
  const dom = await page.content();
  console.log('[test] DOM after goto and setContent:', dom);

  await page.exposeFunction('onBTCPriceUpdated', detail => {
    eventDetail = detail;
  });

  // Attach the event listener before loading the component
  await page.evaluate(() => {
    window.eventDetail = undefined;
    document.body.addEventListener('btc-price-updated', e => {
      window.eventDetail = e.detail;
      window.onBTCPriceUpdated(e.detail);
    }, { once: true });
  });

  // Dynamically load the component script
  await page.addScriptTag({ type: 'module', url: 'http://localhost:5173/components/bitcoin-price.js' });

  // Add the element after the script is loaded
  await page.evaluate(() => {
    const el = document.createElement('bitcoin-price');
    document.getElementById('price-section').appendChild(el);
  });

  // Wait for the event to be received or timeout
  await page.waitForFunction(() => window.eventDetail !== undefined, null, { timeout: 20000 });

  // Get the event detail from the browser context
  const priceEvent = await page.evaluate(() => window.eventDetail);

  expect(priceEvent).toBeDefined();
  expect(typeof priceEvent.price).toBe('number');
  expect(priceEvent.price).toBeGreaterThan(0);
});
