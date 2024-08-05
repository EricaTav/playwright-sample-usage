const { chromium } = require("playwright");

// Example of validating same cases in js environment

async function validateHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // go to Hacker News
  await page.goto("https://news.ycombinator.com/newest");

  const articles = await getArticles(page);

  if(isNotValidArticleList(articles)){
    console.log("No articles to show.");
    return;
  }

  const sorted = articlesAreSorted(articles);

  if (sorted) {
    console.log("Articles are sorted from newest to oldest.");
  }

  //Close simulator at the end
  //await browser.close();

}

(async () => {
  await validateHackerNewsArticles();
})();

/**
 * Iterates through articles to find any object with time value that isn't older than previous
 * Returns Boolean depending on the results, and logs the articles that don't comply with sorting method
 * @param {page} page context from playwright
 * @returns {articles} array
 */
async function getArticles(page){
  return await page.evaluate(() => {
    const articleElements = Array.from(document.querySelectorAll('.athing'));
    const articleSubtextElements = Array.from(document.querySelectorAll('.subtext'));
    const maxNumberArticles = 100;

    return articleElements.slice(0, maxNumberArticles).map((article, index) => {
      const titleElement = article.querySelector('.title a');
      const timeElement = articleSubtextElements[index].querySelector('.age').title;

      return {
        title: titleElement.textContent,
        link: titleElement.href,
        time: timeElement ? timeElement : ''
      };
    });
  });
}

/**
 * Iterates through articles to find any object with time value that isn't older than previous
 * Returns Boolean depending on the results, and logs the articles that don't comply with sorting method
 * @param {articles} val
 * @returns {Boolean}
 */
function articlesAreSorted(articles){
  let sorted = true;
  for (let i = 1; i < articles.length; i++) {
    const previousTime = new Date(articles[i - 1].time);
    const currentTime = new Date(articles[i].time);

    if (previousTime < currentTime) {
      console.error(`Articles are NOT sorted correctly.`);
      console.error(`Index ${i - 1}:`, articles[i - 1]);
      console.error(`Index ${i}:`, articles[i]);
      console.error(`Comparison: ${previousTime} (should be >=) ${currentTime}`);
      sorted = false;
      
      break;
    }
  }
  return sorted;
}

/**
 * Checks if there is any article and if it's valid format (array)
 * @param {articles} val
 * @returns {Boolean}
 */
function isNotValidArticleList(articles){
  return !Array.isArray(articles) || articles.length === 0;
}
