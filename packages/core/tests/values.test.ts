import { expect, test } from "vite-plus/test";

import { getValueAtPointer, normalizeFormValue, setValueAtPointer } from "../src/index.ts";

test("can set nested values by JSON Pointer", () => {
  expect(setValueAtPointer({ profile: { name: "Ada" } }, "/profile/name", "Lin")).toEqual({
    profile: { name: "Lin" },
  });
});

test("can read nested values by JSON Pointer", () => {
  expect(getValueAtPointer({ profile: { names: ["Ada"] } }, "/profile/names/0")).toBe("Ada");
});

test("removes undefined object properties while preserving nested arrays", () => {
  expect(
    normalizeFormValue({
      profile: {
        name: "Ada",
        age: undefined,
      },
      tags: ["uniforma", undefined],
    }),
  ).toEqual({
    profile: { name: "Ada" },
    tags: ["uniforma", undefined],
  });
});
