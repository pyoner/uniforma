import { expect, test } from "vite-plus/test";

import { issuePathToJsonPointer, issuePathToSegments } from "../src/spec.ts";

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
