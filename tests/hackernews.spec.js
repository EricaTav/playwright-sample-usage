const { test, expect } = require('@playwright/test');

test('should have the correct title', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle(/Hacker News/);
});

test('should have 30 articles', async ({ page }) => {
	await page.goto('/', { waitUntil: 'networkidle' });

	const articles = await page.$$('.athing');
	expect(articles.length).toBe(30, `Expected at least 30 articles, but found ${articles.length}`);
});

test('should have 30 first articles sorted from newest to oldest', async ({ page }) => {
	await page.goto('/');

	const articles = await page.evaluate(() => {
		const articleElements = Array.from(document.querySelectorAll('.itemlist .athing'));
		return articleElements.slice(0, 100).map(article => {
			const titleElement = article.querySelector('.title a');
			const subtextElement = article.nextElementSibling;
			const timeElement = subtextElement ? subtextElement.querySelector('.age a') : null;

			return {
				title: titleElement ? titleElement.textContent : '',
				link: titleElement ? titleElement.href : '',
				time: timeElement ? timeElement.textContent : ''
			};
		});
	});

	for (let i = 1; i < articles.length; i++) {
		const previousTime = new Date(articles[i - 1]);
		const currentTime = new Date(articles[i]);

		expect(previousTime >= currentTime).toBeTruthy();
	}
});

test('should have a button for more news', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('link', { name: 'More' }).isVisible();
});
  
test('should have a 100th entry for news', async ({ page }) => {
await page.goto('/');
await page.getByRole('link', { name: 'More' }).click();
await page.getByRole('link', { name: 'More', exact: true }).click();
await page.getByRole('link', { name: 'More', exact: true }).click();
await page.getByText('100.').isVisible();
});
  
test('should verify that the newest articles are sorted by date and check at least 100 articles', async ({ page }) => {
	await page.goto('/', { waitUntil: 'networkidle' });

	let articlesChecked = 0;
	let lastArticleDate = null;
	let previousArticleCount = 0;

	while (articlesChecked < 100) {
		await page.waitForSelector('.athing');

		const articles = await page.$$('.athing');
		console.log(`Found ${articles.length} articles on the page.`);

		previousArticleCount = articles.length;

		for (const article of articles) {
			const subtext = await article.evaluateHandle(node => node.nextElementSibling);
			const dateElement = await subtext.$('.age');
			if (!dateElement) {
				console.warn('Date element not found within subtext.');
				continue;
			}

			const articleDateText = await dateElement.getAttribute('title');
			if (!articleDateText) {
				console.warn('Date text is empty or not found.');
				continue;
			}

			const articleDate = new Date(articleDateText).getTime();
			if (isNaN(articleDate)) {
				console.warn('Date parsing failed for:', articleDateText);
				continue;
			}

			/*
			*	Here is where it will make sure each entry has a date that is older than previous
			*	If next news entry date is not older, it will fail the test here. 
			*/
			if (lastArticleDate !== null) {
				expect(articleDate).toBeLessThanOrEqual(lastArticleDate, `Articles are not sorted by date correctly. Article date: ${articleDateText}, Last article date: ${new Date(lastArticleDate).toISOString()}`);
			}

			lastArticleDate = articleDate;
			articlesChecked++;
			
			if (articlesChecked >= 100) {
				break;
			}
		}

		if (articles.length % 30 === 0 && articlesChecked < 100) {
			const moreButton = await page.$('a.morelink');
			if (moreButton) {
				await moreButton.click();
				console.log('Clicked "More" button, waiting for new articles to load...');
				await page.waitForTimeout(2000);
				await page.waitForSelector('.athing', { state: 'attached' });
			} else {
				console.log('No "More" button found, breaking the loop.');
				break;
			}
		} else {
			console.log('Number of articles is not a multiple of 30, breaking the loop.');
			break;
		}
	}

	expect(articlesChecked).toBeGreaterThanOrEqual(100, `Expected to check at least 100 articles, but only checked ${articlesChecked}`);
});
