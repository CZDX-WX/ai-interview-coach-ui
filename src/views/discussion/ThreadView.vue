<template>
  <div class="thread-view-container">
    <div v-if="forumStore.isLoadingThreads && !currentThread" class="loading-state">
      <div class="spinner"><div></div><div></div><div></div><div></div></div>
      <p>正在加载主题内容...</p>
    </div>

    <div v-else-if="!currentThread && !forumStore.isLoadingThreads" class="empty-state">
      <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="empty-icon"/>
      <p>未能找到该主题或加载失败。</p>
      <router-link :to="{ name: 'DiscussionHomeView' }" class="form-button secondary-button">返回论坛首页</router-link>
    </div>

    <div v-else class="thread-content-wrapper">
      <div class="page-header-section">
        <div class="breadcrumbs">
          <router-link :to="{ name: 'DiscussionHomeView' }" class="breadcrumb-link">讨论区</router-link>
          <span class="breadcrumb-separator">/</span>
          <router-link v-if="category" :to="{ name: 'ThreadListView', params: { categoryId: category.id } }" class="breadcrumb-link">{{ category.name }}</router-link>
        </div>
        <h1 class="page-title thread-main-title">{{ currentThread.title }}</h1>
      </div>

      <div class="posts-list" aria-label="帖子列表">
        <PostItem v-for="post in forumStore.postsForThread?.content" :key="post.id" :post="post" />
      </div>

      <div v-if="!forumStore.postsForThread?.content.length && currentThread" class="empty-state small-empty">
        <p>该主题下暂无回复。成为第一个回复的人吧！</p>
      </div>

      <div class="pagination-controls" v-if="forumStore.postsForThread && forumStore.postsForThread.totalPages > 1">
        <button @click="changePage(forumStore.postsForThread.number - 1)" :disabled="forumStore.postsForThread.first" class="pagination-button">
          <font-awesome-icon :icon="['fas', 'chevron-left']" /> 上一页
        </button>
        <span>第 {{ forumStore.postsForThread.number + 1 }} 页 / 共 {{ forumStore.postsForThread.totalPages }} 页</span>
        <button @click="changePage(forumStore.postsForThread.number + 1)" :disabled="forumStore.postsForThread.last" class="pagination-button">
          下一页 <font-awesome-icon :icon="['fas', 'chevron-right']" />
        </button>
      </div>

      <ReplyForm
          v-if="authStore.isAuthenticated"
          :thread-id="currentThread.id"
          :is-submitting="isSubmittingReply"
          :error-message="replyError"
          @submit-reply="handlePostReply"
          class="reply-form-main"
      />
      <div v-else class="login-prompt">
        <p>请先<router-link :to="{ name: 'Login', query: { redirect: route.fullPath } }">登录</router-link>后发表回复。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useForumStore } from '@/stores/forumStore';
import { type ForumCategory } from '@/types/forumTypes';
import { useAuthStore } from '@/stores/auth';
import PostItem from '../../components/discussion/PostItem.vue';
import ReplyForm from '../../components/discussion/ReplyForm.vue';

const props = defineProps<{ threadId: string }>();

const route = useRoute();
const router = useRouter();
const forumStore = useForumStore();
const authStore = useAuthStore();

const isSubmittingReply = ref(false);
const replyError = ref<string | null>(null);

const currentThread = computed(() => forumStore.currentThread!);
const category = computed<ForumCategory | null>(() => {
  if (currentThread.value?.categoryId) {
    if (forumStore.categories.length === 0) { forumStore.fetchCategories(); }
    return forumStore.getCategoryById(String(currentThread.value.categoryId)) || null;
  }
  return null;
});

const fetchThreadData = async (page = 0) => {
  await forumStore.fetchThreadWithPosts(props.threadId, page);
};

onMounted(() => { fetchThreadData(); });
watch(() => props.threadId, (newId) => { if (newId) fetchThreadData(); });

const changePage = (page: number) => {
  fetchThreadData(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handlePostReply = async (replyContent: string) => {
  if (!replyContent.trim()) return;
  isSubmittingReply.value = true;
  replyError.value = null;
  const createdPost = await forumStore.createPost({
    threadId: props.threadId,
    content: replyContent,
  });
  isSubmittingReply.value = false;
  if (createdPost) {
    const postsPage = forumStore.postsForThread;
    if (postsPage && !postsPage.last) {
      fetchThreadData(postsPage.totalPages - 1);
    }
  } else {
    replyError.value = forumStore.error || "发表回复失败，请稍后再试。";
  }
};

const truncate = (text: string, length: number): string => {
  return text ? (text.length > length ? text.substring(0, length) + '...' : text) : '';
};
</script>

<style scoped>
.thread-view-container {
  padding: 2rem 2.5rem; /* 页面整体内边距 */
  max-width: 1100px; /* **核心修正点**: 增加了最大宽度，与列表页保持一致 */
  margin: 0 auto; /* 页面居中 */
  color: var(--text-color);
}

.page-header-section { margin-bottom: 2rem; } /* 增加头部和帖子列表的间距 */

.breadcrumbs {
  margin-bottom: 1rem; font-size: 0.9rem;
  color: var(--text-color-muted);
}
.breadcrumb-link {
  color: var(--text-color-muted);
  text-decoration: none;
  transition: color 0.2s ease;
}
.breadcrumb-link:hover { color: var(--primary-color); }
.breadcrumb-separator { margin: 0 0.5rem; }
.breadcrumb-current {
  font-weight: 500;
  color: var(--text-color);
}
[data-theme="dark"] .breadcrumb-current { color: #ffffff; }

.page-title.thread-main-title {
  font-size: 2rem; /* 增大标题 */
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem; /* 增加分割线下方空间 */
  border-bottom: 1px solid var(--border-color);
  line-height: 1.4;
}
[data-theme="dark"] .page-title.thread-main-title { color: #ffffff; }

.loading-state, .empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 3rem; text-align: center; min-height: 300px;
  background-color: var(--card-bg-color); border-radius: 8px; border: 1px solid var(--border-color);
}
.empty-state .empty-icon { font-size: 4rem; color: var(--primary-color); opacity: 0.5; margin-bottom: 1.5rem; }
.empty-state p { font-size: 1.1rem; margin-bottom: 1.5rem; opacity: 0.8; }
.spinner { /* ... (spinner 动画样式) ... */ }
.empty-state.small-empty {
  padding: 2rem; min-height: auto; margin-top: 1rem; font-size: 0.95rem;
}
.empty-state.small-empty .empty-icon { display: none; }


.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* 帖子之间的垂直间距 */
  margin-bottom: 2.5rem;
}

.reply-form-main {
  /* ReplyForm 组件的容器，样式在其组件内部定义 */
}

.login-prompt {
  margin-top: 2rem; padding: 1.25rem; text-align: center;
  background-color: var(--card-bg-color); border: 1px solid var(--border-color);
  border-radius: 6px; font-size: 0.95rem;
}
.login-prompt a { color: var(--primary-color); font-weight: 500; text-decoration: underline; }

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem 0;
  gap: 1rem;
  font-size: 0.9rem;
  margin-top: 1.5rem;
  border-top: 1px solid var(--border-color);
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
</style>