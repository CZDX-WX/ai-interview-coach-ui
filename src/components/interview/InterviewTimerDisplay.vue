<template>
  <div class="timer-display">
    <div class="time-segment">
      <span>{{ formattedTime.hours }}</span>
      <small>小时</small>
    </div>
    <div class="time-separator">:</div>
    <div class="time-segment">
      <span>{{ formattedTime.minutes }}</span>
      <small>分钟</small>
    </div>
    <div class="time-separator">:</div>
    <div class="time-segment">
      <span>{{ formattedTime.seconds }}</span>
      <small>秒</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  elapsedSeconds: number;
}>();

const formattedTime = computed(() => {
  const totalSeconds = Math.max(0, props.elapsedSeconds); // 确保不为负
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
});
</script>

<style scoped>
.timer-display {
  display: flex;
  justify-content: center; /* 居中显示 */
  align-items: center; /* 垂直居中时间数字和标签 */
  gap: 0.25rem; /* 各部分之间的间距 */
  text-align: center;
  color: var(--text-color);
  background-color: var(--card-bg-color); /* 给计时器一个背景，使其像一个整体 */
  padding: 0.75rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
[data-theme="dark"] .timer-display {
  color: #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.time-segment {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #293038; /* 来自原型图的暗色背景 */
  padding: 0.5rem 0.75rem; /* 调整内边距 */
  border-radius: 0.375rem; /* rounded-xl */
  min-width: 60px; /* 确保最小宽度 */
  line-height: 1.2;
}
[data-theme="light"] .time-segment { /* 亮色主题下的样式 */
  background-color: var(--border-color);
  color: var(--text-color);
}
[data-theme="dark"] .time-segment { /* 暗色主题下的样式 */
  background-color: #293038;
  color: #ffffff;
}


.time-segment span {
  font-size: 1.75rem; /* 调整字体大小 */
  font-weight: bold;
}
.time-segment small {
  font-size: 0.7rem; /* 调整字体大小 */
  opacity: 0.8;
  margin-top: 0.15rem;
  text-transform: uppercase; /* 可选，例如 HOURS, MINUTES */
}
.time-separator {
  font-size: 1.5rem;
  font-weight: bold;
  padding: 0 0.2rem; /* 分隔符周围的间距 */
  opacity: 0.7;
  align-self: center; /* 使冒号与数字的中心对齐 */
  line-height: 1; /* 确保冒号垂直居中 */
}
</style>