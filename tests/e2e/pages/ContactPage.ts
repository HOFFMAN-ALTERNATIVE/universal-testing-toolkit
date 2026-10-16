import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ContactPage extends BasePage {
  readonly name: Locator;
  readonly email: Locator;
  readonly message: Locator;
  readonly submit: Locator;

  constructor(page: Page, readonly path = "/contact") {
    super(page);
    this.name = page.getByLabel("Name");
    this.email = page.getByLabel("Email");
    this.message = page.getByLabel("Message");
    this.submit = page.getByRole("button", { name: /send/i });
  }

  async open() { await this.goto(this.path); await expect(this.submit).toBeVisible(); }

  async fill(data: { name?: string; email?: string; message?: string }) {
    if (data.name !== undefined) await this.name.fill(data.name);
    if (data.email !== undefined) await this.email.fill(data.email);
    if (data.message !== undefined) await this.message.fill(data.message);
  }

  async send() { await this.submit.click(); }

  alert() { return this.page.getByRole("alert"); }
  status() { return this.page.getByRole("status"); }
}
