import { defineConfig } from "playwright/test";

const baseURL =
  process.env.START_SCREEN_BASE_URL ?? "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 15_000,
  use: {
    baseURL,
    channel: "chrome",
    trace: "retain-on-failure",
  },
  webServer: process.env.START_SCREEN_BASE_URL
    ? undefined
    : {
        command: "npm run start -- -H 127.0.0.1 -p 3100",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 30_000,
      },
});
