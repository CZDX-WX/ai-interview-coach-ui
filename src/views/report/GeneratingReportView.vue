<template>
  <div class="generating-report-view">
    <div class="loading-content">
      <div class="spinner">
        <div></div><div></div><div></div><div></div>
      </div>
      <h2>Generating Your Interview Report</h2>
      <p>Our AI is analyzing your performance across various dimensions.</p>
      <p>This might take a few moments...</p>
      <div class="progress-bar-container">
        <div class="progress-bar" :style="{ width: progress + '%' }"></div>
      </div>
      <p class="progress-text">{{ messages[currentMessageIndex] }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useThemeStore } from '../../stores/theme'; // If you want to force a theme

const route = useRoute();
const router = useRouter();
const themeStore = useThemeStore();

const progress = ref(0);
const messages = [
  "Initializing analysis...",
  "Processing video data (expressions, body language)...",
  "Analyzing audio for tone and clarity...",
  "Evaluating content and technical responses...",
  "Assessing problem-solving approaches...",
  "Compiling multi-modal feedback...",
  "Finalizing report structure...",
  "Almost there!"
];
const currentMessageIndex = ref(0);
let progressInterval: number;
let messageInterval: number;
const originalTheme = ref<string | null>(null);

onMounted(() => {
  originalTheme.value = themeStore.currentTheme;
  // Optionally force a theme for this page if desired, e.g., dark
  // themeStore.setTheme('dark');

  const sessionId = route.params.sessionId as string;
  let duration = 8000; // Simulate 8 seconds for report generation
  const increment = 100 / (duration / 100); // Progress increment per 100ms

  progressInterval = window.setInterval(() => {
    progress.value = Math.min(100, progress.value + increment);
    if (progress.value >= 100) {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      router.replace({ name: 'ReportView', params: { sessionId } });
    }
  }, 100);

  messageInterval = window.setInterval(() => {
    currentMessageIndex.value = (currentMessageIndex.value + 1) % messages.length;
  }, duration / messages.length);
});

onBeforeUnmount(() => {
  clearInterval(progressInterval);
  clearInterval(messageInterval);
  // Revert theme if it was forced
  // if (originalTheme.value) {
  //   themeStore.setTheme(originalTheme.value as 'light' | 'dark');
  // }
});
</script>

<style scoped>
.generating-report-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 3.8rem); /* Adjust based on your DefaultLayout header height */
  background-color: var(--bg-color);
  color: var(--text-color);
  padding: 2rem;
  text-align: center;
}

.loading-content {
  max-width: 500px;
}

.loading-content h2 {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.loading-content p {
  font-size: 1rem;
  opacity: 0.8;
  margin-bottom: 0.75rem;
}

.progress-bar-container {
  width: 100%;
  height: 10px;
  background-color: var(--border-color);
  border-radius: 5px;
  overflow: hidden;
  margin: 2rem 0 1rem;
}

.progress-bar {
  height: 100%;
  background-color: var(--primary-color);
  border-radius: 5px;
  transition: width 0.1s linear;
}
.progress-text {
  font-size: 0.9rem;
  font-style: italic;
  min-height: 1.2em; /* Prevent layout jump */
}

/* Simple CSS Spinner */
.spinner {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 2rem;
}
.spinner div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 64px;
  height: 64px;
  margin: 8px;
  border: 5px solid var(--primary-color);
  border-radius: 50%;
  animation: spinner-animation 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
  border-color: var(--primary-color) transparent transparent transparent;
}
.spinner div:nth-child(1) { animation-delay: -0.45s; }
.spinner div:nth-child(2) { animation-delay: -0.3s; }
.spinner div:nth-child(3) { animation-delay: -0.15s; }
@keyframes spinner-animation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>