<template>
  <div>
    <header class="header">
      <router-link to="/" class="brand">基金投资研究平台</router-link>
      <nav aria-label="主导航">
        <button
          v-for="nav in navList"
          :key="nav"
          :class="{ selected: activeNav === nav }"
          @click="selectNav(nav)"
        >
          {{ nav }}
        </button>
      </nav>
      <div class="user">
        <button aria-label="语言" @click="notice = '当前语言：简体中文'">
          ◎</button
        ><button aria-label="通知" @click="notice = '暂无新通知'">♧<i /></button
        ><span class="avatar">李</span><span>李经理</span>
      </div>
    </header>
    <div v-if="notice" class="shell-notice" role="status" @click="notice = ''">
      {{ notice }} · 点击关闭
    </div>
    <div class="app-shell">
      <aside class="app-shell__sidebar">
        <bfe-menu
          :value="activeMenu"
          @input="selectMenu"
          :items="menuList"
          pinned-group="funds"
        />
      </aside>
      <div class="app-shell__content"><router-view /></div>
    </div>
  </div>
</template>
<script>
import BfeMenu from "./components/BfeMenu.vue";
export default {
  components: { BfeMenu },
  data: () => ({
    navList: [
      "营销支持",
      "产品管理",
      "产品服务",
      "业务支持",
      "资源管理",
      "风险管理",
      "IT资产管理",
    ],
    activeNav: "产品管理",
    activeMenu: "fundProduct",
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
    notice: "",
  }),
  watch: {
    "$route.path"() {
      this.activeMenu = "fundProduct";
    },
  },
  methods: {
    selectMenu(key) {
      this.activeMenu = key;
      if (key === "fundProduct" && this.$route.path !== "/")
        this.$router.push("/");
    },
    selectNav(nav) {
      if (nav === "产品管理") {
        this.activeNav = nav;
        this.activeMenu = "fundProduct";
        this.$router.push("/").catch(() => {});
      } else this.notice = nav + "模块暂未接入";
    },
  },
};
</script>

<style lang="less" scoped>
.app-shell {
  display: flex;
  min-height: calc(100vh - 46px);
}
.app-shell__sidebar {
  flex: 0 0 220px;
  position: sticky;
  top: 0;
  align-self: flex-start;
  height: 100vh;
  background: var(--color-white);
  overflow-y: auto;
}
.app-shell__content {
  flex: 1;
  min-width: 0;
}
@media (max-width: 575px) {
  .app-shell__sidebar {
    flex-basis: 140px;
  }
}
</style>
