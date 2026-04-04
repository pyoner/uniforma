import { expect, test } from "vite-plus/test";
import { z } from "zod";

import { createFormController, getMessagesAtPointer } from "../src/index.ts";

test("re-exports the core controller and pointer error helpers", async () => {
  const schema = z.object({
    name: z.string().min(2).default("Ada"),
    subscribed: z.boolean().default(false),
  });

  const controller = createFormController({ schema });

  const result = await controller.validate({
    name: "A",
    subscribed: false,
  });

  expect(result.issues).toBeDefined();
  if (!result.issues) {
    throw new Error("expected validation to fail");
  }

  expect(getMessagesAtPointer(result, "/name")).toContain(
    "Too small: expected string to have >=2 characters",
  );
});

test("returns typed output after validation", async () => {
  const schema = z.string().transform((value) => value.trim().toUpperCase());
  const controller = createFormController({ schema, initialValue: " ada " });

  const result = await controller.validate(" ada ");

  expect(result).toEqual({
    value: "ADA",
  });
});
