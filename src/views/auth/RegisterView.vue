<template>
  <div class="register-view form-container">
    <h2 class="form-title">Create Your Account</h2>
    <form @submit.prevent="handleRegister" class="auth-form">
      <div v-if="authStore.error && !authStore.isLoading" class="error-message">
        {{ authStore.error }}
      </div>

      <div class="form-group">
        <label for="email">Student ID / Email</label>
        <input id="email" type="email" v-model="email" placeholder="Enter your student ID or email" required class="form-input"/>
      </div>
      <div class="form-group">
        <label for="name">Name</label>
        <input id="name" type="text" v-model="name" placeholder="Enter your full name" required class="form-input"/>
      </div>
      <div class="form-group">
        <label for="major">Major</label>
        <select id="major" v-model="major" required class="form-input">
          <option disabled value="">Select your major</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Software Engineering">Software Engineering</option>
          <option value="Data Science">Data Science</option>
          <option value="AI & Machine Learning">AI & Machine Learning</option>
          <option value="IoT">Internet of Things</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input id="password" type="password" v-model="password" placeholder="Create a password" required class="form-input"/>
        <div v-if="password.length > 0" class="password-strength-indicator">
          <div :style="{ width: passwordStrengthPercentage + '%', backgroundColor: passwordStrengthColor }" class="strength-bar"></div>
        </div>
        <p v-if="password.length > 0" class="strength-text">{{ passwordStrengthText }}</p>
      </div>
      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input id="confirmPassword" type="password" v-model="confirmPassword" placeholder="Confirm your password" required class="form-input"/>
        <p v-if="password && confirmPassword && password !== confirmPassword" class="error-text-field">Passwords do not match.</p>
      </div>

      <button type="submit" class="form-button" :disabled="authStore.isLoading || password !== '' && password !== confirmPassword">
        <span v-if="authStore.isLoading">Creating Account...</span>
        <span v-else>Sign Up</span>
      </button>
    </form>
    <p class="form-switch-link">
      Already have an account? <router-link to="/login">Log In</router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const email = ref('');
const name = ref('');
const major = ref('');
const password = ref('');
const confirmPassword = ref('');

const authStore = useAuthStore();
const router = useRouter();

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    authStore.error = "Passwords do not match."; // Set error in store or local ref
    return;
  }
  const success = await authStore.register({
    email: email.value,
    name: name.value,
    major: major.value,
    password: password.value,
  });
  if (success) {
    router.push('/'); // Navigate to home or dashboard
  }
};

// Basic Password Strength Logic (can be expanded)
const passwordStrength = computed(() => {
  let strength = 0;
  if (password.value.length >= 8) strength++;
  if (password.value.match(/[a-z]/)) strength++;
  if (password.value.match(/[A-Z]/)) strength++;
  if (password.value.match(/[0-9]/)) strength++;
  if (password.value.match(/[^a-zA-Z0-9]/)) strength++; // Special character
  return strength;
});

const passwordStrengthPercentage = computed(() => (passwordStrength.value / 5) * 100);
const passwordStrengthText = computed(() => {
  if (passwordStrength.value <= 2) return 'Weak';
  if (passwordStrength.value <= 4) return 'Medium';
  return 'Strong';
});
const passwordStrengthColor = computed(() => {
  if (passwordStrength.value <= 2) return '#ff4d4f'; // Red
  if (passwordStrength.value <= 4) return '#faad14'; // Orange/Yellow
  return '#52c41a'; // Green
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