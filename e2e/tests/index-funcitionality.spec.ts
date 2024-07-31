import { expect, test as base } from '~/e2e/lib/test';
import { IndexPage } from '../lib/fixtures/index-page';

const test = base.extend<{ indexPage: IndexPage }>({
  indexPage: async ({ page }, use) => {
    const indexPage = new IndexPage(page);
    await indexPage.goto();
    await page.getByRole('button', { name: 'Tour schließen' }).click();
    await page.getByRole('button', { name: 'Ablehnen' }).click();
    await use(indexPage);
  }
})


test.describe('Index Functionality', () => {

  // FIXME: Fails in CI
  test.fixme('should find article', async ({ indexPage, page }, testInfo ) => {
    testInfo.setTimeout(120 * 1000);

    await page.getByRole('combobox').locator('div').filter({ hasText: 'Alle Ressourcen durchsuchen...' }).click();
    await page.waitForResponse('**/api/articles?status=finished,proofed,retro&pageSize=500&pageNr=8');
    await page.getByTestId('omni-search').fill('Âbend');
    // FIXME: The search won't find articles if the articles haven't been fetched yet and the index for the search won't refesh when they've been fetched
    await indexPage.getSearchMenuItem('Âbend', 'article').click();
    await expect(page).toHaveURL('/articles/lieferung1-2%23Abend_1')
    await expect(page.getByText('Âbend Mask').first()).toBeVisible();
  })


});

