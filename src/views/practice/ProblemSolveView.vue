<template>
  <div class="problem-solve-view" :class="{ 'dark-theme-override': true }">
    <div v-if="isLoadingProblem || !currentProblem" class="loading-state">
      <div class="spinner"><div></div><div></div><div></div><div></div></div>
      <p>正在加载题目信息...</p>
    </div>
    <div v-else-if="!currentProblem && !isLoadingProblem" class="empty-state">
      <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="empty-icon"/>
      <p>未能找到该题目，或题目ID无效。</p>
      <router-link :to="{ name: 'PracticeView' }" class="form-button secondary-button">返回题目列表</router-link>
    </div>

    <div v-else class="problem-solve-layout">
      <div class="problem-description-panel">
        <div class="panel-header">
          <router-link :to="{ name: 'PracticeView' }" class="back-link">
            <font-awesome-icon :icon="['fas', 'arrow-left']" /> 返回题目列表
          </router-link>
          <h1 class="problem-title">{{ currentProblem.id }}. {{ currentProblem.title }}</h1>
          <div class="problem-meta">
            <span :class="['difficulty-badge', currentProblem.difficulty.toLowerCase()]">{{ currentProblem.difficulty }}</span>
            <span v-if="currentProblem.acceptanceRate" class="meta-item">通过率: {{ currentProblem.acceptanceRate.toFixed(1) }}%</span>
            <span v-if="currentProblem.topics && currentProblem.topics.length" class="meta-item topics">
                    标签: <span v-for="topic in currentProblem.topics" :key="topic" class="topic-tag-small">{{ topic }}</span>
                </span>
          </div>
        </div>
        <div class="description-content" v-html="formattedProblemDescription">
        </div>
      </div>

      <div class="code-editor-panel">
        <div class="editor-controls">
          <div class="language-selector-group">
            <label for="language-select">编程语言：</label>
            <select id="language-select" v-model="selectedLanguage" class="form-input select-input-dark small-select">
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>
        </div>

        <CodeInputArea
            v-model="userCode"
            :placeholderText="`在此编写您的 ${selectedLanguage} 代码...`"
            :language="selectedLanguage" class="code-editor-main-instance"
        />
        <div class="submission-actions">
          <button @click="runCode" class="form-button secondary-button run-code-button" :disabled="isSubmitting">
            <font-awesome-icon :icon="['fas', 'play']" /> 运行代码 (模拟)
          </button>
          <button @click="submitSolution" class="form-button primary-button submit-solution-button" :disabled="isSubmitting || !userCode.trim()">
            <font-awesome-icon :icon="['fas', 'paper-plane']" />
            {{ isSubmitting ? '提交中...' : '提交解答' }}
          </button>
        </div>
        <div v-if="submissionResult" class="submission-result" :class="submissionResult.status">
          <h4>提交结果：</h4>
          <p>{{ submissionResult.message }}</p>
          <pre v-if="submissionResult.details">{{ submissionResult.details }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {usePracticeStore} from '@/stores/practiceStore';
import type {Problem, UserProblemStatus} from '@/types/practiceTypes';
import CodeInputArea from '../../components/interview/CodeInputArea.vue'; // 复用代码输入区
import DOMPurify from 'dompurify';
import { marked } from 'marked'; // 如果题目描述是 Markdown
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

type ProblemWithUserStatus = Problem & Partial<UserProblemStatus>;

const props = defineProps<{ problemId: string }>();

const route = useRoute();
const router = useRouter();
const practiceStore = usePracticeStore();

const currentProblem = ref<ProblemWithUserStatus | null>(null);
const isLoadingProblem = ref(true);
const userCode = ref('');
const isSubmitting = ref(false);
const submissionResult = ref<{ status: 'success' | 'error' | 'pending', message: string, details?: string } | null>(null);
const selectedLanguage = ref<'javascript' | 'python' | 'java' | 'cpp'>('javascript'); // 类型与 CodeInputArea prop 一致

const formattedProblemDescription = computed(() => {
  if (!currentProblem.value || !currentProblem.value.title) { // 假设题目详情在 title 里 (原型图未给出具体题目描述字段)
    // 对于OJ，题目描述通常在一个独立的 'description' 或 'content' 字段
    // 我们在 MOCK_CODING_PROBLEMS_POOL 用了 description, 这里 problemId 对应 MOCK_PROBLEMS
    // 需要从 MOCK_CODING_PROBLEMS_POOL 获取完整描述，或在 MOCK_PROBLEMS 中添加描述字段
    // 暂时使用 title 作为占位
    return DOMPurify.sanitize((currentProblem.value?.title || "题目描述加载中...").replace(/\n/g, '<br>'));
  }
  // 假设 MOCK_PROBLEMS 增加了 description 字段
  const description = (currentProblem.value as any).description || "题目描述内容。";
  // 简单的Markdown转换，实际应用中建议使用 marked.js + DOMPurify
  let html = description
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/```([\s\S]*?)```/g, (_:any, codeblock: string) => `<pre><code>${codeblock.trim()}</code></pre>`)
      .replace(/\n/g, '<br />');
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
});


const loadProblemData = async () => {
  isLoadingProblem.value = true;
  submissionResult.value = null; // 清除上次提交结果
  // 确保题目列表已加载
  if (practiceStore.allProblems.length === 0) {
    await practiceStore.fetchProblemsAndStatus();
  }
  const problemData = practiceStore.getProblemById(props.problemId);
  if (problemData) {
    currentProblem.value = problemData;
    // 可以在这里从 localStorage 或 store 中加载用户对该题目的最后一次代码草稿
    // userCode.value = localStorage.getItem(`code_${props.problemId}_${selectedLanguage.value}`) || '';
  } else {
    console.error(`题目 ID ${props.problemId} 未找到。`);
    currentProblem.value = null; // 清除旧题目数据
  }
  isLoadingProblem.value = false;
};

onMounted(() => {
  loadProblemData();
});

watch(() => props.problemId, (newId) => {
  if (newId) {
    userCode.value = ''; // 切换题目时清空代码
    loadProblemData();
  }
});

// 保存代码草稿 (可选)
// watch([userCode, selectedLanguage], ([newCode, newLang]) => {
//   if (currentProblem.value) {
//     localStorage.setItem(`code_${currentProblem.value.id}_${newLang}`, newCode);
//   }
// });

const resetCode = () => {
  userCode.value = '';
  submissionResult.value = null;
};

const runCode = async () => {
  submissionResult.value = { status: 'pending', message: '正在运行您的代码 (模拟)...' };
  isSubmitting.value = true;
  await new Promise(resolve => setTimeout(resolve, 1500));

  // 修正后的模拟结果
  const mockOutput = Math.random() > 0.5
      ? {
        status: 'success' as const,
        message: '模拟运行成功！',
        details: '示例输出：\n预期输出：[1, 2]\n实际输出：[1, 2]'
      }
      : {
        status: 'error' as const,
        message: '模拟运行失败。',
        details: '错误：编译错误在第 5 行。'
      };

  submissionResult.value = mockOutput;
  isSubmitting.value = false;
};

const submitSolution = async () => {
  submissionResult.value = { status: 'pending', message: '正在提交您的解答 (模拟)...' };
  isSubmitting.value = true;
  await new Promise(resolve => setTimeout(resolve, 2000)); // 模拟提交和判题
  // 模拟结果
  const isCorrect = Math.random() > 0.4;
  if (isCorrect) {
    submissionResult.value = { status: 'success', message: '恭喜！解答正确！' };
    await practiceStore.updateUserProblemStatus(props.problemId, '已解决');
  } else {
    submissionResult.value = { status: 'error', message: '解答错误。', details: '失败的测试用例：\n输入：[1,2,3], target=7' };
    await practiceStore.updateUserProblemStatus(props.problemId, '已尝试');
  }
  isSubmitting.value = false;
};

</script>

<style scoped>
.problem-solve-view {
  display: flex;
  flex-direction: column; /* Ensure view itself can grow if needed, though layout inside should handle scroll */
  height: calc(100vh - 3.8rem); /* Full height minus DefaultLayout header */
  background-color: var(--bg-color);
  color: var(--text-color);
  overflow: hidden; /* Prevent overall page scroll */
}
.dark-theme-override { /* From InterviewRoomView, ensures dark theme vars */
  --bg-color: #111418;
  --text-color: #e0e0e7;
  --card-bg-color: #1c2126; /* Slightly lighter than main bg for panels */
  --border-color: #3c4753;
  --primary-color: #4b89fc;
  --input-bg-color: #0d1117; /* Code editor specific */
  --input-text-color: #c9d1d9; /* Code editor specific */
  --placeholder-color: #9daab8;
  --text-color-muted: #868e96;
}

.loading-state, .empty-state { /* Shared styles from other views */
  flex-grow: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 3rem; text-align: center;
}
.empty-state .empty-icon { font-size: 3rem; color: var(--primary-color); opacity: 0.6; margin-bottom: 1.5rem; }
.empty-state p { font-size: 1.1rem; margin-bottom: 1.5rem; opacity: 0.8; }
.spinner { /* ... (same spinner CSS) ... */ }


.problem-solve-layout {
  display: flex;
  flex-grow: 1;
  gap: 1.5rem; /* 左右面板间距 */
  padding: 1.5rem; /* 整体内边距 */
  overflow: hidden; /* 子面板自己处理滚动 */
}

.problem-description-panel {
  flex: 1 1 50%; /* 占据约一半或更多空间 */
  min-width: 300px;
  background-color: var(--card-bg-color);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* 允许题目描述区域滚动 */
}
.problem-description-panel::-webkit-scrollbar { width: 6px; }
.problem-description-panel::-webkit-scrollbar-track { background: var(--border-color); border-radius: 3px; }
.problem-description-panel::-webkit-scrollbar-thumb { background: var(--primary-color); border-radius: 3px; }


.panel-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--primary-color);
  text-decoration: none;
  margin-bottom: 1rem;
  opacity: 0.9;
}
.back-link:hover { opacity: 1; text-decoration: underline;}

.problem-title {
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.75rem;
}
[data-theme="dark"] .problem-title { color: #ffffff; }

.problem-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem; /* row-gap column-gap */
  font-size: 0.85rem;
  color: var(--text-color-muted);
  margin-bottom: 1rem;
}
.difficulty-badge { /* From ProblemListTable */
  padding: 0.25em 0.6em; border-radius: 0.25rem; font-size: 0.75rem; font-weight: 500;
  display: inline-block; min-width: 50px; text-align: center; color: white;
}
.difficulty-badge.简单 { background-color: #28a745; }
[data-theme="dark"] .difficulty-badge.简单 { background-color: #38a169; }
.difficulty-badge.中等 { background-color: #ffc107; color: #212529; }
[data-theme="dark"] .difficulty-badge.中等 { background-color: #d69e2e; color: #1a1d21;}
.difficulty-badge.困难 { background-color: #dc3545; }
[data-theme="dark"] .difficulty-badge.困难 { background-color: #e53e3e; }

.meta-item.topics { display: flex; flex-wrap: wrap; gap: 0.3rem; align-items: center; }
.topic-tag-small { /* From ProblemListTable, adjusted */
  background-color: var(--border-color); color: var(--text-color-muted);
  font-size: 0.7rem; padding: 0.15rem 0.4rem; border-radius: 0.25rem;
}
[data-theme="dark"] .topic-tag-small { background-color: #374151; color: #9ca3af; }

.description-content {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--text-color);
  white-space: pre-wrap; /* 保留格式，自动换行 */
  flex-grow: 1; /* 让描述内容填满 */
}
[data-theme="dark"] .description-content { color: #e0e0e7; }
.description-content :deep(strong) { font-weight: 600; color: var(--primary-color); }
.description-content :deep(code) {
  background-color: var(--border-color); padding: 0.1em 0.3em; border-radius: 3px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 0.9em;
}
[data-theme="dark"] .description-content :deep(code) { background-color: #2c3035; color: #c9d1d9; }
.description-content :deep(pre) {
  background-color: var(--input-bg-color); color: var(--input-text-color);
  padding: 1rem; border-radius: 6px; margin: 0.75em 0;
  overflow-x: auto; font-size: 0.85em;
  border: 1px solid var(--border-color);
}
.description-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
  font-size: inherit; /* 继承 pre 的字体大小 */
}


.code-editor-panel {
  flex: 1 1 50%;
  min-width: 300px;
  background-color: var(--card-bg-color);
  border-radius: 8px;
  padding: 1rem 1.5rem 1.5rem; /* 底部多留空间给按钮 */
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 1rem; /* 编辑器控件、编辑器、提交按钮之间的间距 */
  overflow: hidden; /* 防止内部元素溢出导致面板滚动 */
}

.editor-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem; /* 与编辑器主体的间距 */
  flex-shrink: 0;
}
.language-selector-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.language-selector-group label {
  font-size: 0.85rem;
  color: var(--text-color-muted);
  font-weight: 500;
}
.form-input.select-input-dark.small-select {
  padding: 0.4rem 2rem 0.4rem 0.6rem; /* 调整使其更小巧 */
  font-size: 0.85rem;
  min-width: 120px; /* 避免过窄 */
  height: auto;
  flex-grow: 0; /* 不拉伸 */
}
.button-icon-only { /* 从 AccountSettingsView 借鉴 */
  background: none; border: none; color: var(--text-color-muted);
  padding: 0.5rem; border-radius: 50%; cursor: pointer; transition: color 0.2s ease;
}
.button-icon-only:hover { color: var(--primary-color); }

.code-editor-main-instance {
  flex-grow: 1; /* 代码编辑器占据大部分可用空间 */
  min-height: 300px; /* 确保编辑器有足够高度 */
  display: flex; /* 使 CodeInputArea 组件填满 */
}
.code-editor-main-instance > :deep(.code-input-wrapper) {
  height: 100%;
  border-radius: 6px; /* 确保 wrapper 有圆角 */
}

.submission-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem; /* 与编辑器主体的间距 */
  flex-shrink: 0;
}
.form-button { /* 使用全局按钮样式 */
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
}
.primary-button { background-color: var(--primary-color); color: white; border:none; }
.secondary-button { background-color: var(--border-color); color: var(--text-color); border:none; }
[data-theme="dark"] .secondary-button { background-color: #374151; color: #e4e6eb; }
.secondary-button:hover { opacity: 0.8; }
.primary-button:hover { opacity: 0.9; }
.form-button:disabled { opacity: 0.6; cursor: not-allowed; }


.submission-result {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  line-height: 1.5;
  border-width: 1px;
  border-style: solid;
}
.submission-result.success {
  background-color: color-mix(in srgb, #28a745 15%, var(--card-bg-color) 85%);
  border-color: #28a745;
  color: color-mix(in srgb, #28a745 80%, var(--text-color) 20%);
}
[data-theme="dark"] .submission-result.success {
  background-color: color-mix(in srgb, #38a169 20%, var(--card-bg-color) 80%);
  border-color: #38a169;
  color: #a7f3d0;
}
.submission-result.error {
  background-color: color-mix(in srgb, #dc3545 15%, var(--card-bg-color) 85%);
  border-color: #dc3545;
  color: color-mix(in srgb, #dc3545 80%, var(--text-color) 20%);
}
[data-theme="dark"] .submission-result.error {
  background-color: color-mix(in srgb, #e53e3e 20%, var(--card-bg-color) 80%);
  border-color: #e53e3e;
  color: #fecaca;
}
.submission-result.pending {
  background-color: color-mix(in srgb, var(--primary-color) 15%, var(--card-bg-color) 85%);
  border-color: var(--primary-color);
  color: var(--primary-color);
}
.submission-result h4 {
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 1em;
}
.submission-result pre {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: var(--input-bg-color); /* Code block background */
  color: var(--input-text-color);
  border-radius: 4px;
  font-size: 0.85em;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 150px; /* Limit height of details block */
  overflow-y: auto;
}
</style>