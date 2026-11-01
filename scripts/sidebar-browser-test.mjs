import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const b = await chromium.launch({ channel: "msedge", headless: true });
const p = await b.newPage({ viewport: { width: 1440, height: 935 } });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
await p.goto(
  (process.env.BASE_URL || "http://127.0.0.1:5173") + "/#/fund/product/006329"
);
const menu = p.getByRole("navigation", { name: "侧边导航" });
await menu.getByRole("button", { name: "基金产品", exact: true }).waitFor();
assert.equal(await p.locator(".app-shell__sidebar").count(), 1);
await p
  .getByRole("navigation", { name: "主导航" })
  .getByRole("button", { name: "产品管理", exact: true })
  .click();
await p.getByRole("heading", { name: "基金产品列表", exact: true }).waitFor();
assert.ok(
  await menu.getByRole("button", { name: "基金产品", exact: true }).isVisible()
);
await menu.getByRole("button", { name: "⌂　公募基金" }).click();
assert.ok(
  await menu.getByRole("button", { name: "基金产品", exact: true }).isVisible()
);
await p.locator("tbody a").first().click();
await p.getByRole("heading", { name: "收益分析收益表现" }).waitFor();
assert.equal(await p.locator(".app-shell__sidebar").count(), 1);
await menu.getByRole("button", { name: "基金产品", exact: true }).click();
await p.getByRole("heading", { name: "基金产品列表", exact: true }).waitFor();
await p.reload();
await p.getByRole("heading", { name: "基金产品列表", exact: true }).waitFor();
assert.ok(
  await menu.getByRole("button", { name: "基金产品", exact: true }).isVisible()
);
await p.setViewportSize({ width: 390, height: 844 });
assert.ok(
  await menu.getByRole("button", { name: "基金产品", exact: true }).isVisible()
);
assert.ok(
  await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
);
assert.deepEqual(errors, []);
console.log(
  "PASS: 产品管理返回列表、列表详情共享单一侧栏、分组固定展开、基金产品返回、刷新与移动端"
);
await b.close();
