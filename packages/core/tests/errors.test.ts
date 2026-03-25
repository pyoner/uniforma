import { expect, test } from "vite-plus/test";

import { getErrorsAtPath, hasErrors, issuesToErrorTree } from "../src/index.ts";

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

  expect(hasErrors(errorTree)).toBe(true);
  expect(getErrorsAtPath(errorTree, [])).toContain("Root failed");
  expect(getErrorsAtPath(errorTree, ["contact", "email"])).toContain("Email required");
});
