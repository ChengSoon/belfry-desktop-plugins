import { defineConfig } from "@playwright/test";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const command = "python3 ../scripts/serve_website.py --port 8767";

export default defineConfig({
  testDir: "./tests",
  outputDir: "../test-results",
  fullyParallel: true,
  workers: 2,
  timeout: 30_000,
  use: {
    baseURL: `http://127.0.0.1:8767${basePath}/`,
    locale: "zh-CN",
    viewport: { width: 1440, height: 1000 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    channel: process.env.PLAYWRIGHT_CHANNEL,
  },
  webServer: { command, url: `http://127.0.0.1:8767${basePath}/`, reuseExistingServer: false },
});
