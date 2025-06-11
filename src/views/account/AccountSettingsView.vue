<template>
  <div class="account-settings-view">
    <h1 class="page-title">
      <font-awesome-icon :icon="['fas', 'user-cog']" class="title-icon"/> 账户设置
    </h1>

    <div v-if="!authStore.currentUser && authStore.isLoading" class="loading-state">
    </div>
    <div v-else-if="!authStore.currentUser" class="empty-state">
    </div>

    <div v-else class="settings-layout">
      <UserProfileInfoForm
          :initialProfileData="authStore.currentUser"
      />

      <UserResumeManager
          :resumes="userResumesComputed"
          :is-uploading="uploadingResume"
          @upload-new-resume="handleNewResumeUpload"
          @delete-resume="handleDeleteResume"
      />
      <p v-if="resumeStatusMessage" class="status-message inline-status" :class="resumeIsError ? 'error' : 'success'">
        {{ resumeStatusMessage }}
      </p>

      <PasswordChangeForm />

      <section class="settings-section danger-zone-section">
        <h2 class="section-title">账户管理</h2>
        <div class="danger-zone-content">
          <p class="setting-description">
            删除您的账户是一个**永久性**的操作，将移除您所有的数据，包括个人信息、面试记录和已上传的简历。此操作**无法撤销**。
          </p>
          <button type="button" @click="openDeleteConfirmationModal" class="form-button danger-button">
            <font-awesome-icon :icon="['fas', 'exclamation-triangle']" /> 我已知晓风险，申请删除账户
          </button>
        </div>
      </section>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import BaseModal from '../../components/common/BaseModal.vue';
import UserProfileInfoForm from '../../components/account/UserProfileInfoForm.vue';
import UserResumeManager from '../../components/account/UserResumeManager.vue';
import PasswordChangeForm from '../../components/account/PasswordChangeForm.vue';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const authStore = useAuthStore();
const router = useRouter();

// 简历管理相关的状态
const uploadingResume = ref(false);
const resumeStatusMessage = ref('');
const resumeIsError = ref(false);

// 账户删除相关的状态
const showDeleteConfirmationModal = ref(false);
const deleteConfirmationEmail = ref('');
const isDeletingAccount = ref(false);

const userResumesComputed = computed(() => authStore.currentUser?.resumes || []);

const canConfirmDeletion = computed(() => {
  return authStore.currentUser && deleteConfirmationEmail.value.trim().toLowerCase() === authStore.currentUser.email.toLowerCase();
});

onMounted(() => {
  if (!authStore.currentUser && !authStore.isLoading) {
    authStore.fetchUser();
  }
});

const handleNewResumeUpload = async (file: File) => {
  uploadingResume.value = true;
  resumeStatusMessage.value = '';
  const success = await authStore.uploadResume(file);
  if (success) {
    resumeStatusMessage.value = '简历上传成功！';
    resumeIsError.value = false;
  } else {
    resumeStatusMessage.value = authStore.error || '简历上传失败。';
    resumeIsError.value = true;
  }
  uploadingResume.value = false;
  setTimeout(() => resumeStatusMessage.value = '', 4000);
};

const handleDeleteResume = async (resumeId: string) => {
  if (confirm('您确定要删除这份简历吗？')) {
    resumeStatusMessage.value = '';
    const success = await authStore.deleteResume(resumeId);
    if (success) {
      resumeStatusMessage.value = '简历已成功删除。';
      resumeIsError.value = false;
    } else {
      resumeStatusMessage.value = authStore.error || '删除简历失败。';
      resumeIsError.value = true;
    }
    setTimeout(() => resumeStatusMessage.value = '', 4000);
  }
};

const openDeleteConfirmationModal = () => {
  deleteConfirmationEmail.value = '';
  showDeleteConfirmationModal.value = true;
};
const closeDeleteConfirmationModal = () => {
  showDeleteConfirmationModal.value = false;
};

const handleAccountDeletion = async () => {
  if (!canConfirmDeletion.value) {
    alert("请输入正确的邮箱以进行确认。");
    return;
  }
  isDeletingAccount.value = true;
  const success = await authStore.requestAccountDeletion();
  if (success) {
    closeDeleteConfirmationModal();
    alert("您的账户已成功删除。");
    // authStore.logout() is implicitly called by requestAccountDeletion's logic on success
    router.push({ name: 'Login' });
  } else {
    alert(authStore.error || '账户删除失败。请稍后再试或联系支持。');
  }
  isDeletingAccount.value = false;
};
</script>

<style scoped>
.account-settings-view {
  padding: 2.5rem 3rem; /* 增加页面整体内边距 */
  max-width: 960px;
  margin: 0 auto;
  color: var(--text-color);
}

.page-title { /* ... */ }
.settings-layout {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* **修正后的危险区域卡片样式** */
.danger-zone-section {
  border: 2px solid #e53e3e; /* **使用更清晰的实色红边框** */
  background-color: color-mix(in srgb, #e53e3e 5%, var(--card-bg-color) 95%);
  /* 确保它也拥有 .settings-section 的基础样式，或者直接在这里定义 */
  padding: 1.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
[data-theme="dark"] .danger-zone-section {
  border-color: #c53030;
  background-color: color-mix(in srgb, #c53030 10%, var(--card-bg-color) 90%);
}
.danger-zone-section .section-title {
  color: #e53e3e;
  border-bottom-color: color-mix(in srgb, #e53e3e 40%, transparent);
}
[data-theme="dark"] .danger-zone-section .section-title {
  color: #fc8181;
  border-bottom-color: color-mix(in srgb, #c53030 40%, transparent);
}

.danger-zone-content {
  display: flex;
  flex-direction: column; /* **让内容垂直堆叠** */
  align-items: flex-start; /* **内容左对齐** */
  gap: 1.5rem; /* 描述和按钮之间的间距 */
}
.setting-description {
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.9;
  line-height: 1.6;
}
[data-theme="dark"] .setting-description { color: #a2aab3; }
.setting-description strong {
  color: #e53e3e; /* 强调文字也用红色 */
  font-weight: bold;
}
[data-theme="dark"] .setting-description strong { color: #fc8181; }

.danger-button {
  background-color: #dc3545; color: white;
  border-color: #dc3545;
  width: auto; /* 按钮宽度自适应内容 */
}
.danger-button:hover { background-color: #c82333; border-color: #bd2130; }
[data-theme="dark"] .danger-button { background-color: #e53e3e; border-color: #e53e3e; }
[data-theme="dark"] .danger-button:hover { background-color: #c53030; border-color: #b72b2b; }


</style>