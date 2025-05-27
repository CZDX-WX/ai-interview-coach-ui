<template>
  <div class="interview-room-view" :class="{ 'dark-theme-override': true }">
    <div class="interview-header">
      <h1 class="interview-title">
        <font-awesome-icon :icon="['fas', 'microphone-alt']" /> Live Interview
      </h1>
      <div class="interview-info">
        <span v-if="sessionStore.interviewType?.jobField && sessionStore.interviewType?.experienceLevel">
          {{ setupStore.getJobFieldLabel }} - {{ setupStore.getExperienceLevelLabel }}
        </span>
      </div>
    </div>

    <div class="interview-layout">
      <div class="main-panel">
        <div class="phase-progress-container">
          <div class="phase-info">
            <span>Phase {{ sessionStore.currentPhaseIndex + 1 }}/{{ sessionStore.totalPhases }}: {{ sessionStore.currentPhase?.name }}</span>
            <span v-if="sessionStore.isTechnicalPhaseActive && sessionStore.totalTechnicalQuestionsInPhase > 0" class="tech-question-counter">
              (Question {{ sessionStore.currentTechnicalQuestionNumber }}/{{ sessionStore.totalTechnicalQuestionsInPhase }})
            </span>
            <span v-if="sessionStore.isCodingPhaseActive && sessionStore.totalCodingProblemsInPhase > 0" class="tech-question-counter">
              (Problem {{ sessionStore.currentCodingProblemNumber }}/{{ sessionStore.totalCodingProblemsInPhase }})
            </span>
            <span class="estimated-time" v-if="sessionStore.currentPhase?.estimatedTime">Est. {{ sessionStore.currentPhase.estimatedTime }}</span>
          </div>
          <div class="progress-bar-outer">
            <div class="progress-bar-inner" :style="{ width: sessionStore.progressPercentage + '%' }"></div>
          </div>
        </div>

        <div
            class="question-display"
            :class="{ 'coding-problem-display': sessionStore.isCodingPhaseActive }"
            v-html="formattedQuestionText"
        >
        </div>

        <div v-if="sessionStore.isCodingPhaseActive" class="coding-area-container">
          <textarea
              v-model="userCodeSolution"
              class="code-input-area"
              placeholder="Type your code solution here..."
              spellcheck="false"
          ></textarea>
          <button @click="handleSubmitCode" class="control-button submit-code-button">
            <font-awesome-icon :icon="['fas', 'paper-plane']" />
            {{ sessionStore.canGoToNextCodingProblem ? 'Submit & Next Problem' : 'Submit Solution' }}
          </button>
        </div>

        <div class="video-feed-container">
          <video ref="userVideoRef" autoplay playsinline muted class="user-video-feed"></video>
          <div v-if="!cameraStreamActive || cameraError" class="video-error-placeholder">
            <font-awesome-icon :icon="['fas', 'video-slash']" class="placeholder-icon"/>
            <p>{{ cameraError || "Camera not active." }}</p>
          </div>
        </div>
      </div>

      <div class="controls-panel">
        <div class="timer-display">
          <div class="time-segment"><span>{{ formatTime(elapsedTime).hours }}</span><small>Hours</small></div>
          <div class="time-segment"><span>{{ formatTime(elapsedTime).minutes }}</span><small>Minutes</small></div>
          <div class="time-segment"><span>{{ formatTime(elapsedTime).seconds }}</span><small>Seconds</small></div>
        </div>

        <div class="action-buttons">
          <button
              v-if="sessionStore.isTechnicalPhaseActive"
              @click="handleNextSubQuestion"
              class="control-button sub-question-button"
              :disabled="!sessionStore.canGoToNextTechnicalQuestion"
          >
            <font-awesome-icon :icon="['fas', 'forward']" /> Next Question
          </button>
          <button
              @click="handleNextPhase"
              class="control-button next-phase-button"
              :disabled="sessionStore.currentPhaseIndex >= sessionStore.totalPhases - 1 && (!sessionStore.isTechnicalPhaseActive || !sessionStore.canGoToNextTechnicalQuestion) && (!sessionStore.isCodingPhaseActive || !sessionStore.canGoToNextCodingProblem)"
          >
            <font-awesome-icon :icon="['fas', 'arrow-right']" />
            {{ isLastSubQuestionInPhase() && sessionStore.currentPhaseIndex < sessionStore.totalPhases -1 ? 'Next Phase' : (isLastSubQuestionInPhase() && sessionStore.currentPhaseIndex >= sessionStore.totalPhases - 1 ? 'Finish Interview' : 'Skip to Next Phase') }}
          </button>

          <button @click="handleEndInterview" class="control-button end-interview-button">
            <font-awesome-icon :icon="['fas', 'stop-circle']" /> End Interview
          </button>
        </div>
        <div class="recording-status">
          <font-awesome-icon :icon="['fas', 'circle']" :class="['status-dot', { 'recording': isActuallyRecording }]" />
          {{ isActuallyRecording ? 'Recording in Progress' : 'Recording Paused/Starting' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useThemeStore } from '../../stores/theme';
import { useInterviewSessionStore } from '../../stores/interviewSession';
import { useInterviewSetupStore } from '../../stores/interviewSetup'; // To get setup details
import DOMPurify from 'dompurify'; // For sanitizing HTML if using v-html with markdown
// import { marked } from 'marked'; // Optional: For rendering markdown from problem description
const userCodeSolution = ref(''); // For the coding textarea

const route = useRoute();
const router = useRouter();
const themeStore = useThemeStore();
const sessionStore = useInterviewSessionStore();
const setupStore = useInterviewSetupStore(); // Access setup data

const userVideoRef = ref<HTMLVideoElement | null>(null);
const cameraStream = ref<MediaStream | null>(null);
const microphoneStream = ref<MediaStream | null>(null); // For actual recording
const mediaRecorder = ref<MediaRecorder | null>(null);
const recordedChunks = ref<Blob[]>([]);
const currentPhaseBlobs = ref<Blob[]>([]); // Blobs for the current phase

const elapsedTime = ref(0); // in seconds
let timerInterval: number;

const originalTheme = ref<string | null>(null);
const cameraStreamActive = ref(false);
const cameraError = ref<string | null>(null);
const isActuallyRecording = ref(false); // More precise recording state
// Helper to format question text (e.g., basic markdown for bold)
const formattedQuestionText = computed(() => {
  if (!sessionStore.currentQuestionText) return '';
  // Basic markdown-like conversion: **text** to <strong>text</strong>, \n to <br>
  // For more complex markdown, use a library like 'marked' and sanitize with DOMPurify
  const html = sessionStore.currentQuestionText
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\n/g, '<br>'); // Newlines
  return DOMPurify.sanitize(html);
});
// --- Device and Recording Logic ---
const startMedia = async () => {
  const camId = route.query.cam as string | undefined;
  const micId = route.query.mic as string | undefined;
  cameraError.value = null;
  cameraStreamActive.value = false;

  try {
    const videoConstraints = camId ? { deviceId: { exact: camId } } : true;
    const audioConstraints = micId ? { deviceId: { exact: micId } } : true;
    const stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: audioConstraints });

    cameraStream.value = new MediaStream(stream.getVideoTracks());
    microphoneStream.value = new MediaStream(stream.getAudioTracks());

    if (userVideoRef.value && cameraStream.value) {
      userVideoRef.value.srcObject = cameraStream.value;
      cameraStreamActive.value = true;
    }

    const combinedStreamForRecording = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: audioConstraints });
    setupMediaRecorder(combinedStreamForRecording);
    startPhaseRecording();

  } catch (err: any) {
    console.error("Error accessing media devices in InterviewRoom:", err);
    cameraError.value = "Failed to access camera/microphone. Please check permissions and device selection.";
  }
};

const setupMediaRecorder = (stream: MediaStream) => {

  let options = { mimeType: '' };
  if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
    options.mimeType = 'video/webm;codecs=vp9,opus';
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
    options.mimeType = 'video/webm;codecs=vp8,opus';
  } else if (MediaRecorder.isTypeSupported('video/webm')) {
    options.mimeType = 'video/webm';
  } else {
    alert("No suitable video recording format supported by your browser.");
    return;
  }
  mediaRecorder.value = new MediaRecorder(stream, options);
  mediaRecorder.value.ondataavailable = (event) => { if (event.data.size > 0) currentPhaseBlobs.value.push(event.data); };
  mediaRecorder.value.onstart = () => { isActuallyRecording.value = true; console.log('REC Start phase:', sessionStore.currentPhase?.name);};
  mediaRecorder.value.onstop = () => {
    isActuallyRecording.value = false;
    const phaseBlob = new Blob(currentPhaseBlobs.value, { type: mediaRecorder.value?.mimeType });
    console.log(`REC Stop phase: ${sessionStore.currentPhase?.name}, Size: ${phaseBlob.size}`);
    recordedChunks.value.push(phaseBlob);
    currentPhaseBlobs.value = [];
    if (!sessionStore.isRecording && recordedChunks.value.length > 0) processAllRecordings();
  };
  mediaRecorder.value.onerror = (event) => { console.error('MediaRecorder error:', event); isActuallyRecording.value = false;};

};


const startPhaseRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state === 'inactive') {
    currentPhaseBlobs.value = [];
    mediaRecorder.value.start();
    sessionStore.isRecording = true;
  }
};

const stopCurrentPhaseRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
    mediaRecorder.value.stop();
  }
  sessionStore.isRecording = false;
};

const processAllRecordings = () => {
  recordedChunks.value.forEach((blob, index) => {
    console.log(`Processing final blob for phase ${sessionStore.phases[index]?.name || index + 1}, size: ${blob.size}`);
  });
  recordedChunks.value = [];
};


// --- Timer Logic ---
const startTimer = () => {
  stopTimer(); // Ensure no multiple intervals
  timerInterval = window.setInterval(() => {
    elapsedTime.value++;
  }, 1000);
};
const stopTimer = () => {
  clearInterval(timerInterval);
};
const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
};

// --- Control Logic ---
const isLastSubQuestionInPhase = (): boolean => {
  if (sessionStore.isTechnicalPhaseActive) {
    return !sessionStore.canGoToNextTechnicalQuestion;
  }
  if (sessionStore.isCodingPhaseActive) {
    return !sessionStore.canGoToNextCodingProblem;
  }
  return true; // For phases without sub-questions
};


const handleNextSubQuestion = () => { // For Tech Q&A
  sessionStore.nextSubQuestion();
};

const handleSubmitCode = () => {
  sessionStore.submitCodingSolution(userCodeSolution.value);
  if (sessionStore.canGoToNextCodingProblem) {
    sessionStore.nextSubQuestion(); // Advances to next coding problem
    userCodeSolution.value = ''; // Clear textarea
  } else {
    // Last coding problem submitted
    alert("Coding phase complete! Click 'Next Phase' to continue or 'End Interview'.");
    // Optionally, you could automatically trigger handleNextPhase if desired
    // For now, user explicitly clicks "Next Phase"
  }
};

const handleNextPhase = async () => {
  stopCurrentPhaseRecording();
  await sessionStore.nextPhase(); // This might also call endInterview if it's the last phase
  if (sessionStore.currentPhase && sessionStore.sessionId && sessionStore.overallStartTime) { // Check if interview is still ongoing
    startPhaseRecording();
  } else if (!sessionStore.sessionId && !sessionStore.overallStartTime) { // Indicates interview ended
    // processAllRecordings should have been called via onstop after the final stopCurrentPhaseRecording
    router.push({ name: 'Home' }); // Or report page
  }
};

const handleEndInterview = async () => {
  stopCurrentPhaseRecording(); // This should trigger onstop and processAllRecordings eventually
  stopTimer();
  await sessionStore.endInterview(); // Sets isRecording to false

  // Ensure final blobs are processed before navigating
  // The 'onstop' handler of MediaRecorder needs to be robust
  // A small delay might be needed if onstop is async and involves uploads in a real scenario
  // For mock, we assume it's quick.

  router.push({
    name: 'GeneratingReport', // New route name for the loading page
    params: { sessionId: sessionStore.sessionId }
  });
};


// --- Lifecycle and Theme ---
onMounted(async () => {
  originalTheme.value = themeStore.currentTheme;
  themeStore.setTheme('dark');

  const sessionIdFromRoute = route.params.sessionId as string;
  // Ensure setupStore still has the config, or fetch if necessary (though usually passed via creation)
  if (!sessionIdFromRoute || !setupStore.selectedJobField || !setupStore.selectedExperienceLevel ) {
    console.error("Interview setup data incomplete or session ID missing.");
    alert("Interview setup is incomplete. Redirecting to setup page.");
    router.push({ name: 'InterviewSetup' });
    return;
  }

  const interviewStarted = await sessionStore.startInterview(sessionIdFromRoute);
  if (interviewStarted) {
    await startMedia();
    startTimer();
  } else {
    alert("Failed to start interview. Please check setup and try again.");
    router.push({ name: 'InterviewSetup' });
  }
});

onBeforeUnmount(() => {
  if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
    stopCurrentPhaseRecording(); // Ensure final segment is processed if unmounting mid-recording
  }
  stopTimer();
  if (cameraStream.value) cameraStream.value.getTracks().forEach(track => track.stop());
  if (microphoneStream.value) microphoneStream.value.getTracks().forEach(track => track.stop());

  if (originalTheme.value) { // Revert to original theme
    themeStore.setTheme(originalTheme.value as 'light' | 'dark');
  }
  sessionStore.resetSession(); // Clean up session store state
});

// Watch for phase changes to potentially update questions dynamically if needed
watch(() => sessionStore.currentPhaseIndex, (newIndex, oldIndex) => {
  if (newIndex !== oldIndex) {
    console.log(`Phase changed to: ${sessionStore.currentPhase?.name}`);
    // Additional logic for phase change can go here
    // e.g., fetching new set of questions from an LLM if not predefined
  }
});

</script>

<style scoped>
.interview-room-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* Make this view grow to fill the app-main-content-wrapper */
  /* height: 100%; /* Alternative if parent is display:flex and has a defined height */
  /* The max-width and margin:auto can still be applied if you want to cap the interview room width */
  max-width: 1200px; /* Example: Increase max-width if 900px felt too narrow for both panels */
  width: 100%; /* Ensure it tries to use available width up to max-width */
  margin: 0 auto; /* Center if max-width is applied and screen is wider */
  background-color: var(--bg-color); /* Will be dark due to theme override */
  color: var(--text-color);
  overflow: hidden; /* This view itself won't scroll; its children will */
}
.dark-theme-override { /* Ensure dark theme variables are applied */
  --bg-color: #111418; /* From prototype */
  --text-color: #e0e0e0; /* Light text for dark bg */
  --card-bg-color: #1e2329; /* Darker card bg */
  --border-color: #293038; /* Darker borders */
  --primary-color: #3b82f6; /* A vibrant blue for dark mode */
}


.interview-header {
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}
.interview-title {
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.interview-title .fa-icon {
  color: var(--primary-color);
}
.interview-info {
  font-size: 0.9rem;
  opacity: 0.8;
}

.interview-layout {
  display: flex; /* Key: arranges main-panel and controls-panel side-by-side */
  flex-grow: 1; /* Key: makes this layout take all available vertical space after .interview-header */
  overflow: hidden; /* Prevent this flex container from scrolling; children will scroll */
}

.main-panel {
  flex-grow: 1; /* Key: takes up available horizontal space */
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  overflow-y: auto; /* Allows this panel to scroll if its content is too tall */
  /* min-width: 0; /* Helps prevent flex item overflow issues if content is too wide */
}

.phase-progress-container {
  margin-bottom: 1.5rem;
  background-color: var(--card-bg-color);
  padding: 1rem;
  border-radius: 6px;
}
.phase-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
}
.phase-info .estimated-time {
  opacity: 0.7;
  font-size: 0.8rem;
}
.progress-bar-outer {
  width: 100%;
  height: 0.75rem; /* h-2 from proto ~0.5rem, slightly thicker */
  background-color: #3c4753; /* Progress bar bg from proto */
  border-radius: 0.375rem; /* rounded */
  overflow: hidden;
}
.progress-bar-inner {
  height: 100%;
  background-color: var(--primary-color); /* Progress bar fill (white in proto) */
  border-radius: 0.375rem;
  transition: width 0.3s ease;
}
[data-theme="dark"] .progress-bar-inner { /* To match prototype's white progress on dark bar */
  background-color: #e0e0e0;
}


.question-display {
  background-color: var(--card-bg-color);
  padding: 1.5rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  min-height: 80px; /* Ensure some space for question */
  font-size: 1.1rem;
  line-height: 1.6;
  text-align: center; /* As per prototype */
}

.video-feed-container {
  flex-grow: 1; /* Ensures video container tries to fill vertical space in main-panel */
  position: relative;
  background-color: #000;
  border-radius: 0.75rem;
  overflow: hidden;
  min-height: 300px; /* Or a percentage-based min-height */
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
}
.user-video-feed {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Or contain, depending on preference */
  transform: scaleX(-1); /* Mirror mode for user */
}
.video-error-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ccc;
  text-align: center;
  padding: 1rem;
}
.video-error-placeholder .placeholder-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}


.controls-panel {
  width: 320px; /* Fixed width for controls, slightly increased from 300px for better balance */
  flex-shrink: 0; /* Prevents this panel from shrinking */
  background-color: var(--card-bg-color);
  border-left: 1px solid var(--border-color);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* Adjusted gap */
  overflow-y: auto; /* Allows this panel to scroll if its content is too tall */
}

.timer-display {
  display: flex;
  justify-content: space-around; /* Distribute time segments */
  gap: 0.5rem; /* gap-4 from proto */
  text-align: center;
  margin-bottom: 1rem; /* Space below timer */
  gap: 1rem;
}
.time-segment {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #293038; /* Timer segment bg from proto */
  padding: 0.75rem;
  border-radius: 0.5rem; /* rounded-xl */
  min-width: 70px; /* Ensure segments have some width */
  flex: 1;
}
.time-segment span {
  font-size: 1.5rem; /* text-lg font-bold */
  font-weight: bold;
  line-height: 1.2;
}
.time-segment small {
  font-size: 0.75rem; /* text-sm */
  opacity: 0.7;
  margin-top: 0.25rem;
}

.action-buttons {
  display: flex;
  flex-direction: column; /* Stack buttons vertically */
  gap: 1rem;
}
.control-button {
  padding: 0.75rem 1rem; /* h-10 px-4 */
  font-size: 0.9rem;
  font-weight: bold;
  border: none;
  border-radius: 9999px; /* rounded-full */
  cursor: pointer;
  transition: background-color 0.2s ease, opacity 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.control-button .fa-icon {
  font-size: 1em;
}

.control-button.next-phase-button {
  background-color: #1978e5; /* Primary action blue from proto */
  color: white;
}
.control-button.next-phase-button:hover {
  background-color: #135ea5;
}
.control-button.next-phase-button:disabled {
  background-color: #555;
  color: #999;
  cursor: not-allowed;
}

.control-button.end-interview-button {
  background-color: #4b5563; /* Darker gray from proto (bg-[#293038] for button) */
  color: white;
}
[data-theme="dark"] .control-button.end-interview-button {
  background-color: #293038;
}

.control-button.end-interview-button:hover {
  background-color: #6b7280;
}
[data-theme="dark"] .control-button.end-interview-button:hover {
  background-color: #3c4753;
}


.recording-status {
  margin-top: auto; /* Push to bottom */
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  text-align: center;
  font-size: 0.8rem;
  opacity: 0.8;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  /* This pushes it to the bottom correctly */
}
.status-dot {
  font-size: 0.7em;
  color: #888; /* Grey for not recording */
  transition: color 0.3s ease;
}
.status-dot.recording {
  color: #ef4444; /* Red for recording */
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.control-button {
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-weight: bold;
  border: none;
  border-radius: 9999px; /* rounded-full */
  cursor: pointer;
  transition: background-color 0.2s ease, opacity 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.control-button .fa-icon {
  font-size: 1em;
}

/* Specific for Tech Q&A button if needed, or can share style with next-phase */
.control-button.tech-qa-button {
  background-color: var(--primary-color); /* Or a distinct color */
  color: white;
}
.control-button.tech-qa-button:hover {
  opacity:0.85;
}
.control-button.tech-qa-button:disabled {
  background-color: #555;
  color: #999;
  cursor: not-allowed;
}


.control-button.next-phase-button {
  background-color: #1978e5; /* Primary action blue from proto */
  color: white;
}
.control-button.next-phase-button:hover {
  background-color: #135ea5;
}
.control-button.next-phase-button:disabled {
  background-color: #555;
  color: #999;
  cursor: not-allowed;
}

.control-button.end-interview-button {
  background-color: #4b5563; /* Darker gray from proto (bg-[#293038] for button) */
  color: white;
}
[data-theme="dark"] .control-button.end-interview-button {
  background-color: #293038;
}
.control-button.end-interview-button:hover {
  background-color: #3c4753;
}

.question-display {
  background-color: var(--card-bg-color);
  padding: 1.5rem;
  border-radius: 6px;
  margin-bottom: 1rem; /* Reduced margin when coding area is present */
  min-height: 80px;
  font-size: 1.1rem;
  line-height: 1.6;
  /* text-align: center; /* Keep if desired, or left-align for problems */
}
.question-display.coding-problem-display { /* Specific for coding problems */
  text-align: left;
  white-space: pre-wrap; /* Preserve formatting like newlines and spaces */
  font-family: 'Courier New', Courier, monospace; /* Monospaced for problem description */
  font-size: 1rem; /* Slightly smaller for dense problem text */
}
.question-display strong {
  color: var(--primary-color); /* Highlight titles or keywords */
  display: block;
  margin-bottom: 0.5em;
  font-size: 1.1em;
}


.coding-area-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem; /* Space before video feed */
}
.code-input-area {
  width: 100%;
  min-height: 200px; /* Or adjust with flex-grow if it should expand more */
  flex-grow: 1; /* If inside a flex column and needs to expand */
  background-color: #0d1117; /* Very dark background for code editor */
  color: #c9d1d9; /* Light text for code */
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 1rem;
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace; /* Monospaced font */
  font-size: 0.9rem;
  line-height: 1.5;
  resize: vertical; /* Allow vertical resize */
  white-space: pre; /* Preserve whitespace and tabs */
  overflow-wrap: normal; /* Prevent wrapping for code */
  overflow-x: auto; /* Allow horizontal scroll for long lines */
}
.code-input-area:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color) 30%, transparent);
}
.submit-code-button {
  align-self: flex-end; /* Position button to the right */
  padding: 0.6rem 1.2rem;
  font-size: 0.85rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
}
.submit-code-button:hover {
  opacity: 0.9;
}
</style>