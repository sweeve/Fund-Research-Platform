import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 935 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://127.0.0.1:5173");
await page.getByText("17 个产品").waitFor();
await page.screenshot({
  path: "docs/screenshots/fund-list.png",
  fullPage: true,
});
await page.getByRole("button", { name: "＋ 加入产品池", exact: true }).click();
await page.getByRole("status").filter({ hasText: "请先选择产品" }).waitFor();
await page.getByRole("checkbox", { name: "全选当前页" }).check();
await page.getByRole("button", { name: "＋ 加入产品池", exact: true }).click();
await page.getByText("加入产品池成功，池内共 10 个产品").waitFor();
await page.locator("details").first().locator("summary").click();
await page.getByRole("checkbox", { name: "QDII", exact: true }).check();
await page.waitForTimeout(650);
assert.ok(
  await page
    .locator(".selected-conditions")
    .innerText()
    .then((t) => t.includes("QDII"))
);
await page.getByRole("button", { name: "移除条件", exact: true }).click();
await page.waitForTimeout(650);
await page.locator("details").first().locator("summary").click();
await page.getByRole("button", { name: "下一页" }).click();
await page.waitForTimeout(650);
assert.equal(await page.locator("tbody tr").count(), 7);
await page.getByRole("tab", { name: "暂停中" }).click();
await page.waitForTimeout(650);
assert.ok((await page.locator("tbody").innerText()).includes("暂停中"));
await page.getByLabel("关键字", { exact: true }).fill("不存在");
await page.getByRole("button", { name: "⌕ 查询", exact: true }).click();
await page.getByText("暂无符合条件的产品，请调整筛选条件").waitFor();
await page.getByRole("button", { name: "＋ 重置", exact: true }).click();
await page.waitForTimeout(650);
await page.getByLabel("关键字", { exact: true }).fill("a".repeat(61));
await page.getByRole("button", { name: "⌕ 查询", exact: true }).click();
await page
  .getByRole("alert")
  .filter({ hasText: "关键字最多60个字符" })
  .waitFor();
await page.getByRole("button", { name: "＋ 重置", exact: true }).click();
await page.waitForTimeout(650);
await page.getByRole("button", { name: "测试接口异常", exact: true }).click();
await page.getByRole("button", { name: "重试", exact: true }).waitFor();
await page.getByRole("button", { name: "重试", exact: true }).click();
await page.waitForTimeout(650);
const downloadPromise = page.waitForEvent("download");
await page.getByRole("button", { name: "导出全部", exact: true }).click();
const download = await downloadPromise;
assert.equal(download.suggestedFilename(), "基金产品.csv");
await page.goto("http://127.0.0.1:5173/#/fund/product/006329");
await page.getByRole("heading", { name: "产品收益", exact: true }).waitFor();
await page.screenshot({
  path: "docs/screenshots/fund-detail.png",
  fullPage: true,
});
const path = await page.locator(".series-product").getAttribute("d");
await page.getByRole("button", { name: "近一周", exact: true }).click();
assert.notEqual(await page.locator(".series-product").getAttribute("d"), path);
await page.getByRole("button", { name: "♡ 关注", exact: true }).click();
await page.getByRole("button", { name: "♥ 已关注", exact: true }).waitFor();
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://127.0.0.1:5173");
await page.waitForTimeout(650);
assert.ok(
  await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth
  )
);
await page.screenshot({
  path: "docs/screenshots/fund-mobile.png",
  fullPage: true,
});
assert.deepEqual(errors, []);
console.log(
  "PASS: 浏览器筛选、分页、未选校验、批量入池、空态、长度校验、异常重试、CSV下载、详情图表、关注、移动端溢出与运行时错误检查"
);
await browser.close();
