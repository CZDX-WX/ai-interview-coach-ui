<template>
  <div class="discussion-home-view">
    <div class="page-header-section">
      <h1 class="page-title">
        <font-awesome-icon :icon="['fas', 'comments']" class="title-icon" />
        Discussion Forum
      </h1>
      <p class="page-subtitle">
        Share your interview experiences, ask questions, and learn from the community.
      </p>
    </div>

    <div v-if="forumStore.isLoadingCategories" class="loading-state">
      <div class="spinner"><div></div><div></div><div></div><div></div></div>
      <p>Loading categories...</p>
    </div>

    <div v-else-if="forumStore.categories.length === 0 && !forumStore.isLoadingCategories" class="empty-state">
      <font-awesome-icon :icon="['fas', 'folder-open']" class="empty-icon"/>
      <p>No discussion categories available at the moment. Please check back later.</p>
    </div>

    <div v-else class="categories-list">
      <div class="category-list-header">
        <div class="category-name-header">Category</div>
        <div class="category-stats-header">Threads / Posts</div>
        <div class="category-lastpost-header">Last Post</div>
      </div>
      <router-link
          v-for="category in forumStore.categories"
          :key="category.id"
          :to="{ name: 'ThreadListView', params: { categoryId: category.id } }"
          class="category-item-link"
      >
        <div class="category-item">
          <div class="category-info">
            <font-awesome-icon :icon="getCategoryIcon(category.id)" class="category-icon"/>
            <div class="category-text">
              <h3 class="category-name">{{ category.name }}</h3>
              <p class="category-description">{{ category.description }}</p>
            </div>
          </div>
          <div class="category-stats">
            <span>{{ category.threadCount }} Threads</span>
            <span>{{ category.postCount }} Posts</span>
          </div>
          <div class="category-last-post">
            <template v-if="category.lastThread">
              <router-link :to="{ name: 'ThreadView', params: { threadId: category.lastThread.threadId }}" class="last-post-title" @click.stop>
                {{ truncate(category.lastThread.title, 30) }}
              </router-link>
              <span class="last-post-meta">by {{ category.lastThread.authorName }}</span>
              <span class="last-post-meta">{{ formatRelativeTime(category.lastThread.timestamp) }}</span>
            </template>
            <span v-else class="last-post-meta">No posts yet</span>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useForumStore } from '../../stores/forumStore';
import { useRouter } from 'vue-router'; // If needed for programmatic navigation
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const forumStore = useForumStore();
const router = useRouter();

const getCategoryIcon = (categoryId: string) => {
  // Basic icon mapping, can be expanded
  switch(categoryId) {
    case 'general': return 'comments';
    case 'swe-technical': return 'code';
    case 'pm-behavioral': return 'user-tie';
    case 'company-specific': return 'building';
    default: return 'folder';
  }
};

const truncate = (text: string, length: number) => {
  return text.length > length ? text.substring(0, length) + '...' : text;
};

const formatRelativeTime = (isoTimestamp: string) => {
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
  return date.toLocaleDateString(); // Fallback to full date
};

onMounted(() => {
  if (forumStore.categories.length === 0) {
    forumStore.fetchCategories();
  }
});
</script>

<style scoped>
/* Styles adapted for a dark theme forum, similar to LearningResourcesView */
.discussion-home-view {
  padding: 1.5rem 2rem;
  max-width: 1100px;
  margin: 0 auto;
  color: var(--text-color);
}
/* Ensure dark theme vars from prototype take effect if not global */
.dark-theme-override .discussion-home-view {
  /* --bg-color: #121416; */
  /* --text-color: #e0e0e0; */
  /* --card-bg-color: #1e2124; */
  /* --border-color: #2c3035; */
}

.page-header-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
[data-theme="dark"] .page-title { color: #ffffff; }
.page-title .title-icon { color: var(--primary-color); }

.page-subtitle {
  font-size: 1rem;
  color: var(--text-color);
  opacity: 0.8;
}
[data-theme="dark"] .page-subtitle { color: #a2aab3; }

.loading-state, .empty-state { /* Re-using from other views */
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 3rem; text-align: center; min-height: 300px;
  background-color: var(--card-bg-color); border-radius: 8px; border: 1px solid var(--border-color);
}
.empty-state .empty-icon { font-size: 4rem; color: var(--primary-color); opacity: 0.5; margin-bottom: 1.5rem; }
.empty-state p { font-size: 1.1rem; margin-bottom: 1.5rem; opacity: 0.8; }
.spinner { display: inline-block; position: relative; width: 60px; height: 60px; margin-bottom: 1rem; }
.spinner div { box-sizing: border-box; display: block; position: absolute; width: 48px; height: 48px; margin: 6px; border: 4px solid var(--primary-color); border-radius: 50%; animation: spinner-animation 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite; border-color: var(--primary-color) transparent transparent transparent; }
.spinner div:nth-child(1) { animation-delay: -0.45s; }
.spinner div:nth-child(2) { animation-delay: -0.3s; }
.spinner div:nth-child(3) { animation-delay: -0.15s; }
@keyframes spinner-animation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }


.categories-list {
  background-color: var(--card-bg-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow: hidden; /* For rounded corners on children */
}

.category-list-header {
  display: flex;
  padding: 0.75rem 1.5rem;
  background-color: color-mix(in srgb, var(--border-color) 50%, var(--card-bg-color) 50%);
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-color);
  opacity: 0.9;
}
[data-theme="dark"] .category-list-header {
  background-color: #2c3035; /* From prototype header/input bg */
}
.category-name-header { flex: 3; } /* Adjust flex ratios as needed */
.category-stats-header { flex: 1; text-align: center; }
.category-lastpost-header { flex: 2; text-align: right; }


.category-item-link {
  text-decoration: none;
  color: inherit;
  display: block;
}
.category-item {
  display: flex;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s ease;
}
.category-item-link:last-child .category-item {
  border-bottom: none;
}
.category-item-link:hover .category-item {
  background-color: color-mix(in srgb, var(--primary-color) 8%, var(--card-bg-color) 92%);
}

.category-info {
  flex: 3; /* Corresponds to header ratio */
  display: flex;
  align-items: center;
  gap: 1rem;
}
.category-icon {
  font-size: 1.75rem;
  color: var(--primary-color);
  width: 32px; /* Fixed width for alignment */
  text-align: center;
}
.category-text {
  display: flex;
  flex-direction: column;
}
.category-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.2rem;
}
[data-theme="dark"] .category-name { color: #ffffff; }
.category-description {
  font-size: 0.85rem;
  color: var(--text-color);
  opacity: 0.7;
  line-height: 1.4;
}
[data-theme="dark"] .category-description { color: #a2aab3; }


.category-stats {
  flex: 1; /* Corresponds to header ratio */
  display: flex;
  flex-direction: column;
  align-items: center; /* Center text */
  font-size: 0.85rem;
  color: var(--text-color);
  opacity: 0.8;
}
.category-stats span {
  line-height: 1.3;
}
[data-theme="dark"] .category-stats { color: #a2aab3; }

.category-last-post {
  flex: 2; /* Corresponds to header ratio */
  text-align: right;
  font-size: 0.85rem;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.last-post-title {
  font-weight: 500;
  color: var(--primary-color); /* Make title stand out */
  text-decoration: none;
  display: block;
  margin-bottom: 0.15rem;
}
.last-post-title:hover {
  text-decoration: underline;
}
.last-post-meta {
  color: var(--text-color);
  opacity: 0.7;
  font-size: 0.75rem;
}
[data-theme="dark"] .last-post-meta { color: #a2aab3; }


/* Responsive adjustments for table-like layout */
@media (max-width: 768px) {
  .category-list-header .category-stats-header,
  .category-list-header .category-lastpost-header {
    display: none; /* Hide less critical info on small screens */
  }
  .category-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .category-stats, .category-last-post {
    flex-basis: auto;
    width: 100%;
    text-align: left;
    font-size: 0.8rem;
    margin-top: 0.5rem;
    padding-left: calc(32px + 1rem); /* Indent past icon */
  }
  .category-stats {
    flex-direction: row; /* Put stats side-by-side */
    gap: 1rem;
    align-items: flex-start;
  }
  .category-last-post {
    align-items: flex-start;
  }
}
</style>