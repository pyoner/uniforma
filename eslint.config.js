import svelte from "eslint-plugin-svelte";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["**/dist/**", "**/node_modules/**", "submodules/**"],
  },
  ...svelte.configs["flat/recommended"],
  {
    files: ["apps/**/*.svelte", "packages/**/*.svelte"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
];
