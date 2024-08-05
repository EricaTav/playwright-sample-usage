// generate-baseline.js
const { test, expect } = require('@playwright/test');

test('capture baseline screenshot', async ({ page }) => {
  await page.goto('https://news.ycombinator.com/newest');
  await page.screenshot({ path: 'screenshots/homepage.png', fullPage: true});

  // When we want to generate an image with only a specific web element of the page
  //await page.locator('.header').screenshot({ path: 'screenshot.png' });

});
