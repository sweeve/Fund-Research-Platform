import { products } from "./products.js";

// 统一周期枚举，页面与服务共用，避免显示名称和请求参数错配。
export const periodList = [
  { key: "week", label: "近一周" },
  { key: "month", label: "近一月" },
  { key: "quarter", label: "近三月" },
  { key: "halfYear", label: "近六月" },
  { key: "year", label: "近一年" },
  { key: "since", label: "成立以来" },
];
const productTypes = {
  QDII: "国际(QDII)股票型基金",
  股票型: "股票型基金",
  混合型: "混合型基金",
  债券型: "债券型基金",
  货币型: "货币市场基金",
};
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function validateProduct(code) {
  if (!/^\d{6}$/.test(code || "")) throw new Error("基金代码必须为6位数字");
  const product = products.find((p) => p.productCode === code);
  if (!product) throw new Error("产品不存在，请返回列表选择有效产品");
  return product;
}
// 诊断参数仅供模拟服务与测试使用，不影响真实业务筛选。
export async function getProductBaseInfo(code, { fail = false } = {}) {
  const product = validateProduct(code);
  await wait(500);
  if (fail) throw new Error("产品信息加载失败，请重试");
  return {
    ...product,
    productType: productTypes[product.investType],
    riskLevel: product.investType === "货币型" ? "低风险" : "中高风险",
    duration: { running: "存续期", paused: "暂停中", terminated: "已终止" }[
      product.runStatus
    ],
    expireDate: null,
  };
}
export function formatPercent(value) {
  // null / 空字符串 / 非有限数值均不是0，不能被Number()误渲染为零收益。
  if (typeof value !== "number" || !Number.isFinite(value)) return "--";
  const n = Math.round((value + Number.EPSILON) * 100) / 100;
  return `${n > 0 ? "+" : ""}${Object.is(n, -0) ? "0.00" : n.toFixed(2)}%`;
}
export function isLeadingRank(rank) {
  const match = /^(\d+)\/(\d+)$/.exec(rank || "");
  return (
    !!match &&
    +match[1] > 0 &&
    +match[2] > 0 &&
    +match[1] <= +match[2] &&
    +match[1] / +match[2] <= 0.25
  );
}
export function validateAnalysis(data, period) {
  if (!data || data.period !== period || !Array.isArray(data.rows))
    throw new Error("收益接口返回结构异常");
  for (const row of data.rows) {
    if (!row.metric || !["优秀", "良好", "一般", "不佳"].includes(row.quartile))
      throw new Error("收益指标或四分位排名无效");
    if (
      [row.myProduct, row.median].some(
        (n) => n !== null && (typeof n !== "number" || !Number.isFinite(n))
      )
    )
      throw new Error("收益率必须是有效数字或空值");
    const match = /^(\d+)\/(\d+)$/.exec(row.peerRank || "");
    if (!match || +match[1] < 1 || +match[1] > +match[2])
      throw new Error("同类排名超出有效范围");
  }
  return data;
}
export async function getReturnAnalysis(
  code,
  period,
  { scenario = "normal", latency = 500 } = {}
) {
  const product = validateProduct(code);
  const index = periodList.findIndex((p) => p.key === period);
  if (index < 0) throw new Error("收益周期参数无效");
  if (!["normal", "empty", "error"].includes(scenario))
    throw new Error("模拟场景无效");
  await wait(latency);
  if (scenario === "error") throw new Error("收益数据加载失败，请重试");
  if (scenario === "empty")
    return {
      period,
      rows: [],
      series: [],
      wins: [],
      quarters: [],
      probabilities: [],
    };
  const magnitude =
    [2.15, 3.2, 5.6, 8.3, 14.2, 18.52][index] + (Number(code) % 3) * 0.15;
  const actual = +(magnitude * (index % 2 ? -1 : 1)).toFixed(2);
  const median = +(actual * 0.72).toFixed(2);
  const ranks = [23, 102, 150, 230].map((n) => Math.min(253, n + index));
  const rows = [
    {
      metric: `${periodList[index].label}收益率`,
      myProduct: actual,
      median,
      quartile: "优秀",
      peerRank: `${ranks[0]}/253`,
    },
    {
      metric: "区间最佳滚动收益",
      myProduct: +magnitude.toFixed(2),
      median: +(magnitude * 0.65).toFixed(2),
      quartile: "良好",
      peerRank: `${ranks[1]}/253`,
    },
    {
      metric: "区间最差滚动收益",
      myProduct: -magnitude,
      median: -+(magnitude * 0.8).toFixed(2),
      quartile: "不佳",
      peerRank: `${ranks[3]}/253`,
    },
    {
      metric: "现金比较收益",
      myProduct: 0,
      median: null,
      quartile: "一般",
      peerRank: `${ranks[2]}/253`,
    },
  ];
  const end = new Date("2026-11-02T00:00:00Z");
  const days = [7, 30, 90, 180, 365, 365 * product.age][index];
  const series = Array.from({ length: 25 }, (_, n) => {
    const t = n / 24;
    return {
      date: new Date(+end - days * 86400000 * (1 - t))
        .toISOString()
        .slice(0, 10),
      product: +(actual * t - magnitude * 0.7 * Math.sin(t * Math.PI)).toFixed(
        2
      ),
      benchmark: +(
        median * t -
        magnitude * 0.3 * Math.sin(t * Math.PI)
      ).toFixed(2),
    };
  });
  return validateAnalysis(
    {
      period,
      rows,
      series,
      wins: ["日", "周", "月", "季"].map((label, n) => ({
        label,
        value: +(48.2 + n * 7.7 + index).toFixed(2),
        average: +(51.1 + n * 4.3).toFixed(2),
      })),
      quarters: [0, 1, 2].map((n) => ({
        label: `2026 Q${4 - n}`,
        value: +(actual / (n + 2)).toFixed(2),
        median: +(median / (n + 2)).toFixed(2),
        rank: ranks[n],
        score: [4, 3, 2][n],
      })),
      probabilities: ["1个月", "3个月", "6个月", "1年"].map((label, n) => ({
        label,
        chance: +(58.4 + n * 8 + index * 0.4).toFixed(1),
        profit: +((magnitude * (n + 1)) / 3).toFixed(2),
        loss: -(magnitude * (n + 1)),
      })),
    },
    period
  );
}
