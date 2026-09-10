import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import catalog from "../../catalog.json";
import config from "../../marketplace.json";

test("home uses real catalog cards and links to the developer guide", async ({ page }) => {
  await page.goto("./?lang=zh-CN");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("更加强大");
  await expect(page.locator(".plugin-card")).toHaveCount(config.featured.length);
  await page.screenshot({ path: test.info().outputPath("home.png"), fullPage: true });
  await page.getByRole("link", { name: "开发插件", exact: true }).first().click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("开发插件。");
  await expect(page.locator("pre").first()).toContainText("scripts/new_plugin.py");
});

test("search and category filtering preserve each other and can be cleared", async ({ page }) => {
  await page.goto("./plugins/?lang=zh-CN");
  await page.getByRole("textbox", { name: "搜索", exact: true }).fill("文本");
  await page.getByRole("button", { name: "搜索", exact: true }).click();
  await expect(page.locator(".plugin-card")).toHaveCount(1);
  await expect(page.locator(".plugin-card h3")).toHaveText("文本统计");
  await page.getByRole("link", { name: "效率工具", exact: true }).click();
  await expect(page.getByText("没有找到插件。", { exact: true })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "搜索", exact: true })).toHaveValue("文本");
  await page.getByRole("link", { name: "清除筛选", exact: true }).click();
  await expect(page.locator(".plugin-card")).toHaveCount(catalog.plugins.length);
});

test("language persists across static navigation and search matches translations", async ({ page }) => {
  await page.goto("./plugins/?lang=zh-CN");
  await page.getByRole("combobox", { name: "语言" }).first().selectOption("en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Browse plugins.");
  await page.getByRole("textbox", { name: "Search", exact: true }).fill("Quick Notes");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page.getByRole("heading", { name: "Quick Notes", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Quick Notes");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("detail shows permissions and the downloaded bytes match the catalog", async ({ page, request }) => {
  const plugin = catalog.plugins.find((entry) => entry.id === "belfry.quick-notes")!;
  const version = plugin.versions[0];
  await page.goto(`./plugins/${plugin.id}/?lang=zh-CN`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("工作便笺");
  await expect(page.locator(".permission-name")).toHaveText("ui.panel");
  const link = page.getByRole("link", { name: "下载 .piplug", exact: true }).first();
  const url = await link.getAttribute("href");
  const response = await request.get(url!);
  expect(response.ok()).toBeTruthy();
  const bytes = await response.body();
  expect(createHash("sha256").update(bytes).digest("hex")).toBe(version.shasum);
  expect(bytes.length).toBe(version.sizeBytes);
  await page.getByText("版本记录 · 1", { exact: true }).click();
  await expect(page.locator(".version-entry")).toBeVisible();
  await page.screenshot({ path: test.info().outputPath("plugin-detail.png"), fullPage: true });
});

test("clipboard denial exposes a selectable URL instead of an unhandled error", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { value: { writeText: () => Promise.reject(new Error("denied")) } });
  });
  await page.goto("./plugins/?lang=zh-CN");
  await page.getByRole("button", { name: "复制市场地址", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "URL", exact: true })).toHaveValue(/ChengSoon\/belfry-desktop-plugins/);
});

test("mobile layout keeps search and navigation usable without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./plugins/?lang=zh-CN");
  await expect(page.getByRole("button", { name: "搜索", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.locator(".plugin-card h3").first().click();
  await expect(page.getByRole("link", { name: "下载 .piplug", exact: true }).first()).toBeVisible();
  await page.screenshot({ path: test.info().outputPath("mobile-plugin.png"), fullPage: true });
});
