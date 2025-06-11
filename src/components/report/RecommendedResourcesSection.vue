<template>
  <section class="report-section recommended-resources-section" v-if="resources && resources.length > 0">
    <h2 class="section-title">个性化学习资源建议</h2>
    <p class="section-subtitle">根据您的本次面试表现，我们为您推荐以下学习资源：</p>
    <div class="resources-grid">
      <a
          v-for="resource in resources"
          :key="resource.id"
          :href="resource.url"
          target="_blank"
          rel="noopener noreferrer"
          class="resource-card-link"
      >
        <div class="resource-icon-wrapper">
          <font-awesome-icon :icon="['fas', resource.icon]" />
        </div>
        <div class="resource-text-content">
          <h4 class="resource-title">{{ resource.title }}</h4>
          <p v-if="resource.description" class="resource-description">{{ resource.description }}</p>
        </div>
        <span class="resource-type-label">{{ resource.type }}</span>
        <font-awesome-icon :icon="['fas', 'external-link-alt']" class="external-link-indicator"/>
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { RecommendedResource } from '@/types/reportTypes'; // Ensure path is correct
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

defineProps<{
  resources: RecommendedResource[];
}>();
</script>

<style scoped>
.report-section { /* Common section styling */
  background-color: var(--card-bg-color);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
  box-shadow: 0 3px 10px rgba(0,0,0,0.05);
}
[data-theme="dark"] .report-section {
  box-shadow: 0 3px 10px rgba(0,0,0,0.15);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.75rem; /* 修改：为标题和副标题之间提供足够的默认间距 */
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}
[data-theme="dark"] .section-title {
  color: #ffffff;
}

.section-subtitle {
  font-size: 0.95rem;
  color: var(--text-color);
  opacity: 0.8;
  margin-bottom: 1.5rem;
  /* margin-top: -1rem; */ /* 移除或减小这个负边距 */
  margin-top: 0.25rem; /* 新增：在标题下方添加少量正边距，确保不重叠 */
  line-height: 1.5; /* 确保副标题本身有足够的行高 */
}
[data-theme="dark"] .section-subtitle {
  color: #a2aab3;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}
.resource-card-link {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  text-decoration: none;
  color: var(--text-color);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
}
[data-theme="dark"] .resource-card-link {
  background-color: color-mix(in srgb, var(--card-bg-color) 90%, var(--bg-color) 10%);
}
.resource-card-link:hover {
  transform: translateY(-4px);
  box-shadow: 0 7px 14px rgba(0,0,0,0.07);
}
[data-theme="dark"] .resource-card-link:hover {
  box-shadow: 0 7px 14px rgba(0,0,0,0.25);
  border-color: var(--primary-color);
}
.resource-icon-wrapper {
  background-color: color-mix(in srgb, var(--primary-color) 15%, transparent);
  color: var(--primary-color);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1.2rem;
}
.resource-text-content {
  flex-grow: 1;
  padding-right: 1.5rem;
}
.resource-title {
  font-weight: 600; font-size: 1rem;
  margin-bottom: 0.25rem;
  color: var(--text-color);
}
[data-theme="dark"] .resource-title { color: #e4e6eb; }
.resource-description {
  font-size: 0.85rem; opacity: 0.75;
  line-height: 1.5;
  color: var(--text-color);
}
[data-theme="dark"] .resource-description { opacity: 0.65; }
.resource-type-label {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  font-size: 0.7rem;
  font-weight: 500;
  background-color: var(--border-color);
  color: var(--text-color-muted);
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
  text-transform: capitalize;
}
[data-theme="dark"] .resource-type-label {
  background-color: #3a3f4c;
  color: #a2aab3;
}
.external-link-indicator {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  color: var(--text-color);
  opacity: 0.4;
  font-size: 0.8rem;
}
.resource-card-link:hover .external-link-indicator {
  color: var(--primary-color);
  opacity: 0.8;
}
</style>