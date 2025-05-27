<template>
  <section class="settings-section">
    <h2 class="section-title">账户安全</h2>
    <div class="form-grid">
      <div class="form-group">
        <label for="newPasswordModal">新密码</label>
        <input type="password" id="newPasswordModal" v-model="passwordData.newPassword" class="form-input-dark" placeholder="输入新密码 (如需修改)">
      </div>
      <div class="form-group">
        <label for="confirmNewPasswordModal">确认新密码</label>
        <input type="password" id="confirmNewPasswordModal" v-model="passwordData.confirmNewPassword" class="form-input-dark" placeholder="再次输入新密码">
        <p v-if="passwordData.newPassword && passwordData.newPassword !== passwordData.confirmNewPassword" class="error-text-field">两次输入的密码不匹配。</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';

interface PasswordData {
  newPassword?: string;
  confirmNewPassword?: string;
}

const props = defineProps<{
  modelValue: PasswordData; // For v-model from parent
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: PasswordData): void;
}>();

const passwordData = reactive<PasswordData>({
  newPassword: props.modelValue.newPassword || '',
  confirmNewPassword: props.modelValue.confirmNewPassword || ''
});

watch(passwordData, (newData) => {
  emit('update:modelValue', newData);
}, {deep: true});

// Watch for external changes to modelValue to update local state
watch(() => props.modelValue, (newVal) => {
  passwordData.newPassword = newVal.newPassword || '';
  passwordData.confirmNewPassword = newVal.confirmNewPassword || '';
}, {deep: true});

</script>

<style scoped>
/* 样式从 AccountSettingsView.vue 迁移和调整 */
.settings-section { /* ... (same as UserProfileInfoForm) ... */ }
.section-title { /* ... (same as UserProfileInfoForm) ... */ }
.form-grid { /* ... (same as UserProfileInfoForm) ... */ }
.form-group { /* ... (same as UserProfileInfoForm) ... */ }
.form-group label { /* ... (same as UserProfileInfoForm) ... */ }
.form-input-dark { /* ... (same as UserProfileInfoForm) ... */ }
.error-text-field { color: #ef4444; font-size: 0.8rem; margin-top: 0.25rem; }
[data-theme="dark"] .error-text-field { color: #f87171; }
</style>