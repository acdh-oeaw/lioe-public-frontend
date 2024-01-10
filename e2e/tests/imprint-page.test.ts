import { expect, test } from '~/e2e/lib/test'

test.describe('Imprint page', () => {
  test('should have document title', async ({ imprintPage }) => {
    await imprintPage.goto()

    await expect(imprintPage.page).toHaveTitle('LIÖ – Lexikalisches Informationssystem Österreich')
  })

  test("should have main heading", async ({ imprintPage }) => {
    await imprintPage.goto();

    // FIXME: currently there is no h1 on the page, heading hierarchy starts at h2
    await expect(imprintPage.title).toHaveText("Impressum");
  });

  test("should not have any automatically detectable accessibility issues", async ({
    createAccessibilityScanner,
    imprintPage,
  }) => {
    await imprintPage.goto();

    expect((await createAccessibilityScanner().analyze()).violations).toEqual([]);
  });
})
