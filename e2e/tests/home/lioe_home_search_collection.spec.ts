import { test } from '@playwright/test';

test('LIÖ Home Suche nach Sammlung', async ({ page }) => {
await page.goto('/');
await page.locator('#mainOmnisearch').click();
// WARTEN
await page.locator('#mainOmnisearch').fill('Feim');
await page.getByText('Feim_verbr').click();
});
