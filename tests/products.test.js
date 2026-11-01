import { test } from "node:test";
import assert from "node:assert/strict";
import {
  products,
  filterProducts,
  getProductList,
  addToPool,
  getProductDetail,
  formatReturn,
  simulateFailure,
} from "../src/api/products.js";
test("50条产品包含三种状态与正负零收益", () => {
  assert.equal(products.length, 50);
  assert.equal(new Set(products.map((p) => p.runStatus)).size, 3);
  assert.ok(products.some((p) => p.return1m === 0));
  assert.ok(products.some((p) => p.return1m < 0));
  assert.ok(products.some((p) => p.return1m > 0));
});
test("过滤、分页、关键字及组合条件", async () => {
  const params = { runStatus: "running", pageNo: 1, pageSize: 10 };
  const a = await getProductList(params);
  const b = await getProductList({ ...params, pageNo: 2 });
  assert.equal(a.total, 17);
  assert.equal(a.list.length, 10);
  assert.equal(b.list.length, 7);
  assert.ok(!b.list.some((p) => a.list.some((x) => x.id === p.id)));
  assert.equal(filterProducts({ keyword: "006329" }).length, 1);
  assert.ok(
    filterProducts({
      investTypes: ["QDII"],
      tradeStatus: ["可申购"],
      baseInfos: ["成立满5年"],
    }).every(
      (p) =>
        p.age >= 5 &&
        p.investType === "QDII" &&
        p.tradeStatus.includes("可申购")
    )
  );
  assert.equal(filterProducts({ keyword: "不存在" }).length, 0);
});
test("校验与接口错误可恢复", async () => {
  await assert.rejects(addToPool([]));
  await assert.rejects(getProductList({ pageNo: 0, pageSize: 10 }));
  simulateFailure();
  await assert.rejects(
    getProductList({ pageNo: 1, pageSize: 10 }),
    /模拟网络异常/
  );
  assert.ok((await getProductList({ pageNo: 1, pageSize: 10 })).list.length);
});
test("详情与收益格式", async () => {
  assert.equal((await getProductDetail("006329")).periods.length, 6);
  await assert.rejects(getProductDetail("000000"));
  assert.equal(formatReturn(0), "0.00%");
  assert.equal(formatReturn(-8.76), "-8.76%");
  assert.equal(formatReturn(12.67), "+12.67%");
});
