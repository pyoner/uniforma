import { expect, test } from "vite-plus/test";

import { getAtPath, setAtPath } from "../src/index.ts";

test("can set nested values by path", () => {
  expect(setAtPath({ profile: { name: "Ada" } }, ["profile", "name"], "Lin")).toEqual({
    profile: { name: "Lin" },
  });
});

test("can read nested values by deepmap-compatible string path", () => {
  expect(getAtPath({ profile: { names: ["Ada"] } }, "profile.names[0]")).toBe("Ada");
});

test("can set nested values by deepmap-compatible string path", () => {
  expect(setAtPath({ profile: { names: ["Ada"] } }, "profile.names[0]", "Lin")).toEqual({
    profile: { names: ["Lin"] },
  });
});

test("keeps compatibility for non-numeric bracket segments", () => {
  const value = { profile: { details: { name: "Ada" } } };

  expect(getAtPath(value, "profile[details].name")).toBe("Ada");
  expect(setAtPath(value, "profile[details].name", "Lin")).toEqual({
    profile: { details: { name: "Lin" } },
  });
});
