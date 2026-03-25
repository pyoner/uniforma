import { expect, test } from "vite-plus/test";
import { z } from "zod";

import { createFormStore } from "../src/index.ts";

test("creates defaults from Standard JSON Schema and validates on submit", async () => {
  const schema = z.object({
    name: z.string().min(2).default("Ada"),
    subscribed: z.boolean().default(false),
  });

  const form = createFormStore({ schema });

  expect(form.getValue()).toEqual({
    name: "Ada",
    subscribed: false,
  });

  await form.setPathValue("name", "A");
  const result = await form.submit();

  expect(result.success).toBe(false);
  expect(form.$errors.get()?.children?.name?._errors).toContain(
    "Too small: expected string to have >=2 characters",
  );
});

test("returns typed output after submit", async () => {
  const schema = z.string().transform((value) => value.trim().toUpperCase());
  const form = createFormStore({ schema, initialValue: " ada " });

  const result = await form.submit();

  expect(result).toEqual({
    success: true,
    value: "ADA",
  });
});
