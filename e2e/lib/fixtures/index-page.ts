import { IndexResultItemType, indexSearchTypesDictionary } from "@/types/indexSearch";
import type { Locator, Page } from "@playwright/test";

export class IndexPage {
	readonly page: Page;
	readonly title: Locator;
	readonly searchBar: Locator;

	constructor(page: Page) {
		this.page = page;
		this.title = page.getByRole("heading", { level: 1 });
		this.searchBar = page.getByLabel('Alle Ressourcen durchsuchen...');
	}

	async goto() {
		await this.page.goto('/');
	}

	getSearchMenuItem(name: string, type: IndexResultItemType): Locator {
		let typeString = indexSearchTypesDictionary[type];

		return this.page.getByRole('menuitem', { name: `${name} ${typeString}` })
	}


}
