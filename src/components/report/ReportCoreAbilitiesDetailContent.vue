<template>
  <div class="core-abilities-detail-content">
    <div v-if="!coreAbilitiesData || coreAbilitiesData.length === 0" class="empty-content-message">
      <p>核心能力评估数据正在生成中或不可用。</p>
    </div>
    <div v-else class="abilities-grid">
      <div v-for="ability in coreAbilitiesData" :key="ability.id" class="ability-detail-item">
        <div class="ability-header">
          <h4 class="ability-name">{{ ability.name }}</h4>
          <span class="ability-score-badge" :class="getScoreColorClass(ability.score)">
            {{ ability.score }}/100
          </span>
        </div>
        <p v-if="ability.description" class="ability-description">{{ ability.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CoreAbilityScore } from '../../types/reportTypes'; // 确保路径正确

const props = defineProps<{
  coreAbilitiesData: CoreAbilityScore[];
}>();

const getScoreColorClass = (score: number): string => {
  if (score >= 75) {
    return 'score-good'; // 绿色 - 优秀
  } else if (score >= 50) {
    return 'score-average'; // 黄色 - 一般
  } else {
    return 'score-needs-improvement'; // 红色 - 待改进
  }
};
</script>

<style scoped>
.core-abilities-detail-content {
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

.abilities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.ability-detail-item {
  padding: 1.25rem;
  background-color: var(--bg-color); /* 卡片内部背景，可能与 section 背景不同 */
  border-radius: 6px;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 4px rgba(0,0,0,0.04);
  display: flex; /* 新增，为了让描述填满剩余空间 */
  flex-direction: column; /* 新增 */
  height: 100%; /* 新增，让卡片等高 */
}
[data-theme="dark"] .ability-detail-item {
  background-color: color-mix(in srgb, var(--card-bg-color) 90%, black 5%);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.ability-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.ability-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  flex-grow: 1; /* 让名称占据更多空间 */
  padding-right: 0.5rem; /* 与分数徽章的间距 */
}
[data-theme="dark"] .ability-name {
  color: #e0e0e7;
}

.ability-score-badge {
  font-size: 0.85rem; /* 统一徽章字体大小 */
  font-weight: bold;
  padding: 0.35em 0.8em; /* 调整内边距 */
  border-radius: 0.3em; /* 统一圆角 */
  color: white; /* 默认白色文字，具体颜色由背景决定 */
  flex-shrink: 0; /* 防止徽章被压缩 */
  line-height: 1; /* 确保文字垂直居中 */
  text-align: center;
  min-width: 60px; /* 给徽章一个最小宽度 */
}

/* 分数颜色定义 */
.ability-score-badge.score-good {
  background-color: #28a745; /* 绿色 (优秀) */
  color: white;
}
[data-theme="dark"] .ability-score-badge.score-good {
  background-color: #38a169; /* 暗色主题下的绿色 */
  color: white;
}

.ability-score-badge.score-average {
  background-color: #ffc107; /* 黄色 (一般) */
  color: #212529; /* 黄色背景通常搭配深色文字 */
}
[data-theme="dark"] .ability-score-badge.score-average {
  background-color: #d69e2e; /* 暗色主题下的黄色 */
  color: #f7fafc; /* 暗色主题下黄色搭配浅色文字 */
}

.ability-score-badge.score-needs-improvement {
  background-color: #dc3545; /* 红色 (待改进) */
  color: white;
}
[data-theme="dark"] .ability-score-badge.score-needs-improvement {
  background-color: #e53e3e; /* 暗色主题下的红色 */
  color: white;
}

.ability-description {
  font-size: 0.9rem;
  opacity: 0.85;
  line-height: 1.6;
  color: var(--text-color);
  flex-grow: 1; /* 新增，让描述填满剩余垂直空间 */
}
[data-theme="dark"] .ability-description {
  opacity: 0.75;
  color: #c0c5cb;
}
</style>