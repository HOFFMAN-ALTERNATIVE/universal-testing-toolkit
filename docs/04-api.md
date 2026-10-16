# 04 — API testing

API tests use Playwright's `request` fixture (no browser, very fast) and validate responses against
**JSON Schema** with [Ajv](https://ajv.js.org/) in strict mode.

```ts
const res = await request.get("/api/items");
expect(res.ok()).toBe(true);
expectSchema("item-list", await res.json());   // fails with every violation listed
```

## What a good API suite checks

| Category | Example in `tests/api/items.spec.ts` |
|---|---|
| Availability & latency | `/health` returns 200 in < 1 s |
| Contract | list/item/error bodies match `schemas/*.json`; `additionalProperties: false` catches leaked fields |
| Behaviour | `?limit` honoured; CRUD lifecycle create → read → delete → 404 |
| Headers | `Location` on 201, `Allow` on 405, `Cache-Control: no-store` on JSON |
| Negative cases | table-driven invalid payloads → 422 with error schema; malformed JSON → 400 |

## Schemas

Schemas reference each other by `$id` (`item-list` → `item`). Formats such as `uuid` and `date-time` come from `ajv-formats`.
To start from OpenAPI, extract `components.schemas` into individual files and give each an `$id`.

## Reading failures

```
schema "item" violations:
/price must be number
/ must NOT have additional properties
```

The path points at the offending field of the response body.
