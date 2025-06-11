<template>
  <div class="interview-controls-container">
    <InterviewTimerDisplay :elapsedSeconds="elapsedSeconds" class="timer-section"/>

    <div class="action-buttons-column">
      <button
          @click="$emit('primary-action')"
          class="control-button primary-action-button"
          :disabled="isPrimaryButtonDisabledComputed"
      >
        <font-awesome-icon :icon="primaryButtonIconComputed" />
        {{ primaryButtonTextComputed }}
      </button>

      <button @click="$emit('end-interview-early')" class="control-button end-interview-early-button">
        <font-awesome-icon :icon="['fas', 'times-circle']" /> 提前结束面试
      </button>
    </div>

    <div class="recording-status">
      <font-awesome-icon :icon="['fas', 'circle']" :class="['status-dot', { recording: isRecording }]" />
      {{ isRecording ? '正在录制中' : '录制已暂停' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import InterviewTimerDisplay from './InterviewTimerDisplay.vue';
import { useInterviewSessionStore } from '@/stores/interviewSession';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  elapsedSeconds: number;
  isRecording: boolean;
  // 以下 props 从 sessionStore 获取，用于决定按钮状态和文本
  currentPhaseId?: string; // e.g., 'techQA', 'codingExercise'
  canGoNextSubQuestion: boolean; // For techQA or coding problems
  areAllSubQuestionsDone: boolean; // In current phase
  currentPhaseIndex: number;
  totalPhases: number;
}>();

defineEmits(['primary-action', 'end-interview-early']);

const sessionStore = useInterviewSessionStore(); // Not strictly needed here if all state comes via props

const isPrimaryButtonDisabledComputed = computed(() => {
  // 如果当前阶段有子问题 (技术问答或编程) 且未全部完成，则主按钮（此时是“下一题”或“提交代码并进入下一题”）的可用性由 canGoNextSubQuestion 决定
  // 如果“主要按钮”的含义是“下一阶段”，则在子问题未完成时禁用
  if ((props.currentPhaseId === 'techQA' || props.currentPhaseId === 'codingExercise') && !props.areAllSubQuestionsDone) {
    // 如果是技术问答的“下一题”
    if (props.currentPhaseId === 'techQA') return !props.canGoNextSubQuestion;
    // 如果是编程题，提交按钮在主界面，这里的按钮会是“下一阶段”，应该禁用直到编程题完成
    // 实际上，编程题的“下一题”逻辑由主界面的提交按钮触发，所以这里的 primary button 就是“下一阶段”或“完成”
    // 因此，如果编程阶段题目未完，则此按钮（作为下一阶段/完成）应禁用
    if (props.currentPhaseId === 'codingExercise') return true; // 禁用，直到编程题通过其自身提交逻辑完成
  }

  // 如果是最后一个阶段并且所有子问题都完成了（此时按钮文本是“完成面试并生成报告”），则不禁用
  if (props.currentPhaseIndex >= props.totalPhases - 1 && props.areAllSubQuestionsDone) {
    return false;
  }
  // 对于没有子问题，或子问题已完成的阶段（非最后阶段），则不禁用
  if (props.areAllSubQuestionsDone) return false;

  return false; // 默认不禁用，除非有特定条件
});

const primaryButtonTextComputed = computed(() => {
  if (props.currentPhaseId === 'techQA' && props.canGoNextSubQuestion) {
    return '下一题 (技术)';
  }
  // 编程题的“下一题”在主面板的提交按钮处理

  if (props.areAllSubQuestionsDone) {
    if (props.currentPhaseIndex < props.totalPhases - 1) {
      return '进入下一阶段';
    }
    return '完成面试并生成报告';
  }

  // 如果当前阶段有子问题但未完成，按钮应被禁用，文本可以是“下一阶段”
  // 但此时按钮被禁用了，所以文本可能不那么重要，但保持一致性
  return '下一阶段';
});

const primaryButtonIconComputed = computed(() => {
  if (props.currentPhaseId === 'techQA' && props.canGoNextSubQuestion) {
    return ['fas', 'forward'];
  }
  if (props.areAllSubQuestionsDone && props.currentPhaseIndex >= props.totalPhases - 1) {
    return ['fas', 'flag-checkered'];
  }
  return ['fas', 'arrow-right'];
});

</script>

<style scoped>
.interview-controls-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  gap: 2rem; /* 增加计时器、按钮组、录制状态之间的间距 */
}

.timer-section {
  /* margin-bottom: 1rem; /* 由父级 gap 控制 */
}

.action-buttons-column {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* 按钮之间的垂直间距 */
  width: 100%;
}

.control-button {
  padding: 0.85rem 1rem; /* 统一按钮内边距 */
  font-size: 0.95rem;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, opacity 0.2s ease, transform 0.1s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem; /* 图标和文字间距 */
  width: 100%;
  text-align: center;
  line-height: 1.4; /* 确保文字良好显示 */
}
.control-button:hover:not(:disabled) {
  opacity: 0.85;
  transform: translateY(-1px); /* 轻微上浮效果 */
}
.control-button:active:not(:disabled) {
  transform: translateY(0px) scale(0.98);
}
.control-button:disabled {
  background-color: var(--border-color) !important;
  color: var(--text-color-muted) !important;
  cursor: not-allowed;
  opacity: 0.6;
}
.control-button .fa-icon {
  font-size: 1em;
  /* margin-right: 0.25em; /* 由 gap 控制 */
}

.control-button.primary-action-button {
  background-color: var(--primary-color);
  color: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
[data-theme="dark"] .control-button.primary-action-button {
  /* 可以为暗色主题下的主按钮设置特定颜色，如果var(--primary-color)不理想 */
  /* background-color: #4b89fc; */
  /* color: white; */
}

.control-button.end-interview-early-button {
  background-color: var(--card-bg-color); /* 更柔和的背景 */
  color: var(--text-color);
  border: 1px solid var(--border-color);
}
[data-theme="dark"] .control-button.end-interview-early-button {
  background-color: #374151; /* 暗色主题下的次要按钮背景 */
  color: #e4e6eb;
  border: 1px solid #4b5563;
}
.control-button.end-interview-early-button:hover:not(:disabled) {
  background-color: var(--border-color);
}
[data-theme="dark"] .control-button.end-interview-early-button:hover:not(:disabled) {
  background-color: #4b5563;
}


.recording-status {
  margin-top: auto; /* 推到底部 */
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  text-align: center;
  font-size: 0.85rem;
  opacity: 0.9;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--text-color);
}
[data-theme="dark"] .recording-status { color: #a2aab3; }
.status-dot { font-size: 0.7em; color: #888; transition: color 0.3s ease; }
.status-dot.recording { color: #ef4444; animation: pulse 1.5s infinite; }
@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
</style>