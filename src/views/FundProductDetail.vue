<template>
  <div class="detail-layout">
    <aside>
      <div>⌂　智能定投</div>
      <p>定投工具</p>
      <p>智能遴选池</p>
      <div>⌂　公募基金</div>
      <router-link to="/" class="side-active">基金产品</router-link>
      <p>基金经理</p>
    </aside>
    <main class="detail-main">
      <div class="breadcrumb">
        <router-link to="/">公募基金 / 基金产品</router-link
        ><span>/</span> 产品详情
      </div>
      <div v-if="loading" class="panel loading-detail" role="status">
        正在加载产品分析…
      </div>
      <div v-else-if="error" class="panel error" role="alert">
        {{ error }} <bfe-button @click="load">重试</bfe-button
        ><router-link to="/">返回列表</router-link>
      </div>
      <template v-else-if="product"
        ><section class="panel summary">
          <div class="summary-title">
            <h1>
              {{ product.productName }}<small>{{ product.productCode }}</small>
            </h1>
            <div class="actions">
              <bfe-button @click="following = !following">{{
                following ? "♥ 已关注" : "♡ 关注"
              }}</bfe-button
              ><bfe-button @click="share">♧ 分享</bfe-button>
            </div>
          </div>
          <div class="tags">
            <bfe-tag kind="info">{{ product.investType }}股票型基金</bfe-tag
            ><bfe-tag kind="warning">中高风险</bfe-tag
            ><bfe-tag :kind="product.runStatus">{{ statusName }}</bfe-tag>
          </div>
          <div class="metadata">
            <div>
              <label>基金经理</label><span>{{ product.managers }}</span>
            </div>
            <div>
              <label>基金公司</label><span>{{ product.company }}</span>
            </div>
            <div>
              <label>成立日期</label><span>{{ product.establishDate }}</span>
            </div>
          </div>
        </section>
        <nav class="detail-tabs" aria-label="详情页签">
          <button
            v-for="tab in tabs"
            :key="tab"
            :class="{ active: activeTab === tab }"
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </nav>
        <template v-if="activeTab === '收益分析'"
          ><section class="analysis-panel">
            <h2>产品收益</h2>
            <div class="analysis-body">
              <div class="info-box">
                ⓘ 区间内，产品累计收益为
                <strong :class="returnClass(activePeriod.product)">{{
                  formatReturn(activePeriod.product)
                }}</strong
                >，基准表现为
                <strong>{{ formatReturn(activePeriod.benchmark) }}</strong>
              </div>
              <div class="chart-grid">
                <div>
                  <svg
                    class="line-chart"
                    viewBox="0 0 680 300"
                    role="img"
                    :aria-label="selectedPeriod + '产品与基准收益走势（模拟）'"
                  >
                    <defs>
                      <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0"
                          stop-color="var(--color-data-1)"
                          stop-opacity=".12"
                        />
                        <stop
                          offset="1"
                          stop-color="var(--color-data-1)"
                          stop-opacity="0"
                        />
                      </linearGradient>
                    </defs>
                    <g v-for="(tick, i) in [0, -10, -20, -30, -40]" :key="tick">
                      <text x="4" :y="25 + i * 54">{{ tick }}%</text>
                    </g>
                    <path :d="areaPath" fill="url(#area)" />
                    <path :d="productPath" class="series-product" />
                    <path :d="benchmarkPath" class="series-benchmark" />
                    <path :d="excessPath" class="series-excess" />
                    <text x="55" y="285">2022-07</text>
                    <text x="310" y="285">2023-01</text>
                    <text x="565" y="285">2023-07</text>
                  </svg>
                  <div class="legend">
                    <span class="blue">━ 本产品</span
                    ><span class="orange">━ 比较基准</span
                    ><span class="green">┄ 超额收益</span>
                  </div>
                  <div class="periods">
                    <button
                      v-for="p in product.periods"
                      :key="p.label"
                      :class="{ active: selectedPeriod === p.label }"
                      @click="selectedPeriod = p.label"
                    >
                      {{ p.label }}
                    </button>
                  </div>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>收益区间</th>
                      <th>本产品</th>
                      <th>比较基准</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="p in product.periods" :key="p.label">
                      <td>{{ p.label }}</td>
                      <td :class="returnClass(p.product)">
                        {{ formatReturn(p.product) }}
                      </td>
                      <td :class="returnClass(p.benchmark)">
                        {{ formatReturn(p.benchmark) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
          <section class="analysis-panel">
            <h2>胜率分析</h2>
            <div class="analysis-body chart-grid win-grid">
              <div>
                <div class="bars">
                  <div class="axis-labels">
                    <span>100%</span><span>75%</span><span>50%</span
                    ><span>25%</span><span>0%</span>
                  </div>
                  <div
                    v-for="w in product.wins"
                    :key="w.label"
                    class="bar-group"
                  >
                    <div class="bar-track">
                      <i
                        :style="{ height: w.value + '%' }"
                        :title="w.value + '%'"
                      /><i
                        :style="{ height: w.average + '%' }"
                        :title="w.average + '%'"
                      />
                    </div>
                    <span>{{ w.label }}</span>
                  </div>
                </div>
                <div class="legend">
                  <span class="blue">■ 本产品自然胜率</span
                  ><span class="orange">■ 同类平均</span>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>周期</th>
                    <th>本产品胜率</th>
                    <th>同类平均</th>
                    <th>超额胜率</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="w in product.wins" :key="w.label">
                    <td>{{ w.label }}</td>
                    <td>{{ w.value.toFixed(2) }}%</td>
                    <td>{{ w.average.toFixed(2) }}%</td>
                    <td :class="returnClass(w.value - w.average)">
                      {{ formatReturn(w.value - w.average) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          <section class="analysis-panel">
            <h2>业绩持续性分析</h2>
            <div class="analysis-body">
              <div class="periods compact">
                <button
                  :class="{ active: metric === '涨跌幅' }"
                  @click="metric = '涨跌幅'"
                >
                  涨跌幅</button
                ><button
                  :class="{ active: metric === '夏普比率' }"
                  @click="metric = '夏普比率'"
                >
                  夏普比率
                </button>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>季度</th>
                    <th>本产品</th>
                    <th>同类中位数</th>
                    <th>同类排名</th>
                    <th>四分位排名</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="q in product.quarters" :key="q.label">
                    <td>{{ q.label }}</td>
                    <td :class="returnClass(q.value)">
                      {{
                        metric === "涨跌幅"
                          ? formatReturn(q.value)
                          : (q.value / 3).toFixed(2)
                      }}
                    </td>
                    <td :class="returnClass(q.value)">
                      {{
                        metric === "涨跌幅"
                          ? formatReturn(q.value)
                          : (q.value / 3).toFixed(2)
                      }}
                    </td>
                    <td>
                      {{ q.rank }}/253
                      <meter
                        min="0"
                        max="253"
                        :value="253 - q.rank"
                        :aria-label="q.label + '排名'"
                      />
                    </td>
                    <td>
                      {{
                        q.score === 4 ? "优秀" : q.score === 1 ? "不佳" : "一般"
                      }}
                      <span class="stars"
                        >{{ "★".repeat(q.score)
                        }}<em>{{ "★".repeat(4 - q.score) }}</em></span
                      >
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          <section class="analysis-panel">
            <h2>盈利概率分析</h2>
            <div class="analysis-body chart-grid probability-grid">
              <table>
                <thead>
                  <tr>
                    <th>持有期</th>
                    <th>盈利概率</th>
                    <th>平均收益</th>
                    <th>最大亏损</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="p in product.probabilities" :key="p.label">
                    <td>{{ p.label }}</td>
                    <td>{{ p.chance }}%</td>
                    <td class="positive">{{ formatReturn(p.profit) }}</td>
                    <td class="negative">{{ formatReturn(p.loss) }}</td>
                  </tr>
                </tbody>
              </table>
              <div>
                <div
                  class="probability-row"
                  v-for="p in product.probabilities"
                  :key="p.label"
                >
                  <span>{{ p.label }}</span>
                  <div class="probability-track">
                    <i :style="{ width: 100 - p.chance + '%' }" /><b
                      :style="{ width: p.chance + '%' }"
                    />
                  </div>
                  <span>{{ p.chance }}%</span>
                </div>
                <div class="legend">
                  <span class="positive">■ 盈利占比</span
                  ><span class="negative">■ 亏损占比</span>
                </div>
              </div>
            </div>
          </section></template
        >
        <section v-else class="analysis-panel">
          <h2>{{ activeTab }}</h2>
          <div class="analysis-body" v-if="activeTab === '基本信息'">
            <dl>
              <dt>产品代码</dt>
              <dd>{{ product.productCode }}</dd>
              <dt>基金公司</dt>
              <dd>{{ product.company }}</dd>
              <dt>交易状态</dt>
              <dd>{{ product.tradeStatus.join("、") }}</dd>
              <dt>基金规模</dt>
              <dd>{{ product.scale }} 亿元（模拟）</dd>
            </dl>
          </div>
          <div v-else class="empty-detail">
            此分析模块尚无模拟数据，请切换至收益分析。
          </div>
        </section>
        <p class="detail-disclaimer">
          数据与图表均为模拟演示，不代表真实产品表现。
        </p></template
      ><bfe-message :message="message" />
    </main>
  </div>
</template>
<script>
import { getProductDetail, formatReturn } from "../api/products";
export default {
  data: () => ({
    product: null,
    loading: true,
    error: "",
    following: false,
    message: null,
    activeTab: "收益分析",
    tabs: [
      "基本信息",
      "收益分析",
      "风险分析",
      "基金经理",
      "资产配置",
      "债券分析",
      "特色指标",
      "相关公告",
    ],
    selectedPeriod: "成立以来",
    metric: "涨跌幅",
    requestId: 0,
  }),
  computed: {
    statusName() {
      return { running: "存续中", paused: "暂停中", terminated: "已终止" }[
        this.product.runStatus
      ];
    },
    activePeriod() {
      return this.product.periods.find((p) => p.label === this.selectedPeriod);
    },
    productPath() {
      return this.path(this.activePeriod.product, 1);
    },
    benchmarkPath() {
      return this.path(this.activePeriod.benchmark, 0.6);
    },
    excessPath() {
      return this.path(
        this.activePeriod.product - this.activePeriod.benchmark,
        0.35
      );
    },
    areaPath() {
      return this.productPath + " L630 250 L55 250 Z";
    },
  },
  watch: { "$route.params.code": "load" },
  created() {
    this.load();
  },
  beforeDestroy() {
    this.requestId++;
    clearTimeout(this.timer);
  },
  methods: {
    formatReturn,
    returnClass(n) {
      return n > 0 ? "positive" : n < 0 ? "negative" : "";
    },
    path(end, bend) {
      const points = Array.from({ length: 25 }, (_, i) => {
        const t = i / 24;
        const v = end * t - 24 * bend * Math.sin(t * Math.PI);
        return `${i ? "L" : "M"}${55 + t * 575} ${25 - v * 5}`;
      });
      return points.join(" ");
    },
    async load() {
      const id = ++this.requestId;
      this.loading = true;
      this.error = "";
      try {
        const product = await getProductDetail(this.$route.params.code);
        if (id === this.requestId) this.product = product;
      } catch (e) {
        if (id === this.requestId) this.error = e.message;
      } finally {
        if (id === this.requestId) this.loading = false;
      }
    },
    async share() {
      try {
        await navigator.clipboard.writeText(location.href);
        this.message = { text: "产品链接已复制", kind: "success" };
      } catch {
        this.message = { text: "请复制浏览器地址栏链接分享", kind: "warning" };
      }
      clearTimeout(this.timer);
      this.timer = setTimeout(() => (this.message = null), 3000);
    },
  },
};
</script>
<style lang="less" scoped>
.detail-layout {
  display: flex;
}
aside {
  width: 220px;
  flex-shrink: 0;
  background: var(--color-white);
  min-height: calc(100vh - 46px);
  padding: 16px 8px;
  color: var(--color-text-2);
}
aside > div {
  padding: 6px 12px;
}
aside p,
aside a {
  display: block;
  padding: 12px 42px;
  margin: 4px 0;
  color: var(--color-text-1);
}
aside .side-active {
  background: var(--color-fill-2);
  color: var(--color-brand);
  font-weight: 600;
}
.detail-main {
  min-width: 0;
  flex: 1;
  padding: 0 24px 24px;
}
.summary {
  padding: 24px;
  margin-bottom: 8px;
}
.summary-title {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}
h1 {
  font-size: 20px;
  margin: 0;
  font-weight: 600;
}
h1 small {
  font-size: 14px;
  font-weight: 400;
  background: var(--color-fill-2);
  margin-left: 16px;
  padding: 3px 8px;
  color: var(--color-text-2);
}
.tags {
  display: flex;
  gap: 8px;
  margin: 16px 0 28px;
}
.metadata {
  display: flex;
  gap: 24px;
}
.metadata > div {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-right: 1px solid var(--color-border-2);
  padding-right: 24px;
}
.metadata label {
  color: var(--color-text-3);
}
.detail-tabs {
  background: var(--color-white);
  display: flex;
  padding: 16px 24px;
  margin-bottom: 8px;
  overflow: auto;
  border-radius: 4px;
}
.detail-tabs button {
  white-space: nowrap;
  background: none;
  border: 0;
  border-right: 1px solid var(--color-border-2);
  padding: 0 16px;
  color: var(--color-text-2);
}
.detail-tabs button:first-child {
  padding-left: 0;
}
.detail-tabs .active {
  color: var(--color-brand);
  font-weight: 600;
}
.analysis-panel {
  background: var(--color-white);
  border-radius: 4px;
  margin-bottom: 8px;
}
.analysis-panel h2 {
  font-size: 16px;
  font-weight: 500;
  padding: 20px;
  margin: 0;
  border-bottom: 1px solid var(--color-border-2);
}
.analysis-panel h2:before {
  content: "";
  display: inline-block;
  height: 16px;
  width: 3px;
  background: var(--color-brand);
  margin-right: 12px;
  vertical-align: middle;
  border-radius: 2px;
}
.analysis-body {
  padding: 20px;
}
.info-box {
  border: 1px solid var(--color-border-2);
  padding: 12px 16px;
  margin-bottom: 20px;
  color: var(--color-text-2);
}
.chart-grid {
  display: grid;
  grid-template-columns: 1.65fr 1fr;
  gap: 32px;
  align-items: center;
}
.chart-grid table {
  width: 100%;
  min-width: 0;
}
.chart-grid td,
.chart-grid th {
  text-align: center;
  padding: 12px 8px;
}
.line-chart {
  width: 100%;
  height: auto;
  overflow: visible;
}
.line-chart text {
  font-size: 12px;
  fill: var(--color-text-3);
}
.series-product {
  stroke: var(--color-data-1);
  stroke-width: 2;
  fill: none;
}
.series-benchmark {
  stroke: var(--color-data-5);
  stroke-width: 2;
  fill: none;
}
.series-excess {
  stroke: var(--color-data-7);
  stroke-width: 1.5;
  stroke-dasharray: 3 3;
  fill: none;
}
.legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  font-size: 12px;
  margin: 20px 0;
  color: var(--color-text-2);
}
.periods {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}
.periods button {
  border: 0;
  background: none;
  color: var(--color-text-2);
  padding: 8px 16px;
  border-radius: 20px;
}
.periods button.active {
  background: var(--color-fill-2);
  color: var(--color-brand);
}
.compact {
  justify-content: flex-start;
  margin: 0 0 20px;
}
.win-grid {
  grid-template-columns: 1fr 1fr;
}
.bars {
  height: 230px;
  display: flex;
  justify-content: space-around;
  gap: 16px;
  padding: 20px 10px 0;
}
.axis-labels {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: var(--color-text-3);
  font-size: 12px;
  padding-bottom: 20px;
}
.bar-group {
  flex: 1;
  text-align: center;
  color: var(--color-text-3);
}
.bar-track {
  height: 190px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
}
.bar-track i {
  width: 20px;
  background: var(--color-data-1);
  border-radius: 2px 2px 0 0;
}
.bar-track i + i {
  background: var(--color-data-5);
}
meter {
  margin-left: 20px;
  width: 120px;
}
.stars {
  color: var(--color-data-5);
  font-size: 22px;
  margin-left: 20px;
}
.stars em {
  color: var(--color-fill-3);
  font-style: normal;
}
.probability-grid {
  grid-template-columns: 1fr 1fr;
}
.probability-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 12px 0;
}
.probability-track {
  display: flex;
  gap: 5px;
  width: 220px;
}
.probability-track i {
  background: var(--color-success-text);
  height: 20px;
  border-radius: 2px;
}
.probability-track b {
  background: var(--color-red-6);
  height: 20px;
  border-radius: 2px;
}
.empty-detail,
.loading-detail {
  padding: 60px;
  text-align: center;
  color: var(--color-text-3);
}
.detail-disclaimer {
  color: var(--color-text-3);
  font-size: 12px;
  text-align: center;
}
dl {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 20px;
}
dd {
  margin: 0;
}
.blue {
  color: var(--color-data-1);
}
.orange {
  color: var(--color-data-5);
}
.green {
  color: var(--color-data-7);
}
@media (max-width: 1100px) {
  aside {
    display: none;
  }
  .chart-grid {
    grid-template-columns: 1fr;
  }
  .summary-title {
    flex-direction: column;
  }
  .periods {
    flex-wrap: wrap;
  }
}
@media (max-width: 576px) {
  .detail-main {
    padding: 0 12px;
  }
  .metadata {
    flex-wrap: wrap;
  }
  .detail-tabs {
    padding: 16px 8px;
  }
  h1 small {
    display: inline-block;
    margin: 8px 0;
  }
  .analysis-body {
    overflow: auto;
  }
}
</style>
