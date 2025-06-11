<template>
  <div class="key-moments-content">
    <div v-if="!keyMomentsData || keyMomentsData.length === 0" class="empty-content-message">
      <p>本次面试未记录特定的关键时刻。</p>
    </div>
    <div v-else>
      <div v-for="(moment, index) in keyMomentsData" :key="index" class="key-moment-item" :class="{ positive: moment.isPositive, improvement: !moment.isPositive && moment.suggestion }">
        <div class="moment-icon-wrapper">
          <font-awesome-icon :icon="moment.isPositive ? ['fas', 'thumbs-up'] : (moment.suggestion ? ['fas', 'lightbulb'] : ['fas', 'info-circle'])" />
        </div>
        <div class="moment-details">
          <p class="moment-timestamp">{{ moment.timestampDisplay }}</p>
          <p class="moment-observation">{{ moment.observation }}</p>
          <p v-if="moment.suggestion" class="moment-suggestion">
            <font-awesome-icon :icon="['fas', 'arrow-right']" /> <strong>建议：</strong> {{ moment.suggestion }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { KeyMoment } from '@/types/reportTypes'; // 确保路径正确
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

defineProps<{
  keyMomentsData: KeyMoment[];
}>();
</script>

<style scoped>
.key-moments-content {
  /* 容器样式 */
}
.empty-content-message { /* ... (同 ReportPhaseBreakdownContent.vue) ... */ }

.key-moment-item {
  display: flex;
  gap: 1.25rem; /* 增加图标和文字的间距 */
  padding: 1.25rem; /* 增加内边距 */
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-color);
  border-radius: 6px;
  margin-bottom: 1rem; /* 卡片间距 */
  border-left: 4px solid transparent; /* 默认无左边框颜色 */
}
.key-moment-item:last-child { border-bottom: none; margin-bottom: 0; }

.key-moment-item.positive { border-left-color: #28a745; }
[data-theme="dark"] .key-moment-item.positive { border-left-color: #68d391; }

.key-moment-item.improvement { border-left-color: #ffc107; } /* 黄色用于建议 */
[data-theme="dark"] .key-moment-item.improvement { border-left-color: #e6a700; }

.moment-icon-wrapper {
  font-size: 1.5rem; /* 增大图标 */
  padding-top: 0.1rem; /* 微调垂直对齐 */
  flex-shrink: 0;
  width: 30px; /* 固定宽度以便对齐 */
  text-align: center;
}
.key-moment-item.positive .moment-icon-wrapper { color: #28a745; }
[data-theme="dark"] .key-moment-item.positive .moment-icon-wrapper { color: #68d391; }
.key-moment-item.improvement .moment-icon-wrapper { color: #ffc107; }
[data-theme="dark"] .key-moment-item.improvement .moment-icon-wrapper { color: #e6a700; }
/* Default/neutral icon color */
.key-moment-item:not(.positive):not(.improvement) .moment-icon-wrapper { color: var(--text-color-muted); }


.moment-details {
  flex-grow: 1;
}
.moment-timestamp {
  font-size: 0.85rem; /* 调整大小 */
  opacity: 0.75;
  margin-bottom: 0.35rem;
  font-weight: 500;
  color: var(--text-color);
}
[data-theme="dark"] .moment-timestamp { color: #a2aab3; }

.moment-observation {
  font-size: 0.95rem;
  margin-bottom: 0.5rem; /* 调整间距 */
  line-height: 1.6;
  color: var(--text-color);
}
[data-theme="dark"] .moment-observation { color: #e0e0e7; }

.moment-suggestion {
  font-size: 0.9rem;
  opacity: 0.9;
  line-height: 1.6;
  background-color: var(--card-bg-color); /* 给建议一个轻微的背景 */
  padding: 0.75rem;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  color: var(--text-color);
}
[data-theme="dark"] .moment-suggestion {
  background-color: color-mix(in srgb, var(--bg-color) 50%, var(--card-bg-color) 50%);
  color: #d1d5db;
}
.moment-suggestion strong {
  font-weight: 500;
  color: var(--primary-color);
  margin-right: 0.25em;
}
.moment-suggestion .fa-icon {
  margin-right: 0.4em;
  font-size: 0.9em;
  opacity: 0.8;
}
</style>