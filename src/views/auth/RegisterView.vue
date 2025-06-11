<template>
  <div class="register-view form-container">
    <h2 class="form-title">创建您的账户</h2>
    <form @submit.prevent="handleRegister" class="auth-form">
      <div v-if="registerError" class="message error">
        {{ registerError }}
      </div>
      <div v-else-if="authStore.error && !authStore.isLoading" class="message error">
        {{ authStore.error }}
      </div>

      <div class="form-group">
        <label for="reg_username">用户名</label>
        <input id="reg_username" type="text" v-model="registerData.username" placeholder="3-50个字符，可包含字母、数字" required class="form-input"/>
      </div>
      <div class="form-group">
        <label for="reg_email">电子邮箱</label>
        <input id="reg_email" type="email" v-model="registerData.email" placeholder="请输入您的常用邮箱" required class="form-input"/>
      </div>
      <div class="form-group">
        <label for="reg_fullName">姓名/昵称</label>
        <input id="reg_fullName" type="text" v-model="registerData.fullName" placeholder="请输入您的真实姓名或昵称" required class="form-input"/>
      </div>
      <div class="form-group">
        <label for="reg_major">专业</label>
        <select id="reg_major" v-model="registerData.major" required class="form-input select-input">
          <option disabled value="">选择您的专业</option>
          <option value="计算机科学与技术">计算机科学与技术</option>
          <option value="软件工程">软件工程</option>
          <option value="数据科学与大数据技术">数据科学与大数据技术</option>
          <option value="人工智能">人工智能</option>
          <option value="物联网工程">物联网工程</option>
          <option value="产品管理">产品管理</option>
          <option value="工商管理">工商管理</option>
          <option value="其他">其他</option>
        </select>
      </div>
      <div class="form-group">
        <label for="reg_password">密码</label>
        <input id="reg_password" type="password" v-model="passwordFields.password" placeholder="创建密码 (至少6位)" required class="form-input"/>
      </div>
      <div class="form-group">
        <label for="reg_confirmPassword">确认密码</label>
        <input id="reg_confirmPassword" type="password" v-model="passwordFields.confirmPassword" placeholder="请再次输入密码" required class="form-input"/>
      </div>

      <button type="submit" class="form-button primary-button" :disabled="authStore.isLoading">
        <span v-if="authStore.isLoading">注册中...</span>
        <span v-else>注 册</span>
      </button>
    </form>
    <p class="form-switch-link">
      已有账户？ <router-link :to="{ name: 'Login' }">立即登录</router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, reactive} from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import {RegisterRequest} from "@/types/apiTypes";

const email = ref('');
const name = ref('');
const major = ref('');
const password = ref('');
const confirmPassword = ref('');


const authStore = useAuthStore();
const router = useRouter();

const registerData = reactive<Omit<RegisterRequest, 'password'>>({
  username: '',
  email: '',
  fullName: '',
  major: ''
});
const passwordFields = reactive({
  password: '',
  confirmPassword: ''
});

const registerError = ref<string | null>(null);

const handleRegister = async () => {
  registerError.value = null;
  if (passwordFields.password !== passwordFields.confirmPassword) {
    registerError.value = "两次输入的密码不匹配。";
    return;
  }
  if (passwordFields.password.length < 6) {
    registerError.value = "密码长度至少需要6位。";
    return;
  }

  const payload: RegisterRequest = {
    ...registerData,
    password: passwordFields.password
  };

  const success = await authStore.register(payload);
  if (success) {
    alert('注册成功！现在您可以去登录了。'); // 提示用户
    await router.push({name: 'Login'}); // 导航到登录页
  } else {
    // authStore.error 会被模板中的 v-if 显示出来
    registerError.value = authStore.error; // 也可以用本地变量显示
  }
};

const passwordStrength = computed(() => { /* ... (逻辑不变) ... */
  let strength = 0; if (!password.value) return 0;
  if (password.value.length >= 8) strength++; else if (password.value.length >=6) strength += 0.5;
  if (password.value.match(/[a-z]/)) strength++; if (password.value.match(/[A-Z]/)) strength++;
  if (password.value.match(/[0-9]/)) strength++; if (password.value.match(/[^a-zA-Z0-9\s]/)) strength++;
  return Math.min(strength, 5);
});
const passwordStrengthPercentage = computed(() => (passwordStrength.value / 5) * 100);
const passwordStrengthText = computed(() => { // 中文化
  if (!password.value) return '';
  const strengthVal = passwordStrength.value;
  if (strengthVal <= 1.5) return '非常弱';
  if (strengthVal <= 2.5) return '弱';
  if (strengthVal <= 3.5) return '中等';
  if (strengthVal <= 4.5) return '强';
  return '非常强';
});
const passwordStrengthColor = computed(() => { /* ... (颜色逻辑不变) ... */
  if (!password.value) return 'transparent'; const strengthVal = passwordStrength.value;
  if (strengthVal <= 1.5) return '#ef4444'; if (strengthVal <= 2.5) return '#f97316';
  if (strengthVal <= 3.5) return '#eab308'; if (strengthVal <= 4.5) return '#84cc16';
  return '#22c55e';
});
</script>

<style scoped>
/* Styles specific to RegisterView (e.g., password strength indicator) */
.password-strength-indicator {
  height: 6px; /* Slightly thinner */
  background-color: var(--border-color);
  border-radius: 3px;
  margin-top: 0.5rem;
  overflow: hidden;
}
.strength-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease, background-color 0.3s ease;
}
.strength-text {
  font-size: 0.75rem;
  color: var(--text-color);
  opacity: 0.8;
  margin-top: 0.25rem;
  text-align: right; /* Align text to the right of the bar potentially */
}
/* .error-text-field is now global from auth-forms.css */
</style>