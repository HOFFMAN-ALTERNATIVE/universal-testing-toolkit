import { expect, test } from "@playwright/test";

/**
 * Baseline security checks inspired by the OWASP Secure Headers Project.
 * These are cheap, deterministic and catch the most common misconfigurations.
 */
test.describe("security headers", () => {
  let headers: Record<string, string>;

  test.beforeAll(async ({ request }) => {
    headers = (await request.get("/")).headers();
  });

  test("Content-Security-Policy is set and restrictive", () => {
    const csp = headers["content-security-policy"];
    expect(csp, "missing CSP").toBeTruthy();
    expect(csp).toMatch(/default-src/);
    expect(csp).not.toMatch(/'unsafe-eval'/);
  });

  test("clickjacking protection", () => {
    const xfo = headers["x-frame-options"]?.toUpperCase();
    const csp = headers["content-security-policy"] ?? "";
    expect(xfo === "DENY" || xfo === "SAMEORIGIN" || /frame-ancestors/.test(csp)).toBe(true);
  });

  test("MIME sniffing disabled", () => {
    expect(headers["x-content-type-options"]).toBe("nosniff");
  });

  test("Referrer-Policy set", () => {
    expect(headers["referrer-policy"]).toMatch(/no-referrer|strict-origin|same-origin/);
  });

  test("Permissions-Policy set", () => {
    expect(headers["permissions-policy"]).toBeTruthy();
  });

  test("HSTS with ≥ 6 months max-age", () => {
    const hsts = headers["strict-transport-security"];
    expect(hsts, "missing HSTS").toBeTruthy();
    const maxAge = Number(/max-age=(\d+)/.exec(hsts)?.[1] ?? 0);
    expect(maxAge).toBeGreaterThanOrEqual(15_552_000);
  });

  test("no technology disclosure", () => {
    expect(headers["x-powered-by"]).toBeUndefined();
    expect(headers["server"] ?? "").not.toMatch(/\d+\.\d+/);
  });
});

test.describe("transport & exposure", () => {
  test("TLS: HTTPS target redirects HTTP and serves a valid certificate", async ({ request, baseURL }) => {
    const url = new URL(baseURL!);
    test.skip(url.protocol !== "https:", "target is not HTTPS (demo app) — runs automatically for https:// BASE_URL");
    const ok = await request.get("/");
    expect(ok.ok()).toBe(true); // Playwright rejects invalid certificates by default
    const http = await request.get(`http://${url.host}/`, { maxRedirects: 0, failOnStatusCode: false });
    expect([301, 302, 307, 308]).toContain(http.status());
    expect(http.headers()["location"]).toMatch(/^https:/);
  });

  for (const path of ["/.env", "/.git/config", "/server-status", "/phpinfo.php", "/backup.zip"]) {
    test(`sensitive path not exposed: ${path}`, async ({ request }) => {
      const res = await request.get(path, { failOnStatusCode: false });
      expect(res.status(), `${path} returned ${res.status()}`).toBeGreaterThanOrEqual(400);
    });
  }

  test("path traversal is blocked", async ({ request }) => {
    const res = await request.get("/..%2f..%2f..%2fetc/passwd", { failOnStatusCode: false });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(await res.text()).not.toContain("root:");
  });
});
