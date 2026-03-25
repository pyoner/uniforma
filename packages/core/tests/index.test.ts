import { expect, test } from "vite-plus/test";
import { z } from "zod";

import {
  createFormStore,
  getDefaultValue,
  getErrorsAtPath,
  getInputJsonSchema,
  joinPath,
  hasErrors,
  issuesToErrorTree,
  normalizeJsonSchema,
  setAtPath,
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

test("maps validation issues to a nested error tree", async () => {
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

  expect(hasErrors(result.errorTree)).toBe(true);
  expect(getErrorsAtPath(result.errorTree, ["profile", "name"])).toContain("Name is too short");
  expect(getErrorsAtPath(result.errorTree, ["age"])).toContain("Age must be 18 or older");
});

test("can set nested values by path", () => {
  expect(setAtPath({ profile: { name: "Ada" } }, ["profile", "name"], "Lin")).toEqual({
    profile: { name: "Lin" },
  });
});

test("creates root and nested error branches", () => {
  const errorTree = issuesToErrorTree([
    {
      message: "Root failed",
      path: [],
      raw: { message: "Root failed" },
    },
    {
      message: "Email required",
      path: ["contact", "email"],
      raw: { message: "Email required", path: ["contact", "email"] },
    },
  ]);

  expect(getErrorsAtPath(errorTree, [])).toContain("Root failed");
  expect(getErrorsAtPath(errorTree, ["contact", "email"])).toContain("Email required");
});

test("manages form state with deep paths", async () => {
  const schema = z.object({
    profile: z.object({
      name: z.string().min(2, "Name is too short").default("Ada"),
    }),
    tags: z.array(z.string()).default([]),
  });

  const form = createFormStore({
    schema,
    validateOn: ["change", "blur"],
  });

  expect(form.getValue()).toEqual({
    profile: { name: "Ada" },
    tags: [],
  });

  await form.setPathValue("profile.name", "A");
  expect(form.getPathValue("profile.name")).toBe("A");
  expect(form.$errors.get()).not.toBeNull();

  const nameField = form.field(joinPath("profile", "name"));
  await nameField.blur();
  expect(nameField.$touched.get()).toBe(true);
  expect(nameField.$errors.get()).toContain("Name is too short");
});

test("submits validated output from form store", async () => {
  const schema = z.string().transform((value) => value.trim().toUpperCase());
  const form = createFormStore({
    schema,
    initialValue: " ada ",
  });

  const result = await form.submit();

  expect(result).toEqual({
    success: true,
    value: "ADA",
  });
});
