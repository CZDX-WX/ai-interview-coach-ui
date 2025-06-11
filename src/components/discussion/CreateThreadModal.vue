<template>
  <BaseModal
      :is-open="isOpen"
      :title="`在“${categoryName}”分类下创建新主题`"
      @update:is-open="$emit('close')"
  >
    <form @submit.prevent="submitThread">
      <div class="form-group">
        <label for="threadModalTitle">主题标题</label>
        <input
            type="text"
            id="threadModalTitle"
            v-model="title"
            class="form-input"
            required
            placeholder="请输入一个清晰、吸引人的标题"
        >
      </div>
      <div class="form-group">
        <label for="threadModalContent">帖子内容</label>
        <textarea
            id="threadModalContent"
            v-model="content"
            class="form-input code-input-area"
            rows="10"
            required
            placeholder="在此输入您的帖子正文..."
        ></textarea>
        <small class="input-hint">支持基础的 Markdown 格式，例如 **加粗**, *斜体*, `代码块`。</small>
      </div>
      <p v-if="errorMessage" class="error-message modal-error">{{ errorMessage }}</p>
    </form>
    <template #footer>
      <button type="button" @click="$emit('close')" class="form-button secondary-button">取消</button>
      <button type="button" @click="submitThread" class="form-button primary-button" :disabled="isSubmitting">
        <font-awesome-icon :icon="['fas', 'paper-plane']" v-if="!isSubmitting" />
        {{ isSubmitting ? '正在提交...' : '发布主题' }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseModal from '../common/BaseModal.vue'; // 引入基础模态框
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  isOpen: boolean;
  categoryId: string;
  categoryName: string;
  isSubmitting?: boolean; // 由父组件控制提交状态
  errorMessage?: string | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'create-thread', payload: { categoryId: string, title: string, content: string }): void;
}>();

const title = ref('');
const content = ref('');

// 当模态框打开时，清空表单 (如果需要)
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    title.value = '';
    content.value = '';
  }
});

const submitThread = () => {
  if (!title.value.trim() || !content.value.trim()) {
    // 可以通过 props 让父组件传递错误信息或在此处处理
    alert('标题和内容不能为空！');
    return;
  }
  emit('create-thread', {
    categoryId: props.categoryId,
    title: title.value,
    content: content.value,
  });
};
</script>

<style scoped>
/* 模态框内的表单样式 */
.form-group {
  margin-bottom: 1.25rem;
}
.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}
[data-theme="dark"] .form-group label {
  color: #e0e0e7;
}
.form-input, .code-input-area { /* 使用全局 .form-input 样式 */
  /* 如果全局 .form-input 没有应用暗色主题变量，则需要在这里覆盖 */
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  border-radius: 6px;
  border: 1px solid var(--input-border-color);
  background-color: var(--input-bg-color);
  color: var(--text-color);
  line-height: 1.5;
}
[data-theme="dark"] .form-input,
[data-theme="dark"] .code-input-area {
  border-color: #40474f;
  background-color: #1e2124;
  color: #ffffff;
}
.form-input::placeholder, .code-input-area::placeholder {
  color: var(--placeholder-color);
}
[data-theme="dark"] .form-input::placeholder,
[data-theme="dark"] .code-input-area::placeholder {
  color: #a2aab3;
}
.form-input:focus, .code-input-area:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color-translucent);
}

.code-input-area { /* 特定于 textarea 的样式 */
  min-height: 150px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; /* 简单等宽字体 */
  white-space: pre-wrap; /* 保留换行 */
  resize: vertical;
}
.input-hint {
  font-size: 0.8rem;
  color: var(--text-color-muted);
  margin-top: 0.3rem;
  display: block;
}

.modal-error { /* 错误消息样式 */
  margin-top: 1rem;
  color: #e53e3e; /* 红色 */
  font-size: 0.85rem;
  text-align: center;
}
[data-theme="dark"] .modal-error {
  color: #fc8181;
}

/* 模态框页脚按钮在 BaseModal.vue 中已有基础样式，这里可微调 */
/* :deep(.modal-footer .form-button) { ... } */
</style>