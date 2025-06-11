<template>
  <div class="resume-selector-upload">
    <div class="form-group">
      <label for="resume-selection">您的简历</label>
      <select id="resume-selection" :value="selectedResumeIdOrAction" @change="handleDropdownChange" class="form-input select-input">
        <option :value="null">无简历 / 跳过此步</option>
        <option v-for="resume in userResumes" :key="resume.id" :value="resume.id">
          {{ resume.name }} (已上传：{{ resume.uploadDate }})
        </option>
        <option value="upload_new">上传一份新简历...</option>
      </select>
    </div>

    <div v-if="localShowFileUpload" class="file-upload-area">
      <input
          type="file"
          :id="fileInputId"
          @change="handleFileSelected"
          accept=".pdf,.doc,.docx"
          ref="fileInputRef"
          class="file-input-hidden"
      />
      <label :for="fileInputId" class="file-upload-label">
        <font-awesome-icon :icon="['fas', 'upload']" class="upload-icon" />
        <span v-if="!currentSelectedFileName">拖拽文件至此或点击上传 (PDF, DOC, DOCX)</span>
        <span v-else>已选择文件：{{ currentSelectedFileName }}</span>
      </label>
    </div>
    <div v-else-if="selectedExistingResumeName" class="selected-resume-info">
      当前选用：<strong>{{ selectedExistingResumeName }}</strong>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import type { ResumeInfo } from '../../stores/interviewSetup'; // 或共享类型文件
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  userResumes: ResumeInfo[];
  modelValue: ResumeInfo | null; // Represents the chosen resume (either existing or newly uploaded details)
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: ResumeInfo | null): void;
  // No need for @file-selected if we update modelValue directly with file info
}>();

const fileInputRef = ref<HTMLInputElement | null>(null);
const localShowFileUpload = ref(false);
const currentSelectedFileName = ref<string | null>(null); // Name of the file selected via input

// This computed property helps manage the select dropdown's state based on modelValue
const selectedResumeIdOrAction = computed<string | null>(() => {
  if (!props.modelValue) return null; // No resume selected
  if (props.modelValue.file) return 'upload_new'; // A new file is staged
  if (props.modelValue.id) return props.modelValue.id; // An existing resume is selected
  return null;
});

const selectedExistingResumeName = computed<string | null>(() => {
  if (props.modelValue && props.modelValue.id && !props.modelValue.file) {
    const existing = props.userResumes.find(r => r.id === props.modelValue!.id);
    return existing?.name || null;
  }
  return null;
});

// Generate a unique ID for the file input to link with the label
const fileInputId = `resume-upload-input-${Math.random().toString(36).substring(2, 9)}`;

watch(() => props.modelValue, (newVal) => {
  if (newVal && newVal.file) {
    localShowFileUpload.value = true;
    currentSelectedFileName.value = newVal.name;
  } else if (newVal && newVal.id) {
    localShowFileUpload.value = false;
    currentSelectedFileName.value = null; // Clear staged file name
  } else {
    localShowFileUpload.value = false;
    currentSelectedFileName.value = null;
  }
}, { immediate: true });


const handleDropdownChange = (event: Event) => {
  const selectedValue = (event.target as HTMLSelectElement).value;
  if (selectedValue === 'upload_new') {
    localShowFileUpload.value = true;
    currentSelectedFileName.value = null; // Clear any previously selected file name
    // Emit a temporary state or null until a file is actually chosen
    emit('update:modelValue', { name: '等待上传新文件' }); // Placeholder
    // Optionally trigger click on file input if desired:
    // fileInputRef.value?.click();
  } else if (selectedValue) {
    const chosenResume = props.userResumes.find(r => r.id === selectedValue);
    emit('update:modelValue', chosenResume || null);
    localShowFileUpload.value = false;
  } else {
    emit('update:modelValue', null); // No resume selected
    localShowFileUpload.value = false;
  }
};

const handleFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('文件类型无效。请上传 PDF, DOC, 或 DOCX 格式的文件。');
      target.value = '';
      currentSelectedFileName.value = null;
      // If "upload_new" was selected, modelValue might need reset or specific handling
      if(selectedResumeIdOrAction.value === 'upload_new'){
        emit('update:modelValue', { name: '等待上传新文件' });
      }
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('文件过大，最大不能超过 5MB。');
      target.value = '';
      currentSelectedFileName.value = null;
      if(selectedResumeIdOrAction.value === 'upload_new'){
        emit('update:modelValue', { name: '等待上传新文件' });
      }
      return;
    }
    currentSelectedFileName.value = file.name;
    emit('update:modelValue', {
      name: file.name,
      file: file, // The actual file object
      uploadDate: new Date().toISOString().split('T')[0] // Tentative upload date
    });
  } else {
    currentSelectedFileName.value = null;
    if(selectedResumeIdOrAction.value === 'upload_new'){
      emit('update:modelValue', { name: '等待上传新文件' });
    }
  }
};
</script>

<style scoped>
/* 样式主要从 InterviewSetupView.vue 迁移和调整 */
.form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
.form-group label { font-size: 0.9rem; font-weight: 500; color: var(--text-color); }
[data-theme="dark"] .form-group label { color: #ffffff; }

.form-input.select-input {
  /* 确保这些样式是全局 .form-input 的一部分或在这里定义 */
  width: 100%; padding: 0.875rem 1rem; font-size: 1rem;
  background-color: var(--input-bg-color); border: 1px solid var(--input-border-color);
  border-radius: 6px; color: var(--text-color);
  background-image: var(--select-button-svg);
  background-repeat: no-repeat; background-position: right 0.75rem center;
  background-size: 1.25em; appearance: none; -webkit-appearance: none; -moz-appearance: none;
  padding-right: 2.5rem; /* Space for arrow */
}

.file-upload-area { margin-top: 1rem; }
.file-input-hidden { width: 0.1px; height: 0.1px; opacity: 0; overflow: hidden; position: absolute; z-index: -1;}
.file-upload-label {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 2rem 1rem; border: 2px dashed var(--border-color);
  border-radius: 8px; cursor: pointer; transition: border-color 0.2s ease, background-color 0.2s ease;
  text-align: center; font-size: 0.9rem; color: var(--text-color); opacity: 0.9;
}
.file-upload-label:hover {
  border-color: var(--primary-color);
  background-color: color-mix(in srgb, var(--primary-color) 5%, transparent);
}
.upload-icon { font-size: 2rem; color: var(--primary-color); margin-bottom: 0.75rem; }

.selected-resume-info {
  margin-top: 1rem; padding: 0.75rem 1rem;
  background-color: color-mix(in srgb, var(--primary-color) 10%, var(--bg-color) 90%);
  border: 1px solid color-mix(in srgb, var(--primary-color) 30%, var(--border-color) 70%);
  border-radius: 6px; font-size: 0.9rem; color: var(--text-color);
}
[data-theme="dark"] .selected-resume-info {
  background-color: color-mix(in srgb, var(--primary-color) 15%, var(--card-bg-color) 85%);
  border-color: color-mix(in srgb, var(--primary-color) 40%, var(--border-color) 60%);
}
.selected-resume-info strong { font-weight: 600; color: var(--primary-color); }
</style>