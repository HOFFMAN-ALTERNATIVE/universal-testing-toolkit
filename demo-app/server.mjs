// Demo target app for universal-testing-toolkit. Zero dependencies (Node >= 20).
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.PORT || 3000);
const PUBLIC = join(import.meta.dirname, "public");
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml" };

const SECURITY_HEADERS = {
  "Content-Security-Policy": "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
};

/** @type {Map<string, {id:string,name:string,price:number,createdAt:string}>} */
const items = new Map();
for (const [name, price] of [["Keyboard", 79.9], ["Monitor", 249], ["Headset", 59.5]]) {
  const id = randomUUID();
  items.set(id, { id, name, price, createdAt: new Date().toISOString() });
}
const messages = [];
// In-memory demo store: bounded so a load test or a hostile client cannot grow
// the heap until the container is OOM-killed.
const MAX_ITEMS = 1000;
const MAX_MESSAGES = 100;

function send(res, status, body, type = "application/json; charset=utf-8", extra = {}) {
  const payload = typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body);
  res.writeHead(status, { ...SECURITY_HEADERS, "Content-Type": type, "Cache-Control": type.startsWith("application/json") ? "no-store" : "public, max-age=300", ...extra });
  res.end(payload);
}

async function readBody(req, limit = 64 * 1024) {
  let size = 0; const chunks = [];
  for await (const c of req) { size += c.length; if (size > limit) throw Object.assign(new Error("payload too large"), { status: 413 }); chunks.push(c); }
  const raw = Buffer.concat(chunks).toString("utf8");
  const ct = req.headers["content-type"] || "";
  if (ct.includes("application/json")) { try { return JSON.parse(raw || "{}"); } catch { throw Object.assign(new Error("invalid JSON"), { status: 400 }); } }
  if (ct.includes("application/x-www-form-urlencoded")) return Object.fromEntries(new URLSearchParams(raw));
  return {};
}

function validateItem(b) {
  const errors = [];
  if (typeof b.name !== "string" || b.name.trim().length < 2 || b.name.length > 80) errors.push("name must be a string of 2..80 chars");
  if (typeof b.price !== "number" || !Number.isFinite(b.price) || b.price < 0) errors.push("price must be a non-negative number");
  return errors;
}

function validateContact(b) {
  const errors = {};
  if (!b.name || String(b.name).trim().length < 2) errors.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(b.email || ""))) errors.email = "Please enter a valid email.";
  if (!b.message || String(b.message).trim().length < 10) errors.message = "Message must be at least 10 characters.";
  return errors;
}

async function api(req, res, url) {
  const parts = url.pathname.split("/").filter(Boolean); // ["api", ...]
  if (parts[1] === "health" && req.method === "GET") return send(res, 200, { status: "ok", uptime: process.uptime(), version: "1.0.0" });

  if (parts[1] === "items") {
    const id = parts[2];
    if (!id && req.method === "GET") {
      const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 20));
      const data = [...items.values()].slice(0, limit);
      return send(res, 200, { data, total: items.size });
    }
    if (!id && req.method === "POST") {
      const body = await readBody(req);
      const errors = validateItem(body);
      if (errors.length) return send(res, 422, { error: "validation_failed", details: errors });
      if (items.size >= MAX_ITEMS) return send(res, 507, { error: "store_full" });
      const item = { id: randomUUID(), name: body.name.trim(), price: body.price, createdAt: new Date().toISOString() };
      items.set(item.id, item);
      return send(res, 201, item, undefined, { Location: `/api/items/${item.id}` });
    }
    if (id && req.method === "GET") return items.has(id) ? send(res, 200, items.get(id)) : send(res, 404, { error: "not_found" });
    if (id && req.method === "DELETE") return items.delete(id) ? send(res, 204, "") : send(res, 404, { error: "not_found" });
    return send(res, 405, { error: "method_not_allowed" }, undefined, { Allow: id ? "GET, DELETE" : "GET, POST" });
  }
  return send(res, 404, { error: "not_found" });
}

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

async function contact(req, res) {
  const body = await readBody(req);
  const errors = validateContact(body);
  const tpl = await readFile(join(PUBLIC, "contact.html"), "utf8");
  if (Object.keys(errors).length) {
    const list = Object.values(errors).map((e) => `<li>${escapeHtml(e)}</li>`).join("");
    return send(res, 422, tpl.replace("<!--STATUS-->", `<div class="alert alert--error" role="alert"><p>Please fix the following:</p><ul>${list}</ul></div>`), TYPES[".html"]);
  }
  messages.push({ name: String(body.name), email: String(body.email), message: String(body.message).slice(0, 2000), at: Date.now() });
  if (messages.length > MAX_MESSAGES) messages.shift();
  return send(res, 200, tpl.replace("<!--STATUS-->", `<div class="alert alert--ok" role="status">Thanks, ${escapeHtml(body.name)}! Your message has been received.</div>`), TYPES[".html"]);
}

async function staticFile(req, res, url) {
  let p = url.pathname === "/" ? "/index.html" : url.pathname;
  if (!extname(p)) p += ".html";
  const file = normalize(join(PUBLIC, p));
  if (!file.startsWith(PUBLIC + sep)) return send(res, 403, "Forbidden", TYPES[".txt"]);
  try {
    const data = await readFile(file);
    return send(res, 200, data, TYPES[extname(file)] || "application/octet-stream");
  } catch {
    const nf = await readFile(join(PUBLIC, "404.html"));
    return send(res, 404, nf, TYPES[".html"]);
  }
}

export const server = createServer(async (req, res) => {
  try {
    // Fixed base: a malformed Host header must not be able to throw here.
    const url = new URL(req.url, "http://localhost");
    if (url.pathname.startsWith("/api/")) return await api(req, res, url);
    if (url.pathname === "/contact" && req.method === "POST") return await contact(req, res);
    if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, "Method Not Allowed", TYPES[".txt"], { Allow: "GET, HEAD" });
    return await staticFile(req, res, url);
  } catch (e) {
    if (e.status && e.status < 500) return send(res, e.status, { error: e.message });
    console.error(JSON.stringify({ level: "error", msg: "unhandled", method: req.method, path: req.url, err: String(e?.stack || e) }));
    if (!res.headersSent) return send(res, 500, { error: "internal_error" });
    res.destroy();
  }
});

// Slowloris and idle-connection limits (Node defaults are 300 s / 60 s).
server.requestTimeout = 15_000;
server.headersTimeout = 10_000;
server.keepAliveTimeout = 5_000;

if (process.argv[1] === import.meta.filename) {
  server.listen(PORT, () => console.log(`demo-app listening on http://localhost:${PORT}`));
  // Graceful shutdown: stop accepting, let in-flight requests finish, force
  // exit after 10 s so a stuck client cannot block a deploy.
  for (const sig of ["SIGINT", "SIGTERM"]) {
    process.once(sig, () => {
      server.close(() => process.exit(0));
      server.closeIdleConnections();
      setTimeout(() => process.exit(1), 10_000).unref();
    });
  }
}
