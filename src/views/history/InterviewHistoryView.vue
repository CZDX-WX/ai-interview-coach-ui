<template>
  <div class="interview-history-view">
    <h1 class="page-title">
      <font-awesome-icon :icon="['fas', 'history']" class="title-icon"/>
      My Interview History
    </h1>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"><div></div><div></div><div></div><div></div></div>
      <p>Loading interview history...</p>
    </div>

    <div v-else-if="allHistoryItems.length === 0" class="empty-state">
      <font-awesome-icon :icon="['fas', 'folder-open']" class="empty-icon"/>
      <p>You haven't completed any interviews yet.</p>
      <router-link :to="{ name: 'InterviewSetup' }" class="form-button primary-button">
        <font-awesome-icon :icon="['fas', 'play-circle']" /> Start Your First Interview
      </router-link>
    </div>

    <div v-else class="history-table-container">
      <table class="history-table">
        <thead>
        <tr>
          <th>Date</th>
          <th>Job Profile Interviewed For</th>
          <th>Status / Score</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in sortedHistoryItems" :key="item.sessionId">
          <td data-label="Date">{{ formatDate(item.date) }}</td>
          <td data-label="Job Profile">{{ item.jobProfileDisplay }}</td>
          <td data-label="Status / Score">
              <span :class="['status-badge', getStatusClass(item.status, item.overallScore)]">
                {{ getStatusText(item.status, item.overallScore) }}
              </span>
          </td>
          <td data-label="Actions">
            <button
                @click="viewReport(item.sessionId)"
                class="action-button view-report-button"
                :disabled="item.status === 'Analysis Pending' || item.status === 'Error'"
                title="View Report"
            >
              <font-awesome-icon :icon="['fas', 'eye']" /> View Report
            </button>
          </td>
        </tr>
        </tbody>
      </table>
      <div class="pagination-controls" v-if="totalPages > 1">
        <button @click="currentPage--" :disabled="currentPage === 1" class="pagination-button">
          <font-awesome-icon :icon="['fas', 'chevron-left']" /> Previous
        </button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="currentPage++" :disabled="currentPage === totalPages" class="pagination-button">
          Next <font-awesome-icon :icon="['fas', 'chevron-right']" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import type { InterviewHistoryItem } from '../../types/historyTypes'; // Adjust path if you created this file
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useInterviewSetupStore } from '../../stores/interviewSetup'; // For job field labels

const router = useRouter();
const setupStore = useInterviewSetupStore(); // To resolve labels if needed

const allHistoryItems = ref<InterviewHistoryItem[]>([]);
const isLoading = ref(true);
const currentPage = ref(1);
const itemsPerPage = ref(10); // Or a suitable number

// Mock data fetching
const fetchInterviewHistory = async () => {
  isLoading.value = true;
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

  // Generate more diverse mock data
  const mockItems: InterviewHistoryItem[] = [];
  const jobFields = setupStore.availableJobFields;
  const experienceLevels = setupStore.availableExperienceLevels;
  const statuses: InterviewHistoryItem['status'][] = ['Report Ready', 'Analysis Pending', 'Completed', 'Error'];

  for (let i = 0; i < 25; i++) { // Create 25 mock items
    const date = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000 - i * 3 * 24 * 60 * 60 * 1000);
    const randomJobField = jobFields[Math.floor(Math.random() * jobFields.length)];
    const randomExperienceLevel = experienceLevels[Math.floor(Math.random() * experienceLevels.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const score = randomStatus === 'Report Ready' || randomStatus === 'Completed' ? Math.floor(Math.random() * 40) + 60 : undefined;

    mockItems.push({
      sessionId: `mockSess${100 + i}`,
      date: date.toISOString().split('T')[0], // YYYY-MM-DD
      jobProfileDisplay: `${randomJobField.label} - ${randomExperienceLevel.label}`,
      status: score ? 'Report Ready' : randomStatus, // If score, make it Report Ready
      overallScore: score,
    });
  }
  allHistoryItems.value = mockItems;
  isLoading.value = false;
};

const sortedHistoryItems = computed(() => {

  return [...paginatedHistoryItems.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

const totalPages = computed(() => {
  return Math.ceil(allHistoryItems.value.length / itemsPerPage.value);
});

const paginatedHistoryItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return allHistoryItems.value.slice(start, end);
});


const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getStatusText = (status: InterviewHistoryItem['status'], score?: number) => {
  if (status === 'Report Ready' && score !== undefined) {
    return `Score: ${score}/100`;
  }
  if (status === 'Completed' && score !== undefined) { // Treat 'Completed' same as 'Report Ready' if score exists
    return `Score: ${score}/100`;
  }
  return status.replace(/([A-Z])/g, ' $1').trim(); // Add space before caps
};

const getStatusClass = (status: InterviewHistoryItem['status'], score?: number) => {
  if (status === 'Report Ready' || (status === 'Completed' && score !== undefined)) {
    return score && score >= 75 ? 'status-good' : (score && score >= 50 ? 'status-average' : 'status-improvement');
  }
  if (status === 'Analysis Pending') {
    return 'status-pending';
  }
  if (status === 'Error') {
    return 'status-error';
  }
  return '';
};

const viewReport = (sessionId: string) => {
  const item = allHistoryItems.value.find(i => i.sessionId === sessionId);
  if (item && (item.status === 'Report Ready' || item.status === 'Completed' && item.overallScore !== undefined)) {
    router.push({ name: 'ReportView', params: { sessionId } });
  } else {
    alert("Report is not yet available for this interview.");
  }
};

onMounted(() => {
  fetchInterviewHistory();
});
</script>

<style scoped>
.interview-history-view {
  padding: 1.5rem 2rem;
  max-width: 1100px; /* Accommodate wider table */
  margin: 0 auto;
  color: var(--text-color);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.page-title .title-icon {
  color: var(--primary-color);
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  min-height: 300px; /* Ensure it takes some space */
  background-color: var(--card-bg-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}
.empty-state .empty-icon {
  font-size: 4rem;
  color: var(--primary-color);
  opacity: 0.5;
  margin-bottom: 1.5rem;
}
.empty-state p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  opacity: 0.8;
}
.empty-state .form-button { /* Use existing form-button style */
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
}


.history-table-container {
  background-color: var(--card-bg-color);
  border-radius: 8px;
  overflow-x: auto; /* Allow horizontal scroll on smaller screens */
  border: 1px solid var(--border-color);
  box-shadow: 0 3px 10px rgba(0,0,0,0.05);
}
[data-theme="dark"] .history-table-container {
  box-shadow: 0 3px 10px rgba(0,0,0,0.15);
}

.history-table {
  width: 100%;
  border-collapse: collapse; /* Remove default table borders/spacing */
}

.history-table th, .history-table td {
  padding: 1rem 1.25rem; /* px-4 py-3 */
  text-align: left;
  font-size: 0.9rem; /* text-sm */
  line-height: 1.5; /* leading-normal */
}

.history-table thead tr {
  background-color: var(--bg-color); /* Slightly different for header row */
  border-bottom: 2px solid var(--border-color); /* border-b-[#dbe1e6] */
}
[data-theme="dark"] .history-table thead tr {
  background-color: color-mix(in srgb, var(--card-bg-color) 80%, black 20%);
}


.history-table th {
  color: var(--text-color); /* text-[#111518] */
  font-weight: 600; /* font-medium */
  text-transform: uppercase;
  letter-spacing: 0.025em;
  opacity: 0.9;
}

.history-table tbody tr {
  border-bottom: 1px solid var(--border-color); /* border-t border-t-[#dbe1e6] */
}
.history-table tbody tr:last-child {
  border-bottom: none;
}
.history-table tbody tr:hover {
  background-color: color-mix(in srgb, var(--primary-color) 5%, var(--card-bg-color) 95%);
}

.history-table td {
  color: var(--text-color); /* text-[#60768a] from prototype, but var(--text-color) is more theme-consistent */
  opacity: 0.9;
  height: 72px; /* From prototype for row height */
  vertical-align: middle;
}
.history-table td[data-label="Job Profile"] {
  font-weight: 500;
  /* width: 35%; /* Example width distribution */
}
.history-table td[data-label="Date"] {
  /* width: 20%; */
}
.history-table td[data-label="Status / Score"] {
  /* width: 25%; */
}
.history-table td[data-label="Actions"] {
  /* width: 20%; */
  text-align: right;
}


.status-badge {
  padding: 0.3rem 0.75rem;
  border-radius: 9999px; /* rounded-full */
  font-size: 0.8rem;
  font-weight: 500;
  display: inline-block;
  min-width: 120px; /* For consistent width */
  text-align: center;
}
.status-badge.status-good { /* Score >= 75 */
  background-color: #28a74520; /* Green with alpha */
  color: #1c7430;
}
[data-theme="dark"] .status-badge.status-good {
  background-color: #2f5c3a40;
  color: #68d391;
}
.status-badge.status-average { /* Score 50-74 */
  background-color: #ffc10720; /* Yellow with alpha */
  color: #b98900;
}
[data-theme="dark"] .status-badge.status-average {
  background-color: #574b1e40;
  color: #ffda6a;
}
.status-badge.status-improvement { /* Score < 50 */
  background-color: #dc354520; /* Red with alpha */
  color: #a71d2a;
}
[data-theme="dark"] .status-badge.status-improvement {
  background-color: #5c2f2f40;
  color: #fc8181;
}
.status-badge.status-pending {
  background-color: #6c757d20; /* Grey with alpha */
  color: #495057;
}
[data-theme="dark"] .status-badge.status-pending {
  background-color: #4a4a4a40;
  color: #adb5bd;
}
.status-badge.status-error {
  background-color: #dc354530; /* Red for error */
  color: #a71d2a;
  border: 1px dashed #a71d2a80;
}
[data-theme="dark"] .status-badge.status-error {
  background-color: #5c2f2f50;
  color: #fc8181;
  border-color: #fc818180;
}


.action-button {
  /* Basic button styling, can extend .form-button */
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 500;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid var(--primary-color);
  background-color: transparent;
  color: var(--primary-color);
}
.action-button:hover {
  background-color: var(--primary-color);
  color: white; /* Assuming primary color contrasts with white */
}
.action-button:disabled {
  border-color: var(--border-color);
  color: var(--text-color);
  opacity: 0.5;
  cursor: not-allowed;
}
.action-button:disabled:hover {
  background-color: transparent;
}
[data-theme="dark"] .action-button:hover {
  color: var(--bg-color); /* Text color on hover for dark theme */
}
[data-theme="dark"] .action-button:disabled {
  color: var(--text-color);
}

/* Responsive Table: On smaller screens, you might want to switch to a card layout */
/* For now, horizontal scroll is enabled by history-table-container */
/* The @container queries from prototype are hard to replicate without actual container query support
   or complex JS. A simpler approach for responsiveness: */
@media (max-width: 768px) {
  .history-table thead {
    /* display: none; /* Hide headers on small screens if using card layout */
  }
  .history-table tr {
    /* display: block; /* Stack rows like cards */
    /* margin-bottom: 1rem; */
    /* border: 1px solid var(--border-color); */
    /* border-radius: 6px; */
  }
  .history-table td {
    /* display: block; */
    /* text-align: right; */
    /* padding-left: 50%; /* Make space for label */
    /* position: relative; */
    /* border-bottom: 1px dotted var(--border-color); */
  }
  .history-table td:last-child {
    /* border-bottom: none; */
  }
  .history-table td::before {
    /* content: attr(data-label); */
    /* position: absolute; */
    /* left: 0.75rem; */
    /* width: 45%; */
    /* padding-right: 0.75rem; */
    /* font-weight: bold; */
    /* text-align: left; */
  }
  .history-table td[data-label="Actions"] {
    /* text-align: center; /* Center action button */
    /* padding-left: 0; */
  }
  /* The above commented out CSS is an example of how one *might* approach card-style tables.
     For simplicity and robustness, the current implementation relies on horizontal scroll
     provided by .history-table-container for smaller screens. */
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem 0;
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
}
.pagination-button:hover:not(:disabled) {
  background-color: var(--border-color);
}
.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Spinner for loading state */
.spinner { display: inline-block; position: relative; width: 60px; height: 60px; margin-bottom: 1rem; }
.spinner div { box-sizing: border-box; display: block; position: absolute; width: 48px; height: 48px; margin: 6px; border: 4px solid var(--primary-color); border-radius: 50%; animation: spinner-animation 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite; border-color: var(--primary-color) transparent transparent transparent; }
.spinner div:nth-child(1) { animation-delay: -0.45s; }
.spinner div:nth-child(2) { animation-delay: -0.3s; }
.spinner div:nth-child(3) { animation-delay: -0.15s; }
@keyframes spinner-animation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

</style>