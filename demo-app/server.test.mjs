// Regression tests for the demo target itself: node --test demo-app/
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { connect } from "node:net";
import { server } from "./server.mjs";

let port;
before(async () => {
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  port = server.address().port;
});
after(() => server.close());

const raw = (request) =>
  new Promise((resolve, reject) => {
    const s = connect(port, "127.0.0.1", () => s.write(request));
    let out = "";
    s.on("data", (d) => (out += d));
    s.on("end", () => resolve(out));
    s.on("error", reject);
  });

test("malformed Host header does not crash the server", async () => {
  const res = await raw("GET / HTTP/1.1\r\nHost: a b\r\nConnection: close\r\n\r\n");
  assert.match(res, /^HTTP\/1\.1 200/);
  const health = await fetch(`http://127.0.0.1:${port}/api/health`);
  assert.equal(health.status, 200);
});

test("path traversal outside public/ is refused", async () => {
  const res = await raw("GET /../server.mjs HTTP/1.1\r\nHost: x\r\nConnection: close\r\n\r\n");
  assert.doesNotMatch(res, /createServer/);
});

test("oversized body is rejected with 413", async () => {
  const res = await fetch(`http://127.0.0.1:${port}/api/items`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "x".repeat(70_000), price: 1 }),
  });
  assert.equal(res.status, 413);
});

test("server has request and header timeouts", () => {
  assert.ok(server.requestTimeout > 0 && server.requestTimeout <= 15_000);
  assert.ok(server.headersTimeout > 0 && server.headersTimeout <= 10_000);
});
