import js from "@eslint/js";

export default [
  { ignores: ["PCFs/**", "node_modules/**"] },
  {
    ...js.configs.recommended,
    files: ["cap_/src/js/**/*.js"],
    ignores: ["**/*.test.js"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "script",
      globals: { Xrm: "readonly" },
    },
  },
  {
    ...js.configs.recommended,
    files: ["**/*.test.js", "*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
];
