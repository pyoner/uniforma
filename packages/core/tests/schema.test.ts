import { expect, test } from "vite-plus/test";
import { z } from "zod";

import {
  getDefaultValue,
  getInputJsonSchema,
  normalizeJsonSchema,
  resolveSchemaKind,
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

  expect(resolveSchemaKind(normalized)).toBe("object");
  if (normalized.properties?.profile) {
    expect(resolveSchemaKind(normalized.properties.profile)).toBe("object");
  }
  if (normalized.properties?.tags) {
    expect(resolveSchemaKind(normalized.properties.tags)).toBe("array");
  }
  expect(getDefaultValue(jsonSchema)).toEqual({
    profile: {
      name: "Ada",
      subscribed: false,
    },
    tags: [],
  });
});
