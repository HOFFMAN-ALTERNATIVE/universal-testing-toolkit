import { type Locator, type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ProductsPage extends BasePage {
  readonly rows: Locator;
  constructor(page: Page) {
    super(page);
    this.rows = page.locator('[data-testid="item-row"]');
  }
  async open() { await this.goto("/products"); }
}
