import { expect, test } from "vite-plus/test";
import { z } from "zod";

import {
  flattenValue,
  getInputJsonSchema,
  getValueAtPointer,
  inflateValue,
  normalizeJsonSchema,
  replacePointerValue,
  setValueAtPointer,
} from "../src/index.ts";

test("can set nested values by JSON Pointer", () => {
  expect(setValueAtPointer({ profile: { name: "Ada" } }, "/profile/name", "Lin")).toEqual({
    profile: { name: "Lin" },
  });
});

test("can read nested values by JSON Pointer", () => {
  expect(getValueAtPointer({ profile: { names: ["Ada"] } }, "/profile/names/0")).toBe("Ada");
});

test("flattens and inflates values with schema-aware coercion", () => {
  const schema = z.object({
    profile: z.object({
      name: z.string(),
      age: z.number(),
    }),
    subscribed: z.boolean(),
  });
  const normalizedSchema = normalizeJsonSchema(getInputJsonSchema(schema));
  const fields = flattenValue({
    profile: {
      name: "Ada",
      age: 42,
    },
    subscribed: false,
  });

  expect(fields).toEqual({
    "/profile/name": "Ada",
    "/profile/age": 42,
    "/subscribed": false,
  });
  expect(
    inflateValue(
      {
        "/profile/name": "Ada",
        "/profile/age": "42",
        "/subscribed": "true",
      },
      normalizedSchema,
    ),
  ).toEqual({
    profile: { name: "Ada", age: 42 },
    subscribed: true,
  });
});

test("replaces a pointer subtree in a flat field map", () => {
  expect(
    replacePointerValue(
      {
        "/profile/name": "Ada",
        "/profile/city": "London",
        "/tags/0": "uniforma",
      },
      "/profile",
      { name: "Lin" },
    ),
  ).toEqual({
    "/profile/name": "Lin",
    "/tags/0": "uniforma",
  });
});
