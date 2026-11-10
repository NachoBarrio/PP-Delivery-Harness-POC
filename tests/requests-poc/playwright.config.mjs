import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "requests.spec.js",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 180_000,
  expect: { timeout: 15_000 },
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/results.json" }],
  ],
  use: {
    browserName: "chromium",
    headless: false,
    trace: "off",
    screenshot: "only-on-failure",
  },
});
