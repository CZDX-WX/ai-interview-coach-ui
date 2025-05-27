<template>
  <div class="reset-password-view form-container">
    <h2 class="form-title">Set New Password</h2>
    <form @submit.prevent="handleResetPassword" class="auth-form">
      <div v-if="message" :class="['message', messageType]">{{ message }}</div>
      <div v-if="authStore.error && !authStore.isLoading && !message" class="error-message">
        {{ authStore.error }}
      </div>

      <div class="form-group">
        <label for="newPassword">New Password</label>
        <input id="newPassword" type="password" v-model="newPassword" placeholder="Enter new password" required class="form-input"/>
      </div>
      <div class="form-group">
        <label for="confirmNewPassword">Confirm New Password</label>
        <input id="confirmNewPassword" type="password" v-model="confirmNewPassword" placeholder="Confirm new password" required class="form-input"/>
        <p v-if="newPassword && confirmNewPassword && newPassword !== confirmNewPassword" class="error-text-field">Passwords do not match.</p>
      </div>

      <button type="submit" class="form-button" :disabled="authStore.isLoading || !resetToken || (newPassword && newPassword !== confirmNewPassword)">
        <span v-if="authStore.isLoading">Resetting...</span>
        <span v-else>Reset Password</span>
      </button>
    </form>
    <p v-if="!resetToken && !authStore.isLoading" class="error-message">
      Invalid or missing password reset token. Please request a new reset link.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

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
    message.value = 'Invalid or missing password reset token.';
    messageType.value = 'error';
  }
});

const handleResetPassword = async () => {
  if (!resetToken.value) {
    message.value = 'Password reset token is missing.';
    messageType.value = 'error';
    return;
  }
  if (newPassword.value !== confirmNewPassword.value) {
    message.value = 'Passwords do not match.';
    messageType.value = 'error';
    return;
  }
  message.value = ''; // Clear previous messages
  const success = await authStore.resetPassword({
    token: resetToken.value,
    password: newPassword.value,
  });

  if (success) {
    message.value = 'Password reset successfully! You can now log in with your new password.';
    messageType.value = 'success';
    // Redirect to login after a delay or offer a link
    setTimeout(() => {
      router.push({ name: 'Login' });
    }, 3000);
  } else {
    message.value = authStore.error || 'Failed to reset password. The link might be expired or invalid.';
    messageType.value = 'error';
  }
};
</script>
