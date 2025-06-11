<template>
  <div class="review-summary-container">
    <div class="review-summary" v-if="jobFieldLabel && experienceLevelLabel && selectedPhaseNames.length > 0">
      <p>您即将开始一场针对以下配置的面试：</p>
      <p><strong>职位领域：</strong> {{ jobFieldLabel }}</p>
      <p><strong>经验水平：</strong> {{ experienceLevelLabel }}</p>
      <p v-if="selectedResumeName && selectedResumeName !== '等待上传新文件'">
        <strong>简历：</strong> {{ selectedResumeName }}
      </p>
      <p v-else-if="!selectedResumeName"><strong>简历：</strong> 未选择</p>
      <p><strong>已选阶段：</strong></p>
      <ul v-if="selectedPhaseNames.length > 0">
        <li v-for="phaseName in selectedPhaseNames" :key="phaseName">
          {{ phaseName }}
        </li>
      </ul>
      <p v-else><i>请至少选择一个面试阶段。</i></p>
    </div>
    <p v-else class="empty-review-text">请先完成“职位领域”、“经验水平”和“面试阶段”的选择以查看摘要。</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  jobFieldLabel: string | null;
  experienceLevelLabel: string | null;
  selectedResumeName?: string | null;
  selectedPhaseNames: string[];
}>();
</script>

<style scoped>
/* 样式从 InterviewSetupView.vue 迁移 */
.review-summary-container {
  text-align: center; /* Centering the content within its step card */
}
.review-summary {
  background-color: var(--bg-color);
  padding: 1.5rem; border-radius: 6px;
  border: 1px solid var(--border-color);
  margin-bottom: 1.5rem; text-align: left;
  font-size: 0.95rem; line-height: 1.6;
  color: var(--text-color);
}
[data-theme="dark"] .review-summary {
  background-color: var(--input-bg-color); /* Slightly different from card bg for contrast */
}
.review-summary p { margin-bottom: 0.5rem; }
.review-summary strong { font-weight: 600; color: var(--primary-color); }
.review-summary ul { list-style: disc; padding-left: 1.5rem; margin-top: 0.5rem; }
.review-summary ul li { margin-bottom: 0.25rem; }
.empty-review-text {
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.8;
  padding: 1rem;
  background-color: var(--bg-color);
  border-radius: 6px;
  border: 1px dashed var(--border-color);
}
[data-theme="dark"] .empty-review-text {
  background-color: var(--input-bg-color);
}
</style>