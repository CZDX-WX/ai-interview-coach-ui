<template>
  <aside class="tech-practice-sidebar">
    <PracticeProgressSummary />

    <div class="sidebar-card">
      <h3 class="sub-section-title">
        <font-awesome-icon :icon="['fas', 'tasks']" />
        条件设置
      </h3>

      <div class="form-group">
        <label>目标岗位</label>
        <div class="selection-list-flat">
          <div v-if="!hasRoles" class="placeholder-text">正在加载岗位...</div>
          <div v-for="(roleList, categoryName) in roles" :key="categoryName" class="selection-group">
            <h4 class="selection-group-title">{{ categoryName }}</h4>
            <div class="chips-wrapper">
              <button
                  v-for="role in roleList" :key="role.id"
                  :class="['chip-button', { active: store.filters.roleId === role.id }]"
                  @click="selectRole(role.id)">
                {{ role.name }}
              </button>
            </div>
          </div>
          <button class="add-new-chip-button" @click="addCustomRole">
            <font-awesome-icon :icon="['fas', 'plus']" />
            添加自定义岗位
          </button>
        </div>
      </div>

      <transition name="slide-fade">
        <div v-if="store.filters.roleId" class="form-group">
          <label>技术标签 (可多选)</label>
          <div class="tag-cloud-container">
            <p v-if="tags.length === 0 && !isLoading" class="placeholder-text">该岗位下暂无可用标签</p>
            <div v-else class="tag-cloud">
              <button v-for="tag in publicTags" :key="tag.id"
                      :class="['tag-note', { active: store.filters.tagIds.includes(tag.id) }]" @click="toggleTag(tag.id)">
                {{ tag.name }}
              </button>
              <button v-for="tag in userTags" :key="tag.id"
                      :class="['tag-note', 'private', { active: store.filters.tagIds.includes(tag.id) }]" @click="toggleTag(tag.id)">
                <font-awesome-icon :icon="['fas', 'user-tag']"/> {{ tag.name }}
              </button>
              <button class="tag-note add-tag-button" @click="addCustomTag" title="创建自定义标签">
                <font-awesome-icon :icon="['fas', 'plus']" />
              </button>
            </div>
          </div>
        </div>
      </transition>

      <div class="form-group">
        <label>标签匹配逻辑</label>
        <div class="segmented-control">
          <button :class="{active: store.filters.searchMode === 'ANY_TAG'}" @click="store.updateFilter('searchMode', 'ANY_TAG')">满足任一</button>
          <button :class="{active: store.filters.searchMode === 'ALL_TAGS'}" @click="store.updateFilter('searchMode', 'ALL_TAGS')">满足所有</button>
        </div>
      </div>

      <div class="form-group">
        <label for="difficulty-select">题目难度</label>
        <select
            id="difficulty-select"
            :value="store.filters.difficulty"
            @change="store.updateFilter('difficulty', ($event.target as HTMLSelectElement).value as any)"
            class="form-input select-input"
        >
          <option value="all">全部</option>
          <option value="简单">简单</option>
          <option value="中等">中等</option>
          <option value="困难">困难</option>
        </select>
      </div>
    </div>

    <div class="sidebar-card action-area">
      <h3 class="sub-section-title">
        <font-awesome-icon :icon="['fas', 'wand-magic-sparkles']" />
        AI 生成
      </h3>
      <div class="action-buttons">
        <button @click="emit('open-generate-modal', false)" class="form-button primary-button" :disabled="isLoading || store.filters.tagIds.length === 0 || !store.filters.roleId">
          <font-awesome-icon :icon="['fas', 'lightbulb']" /> 生成专属题目
        </button>
        <button v-if="isAdmin" @click="emit('open-generate-modal', true)" class="form-button danger-button" :disabled="isLoading">
          <font-awesome-icon :icon="['fas', 'cogs']" /> 填充公共题库
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useTechPracticeStore } from '@/stores/techPracticeStore';
import { useAuthStore } from '../../stores/auth';
import type { Role, Tag } from '@/types/techPracticeTypes';
import type { PersonalizedGenerationRequest } from '../../types/apiTypes';
import PracticeProgressSummary from './PracticeProgressSummary.vue';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  roles: Record<string, Role[]>;
  tags: Tag[];
  isLoading: boolean;
  isAdmin: boolean;
}>();

const emit = defineEmits<{
  (e: 'open-generate-modal', isAdminAction: boolean): void;
}>();

const store = useTechPracticeStore();

const selectedRoleCategory = ref<string | null>(null);

const hasRoles = computed(() => Object.keys(props.roles).length > 0);

const availableRoles = computed(() => {
  return selectedRoleCategory.value ? props.roles[selectedRoleCategory.value] || [] : [];
});

const publicTags = computed(() => props.tags.filter(tag => tag.ownerId === null));
const userTags = computed(() => props.tags.filter(tag => tag.ownerId !== null));

// 监听从父组件传入的 roles 属性，并在其首次加载时，默认展开第一个岗位大类
watch(() => props.roles, (newRoles) => {
  if (newRoles && Object.keys(newRoles).length > 0 && !selectedRoleCategory.value) {
    selectedRoleCategory.value = Object.keys(newRoles)[0];
  }
}, { immediate: true });


// 点击岗位大类标题时的处理函数
const selectRoleCategory = (categoryName: string) => {
  // 如果重复点击同一个大类，则折叠/展开它
  if (selectedRoleCategory.value === categoryName) {
    selectedRoleCategory.value = null;
  } else {
    selectedRoleCategory.value = categoryName;
  }
};

// 选择一个具体岗位时的处理函数
const selectRole = (roleId: number) => {
  const currentId = store.filters.roleId;
  const newRoleId = currentId === roleId ? null : roleId; // 再次点击可取消选择

  store.updateFilter('roleId', newRoleId);
  store.updateFilter('tagIds', []); // 切换岗位时，重置已选标签

  if (newRoleId) {
    store.fetchTags(newRoleId); // 为新选择的岗位获取标签
  } else {
    store.tags = []; // 如果取消选择岗位，则清空标签列表
  }
};

// 切换标签选中状态的函数
const toggleTag = (tagId: number) => {
  const newTagIds = [...store.filters.tagIds];
  const index = newTagIds.indexOf(tagId);
  if (index > -1) {
    newTagIds.splice(index, 1);
  } else {
    newTagIds.push(tagId);
  }
  store.updateFilter('tagIds', newTagIds);
};

// “添加自定义”按钮的占位函数
const addCustomRole = () => { alert('创建自定义岗位功能正在开发中...'); };
const addCustomTag = () => { alert('创建自定义标签功能正在开发中...'); };
</script>

<style scoped>
.tech-practice-sidebar {
  width: 100%;
  padding: 0;
  background-color: transparent;
  border: none;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: fit-content;
  position: sticky;
  top: calc(3.8rem + 2rem);
}
.sidebar-card {
  width: 100%;
  padding: 1.5rem;
  background-color: var(--card-bg-color);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}
.action-area {
  padding-top: 1rem;
}

.sub-section-title, .section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
[data-theme="dark"] .sub-section-title, [data-theme="dark"] .section-title { color: #e0e0e7; }
.sub-section-title {
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}
.section-description { font-size: 0.85rem; color: var(--text-color-muted); line-height: 1.5; }

.form-group { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.75rem; }
.form-group:last-child { margin-bottom: 0; }
.form-group label { font-size: 0.9rem; font-weight: 500; color: var(--text-color); }
[data-theme="dark"] .form-group label { color: #e0e0e7; }
/* .form-input, .select-input 依赖全局样式 */

/* 岗位选择 */
.selection-list-flat { padding: 5px 0; }
.selection-group:not(:last-child) { margin-bottom: 1.25rem; }
.selection-group-title {
  font-size: 0.8rem; font-weight: bold; color: var(--text-color-muted);
  text-transform: uppercase; letter-spacing: 0.05em;
  margin-bottom: 0.75rem; padding-bottom: 0.5rem;
  border-bottom: 1px dashed var(--border-color);
}
.chips-wrapper { display: flex; flex-wrap: wrap; gap: 0.6rem; }
.chip-button {
  padding: 0.5rem 1rem; border-radius: 6px; border: 1px solid var(--border-color);
  background-color: var(--card-bg-color); color: var(--text-color);
  font-size: 0.9rem; cursor: pointer; transition: all 0.2s ease;
}
.chip-button:hover { border-color: var(--primary-color); }
.chip-button.active { background-color: var(--primary-color); color: white; border-color: var(--primary-color); }
.add-new-chip-button {
  width: 100%; border: 1px dashed var(--border-color); background: transparent; color: var(--text-color-muted);
  margin-top: 0.75rem; padding: 0.6rem; border-radius: 6px; cursor: pointer;
  transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
}
.add-new-chip-button:hover { color: var(--primary-color); border-color: var(--primary-color); }

/* 便利贴标签样式 */
.tag-selection-container { max-height: 200px; overflow-y: auto; }
.tags-placeholder { font-size: 0.9rem; text-align: center; color: var(--text-color-muted); padding: 1rem 0; }
.tag-cloud { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; padding-top: 4px; }
.tag-note {
  padding: 0.5rem 0.8rem; font-family: 'Noto Sans SC', sans-serif;
  font-size: 0.85rem;
  /* **核心修正**: 使用CSS变量 */
  background-color: #fffbeB; /* 模仿便利贴的淡黄色 */
  color: #374151;
  border: 1px solid #fde68a;
  box-shadow: 1px 1px 3px rgba(0,0,0,0.1);
  cursor: pointer; transition: all 0.2s ease;
  transform: rotate(-1.5deg);
}
[data-theme="dark"] .tag-note {
  background-color: #4a4a28;
  color: #fefce8;
  border-color: #ca8a04;
}

.tag-note.private {
  background-color: #f0fdf4;
  border-color: #a7f3d0;
  transform: rotate(1.5deg);
}
[data-theme="dark"] .tag-note.private {
  background-color: #164e33;
  color: #dcfce7;
  border-color: #34d399;
}

.tag-note:hover { transform: rotate(0deg) scale(1.05); }
.tag-note.active {
  transform: rotate(0deg) scale(1.05);
  box-shadow: 0 0 10px var(--primary-color);
  border: 2px solid var(--primary-color);
  font-weight: 600;
}
.private-tag-icon { margin-right: 0.3em; }
.add-tag-button {
  display: flex; justify-content: center; align-items: center;
  width: 32px; height: 32px; padding: 0;
  border-radius: 50%; border-style: dashed; transform: rotate(0);
  background-color: transparent; border-color: var(--border-color); color: var(--text-color-muted);
}
.add-tag-button:hover { border-color: var(--primary-color); color: var(--primary-color); }


/* 分段控制器样式 */
.segmented-control {
  display: flex;
  background-color: var(--bg-color);
  border-radius: 8px;
  padding: 4px;
  border: 1px solid var(--border-color);
}
.segmented-control button {
  flex: 1; padding: 0.6rem; font-size: 0.85rem; font-weight: 500;
  border: none; background-color: transparent; color: var(--text-color-muted);
  border-radius: 6px; cursor: pointer; transition: all 0.2s ease;
}
.segmented-control button.active {
  background-color: var(--primary-color);
  color: white;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

.options-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; }

.action-buttons {
  display: flex; flex-direction: column; gap: 0.75rem;
}
.action-buttons .form-button { width: 100%; }
</style>