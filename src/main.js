import Vue from "vue";
import VueRouter from "vue-router";
import installBfe from "./components/bfe";
import App from "./App.vue";
import List from "./views/FundProductList.vue";
import Detail from "./views/FundProductDetail.vue";
import "./tokens.less";
Vue.use(VueRouter);
installBfe();
const router = new VueRouter({
  routes: [
    { path: "/", component: List },
    { path: "/fund/product/:code", component: Detail },
    { path: "*", redirect: "/" },
  ],
});
new Vue({ router, render: (h) => h(App) }).$mount("#app");
