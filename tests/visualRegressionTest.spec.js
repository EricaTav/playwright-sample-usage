const { test, expect } = require('@playwright/test');

test('homepage visual regression test', async ({ page }) => {
	await page.goto('/');
	const screenshot = await page.screenshot();

	//Example of snapshot test
	//The test is an example of fail case for unmatching screen snapshot as news are different on time basis
	expect(screenshot).toMatchSnapshot('screenshots/hackerNewsHomepage.png');
});
