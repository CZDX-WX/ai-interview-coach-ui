<template>
  <section class="settings-section">
    <h2 class="section-title">个人信息</h2>
    <form @submit.prevent="handleSaveProfile" class="profile-form">
      <div class="profile-header">
        <label for="avatar-input" class="avatar-uploader" title="点击更换头像">
          <input
              type="file"
              id="avatar-input"
              ref="avatarInputRef"
              @change="handleAvatarFileChange"
              accept="image/png, image/jpeg"
              class="file-input-hidden"
          />
          <img :src="displayAvatarSrc" alt="用户头像" class="avatar-image">
          <div class="avatar-overlay">
            <font-awesome-icon :icon="['fas', 'camera']" />
            <span>更换头像</span>
          </div>
        </label>
        <div class="profile-summary-text">
          <p class="user-name-display">{{ authStore.currentUser?.fullName || '未设置姓名' }}</p>
          <p class="user-email-display">{{ authStore.currentUser?.email }}</p>
        </div>
      </div>

      <div class="form-fields-container">
        <div class="form-group">
          <label for="fullName">全名 / 昵称</label>
          <input type="text" id="fullName" v-model="editableProfile.fullName" class="form-input" placeholder="您的全名或昵称">
        </div>
        <div class="form-group">
          <label for="email">电子邮箱 (登录名)</label>
          <input type="email" id="email" v-model="editableProfile.email" class="form-input" placeholder="您的电子邮箱" disabled title="如需修改邮箱，请联系客服">
        </div>
        <div class="form-group">
          <label for="school">学校 / 大学</label>
          <input type="text" id="school" v-model="editableProfile.school" class="form-input" placeholder="例如：模拟大学">
        </div>
        <div class="form-group">
          <label for="major">专业</label>
          <input type="text" id="major" v-model="editableProfile.major" class="form-input" placeholder="例如：计算机科学与技术">
        </div>
        <div class="form-group">
          <label for="graduationYear">毕业年份</label>
          <input type="text" id="graduationYear" v-model="editableProfile.graduationYear" class="form-input" placeholder="例如：2025">
        </div>
      </div>

      <div class="form-actions">
        <p v-if="statusMessage" class="status-message" :class="isError ? 'error' : 'success'">{{ statusMessage }}</p>
        <button type="submit" class="form-button primary-button" :disabled="isSaving">
          <font-awesome-icon :icon="['fas', 'save']" />
          {{ isSaving ? '保存中...' : '保存个人信息' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue';
import { useAuthStore } from '../../stores/auth';
import type { UpdateUserProfileRequest } from '../../types/apiTypes';

const authStore = useAuthStore();
const editableProfile = reactive<Partial<UpdateUserProfileRequest & { avatarUrl?: string }>>({});

const isSaving = ref(false);
const statusMessage = ref('');
const isError = ref(false);
const avatarInputRef = ref<HTMLInputElement | null>(null);
const avatarPreviewUrl = ref<string | null>(null);

// **新增**: 计算属性，决定最终显示的头像URL
const displayAvatarSrc = computed(() => {
  // 1. 优先显示用户刚选择的本地预览图
  if (avatarPreviewUrl.value) {
    return avatarPreviewUrl.value;
  }
  // 2. 其次显示用户已保存的头像URL
  if (editableProfile.avatarUrl) {
    // 假设后端返回的URL是相对路径 /api/files/...，需要拼接
    const baseUrl = import.meta.env.VITE_API_ROOT_URL || 'http://localhost:9090';
    return `${baseUrl}${editableProfile.avatarUrl}`;
  }
  // 3. 最后显示根据用户名生成的默认头像
  const userName = editableProfile.fullName || authStore.currentUser?.fullName || 'User';
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}&backgroundColor=007bff,0d6efd,28a745,198754,ffc107,6f42c1,d63384&backgroundType=gradientLinear`;
});


watch(() => authStore.currentUser, (newUser) => {
  if (newUser) {
    Object.assign(editableProfile, {
      fullName: newUser.fullName, email: newUser.email, avatarUrl: newUser.avatarUrl,
      school: newUser.school, major: newUser.major, graduationYear: newUser.graduationYear,
    });
  }
}, { deep: true, immediate: true });

const triggerAvatarUpload = () => { avatarInputRef.value?.click(); };

const handleAvatarFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    if (!file.type.startsWith('image/')) { alert('请上传图片格式的文件 (JPEG, PNG)。'); return; }
    if (file.size > 2 * 1024 * 1024) { alert('图片文件过大，请上传小于 2MB 的图片。'); return; }

    const oldPreviewUrl = avatarPreviewUrl.value;
    avatarPreviewUrl.value = URL.createObjectURL(file);
    if (oldPreviewUrl) URL.revokeObjectURL(oldPreviewUrl);

    isSaving.value = true; statusMessage.value = '正在上传头像...'; isError.value = false;
    const success = await authStore.uploadAvatar(file);
    if (success) {
      await authStore.fetchUser(); // 强制刷新以获取后端返回的新URL
      statusMessage.value = '头像更新成功！';
    } else {
      statusMessage.value = authStore.error || '头像上传失败。'; isError.value = true;
    }
    isSaving.value = false;
    if (avatarPreviewUrl.value) { URL.revokeObjectURL(avatarPreviewUrl.value); avatarPreviewUrl.value = null; }
    setTimeout(() => statusMessage.value = '', 4000);
  }
};

const handleSaveProfile = async () => {
  isSaving.value = true; statusMessage.value = '';
  const payload: UpdateUserProfileRequest = {
    fullName: editableProfile.fullName || '', email: editableProfile.email || '',
    school: editableProfile.school || '', major: editableProfile.major || '',
    graduationYear: editableProfile.graduationYear || '',
  };
  const success = await authStore.updateUserProfile(payload);
  if (success) {
    await authStore.fetchUser();
    statusMessage.value = '个人信息保存成功！'; isError.value = false;
  } else {
    statusMessage.value = authStore.error || '个人信息保存失败。'; isError.value = true;
  }
  isSaving.value = false;
  setTimeout(() => statusMessage.value = '', 4000);
};
</script>

<style scoped>
.settings-section {
  background-color: var(--card-bg-color);
  padding: 2rem;
  border-radius: 12px; /* 更圆润的卡片 */
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
[data-theme="dark"] .settings-section {
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.section-title {
  font-size: 1.25rem; font-weight: 600; color: var(--text-color);
  margin-bottom: 2rem; padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}
[data-theme="dark"] .section-title { color: #ffffff; }

.profile-header {
  display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem;
}

/* **最终头像样式** */
.avatar-uploader {
  position: relative; width: 100px; height: 100px;
  border-radius: 50%; cursor: pointer; flex-shrink: 0;
  /* 移除容器边框 */
}
.avatar-image, .avatar-placeholder {
  width: 100%; height: 100%; border-radius: 50%;
  object-fit: cover;
  /* **在图片/占位符上加边框** */
  border: 2px solid var(--border-color);
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}
.avatar-placeholder {
  background-color: var(--card-bg-color);
  display: flex; align-items: center; justify-content: center;
  font-size: 2.5rem; color: var(--text-color-muted);
}
.avatar-uploader:hover .avatar-image,
.avatar-uploader:hover .avatar-placeholder {
  filter: brightness(0.7);
  border-color: var(--primary-color);
}
.avatar-overlay {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.5); color: white;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  font-size: 0.9rem; font-weight: 500; text-align: center;
  opacity: 0; transition: opacity 0.3s ease;
  pointer-events: none; border-radius: 50%;
}
.avatar-uploader:hover .avatar-overlay { opacity: 1; }
.avatar-overlay .fa-icon { font-size: 1.5rem; margin-bottom: 0.5rem; }
.file-input-hidden { display: none; }

.profile-summary-text .user-name-display {
  font-size: 1.375rem; font-weight: 600; /* 加粗 */
  color: var(--text-color);
}
[data-theme="dark"] .profile-summary-text .user-name-display { color: #ffffff; }
.profile-summary-text .user-email-display { font-size: 1rem; color: var(--text-color-muted); }

.form-fields-container {
  max-width: 500px; /* 限制表单最大宽度，更美观 */
  display: flex; flex-direction: column; gap: 1.5rem; /* 增加表单项间距 */
}
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group label { font-size: 0.9rem; font-weight: 500; color: var(--text-color); }
[data-theme="dark"] .form-group label { color: #e0e0e7; }
/* .form-input 使用全局样式 */

.form-actions {
  display: flex;
  /* 核心修正点: 将 justify-content 从 flex-end 改为 flex-start */
  justify-content: flex-start;
  margin-top: 2.5rem;
  align-items: center;
  gap: 1rem;
}
.status-message { flex-grow: 1; text-align: left; font-size: 0.9rem; font-weight: 500; }
.status-message.success { color: var(--primary-color); }
.status-message.error { color: #e53e3e; }
[data-theme="dark"] .status-message.error { color: #fc8181; }
</style>
