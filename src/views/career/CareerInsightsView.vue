<template>
  <div class="career-insights-view">
    <div class="page-header-section">
      <h1 class="page-title">
        <font-awesome-icon :icon="['fas', 'compass']" class="title-icon" />
        Career & Skill Insights
      </h1>
      <p class="page-subtitle">
        Explore different job roles, understand their skill requirements, and plan your learning path.
      </p>
    </div>

    <div class="filters-and-search-bar">
      <div class="filter-group">
        <label for="job-field-filter">Job Field:</label>
        <select id="job-field-filter" v-model="selectedJobField" @change="updateFilters" class="form-input select-input">
          <option :value="null">All Fields</option>
          <option v-for="field in setupStore.availableJobFields" :key="field.value" :value="field.value">
            {{ field.label }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label for="experience-level-filter">Experience Level:</label>
        <select id="experience-level-filter" v-model="selectedLevel" @change="updateFilters" class="form-input select-input">
          <option :value="null">All Levels</option>
          <option v-for="level in setupStore.availableExperienceLevels" :key="level.value" :value="level.value">
            {{ level.label }}
          </option>
        </select>
      </div>
      <div class="search-input-wrapper">
        <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
        <input
            type="text"
            :value="searchTermInput"
            @input="updateSearchTerm($event)"
            placeholder="Search roles or skills..."
            class="search-input"
        />
      </div>
    </div>

    <div v-if="insightsStore.isLoading" class="loading-state">
      <div class="spinner"><div></div><div></div><div></div><div></div></div>
      <p>Loading career insights...</p>
    </div>

    <div v-else-if="insightsStore.filteredJobRoleProfiles.length === 0 && !insightsStore.isLoading" class="empty-state">
      <font-awesome-icon :icon="['fas', 'folder-open']" class="empty-icon"/>
      <p>No job roles found matching your criteria. Try adjusting your search or filters.</p>
    </div>

    <div v-else class="roles-grid">
      <div v-for="role in insightsStore.filteredJobRoleProfiles" :key="role.id" class="role-card" @click="toggleRoleExpansion(role.id)">
        <div class="card-header">
          <h3 class="card-title">{{ role.title }}</h3>
          <font-awesome-icon :icon="expandedRoleId === role.id ? ['fas', 'chevron-up'] : ['fas', 'chevron-down']" class="expand-icon"/>
        </div>
        <p class="card-description-summary">{{ truncateText(role.description, 150) }}</p>
        <div class="card-tags">
          <span class="tag job-field-tag">{{ setupStore.availableJobFields.find(f=>f.value === role.jobField)?.label }}</span>
          <span class="tag level-tag">{{ setupStore.availableExperienceLevels.find(l=>l.value === role.experienceLevel)?.label }}</span>
        </div>

        <transition name="expand">
          <div v-if="expandedRoleId === role.id" class="role-details-expanded">
            <h4>Role Overview:</h4>
            <p>{{ role.description }}</p>

            <h4>Key Responsibilities:</h4>
            <ul><li v-for="(resp, i) in role.responsibilities" :key="`resp-${i}`">{{ resp }}</li></ul>

            <h4>Technical Skills:</h4>
            <ul class="skills-list"><li v-for="skill in role.technicalSkills" :key="skill.name" class="skill-item tech">
              <strong>{{ skill.name }}</strong> <span v-if="skill.importance" class="importance-badge {{ skill.importance.toLowerCase() }}">{{ skill.importance }}</span>
              <p v-if="skill.description" class="skill-desc">{{ skill.description }}</p>
            </li></ul>

            <h4>Soft Skills:</h4>
            <ul class="skills-list"><li v-for="skill in role.softSkills" :key="skill.name" class="skill-item soft">
              <strong>{{ skill.name }}</strong> <span v-if="skill.importance" class="importance-badge {{ skill.importance.toLowerCase() }}">{{ skill.importance }}</span>
              <p v-if="skill.description" class="skill-desc">{{ skill.description }}</p>
            </li></ul>

            <template v-if="role.industryOutlook"><h4>Industry Outlook:</h4><p>{{ role.industryOutlook }}</p></template>
            <template v-if="role.avgSalaryRange"><h4>Average Salary:</h4><p>{{ role.avgSalaryRange }}</p></template>

            <template v-if="role.commonInterviewPhases?.length">
              <h4>Common Interview Focus:</h4>
              <ul><li v-for="(phase, i) in role.commonInterviewPhases" :key="`focus-${i}`">{{ phase }}</li></ul>
            </template>

            <template v-if="role.learningResourceSuggestions?.length">
              <h4>Suggested Learning Resources:</h4>
              <ul class="learning-links">
                <li v-for="res in role.learningResourceSuggestions" :key="res.id">
                  <a :href="res.resourceUrl" target="_blank" rel="noopener noreferrer">
                    <font-awesome-icon :icon="getIconForResourceType(res.resourceType)" />
                    {{ res.resourceName }} (<em>targets: {{ res.skillTargeted }}</em>) - <span class="resource-type-badge">{{ res.resourceType }}</span>
                  </a>
                </li>
              </ul>
            </template>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { careerInsightsStore } from '../../stores/careerInsightsStore';
import { useInterviewSetupStore } from '../../stores/interviewSetup'; // For filter options
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const insightsStore = careerInsightsStore();
const setupStore = useInterviewSetupStore(); // For dropdown options

const selectedJobField = ref<string | null>(null);
const selectedLevel = ref<string | null>(null);
const searchTermInput = ref(''); // Local ref for debounced input
const expandedRoleId = ref<string | null>(null);

const updateFilters = () => {
  insightsStore.setJobFieldFilter(selectedJobField.value);
  insightsStore.setExperienceLevelFilter(selectedLevel.value);
};

let searchDebounceTimer: number;
const updateSearchTerm = (event: Event) => {
  const target = event.target as HTMLInputElement;
  searchTermInput.value = target.value; // Update local ref immediately for input responsiveness
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = window.setTimeout(() => {
    insightsStore.setSearchTerm(target.value);
  }, 300); // Debounce search term update
};

const toggleRoleExpansion = (roleId: string) => {
  if (expandedRoleId.value === roleId) {
    expandedRoleId.value = null; // Collapse if already open
  } else {
    expandedRoleId.value = roleId; // Open new one
  }
};

const truncateText = (text: string, length: number) => {
  return text.length > length ? text.substring(0, length) + '...' : text;
};

const getIconForResourceType = (type: 'Course' | 'Article' | 'Documentation' | 'Book') => {
  switch(type) {
    case 'Course': return 'graduation-cap';
    case 'Article': return 'newspaper';
    case 'Documentation': return 'book';
    case 'Book': return 'book-open';
    default: return 'link';
  }
};

onMounted(() => {
  // Load filters from store if they were persisted, or set them
  selectedJobField.value = insightsStore.selectedJobFieldFilter;
  selectedLevel.value = insightsStore.selectedExperienceLevelFilter;
  searchTermInput.value = insightsStore.searchTerm; // Initialize input field with store's search term

  if (insightsStore.jobRoleProfiles.length === 0) {
    insightsStore.fetchJobRoleProfiles();
  }
});
</script>

<style scoped>
.career-insights-view {
  padding: 1.5rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  color: var(--text-color);
}
/* Dark theme specific overrides if needed, assuming theme variables handle it */
.dark-theme-override .career-insights-view { }

.page-header-section { /* From LearningResourcesView */
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}
.page-title { /* From LearningResourcesView */
  font-size: 2rem; font-weight: 700; color: var(--text-color); margin-bottom: 0.5rem;
  display: flex; align-items: center; gap: 0.75rem;
}
[data-theme="dark"] .page-title { color: #ffffff; }
.page-title .title-icon { color: var(--primary-color); }
.page-subtitle { /* From LearningResourcesView */
  font-size: 1rem; color: var(--text-color); opacity: 0.8;
}
[data-theme="dark"] .page-subtitle { color: #a2aab3; }

.filters-and-search-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: var(--card-bg-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1 1 200px; /* Allow filters to take space */
}
.filter-group label {
  font-size: 0.85rem;
  font-weight: 500;
  opacity: 0.9;
}
.form-input.select-input {
  /* Uses global .form-input and adds select arrow */
  background-image: var(--select-button-svg);
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.25em;
  appearance: none; -webkit-appearance: none; -moz-appearance: none;
  padding-right: 2.5rem; /* Space for arrow */
  height: auto; /* Override if .form-input has fixed height */
  line-height: 1.5; /* Ensure text is not cut off */
}

.search-input-wrapper { /* From LearningResourcesView */
  display: flex; align-items: center; background-color: var(--input-bg-color);
  border-radius: 6px; border: 1px solid var(--input-border-color); padding-left: 0.75rem;
  flex: 2 1 300px; /* Allow search to take more space */
}
[data-theme="dark"] .search-input-wrapper { background-color: #2c3035; border-color: #40474f; }
.search-icon { color: var(--placeholder-color); font-size: 1rem; }
[data-theme="dark"] .search-icon { color: #a2aab3; }
.search-input { flex-grow: 1; background: none; border: none; outline: none; padding: 0.75rem; font-size: 0.95rem; color: var(--text-color); }
[data-theme="dark"] .search-input { color: #ffffff; }
.search-input::placeholder { color: var(--placeholder-color); }
[data-theme="dark"] .search-input::placeholder { color: #a2aab3; }


.loading-state, .empty-state { /* ... (Same as LearningResourcesView) ... */
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 3rem; text-align: center; min-height: 300px;
  background-color: var(--card-bg-color); border-radius: 8px; border: 1px solid var(--border-color);
}
.empty-state .empty-icon { font-size: 4rem; color: var(--primary-color); opacity: 0.5; margin-bottom: 1.5rem; }
.empty-state p { font-size: 1.1rem; margin-bottom: 1.5rem; opacity: 0.8; }
.spinner { /* ... (same spinner CSS) ... */ }


.roles-grid {
  display: grid;
  grid-template-columns: 1fr; /* Single column initially */
  gap: 1.5rem;
}
/* For wider screens, you might want 2 columns if cards are not too tall when expanded
@media (min-width: 900px) {
  .roles-grid { grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); }
} */


.role-card {
  background-color: var(--card-bg-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  padding: 1.25rem 1.5rem;
  transition: box-shadow 0.2s ease;
  cursor: pointer;
}
.role-card:hover {
  box-shadow: 0 5px 15px rgba(0,0,0,0.07);
}
[data-theme="dark"] .role-card:hover {
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  border-color: var(--primary-color);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}
.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-color);
}
.expand-icon {
  font-size: 1rem;
  color: var(--text-color);
  opacity: 0.7;
}
.card-description-summary {
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.85;
  line-height: 1.5;
  margin-bottom: 1rem;
}
[data-theme="dark"] .card-description-summary { color: #c0c5cb; }

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem; /* Add some space above tags */
}
.tag {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.6rem;
  border-radius: 0.25rem;
  background-color: var(--border-color);
  color: var(--text-color);
  opacity: 0.9;
}
.job-field-tag { background-color: color-mix(in srgb, var(--primary-color) 20%, transparent); color: var(--primary-color); }
.level-tag { background-color: color-mix(in srgb, var(--secondary-color) 20%, transparent); color: var(--secondary-color); }


.role-details-expanded {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  font-size: 0.9rem;
  line-height: 1.6;
}
.role-details-expanded h4 {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-color);
  margin-top: 1.25rem;
  margin-bottom: 0.6rem;
}
[data-theme="dark"] .role-details-expanded h4 { color: #e8e8e8; }
.role-details-expanded p { margin-bottom: 0.75rem; opacity: 0.9; }
.role-details-expanded ul {
  list-style: disc;
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;
}
.role-details-expanded ul li { margin-bottom: 0.3rem; }

.skills-list .skill-item {
  margin-bottom: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: var(--bg-color); /* Slightly different background for skill items */
  border-radius: 4px;
  border-left: 3px solid var(--primary-color);
}
[data-theme="dark"] .skills-list .skill-item {
  background-color: #23272b;
}

.skill-item strong { font-weight: 500; }
.skill-item .importance-badge {
  font-size: 0.7rem;
  font-weight: bold;
  padding: 0.15rem 0.4rem;
  border-radius: 0.25rem;
  margin-left: 0.5rem;
  text-transform: uppercase;
  color: white;
}
.importance-badge.high { background-color: #dc3545; } /* Red */
.importance-badge.medium { background-color: #ffc107; color: #333;} /* Yellow */
.importance-badge.low { background-color: #28a745; } /* Green */
[data-theme="dark"] .importance-badge.medium { background-color: #e6a700; color: #111; }

.skill-desc {
  font-size: 0.8rem;
  opacity: 0.7;
  margin-left: 0.25rem;
  margin-top: 0.15rem;
}
.learning-links li a {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.9rem;
}
.learning-links li a:hover { text-decoration: underline; }
.learning-links li .fa-icon { font-size: 0.9em; }
.learning-links li em { font-size: 0.8em; opacity: 0.7; }
.learning-links .resource-type-badge {
  font-size: 0.7rem;
  background-color: var(--border-color);
  padding: 0.1rem 0.3rem;
  border-radius: 0.25rem;
  margin-left: 0.3rem;
  text-transform: capitalize;
  opacity: 0.8;
}

/* Transition for expansion */
.expand-enter-active, .expand-leave-active {
  transition: all 0.3s ease-out;
  max-height: 1000px; /* Adjust if content can be taller */
  opacity: 1;
}
.expand-enter-from, .expand-leave-to {
  max-height: 0;
  opacity: 0;
  margin-top: 0;
  padding-top: 0;
  overflow: hidden;
}
</style>