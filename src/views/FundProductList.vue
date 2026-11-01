<template>
  <main class="list-page">
    <div class="breadcrumb">
      公募基金 <span>/</span> <strong>基金产品</strong>
    </div>
    <section class="panel">
      <div class="page-heading">
        <div>
          <h1>基金产品列表</h1>
          <p>多维筛选，洞察产品投资价值</p>
        </div>
        <span class="mock-badge">模拟数据 · 非投资建议</span>
      </div>
      <div class="status-tabs" role="tablist" aria-label="运行状态">
        <button
          v-for="s in statuses"
          :key="s.value"
          role="tab"
          :aria-selected="searchForm.runStatus === s.value"
          :class="[s.value, { active: searchForm.runStatus === s.value }]"
          @click="setStatus(s.value)"
        >
          {{ s.label }}
        </button>
      </div>
      <bfe-form @submit="search"
        ><div class="form-grid">
          <bfe-form-item label="关键字"
            ><bfe-input
              v-model="searchForm.keyword"
              maxlength="100"
              placeholder="请输入基金代码/基金名称/基金经理等"
              aria-label="关键字"
              @enter="search" /></bfe-form-item
          ><bfe-form-item
            v-for="group in groups"
            :key="group.key"
            :label="group.label"
            ><details class="multi-select">
              <summary>
                {{
                  searchForm[group.key].length
                    ? "已选择 " + searchForm[group.key].length + " 项"
                    : "请选择"
                }}
              </summary>
              <div class="multi-options">
                <label v-for="option in options[group.key]" :key="option"
                  ><input
                    v-model="searchForm[group.key]"
                    type="checkbox"
                    :value="option"
                    @change="search"
                  />{{ option }}</label
                >
              </div>
            </details></bfe-form-item
          >
        </div>
        <div class="selected-conditions" v-if="selectedConditions.length">
          <span>已选条件</span
          ><bfe-tag
            v-for="c in selectedConditions"
            :key="c.key + c.value"
            closable
            @close="removeCondition(c)"
            >{{ c.value }}</bfe-tag
          >
        </div>
        <div class="form-bottom">
          <span class="hint">支持基金代码、名称及基金经理模糊搜索</span>
          <div class="actions">
            <bfe-button type="submit" kind="primary" :loading="loading"
              >⌕ 查询</bfe-button
            ><bfe-button type="button" @click="reset">＋ 重置</bfe-button>
          </div>
        </div>
        <p v-if="validation" class="error" role="alert">
          {{ validation }}
        </p></bfe-form
      >
      <div class="toolbar">
        <h2>
          产品列表 <small>{{ total }} 个产品</small>
        </h2>
        <div class="actions">
          <span class="hint" v-if="selectedIds.length"
            >已选 {{ selectedIds.length }} 项</span
          ><bfe-button :loading="exporting" @click="exportData(false)"
            >导出全部</bfe-button
          ><bfe-button
            kind="outline"
            :loading="exporting"
            @click="exportData(false)"
            >导出</bfe-button
          ><bfe-button
            :disabled="!selectedIds.length"
            :loading="exporting"
            @click="exportData(true)"
            >导出选中数据</bfe-button
          ><bfe-button
            kind="primary"
            :loading="poolLoading"
            @click="addSelected"
            >＋ 加入产品池</bfe-button
          >
        </div>
      </div>
      <div v-if="error" class="error-box" role="alert">
        {{ error }} <bfe-button @click="load">重试</bfe-button>
      </div>
      <bfe-table :loading="loading"
        ><table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  aria-label="全选当前页"
                  :checked="allSelected"
                  :indeterminate.prop="selectedIds.length > 0 && !allSelected"
                  @change="toggleAll($event.target.checked)"
                />
              </th>
              <th>产品名称</th>
              <th>产品代码</th>
              <th>运行状态</th>
              <th>基金经理</th>
              <th>
                <button class="sort-button" @click="sortDate = !sortDate">
                  成立日期 {{ sortDate ? "↑" : "↓" }}
                </button>
              </th>
              <th>近一月收益率</th>
              <th>近半年收益率</th>
              <th>成立至今收益率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in sortedRows" :key="row.id">
              <td>
                <input
                  v-model="selectedIds"
                  type="checkbox"
                  :value="row.id"
                  :aria-label="'选择 ' + row.productCode"
                />
              </td>
              <td>
                <router-link :to="'/fund/product/' + row.productCode">{{
                  row.productName
                }}</router-link>
              </td>
              <td class="number">{{ row.productCode }}</td>
              <td>
                <bfe-tag :kind="row.runStatus">{{
                  statusName(row.runStatus)
                }}</bfe-tag>
              </td>
              <td>{{ row.managers }}</td>
              <td class="number">{{ row.establishDate }}</td>
              <td
                v-for="field in returnFields"
                :key="field"
                :class="['number', returnClass(row[field])]"
              >
                {{ formatReturn(row[field]) }}
              </td>
            </tr>
            <tr v-if="!rows.length && !loading">
              <td colspan="9" class="empty">
                暂无符合条件的产品，请调整筛选条件
              </td>
            </tr>
          </tbody>
        </table></bfe-table
      ><bfe-page
        :value="queryParams.pageNo"
        :total="total"
        :size="queryParams.pageSize"
        @input="pageChange"
        @size="sizeChange"
      />
      <footer class="list-footer">
        <span>数据由本地模拟服务提供</span
        ><button @click="testFailure">测试接口异常</button>
      </footer>
    </section>
    <bfe-message :message="message" />
  </main>
</template>
<script>
import {
  getFilterOptions,
  getProductList,
  addToPool,
  exportProducts,
  simulateFailure,
  formatReturn,
} from "../api/products";
const blank = () => ({
  keyword: "",
  investTypes: [],
  baseInfos: [],
  tradeStatus: [],
  runStatus: "running",
});
export default {
  name: "FundProductList",
  data: () => ({
    searchForm: blank(),
    queryParams: { pageNo: 1, pageSize: 10 },
    groups: [
      { key: "investTypes", label: "投资类型" },
      { key: "baseInfos", label: "基本信息" },
      { key: "tradeStatus", label: "交易状态" },
    ],
    options: { investTypes: [], baseInfos: [], tradeStatus: [] },
    statuses: [
      { value: "running", label: "存续中" },
      { value: "paused", label: "暂停中" },
      { value: "terminated", label: "已终止" },
    ],
    returnFields: ["return1m", "return6m", "returnSince"],
    rows: [],
    total: 0,
    selectedIds: [],
    loading: false,
    poolLoading: false,
    exporting: false,
    error: "",
    validation: "",
    message: null,
    requestId: 0,
    sortDate: false,
    applied: {},
  }),
  computed: {
    selectedConditions() {
      return this.groups.flatMap((g) =>
        this.searchForm[g.key].map((value) => ({ key: g.key, value }))
      );
    },
    allSelected() {
      return (
        this.rows.length > 0 && this.selectedIds.length === this.rows.length
      );
    },
    sortedRows() {
      return [...this.rows].sort(
        (a, b) =>
          (this.sortDate ? 1 : -1) *
          a.establishDate.localeCompare(b.establishDate)
      );
    },
  },
  async created() {
    await Promise.all([this.loadOptions(), this.load()]);
  },
  beforeDestroy() {
    clearTimeout(this.messageTimer);
    this.requestId++;
  },
  methods: {
    formatReturn,
    returnClass(n) {
      return n > 0 ? "positive" : n < 0 ? "negative" : "";
    },
    statusName(s) {
      return this.statuses.find((x) => x.value === s).label;
    },
    notify(text, kind = "success") {
      this.message = { text, kind };
      clearTimeout(this.messageTimer);
      this.messageTimer = setTimeout(() => (this.message = null), 3500);
    },
    async loadOptions() {
      try {
        this.options = await getFilterOptions();
      } catch (e) {
        this.notify(e.message, "error");
      }
    },
    async load() {
      const id = ++this.requestId;
      this.loading = true;
      this.error = "";
      this.selectedIds = [];
      const params = JSON.parse(
        JSON.stringify({ ...this.searchForm, ...this.queryParams })
      );
      try {
        const result = await getProductList(params);
        if (id !== this.requestId) return;
        this.rows = result.list;
        this.total = result.total;
        this.applied = params;
      } catch (e) {
        if (id === this.requestId) {
          this.error = e.message;
          this.rows = [];
          this.total = 0;
          this.notify(e.message, "error");
        }
      } finally {
        if (id === this.requestId) this.loading = false;
      }
    },
    search() {
      this.validation = "";
      if (this.searchForm.keyword.trim().length > 60) {
        this.validation = "关键字最多60个字符";
        return;
      }
      this.queryParams.pageNo = 1;
      this.load();
    },
    reset() {
      this.searchForm = blank();
      this.validation = "";
      this.search();
    },
    setStatus(s) {
      this.searchForm.runStatus = s;
      this.search();
    },
    removeCondition(c) {
      this.searchForm[c.key] = this.searchForm[c.key].filter(
        (x) => x !== c.value
      );
      this.search();
    },
    pageChange(n) {
      this.queryParams.pageNo = n;
      this.load();
    },
    sizeChange(n) {
      this.queryParams.pageSize = n;
      this.queryParams.pageNo = 1;
      this.load();
    },
    toggleAll(checked) {
      this.selectedIds = checked ? this.rows.map((r) => r.id) : [];
    },
    async addSelected() {
      if (!this.selectedIds.length) {
        this.notify("请先选择产品", "warning");
        return;
      }
      this.poolLoading = true;
      try {
        const result = await addToPool([...this.selectedIds]);
        this.selectedIds = [];
        this.notify(`加入产品池成功，池内共 ${result.total} 个产品`);
      } catch (e) {
        this.notify(e.message, "error");
      } finally {
        this.poolLoading = false;
      }
    },
    async exportData(selected) {
      if (selected && !this.selectedIds.length) return;
      this.exporting = true;
      try {
        const { rows } = await exportProducts(
          selected ? [...this.selectedIds] : null,
          this.applied
        );
        const safe = (v) => '"' + String(v).replace(/"/g, '""') + '"';
        const csv =
          "\uFEFF" +
          [
            ["产品代码", "产品名称", "基金经理", "近一月收益率"],
            ...rows.map((r) => [
              r.productCode,
              r.productName,
              r.managers,
              r.return1m,
            ]),
          ]
            .map((row) => row.map(safe).join(","))
            .join("\r\n");
        const url = URL.createObjectURL(
          new Blob([csv], { type: "text/csv;charset=utf-8" })
        );
        const a = document.createElement("a");
        a.href = url;
        a.download = "基金产品.csv";
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        this.notify(`导出任务已创建，共 ${rows.length} 条`);
      } catch (e) {
        this.notify(e.message, "error");
      } finally {
        this.exporting = false;
      }
    },
    testFailure() {
      simulateFailure();
      this.load();
    },
  },
};
</script>
<style lang="less" scoped>
.list-page {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 24px 24px;
}
.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 4px 16px;
}
h1 {
  font-size: 20px;
  margin: 0 0 8px;
}
.page-heading p {
  margin: 0;
  color: var(--color-text-3);
}
.mock-badge {
  font-size: 12px;
  color: var(--color-text-3);
}
.status-tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border-2);
  margin-bottom: 24px;
  gap: 28px;
}
.status-tabs button {
  background: none;
  border: 0;
  padding: 12px 8px;
  border-bottom: 2px solid transparent;
}
.status-tabs .active {
  border-color: var(--color-brand);
  color: var(--color-brand);
  font-weight: 600;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 40px;
}
.multi-select {
  position: relative;
  width: 100%;
  background: var(--color-fill-2);
  border-radius: 2px;
}
.multi-select summary {
  cursor: pointer;
  padding: 8px 12px;
  color: var(--color-text-2);
}
.multi-options {
  position: absolute;
  z-index: 10;
  top: 36px;
  left: 0;
  right: 0;
  background: var(--color-white);
  border: 1px solid var(--color-border-2);
  box-shadow: var(--shadow-drop-1);
  padding: 8px;
}
.multi-options label {
  display: flex;
  gap: 8px;
  padding: 8px;
}
.selected-conditions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
}
.form-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 24px 0 20px;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--color-border-2);
  padding: 20px 0;
}
.toolbar h2 {
  font-size: 16px;
  margin: 0;
}
.toolbar small {
  font-weight: 400;
  color: var(--color-text-3);
  margin-left: 8px;
  font-size: 12px;
}
.list-footer {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-text-3);
  padding: 24px 0 8px;
}
.list-footer button {
  border: 0;
  background: none;
  color: var(--color-text-3);
}
.sort-button {
  padding: 0;
  background: none;
  border: 0;
  font-weight: 600;
}
.empty {
  text-align: center;
  height: 180px;
  color: var(--color-text-3);
}
@media (min-width: 1200px) {
  .form-grid {
    grid-template-columns: 1.5fr 1fr 1fr 1fr;
    gap: 24px;
  }
  .form-grid .bfe-form-item {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
}
@media (max-width: 900px) {
  .toolbar {
    align-items: flex-start;
    gap: 16px;
    flex-direction: column;
  }
  .toolbar .actions {
    flex-wrap: wrap;
  }
  .form-bottom {
    gap: 16px;
  }
  .hint {
    display: none;
  }
}
@media (max-width: 576px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .list-page {
    padding: 0 12px;
  }
  .mock-badge {
    display: none;
  }
}
</style>
