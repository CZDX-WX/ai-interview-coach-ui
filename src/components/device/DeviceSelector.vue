<template>
  <div class="form-group device-selector-group">
    <label :for="selectId">
      <font-awesome-icon v-if="icon" :icon="icon" class="label-icon" /> {{ label }}
    </label>
    <select
        :id="selectId"
        :value="modelValue"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
        class="form-input select-input"
        :disabled="!devices || devices.length === 0"
    >
      <option v-if="!devices || devices.length === 0" value="">{{ noDeviceText || '未找到设备' }}</option>
      <option v-for="(device, index) in devices" :key="device.deviceId" :value="device.deviceId">
        {{ device.label || `${defaultDeviceName} ${index + 1}` }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  label: string; // 中文标签, e.g., "选择摄像头"
  icon?: string | string[]; // Font Awesome icon for label
  devices: MediaDeviceInfo[];
  modelValue: string | null; // Selected device ID
  defaultDeviceName: string; // e.g., "摄像头", "麦克风"
  noDeviceText?: string; // e.g., "未找到摄像头"
}>();

defineEmits(['update:modelValue']);

const selectId = computed(() => `device-select-${props.label.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substring(2,7)}`);
</script>

<style scoped>
.form-group { /* 从 AccountSettingsView 等页面借鉴并调整 */
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%; /* 确保填满其容器 */
}
.form-group label {
  font-size: 0.95rem; /* 调整标签大小 */
  font-weight: 500;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.label-icon {
  color: var(--primary-color);
  font-size: 1.1em; /* 相对于标签文字大小 */
}

.form-input.select-input {
  /* 这些样式应该由全局 .form-input 和 .select-input 提供 */
  /* 这里可以添加针对此组件上下文的微调 */
  width: 100%;
  padding: 0.875rem 1rem;
  font-size: 0.95rem; /* 调整下拉框字体大小 */
  background-color: var(--input-bg-color);
  border: 1px solid var(--input-border-color);
  border-radius: 6px;
  color: var(--text-color);
  background-image: var(--select-button-svg);
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.25em;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}
.form-input.select-input:disabled {
  opacity: 0.7;
  background-color: var(--border-color); /* 更明显的禁用背景 */
  cursor: not-allowed;
}
</style>