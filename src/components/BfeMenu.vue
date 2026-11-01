<template>
  <nav class="bfe-menu" aria-label="侧边导航">
    <section v-for="group in items" :key="group.key">
      <button
        class="bfe-menu__group"
        :aria-expanded="expanded[group.key]"
        @click="toggleGroup(group.key)"
      >
        <span>⌂　{{ group.label }}</span
        ><span>{{ expanded[group.key] ? "⌃" : "⌄" }}</span>
      </button>
      <div v-if="expanded[group.key]">
        <button
          v-for="item in group.children"
          :key="item.key"
          :class="[
            'bfe-menu__item',
            { 'bfe-menu__item--active': value === item.key },
          ]"
          :aria-current="value === item.key ? 'page' : null"
          @click="$emit('input', item.key)"
        >
          {{ item.label }}
        </button>
      </div>
    </section>
  </nav>
</template>
<script>
export default {
  props: { items: Array, value: String, pinnedGroup: String },
  data: () => ({ expanded: { investment: true, funds: true } }),
  methods: {
    toggleGroup(key) {
      if (key !== this.pinnedGroup)
        this.$set(this.expanded, key, !this.expanded[key]);
    },
  },
};
</script>
<style lang="less" scoped>
.bfe-menu {
  padding: 8px;
  background: var(--color-white);
  height: 100%;
}
.bfe-menu__group,
.bfe-menu__item {
  width: 100%;
  border: 0;
  background: transparent;
  text-align: left;
  color: var(--color-text-2);
  min-height: 40px;
  transition: background 0.2s ease-in-out;
}
.bfe-menu__group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 12px;
  margin: 4px 0;
}
.bfe-menu__item {
  padding: 0 42px;
  margin: 4px 0;
  border-radius: 2px;
}
.bfe-menu__item:hover {
  background: var(--color-fill-1);
}
.bfe-menu__item--active {
  background: var(--color-fill-2);
  color: var(--color-brand);
  font-weight: 600;
}
@media (max-width: 575px) {
  .bfe-menu__item {
    padding: 0 16px;
  }
  .bfe-menu__group {
    padding: 0 6px;
  }
}
</style>
