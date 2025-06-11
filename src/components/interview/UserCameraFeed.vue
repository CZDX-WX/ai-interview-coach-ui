<template>
  <div class="user-camera-feed-component">
    <video ref="videoElementRef" autoplay playsinline muted class="live-video-feed"></video>
    <div v-if="!isActive || errorMessage" class="video-overlay-message">
      <font-awesome-icon :icon="['fas', 'video-slash']" class="overlay-icon"/>
      <p>{{ errorMessage || "摄像头未激活或未找到。请检查设备连接和浏览器权限。" }}</p> <button v-if="showRetryButton && !isActive" @click="$emit('retry')" class="form-button small-retry-button">
      <font-awesome-icon :icon="['fas', 'sync-alt']" /> 重试检测
    </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  stream: MediaStream | null;
  isActive: boolean;
  errorMessage?: string;
  showRetryButton?: boolean; // 新增 prop，用于在设备检测页显示重试按钮
}>();

defineEmits(['retry']); // 新增事件

const videoElementRef = ref<HTMLVideoElement | null>(null);

const updateVideoStream = (newStream: MediaStream | null) => {
  if (videoElementRef.value) {
    videoElementRef.value.srcObject = newStream;
    if (newStream) {
      videoElementRef.value.play().catch(e => console.warn("视频播放失败:", e));
    }
  }
};

watch(() => props.stream, (newStream) => {
  updateVideoStream(newStream);
}, { immediate: true });

onMounted(() => {
  // 初始加载时，如果 stream 已经存在，再次尝试设置
  if (props.stream && videoElementRef.value && !videoElementRef.value.srcObject) {
    updateVideoStream(props.stream);
  }
});
</script>

<style scoped>
.user-camera-feed-component { /* ... (样式与之前类似，确保适应不同大小) ... */
  width: 100%; height: 100%; position: relative; background-color: #000;
  display: flex; align-items: center; justify-content: center; border-radius: inherit;
}
.live-video-feed { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); border-radius: inherit;}
.video-overlay-message { /* ... (样式与之前类似) ... */
  position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; background-color: rgba(0,0,0,0.7); /* 更深的遮罩 */
  color: #fff; padding: 1rem; text-align: center; border-radius: inherit;
}
.overlay-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.6; }
.video-overlay-message p { font-size: 0.95rem; margin-bottom: 1.25rem; line-height: 1.5;}
.small-retry-button { /* 确保 .form-button 全局样式可被此类继承或直接应用 */
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
}
.small-retry-button:hover {
  opacity: 0.9;
}
</style>