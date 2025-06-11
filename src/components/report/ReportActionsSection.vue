<template>
  <section class="report-actions-section">
    <button @click="emitDownloadReport" class="form-button secondary-button report-action-button">
      <font-awesome-icon :icon="['fas', 'download']" /> 下载报告 (PDF)
    </button>
    <router-link :to="{ name: 'InterviewSetup' }" class="form-button report-action-button">
      <font-awesome-icon :icon="['fas', 'calendar-plus']" /> 安排下一次练习
    </router-link>
  </section>
</template>

<script setup lang="ts">
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
// import { RouterLink } from 'vue-router'; // RouterLink is globally available

const emit = defineEmits(['download-report']);

const emitDownloadReport = () => {
  alert("（模拟功能）报告下载功能暂未实现。"); // Placeholder for actual PDF generation
  emit('download-report');
};
</script>

<style scoped>
.report-actions-section {
  margin-top: 2.5rem; /* Increased spacing above actions */
  padding-top: 1.5rem; /* Space above buttons */
  border-top: 1px solid var(--border-color); /* Separator line */
  display: flex;
  gap: 1rem;
  justify-content: center; /* Center buttons */
  flex-wrap: wrap; /* Allow buttons to wrap on smaller screens */
}
.report-action-button { /* Extends .form-button */
  padding: 0.8rem 1.75rem; /* Larger padding for main actions */
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem; /* Space between icon and text */
  min-width: 220px; /* Ensure buttons have a good width */
  justify-content: center;
  border-radius: 6px; /* Consistent with other buttons */
}
.report-action-button.secondary-button { /* Style from global .form-button, ensure it's defined */
  background-color: var(--card-bg-color); /* Or specific secondary style */
  color: var(--text-color);
  border: 1px solid var(--primary-color); /* Primary color border for secondary */
}
.report-action-button.secondary-button:hover {
  background-color: color-mix(in srgb, var(--border-color) 50%, var(--card-bg-color) 50%);
  border-color: color-mix(in srgb, var(--primary-color) 80%, black 20%);
}
</style>