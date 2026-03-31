import { expect, test } from "vite-plus/test";

import { issuePathToSegments, pathToKey, pathToSegments, type IssuePath } from "../src/index.ts";

test("converts form paths to a canonical segment format", () => {
  expect(pathToSegments("profile.names[0]")).toEqual(["profile", "names", 0]);
  expect(pathToSegments(["profile", "names", 0])).toEqual(["profile", "names", 0]);
  expect(pathToSegments("profile[details].name")).toEqual(["profile", "details", "name"]);
  expect(pathToSegments("")).toEqual([]);
});

test("converts issue paths to the same canonical segment format", () => {
  const issuePath: IssuePath = ["profile", { key: "names" }, { key: 0 }];

  expect(issuePathToSegments(issuePath)).toEqual(["profile", "names", 0]);
  expect(issuePathToSegments(undefined)).toEqual([]);
});

test("serializes canonical segments back to a deep path string", () => {
  expect(pathToKey(["profile", "names", 0])).toBe("profile.names[0]");
});
