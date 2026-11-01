<template>
  <div class="return-page">
    <aside class="return-page__sidebar">
      <bfe-menu v-model="activeMenu" :items="menuList" />
    </aside>
    <main class="return-page__main">
      <nav class="breadcrumb" aria-label="面包屑">
        <router-link to="/">基金产品</router-link><span>/</span
        ><span class="return-page__crumb">产品详情</span><span>/</span
        ><span class="return-page__duration">{{
          baseInfo ? baseInfo.duration : "存续期"
        }}</span>
      </nav>
      <section class="return-page__summary">
        <bfe-spin :spinning="baseLoading" label="正在加载产品信息…">
          <div v-if="baseError" class="return-page__error" role="alert">
            {{ baseError
            }}<bfe-button @click="loadBase">重试产品信息</bfe-button>
          </div>
          <template v-else-if="baseInfo">
            <div class="return-page__title-row">
              <div>
                <h1>
                  {{ baseInfo.productName }}
                  <bfe-tag>{{ baseInfo.productCode }}</bfe-tag>
                </h1>
                <div class="return-page__tags">
                  <bfe-tag kind="info">{{ baseInfo.productType }}</bfe-tag
                  ><bfe-tag
                    :kind="baseInfo.riskLevel === '低风险' ? 'info' : 'danger'"
                    >{{ baseInfo.riskLevel }}</bfe-tag
                  ><bfe-tag>{{ baseInfo.duration }}</bfe-tag>
                </div>
              </div>
              <div class="actions">
                <bfe-button @click="following = !following">{{
                  following ? "♥ 已关注" : "♡ 关注"
                }}</bfe-button
                ><bfe-button @click="share">↗ 分享</bfe-button>
              </div>
            </div>
            <dl class="return-page__metadata">
              <div>
                <dt>基金经理</dt>
                <dd>{{ baseInfo.managers }}</dd>
              </div>
              <div>
                <dt>基金公司</dt>
                <dd>{{ baseInfo.company }}</dd>
              </div>
              <div>
                <dt>成立日期 - 到期日期</dt>
                <dd class="number">
                  {{ baseInfo.establishDate }} ~
                  {{ baseInfo.expireDate || "无固定到期日" }}
                </dd>
              </div>
            </dl>
          </template>
        </bfe-spin>
      </section>
      <bfe-tabs
        class="return-page__primary-tabs"
        id="product-tabs"
        :value="activeTab"
        :items="tabList"
        label="产品功能"
        @input="navigateTab"
      />
      <bfe-tab-pane
        id="product-tabs-panel"
        :labelledby="'product-tabs-' + activeTab"
      >
        <section v-if="activeTab !== 'return'" class="return-page__section">
          <h2>{{ activeTabLabel }}</h2>
          <p class="return-page__placeholder">
            该模块暂未接入数据。<router-link
              :to="'/fund/product/' + code + '/return'"
              >返回收益分析</router-link
            >
          </p>
        </section>
        <template v-else>
          <section class="return-page__section">
            <h2>收益分析<span class="return-page__subtitle">收益表现</span></h2>
            <div class="return-page__content">
              <bfe-tabs
                id="period-tabs"
                :value="activePeriod"
                :items="periodList"
                label="收益周期"
                variant="pill"
                @input="changePeriod"
              />
              <div v-if="analysisError" class="return-page__error" role="alert">
                {{ analysisError
                }}<bfe-button @click="retryAnalysis">重试收益数据</bfe-button>
              </div>
              <bfe-tab-pane
                id="period-tabs-panel"
                :labelledby="'period-tabs-' + activePeriod"
              >
                <bfe-table :loading="analysisLoading">
                  <table aria-label="收益表现数据">
                    <thead>
                      <tr>
                        <th scope="col">收益指标</th>
                        <th scope="col">本产品</th>
                        <th scope="col">同类中位数</th>
                        <th scope="col">四分位排名</th>
                        <th scope="col">同类排名</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="row in rows" :key="row.metric">
                        <th scope="row">{{ row.metric }}</th>
                        <td :class="['number', returnClass(row.myProduct)]">
                          {{ formatPercent(row.myProduct) }}
                        </td>
                        <td :class="['number', returnClass(row.median)]">
                          {{ formatPercent(row.median) }}
                        </td>
                        <td>
                          <bfe-tag :kind="quartileKind(row.quartile)">{{
                            row.quartile
                          }}</bfe-tag>
                        </td>
                        <td
                          :class="[
                            'number',
                            {
                              'return-page__leading': isLeadingRank(
                                row.peerRank
                              ),
                            },
                          ]"
                        >
                          {{ row.peerRank
                          }}<span
                            v-if="isLeadingRank(row.peerRank)"
                            class="return-page__rank-caption"
                            >前25%</span
                          >
                        </td>
                      </tr>
                      <tr v-if="!rows.length">
                        <td colspan="5" class="return-page__empty">
                          {{
                            analysisLoading
                              ? "正在查询收益表现…"
                              : analysisError
                              ? "收益数据加载失败"
                              : "暂无数据"
                          }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </bfe-table>
              </bfe-tab-pane>
              <p class="return-page__data-note">
                {{ activePeriodLabel }}区间汇总 · 收益率按百分比展示，--
                表示数据缺失。滚动收益及现金比较为模拟指标。
              </p>
            </div>
          </section>
          <template
            v-if="analysis && rows.length && !analysisLoading && !analysisError"
          >
            <section class="return-page__section">
              <h2>产品收益</h2>
              <div class="return-page__content">
                <div class="return-page__info">
                  ⓘ {{ activePeriodLabel }}，产品累计收益为
                  <strong :class="returnClass(rows[0].myProduct)">{{
                    formatPercent(rows[0].myProduct)
                  }}</strong
                  >，同类中位数为
                  <strong>{{ formatPercent(rows[0].median) }}</strong>
                </div>
                <div class="return-page__chart-grid">
                  <div>
                    <svg
                      class="return-page__line-chart"
                      viewBox="0 0 680 290"
                      role="img"
                      :aria-label="activePeriodLabel + '产品收益走势（模拟）'"
                    >
                      <defs>
                        <linearGradient
                          id="return-area"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
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
                      <g v-for="tick in chartTicks" :key="tick.value">
                        <text x="4" :y="tick.y + 4">
                          {{ tick.value.toFixed(1) }}%
                        </text>
                        <line x1="58" x2="650" :y1="tick.y" :y2="tick.y" />
                      </g>
                      <path :d="areaPath" fill="url(#return-area)" />
                      <path
                        :d="productPath"
                        class="return-page__product-line"
                      />
                      <path
                        :d="benchmarkPath"
                        class="return-page__benchmark-line"
                      />
                      <text
                        v-for="(label, index) in dateLabels"
                        :key="label"
                        :x="58 + index * 245"
                        y="278"
                      >
                        {{ label }}
                      </text>
                    </svg>
                    <div class="return-page__legend">
                      <span class="return-page__blue">━ 本产品</span
                      ><span class="return-page__orange">━ 同类中位数</span>
                    </div>
                  </div>
                  <div class="return-page__return-card">
                    <span>{{ activePeriodLabel }}累计收益</span
                    ><strong :class="returnClass(rows[0].myProduct)">{{
                      formatPercent(rows[0].myProduct)
                    }}</strong>
                    <dl>
                      <dt>同类中位数</dt>
                      <dd :class="returnClass(rows[0].median)">
                        {{ formatPercent(rows[0].median) }}
                      </dd>
                      <dt>同类排名</dt>
                      <dd>{{ rows[0].peerRank }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </section>
            <section class="return-page__section">
              <h2>胜率分析</h2>
              <div class="return-page__content return-page__chart-grid">
                <div>
                  <div
                    class="return-page__bars"
                    role="img"
                    aria-label="本产品与同类平均胜率对比，数值见右侧表格"
                  >
                    <div class="return-page__axis">
                      <span>100%</span><span>75%</span><span>50%</span
                      ><span>25%</span><span>0%</span>
                    </div>
                    <div
                      v-for="win in analysis.wins"
                      :key="win.label"
                      class="return-page__bar-group"
                    >
                      <div class="return-page__bar-track">
                        <i :style="{ height: win.value + '%' }" /><i
                          :style="{ height: win.average + '%' }"
                        />
                      </div>
                      <span>{{ win.label }}</span>
                    </div>
                  </div>
                  <div class="return-page__legend">
                    <span class="return-page__blue">■ 本产品自然胜率</span
                    ><span class="return-page__orange">■ 同类平均</span>
                  </div>
                </div>
                <div class="return-page__table-scroll">
                  <table aria-label="胜率分析">
                    <thead>
                      <tr>
                        <th>周期</th>
                        <th>本产品胜率</th>
                        <th>同类平均</th>
                        <th>超额胜率</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="win in analysis.wins" :key="win.label">
                        <td>{{ win.label }}</td>
                        <td class="number">{{ win.value.toFixed(2) }}%</td>
                        <td class="number">{{ win.average.toFixed(2) }}%</td>
                        <td
                          :class="[
                            'number',
                            returnClass(win.value - win.average),
                          ]"
                        >
                          {{ formatPercent(win.value - win.average) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
            <section class="return-page__section">
              <h2>业绩持续性分析</h2>
              <div class="return-page__content">
                <div class="return-page__table-scroll">
                  <table aria-label="业绩持续性分析">
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
                      <tr
                        v-for="quarter in analysis.quarters"
                        :key="quarter.label"
                      >
                        <td>{{ quarter.label }}</td>
                        <td :class="returnClass(quarter.value)">
                          {{ formatPercent(quarter.value) }}
                        </td>
                        <td :class="returnClass(quarter.median)">
                          {{ formatPercent(quarter.median) }}
                        </td>
                        <td>
                          {{ quarter.rank }}/253
                          <progress
                            :value="253 - quarter.rank"
                            max="253"
                            :aria-label="quarter.label + '排名'"
                          />
                        </td>
                        <td>
                          <span
                            class="return-page__stars"
                            :aria-label="quarter.score + '星'"
                            >{{ "★".repeat(quarter.score)
                            }}<em>{{ "★".repeat(4 - quarter.score) }}</em></span
                          >
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
            <section class="return-page__section">
              <h2>盈利概率分析</h2>
              <div class="return-page__content return-page__chart-grid">
                <div class="return-page__table-scroll">
                  <table aria-label="盈利概率分析">
                    <thead>
                      <tr>
                        <th>持有期</th>
                        <th>盈利概率</th>
                        <th>平均收益</th>
                        <th>最大亏损</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="p in analysis.probabilities" :key="p.label">
                        <td>{{ p.label }}</td>
                        <td>{{ p.chance }}%</td>
                        <td :class="returnClass(p.profit)">
                          {{ formatPercent(p.profit) }}
                        </td>
                        <td :class="returnClass(p.loss)">
                          {{ formatPercent(p.loss) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <div
                    class="return-page__probability"
                    v-for="p in analysis.probabilities"
                    :key="p.label"
                  >
                    <span>{{ p.label }}</span>
                    <div class="return-page__probability-track">
                      <i :style="{ width: 100 - p.chance + '%' }" /><b
                        :style="{ width: p.chance + '%' }"
                      />
                    </div>
                    <span>{{ p.chance }}%</span>
                  </div>
                  <div class="return-page__legend">
                    <span class="positive">■ 盈利占比</span
                    ><span class="negative">■ 亏损占比</span>
                  </div>
                </div>
              </div>
            </section>
          </template>
          <details class="return-page__diagnostics">
            <summary>模拟接口演示</summary>
            <div class="actions">
              <bfe-button @click="loadAnalysis('empty')">模拟空数据</bfe-button
              ><bfe-button @click="loadAnalysis('error')"
                >模拟收益异常</bfe-button
              ><bfe-button @click="loadBase(true)">模拟头部异常</bfe-button
              ><bfe-button @click="loadAnalysis()">恢复收益数据</bfe-button>
            </div>
          </details>
        </template>
      </bfe-tab-pane>
      <p class="return-page__disclaimer">
        本页产品数据和图表均由本地模拟接口提供，不代表真实基金表现。
      </p>
      <bfe-message :message="message" />
    </main>
  </div>
</template>
<script>
import BfeTabs from "../components/BfeTabs.vue";
import BfeMenu from "../components/BfeMenu.vue";
import BfeSpin from "../components/BfeSpin.vue";
import {
  getProductBaseInfo,
  getReturnAnalysis,
  periodList,
  formatPercent,
  isLeadingRank,
  validateAnalysis,
} from "../api/returnAnalysis";
export default {
  name: "ProductDetailReturn",
  components: {
    BfeTabs,
    BfeMenu,
    BfeSpin,
    BfeTabPane: {
      props: ["id", "labelledby"],
      template:
        '<div :id="id" role="tabpanel" :aria-labelledby="labelledby" tabindex="0"><slot/></div>',
    },
  },
  data: () => ({
    menuList: [
      {
        key: "investment",
        label: "智能定投",
        children: [
          { key: "tools", label: "定投工具" },
          { key: "pool", label: "智能遴选池" },
        ],
      },
      {
        key: "funds",
        label: "公募基金",
        children: [
          { key: "fundProduct", label: "基金产品" },
          { key: "fundManager", label: "基金经理" },
        ],
      },
    ],
    activeMenu: "fundProduct",
    tabList: [
      { key: "base-info", label: "基本信息" },
      { key: "return", label: "收益分析" },
      { key: "risk", label: "风险分析" },
      { key: "manager", label: "基金经理" },
      { key: "allocation", label: "资产配置" },
      { key: "bonds", label: "债券分析" },
      { key: "indicators", label: "特色指标" },
      { key: "announcements", label: "相关公告" },
    ],
    periodList,
    activePeriod: "week",
    baseInfo: null,
    analysis: null,
    baseLoading: false,
    analysisLoading: false,
    baseError: "",
    analysisError: "",
    following: false,
    message: null,
    baseRequest: 0,
    analysisRequest: 0,
  }),
  computed: {
    code() {
      return this.$route.params.code;
    },
    activeTab() {
      return this.$route.params.section || "return";
    },
    activeTabLabel() {
      return (
        this.tabList.find((t) => t.key === this.activeTab)?.label || "未知模块"
      );
    },
    activePeriodLabel() {
      return this.periodList.find((p) => p.key === this.activePeriod).label;
    },
    rows() {
      return this.analysis?.rows || [];
    },
    chartRange() {
      const values = (this.analysis?.series || []).flatMap((p) => [
        p.product,
        p.benchmark,
        0,
      ]);
      const min = Math.min(...values),
        max = Math.max(...values);
      const padding = Math.max((max - min) * 0.15, 0.5);
      return { min: min - padding, max: max + padding };
    },
    chartTicks() {
      const { min, max } = this.chartRange;
      return Array.from({ length: 5 }, (_, i) => ({
        value: max - ((max - min) * i) / 4,
        y: 22 + i * 54,
      }));
    },
    productPath() {
      return this.makePath("product");
    },
    benchmarkPath() {
      return this.makePath("benchmark");
    },
    areaPath() {
      return this.productPath + " L650 238 L58 238 Z";
    },
    dateLabels() {
      const points = this.analysis?.series || [];
      return points.length
        ? [
            points[0].date,
            points[Math.floor(points.length / 2)].date,
            points[points.length - 1].date,
          ]
        : [];
    },
  },
  watch: {
    code() {
      this.initialize();
    },
    activeTab(value) {
      if (value === "return" && !this.analysis && !this.analysisLoading)
        this.loadAnalysis();
    },
  },
  created() {
    this.initialize();
  },
  beforeDestroy() {
    this.baseRequest++;
    this.analysisRequest++;
    clearTimeout(this.messageTimer);
  },
  methods: {
    formatPercent,
    isLeadingRank,
    returnClass(n) {
      return typeof n === "number" && Number.isFinite(n)
        ? n > 0
          ? "positive"
          : n < 0
          ? "negative"
          : ""
        : "";
    },
    quartileKind(q) {
      return { 优秀: "success", 良好: "info", 一般: "neutral", 不佳: "danger" }[
        q
      ];
    },
    notify(text, kind = "error") {
      this.message = { text, kind };
      clearTimeout(this.messageTimer);
      this.messageTimer = setTimeout(() => (this.message = null), 3500);
    },
    // 基础信息和收益独立请求、独立错误与独立加载态，任何一方失败不遮挡另一方。
    initialize() {
      this.message = null;
      clearTimeout(this.messageTimer);
      this.activePeriod = "week";
      this.baseInfo = null;
      this.analysis = null;
      this.following = false;
      this.analysisRequest++;
      this.analysisLoading = false;
      this.analysisError = "";
      this.loadBase();
      if (this.activeTab === "return") this.loadAnalysis();
    },
    async loadBase(fail = false) {
      const request = ++this.baseRequest;
      this.baseLoading = true;
      this.baseError = "";
      try {
        const info = await getProductBaseInfo(this.code, {
          fail: fail === true,
        });
        if (request === this.baseRequest) this.baseInfo = info;
      } catch (e) {
        if (request === this.baseRequest) {
          this.baseError = e.message;
          this.notify(e.message);
        }
      } finally {
        if (request === this.baseRequest) this.baseLoading = false;
      }
    },
    // 请求序号防止快速切换周期或切换产品时，旧响应覆盖最新选择。
    async loadAnalysis(scenario = "normal") {
      const request = ++this.analysisRequest;
      const period = this.activePeriod;
      this.analysisLoading = true;
      this.analysisError = "";
      this.analysis = null;
      try {
        const response = await getReturnAnalysis(this.code, period, {
          scenario,
        });
        validateAnalysis(response, period);
        if (request === this.analysisRequest) this.analysis = response;
      } catch (e) {
        if (request === this.analysisRequest) {
          this.analysisError = e.message;
          this.notify(e.message);
        }
      } finally {
        if (request === this.analysisRequest) this.analysisLoading = false;
      }
    },
    retryAnalysis() {
      this.loadAnalysis();
    },
    changePeriod(period) {
      if (!this.periodList.some((p) => p.key === period)) {
        this.notify("收益周期参数无效");
        return;
      }
      if (period === this.activePeriod) return;
      this.activePeriod = period;
      this.loadAnalysis();
    },
    navigateTab(tab) {
      if (!this.tabList.some((t) => t.key === tab)) return;
      const path = "/fund/product/" + this.code + "/" + tab;
      if (this.$route.path !== path) this.$router.push(path);
    },
    makePath(field) {
      const points = this.analysis?.series || [];
      const { min, max } = this.chartRange;
      return points
        .map(
          (p, i) =>
            `${i ? "L" : "M"}${
              58 + (i / Math.max(points.length - 1, 1)) * 592
            } ${22 + ((max - p[field]) / (max - min)) * 216}`
        )
        .join(" ");
    },
    async share() {
      try {
        await navigator.clipboard.writeText(location.href);
        this.notify("产品链接已复制", "success");
      } catch {
        this.notify("请复制浏览器地址栏链接分享", "warning");
      }
    },
  },
};
</script>
<style lang="less" scoped>
.return-page {
  display: flex;
  min-height: calc(100vh - 46px);
}
.return-page__sidebar {
  flex: 0 0 220px;
  background: var(--color-white);
}
.return-page__main {
  flex: 1;
  min-width: 0;
  padding: 0 24px 24px;
}
.breadcrumb a {
  color: var(--color-brand);
  font-weight: 500;
}
.breadcrumb .return-page__crumb {
  color: var(--color-text-3);
}
.breadcrumb .return-page__duration {
  color: var(--color-text-2);
}
.return-page__summary {
  background: var(--color-white);
  padding: 24px;
  border-radius: 4px;
  margin-bottom: 8px;
  min-height: 184px;
}
.return-page__title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
h1 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 16px;
}
.return-page__tags {
  display: flex;
  gap: 8px;
  margin-top: 14px;
  flex-wrap: wrap;
}
.return-page__metadata {
  display: flex;
  gap: 24px;
  margin: 28px 0 0;
}
.return-page__metadata > div {
  border-right: 1px solid var(--color-border-2);
  padding-right: 24px;
}
.return-page__metadata > div:last-child {
  border: 0;
}
.return-page__metadata dt {
  color: var(--color-text-3);
  margin-bottom: 8px;
}
.return-page__metadata dd {
  margin: 0;
}
.return-page__primary-tabs {
  padding: 0 8px;
  background: var(--color-white);
  border-radius: 4px;
  margin-bottom: 8px;
}
.return-page__section {
  background: var(--color-white);
  border-radius: 4px;
  margin-bottom: 8px;
}
.return-page__section h2 {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  padding: 20px;
  border-bottom: 1px solid var(--color-border-2);
}
.return-page__section h2:before {
  content: "";
  display: inline-block;
  width: 3px;
  height: 16px;
  background: var(--color-brand);
  border-radius: 2px;
  margin-right: 12px;
  vertical-align: middle;
}
.return-page__subtitle {
  font-size: 12px;
  color: var(--color-text-3);
  margin-left: 12px;
}
.return-page__content {
  padding: 20px;
}
.return-page__content > .bfe-tabs {
  margin-bottom: 20px;
}
table {
  width: 100%;
}
tbody th {
  background: transparent;
  font-weight: 400;
}
th,
td {
  height: 52px;
  padding: 9px 16px;
}
.return-page__leading {
  color: var(--color-brand);
  font-weight: 600;
}
.return-page__rank-caption {
  font: 12px var(--font-cn);
  font-weight: 400;
  color: var(--color-text-3);
  margin-left: 12px;
}
.return-page__empty {
  text-align: center;
  height: 160px;
  color: var(--color-text-3);
}
.return-page__data-note {
  font-size: 12px;
  color: var(--color-text-3);
  margin: 16px 0 0;
}
.return-page__error {
  padding: 16px;
  border: 1px solid var(--color-danger-text);
  background: var(--color-danger-bg);
  color: var(--color-danger-text);
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}
.return-page__chart-grid {
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 32px;
  align-items: center;
}
.return-page__info {
  border: 1px solid var(--color-border-2);
  padding: 12px 16px;
  margin-bottom: 20px;
  color: var(--color-text-2);
}
.return-page__line-chart {
  width: 100%;
  height: auto;
}
.return-page__line-chart text {
  fill: var(--color-text-3);
  font: 12px var(--font-en);
}
.return-page__line-chart line {
  stroke: var(--color-border-2);
  stroke-dasharray: 3 3;
}
.return-page__product-line {
  stroke: var(--color-data-1);
  fill: none;
  stroke-width: 2;
}
.return-page__benchmark-line {
  stroke: var(--color-data-5);
  fill: none;
  stroke-width: 2;
}
.return-page__legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  font-size: 12px;
  margin: 20px 0;
  color: var(--color-text-2);
}
.return-page__blue {
  color: var(--color-data-1);
}
.return-page__orange {
  color: var(--color-data-5);
}
.return-page__return-card {
  padding: 32px;
  background: var(--color-fill-1);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.return-page__return-card > span {
  color: var(--color-text-2);
}
.return-page__return-card > strong {
  font: 36px var(--font-en);
}
.return-page__return-card dl {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.return-page__return-card dd {
  margin: 0;
  text-align: right;
}
.return-page__bars {
  height: 230px;
  display: flex;
  justify-content: space-around;
  gap: 16px;
  padding: 20px 10px 0;
}
.return-page__axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 20px;
  font-size: 12px;
  color: var(--color-text-3);
}
.return-page__bar-group {
  flex: 1;
  text-align: center;
  color: var(--color-text-3);
}
.return-page__bar-track {
  height: 190px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 8px;
}
.return-page__bar-track i {
  width: 20px;
  background: var(--color-data-1);
  border-radius: 2px 2px 0 0;
}
.return-page__bar-track i + i {
  background: var(--color-data-5);
}
.return-page__table-scroll {
  overflow-x: auto;
}
progress {
  width: 100px;
  height: 8px;
  accent-color: var(--color-success-text);
  margin-left: 16px;
}
.return-page__stars {
  color: var(--color-data-5);
  font-size: 22px;
}
.return-page__stars em {
  font-style: normal;
  color: var(--color-fill-3);
}
.return-page__probability {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
  font-family: var(--font-en);
}
.return-page__probability-track {
  display: flex;
  gap: 5px;
  width: 200px;
}
.return-page__probability-track i {
  height: 20px;
  background: var(--color-success-text);
  border-radius: 2px;
}
.return-page__probability-track b {
  height: 20px;
  background: var(--color-red-6);
  border-radius: 2px;
}
.return-page__diagnostics {
  color: var(--color-text-3);
  font-size: 12px;
  padding: 16px 20px;
  background: var(--color-white);
  border-radius: 4px;
}
.return-page__diagnostics summary {
  cursor: pointer;
}
.return-page__diagnostics .actions {
  padding-top: 16px;
  flex-wrap: wrap;
}
.return-page__disclaimer {
  text-align: center;
  font-size: 12px;
  color: var(--color-text-3);
  margin: 20px 0 0;
}
.return-page__placeholder {
  padding: 48px;
  text-align: center;
  color: var(--color-text-3);
}
@media (max-width: 1199px) {
  .return-page__chart-grid {
    grid-template-columns: 1fr;
  }
  .return-page__metadata {
    flex-wrap: wrap;
  }
}
@media (max-width: 991px) {
  .return-page__sidebar {
    flex-basis: 180px;
  }
  .return-page__title-row {
    flex-direction: column;
  }
  .return-page__main {
    padding: 0 16px 16px;
  }
}
@media (max-width: 767px) {
  .return-page__sidebar {
    display: none;
  }
}
@media (max-width: 575px) {
  .return-page__main {
    padding: 0 12px 12px;
  }
  .return-page__summary {
    padding: 20px;
  }
  .return-page__metadata {
    flex-direction: column;
    gap: 16px;
  }
  .return-page__metadata > div {
    border: 0;
    padding: 0;
  }
  .return-page__content {
    padding: 16px;
  }
  h1 {
    flex-wrap: wrap;
  }
  .return-page__probability-track {
    width: 150px;
  }
  .return-page__error {
    flex-wrap: wrap;
  }
  .return-page__rank-caption {
    display: none;
  }
}
</style>
