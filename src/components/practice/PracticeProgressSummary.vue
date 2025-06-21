<template>
  <div class="sidebar-card">
    <h3 class="sub-section-title">
      <font-awesome-icon :icon="['fas', 'chart-pie']" />
      我的练习统计
    </h3>
    <div v-if="stats" class="progress-content">
      <div class="progress-summary">
        <div class="progress-stat">
          <label>题目总数</label>
          <span>{{ stats.totalQuestions }}</span>
        </div>
        <div class="progress-stat mastered">
          <label>已掌握</label>
          <span>{{ stats.masteredCount }}</span>
        </div>
        <div class="progress-stat needs-review">
          <label>待复习</label>
          <span>{{ stats.needsReviewCount }}</span>
        </div>
      </div>
      <div class="progress-bar-wrapper" title="绿色: 已掌握, 黄色: 待复习">
        <div class="progress-bar-track">
          <div class="progress-bar-fill mastered" :style="{ width: masteredPercentage + '%' }"></div>
          <div class="progress-bar-fill needs-review" :style="{ width: needsReviewPercentage + '%' }"></div>
        </div>
      </div>
    </div>
    <div v-else class="loading-placeholder">
      正在加载统计数据...
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTechPracticeStore } from '@/stores/techPracticeStore';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const store = useTechPracticeStore();
const stats = computed(() => store.progressStats);

// **核心修改点 2**: 创建两个独立的百分比计算属性
const masteredPercentage = computed(() => {
  if (!stats.value || stats.value.totalQuestions === 0) return 0;
  return (stats.value.masteredCount / stats.value.totalQuestions) * 100;
});

const needsReviewPercentage = computed(() => {
  if (!stats.value || stats.value.totalQuestions === 0) return 0;
  return (stats.value.needsReviewCount / stats.value.totalQuestions) * 100;
});
</script>


<style scoped>
/* 这个组件的所有样式都封装在这里 */
.sidebar-card {
  width: 100%; padding: 1.25rem;
  background-color: var(--bg-color); border: 1px solid var(--border-color);
  border-radius: 8px;
}
[data-theme="dark"] .sidebar-card { background-color: #111418; }

.sub-section-title {
  font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem;
  display: flex; align-items: center; gap: 0.6rem;
}
[data-theme="dark"] .sub-section-title { color: #e0e0e7; }
.sub-section-title .fa-icon { color: var(--primary-color); }

.progress-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 三列均分 */
  text-align: center;
  margin-bottom: 1rem;
}
.progress-stat label { font-size: 0.8rem; color: var(--text-color-muted); }
.progress-stat span { font-size: 1.65rem; font-weight: 600; display: block; color: var(--text-color); }
[data-theme="dark"] .progress-stat span { color: #ffffff; }

/* 为不同状态的统计数字添加颜色 */
.progress-stat.mastered span { color: #28a745; }
.progress-stat.needs-review span { color: #ffc107; }
[data-theme="dark"] .progress-stat.mastered span { color: #48bb78; }
[data-theme="dark"] .progress-stat.needs-review span { color: #f6ad55; }


.progress-bar-wrapper {
  width: 100%;
}
.progress-bar-track {
  display: flex; /* 让内部的 fill 元素水平排列 */
  width: 100%;
  height: 10px; /* 稍微加粗 */
  background-color: var(--border-color);
  border-radius: 5px;
  overflow: hidden;
}
[data-theme="dark"] .progress-bar-track {
  background-color: #374151;
}
.progress-bar-fill {
  height: 100%;
  transition: width 0.4s ease-in-out;
}
/* **核心修改点 3**: 为不同状态的进度条分段设置颜色 */
.progress-bar-fill.mastered {
  background-color: #28a745;
}
.progress-bar-fill.needs-review {
  background-color: #ffc107;
}
[data-theme="dark"] .progress-bar-fill.mastered { background-color: #48bb78; }
[data-theme="dark"] .progress-bar-fill.needs-review { background-color: #f6ad55; }

.loading-placeholder {
  font-size: 0.9rem;
  color: var(--text-color-muted);
  text-align: center;
  padding: 2rem 0;
}
</style>