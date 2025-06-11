<template>
  <section class="report-section overall-summary-section">
    <h2 class="section-title visually-hidden">总体摘要</h2>
    <div class="summary-card-layout">
      <div class="overall-score-display" :class="getScoreColorClass(overallScore)"><p class="score-value">
        {{ overallScore }}<span>/100</span></p>
        <p class="score-label">综合得分</p>
      </div>
      <p class="summary-text-content">{{ summaryText }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  overallScore: number;
  summaryText: string;
}>();
const getScoreColorClass = (score: number): string => {
  if (score >= 75) return 'score-display-good';
  if (score >= 50) return 'score-display-average';
  return 'score-display-needs-improvement';
};
</script>

<style scoped>
.report-section { /* 通用 section 卡片样式 */
  background-color: var(--card-bg-color);
  padding: 1.5rem 2rem;
  border-radius: 8px;
  margin-bottom: 2rem; /* 与下一个 section 的间距 */
  border: 1px solid var(--border-color);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

[data-theme="dark"] .report-section {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
}

.section-title { /* 通用 section 标题样式 */
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

[data-theme="dark"] .section-title {
  color: #ffffff;
}

.visually-hidden { /* 用于辅助功能的隐藏 */
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.summary-card-layout {
  display: flex;
  align-items: center; /* 垂直居中得分和文字 */
  gap: 2rem;
  flex-wrap: wrap; /* 在小屏幕上换行 */
}

.overall-score-display {
  background-color: var(--primary-color);
  color: white; /* 确保文字在主色背景上可见 */
  padding: 1.25rem 1.5rem; /* 调整内边距 */
  border-radius: 8px;
  text-align: center;
  min-width: 160px; /* 保持最小宽度 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.score-value {
  font-size: 2.8rem; /* 增大字号 */
  font-weight: 700;
  line-height: 1;
}

.score-value span {
  font-size: 1rem;
  opacity: 0.8;
  font-weight: 500;
  margin-left: 0.2em;
}

.score-label {
  font-size: 0.9rem;
  margin-top: 0.35rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-text-content {
  flex: 1;
  font-size: 1rem;
  line-height: 1.7; /* 增加行高以提高可读性 */
  min-width: 250px; /* 确保文本区域有足够宽度 */
  color: var(--text-color);
  opacity: 0.9;
}

[data-theme="dark"] .summary-text-content {
  color: #e0e0e7;
}
.overall-score-display {
  /* ... 现有样式 (padding, border-radius, text-align, min-width, box-shadow) ... */
  /* 移除固定的 background-color 和 color，让类来控制 */
  /* background-color: var(--primary-color); */ /* REMOVE or make it a fallback */
  /* color: white; */ /* REMOVE or make it a fallback */
  transition: background-color 0.3s ease, color 0.3s ease; /* 添加过渡效果 */
}

.score-display-good {
  background-color: #28a745; /* 绿色 */
  color: white;
}
[data-theme="dark"] .score-display-good {
  background-color: #38a169;
  color: white;
}

.score-display-average {
  background-color: #ffc107; /* 黄色 */
  color: #212529; /* 深色文字确保对比度 */
}
[data-theme="dark"] .score-display-average {
  background-color: #d69e2e;
  color: #1a1d21; /* 深色文字 */
}

.score-display-needs-improvement {
  background-color: #dc3545; /* 红色 */
  color: white;
}
[data-theme="dark"] .score-display-needs-improvement {
  background-color: #e53e3e;
  color: white;
}

</style>