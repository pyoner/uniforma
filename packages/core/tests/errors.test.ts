import { expect, test } from "vite-plus/test";

import {
  getIssuePointer,
  getIssuesAtPointer,
  getMessagesAtPointer,
  hasErrors,
} from "../src/index.ts";

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

  const nestedIssue = failure.issues[1];
  if (!nestedIssue) {
    throw new Error("expected nested issue");
  }

  expect(hasErrors(failure)).toBe(true);
  expect(getIssuePointer(nestedIssue)).toBe("/contact/email");
  expect(getMessagesAtPointer(failure, "")).toContain("Root failed");
  expect(getMessagesAtPointer(failure, "/contact/email")).toContain("Email required");
  expect(getIssuesAtPointer(failure, "/contact/email")).toHaveLength(1);
});
