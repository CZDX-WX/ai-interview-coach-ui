<template>
  <div class="problem-list-table-wrapper">
    <div class="table-controls">
      <div class="search-input-wrapper-table">
        <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
        <input
            type="text"
            :value="searchTerm"
            @input="$emit('update:searchTerm', ($event.target as HTMLInputElement).value)"
            placeholder="按题号、标题或标签搜索题目..."
            class="search-input-table"
        />
      </div>
      <div class="main-filter-tabs">
        <button
            v-for="tab in mainTabs" :key="tab.id"
            :class="['filter-tab-button', {active: activeTab === tab.id}]"
            @click="$emit('update:activeTab', tab.id)">
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div class="table-responsive-container">
      <table class="problem-table">
        <thead>
        <tr>
          <th class="status-col">状态</th>
          <th class="title-col">题目标题</th>
          <th class="difficulty-col">难度</th>
          <th class="acceptance-col">通过率</th>
          <th class="frequency-col">频率</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="problem in problems" :key="problem.id" class="problem-row">
          <td data-label="状态" class="status-col">
          </td>
          <td data-label="题目标题" class="title-col">
            <router-link
                :to="{ name: 'ProblemSolveView', params: { problemId: problem.id } }"
                class="problem-title-link"
            >
              {{ problem.id }}. {{ problem.title }}
            </router-link>
            <div v-if="problem.topics && problem.topics.length" class="topic-tags">
              <span v-for="topic in problem.topics" :key="topic" class="topic-tag">{{ topic }}</span>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { Problem, UserProblemStatus } from '@/types/practiceTypes';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

type ProblemWithStatus = Problem & Partial<UserProblemStatus>;

const props = defineProps<{
  problems: ProblemWithStatus[];
  searchTerm: string;
  activeTab: 'all' | 'mySubmissions' | 'favorites';
}>();

const emit = defineEmits<{
  (e: 'toggle-favorite', problemId: string): void;
  (e: 'update:searchTerm', value: string): void;
  (e: 'update:activeTab', value: 'all' | 'mySubmissions' | 'favorites'): void;
  (e: 'navigate-to-problem', problemId: string): void; // New event
}>();

const mainTabs = [
  { id: 'all', label: '全部题目' },
  { id: 'mySubmissions', label: '我的提交' },
  { id: 'favorites', label: '我的收藏' },
] as const; // 关键修复在这里

// const navigateToProblem = (problemId: string) => {
//   // Placeholder for navigation. In a real app, this would go to a problem solving page.
//   // For now, we can emit an event if parent needs to handle it, or just log.
//   console.log(`导航到题目详情页: ${problemId}`);
//   emit('navigate-to-problem', problemId);
//   // router.push({ name: 'ProblemSolveView', params: { problemId } }); // Example if route exists
// };
</script>

<style scoped>
.problem-list-table-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* 搜索/筛选标签和表格之间的间距 */
}

.table-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 0.5rem; /* 与表格的间距 */
}
@media (min-width: 768px) {
  .table-controls {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.search-input-wrapper-table { /* 与筛选栏中的搜索框样式类似 */
  display: flex;
  align-items: center;
  background-color: var(--input-bg-color);
  border-radius: 6px;
  border: 1px solid var(--border-color);
  padding-left: 0.75rem;
  flex-grow: 1; /* 让搜索框占据更多空间 */
  max-width: 400px; /* 限制搜索框最大宽度 */
}
[data-theme="dark"] .search-input-wrapper-table { background-color: #293038; border-color: #3c4753; }
.search-icon { color: var(--placeholder-color); font-size: 1rem; }
[data-theme="dark"] .search-icon { color: #9daab8; }
.search-input-table {
  flex-grow: 1; background: none; border: none; outline: none;
  padding: 0.75rem; font-size: 0.9rem; color: var(--text-color);
}
[data-theme="dark"] .search-input-table { color: #ffffff; }
.search-input-table::placeholder { color: var(--placeholder-color); }
[data-theme="dark"] .search-input-table::placeholder { color: #9daab8; }

.main-filter-tabs { /* 顶部标签页，如 All, My Submissions */
  display: flex;
  gap: 0.5rem; /* 标签之间的间距 */
  /* border-bottom: 2px solid var(--border-color); */ /* 从原型图借鉴 */
  /* margin-bottom: 1rem; */
}
.filter-tab-button {
  padding: 0.6rem 1rem; /* 内边距 */
  font-size: 0.9rem; /* text-sm font-bold */
  font-weight: 500; /* medium */
  color: var(--text-color-muted); /* text-[#9daab8] */
  background: none;
  border: none;
  border-bottom: 3px solid transparent; /* 未选中状态的下边框 */
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease;
}
.filter-tab-button:hover {
  color: var(--text-color);
}
[data-theme="dark"] .filter-tab-button:hover {
  color: #ffffff;
}
.filter-tab-button.active {
  color: var(--text-color); /* text-white in prototype */
  border-bottom-color: var(--primary-color); /* border-b-white in prototype, use primary color */
  font-weight: bold;
}
[data-theme="dark"] .filter-tab-button.active { color: #ffffff; border-bottom-color: var(--primary-color); }


.table-responsive-container {
  overflow-x: auto; /* 允许表格水平滚动 */
  border: 1px solid var(--border-color); /* border-[#3c4753] */
  border-radius: 8px; /* rounded-lg */
  background-color: var(--card-bg-color); /* bg-[#111418] in prototype, use card for consistency */
}
[data-theme="dark"] .table-responsive-container {
  background-color: #111418; /* 原型中的表格背景 */
  border-color: #3c4753;
}

.problem-table {
  width: 100%;
  min-width: 800px; /* 确保在小屏幕上出现滚动条而不是内容压缩 */
  border-collapse: collapse;
}
.problem-table th, .problem-table td {
  padding: 0.85rem 1rem; /* px-4 py-3, adjusted */
  text-align: left;
  font-size: 0.875rem; /* text-sm */
  line-height: 1.4;
}
.problem-table thead tr {
  background-color: var(--input-bg-color); /* bg-[#1c2126] from prototype header */
  border-bottom: 1px solid var(--border-color); /* Ensure header has a bottom border */
}
[data-theme="dark"] .problem-table thead tr { background-color: #1c2126; }

.problem-table th {
  color: var(--text-color); /* text-white */
  font-weight: 500; /* font-medium */
  white-space: nowrap;
}
[data-theme="dark"] .problem-table th { color: #ffffff; }

.problem-table tbody tr {
  border-top: 1px solid var(--border-color); /* border-t-[#3c4753] */
  transition: background-color 0.15s ease;
}
.problem-table tbody tr.problem-row:hover {
  background-color: color-mix(in srgb, var(--primary-color) 8%, var(--card-bg-color) 92%);
  cursor: pointer;
}
[data-theme="dark"] .problem-table tbody tr.problem-row:hover {
  background-color: #293038; /* 原型图中的悬停/选中背景 */
}


.status-col { width: 80px; text-align: center; }
.title-col { width: 40%; min-width: 250px; }
.difficulty-col, .acceptance-col, .frequency-col { width: 100px; text-align: center; }
[data-theme="dark"] .problem-table td { color: #e0e0e7; } /* 浅色文字 */
.problem-table td.title-col { color: var(--text-color); font-weight: 500; } /* 题目标题稍突出 */
[data-theme="dark"] .problem-table td.title-col { color: #ffffff; }

.status-icons { display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
.status-icon, .favorite-icon { font-size: 1rem; cursor: pointer; }
.status-icon.solved { color: #28a745; } /* Green */
[data-theme="dark"] .status-icon.solved { color: #38a169; }
.status-icon.attempted { color: #ffc107; } /* Yellow */
[data-theme="dark"] .status-icon.attempted { color: #d69e2e; }
.status-icon.todo { color: var(--text-color-muted); }
[data-theme="dark"] .status-icon.todo { color: #6b7280; }

.favorite-icon { color: var(--text-color-muted); transition: color 0.2s ease, transform 0.2s ease; }
.favorite-icon.favorited { color: #ef4444; } /* Red for favorited */
[data-theme="dark"] .favorite-icon.favorited { color: #f87171; }
.favorite-icon:hover { transform: scale(1.2); }


.topic-tags { margin-top: 0.25rem; display: flex; flex-wrap: wrap; gap: 0.3rem; }
.topic-tag {
  background-color: var(--border-color);
  color: var(--text-color-muted);
  font-size: 0.7rem;
  padding: 0.15rem 0.4rem;
  border-radius: 0.25rem;
}
[data-theme="dark"] .topic-tag { background-color: #374151; color: #9ca3af; }


.difficulty-badge {
  padding: 0.25em 0.6em;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-block;
  min-width: 50px;
  text-align: center;
  color: white; /* Default for most badges */
}
.difficulty-badge.简单 { background-color: #28a745; }
[data-theme="dark"] .difficulty-badge.简单 { background-color: #38a169; }
.difficulty-badge.中等 { background-color: #ffc107; color: #212529; }
[data-theme="dark"] .difficulty-badge.中等 { background-color: #d69e2e; color: #1a1d21;}
.difficulty-badge.困难 { background-color: #dc3545; }
[data-theme="dark"] .difficulty-badge.困难 { background-color: #e53e3e; }

.acceptance-col, .frequency-col {
  font-size: 0.85rem;
  color: var(--text-color);
  opacity: 0.9;
}
[data-theme="dark"] .acceptance-col, [data-theme="dark"] .frequency-col {
  color: #adb5bd;
}

.frequency-bar-container {
  width: 88px; /* from prototype */
  height: 0.5rem; /* h-1 from prototype is 0.25rem, made slightly thicker */
  background-color: var(--border-color); /* bg-[#3c4753] */
  border-radius: 2px; /* rounded-sm */
  overflow: hidden;
  margin: 0 auto; /* Center the bar */
}
[data-theme="dark"] .frequency-bar-container { background-color: #3c4753; }

.frequency-bar {
  height: 100%;
  background-color: var(--primary-color); /* bg-white in prototype, use primary for accent */
  border-radius: 2px;
}
[data-theme="dark"] .frequency-bar { background-color: #ffffff; } /* White bar on dark bg */
.problem-title-link {
  color: var(--text-color); /* 继承 td 的颜色 */
  text-decoration: none;
  font-weight: 500; /* 保持与之前 title-col 的一致性 */
  display: inline-block; /* 避免链接撑满整个单元格背景 */
}
[data-theme="dark"] .problem-title-link {
  color: #ffffff;
}
.problem-title-link:hover {
  color: var(--primary-color);
  text-decoration: underline;
}
</style>