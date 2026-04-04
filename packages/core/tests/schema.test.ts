import { expect, test } from "vite-plus/test";
import { z } from "zod";

import {
  getArrayItemSchema,
  getDefaultValue,
  getInputJsonSchema,
  resolveSchemaKind,
  type JSONSchema,
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
  const profileSchema = jsonSchema.properties?.profile as JSONSchema | undefined;
  const tagsSchema = jsonSchema.properties?.tags as JSONSchema | undefined;

  expect(resolveSchemaKind(jsonSchema)).toBe("object");
  if (profileSchema) {
    expect(resolveSchemaKind(profileSchema)).toBe("object");
  }
  if (tagsSchema) {
    expect(resolveSchemaKind(tagsSchema)).toBe("array");
    expect(resolveSchemaKind(getArrayItemSchema(tagsSchema) ?? tagsSchema)).toBe("string");
  }
  expect(getDefaultValue(jsonSchema)).toEqual({
    profile: {
      name: "Ada",
      subscribed: false,
    },
    tags: [],
  });
});
