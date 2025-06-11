<template>
  <div class="forgot-password-view form-container">
    <h2 class="form-title">重置您的密码</h2> <p class="form-subtitle">请输入您的注册邮箱，我们将向您发送包含重置链接的邮件。</p> <form @submit.prevent="handleSendResetLink" class="auth-form">
    <div v-if="message" :class="['message', messageType]">{{ message }}</div>
    <div v-if="authStore.error && !authStore.isLoading && !message" class="message error">
      {{ authStore.error }}
    </div>

    <div class="form-group">
      <label for="emailForgot">电子邮箱</label> <input id="emailForgot" type="email" v-model="email" placeholder="请输入您的电子邮箱" required class="form-input"/> </div>

    <button type="submit" class="form-button primary-button" :disabled="authStore.isLoading">
      <span v-if="authStore.isLoading">发送中...</span> <span v-else>发送重置链接</span> </button>
  </form>
    <p class="form-switch-link">
      记得密码？ <router-link :to="{ name: 'Login' }">立即登录</router-link> </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth'; // 确保路径正确

const email = ref('');
const authStore = useAuthStore();
const message = ref(''); // 本地消息，例如成功提示
const messageType = ref<'success' | 'error'>('success');

const handleSendResetLink = async () => {
  message.value = '';
  authStore.error = null; // 清除 store 中的旧错误
  // 假设 sendPasswordResetLink 是 authStore 的一个 action
  // const success = await authStore.sendPasswordResetLink(email.value);
  // 模拟:
  const success = await new Promise<boolean>(resolve => {
    setTimeout(() => {
      if (email.value.includes("fail")) {
        authStore.error = "模拟发送失败，请检查邮箱地址。"; // 中文
        resolve(false);
      } else {
        resolve(true);
      }
    }, 1000);
  });


  if (success) {
    message.value = '如果该邮箱已注册账户，密码重置链接已发送至您的邮箱。请检查您的收件箱（也可能在垃圾邮件中）。'; // 中文
    messageType.value = 'success';
    email.value = '';
  } else {
    // message.value = authStore.error || '发送重置链接失败，请稍后重试。'; // 中文，由 store 提供
    messageType.value = 'error'; // 使 authStore.error 显示
  }
};
</script>
