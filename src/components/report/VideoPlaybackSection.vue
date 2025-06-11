<template>
  <section class="report-section video-playback-section">
    <h2 class="section-title">面试回放</h2>
    <div class="video-placeholder-wrapper">
      <div v-if="videoUrl" class="video-player-container">
        <video controls :src="videoUrl" class="actual-video-player">
          您的浏览器不支持视频播放。
        </video>
      </div>
      <div v-else class="video-placeholder-content">
        <font-awesome-icon :icon="['fas', 'video']" class="placeholder-icon"/>
        <p>当前面试的视频回放将在此处提供。</p>
        <small>(功能暂未完全实现，此处为占位符)</small>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

defineProps<{
  videoUrl?: string; // Optional URL to the actual video
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
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}
[data-theme="dark"] .section-title {
  color: #ffffff;
}

.video-placeholder-wrapper {
  background-color: #000; /* Dark background for video area */
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999; /* Light grey text on dark background */
  border: 1px solid var(--border-color);
  overflow: hidden; /* If actual video player is used */
}

.video-player-container {
  width: 100%;
  height: 100%;
}
.actual-video-player {
  width: 100%;
  height: 100%;
  border-radius: इन्हेरिट; /* Inherit border radius from wrapper */
}

.video-placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
}
.placeholder-icon {
  font-size: 3.5rem; /* Larger icon */
  color: rgba(255,255,255,0.4); /* More subtle icon color */
  margin-bottom: 1rem;
}
.video-placeholder-content p {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: rgba(255,255,255,0.8);
}
.video-placeholder-content small {
  font-size: 0.8rem;
  opacity: 0.6;
}
</style>