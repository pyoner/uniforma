import { expect, test } from "vite-plus/test";

import { setAtPath } from "../src/index.ts";

test("can set nested values by path", () => {
  expect(setAtPath({ profile: { name: "Ada" } }, ["profile", "name"], "Lin")).toEqual({
    profile: { name: "Lin" },
  });
});
