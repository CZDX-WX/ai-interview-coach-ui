<template>
  <div class="login-view form-container">
    <h2 class="form-title">Welcome back</h2>
    <form @submit.prevent="handleLogin" class="auth-form">
      <div v-if="authStore.error && !authStore.isLoading" class="error-message">
        {{ authStore.error }}
      </div>

      <div class="form-group">
        <label for="identifier">Username, Student ID, or Email</label>
        <input
            id="identifier"
            type="text"
            v-model="identifier"
            placeholder="Enter your username, student ID, or email"
            required
            class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
            id="password"
            type="password"
            v_model="password"
            placeholder="Enter your password"
            required
            class="form-input"
        />
      </div>

      <div class="form-options">
        <label class="checkbox-group">
          <input type="checkbox" v-model="rememberMe" />
          <span>Remember me</span>
        </label>
        <router-link to="/forgot-password" class="form-link">Forgot Password?</router-link>
      </div>

      <button type="submit" class="form-button" :disabled="authStore.isLoading">
        <span v-if="authStore.isLoading">Logging in...</span>
        <span v-else>Log In</span>
      </button>
    </form>
    <p class="form-switch-link">
      Don't have an account? <router-link to="/register">Sign Up</router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const identifier = ref('');
const password = ref('');
const rememberMe = ref(false);

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const handleLogin = async () => {
  const success = await authStore.login({
    identifier: identifier.value,
    password: password.value,
  });
  if (success) {
    const redirectPath = route.query.redirect as string || '/';
    router.push(redirectPath);
  }
};
</script>
