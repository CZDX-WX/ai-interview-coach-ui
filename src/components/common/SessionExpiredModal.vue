<template>
  <BaseModal
      :is-open="isOpen"
      title="会话已过期"
      :persistent="true"
      :show-close-button="false"
  >
    <div class="modal-content">
      <font-awesome-icon :icon="['fas', 'clock-rotate-left']" class="modal-icon" />
      <p>您的登录凭证已失效，请重新登录以继续访问。</p>
    </div>
    <template #footer>
      <button @click="handleReLogin" class="form-button primary-button w-full">
        前往登录页面
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from './BaseModal.vue';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

defineProps<{ isOpen: boolean }>();
const emit = defineEmits(['re-login']);

const handleReLogin = () => {
  console.log("SessionExpiredModal: 're-login' event emitted."); // 添加日志用于调试
  emit('re-login');
};
</script>

<style scoped>
.modal-content { text-align: center; padding: 1rem 0; }
.modal-icon {
  font-size: 2.5rem; color: var(--primary-color);
  margin-bottom: 1.25rem;
}
.modal-content p { font-size: 1.05rem; color: var(--text-color); line-height: 1.6; }
.w-full { width: 100%; justify-content: center; } /* 辅助类，让按钮充满宽度 */
</style>