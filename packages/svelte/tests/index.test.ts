import { expect, test } from "vite-plus/test";
import { get } from "svelte/store";
import { z } from "zod";

import { createForm } from "../src/index.ts";

test("creates defaults from Standard JSON Schema and validates on submit", async () => {
  const schema = z.object({
    name: z.string().min(2).default("Ada"),
    subscribed: z.boolean().default(false),
  });

  const form = createForm(schema);

  expect(get(form.value)).toEqual({
    name: "Ada",
    subscribed: false,
  });

  await form.patch(["name"], "A");
  const result = await form.submit();

  expect(result.success).toBe(false);
  expect(get(form.errors)?.children?.name?._errors).toContain(
    "Too small: expected string to have >=2 characters",
  );
});

test("returns typed output after submit", async () => {
  const schema = z.string().transform((value) => value.trim().toUpperCase());
  const form = createForm(schema, { initialValue: " ada " });

  const result = await form.submit();

  expect(result).toEqual({
    success: true,
    value: "ADA",
  });
});
