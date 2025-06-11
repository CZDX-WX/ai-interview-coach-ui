<template>
  <div class="phase-progress-container">
    <div class="phase-info">
      <span class="phase-name-display">
        阶段 {{ currentPhaseIndex + 1 }}/{{ totalPhases }}: {{ currentPhaseName }}
      </span>
      <span v-if="subQuestionCounterText" class="sub-question-counter">
        {{ subQuestionCounterText }}
      </span>
      <span class="estimated-time" v-if="estimatedTime">预估：{{ estimatedTime }}</span>
    </div>
    <div class="progress-bar-outer">
      <div class="progress-bar-inner" :style="{ width: progressPercentage + '%' }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  currentPhaseName: string;
  currentPhaseIndex: number;
  totalPhases: number;
  progressPercentage: number;
  estimatedTime?: string;
  subQuestionCounterText?: string; // 例如: "(问题 1/5)" 或 "(编程题 1/2)"
}>();
</script>

<style scoped>
.phase-progress-container {
  background-color: var(--card-bg-color);
  padding: 1rem 1.25rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  margin-bottom: 0;
}

.phase-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem; /* 调整间距 */
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-color);
}
[data-theme="dark"] .phase-info {
  color: #e0e0e0;
}
.phase-name-display {
  font-weight: 600;
}
.sub-question-counter {
  font-size: 0.8em; /* 相对于 .phase-info 的字体大小 */
  opacity: 0.8;
  margin: 0 0.5em; /* 左右留出一些空间 */
  background-color: var(--border-color);
  padding: 0.1em 0.4em;
  border-radius: 3px;
}
.estimated-time {
  opacity: 0.7;
  font-size: 0.85rem; /* 调整大小 */
}

.progress-bar-outer {
  width: 100%;
  height: 0.6rem; /* 调整进度条高度 */
  background-color: #3c4753; /* 来自原型图的暗色进度条背景 */
  border-radius: 0.3rem;
  overflow: hidden;
}
.progress-bar-inner {
  height: 100%;
  background-color: #e0e0e0; /* 来自原型图的亮色进度条填充 (白色) */
  border-radius: 0.3rem;
  transition: width 0.3s ease;
}
/* 如果希望进度条颜色也使用主题变量 */
/* [data-theme="dark"] .progress-bar-inner { background-color: var(--primary-color); } */
/* [data-theme="light"] .progress-bar-inner { background-color: var(--primary-color); } */

</style>