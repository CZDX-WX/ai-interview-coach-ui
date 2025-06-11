<template>
  <div class="report-header-component">
    <h1 class="page-title">
      <font-awesome-icon :icon="['fas', 'file-invoice']" class="title-icon" />
      面试报告
    </h1>
    <p class="report-subtitle" v-if="jobFieldLabel && experienceLevelLabel && interviewDate">
      {{ jobFieldLabel }} - {{ experienceLevelLabel }} | {{ interviewDate }}
    </p>
    <p class="report-subtitle" v-else-if="sessionId">
      会话ID: {{ sessionId }}
    </p>
  </div>
</template>

<script setup lang="ts">
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

defineProps<{
  jobFieldLabel?: string;
  experienceLevelLabel?: string;
  interviewDate?: string;
  sessionId?: string; // Fallback display if other details are missing
}>();
</script>

<style scoped>
.report-header-component {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem; /* 为标题和副标题下方增加一些空间 */
  text-align: center;
  border-bottom: 1px solid var(--border-color);
}
.page-title {
  font-size: 2rem; /* text-[32px] from prototype */
  font-weight: 700; /* font-bold */
  color: var(--text-color);
  margin-bottom: 0.5rem; /* 调整与副标题的间距 */
  display: inline-flex; /* 使图标和文字在同一行并居中 */
  align-items: center;
  gap: 0.75rem;
}
[data-theme="dark"] .page-title {
  color: #ffffff;
}
.page-title .title-icon {
  color: var(--primary-color);
  font-size: 0.9em; /* 相对于标题的图标大小 */
}
.report-subtitle {
  font-size: 1rem;
  color: var(--text-color);
  opacity: 0.8;
}
[data-theme="dark"] .report-subtitle {
  color: #a2aab3; /* 暗色主题下的副标题颜色 */
}
</style>