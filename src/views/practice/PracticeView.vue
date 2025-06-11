<template>
  <div class="practice-view">
    <div class="page-header-section"> <h1 class="page-title">
      <font-awesome-icon :icon="['fas', 'laptop-code']" class="title-icon" />
      技术与算法练习
    </h1>
      <p class="page-subtitle">
        在这里提升您的编程技能，从海量题库中选择题目进行练习。
      </p>
    </div>

    <div class="practice-layout">
      <div class="problem-list-main-panel">
        <ProblemListTable
            :problems="practiceStore.filteredAndSortedProblems"
            :search-term="practiceStore.filters.searchTerm"
            :active-tab="practiceStore.filters.activeTab"
            @update:searchTerm="term => practiceStore.updateFilter('searchTerm', term)"
            @update:activeTab="tab => practiceStore.updateFilter('activeTab', tab)"
            @toggle-favorite="practiceStore.toggleFavorite"
            @navigate-to-problem="handleNavigateToProblem"
        />
      </div>
      <div class="filters-sidebar-panel">
        <ProblemFilters
            :filters="practiceStore.filters"
            :available-topics="practiceStore.availableTopics"
            @update-filter="handleFilterUpdate"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { usePracticeStore } from '@/stores/practiceStore';
import type { PracticeFilterState } from '@/types/practiceTypes';
import ProblemListTable from '../../components/practice/ProblemListTable.vue';
import ProblemFilters from '../../components/practice/ProblemFilters.vue';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useRouter } from 'vue-router';

const practiceStore = usePracticeStore();
const router = useRouter();

onMounted(() => {
  if (practiceStore.allProblems.length === 0) { // Fetch only if not already loaded
    practiceStore.fetchProblemsAndStatus();
  }
});

const handleFilterUpdate = (key: keyof PracticeFilterState, value: any) => {
  practiceStore.updateFilter(key, value);
};

const handleNavigateToProblem = (problemId: string) => {
  // Placeholder: Navigate to the actual problem solving page
  // This page ('ProblemSolveView') is not yet implemented.
  // router.push({ name: 'ProblemSolveView', params: { problemId } });
  alert(`（模拟导航）前往题目详情页：${problemId}`);
};
</script>

<style scoped>
.practice-view {
  padding: 1.5rem 2rem; /* 页面整体内边距 */
  max-width: 1400px; /* 页面最大宽度 */
  margin: 0 auto;
  color: var(--text-color);
}
[data-theme="dark"] .practice-view {
  background-color: #111418; /* 原型图的深色背景 */
}

.page-header-section { /* 与其他页面头部风格一致 */
  margin-bottom: 1.5rem; /* 与下方布局的间距 */
  /* padding-bottom: 1.5rem; */ /* 如果不需要分割线，可以移除 */
  /* border-bottom: 1px solid var(--border-color); */
}
.page-title {
  font-size: 2rem; font-weight: 700; color: var(--text-color); margin-bottom: 0.5rem;
  display: flex; align-items: center; gap: 0.75rem;
}
[data-theme="dark"] .page-title { color: #ffffff; }
.page-title .title-icon { color: var(--primary-color); }
.page-subtitle {
  font-size: 1rem; color: var(--text-color); opacity: 0.8;
}
[data-theme="dark"] .page-subtitle { color: #a2aab3; }


.practice-layout {
  display: flex;
  flex-direction: row;
  gap: 1.5rem; /* 左侧题目列表和右侧筛选栏的间距 */
}

.problem-list-main-panel {
  flex-grow: 1; /* 占据主要宽度 */
  min-width: 0; /* For flexbox to shrink properly if needed */
}

.filters-sidebar-panel {
  width: 300px; /* 筛选栏固定宽度，原型图是 w-[360px] */
  flex-shrink: 0;
}

/* 响应式：在较小屏幕上，筛选栏可以移动到列表上方或隐藏到抽屉中 */
@media (max-width: 1024px) { /* 例如，在平板尺寸以下 */
  .practice-layout {
    flex-direction: column; /* 垂直堆叠 */
  }
  .filters-sidebar-panel {
    width: 100%; /* 筛选栏占满宽度 */
    /* position: static; /* 如果之前是 sticky */
    /* top: auto; */
  }
  .problem-filters-sidebar { /* 确保内部组件也响应 */
    position: static;
    top: auto;
  }
}
</style>