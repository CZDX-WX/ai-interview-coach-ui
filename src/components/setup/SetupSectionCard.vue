<template>
  <section class="setup-step-card">
    <h2 v-if="title" class="step-card-title">
      <font-awesome-icon v-if="icon" :icon="icon" class="step-card-icon" />
      {{ title }}
    </h2>
    <p v-if="description" class="step-card-description">{{ description }}</p>
    <div class="step-card-content">
      <slot></slot> </div>
  </section>
</template>

<script setup lang="ts">
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'; // 假设全局注册或按需导入

defineProps<{
  title?: string;
  icon?: string | string[]; // Font Awesome icon prop
  description?: string;
}>();
</script>

<style scoped>
.setup-step-card {
  background-color: var(--card-bg-color);
  padding: 1.5rem 2rem; /* 内边距 */
  border-radius: 8px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
[data-theme="dark"] .setup-step-card {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.step-card-title {
  font-size: 1.25rem; /* text-lg 或更大一些 */
  font-weight: 600; /* font-bold */
  color: var(--text-color);
  margin-bottom: 0.5rem; /* 与描述的间距 */
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
[data-theme="dark"] .step-card-title {
  color: #ffffff;
}
.step-card-icon {
  color: var(--primary-color);
  font-size: 1.2em; /* 相对于标题字体大小 */
  margin-right: 0.25rem; /* 图标和文字间距 */
}

.step-card-description {
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.8;
  margin-bottom: 1.25rem; /* 描述和主要内容区的间距 */
  line-height: 1.6;
}
[data-theme="dark"] .step-card-description {
  color: #a2aab3;
}

.step-card-content {
  /* 内容区域的特定样式（如果需要） */
}
</style>