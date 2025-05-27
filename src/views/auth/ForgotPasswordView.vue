<template>
  <div class="forgot-password-view form-container">
    <h2 class="form-title">Reset your password</h2>
    <p class="form-subtitle">Enter your email address and we'll send you a link to reset your password.</p>
    <form @submit.prevent="handleSendResetLink" class="auth-form">
      <div v-if="message" :class="['message', messageType]">{{ message }}</div>
      <div v-if="authStore.error && !authStore.isLoading && !message" class="error-message">
        {{ authStore.error }}
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input id="email" type="email" v-model="email" placeholder="Enter your email" required class="form-input"/>
      </div>

      <button type="submit" class="form-button" :disabled="authStore.isLoading">
        <span v-if="authStore.isLoading">Sending link...</span>
        <span v-else>Send reset link</span>
      </button>
    </form>
    <p class="form-switch-link">
      Remember your password? <router-link to="/login">Sign In</router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';

const email = ref('');
const authStore = useAuthStore();
const message = ref('');
const messageType = ref<'success' | 'error'>('success');

const handleSendResetLink = async () => {
  message.value = '';
  const success = await authStore.sendPasswordResetLink(email.value);
  if (success) {
    message.value = 'If an account exists for this email, a password reset link has been sent.';
    messageType.value = 'success';
    email.value = ''; // Clear field
  } else {
    message.value = authStore.error || 'Failed to send reset link. Please try again.';
    messageType.value = 'error';
  }
};
</script>
