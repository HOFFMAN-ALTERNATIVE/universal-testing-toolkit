import http from "k6/http";
import { check, group, sleep } from "k6";
import { API_BASE, BASE_URL } from "./config.js";

const PAGES = (__ENV.PAGES || "/,/about,/products").split(",");

/** A realistic user journey: browse pages, hit the API, think. */
export function userJourney() {
  group("pages", () => {
    for (const p of PAGES) {
      const res = http.get(`${BASE_URL}${p}`, { tags: { type: "page", name: p } });
      check(res, { "page 200": (r) => r.status === 200, "page has html": (r) => String(r.body).includes("<html") });
    }
  });
  group("api", () => {
    const list = http.get(`${BASE_URL}${API_BASE}/items`, { tags: { type: "api", name: "GET /items" } });
    check(list, { "items 200": (r) => r.status === 200, "items json": (r) => Array.isArray(r.json("data")) });
    const health = http.get(`${BASE_URL}${API_BASE}/health`, { tags: { type: "api", name: "GET /health" } });
    check(health, { "health ok": (r) => r.json("status") === "ok" });
  });
  sleep(Math.random() * 1.5 + 0.5);
}
