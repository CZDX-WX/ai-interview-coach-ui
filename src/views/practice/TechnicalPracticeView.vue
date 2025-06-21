<template>
  <div class="page-container">
    <header class="page-header">
      <h1>技术知识练习</h1>
      <p>筛选公共题库进行练习，或使用右侧的工具生成您的专属题目。</p>
    </header>

    <div class="practice-layout">
      <main class="main-content-panel">
        <div class="filter-controls">
          <div class="status-tabs">
            <button v-for="tab in proficiencyTabs" :key="tab.id"
                    :class="['filter-tab', { active: activeProficiencyFilter === tab.id }]"
                    @click="handleProficiencyFilterChange(tab.id)">
              <font-awesome-icon :icon="tab.icon" />
              <span>{{ tab.label }}</span>
            </button>
          </div>
          <label class="bookmark-toggle" title="仅显示已收藏的题目">
            <input type="checkbox" v-model="showOnlyBookmarked" />
            <font-awesome-icon :icon="['fas', 'star']" />
            <span>仅显示收藏</span>
          </label>
        </div>

        <div v-if="store.isLoading && store.questionList.length === 0" class="loading-state-small">
          <div class="spinner"></div><p>{{ loadingText }}</p>
        </div>

        <div v-else-if="filteredQuestions.length > 0" class="question-list">
          <TechQuestionItem
              v-for="(item, index) in filteredQuestions" :key="item.id"
              :question="item"
              :index="index"
              :is-answer-visible="activeQuestionId === item.id"
              @toggle-answer="toggleAnswer(item.id)"
              @update-status="status => handleUpdateStatus(item.id, status)"
              @toggle-bookmark="handleToggleBookmark(item.id)"
              @reset-status="handleResetStatus(item.id)"
          />
        </div>

        <div v-else class="initial-prompt-area">
          <font-awesome-icon :icon="['fas', 'search']" class="empty-icon"/>
          <p>当前筛选条件下没有题目，请尝试调整筛选条件。</p>
        </div>

        <div class="pagination-controls" v-if="!store.isLoading && store.pagination.pages > 1">
          <button @click="changePage(store.pagination.current - 1)" :disabled="store.pagination.current === 1" class="pagination-button">
            <font-awesome-icon :icon="['fas', 'chevron-left']" /> 上一页
          </button>
          <span class="page-info">第 {{ store.pagination.current }} 页 / 共 {{ store.pagination.pages }} 页</span>
          <button @click="changePage(store.pagination.current + 1)" :disabled="store.pagination.current >= store.pagination.pages" class="pagination-button">
            下一页 <font-awesome-icon :icon="['fas', 'chevron-right']" />
          </button>
        </div>
      </main>

      <aside class="sidebar-panel">
        <TechPracticeSidebar
            :roles="store.roles"
            :tags="store.tags"
            :is-loading="store.isLoading"
            :is-admin="authStore.isAdmin"
            @search="triggerSearch"
            @open-generate-modal="handleOpenGenerateModal"
        />
      </aside>
    </div>

    <div class="async-task-tracker" v-if="activeTasks.length > 0">
    </div>

    <GenerationOptionsModal
        :is-open="showGenerationModal"
        :is-loading="store.isLoading"
        :selected-role-name="selectedRoleForModal?.name"
        :selected-tags="selectedTagsForModal.map(t => t.name)"
        :selected-difficulty="selectedDifficultyForModal"
        :selected-strategy-text="selectedStrategyTextForModal"
        @close="showGenerationModal = false"
        @confirm="handleConfirmGeneration"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useTechPracticeStore } from '@/stores/techPracticeStore';
import { useAuthStore } from '@/stores/auth';
import type { TechQuestion, Tag } from '@/types/techPracticeTypes';
import type { PersonalizedGenerationRequest } from '@/types/apiTypes';
import TechPracticeSidebar from '../../components/practice/TechPracticeSidebar.vue';
import TechQuestionItem from '../../components/practice/TechQuestionItem.vue';
import GenerationOptionsModal from '../../components/practice/GenerationOptionsModal.vue';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// --- 类型定义 ---
type ProficiencyFilter = 'ALL' | 'NOT_PRACTICED' | 'NEEDS_REVIEW' | 'MASTERED';
interface StatusTab {
  id: ProficiencyFilter;
  label: string;
  icon: string[];
}

// --- Store 实例 ---
const store = useTechPracticeStore();
const authStore = useAuthStore();

// --- 本地 UI 状态 ---
const loadingText = ref('正在加载题库...');
const activeQuestionId = ref<string | null>(null);
const activeProficiencyFilter = ref<ProficiencyFilter>('ALL');
const showOnlyBookmarked = ref(false);
const showGenerationModal = ref(false);
const isAdminAction = ref(false);

const proficiencyTabs = ref<StatusTab[]>([
  { id: 'ALL', label: '全部题目', icon: ['fas', 'list-ul'] },
  { id: 'NOT_PRACTICED', label: '未学习', icon: ['far', 'circle'] },
  { id: 'NEEDS_REVIEW', label: '待复习', icon: ['fas', 'book-reader'] },
  { id: 'MASTERED', label: '已掌握', icon: ['fas', 'check-double'] },
]);

// --- 计算属性 ---

// **核心**: 纯前端的组合筛选逻辑
const filteredQuestions = computed(() => {
  return store.questionList.filter(q => {
    if (!q) return false;
    const bookmarkMatch = !showOnlyBookmarked.value || q.isBookmarked;
    const proficiencyMatch = activeProficiencyFilter.value === 'ALL' || q.proficiencyStatus === activeProficiencyFilter.value;
    return bookmarkMatch && proficiencyMatch;
  });
});

// 计算属性，用于向模态框传递确认信息
const selectedRoleForModal = computed(() => Object.values(store.roles).flat().find(r => r.id === store.filters.roleId));
const selectedTagsForModal = computed(() => store.filters.tagIds.map(id => store.tags.find(t => t.id === id)).filter(Boolean) as Tag[]);
const selectedDifficultyForModal = computed(() => store.filters.difficulty === 'all' ? '全部' : store.filters.difficulty);
const selectedStrategyTextForModal = computed(() => store.filters.searchMode === 'ANY_TAG' ? '任意标签匹配' : '所有标签均匹配');

const isFilterActive = computed(() => activeProficiencyFilter.value !== 'ALL' || showOnlyBookmarked.value);
const activeTasks = computed(() => store.activeAsyncTasks);

// --- 事件处理器与方法 ---

const handleProficiencyFilterChange = (statusId: ProficiencyFilter) => {
  activeProficiencyFilter.value = statusId;
};

let searchDebounceTimer: number;
const triggerSearch = () => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = window.setTimeout(() => {
    loadingText.value = '正在按条件搜索题目...';
    store.searchQuestions();
  }, 300);
};

const handleOpenGenerateModal = (isPopulate: boolean) => {
  if (!store.filters.roleId || store.filters.tagIds.length === 0) {
    alert("请先选择目标岗位和至少一个技术标签。");
    return;
  }
  isAdminAction.value = isPopulate;
  showGenerationModal.value = true;
};

const handleConfirmGeneration = (modalOptions: { count: number; }) => {
  showGenerationModal.value = false;
  const payload: PersonalizedGenerationRequest = {
    roleId: store.filters.roleId!,
    roleName: selectedRoleForModal.value?.name || '',
    tags: selectedTagsForModal.value.map(t => t.name),
    difficulty: store.filters.difficulty === 'all' ? '中等' : store.filters.difficulty,
    numQuestions: modalOptions.count,
    strategy: store.filters.searchMode === 'ANY_TAG' ? 'BREADTH_COVERAGE' : 'INTEGRATED_DEEP_DIVE',
  };
  if (isAdminAction.value) { store.startPublicGeneration(payload); }
  else { store.startPersonalizedGeneration(payload); }
};

const toggleAnswer = (questionId: string) => {
  activeQuestionId.value = activeQuestionId.value === questionId ? null : questionId;
};

const changePage = (pageNumber: number) => {
  loadingText.value = '正在加载题目...';
  store.searchQuestions(pageNumber);
};

// **核心修正点**: 确保所有来自子组件的事件都有对应的处理函数
const handleUpdateStatus = (questionId: string, status: 'NEEDS_REVIEW' | 'MASTERED') => {
  console.log(`[View] 接收到 @update-status 事件: qId=${questionId}, status=${status}`);
  store.updateQuestionStatus(questionId, status);
};
const handleResetStatus = (questionId: string) => {
  console.log(`[View] 接收到 @reset-status 事件: qId=${questionId}`);
  store.resetQuestionStatus(questionId);
};
const handleToggleBookmark = (questionId: string) => {
  console.log(`[View] 接收到 @toggle-bookmark 事件: qId=${questionId}`);
  store.toggleQuestionBookmark(questionId);
};

// --- 生命周期与侦听器 ---
onMounted(() => {
  store.searchQuestions();
  store.fetchRoles();
  store.fetchProgressStats();
});

watch(() => store.filters, triggerSearch, { deep: true });
</script>

<style scoped>
.page-container {
  max-width: 1400px; margin: 0 auto; padding: 2rem 2.5rem;
}
.page-header { margin-bottom: 2rem; }
.page-header h1 { font-size: 2.25rem; font-weight: 700; color: var(--text-color); }
[data-theme="dark"] .page-header h1 { color: #ffffff; }
.page-header p { font-size: 1.1rem; color: var(--text-color-muted); margin-top: 0.5rem; max-width: 700px; }

.practice-layout {
  display: grid; grid-template-columns: 1fr 340px;
  gap: 2rem; align-items: flex-start;
}
@media (max-width: 1024px) {
  .practice-layout { grid-template-columns: 1fr; }
  .sidebar-panel { grid-row-start: 1; margin-bottom: 2rem; }
}

.main-content-panel { display: flex; flex-direction: column; gap: 1.5rem; }
.sidebar-panel { width: 100%; flex-shrink: 0; }

.filter-controls {
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 1.5rem; padding: 1rem;
  background-color: var(--card-bg-color); border-radius: 8px;
}
[data-theme="dark"] .filter-controls { background-color: #1c2126; border: 1px solid #3c4753;}

.status-tabs { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.filter-tab {
  padding: 0.5rem 1rem; font-size: 0.85rem; font-weight: 500;
  color: var(--text-color-muted); background-color: var(--bg-color);
  border: 1px solid var(--border-color); border-radius: 20px;
  cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem;
  transition: all 0.2s ease;
}
.filter-tab:hover { border-color: var(--primary-color); color: var(--primary-color); }
.filter-tab.active { background-color: var(--primary-color); border-color: var(--primary-color); color: white; }
[data-theme="dark"] .filter-tab { background-color: #2c3035; border-color: #40474f; color: #9daab8; }
[data-theme="dark"] .filter-tab:hover { background-color: #374151; }

.bookmark-toggle {
  display: flex; align-items: center; gap: 0.5rem; cursor: pointer;
  font-size: 0.9rem; font-weight: 500; color: var(--text-color-muted);
  padding: 0.5rem 1rem; border-radius: 20px; transition: all 0.2s ease;
  border: 1px solid transparent;
}
.bookmark-toggle:hover { background-color: var(--border-color); }
.bookmark-toggle input[type="checkbox"] { width: 1.1em; height: 1.1em; accent-color: #f6ad55; cursor: pointer; }
.bookmark-toggle .fa-star { color: #f6ad55; }

.question-list { display: flex; flex-direction: column; gap: 1.5rem; }
.loading-state-small, .initial-prompt-area {
  padding: 4rem 2rem; text-align: center; border-radius: 12px;
  color: var(--text-color-muted);
}
.loading-state-small { display: flex; align-items: center; justify-content: center; gap: 1rem; background-color: var(--card-bg-color); }
.initial-prompt-area { border: 2px dashed var(--border-color); line-height: 1.7; }
.initial-prompt-area .empty-icon { font-size: 2.5rem; margin-bottom: 1rem; color: var(--primary-color); opacity: 0.6; }

.pagination-controls { /* ... */ }

.async-task-tracker {
  position: fixed; bottom: 1.5rem; right: 1.5rem;
  display: flex; flex-direction: column; gap: 1rem; z-index: 1100;
}
.task-item {
  background-color: var(--card-bg-color); padding: 1rem 1.25rem; border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid var(--border-color);
  width: 320px; display: flex; flex-direction: column; gap: 0.5rem;
}
.task-header { display: flex; align-items: center; gap: 0.75rem; }
.task-message { font-size: 0.9rem; font-weight: 500; flex-grow: 1; color: var(--text-color); }
[data-theme="dark"] .task-message { color: #ffffff; }
.task-progress-bar { width: 100%; height: 8px; background-color: var(--border-color); border-radius: 4px; overflow: hidden; position: relative; }
.task-progress-fill { height: 100%; background-color: var(--primary-color); border-radius: 4px; transition: width 0.3s ease; }
.task-progress-bar span {
  position: absolute; right: 6px; top: 50%;
  transform: translateY(-50%);
  font-size: 0.65rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 2px rgba(0,0,0,0.7);
}
</style>