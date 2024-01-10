import { expect, test } from "~/e2e/lib/test";

test.describe("Index page", () => {
  test("should have document title", async ({ indexPage }) => {
    await indexPage.goto();

    await expect(indexPage.page).toHaveTitle(
      "LIÖ – Lexikalisches Informationssystem Österreich"
    );
  });

  test("should have main heading", async ({ indexPage }) => {
    await indexPage.goto();

    await expect(indexPage.title).toHaveText(
      "Lexikalisches Informationssystem Österreich (LIÖ)"
    );
  });

  test("should not have any automatically detectable accessibility issues", async ({
    createAccessibilityScanner,
    indexPage,
  }) => {
    await indexPage.goto();

    expect((await createAccessibilityScanner().analyze()).violations).toEqual(
      []
    );
  });

  test("should find a place in the search field", async ({ indexPage }) => {
    await indexPage.goto();
    // TODO: close tour popup

    const placename = "Wien";

    // FIXME: missing accessible name
    const searchBox = indexPage.page.getByRole("combobox");
    await searchBox.getByRole("textbox").fill(placename);

    // await indexPage.page.waitForResponse("/assets/geojson/gemeinden.geojson");
    // await indexPage.page.waitForResponse("/assets/geojson/ortsdatenbank.geojson");

    // FIXME: role menuitem is invalid as child of listbox
    const searchResultsList = indexPage.page.getByRole("listbox");
    const firstSearchResult = searchResultsList.getByRole("menuitem").first();
    await expect(firstSearchResult).toContainText(placename);

    await firstSearchResult.getByRole('button', { name: 'Ort auf Karte anzeigen'}).click()
    await expect(indexPage.page.url).toContain("/maps")
  });
});
