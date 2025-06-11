<template>
  <div class="interview-header-info">
    <h1 class="interview-title">
      <font-awesome-icon :icon="icon" class="title-icon" /> {{ title }}
    </h1>
    <div class="interview-type-display" v-if="jobFieldLabel && experienceLevelLabel">
      <span>{{ jobFieldLabel }} - {{ experienceLevelLabel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

defineProps<{
  title: string;
  icon: string | string[]; // e.g., ['fas', 'microphone-alt']
  jobFieldLabel?: string;
  experienceLevelLabel?: string;
}>();
</script>

<style scoped>
.interview-header-info {
  padding: 1rem 1.5rem; /* 调整内边距以适应 InterviewRoomView 布局 */
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0; /* 防止头部被压缩 */
  background-color: var(--card-bg-color); /* 保持与父组件暗色背景协调 */
}

.interview-title {
  font-size: 1.4rem; /* 调整大小 */
  font-weight: 600;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0; /* 移除默认 H1 margin */
}
[data-theme="dark"] .interview-title {
  color: #ffffff;
}
.title-icon {
  color: var(--primary-color);
  font-size: 1.1em; /* 相对于标题字体大小 */
}

.interview-type-display {
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.8;
}
[data-theme="dark"] .interview-type-display {
  color: #a2aab3; /* 暗色主题下较浅的文字 */
}
</style>