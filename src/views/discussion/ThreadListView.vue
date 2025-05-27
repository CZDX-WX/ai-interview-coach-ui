<template>
  <div class="thread-list-view">
    <div class="page-header-section">
      <div class="breadcrumbs">
        <router-link :to="{ name: 'DiscussionHomeView' }" class="breadcrumb-link">Forum</router-link>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">{{ currentCategory?.name || 'Category' }}</span>
      </div>
      <div class="header-content">
        <h1 class="page-title">
          <font-awesome-icon :icon="getCategoryIcon(categoryId)" class="title-icon" />
          {{ currentCategory?.name || 'Threads' }}
        </h1>
        <button @click="openCreateThreadModal" class="form-button primary-button create-thread-button">
          <font-awesome-icon :icon="['fas', 'plus-circle']" /> Create New Thread
        </button>
      </div>
      <p v-if="currentCategory?.description" class="page-subtitle">{{ currentCategory.description }}</p>
    </div>

    <div v-if="forumStore.isLoadingThreads" class="loading-state">
      <div class="spinner"><div></div><div></div><div></div><div></div></div>
      <p>Loading threads...</p>
    </div>

    <div v-else-if="forumStore.threadsForCategory.length === 0 && !forumStore.isLoadingThreads" class="empty-state">
      <font-awesome-icon :icon="['fas', 'folder-open']" class="empty-icon"/>
      <p>No threads found in this category yet.</p>
      <p>Be the first to start a discussion!</p>
    </div>

    <div v-else class="threads-list">
      <div class="thread-list-header">
        <div class="thread-title-header">Thread / Author</div>
        <div class="thread-stats-header">Replies / Views</div>
        <div class="thread-lastpost-header">Last Post</div>
      </div>
      <div v-for="thread in forumStore.threadsForCategory" :key="thread.id" class="thread-item-link">
        <router-link :to="{ name: 'ThreadView', params: { threadId: thread.id } }" class="thread-item">
          <div class="thread-info">
            <font-awesome-icon :icon="thread.isPinned ? ['fas', 'thumbtack'] : ['far', 'comments']" class="thread-icon" :class="{pinned: thread.isPinned}"/>
            <div class="thread-text">
              <h3 class="thread-title">{{ thread.title }}</h3>
              <p class="thread-author">Started by {{ thread.author.name }} on {{ formatDate(thread.createdAt) }}</p>
            </div>
          </div>
          <div class="thread-stats">
            <span>{{ thread.replyCount }} Replies</span>
            <span v-if="thread.viewCount !== undefined">{{ thread.viewCount }} Views</span>
          </div>
          <div class="thread-last-post">
            <template v-if="thread.lastReplyAt && thread.lastReplyAuthor">
              <span class="last-post-author">by {{ thread.lastReplyAuthor.name }}</span>
              <span class="last-post-time">{{ formatRelativeTime(thread.lastReplyAt) }}</span>
            </template>
            <template v-else>
              <span class="last-post-author">No replies yet</span>
              <span class="last-post-time">{{ formatRelativeTime(thread.createdAt) }}</span>
            </template>
          </div>
        </router-link>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showCreateThreadModal" class="modal-overlay" @click.self="closeCreateThreadModal">
        <div class="modal-content create-thread-modal">
          <h3>Create New Thread in "{{ currentCategory?.name }}"</h3>
          <form @submit.prevent="handleCreateThread">
            <div class="form-group">
              <label for="threadTitle">Thread Title</label>
              <input type="text" id="threadTitle" v-model="newThread.title" class="form-input-dark" required placeholder="Enter a clear and concise title">
            </div>
            <div class="form-group">
              <label for="threadContent">Your Post</label>
              <textarea id="threadContent" v-model="newThread.content" class="form-input-dark code-input-area" rows="8" required placeholder="Start typing your post content here..."></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" @click="closeCreateThreadModal" class="form-button secondary-button">Cancel</button>
              <button type="submit" class="form-button primary-button" :disabled="isSubmittingThread">
                <font-awesome-icon :icon="['fas', 'paper-plane']" v-if="!isSubmittingThread" />
                {{ isSubmittingThread ? 'Submitting...' : 'Create Thread' }}
              </button>
            </div>
            <p v-if="forumStore.error" class="error-message modal-error">{{ forumStore.error }}</p>
          </form>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useForumStore, ForumCategory } from '../../stores/forumStore';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{ categoryId: string }>();

const forumStore = useForumStore();
const router = useRouter();

const currentCategory = ref<ForumCategory | null>(null);
const showCreateThreadModal = ref(false);
const isSubmittingThread = ref(false);
const newThread = ref({
  title: '',
  content: '',
});

const fetchCategoryDetails = () => {
  const cat = forumStore.getCategoryById(props.categoryId);
  if (cat) {
    currentCategory.value = cat;
  } else {
    // If categories not loaded yet, fetch them then try again
    if (forumStore.categories.length === 0) {
      forumStore.fetchCategories().then(() => {
        currentCategory.value = forumStore.getCategoryById(props.categoryId) || null;
        if (!currentCategory.value) router.push({ name: 'DiscussionHomeView' }); // Redirect if category still not found
      });
    } else {
      // Categories loaded but this one not found
      console.warn(`Category with ID ${props.categoryId} not found.`);
      router.push({ name: 'DiscussionHomeView' }); // Redirect to forum home
    }
  }
};


onMounted(() => {
  fetchCategoryDetails();
  forumStore.fetchThreads(props.categoryId);
});

// Watch for categoryId changes if user navigates between categories directly
watch(() => props.categoryId, (newCategoryId) => {
  fetchCategoryDetails();
  forumStore.fetchThreads(newCategoryId);
  currentCategory.value = forumStore.getCategoryById(newCategoryId) || null;
});

const openCreateThreadModal = () => {
  newThread.value = { title: '', content: '' }; // Reset form
  forumStore.error = null; // Clear previous errors
  showCreateThreadModal.value = true;
};
const closeCreateThreadModal = () => {
  showCreateThreadModal.value = false;
};

const handleCreateThread = async () => {
  if (!newThread.value.title.trim() || !newThread.value.content.trim()) {
    alert("Title and content are required.");
    return;
  }
  isSubmittingThread.value = true;
  const createdThread = await forumStore.createThread({
    categoryId: props.categoryId,
    title: newThread.value.title,
    content: newThread.value.content,
  });
  isSubmittingThread.value = false;
  if (createdThread) {
    closeCreateThreadModal();
    router.push({ name: 'ThreadView', params: { threadId: createdThread.id } });
  } else {
    // Error message will be shown from store.error in the modal
  }
};

// Helper functions (same as DiscussionHomeView)
const getCategoryIcon = (categoryId: string) => { /* ... same ... */
  switch(categoryId) {
    case 'general': return 'comments';
    case 'swe-technical': return 'code';
    case 'pm-behavioral': return 'user-tie';
    case 'company-specific': return 'building';
    default: return 'folder';
  }
};
const formatDate = (isoDate: string) => new Date(isoDate).toLocaleDateString();
const formatRelativeTime = (isoTimestamp: string) => { /* ... same ... */
  const date = new Date(isoTimestamp);
  const now = new Date();
  const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const diffMinutes = Math.round(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

</script>

<style scoped>
/* Using dark theme variables for this page as per prototype */
.thread-list-view {
  padding: 1.5rem 2rem;
  max-width: 1100px;
  margin: 0 auto;
  color: var(--text-color);
}
/* Ensure dark theme vars take effect */
.dark-theme-override .thread-list-view { /* If forcing dark theme on page */ }

.page-header-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  /* border-bottom: 1px solid var(--border-color); */
}
.breadcrumbs {
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.7;
}
.breadcrumb-link { color: var(--text-color); text-decoration: none; }
.breadcrumb-link:hover { color: var(--primary-color); }
.breadcrumb-separator { margin: 0 0.5rem; }
.breadcrumb-current { font-weight: 500; color: var(--text-color); opacity: 1;}
[data-theme="dark"] .breadcrumb-current { color: #ffffff; }


.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-wrap: wrap; /* Allow button to wrap on smaller screens */
  gap: 1rem;
}
.page-title {
  font-size: 1.75rem; /* Slightly smaller than forum home */
  font-weight: 700;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0; /* Removed margin as header-content handles spacing */
}
[data-theme="dark"] .page-title { color: #ffffff; }
.page-title .title-icon { color: var(--primary-color); }

.create-thread-button {
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
}
.create-thread-button .fa-icon {
  margin-right: 0.5em;
}

.page-subtitle {
  font-size: 0.95rem;
  color: var(--text-color);
  opacity: 0.8;
}
[data-theme="dark"] .page-subtitle { color: #a2aab3; }

.loading-state, .empty-state { /* Copied from DiscussionHomeView */
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 3rem; text-align: center; min-height: 300px;
  background-color: var(--card-bg-color); border-radius: 8px; border: 1px solid var(--border-color);
}
.empty-state .empty-icon { font-size: 4rem; color: var(--primary-color); opacity: 0.5; margin-bottom: 1.5rem; }
.empty-state p { font-size: 1.1rem; margin-bottom: 0.75rem; opacity: 0.8; }
.spinner { /* ... (same spinner CSS) ... */ }


.threads-list {
  background-color: var(--card-bg-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}
.thread-list-header {
  display: flex;
  padding: 0.75rem 1.5rem;
  background-color: color-mix(in srgb, var(--border-color) 50%, var(--card-bg-color) 50%);
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-color);
  opacity: 0.9;
}
[data-theme="dark"] .thread-list-header { background-color: #2c3035; }
.thread-title-header { flex: 3; min-width: 250px;}
.thread-stats-header { flex: 1; text-align: center; min-width: 120px;}
.thread-lastpost-header { flex: 2; text-align: right; min-width: 180px;}

.thread-item-link {
  text-decoration: none;
  color: inherit;
  display: block;
}
.thread-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s ease;
}
.thread-item-link:last-child .thread-item { border-bottom: none; }
.thread-item-link:hover .thread-item {
  background-color: color-mix(in srgb, var(--primary-color) 8%, var(--card-bg-color) 92%);
}

.thread-info { flex: 3; display: flex; align-items: center; gap: 1rem; min-width: 250px;}
.thread-icon { font-size: 1.25rem; color: var(--text-color); opacity: 0.6; width: 24px; text-align:center;}
.thread-icon.pinned { color: var(--primary-color); opacity: 1;}
.thread-text { display: flex; flex-direction: column; }
.thread-title { font-size: 1.05rem; font-weight: 600; color: var(--text-color); margin-bottom: 0.2rem; }
[data-theme="dark"] .thread-title { color: #ffffff; }
.thread-author { font-size: 0.8rem; color: var(--text-color); opacity: 0.7; }
[data-theme="dark"] .thread-author { color: #a2aab3; }

.thread-stats { flex: 1; display: flex; flex-direction: column; align-items: center; font-size: 0.85rem; color: var(--text-color); opacity: 0.8; min-width: 120px;}
.thread-stats span { line-height: 1.3; }
[data-theme="dark"] .thread-stats { color: #a2aab3; }

.thread-last-post { flex: 2; text-align: right; font-size: 0.85rem; display: flex; flex-direction: column; align-items: flex-end; min-width: 180px;}
.last-post-author, .last-post-time { color: var(--text-color); opacity: 0.7; font-size: 0.8rem; }
[data-theme="dark"] .last-post-author, [data-theme="dark"] .last-post-time { color: #a2aab3; }
.last-post-author { font-weight: 500; }


/* Modal Styles (from SettingsView, make global or copy) */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 1050; }
.modal-content { background-color: var(--card-bg-color); padding: 2rem; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); width: 90%; max-width: 600px; color: var(--text-color); }
.modal-content h3 { font-size: 1.5rem; font-weight: 600; color: var(--text-color); margin-top: 0; margin-bottom: 1.5rem; }
[data-theme="dark"] .modal-content h3 { color: #ffffff; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
.modal-actions .form-button { padding: 0.6rem 1.2rem; font-size: 0.9rem; }
.form-input-dark { /* Copied from AccountSettings for modal inputs */
  width: 100%; padding: 0.875rem 1rem; font-size: 1rem; border-radius: 0.75rem;
  border: 1px solid var(--input-border-color, #40474f);
  background-color: var(--input-bg-color, #1e2124);
  color: var(--text-color);
}
[data-theme="dark"] .form-input-dark { border-color: #40474f; background-color: #1e2124; color: #ffffff; }
.form-input-dark::placeholder { color: var(--placeholder-color, #a2aab3); }
[data-theme="dark"] .form-input-dark::placeholder { color: #a2aab3; }
.form-input-dark:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 2px var(--primary-color-translucent); }
.code-input-area { /* For textarea in modal */
  min-height: 150px;
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
  white-space: pre-wrap;
  line-height: 1.5;
}
.modal-error { margin-top: 1rem; }

/* Responsive adjustments for thread list */
@media (max-width: 768px) {
  .thread-list-header .thread-stats-header,
  .thread-list-header .thread-lastpost-header {
    display: none;
  }
  .thread-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .thread-stats, .thread-last-post {
    flex-basis: auto;
    width: 100%;
    text-align: left;
    font-size: 0.8rem;
    margin-top: 0.5rem;
    padding-left: calc(24px + 1rem); /* Indent past icon */
  }
  .thread-stats {
    flex-direction: row;
    gap: 1rem;
  }
  .thread-last-post {
    align-items: flex-start;
  }
}

</style>