<template>
  <div class="network-view">
    <div class="page-header-section">
      <h1 class="page-title">
        <font-awesome-icon :icon="['fas', 'users-cog']" class="title-icon" />
        Professional Networking Hub
      </h1>
      <p class="page-subtitle">
        Discover resources and platforms to expand your professional network and enhance your career opportunities.
      </p>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"><div></div><div></div><div></div><div></div></div>
      <p>Loading networking resources...</p>
    </div>

    <div v-else-if="categorizedResources.length === 0" class="empty-state">
      <font-awesome-icon :icon="['fas', 'folder-open']" class="empty-icon"/>
      <p>No networking resources available at the moment. Please check back later.</p>
    </div>

    <div v-else class="resources-container">
      <section v-for="categoryGroup in categorizedResources" :key="categoryGroup.category.id" class="category-section">
        <h2 class="section-title">{{ categoryGroup.category.name }}</h2>
        <p v-if="categoryGroup.category.description" class="section-description">{{ categoryGroup.category.description }}</p>
        <div class="resources-grid">
          <a
              v-for="resource in categoryGroup.resources"
              :key="resource.id"
              :href="resource.url"
              target="_blank"
              rel="noopener noreferrer"
              class="resource-card"
          >
            <div class="card-icon-container">
              <font-awesome-icon :icon="['fas', resource.icon]" />
            </div>
            <div class="card-content">
              <h3 class="card-title">{{ resource.title }}</h3>
              <p class="card-description">{{ resource.description }}</p>
              <span v-if="resource.source" class="card-source">Source: {{ resource.source }}</span>
            </div>
            <div class="card-action-icon">
              <font-awesome-icon :icon="['fas', 'external-link-alt']" />
            </div>
          </a>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { NetworkResource, NetworkResourceCategory } from '../../types/networkResourceTypes'; // Adjust path if needed
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const isLoading = ref(true);
const allResources = ref<NetworkResource[]>([]);
const categories = ref<NetworkResourceCategory[]>([
  { id: 'platforms', name: 'Key Online Platforms', description: 'Leverage these platforms to build and maintain your professional connections.' },
  { id: 'skills', name: 'Essential Networking Skills', description: 'Articles and guides to improve your networking abilities.' },
  { id: 'advice', name: 'General Advice & Strategies', description: 'Tips for making meaningful connections and navigating the job market.'}
]);

// Mock data - In a real app, this would come from a CMS or backend API
const MOCK_NETWORK_RESOURCES: NetworkResource[] = [
  { id: 'net001', title: 'LinkedIn Profile Optimization', description: 'Learn how to make your LinkedIn profile stand out to recruiters and connections.', category: 'platforms', url: 'https://www.linkedin.com/help/linkedin/answer/a521223', icon: 'linkedin-in', source: 'LinkedIn Help' , tags:['fab']}, // fab for brands
  { id: 'net002', title: 'Effective Informational Interviewing', description: 'A guide to conducting informational interviews to learn about careers and build contacts.', category: 'skills', url: '#', icon: 'comments', source: 'Career Contessa' },
  { id: 'net003', title: 'Networking for Introverts', description: 'Strategies for introverted individuals to network comfortably and effectively.', category: 'skills', url: '#', icon: 'user-friends', source: 'The Muse' },
  { id: 'net004', title: 'Joining Professional Groups on LinkedIn', description: 'Find and engage with industry-specific groups to expand your knowledge and network.', category: 'platforms', url: 'https://www.linkedin.com/help/linkedin/answer/a506138', icon: 'users', source: 'LinkedIn Help' },
  { id: 'net005', title: 'The Art of Following Up', description: 'How to properly follow up after networking events or interviews.', category: 'skills', url: '#', icon: 'paper-plane', source: 'Forbes' },
  { id: 'net006', title: 'University Alumni Network', description: 'Connect with your university\'s alumni association for career support and connections.', category: 'platforms', url: '#', icon: 'graduation-cap', source: 'Your University (Example)' },
  { id: 'net007', title: 'Building a Strong Professional Network from Scratch', description: 'Actionable steps for students and recent graduates to start building their network.', category: 'advice', url: '#', icon: 'network-wired', source: 'Indeed Career Guide'},
  { id: 'net008', title: 'How to Write a Networking Email', description: 'Templates and tips for crafting effective networking outreach emails.', category: 'skills', url: '#', icon: 'envelope-open-text', source: 'Harvard Business Review'},
];


const fetchNetworkResources = async () => {
  isLoading.value = true;
  await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API delay
  allResources.value = MOCK_NETWORK_RESOURCES;
  isLoading.value = false;
};

const categorizedResources = computed(() => {
  return categories.value.map(category => ({
    category,
    resources: allResources.value.filter(resource => resource.category === category.id)
  })).filter(group => group.resources.length > 0); // Only include categories that have resources
});

onMounted(() => {
  fetchNetworkResources();
});
</script>

<style scoped>
.network-view {
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

.resources-container {
  display: flex;
  flex-direction: column;
  gap: 2.5rem; /* Space between category sections */
}
.category-section {
  /* No extra card bg, section itself is a group */
}
.section-title {
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.5rem; /* Reduced margin */
}
[data-theme="dark"] .section-title { color: #ffffff; }

.section-description {
  font-size: 0.95rem;
  color: var(--text-color);
  opacity: 0.7;
  margin-bottom: 1.5rem;
  max-width: 700px; /* Keep description lines from getting too long */
}
[data-theme="dark"] .section-description { color: #a2aab3; }


.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* Adjust minmax for card size */
  gap: 1.5rem;
}

.resource-card {
  background-color: var(--card-bg-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  padding: 1.25rem;
  text-decoration: none;
  color: var(--text-color);
  display: flex;
  gap: 1rem; /* Gap between icon container and content */
  align-items: flex-start; /* Align icon to top of content */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.resource-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.08);
}
[data-theme="dark"] .resource-card:hover {
  box-shadow: 0 6px 12px rgba(0,0,0,0.2);
  border-color: var(--primary-color);
}

.card-icon-container {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%; /* Circular icon background */
  background-color: color-mix(in srgb, var(--primary-color) 15%, transparent);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem; /* Icon size */
}

.card-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.35rem;
  line-height: 1.3;
}
[data-theme="dark"] .card-title { color: #ffffff; }

.card-description {
  font-size: 0.875rem;
  color: var(--text-color);
  opacity: 0.8;
  line-height: 1.5;
  margin-bottom: 0.5rem;
  flex-grow: 1; /* Allow description to take space */
}
[data-theme="dark"] .card-description { color: #a2aab3; }

.card-source {
  font-size: 0.75rem;
  color: var(--text-color);
  opacity: 0.6;
  margin-top: auto; /* Push to bottom if card content has flex-grow */
  padding-top: 0.5rem;
}
[data-theme="dark"] .card-source { color: #868e96; }

.card-action-icon {
  margin-left: auto; /* Push to the far right */
  align-self: flex-start; /* Align with top of text content */
  color: var(--text-color);
  opacity: 0.5;
  font-size: 0.9rem;
}
.resource-card:hover .card-action-icon {
  color: var(--primary-color);
  opacity: 1;
}

</style>