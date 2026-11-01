# Role

你是一名资深前端工程师，精通 Vue 2 + JavaScript + BFE 组件库（公司内部组件库，组件前缀 `bfe-`）。

# Task

实现一个【智能定投-产品详情-基金产品列表】页面：顶部导航栏 + 主内容区（关键字搜索 + 多维筛选 + 操作按钮 + 数据表格 + 分页器 + 运行状态标签），支持基金产品查询、加入产品池、批量导出。

# Tech Stack

- Framework: Vue 2（Options API：data / computed / methods / watch）
- Language: JavaScript（ES6+）
- UI Library: BFE 组件库（`bfe-` 前缀，如 `bfe-select`、`bfe-table`、`bfe-page`）
- 样式：Less + 设计令牌（颜色一律使用 `var(--color-xxx)` CSS 变量，禁止裸色值）

# Page Layout

页面整体宽度 1440px，背景 `var(--color-fill-2)`。本页无左侧菜单，为产品管理下的全宽列表页：顶部导航栏（46px，品牌色背景）→ 主内容区。

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

**实现要求**：导航项用数据驱动渲染（`navList` 数组 + `v-for`），当前选中项通过 `activeNav` 状态加下划线样式。

## 2. 主内容区

### 2.1 页头标题区

- 主标题：「基金产品列表」（16/CN-Medium，`var(--color-text-1)`）
- 状态筛选标签（点击切换，可理解为运行状态 Tab）：
  - 「存续中」（14/CN-Medium，`var(--color-success-text)`）← 默认选中
  - 「暂停中」（14/CN-Medium，`var(--color-warning-text)`）
  - 「已终止」（14/CN-Medium，`var(--color-text-2)`）
- 切换状态标签时携带状态参数重新请求列表

### 2.2 查询表单区

- 容器：白底、圆角 4px，使用 `bfe-form`（label 宽度 80px）
- 表单项：

| 表单项 | 组件 | 类型 | 说明 |
|--------|------|------|------|
| 关键字 | `bfe-input` | 文本输入 | 占位「请输入基金代码/基金名称/基金经理等」，支持模糊匹配 |
| 投资类型 | `bfe-select` / 筛选组 | 下拉多选 | 示例选项：股票型、混合型、债券型、QDII、货币型 |
| 基本信息 | `bfe-select` / 筛选组 | 下拉多选 | 示例选项：成立年限、基金规模、基金公司 |
| 交易状态 | `bfe-select` / 筛选组 | 下拉多选 | 示例选项：可申购、不可申购、可赎回、不可赎回、限大额 |
| 已选条件 | 标签展示区（`bfe-tag` closable） | 只读 | 展示所有已选筛选项，点击 × 移除该条件并刷新列表 |

- 输入框统一样式：背景 `var(--color-fill-2)`、圆角 2px、字体 14/CN-Regular
- 辅助说明文案：「请输入基金代码/基金名称/基金经理等」（14/CN-Regular，`var(--color-text-3)`）

### 2.3 操作按钮区

| 按钮 | 样式 | 行为 |
|------|------|------|
| 查询 | 主按钮：背景 `var(--color-brand)`、文字白色、圆角 2px | 携带筛选条件请求列表，页码重置 1 |
| 加入产品池 | 主按钮：背景 `var(--color-brand)`、文字白色 | 需先勾选表格行；未勾选时 Message.warning「请先选择产品」；勾选后调用 `addToPool(ids)`，成功 Message.success |
| 重置 | 次按钮：背景 `var(--color-fill-2)`、文字 `var(--color-text-2)` | 清空全部筛选条件与已选标签并刷新 |
| 导出全部 | 次按钮：背景 `var(--color-fill-2)`、文字 `var(--color-text-2)` | mock：Message.success「导出任务已创建」，按钮进入 loading 2s |
| 导出 | 描边按钮 | 同导出全部 |
| 导出选中数据 | 次按钮：背景 `var(--color-fill-2)`、文字 `var(--color-text-2)` | 仅勾选行时可用，未勾选置灰（disabled） |

### 2.4 数据表格

- 使用 `bfe-table` 组件，表头背景 `var(--color-fill-2)`、行高 52px、单元格 padding 9px 16px、行底边框 `var(--color-border-2)` 1px
- 表头字体 14/CN-Medium `var(--color-text-1)`，数据字体 14/CN-Regular `var(--color-text-1)`
- 列定义：

| 列 | 字段 | 说明 |
|----|------|------|
| 复选框 | selection | type="selection" 多选列 |
| 产品代码 | productCode | 示例：006329 |
| 成立日期 | establishDate | 示例：2026-2-25 |
| 基金经理 | managers | 示例：丁宇佳 欧阳帆 陶尹斌（多经理空格分隔） |
| 运行状态 | runStatus | `bfe-tag` 标签，见下方状态映射 |
| 近一月收益率 | return1m | 数值列，红涨绿跌，保留两位小数带 % |
| 近半年收益率 | return6m | 同上 |
| 成立至今收益率 | returnSince | 同上 |
| 产品名称 | productName | 示例：易方达互联网50ETF联接；点击跳转产品详情页 `/fund/product/:code` |

- **运行状态标签映射**（`bfe-tag`）：

| 状态 | 背景 | 文字 |
|------|------|------|
| 存续中 | `var(--color-success-bg)` | `var(--color-success-text)` |
| 暂停中 | `var(--color-warning-bg)` | `var(--color-warning-text)` |
| 已终止 | `var(--color-danger-bg)` | `var(--color-danger-text)` |
| 债券型：混合债券型一级基金 | `var(--color-fill-2)` | `var(--color-text-1)` |
| QDII：国际(QDII)股票型基金 | `var(--color-fill-2)` | `var(--color-text-1)` |

- **收益率渲染规则**：正数红色 `var(--color-red-6)`、负数绿色 `var(--color-success-text)`、0.00% 默认文字色（红涨绿跌）

### 2.5 分页器

- 使用 `bfe-page` 组件：「共 50 条」+ 当前页高亮（14/EN-Medium `var(--color-brand)`、背景 `var(--color-danger-bg)`、圆角 2px）+ 方向图标翻页按钮
- 切换页码 / 每页条数时重新请求

# Functional Requirements（交互逻辑汇总）

1. **初始化**：`created` 中请求筛选下拉选项（`getFilterOptions()`）与列表（`getProductList()`）
2. **状态 Tab 切换**：存续中 / 暂停中 / 已终止 互斥切换，携带状态重新查询
3. **已选条件联动**：任一筛选下拉变化 → 同步更新 `selectedConditions` 标签数组 → 移除标签时反向清空对应筛选字段并刷新
4. **加入产品池**：校验勾选 → `addToPool(selectedIds)` → 成功提示 + 清空勾选
5. **导出**：导出全部 / 导出选中，均为 mock 行为（loading 2s + 成功提示）；「导出选中数据」未勾选时 disabled
6. **产品名称点击跳转**：`this.$router.push('/fund/product/' + row.productCode)`
7. **加载态与空态**：table loading 属性 + 空数据占位
8. **错误处理**：接口异常 `bfe-message.error`，finally 中复位 loading

# Data Model

```javascript
// 单条基金产品
{
  id: 'F001',
  productCode: '006329',                    // 产品代码
  productName: '易方达互联网50ETF联接',       // 产品名称
  establishDate: '2026-2-25',               // 成立日期
  managers: '丁宇佳 欧阳帆 陶尹斌',           // 基金经理
  runStatus: 'running',                     // running=存续中 | paused=暂停中 | terminated=已终止
  investType: 'QDII：国际(QDII)股票型基金',    // 投资类型标签
  return1m: 12.67,                          // 近一月收益率(%)
  return6m: -8.76,                          // 近半年收益率(%)
  returnSince: 0                            // 成立至今收益率(%)
}

// 查询表单
searchForm: {
  keyword: '',          // 关键字
  investTypes: [],      // 投资类型（多选）
  baseInfos: [],        // 基本信息（多选）
  tradeStatus: [],      // 交易状态（多选）
  runStatus: 'running'  // 状态 Tab
}

// 分页
queryParams: { pageNo: 1, pageSize: 10 }
```

# Data Mock

组件内实现模拟 API（setTimeout 500ms，返回 Promise）：

```javascript
function getProductList(params) { /* 关键字模糊匹配 productCode/productName/managers + 状态过滤 + 分页，返回 { total, list } */ }
function getFilterOptions() { /* 返回三组下拉选项 */ }
function addToPool(ids) { /* 返回 { code: 0, msg: 'success' } */ }
function exportProducts(ids) { /* 2s 延迟后返回成功 */ }
```

mock 数据要求：50 条（验证分页）；覆盖三种运行状态（验证 Tab 筛选与状态标签渲染）；收益率覆盖正/负/零（验证红涨绿跌）。

# Constraints

- 组件一律使用 BFE 库：`bfe-form / bfe-form-item / bfe-input / bfe-select / bfe-option / bfe-button / bfe-table / bfe-page / bfe-tag / bfe-message`
- 所有颜色使用设计令牌 CSS 变量，禁止 hex / rgb 原始色值
- 状态标签三态映射：存续中=success、暂停中=warning、已终止=danger
- 收益率列红涨绿跌（正红、负绿、零默认）
- 处理 loading 与空数据状态；按钮在无勾选时的禁用逻辑
- Vue 2 Options API 写法

# Output Format

输出单个 `.vue` 文件：`FundProductList.vue`。
按以下结构组织：`<template>` → `<script>`（Options API）→ `<style lang="less" scoped>`。
代码中包含详细中文注释。
