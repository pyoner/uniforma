import { expect, test } from "vite-plus/test";
import { z } from "zod";

import {
  getDefaultValue,
  getInputJsonSchema,
  normalizeJsonSchema,
  validateSchema,
} from "../src/index.ts";

test("extracts JSON Schema from a dual standard schema", () => {
  const schema = z.object({
    profile: z.object({
      name: z.string().default("Ada"),
      subscribed: z.boolean().default(false),
    }),
    tags: z.array(z.string()).default([]),
  });

  const jsonSchema = getInputJsonSchema(schema);
  const normalized = normalizeJsonSchema(jsonSchema);

  expect(normalized.kind).toBe("object");
  expect(normalized.properties?.profile?.kind).toBe("object");
  expect(normalized.properties?.tags?.kind).toBe("array");
  expect(getDefaultValue(jsonSchema)).toEqual({
    profile: {
      name: "Ada",
      subscribed: false,
    },
    tags: [],
  });
});

test("validates with Standard Schema and returns a normalized failure shape", async () => {
  const schema = z.object({
    profile: z.object({
      name: z.string().min(2, "Name is too short"),
    }),
    age: z.number().min(18, "Age must be 18 or older"),
  });

  const result = await validateSchema(schema, {
    profile: { name: "A" },
    age: 15,
  });

  expect(result.success).toBe(false);
  if (result.success) {
    throw new Error("expected validation to fail");
  }

  expect(result.issues).toHaveLength(2);
});
