<template>
  <div class="learning-resources-view">
    <ResourceHeader
        title="学习与准备中心"
        subtitle="探索丰富的学习资源，助您充分准备下一次面试，提升专业技能。"
        icon="book-reader"
    />

    <ResourceFilterBar
        :categories="resourceStore.categories"
        v-model:searchTerm="resourceStore.searchTerm"
        v-model:selectedCategoryId="resourceStore.selectedCategoryId"
    />

    <div v-if="resourceStore.isLoading" class="loading-state">
      <div class="spinner"><div></div><div></div><div></div><div></div></div>
      <p>正在加载学习资源...</p>
    </div>

    <div v-else-if="displayableResources.length === 0 && !resourceStore.isLoading" class="empty-state">
      <font-awesome-icon :icon="['fas', 'folder-open']" class="empty-icon"/>
      <p>未能找到符合条件的学习资源。请尝试调整搜索词或筛选分类。</p>
    </div>

    <div v-if="resourceStore.selectedCategoryId === 'all' && !resourceStore.searchTerm.trim() && Object.keys(resourcesGroupedByCategory).length > 0">
      <section v-for="(resources, categoryName) in resourcesGroupedByCategory" :key="categoryName" class="resources-category-section">
        <h2 class="category-section-title">{{ categoryName }}</h2>
        <div class="resources-grid">
          <ResourceCard v-for="resource in resources" :key="resource.id" :resource="resource" />
        </div>
      </section>
    </div>
    <div v-else-if="displayableResources.length > 0" class="resources-grid flat-list">
      <ResourceCard v-for="resource in displayableResources" :key="resource.id" :resource="resource" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useResourceStore } from '@/stores/resourceStore';
import ResourceHeader from '../../components/learn/ResourceHeader.vue';
import ResourceFilterBar from '../../components/learn/ResourceFilterBar.vue';
import ResourceCard from '../../components/learn/ResourceCard.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const resourceStore = useResourceStore();

const displayableResources = computed(() => resourceStore.displayableResources);
const resourcesGroupedByCategory = computed(() => resourceStore.resourcesGroupedByCategory);

onMounted(() => {
  if (resourceStore.resources.length === 0) {
    resourceStore.fetchResources();
  }
});
</script>

<style scoped>
.learning-resources-view {
  padding: 1.5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  color: var(--text-color);
}

.resources-category-section {
  margin-bottom: 2.5rem; /* 分类区块之间的间距 */
}
.category-section-title {
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem; /* 标题下的分割线 */
  border-bottom: 1px solid var(--border-color);
}
[data-theme="dark"] .category-section-title { color: #ffffff; }


.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* 调整卡片最小宽度 */
  gap: 1.5rem;
}
.resources-grid.flat-list { /* 当不按分类显示，而是平铺列表时，可能需要更多顶部间距 */
  /* margin-top: 1.5rem; */ /* FilterBar 已有 margin-bottom */
}


.loading-state, .empty-state { /* ... (样式与之前类似) ... */
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 3rem; text-align: center; min-height: 300px;
  background-color: var(--card-bg-color); border-radius: 8px; border: 1px solid var(--border-color);
}
.empty-state .empty-icon { font-size: 4rem; color: var(--primary-color); opacity: 0.5; margin-bottom: 1.5rem; }
.empty-state p { font-size: 1.1rem; margin-bottom: 1.5rem; opacity: 0.8; }
.spinner { /* ... (样式与之前类似) ... */ }
</style>