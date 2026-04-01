import { expect, test } from "vite-plus/test";
import { z } from "zod";

import { createFormController } from "../src/index.ts";

test("creates pointer-based initial fields from schema defaults", () => {
  const schema = z.object({
    profile: z.object({
      name: z.string().default("Ada"),
    }),
    tags: z.array(z.string()).default([]),
    subscribed: z.boolean().default(false),
  });

  const controller = createFormController({ schema });

  expect(controller.initialValue).toEqual({
    profile: { name: "Ada" },
    tags: [],
    subscribed: false,
  });
  expect(controller.initialFields).toEqual({
    "/profile/name": "Ada",
    "/subscribed": false,
  });
  expect(controller.validateOn).toEqual(["submit"]);
  expect(controller.shouldValidate("submit")).toBe(true);
  expect(controller.shouldValidate("blur")).toBe(false);
});

test("validates flat fields and returns transformed output", async () => {
  const schema = z.object({
    name: z.string().transform((value) => value.trim().toUpperCase()),
  });

  const controller = createFormController({
    schema,
    validateOn: ["change", "submit"],
  });

  const result = await controller.validate({
    "/name": " ada ",
  });

  expect(controller.shouldValidate("change")).toBe(true);
  expect(result).toEqual({
    success: true,
    value: {
      name: "ADA",
    },
  });
});
