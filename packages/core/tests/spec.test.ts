import { expect, test } from "vite-plus/test";
import { z } from "zod";

import { Uniforma, issuePathToJsonPointer, issuePathToSegments } from "../src/index.ts";

test("converts standard schema issue paths to JSON Pointers", () => {
  expect(issuePathToSegments(["profile", { key: "names" }, { key: 0 }])).toEqual([
    "profile",
    "names",
    "0",
  ]);
  expect(issuePathToSegments(undefined)).toEqual([]);
  expect(issuePathToJsonPointer(["profile", { key: "names" }, { key: 0 }])).toBe(
    "/profile/names/0",
  );
  expect(issuePathToJsonPointer([{ key: "a/b" }, { key: "c~d" }])).toBe("/a~1b/c~0d");
  expect(issuePathToJsonPointer(undefined)).toBe("");
});

test("exposes generated JSON Schema through Uniforma", () => {
  const schema = z.object({
    profile: z.object({
      name: z.string(),
    }),
  });

  const uniforma = new Uniforma(schema);
  const jsonSchema = uniforma.getJSONSchema();
  const draft07Schema = uniforma.getJSONSchema({ target: "draft-07" });

  expect(jsonSchema.type).toBe("object");
  expect(jsonSchema.properties?.profile).toMatchObject({
    type: "object",
  });
  expect(draft07Schema).toMatchObject({
    type: "object",
  });
});

test("forwards Standard Schema validation results through Uniforma", async () => {
  const schema = z.object({
    profile: z.object({
      name: z.string().min(2, "Name is too short"),
    }),
  });

  const uniforma = new Uniforma(schema, schema);
  const result = await uniforma.validate({
    profile: { name: "A" },
  });

  expect(result.issues).toHaveLength(1);
  if (!result.issues) {
    throw new Error("expected validation to fail");
  }

  expect(issuePathToJsonPointer(result.issues[0]?.path)).toBe("/profile/name");
});
