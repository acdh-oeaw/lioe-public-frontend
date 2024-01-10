import type { Locator, Page } from "@playwright/test";

export class IndexPage {
	readonly page: Page;
	readonly title: Locator;

	constructor(page: Page) {
		this.page = page;
		this.title = page.getByRole("heading", { level: 1 });
	}

	async goto() {
		await this.page.goto('/');
	}
}
