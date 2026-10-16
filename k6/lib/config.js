// Shared k6 configuration. Everything is overridable via -e KEY=value or env vars.
export const BASE_URL = (__ENV.BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
export const API_BASE = __ENV.API_BASE || "/api";

/** Duration multiplier: SCALE=0.1 makes every profile 10x shorter (used in CI). */
export const SCALE = Number(__ENV.SCALE || 1);
export const d = (seconds) => `${Math.max(1, Math.round(seconds * SCALE))}s`;

/** Default SLOs. Tune per target. */
export const thresholds = {
  http_req_failed: ["rate<0.01"],
  http_req_duration: ["p(95)<500", "p(99)<1500"],
  "http_req_duration{type:page}": ["p(95)<800"],
  "http_req_duration{type:api}": ["p(95)<300"],
  checks: ["rate>0.99"],
};
