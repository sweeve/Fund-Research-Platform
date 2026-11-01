// 所有示例数据由模拟服务生成；视图只消费异步 API，不嵌入产品记录。
const names = [
  "易方达互联网50ETF联接",
  "华夏沪深300ETF联接",
  "南方稳健成长混合",
  "广发中证500指数",
  "招商产业债券",
];
const types = ["QDII", "股票型", "混合型", "债券型", "货币型"];
export const products = Array.from({ length: 50 }, (_, i) => ({
  id: `F${String(i + 1).padStart(3, "0")}`,
  productCode: String(6329 + i).padStart(6, "0"),
  productName:
    names[i % 5] + (i < 5 ? "" : ` ${String.fromCharCode(65 + (i % 3))}`),
  managers: ["丁宇佳 欧阳帆 陶尹斌", "张坤", "刘彦春", "张萍", "王景"][i % 5],
  establishDate: `${2015 + (i % 10)}-02-25`,
  runStatus: ["running", "paused", "terminated"][i % 3],
  investType: types[i % 5],
  company: ["易方达基金", "华夏基金", "南方基金"][i % 3],
  age: 2026 - (2015 + (i % 10)),
  scale: 10 + i * 3,
  tradeStatus: i % 2 === 0 ? ["可申购", "可赎回"] : ["限大额", "可赎回"],
  return1m: [12.67, 0, -8.76, 2.15, -1.2][i % 5],
  return6m: [12.67, -8.76, 0, 4.3, -3.2][i % 5],
  returnSince: [12.67, 0, -18.52, 24.1, -8.76][i % 5],
}));
let failNext = false;
export function simulateFailure() {
  failNext = true;
}
const delay = (value, ms = 500) =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      if (failNext) {
        failNext = false;
        reject(new Error("模拟网络异常，请重试"));
      } else resolve(value);
    }, ms)
  );
export function getFilterOptions() {
  return delay({
    investTypes: types,
    baseInfos: [
      "成立满5年",
      "规模100亿以上",
      "易方达基金",
      "华夏基金",
      "南方基金",
    ],
    tradeStatus: ["可申购", "不可申购", "可赎回", "不可赎回", "限大额"],
  });
}
export function filterProducts(params = {}) {
  const keyword = (params.keyword || "").trim().toLowerCase();
  return products.filter(
    (p) =>
      (!params.runStatus || p.runStatus === params.runStatus) &&
      (!keyword ||
        [p.productCode, p.productName, p.managers].some((v) =>
          v.toLowerCase().includes(keyword)
        )) &&
      (!(params.investTypes || []).length ||
        params.investTypes.includes(p.investType)) &&
      (!(params.tradeStatus || []).length ||
        params.tradeStatus.some((t) => p.tradeStatus.includes(t))) &&
      (params.baseInfos || []).every((t) =>
        t === "成立满5年"
          ? p.age >= 5
          : t === "规模100亿以上"
          ? p.scale >= 100
          : p.company === t
      )
  );
}
export function getProductList(params = {}) {
  if (
    !Number.isInteger(params.pageNo) ||
    params.pageNo < 1 ||
    ![10, 20, 50].includes(params.pageSize)
  )
    return Promise.reject(new Error("分页参数无效"));
  const all = filterProducts(params);
  return delay({
    total: all.length,
    list: all.slice(
      (params.pageNo - 1) * params.pageSize,
      params.pageNo * params.pageSize
    ),
  });
}
const pool = new Set();
export function addToPool(ids) {
  if (!ids.length || ids.some((id) => !products.some((p) => p.id === id)))
    return Promise.reject(new Error("请选择有效产品"));
  return delay(null).then(() => {
    ids.forEach((id) => pool.add(id));
    return { code: 0, total: pool.size };
  });
}
export function exportProducts(ids, params = {}) {
  return delay(
    {
      rows: ids
        ? products.filter((p) => ids.includes(p.id))
        : filterProducts(params),
    },
    2000
  );
}
export function getProductDetail(code) {
  const p = products.find((p) => p.productCode === code);
  if (!p) return Promise.reject(new Error("产品不存在"));
  return delay({
    ...p,
    periods: ["近一周", "近一月", "近三月", "近六月", "近一年", "成立以来"].map(
      (label, i) => ({
        label,
        product: [2.15, -1.2, -5.6, 4.3, 4.3, -18.52][i],
        benchmark: [1.8, -0.5, -3.2, 2.1, 2.1, -10.52][i],
      })
    ),
    wins: [
      { label: "日", value: 48.2, average: 51.1 },
      { label: "周", value: 54.3, average: 52.4 },
      { label: "月", value: 62.1, average: 58.5 },
      { label: "季", value: 71.4, average: 64.2 },
    ],
    quarters: [
      { label: "2026 Q4", value: 0.04, rank: 198, score: 1 },
      { label: "2026 Q3", value: 1.87, rank: 23, score: 4 },
      { label: "2026 Q2", value: -2.32, rank: 102, score: 2 },
    ],
    probabilities: [
      { label: "1个月", chance: 58.4, profit: 1.2, loss: -8.5 },
      { label: "3个月", chance: 65.2, profit: 3.4, loss: -12.1 },
      { label: "6个月", chance: 72.8, profit: 7.8, loss: -15.4 },
      { label: "1年", chance: 85.6, profit: 14.2, loss: -18.5 },
    ],
  });
}
export function formatReturn(n) {
  return `${n > 0 ? "+" : ""}${Number(n).toFixed(2)}%`;
}
