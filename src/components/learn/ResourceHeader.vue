<template>
  <div class="page-header-section">
    <h1 class="page-title">
      <font-awesome-icon v-if="icon" :icon="icon" class="title-icon" />
      {{ title }}
    </h1>
    <p v-if="subtitle" class="page-subtitle">
      {{ subtitle }}
    </p>
  </div>
</template>

<script setup lang="ts">
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

defineProps<{
  title: string; // 中文标题
  subtitle?: string; // 中文副标题
  icon?: string | string[];
}>();
</script>

<style scoped>
/* 样式与 CareerInsightsHeader.vue 或其他页面头部组件类似 */
.page-header-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
[data-theme="dark"] .page-title {
  color: #ffffff;
}
.page-title .title-icon {
  color: var(--primary-color);
  font-size: 0.9em;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--text-color);
  opacity: 0.8;
  max-width: 750px;
}
[data-theme="dark"] .page-subtitle {
  color: #a2aab3;
}
</style>