import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {
    ignorePatterns: ["submodules/**"],
  },
  lint: {
    ignorePatterns: ["submodules/**"],
    options: { typeAware: true, typeCheck: true },
  },
});
