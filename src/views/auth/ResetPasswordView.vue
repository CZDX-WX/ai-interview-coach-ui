<template>
  <div class="reset-password-view form-container">
    <h2 class="form-title">设置新密码</h2> <form @submit.prevent="handleResetPassword" class="auth-form">
    <div v-if="message" :class="['message', messageType]">{{ message }}</div>
    <div v-if="authStore.error && !authStore.isLoading && !message" class="message error">
      {{ authStore.error }}
    </div>

    <div class="form-group">
      <label for="newPasswordReset">新密码</label> <input id="newPasswordReset" type="password" v-model="newPassword" placeholder="请输入新密码 (至少6位)" required class="form-input"/> </div>
    <div class="form-group">
      <label for="confirmNewPasswordReset">确认新密码</label> <input id="confirmNewPasswordReset" type="password" v-model="confirmNewPassword" placeholder="请再次输入新密码" required class="form-input"/> </div>
    <p v-if="newPassword && confirmNewPassword && newPassword !== confirmNewPassword" class="error-text-field message error">两次输入的密码不匹配。</p> <button type="submit" class="form-button primary-button"  :disabled="
    authStore.isLoading ||
    !resetToken ||
    (!!newPassword && !!confirmNewPassword && newPassword !== confirmNewPassword)
  ">
    <span v-if="authStore.isLoading">处理中...</span> <span v-else>重置密码</span> </button>
  </form>
    <p v-if="!resetToken && !authStore.isLoading && !message" class="message error">
      无效或缺失的密码重置令牌。请重新申请发送重置链接。 </p>
  </div>
</template>

<script setup lang="ts">
// ... (脚本逻辑与之前相同)
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; // 确保路径正确

const newPassword = ref('');
const confirmNewPassword = ref('');
const resetToken = ref<string | null>(null);

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const message = ref('');
const messageType = ref<'success' | 'error'>('success');


onMounted(() => {
  const tokenFromQuery = route.query.token;
  if (typeof tokenFromQuery === 'string' && tokenFromQuery) {
    resetToken.value = tokenFromQuery;
  } else {
    message.value = '无效或缺失的密码重置令牌。'; // 中文
    messageType.value = 'error';
  }
});

const handleResetPassword = async () => {
  if (!resetToken.value) {
    message.value = '密码重置令牌缺失，无法继续。'; // 中文
    messageType.value = 'error';
    return;
  }
  if (newPassword.value !== confirmNewPassword.value) {
    message.value = '两次输入的密码不匹配。'; // 中文
    messageType.value = 'error';
    return;
  }
  if (newPassword.value.length < 6) {
    message.value = "新密码长度至少需要6位。"; // 中文
    messageType.value = 'error';
    return;
  }
  message.value = ''; // 清除本地消息
  authStore.error = null; // 清除 store 中的旧错误

  // 假设 resetPassword 是 authStore 的一个 action
  // const success = await authStore.resetPassword({ token: resetToken.value, password: newPassword.value });
  // 模拟:
  const success = await new Promise<boolean>(resolve => {
    setTimeout(() => {
      if(newPassword.value === "failPassword") {
        authStore.error = "模拟密码重置失败，请稍后再试。"; // 中文
        resolve(false);
      } else {
        resolve(true);
      }
    }, 1000);
  });

  if (success) {
    message.value = '密码重置成功！您现在可以使用新密码登录了。3秒后将跳转到登录页...'; // 中文
    messageType.value = 'success';
    setTimeout(() => {
      router.push({ name: 'Login' });
    }, 3000);
  } else {
    // message.value = authStore.error || '密码重置失败。链接可能已过期或无效。'; // 中文 (由 store 提供)
    messageType.value = 'error'; // 使 authStore.error 显示
  }
};
</script>
