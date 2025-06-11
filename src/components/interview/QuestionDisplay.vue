<template>
  <div class="question-display-component"
       :class="{ 'coding-problem': isCodingProblem }"
       v-html="formattedContent">
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import DOMPurify from 'dompurify';
import { marked } from 'marked'; // If using full markdown

const props = defineProps<{
  questionText: string | null;
  isCodingProblem?: boolean;
}>();

const formattedContent = computed(() => {
  if (!props.questionText) return '<p>等待题目加载...</p>';
  // Basic markdown: **text** to <strong>, *text* to <em>, \n to <br>
  // For coding problems, we might want to wrap code blocks in <pre><code> if markdown is used
  let html = props.questionText
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>') // Inline code
      .replace(/\n/g, '<br />');

  // If you use marked:
  if (props.isCodingProblem) { // Or always
    html = marked.parse(props.questionText) as string;
  }
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
});
</script>

<style scoped>
.question-display-component {
  width: 100%;
  /* height: 100%; /* 移除，让其内容决定高度 */
  /* overflow-y: auto; /* 移除，让父容器处理滚动 */
  line-height: 1.7;
}

/* ... (:deep() styles for strong, em, code, br from previous turn) ... */
:deep(strong) { color: var(--primary-color); font-weight: 600; display: block; margin-bottom: 0.5em; }
:deep(em) { font-style: italic; color: var(--secondary-color); }
:deep(code) { background-color: var(--border-color); padding: 0.1em 0.3em; border-radius: 3px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 0.9em;}
:deep(br) { content: ""; display: block; margin-bottom: 0.5em; }
:deep(pre) {
  white-space: pre-wrap;
  word-break: break-all;
  overflow-x: auto;
  background-color: var(--input-bg-color); /* Darker bg for code blocks */
  padding: 1rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  margin: 0.75em 0;
  font-size: 0.85em; /* Smaller font for preformatted code */
  color: var(--input-text-color); /* Text color for code blocks */
}
</style>