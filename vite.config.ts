import { defineConfig } from "vite-plus";
import { configDefaults } from "vite-plus/test/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [svelte()],
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
  test: {
    exclude: [...configDefaults.exclude, "submodules/**"],
  },
});
