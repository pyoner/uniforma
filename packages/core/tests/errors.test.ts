import { expect, test } from "vite-plus/test";

import { getIssuesAtPath, getMessagesAtPath, hasErrors } from "../src/index.ts";

test("creates root and nested error branches", () => {
  const failure = {
    issues: [
      {
        message: "Root failed",
      },
      {
        message: "Email required",
        path: ["contact", "email"],
      },
    ],
  };

  expect(hasErrors(failure)).toBe(true);
  expect(getMessagesAtPath(failure, "")).toContain("Root failed");
  expect(getMessagesAtPath(failure, ["contact", "email"])).toContain("Email required");
  expect(getIssuesAtPath(failure, ["contact", "email"])).toHaveLength(1);
});
