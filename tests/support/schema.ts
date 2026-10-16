import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect } from "@playwright/test";
import { Ajv, type ErrorObject } from "ajv";
import addFormats from "ajv-formats";

const dir = join(import.meta.dirname, "..", "..", "schemas");
const ajv = new Ajv({ allErrors: true, strict: true });
addFormats.default(ajv);
for (const f of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
  ajv.addSchema(JSON.parse(readFileSync(join(dir, f), "utf8")));
}

const fmt = (errs: ErrorObject[] | null | undefined) =>
  (errs ?? []).map((e) => `${e.instancePath || "/"} ${e.message}`).join("\n");

/** Assert that `data` matches the JSON schema with the given $id. */
export function expectSchema(id: string, data: unknown) {
  const validate = ajv.getSchema(id);
  if (!validate) throw new Error(`unknown schema: ${id}`);
  const ok = validate(data);
  expect(ok, `schema "${id}" violations:\n${fmt(validate.errors)}`).toBe(true);
}
