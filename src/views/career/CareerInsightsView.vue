<template>
  <div class="career-insights-view">
    <CareerInsightsHeader
        title="职业与技能洞察"
        subtitle="探索不同职位角色，了解其技能需求与行业趋势，助力您的职业规划与学习。"
        icon="compass"
    />

    <CareerFilters
        :availableJobFields="setupStore.availableJobFields"
        :availableExperienceLevels="setupStore.availableExperienceLevels"
        v-model:selectedJobField="insightsStore.selectedJobFieldFilter"
        v-model:selectedExperienceLevel="insightsStore.selectedExperienceLevelFilter"
        v-model:searchTerm="insightsStore.searchTerm"
    />
    <div v-if="insightsStore.isLoading" class="loading-state">
      <div class="spinner"><div></div><div></div><div></div><div></div></div>
      <p>正在加载职业信息...</p>
    </div>

    <div v-else-if="insightsStore.filteredJobRoleProfiles.length === 0 && !insightsStore.isLoading" class="empty-state">
      <font-awesome-icon :icon="['fas', 'folder-open']" class="empty-icon"/>
      <p>未能根据您的筛选找到相关的职位信息。请尝试调整筛选条件。</p>
    </div>

    <div v-else class="roles-grid original-grid-style">
      <div v-for="role in insightsStore.filteredJobRoleProfiles" :key="role.id" class="role-card original-card-style" @click="toggleRoleExpansion(role.id)">
        <div class="card-header">
          <h3 class="card-title">{{ role.title }}</h3> <font-awesome-icon :icon="expandedRoleId === role.id ? ['fas', 'chevron-up'] : ['fas', 'chevron-down']" class="expand-icon"/>
        </div>
        <p class="card-description-summary">{{ truncateText(role.description, 150) }}</p> <div class="card-tags">
        <span class="tag job-field-tag">{{ setupStore.availableJobFields.find(f=>f.value === role.jobField)?.label }}</span>
        <span class="tag level-tag">{{ setupStore.availableExperienceLevels.find(l=>l.value === role.experienceLevel)?.label }}</span>
      </div>

        <transition name="expand">
          <div v-if="expandedRoleId === role.id" class="role-details-expanded original-details-style">
            <h4>职位概览：</h4>
            <p>{{ role.description }}</p>

            <h4>主要职责：</h4>
            <ul><li v-for="(resp, i) in role.responsibilities" :key="`resp-${i}`">{{ resp }}</li></ul>

            <h4>技术技能：</h4>
            <ul class="skills-list"><li v-for="skill in role.technicalSkills" :key="skill.name" class="skill-item tech">
              <strong>{{ skill.name }}</strong> <span v-if="skill.importance" class="importance-badge {{ skill.importance.toLowerCase() }}">{{ skill.importance }}</span>
              <p v-if="skill.description" class="skill-desc">{{ skill.description }}</p>
            </li></ul>

            <h4>软技能：</h4>
            <ul class="skills-list"><li v-for="skill in role.softSkills" :key="skill.name" class="skill-item soft">
              <strong>{{ skill.name }}</strong> <span v-if="skill.importance" class="importance-badge {{ skill.importance.toLowerCase() }}">{{ skill.importance }}</span>
              <p v-if="skill.description" class="skill-desc">{{ skill.description }}</p>
            </li></ul>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'; // Removed local selectedJobField, selectedLevel, searchTermInput
import { useCareerInsightsStore } from '@/stores/careerInsightsStore';
import { useInterviewSetupStore } from '@/stores/interviewSetup';
import CareerInsightsHeader from '../../components/career/CareerInsightsHeader.vue'; // 新组件
import CareerFilters from '../../components/career/CareerFilters.vue';             // 新组件
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const insightsStore = useCareerInsightsStore();
const setupStore = useInterviewSetupStore(); // For filter options

const expandedRoleId = ref<string | null>(null); // 逻辑保留在父组件

// // 本地筛选状态移至 store, 这里不再需要本地 ref
// const selectedJobField = ref<string | null>(insightsStore.selectedJobFieldFilter);
// const selectedLevel = ref<string | null>(insightsStore.selectedExperienceLevelFilter);
// const searchTermInput = ref(insightsStore.searchTerm);

// // Watchers for local filters to update store - 现在通过 v-model 直接绑定到 store state
// watch(selectedJobField, (val) => insightsStore.setJobFieldFilter(val));
// watch(selectedLevel, (val) => insightsStore.setExperienceLevelFilter(val));

// // Debounced search - CareerFilters 组件内部可以处理自己的 input 事件，然后 emit 'update:searchTerm'
// let searchDebounceTimer: number;
// const updateSearchTermInStore = (term: string) => {
//   clearTimeout(searchDebounceTimer);
//   searchDebounceTimer = window.setTimeout(() => {
//     insightsStore.setSearchTerm(term);
//   }, 300);
// };
// watch(searchTermInput, (val) => updateSearchTermInStore(val));


const toggleRoleExpansion = (roleId: string) => {
  if (expandedRoleId.value === roleId) {
    expandedRoleId.value = null;
  } else {
    expandedRoleId.value = roleId;
  }
};

const truncateText = (text: string, length: number) => {
  return text.length > length ? text.substring(0, length) + '...' : text;
};

onMounted(() => {
  // 初始化时，CareerFilters 组件会使用 store 中已有的筛选条件
  if (insightsStore.jobRoleProfiles.length === 0) {
    insightsStore.fetchJobRoleProfiles();
  }
});
</script>

<style scoped>
.career-insights-view {
  padding: 1.5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  color: var(--text-color);
}

/* 临时保留旧的样式，直到所有部分都被新组件替代 */
.original-grid-style {
  display: grid;
  grid-template-columns: 1fr; /* 默认为单列 */
  gap: 1.5rem;
}
.original-card-style {
  background-color: var(--card-bg-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  padding: 1.25rem 1.5rem;
  transition: box-shadow 0.2s ease;
  cursor: pointer;
}
.original-card-style:hover {
  box-shadow: 0 5px 15px rgba(0,0,0,0.07);
}
[data-theme="dark"] .original-card-style:hover {
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  border-color: var(--primary-color);
}
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.card-title { font-size: 1.25rem; font-weight: 600; color: var(--primary-color); }
.expand-icon { font-size: 1rem; color: var(--text-color); opacity: 0.7; }
.card-description-summary { font-size: 0.9rem; color: var(--text-color); opacity: 0.85; line-height: 1.5; margin-bottom: 1rem; }
[data-theme="dark"] .card-description-summary { color: #c0c5cb; }
.card-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem; }
.tag { font-size: 0.75rem; font-weight: 500; padding: 0.25rem 0.6rem; border-radius: 0.25rem; background-color: var(--border-color); color: var(--text-color); opacity: 0.9; }
.job-field-tag { background-color: color-mix(in srgb, var(--primary-color) 20%, transparent); color: var(--primary-color); }
.level-tag { background-color: color-mix(in srgb, var(--secondary-color) 20%, transparent); color: var(--secondary-color); }

.original-details-style { /* Styles for expanded details */
  margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);
  font-size: 0.9rem; line-height: 1.6;
}
.original-details-style h4 { font-size: 1.05rem; font-weight: 600; color: var(--text-color); margin-top: 1.25rem; margin-bottom: 0.6rem; }
[data-theme="dark"] .original-details-style h4 { color: #e8e8e8; }
.original-details-style p { margin-bottom: 0.75rem; opacity: 0.9; }
.original-details-style ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 0.75rem; }
.original-details-style ul li { margin-bottom: 0.3rem; }
.skills-list .skill-item { margin-bottom: 0.5rem; padding: 0.5rem 0.75rem; background-color: var(--bg-color); border-radius: 4px; border-left: 3px solid var(--primary-color); }
[data-theme="dark"] .skills-list .skill-item { background-color: #23272b; }
.skill-item strong { font-weight: 500; }
.skill-item .importance-badge { font-size: 0.7rem; font-weight: bold; padding: 0.15rem 0.4rem; border-radius: 0.25rem; margin-left: 0.5rem; text-transform: uppercase; color: white; }
.importance-badge.high { background-color: #dc3545; }
.importance-badge.medium { background-color: #ffc107; color: #333;}
.importance-badge.low { background-color: #28a745; }
[data-theme="dark"] .importance-badge.medium { background-color: #e6a700; color: #111; }
.skill-desc { font-size: 0.8rem; opacity: 0.7; margin-left: 0.25rem; margin-top: 0.15rem; }
.learning-links li a { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--primary-color); text-decoration: none; font-size: 0.9rem; }
.learning-links li a:hover { text-decoration: underline; }
.learning-links li .fa-icon { font-size: 0.9em; }
.learning-links li em { font-size: 0.8em; opacity: 0.7; }
.learning-links .resource-type-badge { font-size: 0.7rem; background-color: var(--border-color); padding: 0.1rem 0.3rem; border-radius: 0.25rem; margin-left: 0.3rem; text-transform: capitalize; opacity: 0.8; }
.expand-enter-active, .expand-leave-active { transition: all 0.3s ease-out; max-height: 1000px; opacity: 1; }
.expand-enter-from, .expand-leave-to { max-height: 0; opacity: 0; margin-top: 0; padding-top: 0; overflow: hidden; }

.loading-state, .empty-state { /* ... (Same as LearningResourcesView) ... */ }
.spinner { /* ... (same spinner CSS) ... */ }

</style>