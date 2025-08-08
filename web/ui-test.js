// Minimal UI testing helpers for BitcoinHorizon
// Usage: load this file in the browser console or via a <script> tag

window.uiTest = {
  select: (selector) => document.querySelector(selector),
  click: (selector) => {
    const el = document.querySelector(selector);
    if (el) el.click();
    else throw new Error('Element not found: ' + selector);
  },
  assertText: (selector, expected) => {
    const el = document.querySelector(selector);
    if (!el) throw new Error('Element not found: ' + selector);
    if (el.textContent.trim() !== expected) {
      throw new Error(`Text assertion failed for ${selector}: expected "${expected}", got "${el.textContent.trim()}"`);
    }
  },
  log: (msg) => console.log('[uiTest]', msg),
  run: (fn) => {
    try {
      fn();
      uiTest.log('Test passed');
    } catch (e) {
      uiTest.log('Test failed: ' + e.message);
    }
  }
};

// Playwright-style test example (for reference, not executable in browser):
// @filename: tests/bitcoin-guess.spec.js
// const { test, expect } = require('@playwright/test');
//
// test('bitcoin-guess component renders and buttons exist', async ({ page }) => {
//   await page.goto('file:///absolute/path/to/web/index.html');
//   await expect(page.locator('bitcoin-guess')).toBeVisible();
//   await expect(page.locator('#guess-up')).toBeVisible();
//   await expect(page.locator('#guess-down')).toBeVisible();
// });
//
// To run: npx playwright test tests/bitcoin-guess.spec.js
//
// Replace the file path above with your actual local path or use a local server.
