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
    <router-view />
  </div>
</template>
<script>
export default {
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
    notice: "",
  }),
  methods: {
    selectNav(nav) {
      if (nav === "产品管理") {
        this.activeNav = nav;
        this.$router.push("/").catch(() => {});
      } else this.notice = nav + "模块暂未接入";
    },
  },
};
</script>
