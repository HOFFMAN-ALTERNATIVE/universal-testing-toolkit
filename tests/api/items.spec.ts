import { expect, test } from "@playwright/test";
import { toolkit } from "../../toolkit.config";
import { expectSchema } from "../support/schema";

const api = (p: string) => `${toolkit.apiBase}${p}`;

test.describe("REST API", () => {
  test("GET /health is fast and valid", async ({ request }) => {
    const t0 = Date.now();
    const res = await request.get(api("/health"));
    expect(res.status()).toBe(200);
    expect(Date.now() - t0).toBeLessThan(1000);
    expect(res.headers()["content-type"]).toContain("application/json");
    expectSchema("health", await res.json());
  });

  test("GET /items returns a valid list", async ({ request }) => {
    const res = await request.get(api("/items"));
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expectSchema("item-list", body);
    expect(body.data.length).toBeLessThanOrEqual(body.total);
  });

  test("GET /items honours ?limit", async ({ request }) => {
    const body = await (await request.get(api("/items?limit=1"))).json();
    expect(body.data).toHaveLength(1);
  });

  test("CRUD lifecycle: create → read → delete → 404", async ({ request }) => {
    const created = await request.post(api("/items"), { data: { name: "Test widget", price: 9.99 } });
    expect(created.status()).toBe(201);
    const item = await created.json();
    expectSchema("item", item);
    expect(created.headers()["location"]).toBe(api(`/items/${item.id}`));

    const read = await request.get(api(`/items/${item.id}`));
    expect(read.status()).toBe(200);
    expect(await read.json()).toEqual(item);

    expect((await request.delete(api(`/items/${item.id}`))).status()).toBe(204);
    const gone = await request.get(api(`/items/${item.id}`));
    expect(gone.status()).toBe(404);
    expectSchema("error", await gone.json());
  });

  for (const [label, data] of [
    ["missing name", { price: 1 }],
    ["short name", { name: "x", price: 1 }],
    ["negative price", { name: "Valid", price: -1 }],
    ["string price", { name: "Valid", price: "10" }],
  ] as const) {
    test(`POST /items rejects ${label} with 422`, async ({ request }) => {
      const res = await request.post(api("/items"), { data });
      expect(res.status()).toBe(422);
      const body = await res.json();
      expectSchema("error", body);
      expect(body.error).toBe("validation_failed");
    });
  }

  test("malformed JSON → 400", async ({ request }) => {
    const res = await request.post(api("/items"), { headers: { "content-type": "application/json" }, data: Buffer.from("{oops") });
    expect(res.status()).toBe(400);
  });

  test("unsupported method → 405 with Allow header", async ({ request }) => {
    const res = await request.put(api("/items"), { data: {} });
    expect(res.status()).toBe(405);
    expect(res.headers()["allow"]).toContain("GET");
  });

  test("API responses are not cached", async ({ request }) => {
    const res = await request.get(api("/items"));
    expect(res.headers()["cache-control"]).toContain("no-store");
  });
});
