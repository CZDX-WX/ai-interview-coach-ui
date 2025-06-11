<template>
  <aside class="problem-filters-sidebar">
    <h2 class="filters-title">筛选与排序</h2>

    <div class="filter-section">
      <label for="difficulty-filter" class="filter-label">难度</label>
      <select id="difficulty-filter" :value="filters.difficulty" @change="updateFilter('difficulty', $event)" class="form-input select-input-dark">
        <option value="all">全部难度</option>
        <option value="简单">简单</option>
        <option value="中等">中等</option>
        <option value="困难">困难</option>
      </select>
    </div>

    <div class="filter-section">
      <label for="status-filter" class="filter-label">状态</label>
      <select id="status-filter" :value="filters.status" @change="updateFilter('status', $event)" class="form-input select-input-dark">
        <option value="all">全部状态</option>
        <option value="未开始">未开始</option>
        <option value="已尝试">已尝试</option>
        <option value="已解决">已解决</option>
      </select>
    </div>

    <div class="filter-section">
      <label for="topic-filter" class="filter-label">标签/主题</label>
      <select id="topic-filter" :value="filters.topic" @change="updateFilter('topic', $event)" class="form-input select-input-dark">
        <option value="all">所有主题</option>
        <option v-for="topic in availableTopics" :key="topic" :value="topic">{{ topic }}</option>
      </select>
    </div>

    <div class="filter-section">
      <label for="sort-by-filter" class="filter-label">排序方式</label>
      <select id="sort-by-filter" :value="filters.sortBy" @change="updateFilter('sortBy', $event)" class="form-input select-input-dark">
        <option value="default">默认排序</option>
        <option value="difficultyAsc">难度 (从易到难)</option>
        <option value="difficultyDesc">难度 (从难到易)</option>
        <option value="frequencyDesc">频率 (由高到低)</option>
      </select>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { PracticeFilterState } from '@/types/practiceTypes';

const props = defineProps<{
  filters: PracticeFilterState;
  availableTopics: string[];
}>();

const emit = defineEmits<{
  (e: 'update-filter', key: keyof PracticeFilterState, value: string): void;
}>();

const updateFilter = (key: keyof PracticeFilterState, event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit('update-filter', key, target.value);
};
</script>

<style scoped>
.problem-filters-sidebar {
  width: 100%; /* Will be constrained by parent's fixed width */
  padding: 1.5rem;
  background-color: var(--card-bg-color); /* 与原型图一致的暗色背景 */
  border-radius: 8px;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* 筛选区块之间的间距 */
  height: fit-content; /* 高度自适应内容，或设置为可滚动 */
  position: sticky; /* 如果希望筛选栏在滚动时固定 */
  top: calc(3.8rem + 1.5rem); /* DefaultLayout header height + parent padding-top */
}
[data-theme="dark"] .problem-filters-sidebar {
  background-color: #1c2126; /* 原型图右侧栏背景色 */
  border-color: #3c4753;
}


.filters-title {
  font-size: 1.25rem; /* text-[22px] from prototype */
  font-weight: bold;
  color: var(--text-color);
  padding-bottom: 0.75rem;
  margin-bottom: 0.5rem; /* 与第一个筛选器的间距 */
  border-bottom: 1px solid var(--border-color);
}
[data-theme="dark"] .filters-title { color: #ffffff; border-bottom-color: #3c4753; }

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.filter-label {
  font-size: 0.9rem; /* text-base from prototype */
  font-weight: 500; /* font-medium */
  color: var(--text-color);
}
[data-theme="dark"] .filter-label { color: #ffffff; }

.form-input.select-input-dark {
  /* 确保这些样式能正确应用深色主题 */
  width: 100%;
  padding: 0.75rem 1rem; /* h-14 p-[15px] is quite large, adjusted */
  font-size: 0.9rem;
  background-color: var(--input-bg-color); /* bg-[#1c2126] from prototype */
  border: 1px solid var(--border-color); /* border-[#3c4753] */
  border-radius: 6px; /* rounded-lg */
  color: var(--text-color); /* text-white */
  background-image: var(--select-button-svg); /* Defined in main.css */
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.25em;
  appearance: none; -webkit-appearance: none; -moz-appearance: none;
  padding-right: 2.5rem; /* Space for arrow */
  line-height: 1.5;
}
[data-theme="dark"] .form-input.select-input-dark {
  background-color: #1c2126;
  border-color: #3c4753;
  color: #ffffff;
}
.form-input.select-input-dark:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color-translucent);
}
</style>