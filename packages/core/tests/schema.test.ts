import { expect, test } from "vite-plus/test";
import { z } from "zod";

import { getDefaultValue, getInputJsonSchema, normalizeJsonSchema } from "../src/index.ts";

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
