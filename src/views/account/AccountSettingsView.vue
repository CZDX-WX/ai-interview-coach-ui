<template>
  <div class="account-settings-view">
    <h1 class="page-title">
      <font-awesome-icon :icon="['fas', 'user-cog']" class="title-icon"/> 账户设置
    </h1>

    <div v-if="!authStore.currentUser && authStore.isLoading" class="loading-state">
      <div class="spinner"><div></div><div></div><div></div><div></div></div>
      加载用户数据中...
    </div>
    <div v-else-if="!authStore.currentUser && !authStore.isLoading" class="loading-state">用户数据加载失败。</div>

    <form @submit.prevent="handleSaveChanges" v-else class="settings-form">
      <UserProfileInfoForm
          :profileData="editableProfileFields"
          :initialNameDisplay="authStore.currentUser?.name || ''"
          :initialEmailDisplay="authStore.currentUser?.email || ''"
          @update:profileData="syncProfileFields"
      />

      <UserResumeManager
          :resumes="userResumesComputed"
          :is-uploading="uploadingResume"
          @upload-new-resume="handleNewResumeUpload"
          @delete-resume="handleDeleteResume"
      />

      <PasswordChangeForm v-model="passwordFields" />

      <div class="form-actions">
        <button type="submit" class="form-button save-changes-button" :disabled="authStore.isLoading">
          <font-awesome-icon :icon="['fas', 'save']" />
          <span v-if="authStore.isLoading">保存中...</span>
          <span v-else>保存更改</span>
        </button>
      </div>
      <p v-if="saveStatusMessage" class="status-message" :class="isError ? 'error' : 'success'">{{ saveStatusMessage }}</p>
    </form>

    <section class="settings-section danger-zone-section">
      <h2 class="section-title">账户管理</h2>
      <div class="form-group">
        <button type="button" @click="confirmAccountDeletion" class="form-button danger-button">
          <font-awesome-icon :icon="['fas', 'trash-alt']" /> 删除我的账户
        </button>
        <p class="setting-description">此操作无法撤销，将永久删除与此账户相关的所有数据。</p>
      </div>
    </section>

    <Teleport to="body">
      <div v-if="showDeleteConfirmationModal" class="modal-overlay" @click.self="showDeleteConfirmationModal = false">
        <div class="modal-content">
          <h3>确认删除账户</h3>
          <p>您确定要删除您的账户吗？此操作将永久删除您所有的面试数据、报告和个人信息，且无法撤销。</p>
          <div class="modal-actions">
            <button @click="showDeleteConfirmationModal = false" class="form-button secondary-button">取消</button>
            <button @click="handleAccountDeletion" class="form-button danger-button">是的，删除我的账户</button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, reactive, computed } from 'vue';
import type { ResumeInfo } from '../../stores/interviewSetup'; // Or your shared types
import { useAuthStore, User } from '@/stores/auth';

import UserProfileInfoForm from '../../components/account/UserProfileInfoForm.vue';
import UserResumeManager from '../../components/account/UserResumeManager.vue';
import PasswordChangeForm from '../../components/account/PasswordChangeForm.vue';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useRouter } from 'vue-router';


const authStore = useAuthStore();
const router = useRouter();

// For UserProfileInfoForm
const editableProfileFields = reactive<Partial<Omit<User, 'resumes' | 'id' | 'resumes'>>>({
  name: '', email: '', avatarUrl: '', school: '', major: '', graduationYear: '',
});

// For UserResumeManager
const userResumesComputed = computed(() => authStore.currentUser?.resumes || []);
const uploadingResume = ref(false); // Parent controls this state for UserResumeManager
const newResumeFileRef = ref<HTMLInputElement | null>(null); // This ref needs to be in UserResumeManager if input is there


// For PasswordChangeForm
const passwordFields = reactive({ newPassword: '', confirmNewPassword: '' });

const saveStatusMessage = ref('');
const isError = ref(false);
const showDeleteConfirmationModal = ref(false);


const initializeEditableFields = () => {
  if (authStore.currentUser) {
    editableProfileFields.name = authStore.currentUser.name;
    editableProfileFields.email = authStore.currentUser.email;
    editableProfileFields.avatarUrl = authStore.currentUser.avatarUrl;
    editableProfileFields.school = authStore.currentUser.school;
    editableProfileFields.major = authStore.currentUser.major;
    editableProfileFields.graduationYear = authStore.currentUser.graduationYear;
  }
};

// Sync data from child UserProfileInfoForm back to parent's reactive object
const syncProfileFields = (updatedData: Partial<Omit<User, 'id' | 'resumes'>>) => {
  Object.assign(editableProfileFields, updatedData);
};


onMounted(() => {
  if (!authStore.currentUser && !authStore.isLoading) {
    authStore.fetchUser().then(initializeEditableFields);
  } else {
    initializeEditableFields();
  }
});

watch(() => authStore.currentUser, (newUser) => {
  if (newUser) {
    initializeEditableFields();
  }
}, { deep: true });

const handleNewResumeUpload = async (file: File) => {
  // Validation can be done here before calling store, or assumed done in child
  uploadingResume.value = true;
  saveStatusMessage.value = '';
  const uploadedResume = await authStore.uploadResume(file);
  if (uploadedResume) {
    saveStatusMessage.value = '简历上传成功！';
    isError.value = false;
    // userResumesComputed will update automatically
  } else {
    saveStatusMessage.value = authStore.error || '简历上传失败。';
    isError.value = true;
  }
  uploadingResume.value = false;
};

const handleDeleteResume = async (resumeId: string) => {
  if (confirm('您确定要删除这份简历吗？')) {
    saveStatusMessage.value = '';
    const success = await authStore.deleteResume(resumeId);
    if (success) {
      saveStatusMessage.value = '简历已成功删除。';
      isError.value = false;
    } else {
      saveStatusMessage.value = authStore.error || '删除简历失败。';
      isError.value = true;
    }
  }
};

const handleSaveChanges = async () => {
  saveStatusMessage.value = '';
  isError.value = false;
  let overallSuccess = true;

  const profileUpdateSuccess = await authStore.updateUserProfile(editableProfileFields);
  if (!profileUpdateSuccess) {
    saveStatusMessage.value = authStore.error || '个人信息保存失败。';
    isError.value = true;
    overallSuccess = false;
  }

  if (passwordFields.newPassword) {
    if (passwordFields.newPassword !== passwordFields.confirmNewPassword) {
      saveStatusMessage.value = (saveStatusMessage.value ? saveStatusMessage.value + '\n' : '') + '新密码与确认密码不匹配。';
      isError.value = true;
      overallSuccess = false;
    } else {
      const passwordChangeSuccess = await authStore.changePassword(passwordFields.newPassword);
      if (passwordChangeSuccess) {
        passwordFields.newPassword = '';
        passwordFields.confirmNewPassword = '';
      } else {
        saveStatusMessage.value = (saveStatusMessage.value ? saveStatusMessage.value + '\n' : '') + (authStore.error || '密码修改失败。');
        isError.value = true;
        overallSuccess = false;
      }
    }
  }

  if (overallSuccess) {
    saveStatusMessage.value = '更改已成功保存！';
    isError.value = false;
  }
  setTimeout(() => saveStatusMessage.value = '', 5000);
};

const confirmAccountDeletion = () => { showDeleteConfirmationModal.value = true; };
const handleAccountDeletion = async () => {
  showDeleteConfirmationModal.value = false;
  saveStatusMessage.value = '正在处理账户删除请求...';
  isError.value = false;
  const success = await authStore.requestAccountDeletion(); // Changed from preferencesStore
  if (success) {
    // User would be logged out by authStore action eventually
    // For mock, explicitly call logout and redirect
    authStore.logout();
    router.push({ name: 'Login' });
  } else {
    saveStatusMessage.value = '账户删除失败。请稍后再试或联系支持。';
    isError.value = true;
  }
};
</script>

<style scoped>
/* Keep only parent-specific styles. Most section/form styles are now in child components. */
.account-settings-view {
  padding: 1.5rem 2rem;
  max-width: 960px;
  margin: 0 auto;
  color: var(--text-color);
}
.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
[data-theme="dark"] .page-title { color: #ffffff; }
.page-title .title-icon { color: var(--primary-color); }

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 2.5rem; /* Gap between sections */
}

.form-actions {
  display: flex;
  justify-content: flex-end; /* Align button to right */
  margin-top: 1.5rem; /* Space above save button if it's separate */
  padding: 1.5rem; /* Match section padding */
  background-color: var(--card-bg-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}
.save-changes-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.6rem;
  background-color: var(--primary-color);
  color: white;
  padding: 0.625rem 1.5rem;
}
[data-theme="dark"] .save-changes-button {
  background-color: var(--primary-color);
  color: white;
}


.status-message { margin-top: 1rem; padding: 0.75rem 1rem; border-radius: 6px; font-size: 0.9rem; text-align: center;}
.status-message.success { background-color: color-mix(in srgb, var(--primary-color) 15%, transparent); color: var(--primary-color); border: 1px solid var(--primary-color); }
.status-message.error { background-color: #ffe3e3; color: #c00; border: 1px solid #ffb3b3; }
[data-theme="dark"] .status-message.success { background-color: color-mix(in srgb, var(--primary-color) 20%, var(--bg-color) 80%); color: color-mix(in srgb, var(--primary-color) 90%, white 10%); border-color: var(--primary-color); }
[data-theme="dark"] .status-message.error { background-color: #4d1f1f; color: #ffcccc; border-color: #8b3333; }

.loading-state { text-align: center; padding: 2rem; font-size: 1.1rem; opacity: 0.8;}
.spinner { display: inline-block; position: relative; width: 60px; height: 60px; margin-bottom: 1rem; }
.spinner div { box-sizing: border-box; display: block; position: absolute; width: 48px; height: 48px; margin: 6px; border: 4px solid var(--primary-color); border-radius: 50%; animation: spinner-animation 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite; border-color: var(--primary-color) transparent transparent transparent; }
.spinner div:nth-child(1) { animation-delay: -0.45s; }
.spinner div:nth-child(2) { animation-delay: -0.3s; }
.spinner div:nth-child(3) { animation-delay: -0.15s; }
@keyframes spinner-animation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.danger-zone-section {
  border-color: #e53e3e; /* Red border for danger zone */
}
[data-theme="dark"] .danger-zone-section {
  border-color: #c53030;
}
.danger-zone-section .section-title {
  color: #e53e3e;
  border-bottom-color: color-mix(in srgb, #e53e3e 50%, transparent);
}
[data-theme="dark"] .danger-zone-section .section-title {
  color: #fc8181;
  border-bottom-color: color-mix(in srgb, #c53030 50%, transparent);
}
.danger-button { /* From SettingsView */
  background-color: #dc3545; color: white; border-color: #dc3545; width: auto;
  display: inline-flex; align-items: center; gap: 0.5rem;
}
.danger-button:hover { background-color: #c82333; border-color: #bd2130; }
[data-theme="dark"] .danger-button { background-color: #e53e3e; border-color: #e53e3e; }
[data-theme="dark"] .danger-button:hover { background-color: #c53030; border-color: #b72b2b; }
.setting-description { font-size: 0.85rem; color: var(--text-color); opacity: 0.7; margin-top: 0.5rem; padding-left: 0.25rem; }
[data-theme="dark"] .setting-description { color: #a2aab3; }

/* Modal Styles (copied from SettingsView for consistency) */
.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 1050; }
.modal-content { background-color: var(--card-bg-color); padding: 2rem; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); width: 90%; max-width: 500px; color: var(--text-color); }
.modal-content h3 { font-size: 1.5rem; font-weight: 600; color: var(--text-color); margin-top: 0; margin-bottom: 1rem; }
[data-theme="dark"] .modal-content h3 { color: #ffffff; }
.modal-content p { font-size: 1rem; line-height: 1.6; margin-bottom: 1.5rem; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; }
.modal-actions .form-button { padding: 0.6rem 1.2rem; font-size: 0.9rem; }
.modal-actions .secondary-button { background-color: var(--bg-color); color: var(--text-color); border: 1px solid var(--border-color); }
.modal-actions .secondary-button:hover { background-color: var(--border-color); }

</style>