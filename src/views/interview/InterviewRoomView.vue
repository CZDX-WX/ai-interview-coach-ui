<template>
  <div class="interview-room-view" :class="{ 'dark-theme-override': true }">
    <InterviewHeaderInfo
        title="实时面试"
        icon="microphone-alt"
        :jobFieldLabel="sessionStore.interviewType?.jobFieldLabel"
        :experienceLevelLabel="sessionStore.interviewType?.experienceLevelLabel"
        class="room-global-header"
    />

    <div class="interview-main-layout">
      <div class="left-panel-content-area">
        <InterviewPhaseProgress
            v-if="sessionStore.currentPhase"
            :currentPhaseName="sessionStore.currentPhase.name"
            :currentPhaseIndex="sessionStore.currentPhaseIndex"
            :totalPhases="sessionStore.totalPhases"
            :progressPercentage="sessionStore.progressPercentage"
            :estimatedTime="sessionStore.currentPhase.estimatedTime"
            :subQuestionCounterText="subQuestionCounterTextComputed"
            class="phase-progress-bar"
        />

        <div v-if="sessionStore.isCodingPhaseActive && sessionStore.currentCodingProblemTimer" class="coding-timer-display">
          <font-awesome-icon :icon="['far', 'clock']" /> 剩余时间：<strong>{{ sessionStore.getCodingProblemTimeRemainingFormatted }}</strong>
        </div>

        <QuestionDisplay
            :questionText="sessionStore.currentQuestionText"
            :isCodingProblem="sessionStore.isCodingPhaseActive"
            class="question-display-area"
        />

        <CodeInputArea
            v-if="sessionStore.isCodingPhaseActive"
            v-model="userCodeSolution"
            placeholderText="在此输入您的代码方案..."
            language="javascript" class="code-input-area-main"
        />
        <button
            v-if="sessionStore.isCodingPhaseActive"
            @click="handleSubmitCode"
            class="control-button submit-code-button-main"
            :disabled="isSubmittingCode"
        >
          <font-awesome-icon :icon="['fas', 'paper-plane']" />
          {{ submitCodeButtonText }}
        </button>
      </div>

      <aside class="right-sidebar-controls">
        <div class="user-video-feed-small-wrapper">
          <UserCameraFeed
              :stream="cameraStream"
              :is-active="cameraStreamActive"
              :error-message="cameraError"
              :show-retry-button="!cameraStreamActive && !!cameraError"
              @retry="startMedia"
          />
        </div>

        <InterviewControls
            :elapsedSeconds="elapsedTime"
            :isRecording="isActuallyRecording"
            :currentPhaseId="sessionStore.currentPhase?.id"
            :canGoNextSubQuestion="sessionStore.isTechnicalPhaseActive ? sessionStore.canGoToNextTechnicalQuestion : sessionStore.canGoToNextCodingProblem"
            :areAllSubQuestionsDone="sessionStore.areAllSubQuestionsCompletedInCurrentPhase"
            :currentPhaseIndex="sessionStore.currentPhaseIndex"
            :totalPhases="sessionStore.totalPhases"
            @primary-action="handlePrimaryAction"
            @end-interview-early="handleEndInterviewEarly"
            class="interview-controls-stack"
        />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useThemeStore } from '@/stores/theme';
import { useInterviewSessionStore } from '@/stores/interviewSession';
import { useInterviewSetupStore } from '@/stores/interviewSetup';

// 导入子组件 (保持不变)
import InterviewHeaderInfo from '../../components/interview/InterviewHeaderInfo.vue';
import InterviewPhaseProgress from '../../components/interview/InterviewPhaseProgress.vue';
import UserCameraFeed from '../../components/interview/UserCameraFeed.vue';
import QuestionDisplay from '../../components/interview/QuestionDisplay.vue';
import CodeInputArea from '../../components/interview/CodeInputArea.vue';
import InterviewControls from '../../components/interview/InterviewControls.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'; // 如果直接使用

const route = useRoute();
const router = useRouter();
const themeStore = useThemeStore();
const sessionStore = useInterviewSessionStore();
const setupStore = useInterviewSetupStore();

const cameraStream = ref<MediaStream | null>(null);
const mediaRecorder = ref<MediaRecorder | null>(null);
const recordedChunks = ref<Blob[]>([]);
const currentPhaseBlobs = ref<Blob[]>([]);
const userCodeSolution = ref('');

const elapsedTime = ref(0); // 总面试计时器
let mainTimerInterval: number;

const originalTheme = ref<string | null>(null);
const cameraStreamActive = ref(false);
// 修正1: cameraError 类型从 string | null 改为 string | undefined
const cameraError = ref<string | undefined>(undefined);
const isActuallyRecording = ref(false);
const isSubmittingCode = ref(false);

let codingProblemCountdownInterval: number | null = null;


const subQuestionCounterTextComputed = computed(() => {
  if (sessionStore.isTechnicalPhaseActive && sessionStore.totalTechnicalQuestionsInPhase > 0) {
    return `(问题 ${sessionStore.currentTechnicalQuestionNumber}/${sessionStore.totalTechnicalQuestionsInPhase})`;
  }
  if (sessionStore.isCodingPhaseActive && sessionStore.totalCodingProblemsInPhase > 0) {
    return `(编程题 ${sessionStore.currentCodingProblemNumber}/${sessionStore.totalCodingProblemsInPhase})`;
  }
  return '';
});

const submitCodeButtonText = computed(() => {
  if (isSubmittingCode.value) return "提交中...";
  return sessionStore.canGoToNextCodingProblem ? '提交并进入下一题' : '提交当前解答';
});

const startMedia = async () => {
  const camId = route.query.cam as string | undefined;
  const micId = route.query.mic as string | undefined;
  cameraError.value = undefined; // 初始化为 undefined
  cameraStreamActive.value = false;
  if (cameraStream.value) { cameraStream.value.getTracks().forEach(track => track.stop()); cameraStream.value = null; }

  try {
    const videoConstraints = camId ? { deviceId: { exact: camId } } : true;
    const audioConstraints = micId ? { deviceId: { exact: micId } } : true;

    const videoOnlyStream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: false });
    cameraStream.value = videoOnlyStream;
    cameraStreamActive.value = true;

    const combinedStreamForRecording = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: audioConstraints });
    setupMediaRecorder(combinedStreamForRecording);
    startPhaseRecording();

  } catch (err: any) {
    console.error("访问媒体设备时出错:", err);
    cameraError.value = "无法访问摄像头/麦克风。请检查权限和设备选择。";
    cameraStream.value = null;
  }
};

const setupMediaRecorder = (stream: MediaStream) => {
  let options = { mimeType: '' };
  if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) { options.mimeType = 'video/webm;codecs=vp9,opus'; }
  else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) { options.mimeType = 'video/webm;codecs=vp8,opus'; }
  else if (MediaRecorder.isTypeSupported('video/webm')) { options.mimeType = 'video/webm'; }
  else { alert("您的浏览器不支持合适的视频录制格式。"); return; }

  try {
    mediaRecorder.value = new MediaRecorder(stream, options);
    mediaRecorder.value.ondataavailable = (event) => { if (event.data.size > 0) currentPhaseBlobs.value.push(event.data); };
    mediaRecorder.value.onstart = () => { isActuallyRecording.value = true; console.log('录制器已为阶段启动:', sessionStore.currentPhase?.name);};
    mediaRecorder.value.onstop = () => {
      isActuallyRecording.value = false;
      if (currentPhaseBlobs.value.length > 0) {
        const phaseBlob = new Blob(currentPhaseBlobs.value, { type: mediaRecorder.value?.mimeType });
        console.log(`阶段 ${sessionStore.currentPhase?.name} 录制已停止。大小: ${phaseBlob.size} 字节`);
        recordedChunks.value.push(phaseBlob);
        currentPhaseBlobs.value = [];
      }
      // isRecording 状态由 sessionStore 的 endInterview 控制，这里不再重复判断
      // processAllRecordings 会在 InterviewRoomView 卸载前或明确结束时调用
    };
    mediaRecorder.value.onerror = (event) => { console.error('录制器错误:', event); isActuallyRecording.value = false;};
  } catch (e) {
    console.error("创建 MediaRecorder 失败:", e);
    alert("无法初始化录制功能。");
  }
};

const startPhaseRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state === 'inactive') {
    currentPhaseBlobs.value = [];
    mediaRecorder.value.start(10000);
    sessionStore.isRecording = true;
  }
};
const stopCurrentPhaseRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
    mediaRecorder.value.stop();
  }
  // sessionStore.isRecording = false; // 标记意图，实际状态由 onstop 更新
};
const processAllRecordings = () => {
  console.log(`准备处理 ${recordedChunks.value.length} 个录制片段。`);
  recordedChunks.value.forEach((blob, index) => {
    const phaseName = sessionStore.phases[index]?.name || `阶段 ${index + 1}`;
    console.log(`处理最终的 ${phaseName} 录制文件, 大小: ${blob.size}`);
    // 在这里添加实际的上传逻辑
  });
  recordedChunks.value = [];
};

const startTimer = () => { stopTimer(); mainTimerInterval = window.setInterval(() => elapsedTime.value++, 1000); };
const stopTimer = () => { clearInterval(mainTimerInterval); };


const setupCodingProblemSpecificTimer = () => {
  const phase = sessionStore.currentPhase;
  if (phase?.id === 'codingExercise' && phase.codingProblems && phase.currentQuestionIndex !== undefined) {
    const problem = phase.codingProblems[phase.currentQuestionIndex];
    sessionStore.startCodingProblemTimer(problem.id, 20);

    if (codingProblemCountdownInterval) clearInterval(codingProblemCountdownInterval);

    codingProblemCountdownInterval = window.setInterval(() => {
      if (sessionStore.currentCodingProblemTimer && sessionStore.currentCodingProblemTimer.timeRemainingSeconds !== undefined) {
        const newRemaining = sessionStore.currentCodingProblemTimer.timeRemainingSeconds - 1;
        sessionStore.updateCodingProblemTimeRemaining(newRemaining);

        if (newRemaining <= 0) {
          console.log(`编程题 ${problem.id} 时间到，自动提交。`);
          if (codingProblemCountdownInterval) clearInterval(codingProblemCountdownInterval);

          sessionStore.submitCodingSolution(userCodeSolution.value, problem.id, phase.id, 'auto');

          if (sessionStore.canGoToNextCodingProblem) {
            sessionStore.nextSubQuestion(); // 会触发 watcher 来重置计时器和代码框
          } else {
            handlePrimaryAction(); // 尝试进入下一阶段或结束
          }
        }
      } else {
        if (codingProblemCountdownInterval) clearInterval(codingProblemCountdownInterval);
      }
    }, 1000);
  }
};

const clearAndStopCodingProblemTimer = () => { // 函数名与调用处一致
  if (codingProblemCountdownInterval) {
    clearInterval(codingProblemCountdownInterval);
    codingProblemCountdownInterval = null;
  }
  sessionStore.clearCodingProblemTimer();
};

const handlePrimaryAction = async () => {
  if (sessionStore.isTechnicalPhaseActive && sessionStore.canGoToNextTechnicalQuestion) {
    sessionStore.nextSubQuestion();
  }
  else if (sessionStore.areAllSubQuestionsCompletedInCurrentPhase) {
    await proceedToNextPhaseOrFinish();
  }
};

const proceedToNextPhaseOrFinish = async () => {
  stopCurrentPhaseRecording(); // 停止当前阶段录制（会触发 onstop）
  userCodeSolution.value = '';
  clearAndStopCodingProblemTimer(); // 清除编程题计时器

  if (sessionStore.currentPhaseIndex < sessionStore.totalPhases - 1) {
    await sessionStore.nextPhase(); // store 内部会更新 currentPhaseIndex 和 currentQuestionText
    // startPhaseRecording 和 setupCodingProblemSpecificTimer 将由 watcher 触发
  } else {
    await sessionStore.endInterview(false);
    stopTimer();
    // processAllRecordings(); // 确保在跳转前处理所有录制片段
    await router.push({name: 'GeneratingReport', params: {sessionId: route.params.sessionId as string}});
  }
};

const handleSubmitCode = async () => {
  if (isSubmittingCode.value) return;
  isSubmittingCode.value = true;

  clearAndStopCodingProblemTimer(); // 修正2: 调用正确的函数名
  await sessionStore.submitCodingSolution(userCodeSolution.value, undefined, undefined, 'user');

  if (sessionStore.canGoToNextCodingProblem) {
    sessionStore.nextSubQuestion(); // 会触发 watcher
  } else {
    alert("所有编程题目已完成！您可以通过右侧控制面板进入下一阶段或结束面试。");
  }
  isSubmittingCode.value = false;
};

const handleEndInterviewEarly = async () => {
  stopCurrentPhaseRecording();
  stopTimer();
  clearAndStopCodingProblemTimer();
  await sessionStore.endInterview(true);
  // processAllRecordings(); // 确保在跳转前处理所有录制片段
  await router.push({name: 'GeneratingReport', params: {sessionId: route.params.sessionId as string}});
};

onMounted(async () => {
  originalTheme.value = themeStore.currentTheme;
  themeStore.setTheme('dark');
  const sessionIdFromRoute = route.params.sessionId as string;

  if (!sessionIdFromRoute || !setupStore.selectedJobField || !setupStore.selectedExperienceLevel ) {
    alert("面试设置不完整。正在重定向到设置页面。");
    await router.push({name: 'InterviewSetup'}); return;
  }

  const interviewStarted = await sessionStore.startInterview(sessionIdFromRoute);
  if (interviewStarted) {
    await startMedia();
    startTimer();
    // Watchers 将处理初始的编程题计时器启动
  }
  else {
    alert("无法开始面试。请检查设置并重试。");
    await router.push({name: 'InterviewSetup'});
  }
});

onBeforeUnmount(() => {
  // 确保在卸载前调用，处理所有挂起的录制数据
  if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
    stopCurrentPhaseRecording();
  } else if (currentPhaseBlobs.value.length > 0) { // 如果录制已停但blobs未处理
    const phaseBlob = new Blob(currentPhaseBlobs.value, { type: mediaRecorder.value?.mimeType });
    recordedChunks.value.push(phaseBlob);
    processAllRecordings(); // 手动处理一次
  } else if (recordedChunks.value.length > 0) { // 如果已有完整片段但未处理
    processAllRecordings();
  }


  stopTimer();
  clearAndStopCodingProblemTimer();
  if (cameraStream.value) cameraStream.value.getTracks().forEach(track => track.stop());

  if (originalTheme.value) { themeStore.setTheme(originalTheme.value as 'light' | 'dark'); }
  sessionStore.resetSession(); // 重置会话状态
});

watch(() => sessionStore.currentPhaseIndex, (newIndex, oldIndex) => {
  if (newIndex !== oldIndex && sessionStore.currentPhase) {
    userCodeSolution.value = '';
    clearAndStopCodingProblemTimer(); // 切换主阶段时清除计时器
    if (sessionStore.isCodingPhaseActive) {
      setupCodingProblemSpecificTimer(); // 新阶段是编程，则启动计时器
    }
    console.log(`阶段已更改为: ${sessionStore.currentPhase.name}`);
  }
}, { immediate: false }); // immediate: false, 因为 onMounted 中会处理初始阶段

watch(() => sessionStore.currentPhase?.currentQuestionIndex, (newProblemIndex, oldProblemIndex) => {
  if (sessionStore.isCodingPhaseActive && newProblemIndex !== undefined && newProblemIndex !== oldProblemIndex) {
    userCodeSolution.value = '';
    clearAndStopCodingProblemTimer();
    setupCodingProblemSpecificTimer();
    console.log(`编程题目已切换至: ${sessionStore.currentPhase?.codingProblems?.[newProblemIndex]?.title}`);
  }
}, { immediate: false });
</script>

<style scoped>
.interview-room-view {
  display: flex; flex-direction: column; height: calc(100vh - 3.8rem);
  background-color: var(--bg-color); color: var(--text-color);
  overflow: hidden; padding: 1.25rem; /* 调整整体内边距 */
}
.dark-theme-override { /* Ensure these are effective for the whole view */
  --bg-color: #1a1d21;
  --text-color: #e4e6eb;
  --card-bg-color: #24282f;
  --border-color: #3a3f4c;
  --primary-color: #4b89fc;
  --input-bg-color: #0d1117; /* Code editor specific */
  --input-text-color: #c9d1d9; /* Code editor specific */
  --text-color-muted: #8892b0; /* For less prominent text */
}

.room-global-header { /* Applied to InterviewHeaderInfo component */
  flex-shrink: 0;
  /* Its internal styles define padding/border */
}

.interview-main-layout {
  display: flex; flex-grow: 1;
  padding-top: 1.25rem; /* 在主布局顶部增加额外间距 */
  gap: 1.25rem; /* 调整左右面板间距 */
  overflow: hidden;
}

.left-panel-content-area {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem; /* 内部元素间距调整 */
  min-width: 0;
  overflow-y: auto; /* 允许左侧面板在内容过多时滚动 */
  padding-right: 8px; /* 为滚动条留出空间 */
  /* 美化滚动条 (Webkit) */
}
.left-panel-content-area::-webkit-scrollbar { width: 6px; }
.left-panel-content-area::-webkit-scrollbar-track { background: var(--border-color); border-radius: 3px; }
.left-panel-content-area::-webkit-scrollbar-thumb { background: var(--primary-color); border-radius: 3px; }
.left-panel-content-area::-webkit-scrollbar-thumb:hover { background: color-mix(in srgb, var(--primary-color) 80%, black 20%); }

.phase-progress-bar {
  flex-shrink: 0;
  margin-bottom: 0.25rem; /* 与下方元素的间距 */
}


.coding-timer-display {
  font-size: 0.9rem; /* 减小一点字号 */
  font-weight: 500;
  color: var(--text-color);
  background-color: var(--card-bg-color);
  padding: 0.5rem 0.75rem; /* 调整内边距 */
  border-radius: 6px;
  text-align: center;
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  margin-bottom: 0.5rem; /* 与下方题目间距 */
}
.coding-timer-display strong { color: var(--primary-color); font-weight: 600; }
.coding-timer-display .fa-icon { margin-right: 0.4em; }


.question-display-area { /* 应用于 QuestionDisplay 组件的类 */
  background-color: var(--card-bg-color);
  padding: 1.25rem 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  color: var(--text-color);
  line-height: 1.7;
  min-height: 80px; /* 最小高度 */

  /* 关键：实现弹性高度和内部滚动 */
  overflow-y: auto; /* 如果内容超出 max-height，则内部滚动 */
  max-height: calc(45vh - 40px); /* 占据视口高度的一部分，40px为上下大致间距预留 */
  /* 这个值需要根据整体布局仔细调试 */
  flex-shrink: 1; /* 允许在空间不足时收缩，但有 min-height 保证 */
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.question-display-area.coding-problem-display {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 0.9rem; /* 为编程题描述调整字号 */
  /* max-height 已在上面设置，这里不再重复或可以设置一个不同的值 */
}
.question-display-area :deep(strong) { /* ... */ }
.question-display-area :deep(br) { /* ... */ }
.question-display-area :deep(pre) { /* ... */ }

.code-input-area-main { /* 应用于 CodeInputArea 组件的类 */
  flex-grow: 1; /* 占据剩余的主要垂直空间 */
  min-height: 200px; /* 最小编码区域高度 */
  display: flex;
  flex-direction: column; /* 使内部 textarea 能更好地填充 */
}
.code-input-area-main > :deep(.code-input-wrapper) {
  height: 100%;
  min-height: 200px;
  flex-grow: 1; /* 让 codemirror wrapper 充满 */
}
.code-input-area-main > :deep(.code-input-wrapper .cm-editor) { /* 如果用codemirror */
  height: 100% !important;
}

.submit-code-button-main {
  align-self: flex-end;
  padding: 0.7rem 1.3rem;
  font-size: 0.9rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  margin-top: 0.75rem;
  width: auto;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s, opacity 0.2s;
}
.submit-code-button-main:hover:not(:disabled) { opacity: 0.9; }
.submit-code-button-main:disabled { background-color: var(--border-color); color: var(--text-color-muted); cursor: not-allowed;}
.submit-code-button-main .fa-icon { font-size: 0.9em; }

.right-sidebar-controls { /* ... (保持不变，但确保内边距和gap合适) ... */
  width: 280px; flex-shrink: 0; background-color: var(--card-bg-color);
  padding: 1.25rem; /* 统一内边距 */
  border-radius: 10px; border: 1px solid var(--border-color);
  display: flex; flex-direction: column; gap: 1.25rem; /* 调整内部组件间距 */
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  overflow-y: auto; /* 如果内容过多（不太可能），允许滚动 */
}
[data-theme="dark"] .right-sidebar-controls { box-shadow: 0 4px 15px rgba(0,0,0,0.25); }

.user-video-feed-small-wrapper { /* ... (保持不变) ... */
  width: 100%; aspect-ratio: 16 / 10; background-color: #000;
  border-radius: 8px; overflow: hidden; border: 1px solid var(--border-color);
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  /* margin-bottom: 0; /* 由父级gap控制 */
}

.interview-controls-stack { /* ... (保持不变) ... */
  flex-grow: 1; display: flex; flex-direction: column;
}
</style>