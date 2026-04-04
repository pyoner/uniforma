import { expect, test } from "vite-plus/test";
import type { StandardSchemaV1 } from "@standard-schema/spec";

import {
  appendJsonPointer,
  escapeJsonPointerToken,
  isJsonPointerDescendant,
  issuePathToPointer,
  pointerToSegments,
  segmentsToPointer,
} from "../src/index.ts";

test("converts JSON Pointer values to canonical segments", () => {
  expect(pointerToSegments("/profile/names/0")).toEqual(["profile", "names", "0"]);
  expect(pointerToSegments("")).toEqual([]);
  expect(segmentsToPointer(["profile", "names", "0"])).toBe("/profile/names/0");
});

test("converts issue paths to JSON Pointers", () => {
  const issuePath: StandardSchemaV1.Issue["path"] = ["profile", { key: "names" }, { key: 0 }];

  expect(issuePathToPointer(issuePath)).toBe("/profile/names/0");
  expect(issuePathToPointer(undefined)).toBe("");
});

test("appends escaped pointer tokens and detects descendants", () => {
  expect(appendJsonPointer("/profile", "full/name")).toBe(
    `/profile/${escapeJsonPointerToken("full/name")}`,
  );
  expect(isJsonPointerDescendant("/profile/name", "/profile")).toBe(true);
  expect(isJsonPointerDescendant("/profile", "/profile")).toBe(false);
});
