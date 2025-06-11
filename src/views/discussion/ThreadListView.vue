<template>
  <div class="thread-list-view">
    <div class="page-header-section">
      <div class="breadcrumbs">
        <router-link :to="{ name: 'DiscussionHomeView' }" class="breadcrumb-link">讨论区首页</router-link>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">{{ currentCategory?.name || '分类主题' }}</span>
      </div>
      <div class="header-content">
        <h1 class="page-title">
          <font-awesome-icon :icon="getForumCategoryIcon(props.categoryId)" class="title-icon" />
          {{ currentCategory?.name || '主题列表' }}
        </h1>
        <button v-if="authStore.isAuthenticated" @click="openCreateThreadModal" class="form-button primary-button create-thread-button">
          <font-awesome-icon :icon="['fas', 'plus-circle']" /> 发布新主题
        </button>
      </div>
      <p v-if="currentCategory?.description" class="page-subtitle">{{ currentCategory.description }}</p>
    </div>

    <div v-if="forumStore.isLoadingThreads" class="loading-state">
      <div class="spinner"><div></div><div></div><div></div><div></div></div>
      <p>正在加载主题列表...</p>
    </div>

    <div v-else-if="!forumStore.threadsForCategory || forumStore.threadsForCategory.content.length === 0" class="empty-state">
      <font-awesome-icon :icon="['fas', 'comments']" class="empty-icon"/>
      <p>此分类下暂无主题。</p>
      <p>成为第一个发起讨论的人吧！</p>
    </div>

    <div v-else class="threads-list-wrapper">
      <div class="thread-list-header">
        <div class="thread-title-header">主题 / 作者</div>
        <div class="thread-stats-header">回复/查看</div>
        <div class="thread-lastpost-header">最后回复</div>
      </div>
      <ThreadListItem
          v-for="thread in forumStore.threadsForCategory.content"
          :key="thread.id"
          :thread="thread"
      />
    </div>

    <div class="pagination-controls" v-if="forumStore.threadsForCategory && forumStore.threadsForCategory.totalPages > 1">
      <button @click="changePage(forumStore.threadsForCategory.number - 1)" :disabled="forumStore.threadsForCategory.first" class="pagination-button">
        <font-awesome-icon :icon="['fas', 'chevron-left']" /> 上一页
      </button>
      <span>第 {{ forumStore.threadsForCategory.number + 1 }} 页 / 共 {{ forumStore.threadsForCategory.totalPages }} 页</span>
      <button @click="changePage(forumStore.threadsForCategory.number + 1)" :disabled="forumStore.threadsForCategory.last" class="pagination-button">
        下一页 <font-awesome-icon :icon="['fas', 'chevron-right']" />
      </button>
    </div>

    <CreateThreadModal
        :is-open="showCreateThreadModal"
        :category-id="props.categoryId"
        :category-name="currentCategory?.name || '当前分类'"
        :is-submitting="isSubmittingThread"
        :error-message="createThreadError"
        @close="closeCreateThreadModal"
        @create-thread="handleCreateThread"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useForumStore } from '@/stores/forumStore';
import {  type ForumCategory } from '@/types/forumTypes';
import { useAuthStore } from '@/stores/auth';
import ThreadListItem from '../../components/discussion/ThreadListItem.vue';
import CreateThreadModal from '../../components/discussion/CreateThreadModal.vue';
import { getForumCategoryIcon } from '@/utils/iconUtils'; // 从工具文件导入
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{ categoryId: string }>();

const forumStore = useForumStore();
const authStore = useAuthStore();
const router = useRouter();

const currentCategory = ref<ForumCategory | null>(null);
const showCreateThreadModal = ref(false);
const isSubmittingThread = ref(false);
const createThreadError = ref<string|null>(null);

const fetchCategoryAndThreads = async (page = 0) => {
  // 确保分类信息已加载或同时加载
  if (forumStore.categories.length === 0) {
    await forumStore.fetchCategories();
  }
  const cat = forumStore.getCategoryById(props.categoryId);
  if (cat) {
    currentCategory.value = cat;
  } else {
    console.warn(`分类 ID ${props.categoryId} 未找到，将跳转回论坛首页。`);
    router.replace({ name: 'DiscussionHomeView' }); // 使用 replace 避免无效历史记录
    return;
  }
  await forumStore.fetchThreads(props.categoryId, page);
};

onMounted(() => {
  fetchCategoryAndThreads();
});

watch(() => props.categoryId, (newCategoryId) => {
  if (newCategoryId) {
    fetchCategoryAndThreads();
  }
});

const changePage = (page: number) => {
  fetchCategoryAndThreads(page);
  // 翻页后滚动到页面顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const openCreateThreadModal = () => {
  createThreadError.value = null; // 清除旧错误
  showCreateThreadModal.value = true;
};
const closeCreateThreadModal = () => {
  showCreateThreadModal.value = false;
};

const handleCreateThread = async (payload: { categoryId: string, title: string, content: string }) => {
  isSubmittingThread.value = true;
  createThreadError.value = null;
  const createdThread = await forumStore.createThread(payload);
  isSubmittingThread.value = false;
  if (createdThread) {
    closeCreateThreadModal();
    // 跳转到新创建的帖子
    router.push({ name: 'ThreadView', params: { threadId: createdThread.id } });
  } else {
    // 如果 store action 设置了错误信息，可以在此读取并显示在模态框中
    createThreadError.value = forumStore.error || "创建主题失败，请稍后再试。";
  }
};
</script>

<style scoped>
.thread-list-view {
  padding: 1.5rem 2rem;
  max-width: 1100px;
  margin: 0 auto;
  color: var(--text-color);
}

.page-header-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}
.breadcrumbs {
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.7;
}
.breadcrumb-link {
  color: var(--text-color);
  text-decoration: none;
}
.breadcrumb-link:hover {
  color: var(--primary-color);
}
.breadcrumb-separator {
  margin: 0 0.5rem;
}
.breadcrumb-current {
  font-weight: 500;
  color: var(--text-color);
  opacity: 1;
}
[data-theme="dark"] .breadcrumb-current {
  color: #ffffff;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}
.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
[data-theme="dark"] .page-title { color: #ffffff; }
.page-title .title-icon { color: var(--primary-color); font-size: 0.9em;}

.create-thread-button {
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
}
.create-thread-button .fa-icon { margin-right: 0.5em; }

.page-subtitle {
  font-size: 0.95rem;
  color: var(--text-color);
  opacity: 0.8;
  margin-top: 0.25rem;
}
[data-theme="dark"] .page-subtitle { color: #a2aab3; }

.loading-state, .empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 3rem; text-align: center; min-height: 300px;
  background-color: var(--card-bg-color); border-radius: 8px; border: 1px solid var(--border-color);
}
.empty-state .empty-icon { font-size: 3.5rem; color: var(--primary-color); opacity: 0.5; margin-bottom: 1.5rem; }
.empty-state p { font-size: 1.1rem; margin-bottom: 0.75rem; opacity: 0.8; }
.spinner { /* ... (spinner 动画样式) ... */ }


.threads-list-wrapper {
  background-color: var(--card-bg-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0,0,0,0.03);
}
[data-theme="dark"] .threads-list-wrapper {
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}

.thread-list-header {
  display: flex;
  padding: 0.85rem 1.75rem; /* 匹配 ThreadListItem 的 padding */
  background-color: color-mix(in srgb, var(--border-color) 40%, var(--card-bg-color) 60%);
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-color-muted);
  border-bottom: 1px solid var(--border-color);
}
[data-theme="dark"] .thread-list-header { background-color: #2c3035; color: #9daab8; }
.thread-title-header { flex: 3; min-width: 250px;}
.thread-stats-header { flex: 1; text-align: center; min-width: 120px;}
.thread-lastpost-header { flex: 2; text-align: right; min-width: 180px;}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem 0;
  margin-top: 1.5rem; /* 与列表的间距 */
  gap: 1rem;
  font-size: 0.9rem;
}
.pagination-button {
  padding: 0.5rem 1rem;
  background-color: var(--card-bg-color);
  border: 1px solid var(--border-color);
  color: var(--text-color);
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: background-color 0.2s ease;
}
.pagination-button:hover:not(:disabled) { background-color: var(--border-color); }
.pagination-button:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 768px) {
  .thread-list-header { display: none; }
}
</style>