<template>
  <div class="device-check-view">
    <h1 class="page-title">
      <font-awesome-icon :icon="['fas', 'tools']" class="title-icon"/>
      Let's Check Your Equipment
    </h1>
    <p class="page-subtitle">Ensure your camera and microphone are working correctly for the best experience.</p>

    <div class="device-check-content">
      <div class="video-preview-container">
        <video ref="videoPreviewRef" autoplay playsinline muted class="video-preview"></video>
        <div v-if="!cameraStream || cameraError" class="video-placeholder">
          <font-awesome-icon :icon="['fas', 'video-slash']" class="placeholder-icon"/>
          <p v-if="cameraError">{{ cameraError }}</p>
          <p v-else>Camera preview will appear here.</p>
          <button v-if="!permissionsInitiallyRequested" @click="requestPermissionsAndEnumerate" class="form-button small-button">
            <font-awesome-icon :icon="['fas', 'camera']" /> Enable Camera & Mic
          </button>
        </div>
      </div>

      <div class="controls-and-status">
        <div class="device-selectors">
          <div class="form-group">
            <label for="camera-select">
              <font-awesome-icon :icon="['fas', 'camera-retro']" /> Select Camera
            </label>
            <select id="camera-select" v-model="selectedCameraId" @change="startCamera" class="form-input select-input" :disabled="!availableCameras.length">
              <option v-if="!availableCameras.length" value="">No cameras found</option>
              <option v-for="device in availableCameras" :key="device.deviceId" :value="device.deviceId">
                {{ device.label || `Camera ${availableCameras.indexOf(device) + 1}` }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="mic-select">
              <font-awesome-icon :icon="['fas', 'microphone']" /> Select Microphone
            </label>
            <select id="mic-select" v-model="selectedMicrophoneId" @change="startMicrophone" class="form-input select-input" :disabled="!availableMicrophones.length">
              <option v-if="!availableMicrophones.length" value="">No microphones found</option>
              <option v-for="device in availableMicrophones" :key="device.deviceId" :value="device.deviceId">
                {{ device.label || `Microphone ${availableMicrophones.indexOf(device) + 1}` }}
              </option>
            </select>
          </div>
        </div>

        <div class="mic-level-test">
          <p class="mic-label">
            <font-awesome-icon :icon="['fas', 'wave-square']" /> Microphone Level:
            <small>Speak to test your microphone.</small>
          </p>
          <div class="mic-level-bar-container">
            <div class="mic-level-bar" :style="{ width: microphoneLevel + '%' }"></div>
          </div>
        </div>

        <div class="status-checklist">
          <h3 class="checklist-title">System Status</h3>
          <label class="status-item" :class="{ 'checked': permissionsGranted }">
            <input type="checkbox" :checked="permissionsGranted" disabled />
            <font-awesome-icon :icon="permissionsGranted ? ['fas', 'check-circle'] : ['far', 'circle']" />
            Browser Permissions Granted
          </label>
          <label class="status-item" :class="{ 'checked': cameraDetected }">
            <input type="checkbox" :checked="cameraDetected" disabled />
            <font-awesome-icon :icon="cameraDetected ? ['fas', 'check-circle'] : ['far', 'circle']" />
            Camera Detected
          </label>
          <label class="status-item" :class="{ 'checked': microphoneDetected }">
            <input type="checkbox" :checked="microphoneDetected" disabled />
            <font-awesome-icon :icon="microphoneDetected ? ['fas', 'check-circle'] : ['far', 'circle']" />
            Microphone Detected
          </label>
        </div>

        <div class="troubleshooting">
          <a href="#" @click.prevent="showTroubleshooting = !showTroubleshooting" class="form-link">
            <font-awesome-icon :icon="['fas', 'question-circle']" /> Troubleshooting Tips
          </a>
          <div v-if="showTroubleshooting" class="troubleshooting-content">
            <ul>
              <li>Ensure your browser has permission to access your camera and microphone. Check site settings (usually a lock icon in the address bar).</li>
              <li>Make sure no other application is using your camera or microphone.</li>
              <li>Try selecting a different camera/microphone from the dropdowns.</li>
              <li>Refresh the page and try again.</li>
              <li>Restart your browser or computer if problems persist.</li>
            </ul>
          </div>
        </div>

        <button @click="proceedToInterview" class="form-button proceed-button" :disabled="!allChecksPassed || setupStore.isLoading">
          <span v-if="setupStore.isLoading">Preparing...</span>
          <span v-else>
            <font-awesome-icon :icon="['fas', 'play']" /> All Good, Start Interview!
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useInterviewSetupStore } from '../../stores/interviewSetup';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const router = useRouter();
const setupStore = useInterviewSetupStore();

const videoPreviewRef = ref<HTMLVideoElement | null>(null);
const availableCameras = ref<MediaDeviceInfo[]>([]);
const availableMicrophones = ref<MediaDeviceInfo[]>([]);
const selectedCameraId = ref<string | null>(null);
const selectedMicrophoneId = ref<string | null>(null);

const cameraStream = ref<MediaStream | null>(null);
const microphoneStream = ref<MediaStream | null>(null);
const audioContext = ref<AudioContext | null>(null);
const analyser = ref<AnalyserNode | null>(null);
const microphoneLevel = ref(0);
let animationFrameId: number;

const permissionsGranted = ref(false);
const cameraDetected = ref(false);
const microphoneDetected = ref(false);
const cameraError = ref<string | null>(null);
const permissionsInitiallyRequested = ref(false);

const showTroubleshooting = ref(false);

const allChecksPassed = computed(() => permissionsGranted.value && cameraDetected.value && microphoneDetected.value);

const requestPermissionsAndEnumerate = async () => {
  permissionsInitiallyRequested.value = true;
  cameraError.value = null;
  try {
    // Request general permissions first to populate the list
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    permissionsGranted.value = true;

    // Enumerate devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    availableCameras.value = devices.filter(device => device.kind === 'videoinput');
    availableMicrophones.value = devices.filter(device => device.kind === 'audioinput');

    if (availableCameras.value.length > 0) {
      selectedCameraId.value = availableCameras.value[0].deviceId; // Select first camera by default
      cameraDetected.value = true; // Mark as detected because we enumerated them
      await startCamera(); // Start the default camera
    } else {
      cameraDetected.value = false;
      cameraError.value = 'No camera found. Please connect a camera.';
    }

    if (availableMicrophones.value.length > 0) {
      selectedMicrophoneId.value = availableMicrophones.value[0].deviceId;
      microphoneDetected.value = true;
      await startMicrophone(); // Start the default microphone
    } else {
      microphoneDetected.value = false;
    }

    // Stop the initial combined stream as we'll manage specific ones
    stream.getTracks().forEach(track => track.stop());

  } catch (err: any) {
    console.error("Error accessing media devices:", err);
    permissionsGranted.value = false;
    cameraDetected.value = false;
    microphoneDetected.value = false;
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      cameraError.value = 'Permission denied. Please allow access to your camera and microphone in browser settings.';
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      cameraError.value = 'No camera or microphone found. Please ensure they are connected and enabled.';
    } else {
      cameraError.value = 'Could not access camera/microphone. Error: ' + err.message;
    }
  }
};

const startCamera = async () => {
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach(track => track.stop());
  }
  if (selectedCameraId.value && videoPreviewRef.value) {
    try {
      const constraints: MediaStreamConstraints = {
        video: { deviceId: { exact: selectedCameraId.value } },
        audio: false // We handle audio separately for selection
      };
      cameraStream.value = await navigator.mediaDevices.getUserMedia(constraints);
      videoPreviewRef.value.srcObject = cameraStream.value;
      cameraDetected.value = true; // Re-affirm detection
      cameraError.value = null;
    } catch (err) {
      console.error("Error starting camera:", err);
      cameraDetected.value = false;
      cameraError.value = "Failed to start selected camera.";
    }
  }
};

const startMicrophone = async () => {
  if (microphoneStream.value) {
    microphoneStream.value.getTracks().forEach(track => track.stop());
    if (analyser.value) analyser.value.disconnect();
    if (audioContext.value && audioContext.value.state !== 'closed') audioContext.value.close();
  }
  if (selectedMicrophoneId.value) {
    try {
      const constraints: MediaStreamConstraints = {
        video: false,
        audio: { deviceId: { exact: selectedMicrophoneId.value } }
      };
      microphoneStream.value = await navigator.mediaDevices.getUserMedia(constraints);
      microphoneDetected.value = true; // Re-affirm detection
      setupMicrophoneVisualizer(microphoneStream.value);
    } catch (err) {
      console.error("Error starting microphone:", err);
      microphoneDetected.value = false;
    }
  }
};

const setupMicrophoneVisualizer = (stream: MediaStream) => {
  audioContext.value = new (window.AudioContext || (window as any).webkitAudioContext)();
  analyser.value = audioContext.value.createAnalyser();
  const source = audioContext.value.createMediaStreamSource(stream);
  source.connect(analyser.value);
  analyser.value.fftSize = 256; // Smaller FFT size for quicker response
  const bufferLength = analyser.value.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const draw = () => {
    animationFrameId = requestAnimationFrame(draw);
    if (analyser.value) {
      analyser.value.getByteFrequencyData(dataArray); // or getByteTimeDomainData
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      microphoneLevel.value = Math.min(100, (average / 128) * 100 * 2); // Amplify for visibility
    }
  };
  draw();
};

const proceedToInterview = async () => {
  if (!allChecksPassed.value) {
    alert("Please ensure all device checks are successful.");
    return;
  }
  // Stop current streams before navigating
  stopMediaTracks();

  // Store selected device IDs for the interview room (or pass via params)
  // This is a good place to store them in Pinia if the InterviewRoom needs them from there.
  // For simplicity, we can rely on the InterviewRoom to re-acquire based on some stored preference,
  // or pass selectedCameraId.value and selectedMicrophoneId.value as route query/params.

  // Create a mock session (in real app, this is an API call)
  const sessionId = await setupStore.createMockInterviewSession();
  if (sessionId) {
    router.push({
      name: 'InterviewRoom',
      params: { sessionId },
      query: {
        cam: selectedCameraId.value || undefined, // Pass selected device IDs
        mic: selectedMicrophoneId.value || undefined
      }
    });
  } else {
    alert("Failed to create interview session. Please try again.");
  }
};

const stopMediaTracks = () => {
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach(track => track.stop());
  }
  if (microphoneStream.value) {
    microphoneStream.value.getTracks().forEach(track => track.stop());
  }
  if (audioContext.value && audioContext.value.state !== 'closed') {
    audioContext.value.close();
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
};

onMounted(() => {
  // Try to get permissions and enumerate devices automatically on load
  requestPermissionsAndEnumerate();
});

onBeforeUnmount(() => {
  stopMediaTracks();
});
</script>

<style scoped>
.device-check-view {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
  background-color: var(--bg-color);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  text-align: center;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}
.title-icon {
  color: var(--primary-color);
}

.page-subtitle {
  text-align: center;
  font-size: 1rem;
  color: var(--text-color);
  opacity: 0.8;
  margin-bottom: 2.5rem;
}

.device-check-content {
  display: grid;
  grid-template-columns: 1fr; /* Single column for smaller screens */
  gap: 2rem;
}

@media (min-width: 768px) { /* Two columns for medium screens and up */
  .device-check-content {
    grid-template-columns: repeat(2, 1fr);
  }
  .video-preview-container {
    grid-column: span 2; /* Video preview spans both columns */
  }
}
@media (min-width: 1024px) { /* Adjust for larger screens */
  .device-check-content {
    grid-template-columns: 2fr 1fr; /* Video larger, controls smaller */
  }
  .video-preview-container {
    grid-column: auto; /* Video preview takes its column */
  }
}


.video-preview-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: #000; /* Fallback if video not loaded */
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-preview {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Cover the area, might crop */
}
.video-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ccc; /* Light text on dark placeholder */
  text-align: center;
  padding: 1rem;
}
.video-placeholder .placeholder-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}
.video-placeholder p {
  margin-bottom: 1rem;
  font-size: 0.9rem;
}
.video-placeholder .small-button {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}


.controls-and-status {
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* Space between control groups */
  background-color: var(--card-bg-color);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.device-selectors {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.form-group .fa-icon {
  color: var(--primary-color);
}

.form-input.select-input {
  padding: 0.75rem 1rem;
  background-image: var(--select-button-svg);
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.25em;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}

.mic-level-test {
  margin-top: 0.5rem;
}
.mic-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.mic-label .fa-icon {
  color: var(--primary-color);
}
.mic-label small {
  font-size: 0.8rem;
  opacity: 0.7;
}
.mic-level-bar-container {
  width: 100%;
  height: 1rem; /* h-2, but 1rem is better for visibility */
  background-color: var(--border-color);
  border-radius: 0.25rem; /* rounded */
  overflow: hidden;
}
.mic-level-bar {
  height: 100%;
  background-color: var(--primary-color); /* bg-[#111418] in prototype */
  border-radius: 0.25rem;
  transition: width 0.1s linear; /* Smooth transition for mic level */
}
[data-theme="dark"] .mic-level-bar {
  background-color: var(--primary-color); /* Use primary color for better visibility */
}


.status-checklist {
  margin-top: 0.5rem;
}
.checklist-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-color);
}
.status-item {
  display: flex;
  align-items: center;
  gap: 0.75rem; /* gap-x-3 */
  padding: 0.5rem 0; /* py-3 */
  font-size: 0.9rem;
  color: var(--text-color);
  cursor: default; /* Not interactive labels */
}
.status-item input[type="checkbox"] {
  /* Hide the actual checkbox, we use icon instead */
  display: none;
}
.status-item .fa-icon {
  font-size: 1.2em;
  color: var(--border-color); /* Default unchecked color */
  transition: color 0.2s ease;
}
.status-item.checked .fa-icon {
  color: var(--primary-color); /* Color for checked state */
}
[data-theme="light"] .status-item.checked .fa-icon {
  color: #28a745; /* Green for success on light theme */
}


.troubleshooting {
  margin-top: 0.5rem;
}
.troubleshooting .form-link {
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}
.troubleshooting-content {
  margin-top: 0.75rem;
  padding: 1rem;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.85rem;
  line-height: 1.6;
}
.troubleshooting-content ul {
  list-style-position: inside;
  padding-left: 0.5rem;
}
.troubleshooting-content li {
  margin-bottom: 0.5rem;
}

.proceed-button {
  /* Uses global .form-button */
  margin-top: 1rem;
  width: 100%; /* Make button full width of its container */
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}
</style>