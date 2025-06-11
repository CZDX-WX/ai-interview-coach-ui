<template>
  <div class="phase-breakdown-content">
    <div v-if="!phaseBreakdownData || phaseBreakdownData.length === 0" class="empty-content-message">
      <p>当前面试未包含可分析的阶段表现数据。</p>
    </div>
    <div v-else>
      <div v-for="phase in phaseBreakdownData" :key="phase.phaseId" class="phase-card">
        <h3 class="phase-name">
          {{ phase.phaseName }}
          <span v-if="phase.overallPhaseScore" class="phase-score-badge" :class="getScoreColorClass(phase.overallPhaseScore)"> {{ phase.overallPhaseScore }}/100
      </span>
        </h3>
        <div class="phase-metrics-grid">
          <div v-for="metric in phase.metrics" :key="metric.name" class="metric-item">
            <p class="metric-name">{{ metric.name }}：
              <span class="metric-score" :class="getScoreColorClass(metric.score)">{{ metric.score }}/100</span> </p>
            <p class="metric-feedback">{{ metric.feedback }}</p>
          </div>
        </div>
        <div v-if="phase.strengths?.length" class="strengths-list">
          <strong><font-awesome-icon :icon="['fas', 'check-circle']" /> 表现亮点：</strong>
          <ul><li v-for="strength in phase.strengths" :key="strength">{{ strength }}</li></ul>
        </div>
        <div v-if="phase.areasForImprovement?.length" class="improvements-list">
          <strong><font-awesome-icon :icon="['fas', 'exclamation-circle']" /> 待改进：</strong>
          <ul><li v-for="area in phase.areasForImprovement" :key="area">{{ area }}</li></ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PhaseBreakdown } from '@/types/reportTypes'; // 确保路径正确
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

defineProps<{
  phaseBreakdownData: PhaseBreakdown[];
}>();
const getScoreColorClass = (score: number): string => { // Same as in ReportCoreAbilitiesDetailContent
  if (score >= 75) return 'score-good';
  if (score >= 50) return 'score-average';
  return 'score-needs-improvement';
};
</script>

<style scoped>
.phase-breakdown-content {
  /* 容器样式 */
}
.empty-content-message {
  text-align: center;
  padding: 2rem;
  font-style: italic;
  opacity: 0.7;
  background-color: var(--bg-color);
  border-radius: 6px;
}

.phase-card {
  background-color: var(--bg-color);
  padding: 1.25rem;
  border-radius: 6px;
  margin-bottom: 1.5rem; /* 卡片间距 */
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 5px rgba(0,0,0,0.03);
}
[data-theme="dark"] .phase-card {
  background-color: color-mix(in srgb, var(--card-bg-color) 90%, black 5%); /* 比tab content背景稍亮 */
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
.phase-card:last-child {
  margin-bottom: 0;
}

.phase-name {
  font-size: 1.2rem; font-weight: 600; margin-bottom: 1rem;
  color: var(--primary-color); display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 0.5rem; border-bottom: 1px dashed var(--border-color);
}
.phase-score-badge {
  font-size: 0.8rem; font-weight: 500; /* normal -> 500 */
  background-color: var(--primary-color);
  color: white; padding: 0.25em 0.7em; /* 调整内边距 */
  border-radius: 1em;
}

.phase-metrics-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem; margin-bottom: 1rem;
}
.metric-item {
  background-color: var(--card-bg-color); /* 使用卡片背景色 */
  padding: 0.85rem 1rem; /* 调整内边距 */
  border-radius: 4px;
  border-left: 4px solid var(--primary-color); /* 强调条 */
}
.metric-name { font-weight: 500; font-size: 0.95rem; margin-bottom: 0.35rem; color: var(--text-color); }
[data-theme="dark"] .metric-name { color: #e0e0e7;}
.metric-score { font-weight: bold; color: var(--primary-color); }
.metric-feedback { font-size: 0.875rem; opacity: 0.85; line-height: 1.5; color: var(--text-color); }
[data-theme="dark"] .metric-feedback { opacity: 0.75; }

.strengths-list, .improvements-list { margin-top: 1rem; padding-top: 0.75rem; border-top: 1px dotted var(--border-color); }
.strengths-list strong, .improvements-list strong {
  font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem;
  margin-bottom: 0.5rem; color: var(--text-color);
}
[data-theme="dark"] .strengths-list strong, [data-theme="dark"] .improvements-list strong {
  color: #e0e0e7;
}
.strengths-list ul, .improvements-list ul { list-style-type: none; /* 移除默认圆点 */ padding-left: 0; font-size: 0.9rem; opacity: 0.9;}
.strengths-list li, .improvements-list li {
  padding: 0.25rem 0 0.25rem 1.5rem; /* 左侧留出图标空间 */
  position: relative;
  line-height: 1.5;
}
.strengths-list li::before, .improvements-list li::before { /* 自定义列表符号 */
  font-family: "Font Awesome 5 Free"; /* 确保 Font Awesome 已加载 */
  font-weight: 900; /* Solid icons */
  position: absolute;
  left: 0;
  top: 0.35em; /* 调整垂直对齐 */
}

.strengths-list li { color: #28a745; }
.strengths-list li::before { content: "\f058"; /* fa-check-circle */ color: #28a745; }
[data-theme="dark"] .strengths-list li { color: #68d391; }
[data-theme="dark"] .strengths-list li::before { color: #68d391; }

.improvements-list li { color: #e53e3e; }
.improvements-list li::before { content: "\f06a"; /* fa-exclamation-circle */ color: #e53e3e; }
[data-theme="dark"] .improvements-list li { color: #fc8181; }
[data-theme="dark"] .improvements-list li::before { color: #fc8181; }

/* Add/reuse score color classes, similar to ReportCoreAbilitiesDetailContent.vue */
/* These might be better as global utility classes if used in multiple report components */
.phase-score-badge, .metric-score { /* Common styling for score displays */
  font-weight: bold;
  padding: 0.2em 0.5em; /* Slightly smaller padding for metric scores */
  border-radius: 0.25em;
  color: white; /* Default, will be overridden by specific color classes if needed */
  line-height: 1;
  font-size: 0.9em; /* For metric-score, relative to metric-name */
}
.phase-score-badge { /* Specific for the larger phase score badge */
  font-size: 0.8rem; /* Original size */
  padding: 0.25em 0.7em;
  line-height: initial;
}


.score-good { background-color: #28a745; color: white; }
[data-theme="dark"] .score-good { background-color: #38a169; color: white; }

.score-average { background-color: #ffc107; color: #212529; }
[data-theme="dark"] .score-average { background-color: #d69e2e; color: #f7fafc; }

.score-needs-improvement { background-color: #dc3545; color: white; }
[data-theme="dark"] .score-needs-improvement { background-color: #e53e3e; color: white; }

.metric-name .metric-score { /* Ensure metric score is inline with metric name but still styled */
  display: inline-block;
  margin-left: 0.25em;
}
</style>