import { expect, test } from "vite-plus/test";
import { z } from "zod";

import { createFormStore, joinPath } from "../src/index.ts";

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
