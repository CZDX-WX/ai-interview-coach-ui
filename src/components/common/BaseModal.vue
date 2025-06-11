<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content" role="dialog" aria-modal="true" :aria-labelledby="titleId">
          <header class="modal-header" v-if="title || $slots.header">
            <slot name="header">
              <h3 :id="titleId" class="modal-title">{{ title }}</h3>
            </slot>
            <button @click="closeModal" class="modal-close-button" aria-label="关闭模态框">
              <font-awesome-icon :icon="['fas', 'times']" />
            </button>
          </header>
          <main class="modal-body">
            <slot></slot> </main>
          <footer class="modal-footer" v-if="$slots.footer">
            <slot name="footer"></slot>
          </footer>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  isOpen: boolean;
  title?: string;
}>();

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void;
  (e: 'close'): void;
}>();

const titleId = computed(() => props.title ? `modal-title-${Math.random().toString(36).substring(2, 9)}` : undefined);

const closeModal = () => {
  emit('update:isOpen', false);
  emit('close');
};

// Optional: Close modal on Escape key press
const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    closeModal();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleEscKey);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscKey);
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
}

.modal-content {
  background-color: var(--card-bg-color);
  padding: 0;
  border-radius: 8px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.25);
  width: 100%;
  max-width: 500px; /* 调整了最大宽度，之前是 550px */
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}
[data-theme="dark"] .modal-title {
  color: #ffffff;
}

.modal-close-button {
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 1.25rem;
  padding: 0.25rem;
  line-height: 1;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}
.modal-close-button:hover {
  opacity: 1;
}

.modal-body {
  padding: 1.5rem;
  font-size: 1rem;
  line-height: 1.6;
  overflow-y: auto;
}
.modal-body p {
  margin-bottom: 1rem;
  opacity: 0.9;
}
.modal-body p:last-child {
  margin-bottom: 0;
}


.modal-body .modal-input-field { /* Apply this class to inputs in modal */
  width: 100%;
  padding: 0.875rem 1rem;
  font-size: 0.95rem; /* Slightly smaller for modal context */
  border-radius: 6px; /* Consistent with other inputs */
  border: 1px solid var(--input-border-color, #ced4da); /* Fallback for light theme */
  background-color: var(--input-bg-color, #ffffff); /* Fallback for light theme */
  color: var(--text-color);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  margin-top: 0.5rem; /* Space if there's text above */
  margin-bottom: 1rem; /* Space if there's text below or before actions */
}
[data-theme="dark"] .modal-body .modal-input-field {
  border-color: var(--input-border-color, #40474f); /* From your dark theme variables */
  background-color: var(--input-bg-color, #1e2124); /* From your dark theme variables */
  color: #ffffff; /* Text color for dark inputs */
}
.modal-body .modal-input-field::placeholder {
  color: var(--placeholder-color, #6c757d); /* Fallback for light theme */
}
[data-theme="dark"] .modal-body .modal-input-field::placeholder {
  color: var(--placeholder-color, #a2aab3); /* From your dark theme variables */
}
.modal-body .modal-input-field:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color-translucent);
}


.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end; /* 按钮默认靠右对齐 */
  gap: 0.75rem;
  background-color: var(--bg-color);
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}
[data-theme="dark"] .modal-footer {
  background-color: color-mix(in srgb, var(--card-bg-color) 80%, black 10%);
}

/* 确保模态框页脚内的按钮宽度是自适应的 */
.modal-footer :deep(.form-button), /* 如果按钮是通过 slot 传入且根元素有 .form-button 类 */
.modal-footer button {             /* 或者直接针对 button 元素 */
  width: auto; /* 覆盖全局可能存在的 width: 100% */
  min-width: 90px; /* 保证按钮有足够的点击区域 */
  padding: 0.6rem 1.2rem; /* 模态框内按钮的特定内边距 */
  font-size: 0.9rem;    /* 模态框内按钮的特定字体大小 */
  /* 其他如颜色、边框等样式将由按钮自身的类 (e.g., .secondary-button, .danger-button) 决定 */
}
/* Ensure specific button types like .danger-button and .secondary-button still apply their colors */


/* Transition styles remain the same */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-active .modal-content,
.modal-fade-leave-active .modal-content {
  transition: transform 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from .modal-content,
.modal-fade-leave-to .modal-content {
  transform: translateY(-20px) scale(0.95);
}
</style>