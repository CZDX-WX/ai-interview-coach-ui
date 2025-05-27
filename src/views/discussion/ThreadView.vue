<template>
  <div class="thread-view">
    <div v-if="forumStore.isLoadingThreads || forumStore.isLoadingPosts && !forumStore.currentThread" class="loading-state">
      <div class="spinner"><div></div><div></div><div></div><div></div></div>
      <p>Loading thread...</p>
    </div>

    <div v-else-if="!forumStore.currentThread && !forumStore.isLoadingThreads" class="empty-state">
      <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="empty-icon"/>
      <p>Thread not found or could not be loaded.</p>
      <router-link :to="{ name: 'DiscussionHomeView' }" class="form-button secondary-button">Back to Forum</router-link>
    </div>

    <div v-else class="thread-content-wrapper">
      <div class="page-header-section">
        <div class="breadcrumbs">
          <router-link :to="{ name: 'DiscussionHomeView' }" class="breadcrumb-link">Forum</router-link>
          <span class="breadcrumb-separator">/</span>
          <router-link v-if="category" :to="{ name: 'ThreadListView', params: { categoryId: category.id } }" class="breadcrumb-link">{{ category.name }}</router-link>
          <span v-else class="breadcrumb-link">Category</span>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">{{ truncate(forumStore.currentThread?.title || 'Thread', 50) }}</span>
        </div>
        <h1 class="page-title thread-main-title">{{ forumStore.currentThread?.title }}</h1>
      </div>

      <div class="posts-list">
        <PostItem v-for="post in forumStore.postsForThread" :key="post.id" :post="post" />
      </div>

      <div class="reply-form-section" v-if="authStore.isAuthenticated">
        <h3 class="reply-form-title">Post a Reply</h3>
        <form @submit.prevent="handlePostReply">
          <div class="form-group">
            <textarea
                v-model="newReplyContent"
                class="form-input-dark code-input-area"
                rows="5"
                placeholder="Write your reply..."
                required
            ></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="form-button primary-button" :disabled="isSubmittingReply || !newReplyContent.trim()">
              <font-awesome-icon :icon="['fas', 'reply']" v-if="!isSubmittingReply" />
              {{ isSubmittingReply ? 'Posting...' : 'Post Reply' }}
            </button>
          </div>
          <p v-if="forumStore.error && isSubmittingReply" class="error-message">{{ forumStore.error }}</p>
        </form>
      </div>
      <div v-else class="login-prompt">
        <p><router-link :to="{ name: 'Login', query: { redirect: route.fullPath } }">Log in</router-link> to post a reply.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useForumStore, ForumCategory } from '../../stores/forumStore';
import { useAuthStore } from '../../stores/auth';
import PostItem from '../../components/forum/PostItem.vue'; // Adjust path
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{ threadId: string }>();

const route = useRoute();
const router = useRouter();
const forumStore = useForumStore();
const authStore = useAuthStore();

const newReplyContent = ref('');
const isSubmittingReply = ref(false);

const category = computed<ForumCategory | null>(() => {
  if (forumStore.currentThread?.categoryId) {
    return forumStore.getCategoryById(forumStore.currentThread.categoryId) || null;
  }
  return null;
});

const fetchThreadData = () => {
  forumStore.fetchThreadWithPosts(props.threadId);
};

onMounted(() => {
  fetchThreadData();
});

// Watch for threadId changes if user navigates between threads directly (less common)
watch(() => props.threadId, (newThreadId) => {
  fetchThreadData();
});

const handlePostReply = async () => {
  if (!newReplyContent.value.trim()) return;
  isSubmittingReply.value = true;
  const createdPost = await forumStore.createPost({
    threadId: props.threadId,
    content: newReplyContent.value,
  });
  isSubmittingReply.value = false;
  if (createdPost) {
    newReplyContent.value = ''; // Clear textarea
    // Optionally scroll to new post
  } else {
    // Error message will be shown
  }
};

const truncate = (text: string, length: number) => {
  return text.length > length ? text.substring(0, length) + '...' : text;
};
</script>

<style scoped>
.thread-view {
  padding: 1.5rem 2rem;
  max-width: 900px; /* Content focused */
  margin: 0 auto;
  color: var(--text-color);
}
.dark-theme-override .thread-view { /* If specific dark theme needed */ }

.page-header-section { margin-bottom: 1.5rem; } /* Reusing from ThreadListView */
.breadcrumbs { margin-bottom: 1rem; font-size: 0.9rem; color: var(--text-color); opacity: 0.7; }
.breadcrumb-link { color: var(--text-color); text-decoration: none; }
.breadcrumb-link:hover { color: var(--primary-color); }
.breadcrumb-separator { margin: 0 0.5rem; }
.breadcrumb-current { font-weight: 500; color: var(--text-color); opacity: 1;}
[data-theme="dark"] .breadcrumb-current { color: #ffffff; }

.page-title.thread-main-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 1rem; /* Space after title */
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}
[data-theme="dark"] .page-title.thread-main-title { color: #ffffff; }

.loading-state, .empty-state { /* Copied from DiscussionHomeView */
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 3rem; text-align: center; min-height: 300px;
  background-color: var(--card-bg-color); border-radius: 8px; border: 1px solid var(--border-color);
}
.empty-state .empty-icon { font-size: 4rem; color: var(--primary-color); opacity: 0.5; margin-bottom: 1.5rem; }
.empty-state p { font-size: 1.1rem; margin-bottom: 1.5rem; opacity: 0.8; }
.spinner { /* ... (same spinner CSS) ... */ }


.posts-list {
  margin-bottom: 2rem;
}

.reply-form-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}
.reply-form-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-color);
}
[data-theme="dark"] .reply-form-title { color: #ffffff; }

.form-input-dark.code-input-area { /* Using these from modal styles for textarea */
  width: 100%; padding: 0.875rem 1rem; font-size: 1rem; border-radius: 0.75rem;
  border: 1px solid var(--input-border-color, #40474f);
  background-color: var(--input-bg-color, #1e2124);
  color: var(--text-color);
  min-height: 120px; /* Adjusted for reply */
  font-family: inherit; /* Use default sans-serif for replies, not monospace */
  white-space: pre-wrap;
  line-height: 1.6;
}
[data-theme="dark"] .form-input-dark.code-input-area { border-color: #40474f; background-color: #1e2124; color: #ffffff; }
.form-input-dark.code-input-area::placeholder { color: var(--placeholder-color, #a2aab3); }
[data-theme="dark"] .form-input-dark.code-input-area::placeholder { color: #a2aab3; }
.form-input-dark.code-input-area:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 2px var(--primary-color-translucent); }

.form-actions { display: flex; justify-content: flex-end; margin-top: 1rem; }
.form-actions .form-button { padding: 0.6rem 1.2rem; font-size: 0.9rem; }
.form-actions .form-button .fa-icon { margin-right: 0.5em; }

.login-prompt {
  margin-top: 2rem;
  padding: 1rem;
  text-align: center;
  background-color: var(--card-bg-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.95rem;
}
.login-prompt a {
  color: var(--primary-color);
  font-weight: 500;
  text-decoration: underline;
}
.error-message { /* Copied from auth-forms.css or define globally */
  background-color: #ffe3e3; color: #c00; border: 1px solid #ffb3b3;
  padding: 0.75rem; border-radius: 4px; margin-top: 1rem; font-size: 0.875rem; text-align: center;
}
[data-theme="dark"] .error-message { background-color: #4d1f1f; color: #ffcccc; border: 1px solid #8b3333; }
</style>