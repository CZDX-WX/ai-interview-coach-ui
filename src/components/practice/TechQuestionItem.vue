<template>
  <div class="question-card" :class="{ 'is-new': question.isNew, 'is-expanded': isAnswerVisible }">
    <div class="card-main-content" @click="emit('toggle-answer')" role="button" :aria-expanded="isAnswerVisible">
      <div class="question-header">
        <p class="question-text">
          <span class="question-index">{{ index + 1 }}.</span>
          {{ question.questionText }}
        </p>
        <div class="meta-tags">
          <span v-if="question.isNew" class="difficulty-badge new">NEW</span>
          <span :class="['difficulty-badge', getDifficultyClass(question.difficulty)]">{{ question.difficulty }}</span>
        </div>
      </div>
      <div class="topic-tags" v-if="question.tags && question.tags.length > 0">
        <font-awesome-icon :icon="['fas', 'tags']" class="tags-icon"/>
        <span v-for="tag in question.tags" :key="tag" class="topic-tag">{{ tag }}</span>
      </div>
    </div>

    <div class="card-footer">
      <div class="status-actions">
        <span class="status-label">标记为:</span>
        <div class="status-buttons-group">
          <button
              v-for="status in statuses" :key="status.value"
              :class="['status-button', { active: question.proficiencyStatus === status.value }]"
              @click.stop="handleStatusClick(status.value)"
              :title="`标记为“${status.label}”`">
            <font-awesome-icon :icon="status.icon" />
            <span>{{ status.label }}</span>
          </button>
        </div>
      </div>
      <div class="actions-right">
        <button
            class="icon-button"
            @click.stop="$emit('toggle-bookmark')"
            :class="{ favorited: question.isBookmarked }"
            :title="question.isBookmarked ? '取消收藏' : '收藏'"
        >
          <font-awesome-icon :icon="question.isBookmarked ? ['fas', 'star'] : ['far', 'star']" />
        </button>
      </div>
    </div>

    <transition name="expand">
      <div v-if="isAnswerVisible" class="answer-container">
        <div v-if="question.referenceAnswer" class="content-section">
          <h4><font-awesome-icon :icon="['fas', 'align-left']" /> 参考答案</h4>
          <div class="answer-text" v-html="formatMarkdown(question.referenceAnswer)"></div>
        </div>
        <div v-if="question.difficulty === '困难' && question.speechAudioUrl" class="content-section">
          <h4><font-awesome-icon :icon="['fas', 'volume-up']" /> 语音解析 (困难题专属)</h4>
          <audio controls :src="getFullUrl(question.speechAudioUrl)" class="audio-player"></audio>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import MarkdownIt from 'markdown-it';
import type { TechQuestion } from '@/types/techPracticeTypes';
import { API_ROOT_URL } from '@/config';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// 定义精确的类型
type StatusValue = 'NEEDS_REVIEW' | 'MASTERED';

const props = defineProps<{
  question: TechQuestion;
  index: number;
  isAnswerVisible: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle-answer'): void;
  (e: 'update-status', status: StatusValue): void;
  (e: 'reset-status'): void;
  (e: 'toggle-bookmark'): void;
}>();

/**
 * **核心调试点**: 处理状态按钮点击事件的函数
 * @param statusValue - 被点击按钮代表的状态值 ('NEEDS_REVIEW' 或 'MASTERED')
 */
const handleStatusClick = (statusValue: StatusValue) => {
  console.log(`--- 按钮点击 ---`);
  console.log(`当前题目状态 (prop): ${props.question.proficiencyStatus}`);
  console.log(`点击的按钮状态: ${statusValue}`);

  // 如果点击的已经是当前状态，则触发重置事件
  if (props.question.proficiencyStatus === statusValue) {
    console.log('判断结果: 状态匹配，触发 "reset-status" 事件');
    emit('reset-status');
  } else {
    // 否则，触发更新状态事件
    console.log(`判断结果: 状态不匹配，触发 "update-status" 事件，新状态为: ${statusValue}`);
    emit('update-status', statusValue);
  }
};

const statuses = ref([
  { label: '待复习', value: 'NEEDS_REVIEW' as StatusValue, icon: ['fas', 'book-reader'] },
  { label: '已掌握', value: 'MASTERED' as StatusValue, icon: ['fas', 'check-double'] },
]);

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });
const formatMarkdown = (text: string) => text ? md.render(text) : '';

const getFullUrl = (relativePath?: string) => {
  if (!relativePath) return '';
  if (relativePath.startsWith('http')) return relativePath;
  return `${API_ROOT_URL}${relativePath}`;
};

const getDifficultyClass = (difficulty?: '简单' | '中等' | '困难') => {
  if (!difficulty) return 'unknown';
  if (difficulty === '简单') return 'easy';
  if (difficulty === '中等') return 'medium';
  if (difficulty === '困难') return 'hard';
  return '';
};
</script>

<style scoped>
.question-card {
  background-color: var(--card-bg-color);
  border: 1px solid var(--border-color);
  border-left: 4px solid transparent;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
}
[data-theme="dark"] .question-card {
  background-color: #1c2126;
  border-color: #3c4753;
}
.question-card.is-expanded {
  border-color: var(--primary-color);
  box-shadow: 0 5px 15px rgba(0,0,0,0.07);
}
[data-theme="dark"] .question-card.is-expanded {
  box-shadow: 0 5px 20px rgba(0,0,0,0.2);
}
.question-card.new-question-highlight {
  border-left-color: #f59e0b;
}

.card-main-content {
  padding: 1.25rem 1.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.card-main-content:hover {
  background-color: color-mix(in srgb, var(--border-color) 50%, transparent);
}
[data-theme="dark"] .card-main-content:hover {
  background-color: #23282d;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
  pointer-events: none;
}
.question-text {
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.7;
  flex-grow: 1;
  color: var(--text-color);
}
[data-theme="dark"] .question-text { color: #ffffff; }
.question-index { font-weight: 600; color: var(--primary-color); margin-right: 0.25rem; }

.meta-tags { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
.difficulty-badge {
  padding: 0.25em 0.7em; border-radius: 16px; font-size: 0.75rem;
  font-weight: bold; display: inline-block; color: white;
}
.difficulty-badge.new { background-color: #f59e0b; }
/* **核心修正点 1**: 难度标签颜色 */
.difficulty-badge.easy { background-color: #28a745; } /* 绿色 */
.difficulty-badge.medium { background-color: #ffc107; color: #212529; } /* 黄色 */
.difficulty-badge.hard { background-color: #dc3545; } /* 红色 */
[data-theme="dark"] .difficulty-badge.easy { background-color: #38a169; }
[data-theme="dark"] .difficulty-badge.medium { background-color: #d69e2e; }
[data-theme="dark"] .difficulty-badge.hard { background-color: #e53e3e; }

/* **核心修正点 1**: 移除 topic-tags 的左边距，使其与题目文本的容器对齐 */
.topic-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  /* padding-left: calc(1.1rem + 1rem); -- REMOVED */
  pointer-events: none;
}
.tags-icon { color: var(--text-color-muted); font-size: 0.8rem; margin-right: 0.2rem; }
.topic-tag {
  background-color: var(--border-color);
  color: var(--text-color-muted);
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
}
[data-theme="dark"] .topic-tag { background-color: #374151; color: #9ca3af; }


.card-footer {
  padding: 0.75rem 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
[data-theme="dark"] .card-footer {
  border-color: #303740;
}

.actions-right, .status-actions { display: flex; align-items: center; gap: 0.75rem; }
.status-label { font-size: 0.85rem; color: var(--text-color-muted); font-weight: 500; }
.status-buttons-group { display: flex; gap: 0.5rem; }
.status-button {
  font-size: 0.8rem; padding: 0.4rem 0.9rem; border-radius: 16px;
  border: 1px solid var(--border-color); background-color: transparent;
  color: var(--text-color-muted); cursor: pointer; transition: all 0.2s ease;
  display: flex; align-items: center; gap: 0.4rem;
}
.status-button:hover:not(.active) { border-color: var(--text-color); color: var(--text-color); }
.status-button.active { color: white; border-color: transparent; font-weight: 600; }
.status-button.active { background-color: #38a169; }


/* **核心修正点 2**: 优化收藏按钮样式 */
.icon-button {
  background: none;
  border: none;
  color: var(--text-color-muted);
  cursor: pointer;
  font-size: 1.1rem;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}
.icon-button:hover {
  background-color: var(--primary-color-translucent);
  transform: scale(1.1);
}
.icon-button.favorited {
  color: #f6ad55; /* 金色 */
  background-color: rgba(246, 173, 85, 0.15); /* 淡金色背景 */
}
.icon-button.favorited:hover {
  background-color: rgba(246, 173, 85, 0.25);
}

/* **核心修正点 3**: 提供完整的答案切换按钮样式 */
.toggle-answer-button {
  background-color: transparent;
  color: var(--text-color-muted);
  border: 1px solid var(--border-color);
  padding: 0.4rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease-in-out;
}
.toggle-answer-button:hover {
  background-color: var(--border-color);
  color: var(--text-color);
  border-color: var(--text-color-muted);
}
[data-theme="dark"] .toggle-answer-button {
  background-color: #2c3035;
  border-color: #4a5568;
}
[data-theme="dark"] .toggle-answer-button:hover {
  background-color: #374151;
  color: #ffffff;
}

/* 答案区域样式 */
.answer-container {
  padding: 1.5rem 1.75rem;
  border-top: 1px solid var(--border-color);
}
[data-theme="dark"] .answer-container {
  background-color: #111418;
}
.content-section:not(:last-child) { margin-bottom: 2rem; }
.content-section h4 {
  font-size: 1.1rem; font-weight: 600;
  margin-bottom: 1rem;
  display: flex; align-items: center; gap: 0.6rem;
  color: var(--text-color);
}
[data-theme="dark"] .content-section h4 { color: #e0e0e7; }
.content-section h4 .fa-icon { color: var(--primary-color); }
.answer-text { line-height: 1.8; font-size: 0.95rem; }
.audio-player { width: 100%; margin-top: 1rem; }
/* ... (其他 :deep 样式保持不变) ... */

/* 展开动画 */
.expand-enter-active, .expand-leave-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); overflow: hidden; }
.expand-enter-from, .expand-leave-to { max-height: 0; opacity: 0; padding-top: 0; padding-bottom: 0; margin-top: 0; }
.expand-enter-to, .expand-leave-from { max-height: 1500px; opacity: 1; }
</style>