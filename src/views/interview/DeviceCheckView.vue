<template>
  <div class="device-check-view">
    <h1 class="page-title">
      <font-awesome-icon :icon="['fas', 'tools']" class="title-icon"/>
      设备检查与调试
    </h1>
    <p class="page-subtitle">请确保您的摄像头和麦克风工作正常，以获得最佳面试体验。</p>

    <div class="device-check-layout">
      <div class="video-preview-main-wrapper">
        <UserCameraFeed
            :stream="cameraStream"
            :is-active="cameraStreamActive"
            :error-message="cameraError ?? undefined"
            :show-retry-button="!permissionsInitiallyRequested || !!cameraError"
            @retry="requestPermissionsAndEnumerate"
            class="video-feed-card"
        />
      </div>

      <div class="controls-and-status-panel">
        <DeviceSelector
            label="选择摄像头"
            icon="camera-retro"
            :devices="availableCameras"
            v-model="selectedCameraId"
            @update:modelValue="startCamera"
            defaultDeviceName="摄像头"
            noDeviceText="未找到摄像头"
        />

        <DeviceSelector
            label="选择麦克风"
            icon="microphone"
            :devices="availableMicrophones"
            v-model="selectedMicrophoneId"
            @update:modelValue="startMicrophone"
            defaultDeviceName="麦克风"
            noDeviceText="未找到麦克风"
        />

        <div class="mic-level-test">
          <p class="mic-label">
            <font-awesome-icon :icon="['fas', 'wave-square']" /> 麦克风音量检测：
            <small>请说话以测试您的麦克风。</small>
          </p>
          <div class="mic-level-bar-container">
            <div class="mic-level-bar" :style="{ width: microphoneLevel + '%' }"></div>
          </div>
        </div>

        <div class="status-checklist">
          <h3 class="checklist-title">系统状态检查</h3>
          <label class="status-item" :class="{ 'checked': permissionsGranted, 'error': !permissionsGranted && permissionsInitiallyRequested }">
            <input type="checkbox" :checked="permissionsGranted" disabled />
            <font-awesome-icon :icon="permissionsGranted ? ['fas', 'check-circle'] : ['fas', 'times-circle']" />
            浏览器权限已授予
          </label>
          <label class="status-item" :class="{ 'checked': cameraDetected, 'error': !cameraDetected && permissionsInitiallyRequested }">
            <input type="checkbox" :checked="cameraDetected" disabled />
            <font-awesome-icon :icon="cameraDetected ? ['fas', 'check-circle'] : ['fas', 'times-circle']" />
            摄像头已检测
          </label>
          <label class="status-item" :class="{ 'checked': microphoneDetected, 'error': !microphoneDetected && permissionsInitiallyRequested }">
            <input type="checkbox" :checked="microphoneDetected" disabled />
            <font-awesome-icon :icon="microphoneDetected ? ['fas', 'check-circle'] : ['fas', 'times-circle']" />
            麦克风已检测
          </label>
        </div>

        <div class="troubleshooting">
          <a href="#" @click.prevent="showTroubleshooting = !showTroubleshooting" class="form-link troubleshooting-link">
            <font-awesome-icon :icon="['fas', 'question-circle']" /> 遇到问题？查看故障排除技巧
          </a>
          <transition name="fade-slide">
            <div v-if="showTroubleshooting" class="troubleshooting-content">
              <ul>
                <li>确保您的浏览器已授予访问摄像头和麦克风的权限。通常可以在地址栏的站点设置（小锁图标）中检查。</li>
                <li>确保没有其他应用程序正在使用您的摄像头或麦克风。</li>
                <li>尝试从下拉列表中选择不同的摄像头或麦克风。</li>
                <li>如果问题仍然存在，尝试刷新页面或重启您的浏览器/电脑。</li>
              </ul>
            </div>
          </transition>
        </div>

        <button @click="proceedToInterview" class="form-button proceed-button" :disabled="!allChecksPassed || setupStore.isLoading">
          <span v-if="setupStore.isLoading">准备中...</span>
          <span v-else>
            <font-awesome-icon :icon="['fas', 'play-circle']" /> 一切就绪，开始面试！
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useInterviewSetupStore } from '@/stores/interviewSetup';
import UserCameraFeed from '../../components/interview/UserCameraFeed.vue'; // 复用
import DeviceSelector from '../../components/device/DeviceSelector.vue';   // 新组件

const router = useRouter();
const setupStore = useInterviewSetupStore();

const availableCameras = ref<MediaDeviceInfo[]>([]);
const availableMicrophones = ref<MediaDeviceInfo[]>([]);
const selectedCameraId = ref<string | null>(null);
const selectedMicrophoneId = ref<string | null>(null);

const cameraStream = ref<MediaStream | null>(null);
const microphoneStream = ref<MediaStream | null>(null); // 用于麦克风音量检测
const audioContext = ref<AudioContext | null>(null);
const analyser = ref<AnalyserNode | null>(null);
const microphoneLevel = ref(0);
let animationFrameId: number;

const permissionsGranted = ref(false);
const cameraDetected = ref(false); // 是否能获取到摄像头列表
const microphoneDetected = ref(false); // 是否能获取到麦克风列表
const cameraStreamActive = ref(false); // 摄像头视频流是否真的在播放
const cameraError = ref<string | null>(null);
const permissionsInitiallyRequested = ref(false); // 是否已尝试请求权限

const showTroubleshooting = ref(false);

const allChecksPassed = computed(() => permissionsGranted.value && cameraStreamActive.value && microphoneDetected.value && microphoneStream.value !== null);


const requestPermissionsAndEnumerate = async () => {
  permissionsInitiallyRequested.value = true;
  cameraError.value = null;
  cameraStreamActive.value = false;

  stopMediaTracks();

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    permissionsGranted.value = true;

    const devices = await navigator.mediaDevices.enumerateDevices();
    availableCameras.value = devices.filter(device => device.kind === 'videoinput');
    availableMicrophones.value = devices.filter(device => device.kind === 'audioinput');

    if (availableCameras.value.length > 0) {
      cameraDetected.value = true;
      if (!selectedCameraId.value || !availableCameras.value.find(c => c.deviceId === selectedCameraId.value)) {
        selectedCameraId.value = availableCameras.value[0].deviceId;
      }
      await startCamera(); // Start with current or default selection
    } else {
      cameraDetected.value = false;
      cameraError.value = '未找到摄像头。请连接摄像头并授予权限。';
    }

    if (availableMicrophones.value.length > 0) {
      microphoneDetected.value = true;
      if (!selectedMicrophoneId.value || !availableMicrophones.value.find(m => m.deviceId === selectedMicrophoneId.value)) {
        selectedMicrophoneId.value = availableMicrophones.value[0].deviceId;
      }
      await startMicrophone();
    } else {
      microphoneDetected.value = false;
    }

    // Stop the initial combined stream as we manage specific ones
    stream.getTracks().forEach(track => track.stop());

  } catch (err: any) {
    console.error("访问媒体设备时出错:", err);
    permissionsGranted.value = false;
    cameraDetected.value = false;
    microphoneDetected.value = false;
    cameraStreamActive.value = false;
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      cameraError.value = '权限被拒绝。请在浏览器设置中允许访问您的摄像头和麦克风。';
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      cameraError.value = '未找到摄像头或麦克风。请确保它们已连接并启用。';
    } else {
      cameraError.value = '无法访问摄像头/麦克风。错误: ' + err.message;
    }
  }
};

const startCamera = async () => {
  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach(track => track.stop());
    cameraStream.value = null;
  }
  cameraStreamActive.value = false;
  cameraError.value = null;

  if (selectedCameraId.value) {
    try {
      const constraints: MediaStreamConstraints = {
        video: { deviceId: { exact: selectedCameraId.value } },
        audio: false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      cameraStream.value = stream; // Pass to UserCameraFeed
      cameraStreamActive.value = true;
      cameraDetected.value = true;
    } catch (err) {
      console.error("启动选定摄像头失败:", err);
      cameraStream.value = null;
      cameraStreamActive.value = false;
      cameraError.value = "无法启动所选摄像头。";
    }
  } else if (availableCameras.value.length > 0) {
    // If no specific camera selected but cameras are available, prompt or error
    cameraError.value = "请选择一个摄像头。";
  } else {
    cameraError.value = "无可用摄像头。";
  }
};

const startMicrophone = async () => {
  if (microphoneStream.value) {
    microphoneStream.value.getTracks().forEach(track => track.stop());
    microphoneStream.value = null; // Clear old stream
    if (analyser.value) analyser.value.disconnect();
    if (audioContext.value && audioContext.value.state !== 'closed') {
      audioContext.value.close().catch(e => console.warn("关闭旧AudioContext失败", e));
    }
    audioContext.value = null; // Reset for new stream
  }
  microphoneLevel.value = 0; // Reset level

  if (selectedMicrophoneId.value) {
    try {
      const constraints: MediaStreamConstraints = {
        video: false,
        audio: { deviceId: { exact: selectedMicrophoneId.value } }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      microphoneStream.value = stream;
      microphoneDetected.value = true;
      setupMicrophoneVisualizer(microphoneStream.value);
    } catch (err) {
      console.error("启动选定麦克风失败:", err);
      microphoneStream.value = null;
      microphoneDetected.value = false;
    }
  }
};

const setupMicrophoneVisualizer = (stream: MediaStream) => { /* ... (保持不变) ... */
  // Ensure AudioContext is not already active or closed improperly
  if (audioContext.value && (audioContext.value.state === 'running' || audioContext.value.state === 'suspended')) {
    audioContext.value.close().catch(e => console.warn("关闭现有AudioContext失败", e));
  }
  audioContext.value = new (window.AudioContext || (window as any).webkitAudioContext)();
  analyser.value = audioContext.value.createAnalyser();
  const source = audioContext.value.createMediaStreamSource(stream);
  source.connect(analyser.value);
  analyser.value.fftSize = 256;
  const bufferLength = analyser.value.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  const draw = () => {
    animationFrameId = requestAnimationFrame(draw);
    if (analyser.value) {
      analyser.value.getByteFrequencyData(dataArray);
      let sum = 0; for (let i = 0; i < bufferLength; i++) { sum += dataArray[i]; }
      const average = sum / bufferLength;
      microphoneLevel.value = Math.min(100, (average / 128) * 100 * 2.5); // Amplified slightly more
    }
  };
  draw();
};

const proceedToInterview = async () => { /* ... (保持不变) ... */
  if (!allChecksPassed.value) { alert("请确保所有设备检查均已成功通过。"); return; }
  stopMediaTracks(); // Stop current streams
  const sessionId = await setupStore.createMockInterviewSession();
  if (sessionId) {
    router.push({
      name: 'InterviewRoom', params: { sessionId },
      query: { cam: selectedCameraId.value || undefined, mic: selectedMicrophoneId.value || undefined }
    });
  } else { alert("创建面试会话失败，请重试。"); }
};

const stopMediaTracks = () => { /* ... (保持不变) ... */
  if (cameraStream.value) { cameraStream.value.getTracks().forEach(track => track.stop()); cameraStream.value = null; }
  if (microphoneStream.value) { microphoneStream.value.getTracks().forEach(track => track.stop()); microphoneStream.value = null; }
  if (audioContext.value && audioContext.value.state !== 'closed') { audioContext.value.close().catch(e=>console.warn(e)); }
  if (animationFrameId) { cancelAnimationFrame(animationFrameId); }
  cameraStreamActive.value = false;
};

onMounted(() => { requestPermissionsAndEnumerate(); });
onBeforeUnmount(() => { stopMediaTracks(); });

</script>

<style scoped>
.device-check-view {
  padding: 2rem;
  max-width: 1000px; /* 调整最大宽度以适应两栏布局 */
  margin: 0 auto;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.page-title { /* ... (同之前，确保中文) ... */
  font-size: 1.8rem; font-weight: 700; color: var(--text-color); text-align: center; margin-bottom: 0.5rem;
  display: flex; align-items: center; justify-content: center; gap: 0.75rem;
}
[data-theme="dark"] .page-title { color: #ffffff; }
.page-title .title-icon { color: var(--primary-color); }

.page-subtitle { /* ... (同之前，确保中文) ... */
  text-align: center; font-size: 1rem; color: var(--text-color); opacity: 0.8; margin-bottom: 2.5rem;
}
[data-theme="dark"] .page-subtitle { color: #a2aab3; }


.device-check-layout {
  display: grid;
  grid-template-columns: 1fr; /* 默认单栏 */
  gap: 2rem; /* 网格间距 */
}

@media (min-width: 900px) { /* 当屏幕宽度足够时，变为两栏 */
  .device-check-layout {
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); /* 视频区更宽，控制区较窄 */
  }
}

.video-preview-main-wrapper {
  background-color: var(--card-bg-color);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  min-height: 300px; /* 给视频区一个最小高度 */
  display: flex; /* 让 UserCameraFeed 填满 */
  flex-direction: column;
}
.video-feed-card { /* 应用于 UserCameraFeed 组件的根元素 */
  width: 100%;
  aspect-ratio: 16 / 9; /* 保持视频比例 */
  max-height: 50vh; /* 限制最大高度 */
  border-radius: 6px; /* 视频本身的圆角 */
  overflow: hidden; /* 确保视频内容在圆角内 */
}


.controls-and-status-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background-color: var(--card-bg-color);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

/* DeviceSelector 组件的样式已在其内部定义，这里是其容器的上下文 */

.mic-level-test { margin-top: 0.5rem; }
.mic-label { font-size: 0.95rem; font-weight: 500; color: var(--text-color); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;}
.mic-label .fa-icon { color: var(--primary-color); }
.mic-label small { font-size: 0.8rem; opacity: 0.7; margin-left: 0.25rem;}
.mic-level-bar-container { width: 100%; height: 0.8rem; background-color: var(--border-color); border-radius: 0.25rem; overflow: hidden; }
.mic-level-bar { height: 100%; background-color: var(--primary-color); border-radius: 0.25rem; transition: width 0.05s linear; }
[data-theme="dark"] .mic-level-bar { background-color: var(--primary-color); }


.status-checklist { margin-top: 0.5rem; }
.checklist-title { font-size: 1.05rem; font-weight: 600; margin-bottom: 0.75rem; color: var(--text-color); }
[data-theme="dark"] .checklist-title { color: #ffffff;}
.status-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0; font-size: 0.95rem; color: var(--text-color); cursor: default; border-bottom: 1px solid var(--border-color); }
.status-item:last-child { border-bottom: none; }
.status-item input[type="checkbox"] { display: none; }
.status-item .fa-icon { font-size: 1.1em; color: var(--text-color-muted); transition: color 0.2s ease; }
.status-item.checked .fa-icon { color: #28a745; } /* Green for success */
[data-theme="dark"] .status-item.checked .fa-icon { color: #68d391; }
.status-item.error .fa-icon { color: #dc3545; } /* Red for error */
[data-theme="dark"] .status-item.error .fa-icon { color: #fc8181; }


.troubleshooting { margin-top: 1rem; } /* 增加与上方元素的间距 */
.troubleshooting-link { font-size: 0.9rem; display: inline-flex; align-items: center; gap: 0.3rem; color: var(--primary-color); text-decoration: underline; }
.troubleshooting-content { margin-top: 0.75rem; padding: 1rem; background-color: var(--bg-color); border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.85rem; line-height: 1.6; }
.troubleshooting-content ul { list-style-position: inside; padding-left: 0.5rem; }
.troubleshooting-content li { margin-bottom: 0.5rem; }

.proceed-button { /* .form-button */
  margin-top: 1.5rem; /* 与上方元素的间距 */
  width: 100%; padding: 0.875rem 1.5rem; font-size: 1rem;
  display: inline-flex; align-items: center; justify-content: center; gap: 0.75rem;
  background-color: var(--primary-color); color: white; border-radius: 6px;
}
.proceed-button:disabled { /* 确保禁用样式清晰 */
  background-color: var(--border-color);
  color: var(--text-color-muted);
  cursor: not-allowed;
  opacity: 0.7;
}
[data-theme="dark"] .proceed-button:disabled {
  background-color: #3a3f4c;
}


/* Transitions for troubleshooting content */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.3s ease-out;
  max-height: 200px; /* Adjust based on typical content height */
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
  margin-top: 0;
  padding-top: 0;
  padding-bottom: 0;
  overflow: hidden;
}
</style>