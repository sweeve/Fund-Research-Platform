# 基金投资研究平台

依据提供的设计系统、基金产品列表 Prompt 与两张样图实现的可运行演示项目。

## 运行

Node.js 20.19+（本次验证为 24.18）。

```sh
npm ci
npm run dev
npm run build
npm test
```

打开 http://127.0.0.1:5173 。Hash 路由支持静态托管刷新，详情为 `/#/fund/product/006329`。

浏览器验收（需安装 Microsoft Edge，且先启动开发服务器）：

```sh
node scripts/browser-test.mjs
```

脚本截图保存到 docs/screenshots 目录。

## 实现说明

- Vue 2.7 Options API，Less，Vue Router，Vite；Vue2 是需求指定版本。
- `src/views/FundProductList.vue` 为要求的列表单文件组件。
- `src/views/FundProductDetail.vue` 实现第二张图的收益分析详情。
- `src/api/products.js` 集中模拟异步 API、50 条产品、组合筛选与校验；均为演示数据。
- `src/components/bfe.js` 为本地 BFE 兼容层，**并非公司内部 BFE 库**。未提供内部依赖，接入时应替换该层并根据真实组件 API 适配插槽、事件。
- `src/tokens.less` 为唯一原始颜色定义位置，组件样式均使用令牌。品牌红按截图覆盖文档中的蓝色冲突。
- 列表全宽遵循产品 Prompt；详情侧栏、收益区块遵循样图。产品名称排在首列，以匹配截图。
- 导出实际生成 CSV；入池在当前模拟服务生命周期内保留并去重；关注为当前详情内存状态，刷新不会持久化。无真实后台、登录或投资建议。
- 详情基本信息与收益分析已实现，其余页签展示暂无模拟数据。收益曲线由模拟区间结果生成，不是历史市场行情。
- 未使用外部头像和在线字体，以免产生图片版权或网络依赖；使用文字头像及系统字体回退。
- 程序化 Vite 入口避免当前 Windows 受限环境下配置打包器遍历盘符根目录导致的访问错误。

优化 Prompt 及优化思路见 `docs/optimized-prompt.md`；验证记录见 `docs/verification.md`。
