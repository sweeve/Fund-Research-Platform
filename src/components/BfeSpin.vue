<template>
  <div class="bfe-spin" :aria-busy="spinning">
    <div v-if="spinning" class="bfe-spin__loading" role="status">
      <span class="spinner" />{{ label }}
    </div>
    <div v-else class="bfe-spin__content"><slot /></div>
  </div>
</template>
<script>
export default {
  props: { spinning: Boolean, label: { type: String, default: "正在加载…" } },
};
</script>
<style lang="less" scoped>
.bfe-spin__loading {
  min-height: 164px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  color: var(--color-text-3);
}
</style>
