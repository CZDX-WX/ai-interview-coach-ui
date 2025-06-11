<template>
  <div class="generating-report-view">
    <div class="loading-content">
      <div class="spinner">
        <div></div><div></div><div></div><div></div>
      </div>
      <h2>正在生成你的面试报告</h2>
      <p>我们的AI正在从各个维度分析您的表现。</p>
      <p>这可能需要一些时间...</p>
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
import { useThemeStore } from '@/stores/theme'; // If you want to force a theme

const route = useRoute();
const router = useRouter();
const themeStore = useThemeStore();

const progress = ref(0);
// 中文化加载消息
const messages = [
  "正在初始化分析引擎...",
  "处理视频数据（表情、肢体语言）...",
  "分析音频（语气、清晰度）...",
  "评估回答内容与技术水平...",
  "分析问题解决思路与方法...",
  "整合多模态反馈信息...",
  "正在生成报告结构...",
  "即将完成，请稍候！"
];
const currentMessageIndex = ref(0);
let progressInterval: number;
let messageInterval: number;
const originalTheme = ref<string | null>(null);

onMounted(() => {
  originalTheme.value = themeStore.currentTheme;
  // themeStore.setTheme('dark'); // 如果需要强制此页面的主题

  const sessionId = route.params.sessionId as string;
  let duration = 8000; // 模拟 8 秒报告生成时间
  const totalMessages = messages.length;
  // 确保每个消息至少显示一段时间
  const messageDisplayTime = duration / totalMessages;
  // 进度条增长也基于消息切换，或者保持原来的时间基准
  // const increment = 100 / (duration / 100);
  const progressSteps = 100; // 总进度步数
  const timePerProgressStep = duration / progressSteps;


  progressInterval = window.setInterval(() => {
    progress.value = Math.min(100, progress.value + (100/progressSteps)); // 每次增加1% (假设100步)
    if (progress.value >= 100) {
      clearInterval(progressInterval);
      // clearInterval(messageInterval); // messageInterval 现在可以自行停止
      // 确保在跳转前最后一条消息有机会显示
      setTimeout(() => {
        router.replace({ name: 'ReportView', params: { sessionId } });
      }, messageDisplayTime / 2); // 在最后一条消息显示一半时间后跳转
    }
  }, timePerProgressStep);

  let msgIdx = 0;
  currentMessageIndex.value = msgIdx;
  messageInterval = window.setInterval(() => {
    msgIdx++;
    if (msgIdx < totalMessages) {
      currentMessageIndex.value = msgIdx;
    } else {
      clearInterval(messageInterval); // 所有消息都显示完毕
    }
  }, messageDisplayTime);
});

onBeforeUnmount(() => {
  clearInterval(progressInterval);
  clearInterval(messageInterval);
  // if (originalTheme.value && themeStore.currentTheme !== originalTheme.value) { // 仅当主题被强制更改时才恢复
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