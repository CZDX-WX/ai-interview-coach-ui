<template>
  <div class="filters-and-search-bar">
    <div class="filter-controls-grid">
      <div class="filter-group">
        <label for="job-field-filter-comp">职位领域：</label>
        <select
            id="job-field-filter-comp"
            :value="selectedJobField"
            @change="emitJobFieldUpdate(($event.target as HTMLSelectElement).value)"
            class="form-input select-input"
        >
          <option :value="null">所有领域</option>
          <option v-for="field in availableJobFields" :key="field.value" :value="field.value">
            {{ field.label }} </option>
        </select>
      </div>

      <div class="filter-group">
        <label for="experience-level-filter-comp">经验水平：</label>
        <select
            id="experience-level-filter-comp"
            :value="selectedExperienceLevel"
            @change="emitExperienceLevelUpdate(($event.target as HTMLSelectElement).value)"
            class="form-input select-input"
        >
          <option :value="null">所有级别</option>
          <option v-for="level in availableExperienceLevels" :key="level.value" :value="level.value">
            {{ level.label }} </option>
        </select>
      </div>
    </div>

    <div class="search-input-wrapper">
      <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
      <input
          type="text"
          :value="searchTerm"
          @input="emitSearchTermUpdate(($event.target as HTMLInputElement).value)"
          placeholder="搜索职位名称、技能关键词..."
          class="search-input"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

interface SelectOption {
  value: string;
  label: string;
}

defineProps<{
  availableJobFields: SelectOption[];
  availableExperienceLevels: SelectOption[];
  selectedJobField: string | null;
  selectedExperienceLevel: string | null;
  searchTerm: string;
}>();

const emit = defineEmits<{
  (e: 'update:selectedJobField', value: string | null): void;
  (e: 'update:selectedExperienceLevel', value: string | null): void;
  (e: 'update:searchTerm', value: string): void;
}>();

const emitJobFieldUpdate = (value: string) => {
  emit('update:selectedJobField', value === "" ? null : value);
}
const emitExperienceLevelUpdate = (value: string) => {
  emit('update:selectedExperienceLevel', value === "" ? null : value);
}
const emitSearchTermUpdate = (value: string) => {
  emit('update:searchTerm', value);
}
</script>

<style scoped>
.filters-and-search-bar {
  display: flex;
  flex-direction: column; /* Stack filter controls and search bar vertically on small screens */
  gap: 1.25rem; /* 增加间距 */
  margin-bottom: 2.5rem; /* 与下方内容区域的间距 */
  padding: 1.25rem;
  background-color: var(--card-bg-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.filter-controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); /* 响应式列 */
  gap: 1.25rem; /* 筛选器之间的间距 */
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem; /* 标签和选择框的间距 */
}
.filter-group label {
  font-size: 0.875rem; /* 减小标签字号 */
  font-weight: 500;
  color: var(--text-color);
  opacity: 0.9;
}
[data-theme="dark"] .filter-group label {
  color: #e0e0e7;
}

.form-input.select-input {
  /* 这些样式应由全局 .form-input 和 .select-input 提供 */
  /* 确保它们使用了正确的CSS变量，如 --input-bg-color, --input-border-color 等 */
  width: 100%;
  padding: 0.75rem 1rem; /* 调整内边距 */
  font-size: 0.9rem; /* 调整字体大小 */
  background-color: var(--input-bg-color);
  border: 1px solid var(--input-border-color);
  border-radius: 6px;
  color: var(--text-color);
  background-image: var(--select-button-svg);
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.25em;
  appearance: none; -webkit-appearance: none; -moz-appearance: none;
  padding-right: 2.5rem;
  line-height: 1.5;
}
[data-theme="dark"] .form-input.select-input {
  /* 特定暗色主题覆盖（如果全局变量不足以区分） */
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background-color: var(--input-bg-color); /* 搜索框背景 */
  border-radius: 6px;
  border: 1px solid var(--input-border-color);
  padding-left: 0.75rem;
  /* flex: 1; /* 如果希望搜索框在某一行中占据更多空间 */
}
[data-theme="dark"] .search-input-wrapper {
  background-color: #2c3035; /* 原型图中的暗色搜索框背景 */
  border-color: #40474f;
}
.search-icon {
  color: var(--placeholder-color);
  font-size: 1rem; /* 调整图标大小 */
}
[data-theme="dark"] .search-icon { color: #a2aab3; }

.search-input {
  flex-grow: 1; background: none; border: none; outline: none;
  padding: 0.75rem; font-size: 0.95rem; color: var(--text-color);
}
[data-theme="dark"] .search-input { color: #ffffff; }
.search-input::placeholder { color: var(--placeholder-color); }
[data-theme="dark"] .search-input::placeholder { color: #a2aab3; }

/* 在较大屏幕上，可以将筛选器和搜索栏放在一行 */
@media (min-width: 768px) {
  .filters-and-search-bar {
    flex-direction: row;
    align-items: flex-end; /* 对齐底部，如果标签在上方 */
  }
  .filter-controls-grid {
    flex-grow: 2; /* 让筛选器占据更多空间 */
    grid-template-columns: repeat(2, 1fr); /* 保持两列 */
  }
  .search-input-wrapper {
    flex-grow: 1; /* 搜索框占据剩余空间 */
    min-width: 250px; /* 搜索框最小宽度 */
  }
}
</style>