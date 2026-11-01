import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getProductBaseInfo,
  getReturnAnalysis,
  periodList,
  formatPercent,
  isLeadingRank,
  validateAnalysis,
} from "../src/api/returnAnalysis.js";

test("6个周期由接口生成差异化结果，且每组含正负零空值及四档排名", async () => {
  const result = await Promise.all(
    periodList.map((p) => getReturnAnalysis("006329", p.key, { latency: 0 }))
  );
  assert.equal(new Set(result.map((r) => r.rows[0].myProduct)).size, 6);
  for (const data of result) {
    assert.equal(data.rows.length, 4);
    assert.deepEqual(
      new Set(data.rows.map((r) => r.quartile)),
      new Set(["优秀", "良好", "一般", "不佳"])
    );
    assert.ok(data.rows.some((r) => r.myProduct > 0));
    assert.ok(data.rows.some((r) => r.myProduct < 0));
    assert.ok(data.rows.some((r) => r.myProduct === 0));
    assert.ok(data.rows.some((r) => r.median === null));
    assert.equal(data.series.at(-1).product, data.rows[0].myProduct);
    assert.equal(data.series.at(-1).benchmark, data.rows[0].median);
  }
  assert.ok(
    Math.abs(result[4].rows[0].myProduct) >
      Math.abs(result[0].rows[0].myProduct)
  );
  assert.notEqual(result[0].series[0].date, result[4].series[0].date);
});
test("收益格式不将缺失值错误转为0，同类排名前25%判断校验分母", () => {
  for (const n of [null, undefined, "", NaN, Infinity, "1"])
    assert.equal(formatPercent(n), "--");
  assert.equal(formatPercent(0), "0.00%");
  assert.equal(formatPercent(-0.001), "0.00%");
  assert.equal(formatPercent(2.15), "+2.15%");
  assert.equal(formatPercent(-1.2), "-1.20%");
  assert.ok(isLeadingRank("23/253"));
  assert.ok(!isLeadingRank("102/253"));
  assert.ok(!isLeadingRank("1/0"));
  assert.ok(!isLeadingRank("254/253"));
  assert.ok(!isLeadingRank("0/253"));
});
test("产品、周期、排名与接口结构校验", async () => {
  await assert.rejects(getProductBaseInfo("bad"), /6位数字/);
  await assert.rejects(
    getReturnAnalysis("000000", "week", { latency: 0 }),
    /不存在/
  );
  await assert.rejects(
    getReturnAnalysis("006329", "bad", { latency: 0 }),
    /周期/
  );
  assert.throws(
    () => validateAnalysis({ period: "month", rows: [] }, "week"),
    /结构/
  );
  assert.throws(
    () =>
      validateAnalysis(
        {
          period: "week",
          rows: [
            {
              metric: "收益率",
              quartile: "优秀",
              myProduct: 0,
              median: null,
              peerRank: "254/253",
            },
          ],
        },
        "week"
      ),
    /范围/
  );
  assert.throws(
    () =>
      validateAnalysis(
        {
          period: "week",
          rows: [
            {
              metric: "收益率",
              quartile: "未知",
              myProduct: 0,
              median: null,
              peerRank: "1/253",
            },
          ],
        },
        "week"
      ),
    /排名/
  );
});
test("空数据、收益异常、头部异常互不污染且可恢复", async () => {
  const empty = await getReturnAnalysis("006329", "week", {
    scenario: "empty",
    latency: 0,
  });
  assert.equal(empty.rows.length, 0);
  const [base, result] = await Promise.allSettled([
    getProductBaseInfo("006329"),
    getReturnAnalysis("006329", "week", { scenario: "error", latency: 0 }),
  ]);
  assert.equal(base.status, "fulfilled");
  assert.equal(result.status, "rejected");
  await assert.rejects(
    getProductBaseInfo("006329", { fail: true }),
    /加载失败/
  );
  assert.ok(
    (await getReturnAnalysis("006329", "week", { latency: 0 })).rows.length
  );
  assert.equal((await getProductBaseInfo("006329")).expireDate, null);
});
