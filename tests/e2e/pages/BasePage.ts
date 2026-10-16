import { expect, type Locator, type Page } from "@playwright/test";

export class BasePage {
  readonly nav: Locator;
  readonly main: Locator;
  readonly consoleErrors: string[] = [];

  constructor(readonly page: Page) {
    this.nav = page.getByRole("navigation", { name: "Main" });
    this.main = page.locator("main");
    page.on("console", (m) => { if (m.type() === "error") this.consoleErrors.push(m.text()); });
    page.on("pageerror", (e) => this.consoleErrors.push(e.message));
  }

  async goto(path: string) {
    const res = await this.page.goto(path, { waitUntil: "domcontentloaded" });
    expect(res, `no response for ${path}`).not.toBeNull();
    return res!;
  }

  async navigateTo(linkName: string) {
    const menuButton = this.page.getByRole("button", { name: /menu/i });
    if (await menuButton.isVisible().catch(() => false)) await menuButton.click();
    await this.nav.getByRole("link", { name: linkName, exact: true }).click();
  }

  async expectNoConsoleErrors() {
    expect(this.consoleErrors, `console errors:\n${this.consoleErrors.join("\n")}`).toEqual([]);
  }
}
