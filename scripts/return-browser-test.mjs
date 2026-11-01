import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const root = process.env.BASE_URL || "http://127.0.0.1:5173";
const performance = () =>
  page.getByRole("table", { name: "收益表现数据", exact: true });
await page.goto(root + "/#/fund/product/006329");
await page
  .getByRole("heading", { name: "易方达互联网50ETF联接 006329" })
  .waitFor();
await performance()
  .getByRole("rowheader", { name: "近一周收益率", exact: true })
  .waitFor();
assert.equal(await performance().locator("tbody tr").count(), 4);
assert.equal(await performance().getByText("--", { exact: true }).count(), 1);
for (const [label, kind] of [
  ["优秀", "success"],
  ["良好", "info"],
  ["一般", "neutral"],
  ["不佳", "danger"],
])
  assert.ok(
    await performance()
      .locator(".bfe-tag." + kind)
      .getByText(label, { exact: true })
      .count()
  );
assert.equal(await performance().locator(".positive").count(), 4);
assert.equal(await performance().locator(".negative").count(), 2);
assert.equal(
  await performance().getByText("0.00%", { exact: true }).count(),
  1
);
assert.equal(await performance().locator(".return-page__leading").count(), 1);
assert.equal(
  await page
    .locator(".return-page__title-row")
    .evaluate((e) => getComputedStyle(e).display),
  "flex"
);
await page.screenshot({
  path: "docs/screenshots/return-analysis-desktop.png",
  fullPage: true,
});
// 验证真实重新请求：切换时只有收益表loading，头部标题持续可见。
const week = await performance().locator("tbody tr").first().innerText();
await page.getByRole("tab", { name: "近一年", exact: true }).click();
await page.locator('.bfe-table[aria-busy="true"]').waitFor();
assert.ok(
  await page
    .getByRole("heading", { name: "易方达互联网50ETF联接 006329" })
    .isVisible()
);
await performance()
  .getByRole("rowheader", { name: "近一年收益率", exact: true })
  .waitFor();
assert.notEqual(
  await performance().locator("tbody tr").first().innerText(),
  week
);
const snapshots = [];
for (const label of [
  "近一周",
  "近一月",
  "近三月",
  "近六月",
  "近一年",
  "成立以来",
]) {
  await page.getByRole("tab", { name: label, exact: true }).click();
  await performance()
    .getByRole("rowheader", { name: label + "收益率", exact: true })
    .waitFor();
  snapshots.push(await performance().locator("tbody tr").first().innerText());
}
assert.equal(new Set(snapshots).size, 6);
// 多次快速切换，最终内容与当前选择一致。
await page.getByRole("tab", { name: "近一月", exact: true }).click();
await page.getByRole("tab", { name: "成立以来", exact: true }).click();
await page.getByRole("tab", { name: "近三月", exact: true }).click();
await performance()
  .getByRole("rowheader", { name: "近三月收益率", exact: true })
  .waitFor();
await page.waitForTimeout(600);
assert.equal(
  await page
    .getByRole("tab", { name: "近三月", exact: true })
    .getAttribute("aria-selected"),
  "true"
);
assert.ok((await performance().innerText()).includes("近三月收益率"));
// 方向键与回车可切换周期。
await page.getByRole("tab", { name: "近三月", exact: true }).focus();
await page.keyboard.press("ArrowRight");
await page.keyboard.press("Enter");
await performance()
  .getByRole("rowheader", { name: "近六月收益率", exact: true })
  .waitFor();
await page.getByText("模拟接口演示", { exact: true }).click();
await page.getByRole("button", { name: "模拟空数据", exact: true }).click();
await performance().getByText("暂无数据", { exact: true }).waitFor();
await page.getByRole("button", { name: "模拟收益异常", exact: true }).click();
await page.getByRole("button", { name: "重试收益数据", exact: true }).waitFor();
assert.ok(
  await page
    .getByRole("heading", { name: "易方达互联网50ETF联接 006329" })
    .isVisible()
);
await page.getByRole("button", { name: "重试收益数据", exact: true }).click();
await performance()
  .getByRole("rowheader", { name: "近六月收益率", exact: true })
  .waitFor();
await page.getByRole("button", { name: "模拟头部异常", exact: true }).click();
await page.getByRole("button", { name: "重试产品信息", exact: true }).waitFor();
assert.ok(
  await performance()
    .getByRole("rowheader", { name: "近六月收益率", exact: true })
    .isVisible()
);
await page.getByRole("button", { name: "重试产品信息", exact: true }).click();
await page
  .getByRole("heading", { name: "易方达互联网50ETF联接 006329" })
  .waitFor();
await page.getByRole("tab", { name: "风险分析", exact: true }).click();
await page.waitForURL("**/risk");
assert.ok(
  await page.getByRole("heading", { name: "风险分析", exact: true }).isVisible()
);
await page.reload();
await page.getByRole("heading", { name: "风险分析", exact: true }).waitFor();
await page.getByRole("tab", { name: "收益分析", exact: true }).click();
await page.waitForURL("**/return");
await performance()
  .getByRole("rowheader", { name: "近一周收益率", exact: true })
  .waitFor();
await page.getByRole("button", { name: "♡ 关注", exact: true }).click();
await page.getByRole("button", { name: "♥ 已关注", exact: true }).waitFor();
await page
  .getByRole("navigation", { name: "侧边导航" })
  .getByRole("button", { name: "基金经理", exact: true })
  .click();
assert.equal(
  await page
    .getByRole("navigation", { name: "侧边导航" })
    .getByRole("button", { name: "基金经理", exact: true })
    .getAttribute("aria-current"),
  "page"
);
await page.goto(root + "/#/fund/product/invalid");
await page
  .getByRole("alert")
  .filter({ hasText: "基金代码必须为6位数字" })
  .first()
  .waitFor();
await page.goto(root + "/#/fund/product/000000");
await page
  .getByRole("alert")
  .filter({ hasText: "产品不存在" })
  .first()
  .waitFor();
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(root + "/#/fund/product/006329");
await performance()
  .getByRole("rowheader", { name: "近一周收益率", exact: true })
  .waitFor();
assert.ok(
  await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth
  )
);
await page.screenshot({
  path: "docs/screenshots/return-analysis-mobile.png",
  fullPage: true,
});
await page
  .getByRole("navigation", { name: "面包屑" })
  .getByRole("link", { name: "基金产品", exact: true })
  .click();
await page.waitForURL(root + "/#/");
assert.deepEqual(errors, []);
console.log(
  "PASS: 新收益页默认周期、独立加载、6周期查询、快速切换、四档标签、正负零空值、排名强调、键盘、空态、独立异常恢复、路由刷新、关注、菜单、代码校验、移动溢出和面包屑返回"
);
await browser.close();
