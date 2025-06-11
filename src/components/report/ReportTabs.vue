<template>
  <div class="tabs-navigation">
    <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-button', { active: activeTabId === tab.id }]"
        @click="selectTab(tab.id)"
        type="button"
    >
      <font-awesome-icon v-if="tab.icon" :icon="tab.icon" />
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

export interface TabDefinition {
  id: string;
  label: string; // 中文标签
  icon?: string | string[]; // Font Awesome icon
}

defineProps<{
  tabs: TabDefinition[];
  activeTabId: string;
}>();

const emit = defineEmits<{
  (e: 'update:activeTabId', tabId: string): void;
}>();

const selectTab = (tabId: string) => {
  emit('update:activeTabId', tabId);
};
</script>

<style scoped>
.tabs-navigation {
  display: flex;
  border-bottom: 2px solid var(--border-color);
  margin-bottom: 1.5rem; /* 与下方标签内容的间距 */
}
.tab-button {
  padding: 0.85rem 1.35rem; /* 增加内边距 */
  background: none;
  border: none;
  color: var(--text-color);
  opacity: 0.75; /* 非激活状态稍透明 */
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px; /* 使激活状态的下边框与父容器边框重合 */
  transition: color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem; /* 图标和文字间距 */
}
.tab-button:hover {
  opacity: 1;
  color: var(--primary-color);
}
.tab-button.active {
  opacity: 1;
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
  font-weight: 600;
}
.tab-button .fa-icon {
  font-size: 0.9em; /* 图标大小相对于文字 */
}
</style>