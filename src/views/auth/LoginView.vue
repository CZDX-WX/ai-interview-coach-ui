<template>
  <div class="login-view form-container">
    <h2 class="form-title">欢迎回来</h2>
    <form @submit.prevent="handleLogin" class="auth-form">
      <div v-if="authStore.error && !authStore.isLoading" class="message error">
        {{ authStore.error }}
      </div>
      <div class="form-group">
        <label for="usernameOrEmail">用户名或邮箱</label>
        <input id="usernameOrEmail" type="text" v-model="loginData.usernameOrEmail" placeholder="请输入您的用户名或邮箱" required class="form-input"/>
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input id="password" type="password" v-model="loginData.password" placeholder="请输入您的密码" required class="form-input"/>
      </div>
      <div class="form-options">
        <label class="checkbox-group">
          <input type="checkbox" v-model="rememberMe" />
          <span>记住我</span>
        </label>
        <router-link :to="{ name: 'ForgotPassword' }" class="form-link">忘记密码？</router-link>
      </div>
      <button type="submit" class="form-button primary-button" :disabled="authStore.isLoading">
        <span v-if="authStore.isLoading">登录中...</span>
        <span v-else>登 录</span>
      </button>
    </form>
    <p class="form-switch-link">
      还没有账户？ <router-link :to="{ name: 'Register' }">立即注册</router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import type { LoginRequest } from '../../types/apiTypes';

const loginData = reactive<LoginRequest>({
  usernameOrEmail: '',
  password: '',
});
const rememberMe = ref(false);

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const handleLogin = async () => {
  const success = await authStore.login(loginData);
  if (success) {
    const redirectPath = route.query.redirect as string || '/';
    router.replace(redirectPath);
  }
};
</script>