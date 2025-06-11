<template>
  <div class="reply-form-container">
    <div v-if="authStore.isAuthenticated">
      <h3 class="reply-form-title">
        <font-awesome-icon :icon="['fas', 'comment-dots']" /> 发表您的回复
      </h3>
      <form @submit.prevent="submitReply">
        <div class="form-group">
          <textarea
              v-model="replyContent"
              class="form-input"
              rows="5"
              placeholder="写下您的见解..."
              required
              :disabled="isSubmitting"
          ></textarea>
          <small class="input-hint">支持基础 Markdown 格式，如：**加粗**, *斜体*, `行内代码`。</small>
        </div>
        <div class="form-actions">
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          <button type="submit" class="form-button primary-button" :disabled="isSubmitting || !replyContent.trim()">
            <font-awesome-icon :icon="['fas', 'paper-plane']" v-if="!isSubmitting" />
            {{ isSubmitting ? '发布中...' : '发布回复' }}
          </button>
        </div>
      </form>
    </div>
    <div v-else class="login-prompt">
      <p>请 <router-link :to="{ name: 'Login', query: { redirect: $route.fullPath } }" class="form-link">登录</router-link> 后发表回复。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  isSubmitting: boolean;
  errorMessage?: string | null;
}>();

const emit = defineEmits<{
  (e: 'submit-reply', replyContent: string): void
}>();

const authStore = useAuthStore();
const replyContent = ref('');

const submitReply = () => {
  if (replyContent.value.trim()) {
    emit('submit-reply', replyContent.value.trim());
    replyContent.value = ''; // 提交后清空
  }
};
</script>

<style scoped>
.reply-form-container {
  margin-top: 2rem;
  padding: 1.5rem 2rem;
  background-color: var(--card-bg-color);
  border-radius: 12px; /* 更大的圆角 */
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}
[data-theme="dark"] .reply-form-container {
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.reply-form-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
[data-theme="dark"] .reply-form-title { color: #ffffff; }
.reply-form-title .fa-icon { color: var(--primary-color); }

.form-group { margin-bottom: 0.75rem; }

/* 这里的 .form-input 会从全局 main.css 继承大部分样式 */
.form-input {
  resize: vertical; /* 允许用户垂直调整文本框大小 */
  min-height: 120px; /* 设置一个合适的最小高度 */
  line-height: 1.6;
  font-size: 0.95rem;
}

.input-hint {
  font-size: 0.8rem;
  color: var(--text-color-muted);
  margin-top: 0.5rem;
  display: block;
}

.form-actions {
  display: flex;
  justify-content: flex-end; /* 按钮靠右 */
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}
.error-message {
  flex-grow: 1; /* 让错误消息占据左侧空间 */
  text-align: left;
  color: #e53e3e;
  font-size: 0.85rem;
  font-weight: 500;
}
[data-theme="dark"] .error-message { color: #fc8181; }

/* 确保 .form-button 和 .primary-button 样式由全局 CSS 提供 */
</style>