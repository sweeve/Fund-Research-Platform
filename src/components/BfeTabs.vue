<template>
  <div class="bfe-tabs" :class="'bfe-tabs--' + variant">
    <div
      class="bfe-tabs__list"
      role="tablist"
      :aria-label="label"
      @keydown="onKeydown"
    >
      <button
        v-for="item in items"
        :key="item.key"
        :id="`${id}-${item.key}`"
        type="button"
        role="tab"
        :aria-selected="value === item.key"
        :aria-controls="`${id}-panel`"
        :tabindex="value === item.key ? 0 : -1"
        :class="[
          'bfe-tabs__item',
          { 'bfe-tabs__item--active': value === item.key },
        ]"
        @click="$emit('input', item.key)"
      >
        {{ item.label }}
      </button>
    </div>
    <slot />
  </div>
</template>
<script>
export default {
  props: {
    value: String,
    items: Array,
    label: String,
    id: String,
    variant: { type: String, default: "line" },
  },
  methods: {
    // 手动激活：方向键移动焦点，Enter/Space由原生button激活，不产生无意接口请求。
    onKeydown(event) {
      const buttons = [...event.currentTarget.querySelectorAll("[role=tab]")];
      const current = buttons.indexOf(document.activeElement);
      let next = current;
      if (event.key === "ArrowRight") next = (current + 1) % buttons.length;
      else if (event.key === "ArrowLeft")
        next = (current - 1 + buttons.length) % buttons.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = buttons.length - 1;
      else return;
      event.preventDefault();
      buttons[next].focus();
    },
  },
};
</script>
<style lang="less" scoped>
.bfe-tabs__list {
  display: flex;
  overflow-x: auto;
  background: var(--color-bg-card);
  gap: 4px;
}
.bfe-tabs__item {
  flex-shrink: 0;
  position: relative;
  min-height: 44px;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  padding: 0 18px;
  color: var(--color-text-2);
  transition: all 0.2s ease-in-out;
}
.bfe-tabs__item:hover {
  background: var(--color-fill-1);
}
.bfe-tabs__item--active {
  color: var(--color-brand);
  border-bottom-color: var(--color-brand);
  font-weight: 600;
}
.bfe-tabs--pill .bfe-tabs__list {
  gap: 12px;
  flex-wrap: wrap;
  overflow: visible;
}
.bfe-tabs--pill .bfe-tabs__item {
  min-height: 32px;
  border: 0;
  border-radius: 18px;
  padding: 0 16px;
}
.bfe-tabs--pill .bfe-tabs__item--active {
  background: var(--color-fill-2);
}
@media (max-width: 576px) {
  .bfe-tabs__item {
    padding: 0 12px;
  }
  .bfe-tabs--pill .bfe-tabs__list {
    gap: 8px;
  }
}
</style>
