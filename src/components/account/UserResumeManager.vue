<template>
  <section class="settings-section">
    <h2 class="section-title">管理简历</h2>
    <div v-if="resumes && resumes.length > 0" class="resume-list">
      <div v-for="resume in resumes" :key="resume.id" class="resume-item">
        <div class="resume-info">
          <font-awesome-icon :icon="['fas', 'file-pdf']" class="resume-icon"/>
          <span class="resume-name">{{ resume.name }}</span>
          <span class="resume-date">(已上传：{{ resume.uploadDate }})</span>
        </div>
        <button type="button" @click="emitDelete(resume.id!)" class="button-icon-only delete-resume-button" title="删除简历">
          <font-awesome-icon :icon="['fas', 'trash-alt']" />
        </button>
      </div>
    </div>
    <p v-else class="empty-text">您尚未上传任何简历。</p>

    <div class="file-upload-area small-upload">
      <input type="file" id="resume-upload-profile-component" @change="handleFileUpload" accept=".pdf,.doc,.docx" ref="newResumeFileRef" class="file-input-hidden" />
      <label for="resume-upload-profile-component" class="file-upload-label">
        <font-awesome-icon :icon="['fas', 'plus-circle']" class="upload-icon-small"/>
        <span>上传新简历</span>
      </label>
    </div>
    <p v-if="isUploading" class="status-text">简历上传中...</p>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ResumeInfo } from '../../stores/interviewSetup'; // Or your shared types
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

defineProps<{
  resumes: ResumeInfo[];
  isUploading?: boolean; // To show uploading status from parent
}>();

const emit = defineEmits<{
  (e: 'upload-new-resume', file: File): void;
  (e: 'delete-resume', resumeId: string): void;
}>();

const newResumeFileRef = ref<HTMLInputElement | null>(null);

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    // Validation can also be done here or in parent before emitting
    emit('upload-new-resume', file);
    if (newResumeFileRef.value) newResumeFileRef.value.value = ''; // Clear file input
  }
};

const emitDelete = (resumeId: string) => {
  emit('delete-resume', resumeId);
};
</script>

<style scoped>
/* 样式从 AccountSettingsView.vue 迁移和调整 */
.settings-section { /* ... (same as UserProfileInfoForm) ... */ }
.section-title { /* ... (same as UserProfileInfoForm) ... */ }
.resume-list { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }
.resume-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background-color: var(--bg-color); border-radius: 6px; border: 1px solid var(--border-color); }
[data-theme="dark"] .resume-item { background-color: #121416; }
.resume-info { display: flex; align-items: center; gap: 1rem; overflow: hidden; flex-grow: 1; min-width: 0; }
.resume-icon { font-size: 1.5rem; color: var(--primary-color); width: 3rem; height: 3rem; background-color: var(--border-color); border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;}
[data-theme="dark"] .resume-icon { color: #ffffff; background-color: #2c3035; }
.resume-name { font-weight: 500; color: var(--text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: inline-block; max-width: 300px;}
[data-theme="dark"] .resume-name { color: #ffffff; }
.resume-date { font-size: 0.8rem; color: var(--text-color); opacity: 0.7; margin-left: 0.5rem; white-space: nowrap; flex-shrink: 0;}
[data-theme="dark"] .resume-date { color: #a2aab3; }
.button-icon-only { background: none; border: none; color: var(--text-color); opacity: 0.7; padding: 0.5rem; border-radius: 50%; cursor: pointer; transition: opacity 0.2s ease, background-color 0.2s ease; flex-shrink: 0; margin-left: 1rem;}
[data-theme="dark"] .button-icon-only { color: #ffffff; }
.button-icon-only:hover { opacity: 1; background-color: color-mix(in srgb, var(--text-color) 10%, transparent); }
.delete-resume-button:hover { color: #ef4444; }
[data-theme="dark"] .delete-resume-button:hover { color: #fc8181; }

.empty-text { font-size: 0.9rem; opacity: 0.7; margin-bottom: 1.5rem; text-align: center; padding: 0.5rem 0; }
.file-upload-area.small-upload { margin-top: 1rem; }
.file-input-hidden { width: 0.1px; height: 0.1px; opacity: 0; overflow: hidden; position: absolute; z-index: -1;}
.file-upload-label { display: inline-flex; flex-direction: row; align-items: center; justify-content: center; gap: 0.75rem; padding: 0.75rem 1.25rem; border: 1px solid var(--input-border-color, #40474f); background-color: var(--input-bg-color, #1e2124); color: var(--text-color); border-radius: 6px; cursor: pointer; transition: background-color 0.2s ease, border-color 0.2s ease;}
[data-theme="dark"] .file-upload-label { border-color: #40474f; background-color: #1e2124; color: #ffffff; }
.file-upload-label:hover { border-color: var(--primary-color); background-color: color-mix(in srgb, var(--primary-color) 10%, var(--input-bg-color, #1e2124));}
.upload-icon-small { font-size: 1.1rem; color: var(--primary-color); }
.status-text { font-size: 0.9rem; opacity: 0.7; margin-top: 0.5rem; text-align: left; }
</style>