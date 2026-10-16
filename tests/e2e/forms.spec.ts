import { expect, test } from "@playwright/test";
import { toolkit } from "../../toolkit.config";
import { ContactPage } from "./pages/ContactPage";

test.describe("contact form", () => {
  test.skip(!toolkit.contactPath, "CONTACT_PATH disabled");

  test("shows validation errors for empty submit", async ({ page }) => {
    const form = new ContactPage(page, toolkit.contactPath);
    await form.open();
    await form.send();
    await expect(form.alert()).toContainText("valid email");
    await expect(form.alert()).toContainText("at least 10 characters");
  });

  test("rejects an invalid email", async ({ page }) => {
    const form = new ContactPage(page, toolkit.contactPath);
    await form.open();
    await form.fill({ name: "Ada", email: "not-an-email", message: "Hello there, this is long enough." });
    await form.send();
    await expect(form.alert()).toContainText("valid email");
  });

  test("submits successfully with valid data", async ({ page }) => {
    const form = new ContactPage(page, toolkit.contactPath);
    await form.open();
    await form.fill({ name: "Ada Lovelace", email: "ada@example.com", message: "I would like to discuss a project." });
    await form.send();
    await expect(form.status()).toContainText("Thanks, Ada Lovelace");
  });

  test("escapes HTML in user input (reflected XSS guard)", async ({ page }) => {
    const form = new ContactPage(page, toolkit.contactPath);
    await form.open();
    let dialog = false;
    page.on("dialog", (d) => { dialog = true; void d.dismiss(); });
    await form.fill({ name: '<img src=x onerror=alert(1)>', email: "x@example.com", message: "payload test message" });
    await form.send();
    await expect(form.status()).toContainText("<img src=x");
    expect(dialog).toBe(false);
  });
});
