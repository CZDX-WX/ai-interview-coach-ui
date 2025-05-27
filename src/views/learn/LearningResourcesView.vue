<template>
  <div class="learning-resources-view">
    <div class="page-header-section">
      <h1 class="page-title">
        <font-awesome-icon :icon="['fas', 'book-reader']" class="title-icon" />
        Learn & Prepare
      </h1>
      <p class="page-subtitle">Explore resources to help you prepare for your next interview.</p>

      <div class="search-and-filter-bar">
        <div class="search-input-wrapper">
          <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
          <input
              type="text"
              :value="resourceStore.searchTerm"
              @input="updateSearchTerm($event)"
              placeholder="Search for topics, skills, or keywords..."
              class="search-input"
          />
        </div>
      </div>
    </div>

    <div class="filter-tags-container">
      <button
          v-for="category in resourceStore.categories"
          :key="category.id"
          :class="['filter-tag-button', { active: resourceStore.selectedCategoryId === category.id }]"
          @click="resourceStore.setSelectedCategory(category.id)"
      >
        {{ category.name }}
      </button>
    </div>


    <div v-if="resourceStore.isLoading" class="loading-state">
      <div class="spinner"><div></div><div></div><div></div><div></div></div>
      <p>Loading resources...</p>
    </div>

    <div v-else-if="displayableResources.length === 0 && !resourceStore.isLoading" class="empty-state">
      <font-awesome-icon :icon="['fas', 'folder-open']" class="empty-icon"/>
      <p>No resources found matching your criteria. Try adjusting your search or filters.</p>
    </div>

    <div v-if="resourceStore.selectedCategoryId !== 'all' && displayableResources.length > 0" class="resources-section">
      <h2 class="section-title">{{ resourceStore.categories.find(c => c.id === resourceStore.selectedCategoryId)?.name }}</h2>
      <div class="resources-grid">
        <a v-for="resource in displayableResources" :key="resource.id" :href="resource.linkUrl" target="_blank" rel="noopener noreferrer" class="resource-card">
          <div class="card-image-container">
            <img :src="resource.imageUrl || 'https://via.placeholder.com/300x200/2c3035/a2aab3?text=Resource'" :alt="resource.title" class="card-image"/>
            <span class="card-type-badge">{{ resource.type }}</span>
          </div>
          <div class="card-content">
            <h3 class="card-title">{{ resource.title }}</h3>
            <p class="card-description">{{ resource.description }}</p>
            <div v-if="resource.tags && resource.tags.length" class="card-tags">
              <span v-for="tag in resource.tags" :key="tag" class="tag">#{{ tag }}</span>
            </div>
          </div>
        </a>
      </div>
    </div>

    <div v-else-if="resourceStore.selectedCategoryId === 'all' && Object.keys(resourcesGroupedByCategory).length > 0">
      <section v-for="(resources, categoryName) in resourcesGroupedByCategory" :key="categoryName" class="resources-section">
        <h2 class="section-title">{{ categoryName }}</h2>
        <div class="resources-grid">
          <a v-for="resource in resources" :key="resource.id" :href="resource.linkUrl" target="_blank" rel="noopener noreferrer" class="resource-card">
            <div class="card-image-container">
              <img :src="resource.imageUrl || `https://via.placeholder.com/300x200/2c3035/a2aab3?text=${encodeURIComponent(resource.type)}`" :alt="resource.title" class="card-image"/>
              <span class="card-type-badge">{{ resource.type }}</span>
            </div>
            <div class="card-content">
              <h3 class="card-title">{{ resource.title }}</h3>
              <p class="card-description">{{ resource.description }}</p>
              <div v-if="resource.tags && resource.tags.length" class="card-tags">
                <span v-for="tag in resource.tags" :key="tag" class="tag">#{{ tag }}</span>
              </div>
            </div>
          </a>
        </div>
      </section>
    </div>

  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useResourceStore } from '../../stores/resourceStore';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const resourceStore = useResourceStore();

const updateSearchTerm = (event: Event) => {
  const target = event.target as HTMLInputElement;
  resourceStore.setSearchTerm(target.value);
};

// Use the specific getter for display
const displayableResources = computed(() => resourceStore.displayableResources);
const resourcesGroupedByCategory = computed(() => resourceStore.resourcesGroupedByCategory);


onMounted(() => {
  if (resourceStore.resources.length === 0) { // Fetch only if not already loaded
    resourceStore.fetchResources();
  }
  // Reset filters when component mounts if desired, or retain them
  // resourceStore.setSelectedCategory('all');
  // resourceStore.setSearchTerm('');
});
</script>

<style scoped>
/* Using dark theme variables for this page as per prototype */
.learning-resources-view {
  padding: 1.5rem 2rem;
  max-width: 1200px; /* Wider for resource cards */
  margin: 0 auto;
  color: var(--text-color);
}
/* Specific dark theme styling, ensure your theme variables are robust */
.dark-theme-override .learning-resources-view {
  /* --bg-color: #121416; */
  /* --text-color: #e0e0e0; */
  /* --card-bg-color: #1e2124; */
  /* --border-color: #2c3035; */
  /* --placeholder-color: #a2aab3; */
}

.page-header-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color); /* text-white */
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
[data-theme="dark"] .page-title { color: #ffffff; }
.page-title .title-icon { color: var(--primary-color); }

.page-subtitle {
  font-size: 1rem;
  color: var(--text-color); /* text-[#a2aab3] */
  opacity: 0.8;
  margin-bottom: 1.5rem;
}
[data-theme="dark"] .page-subtitle { color: #a2aab3; }

.search-and-filter-bar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background-color: var(--card-bg-color); /* bg-[#2c3035] */
  border-radius: 0.75rem; /* rounded-xl */
  border: 1px solid var(--border-color);
  padding-left: 1rem; /* pl-4 */
}
[data-theme="dark"] .search-input-wrapper {
  background-color: #2c3035;
  border-color: #40474f; /* Slightly different border for input */
}

.search-icon {
  color: var(--placeholder-color, #a2aab3); /* text-[#a2aab3] */
  font-size: 1.1rem;
}
[data-theme="dark"] .search-icon { color: #a2aab3; }

.search-input {
  flex-grow: 1;
  background: none;
  border: none;
  outline: none;
  padding: 0.875rem 1rem; /* h-10/h-12 equivalent */
  font-size: 1rem;
  color: var(--text-color); /* text-white */
}
[data-theme="dark"] .search-input { color: #ffffff; }
.search-input::placeholder {
  color: var(--placeholder-color, #a2aab3); /* placeholder:text-[#a2aab3] */
}
[data-theme="dark"] .search-input::placeholder { color: #a2aab3; }

.filter-tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem; /* gap-3 p-3 */
  margin-bottom: 2rem; /* Space before resource sections */
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.filter-tag-button {
  padding: 0.5rem 1rem; /* h-8 pl-4 pr-2 (pr-2 if icon) */
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.5rem; /* rounded-xl */
  background-color: var(--card-bg-color); /* bg-[#2c3035] */
  color: var(--text-color); /* text-white */
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem; /* For icon if any */
}
[data-theme="dark"] .filter-tag-button {
  background-color: #2c3035;
  color: #ffffff;
  border-color: #40474f;
}

.filter-tag-button:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}
.filter-tag-button.active {
  background-color: var(--primary-color);
  color: white; /* Ensure contrast */
  border-color: var(--primary-color);
  font-weight: 600;
}
[data-theme="dark"] .filter-tag-button.active {
  color: #ffffff; /* Or specific contrast color for dark primary */
}
/* .filter-tag-button .fa-icon { font-size: 0.8em; } */ /* If using icons in filter buttons */

.resources-section {
  margin-bottom: 2.5rem;
}
.section-title {
  font-size: 1.5rem; /* text-[22px] */
  font-weight: 600; /* font-bold */
  color: var(--text-color); /* text-white */
  margin-bottom: 1.5rem; /* pb-3 pt-5 */
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}
[data-theme="dark"] .section-title { color: #ffffff; }


.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* minmax(158px,1fr) is too small for this card */
  gap: 1.5rem; /* gap-3 */
}

.resource-card {
  background-color: var(--card-bg-color);
  border-radius: 0.75rem; /* rounded-xl */
  overflow: hidden;
  text-decoration: none;
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}
[data-theme="dark"] .resource-card:hover {
  box-shadow: 0 8px 16px rgba(0,0,0,0.25);
}


.card-image-container {
  width: 100%;
  aspect-ratio: 16 / 9; /* Or 3/2 */
  position: relative;
  overflow: hidden; /* Ensure image respects border radius if card has one */
}
.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Ensure image covers the area */
}
.card-type-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background-color: rgba(0,0,0,0.6);
  color: white;
  padding: 0.25rem 0.6rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}


.card-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* Make content area take remaining space */
}
.card-title {
  font-size: 1.1rem; /* text-base */
  font-weight: 600; /* font-medium */
  color: var(--text-color); /* text-white */
  margin-bottom: 0.35rem;
  line-height: 1.3;
}
[data-theme="dark"] .card-title { color: #ffffff; }

.card-description {
  font-size: 0.875rem; /* text-sm */
  color: var(--text-color); /* text-[#a2aab3] */
  opacity: 0.8;
  line-height: 1.5;
  margin-bottom: 0.75rem;
  flex-grow: 1; /* Allow description to take available space */
}
[data-theme="dark"] .card-description { color: #a2aab3; }

.card-tags {
  margin-top: auto; /* Push tags to the bottom of card-content */
  padding-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}
.tag {
  background-color: var(--border-color);
  color: var(--text-color);
  opacity: 0.8;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
}
[data-theme="dark"] .tag {
  background-color: #2c3035;
  color: #a2aab3;
}


.loading-state, .empty-state { /* From InterviewHistoryView, make it global or copy */
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

</style>