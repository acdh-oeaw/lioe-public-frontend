import { AxeBuilder } from "@axe-core/playwright";
import { test as base } from "@playwright/test";

import { ImprintPage } from "~/e2e/lib/fixtures/imprint-page";
import { IndexPage } from "~/e2e/lib/fixtures/index-page";

interface Fixtures {
	createAccessibilityScanner: () => AxeBuilder;
	imprintPage: ImprintPage;
	indexPage: IndexPage;
}

export const test = base.extend<Fixtures>({
	async createAccessibilityScanner({ page }, use) {
		function createAccessibilityScanner() {
			return new AxeBuilder({ page });
		}
		await use(createAccessibilityScanner);
	},
	async imprintPage({ page }, use) {
		await use(new ImprintPage(page));
	},
	async indexPage({ page }, use) {
		await use(new IndexPage(page));
	},
});

export { expect } from "@playwright/test";
