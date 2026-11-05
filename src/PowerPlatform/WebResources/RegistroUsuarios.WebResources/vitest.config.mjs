import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["cap_/src/**/*.test.js"],
    exclude: ["PCFs/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      include: ["cap_/src/js/**/*.js"],
      exclude: ["**/*.test.js"],
    },
  },
});
