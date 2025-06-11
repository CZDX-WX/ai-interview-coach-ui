<template>
  <section class="settings-section">
    <h2 class="section-title">账户安全</h2>
    <form @submit.prevent="handleChangePassword" class="password-form">
      <div class="form-fields-container">
        <div class="form-group">
          <label for="currentPassword">当前密码</label>
          <input type="password" id="currentPassword" v-model="passwordData.currentPassword" class="form-input" placeholder="请输入当前密码" required>
        </div>
        <div class="form-group">
          <label for="newPasswordModal">新密码</label>
          <input type="password" id="newPasswordModal" v-model="passwordData.newPassword" class="form-input" placeholder="输入新密码 (至少6位)" required>
        </div>
        <div class="form-group">
          <label for="confirmNewPasswordModal">确认新密码</label>
          <input type="password" id="confirmNewPasswordModal" v-model="passwordData.confirmNewPassword" class="form-input" placeholder="请再次输入新密码" required>
        </div>
      </div>
      <p v-if="localError" class="error-text-field">{{ localError }}</p>
      <div class="form-actions">
        <p v-if="statusMessage" class="status-message" :class="isError ? 'error' : 'success'">{{ statusMessage }}</p>
        <button type="submit" class="form-button primary-button" :disabled="isSaving">
          <font-awesome-icon :icon="['fas', 'key']" />
          {{ isSaving ? '修改中...' : '确认修改密码' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
// ... (脚本逻辑与之前相同) ...
import { reactive, ref } from 'vue';
import { useAuthStore } from '../../stores/auth';
import type { ChangePasswordRequest } from '../../types/apiTypes';

const authStore = useAuthStore();
const passwordData = reactive<ChangePasswordRequest>({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: ''
});
const localError = ref('');
const statusMessage = ref('');
const isError = ref(false);
const isSaving = ref(false);

const handleChangePassword = async () => {
  localError.value = '';
  statusMessage.value = '';

  if (passwordData.newPassword !== passwordData.confirmNewPassword) {
    localError.value = "新密码与确认密码不匹配。";
    return;
  }
  if (passwordData.newPassword.length < 6) {
    localError.value = "新密码长度至少需要6位。";
    return;
  }

  isSaving.value = true;
  const success = await authStore.changePassword(passwordData);
  if (success) {
    statusMessage.value = '密码修改成功！';
    isError.value = false;
    passwordData.currentPassword = '';
    passwordData.newPassword = '';
    passwordData.confirmNewPassword = '';
  } else {
    statusMessage.value = authStore.error || '密码修改失败。';
    isError.value = true;
  }
  isSaving.value = false;
  setTimeout(() => statusMessage.value = '', 4000);
};
</script>

<style scoped>
.settings-section {
  background-color: var(--card-bg-color);
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}
[data-theme="dark"] .settings-section {
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.section-title {
  font-size: 1.25rem; font-weight: 600; color: var(--text-color);
  margin-bottom: 1.5rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-color);
}
[data-theme="dark"] .section-title { color: #ffffff; }

.password-form {
  max-width: 500px; /* 限制表单最大宽度 */
}

.form-fields-container {
  display: flex; flex-direction: column; gap: 1.5rem;
}

.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group label { font-size: 0.9rem; font-weight: 500; color: var(--text-color); }
[data-theme="dark"] .form-group label { color: #ffffff; }
/* .form-input 样式由全局 main.css 提供，这里无需重复定义 */

.form-actions {
  display: flex;
  justify-content: flex-start; /* **核心修正点：按钮左对齐** */
  margin-top: 2rem; /* **核心修正点：增加与上方输入框的间距** */
  align-items: center;
  gap: 1rem;
}

.status-message { flex-grow: 1; text-align: left; font-size: 0.9rem; font-weight: 500; }
.status-message.success { color: var(--primary-color); }
.status-message.error { color: #e53e3e; }
[data-theme="dark"] .status-message.error { color: #fc8181; }

.error-text-field {
  color: #e53e3e;
  font-size: 0.8rem;
  margin-top: 0.5rem; /* 与上方输入框的间距 */
  text-align: left;
}
[data-theme="dark"] .error-text-field { color: #fc8181; }
</style>
