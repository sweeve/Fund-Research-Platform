# Role

你是一名资深前端工程师，精通 Vue 2 + JavaScript + BFE 组件库（公司内部组件库，组件前缀 `bfe-`）。

# Task

实现一个【基金产品-产品详情-收益分析】页面：顶部导航栏 + 左侧菜单 + 主内容区（面包屑 + 产品头部信息区含状态标签 + 8 个功能标签页 + 6 个收益周期标签页 + 收益表现数据表格），「收益分析」为当前激活 Tab，支持周期切换查询。

# Tech Stack

- Framework: Vue 2（Options API：data / computed / methods / watch）
- Language: JavaScript（ES6+）
- UI Library: BFE 组件库（`bfe-` 前缀，如 `bfe-tabs`、`bfe-tag`、`bfe-table`）
- 样式：Less + 设计令牌（颜色一律使用 `var(--color-xxx)` CSS 变量，禁止裸色值）

# Page Layout

页面整体宽度 1440px，背景 `var(--color-fill-2)`，三段式布局：顶部导航栏（46px，品牌色背景）→ 左侧菜单（220px，白底）→ 主内容区。

## 1. 顶部导航栏（Header）

- 背景色 `var(--color-brand)`，高度 46px，flex 两端对齐
- 左侧标题：「基金投资研究平台」（16/CN-Medium，`var(--color-white)`）
- 中部导航链接（水平排列，14/CN-Regular，`var(--color-white)`）：
  1. 营销支持
  2. 产品管理 ← **当前选中**（底部白色 2px 下划线）
  3. 产品服务
  4. 业务支持
  5. 资源管理
  6. 风险管理
  7. IT资产管理
- 右侧操作区：
  - 消息、通知图标按钮 ×2（白色图标），通知按钮右上角红色圆点（`var(--color-red-6)`，直径 6px）
  - 用户头像（28px 圆形）+「李经理」（`var(--color-white)`）

**实现要求**：导航项 `navList` 数组数据驱动渲染，`activeNav` 控制选中下划线。

## 2. 左侧菜单（Sidebar）

- 背景白色，宽度固定 220px，使用 `bfe-menu` 组件
- 菜单结构（14/CN-Regular）：

```
├─ 智能定投
│   ├─ 定投工具
│   └─ 智能遴选池
└─ 公募基金（展开）
    ├─ 基金产品    ← 当前选中（文字 var(--color-brand)，背景 var(--color-fill-2)）
    └─ 基金经理
```

**实现要求**：菜单 `menuList` 配置化渲染，`activeMenu = 'fundProduct'`，点击仅切换选中态。

## 3. 主内容区

### 3.1 面包屑

「**基金产品** / 产品详情 / 存续期」——「基金产品」14/CN-Medium `var(--color-brand)`（可点击返回列表），「产品详情」14/CN-Medium `var(--color-text-3)`，「存续期」14/CN-Medium `var(--color-text-2)`

### 3.2 产品头部信息区（白底卡片）

- 产品名称：「易方达互联网50ETF联接」（16/CN-Medium，`var(--color-text-1)`）
- 标签组（`bfe-tag`，横向排列）：

| 标签内容 | 背景 | 文字 |
|----------|------|------|
| 006329（产品代码） | `var(--color-fill-2)` | `var(--color-text-2)` |
| 存续期 | `var(--color-fill-2)` | `var(--color-text-2)` |
| 国际(QDII)股票型基金 | `var(--color-info-bg)` | `var(--color-info-text)` |
| 中高风险 | `var(--color-danger-bg)` | `var(--color-danger-text)` |

- 辅助说明：「成立日期 - 到期日期」区间文案（14/CN-Regular，`var(--color-text-3)`）

### 3.3 一级标签页（功能 Tab）

- 使用 `bfe-tabs` 组件，当前激活：「**收益分析**」
- 标签项（`tabList` 数组数据驱动渲染）：

```
基本信息 | 收益分析（激活） | 风险分析 | 基金经理 | 资产配置 | 债券分析 | 特色指标 | 相关公告
```

- 激活 Tab 文字 `var(--color-brand)` + 底部 2px 品牌色下划线；未激活 14/CN-Regular `var(--color-text-2)`
- **切换行为**：本页只实现「收益分析」Tab 内容，其余 Tab 切换跳转对应路由（如 `/fund/product/:code/base-info`）

### 3.4 二级标签页（收益周期 Tab）

- 位于收益分析 Tab 内容顶部，使用 `bfe-tabs`（或 `bfe-radio-group` 按钮组样式），当前激活：「**近一周**」
- 标签项（`periodList` 数组数据驱动渲染）：

```
近一周（激活） | 近一月 | 近三月 | 近六月 | 近一年 | 成立以来
```

- **切换行为**：切换周期后携带 `period` 参数调用 `getReturnAnalysis(code, period)` 重新请求收益数据（表格 loading）

### 3.5 收益表现数据表格

- 使用 `bfe-table` 组件（无分页，纯展示），表头背景 `var(--color-fill-2)`、行高 52px、单元格 padding 9px 16px、行底边框 `var(--color-border-2)` 1px
- 表头字体 14/CN-Medium `var(--color-text-1)`，数据字体 14/CN-Regular `var(--color-text-1)`
- 列定义：

| 列 | 字段 | 示例 | 渲染规则 |
|----|------|------|----------|
| 收益指标 | metric | 近一周收益率 / 同类中位数 / 四分位排名 / 同类排名 | 14/CN-Regular `var(--color-text-1)` |
| 本产品 | myProduct | +0.04% / +1.87% / -2.32% | 收益率红涨绿跌：正数 `var(--color-red-6)`、负数 `var(--color-success-text)`、0.00% 默认色 |
| 同类中位数 | median | +0.04% / +1.87% / -2.32% | 同上 |
| 四分位排名 | quartile | 优秀 / 良好 / 一般 / 不佳 | 排名标签渲染，见下方映射 |
| 同类排名 | peerRank | 198/253 / 23/253 / 102/253 | 14/CN-Regular `var(--color-text-1)`；名次越靠前（分母占比越小）文字用 `var(--color-brand)` 强调 |

- **四分位排名颜色映射**：

| 排名 | 渲染 |
|------|------|
| 优秀 | `bfe-tag`：背景 `var(--color-success-bg)`，文字 `var(--color-success-text)` |
| 良好 | `bfe-tag`：背景 `var(--color-info-bg)`，文字 `var(--color-info-text)` |
| 一般 | `bfe-tag`：背景 `var(--color-fill-2)`，文字 `var(--color-text-2)` |
| 不佳 | `bfe-tag`：背景 `var(--color-danger-bg)`，文字 `var(--color-danger-text)` |

# Functional Requirements（交互逻辑汇总）

1. **初始化**：`created` 中从路由参数取产品代码 `this.$route.params.code`，并行调用：
   - `getProductBaseInfo(code)`：产品头部信息（名称 + 标签）
   - `getReturnAnalysis(code, 'week')`：默认周期「近一周」的收益数据
2. **周期切换**：切换二级 Tab → 记录 `activePeriod` → 表格 loading → 请求对应周期数据 → 渲染
3. **收益率渲染**：正数红色、负数绿色、零默认色（红涨绿跌）；空值显示「--」
4. **四分位排名**：枚举值（优秀/良好/一般/不佳）映射为不同色系标签
5. **Tab 路由跳转**：一级 Tab 切换非「收益分析」时 `this.$router.push` 跳转
6. **面包屑返回**：「基金产品」点击返回产品列表页
7. **加载态**：头部信息与表格分别独立 loading（并行请求互不阻塞）
8. **空态与异常**：无收益数据时表格空态「暂无数据」；接口异常 `bfe-message.error`，finally 复位 loading

# Data Model

```javascript
// 收益分析数据（单周期）
{
  period: 'week',               // week/month/quarter/halfYear/year/since（近一周/近一月/近三月/近六月/近一年/成立以来）
  rows: [
    {
      metric: '近一周收益率',     // 指标名
      myProduct: 1.87,          // 本产品收益率(%)，正负决定红绿
      median: 0.04,             // 同类中位数(%)
      quartile: '优秀',          // 四分位排名：优秀/良好/一般/不佳
      peerRank: '23/253'        // 同类排名
    }
    // ... 近一月/近三月/近六月/近一年/成立以来 各一行（切换周期时表格展示对应区间汇总行）
  ]
}

// 激活状态
activeTab: 'return',            // 一级 Tab：return
activePeriod: 'week',           // 二级周期 Tab：week

// 周期选项
periodList: [
  { key: 'week', label: '近一周' },
  { key: 'month', label: '近一月' },
  { key: 'quarter', label: '近三月' },
  { key: 'halfYear', label: '近六月' },
  { key: 'year', label: '近一年' },
  { key: 'since', label: '成立以来' }
]
```

# Data Mock

组件内实现模拟 API（setTimeout 500ms，返回 Promise）：

```javascript
// 产品头部信息
function getProductBaseInfo(code) {
  /* { productCode: '006329', productName: '易方达互联网50ETF联接', productType: '国际(QDII)股票型基金', riskLevel: '中高风险', duration: '存续期', establishDate: '2019-02-25', expireDate: '2029-02-25' } */
}
// 收益分析（按周期）
function getReturnAnalysis(code, period) {
  /* 返回上方 rows 结构；不同 period 返回不同数值（近一年数值绝对值更大），四分位覆盖四种枚举，收益率覆盖正/负/零 */
}
```

mock 数据要求：6 个周期各自返回一组差异化数据；同一周期内收益率覆盖正/负/零；四分位排名覆盖「优秀/良好/一般/不佳」四种（验证标签色系映射）。

# Constraints

- 组件一律使用 BFE 库：`bfe-tabs / bfe-tab-pane / bfe-tag / bfe-table / bfe-spin / bfe-message`
- 所有颜色使用设计令牌 CSS 变量，禁止 hex / rgb 原始色值
- 两级 Tab 均数据驱动渲染（`tabList` / `periodList` 数组）
- 收益率红涨绿跌（正红、负绿、零默认、空值 --）
- 四分位排名四档色系映射：优秀=success、良好=info、一般=中性、不佳=danger
- 周期切换时表格独立 loading，头部信息不重复请求
- 处理 loading 与空数据状态
- Vue 2 Options API 写法

# Output Format

输出单个 `.vue` 文件：`ProductDetailReturn.vue`。
按以下结构组织：`<template>` → `<script>`（Options API）→ `<style lang="less" scoped>`。
代码中包含详细中文注释。
