<template>
  <div class="page-container">
    <header class="page-header">
      <h1>技术知识练习</h1>
      <p>请选择您想练习的技术领域和具体主题，我们将为您生成一系列相关问题。</p>
    </header>

    <div class="generation-form-card">
      <div class="selection-grid">
        <div class="form-group">
          <label for="cat-level1">技术大类</label>
          <select id="cat-level1" v-model="selectedCategory" @change="onCategoryChange" class="form-input select-input">
            <option disabled value="">请选择...</option>
            <option v-for="cat in techCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label for="cat-level2">子分类</label>
          <select id="cat-level2" v-model="selectedSubCategory" @change="onSubCategoryChange" class="form-input select-input" :disabled="!selectedCategory || subCategories.length === 0">
            <option disabled value="">请选择...</option>
            <option v-for="subCat in subCategories" :key="subCat.id" :value="subCat.id">{{ subCat.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label for="cat-level3">具体主题</label>
          <select id="cat-level3" v-model="selectedTopic" class="form-input select-input" :disabled="!selectedSubCategory || topics.length === 0">
            <option disabled value="">请选择...</option>
            <option v-for="topic in topics" :key="topic.id" :value="topic.id">{{ topic.name }}</option>
          </select>
        </div>
      </div>
      <button @click="generateQuestions" class="form-button primary-button large-button" :disabled="isLoading || !selectedTopic">
        <font-awesome-icon :icon="['fas', 'lightbulb']" :spin="isLoading" />
        {{ isLoading ? '正在生成题目...' : '生成练习题' }}
      </button>
    </div>

    <div v-if="isLoading" class="loading-state-small">
      <div class="spinner"></div><p>AI 正在努力出题中，请稍候...</p>
    </div>

    <div v-else-if="generatedQuestions.length > 0" class="question-list-container">
      <h2 class="list-title">为您生成的练习题 ({{ generatedQuestions.length }}道)</h2>
      <div class="question-list">
        <div v-for="(item, index) in generatedQuestions" :key="item.id" class="question-card">
          <div class="question-header">
            <span class="question-index">{{ index + 1 }}.</span>
            <h3 class="question-title-text">{{ item.questionText }}</h3>
          </div>

          <div class="toggle-answer-action">
            <button @click="toggleAnswer(index)" class="toggle-answer-button">
              <font-awesome-icon :icon="activeIndex === index ? ['fas', 'chevron-up'] : ['fas', 'chevron-down']" class="toggle-icon" />
              {{ activeIndex === index ? '隐藏答案' : '显示答案' }}
            </button>
          </div>

          <transition name="expand">
            <div v-if="activeIndex === index" class="answer-container">
              <div class="content-section">
                <h4>参考答案</h4>
                <div class="answer-text" v-html="formatMarkdown(item.textAnswer)"></div>
              </div>
              <div v-if="item.imageAnswerUrl" class="content-section">
                <h4>图文解答</h4>
                <img :src="item.imageAnswerUrl" alt="图文解答" class="answer-image">
              </div>
              <div v-if="item.audioAnswerUrl" class="content-section">
                <h4>语音解析</h4>
                <audio controls :src="item.audioAnswerUrl" class="audio-player"></audio>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <div v-else-if="!isLoading && initialLoad" class="empty-state initial-prompt">
      <font-awesome-icon :icon="['fas', 'wand-magic-sparkles']" class="empty-icon" />
      <p>选择您感兴趣的技术主题，开始您的专属练习吧！</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import MarkdownIt from 'markdown-it';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// --- 核心修正点 1: 为数据结构定义清晰的 TypeScript 类型 ---
interface Topic {
  id: string;
  name: string;
}

interface SubCategory {
  id: string;
  name: string;
  topics: Topic[];
}

interface TechCategory {
  id: string;
  name: string;
  subCategories: SubCategory[];
}

interface GeneratedQuestion {
  id: string;
  topic: string;
  questionText: string;
  textAnswer: string;
  audioAnswerUrl?: string;
  imageAnswerUrl?: string;
}
// --- 类型定义结束 ---


const topic = ref('');
const isLoading = ref(false);
const initialLoad = ref(true);
const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

// --- 核心修正点 2: 将类型应用到 ref 上 ---
const techCategories = ref<TechCategory[]>([
  {
    id: 'frontend',
    name: '前端',
    subCategories: [
      {
        id: 'frameworks',
        name: '框架与库',
        topics: [
          {id: 'vue', name: 'Vue.js'},
          {id: 'react', name: 'React'}
        ]
      },
      {
        id: 'basics',
        name: '基础三件套',
        topics: [
          {id: 'js-async', name: 'JavaScript 异步'},
          {id: 'css-layout', name: 'CSS 布局'}
        ]
      }
    ]
  },
  {
    id: 'backend',
    name: '后端',
    subCategories: [
      {
        id: 'java',
        name: 'Java',
        topics: [
          {id: 'jvm', name: 'JVM'},
          {id: 'juc', name: '并发(JUC)'}
        ]
      },
      {
        id: 'database',
        name: '数据库',
        topics: [
          {id: 'mysql-index', name: 'MySQL 索引'},
          {id: 'redis-cache', name: 'Redis 缓存策略'}
        ]
      }
    ]
  }
]);

const selectedCategory = ref('');
const selectedSubCategory = ref('');
const selectedTopic = ref('');

// TypeScript 现在可以正确推断出 c 是 TechCategory 类型，s 是 SubCategory 类型
const subCategories = computed(() => {
  return techCategories.value.find(c => c.id === selectedCategory.value)?.subCategories || [];
});
const topics = computed(() => {
  return subCategories.value.find(s => s.id === selectedSubCategory.value)?.topics || [];
});

const onCategoryChange = () => { selectedSubCategory.value = ''; selectedTopic.value = ''; };
const onSubCategoryChange = () => { selectedTopic.value = ''; };

const generatedQuestions = ref<GeneratedQuestion[]>([]);
const activeIndex = ref<number | null>(null);
const generateQuestions = () => {
  if (!selectedTopic.value) return;

  isLoading.value = true;
  initialLoad.value = false;
  generatedQuestions.value = [];
  activeIndex.value = null;

  console.log(`正在为主题 "${selectedTopic.value}" 生成模拟数据...`);

  // 获取主题名称（模拟API前置操作）
  const topicName = topics.value.find(t => t.id === selectedTopic.value)?.name || '该主题';

  // 模拟API延迟
  setTimeout(() => {
    console.warn("正在使用模拟数据");

    generatedQuestions.value = Array.from([
      {
        id: 'juc_q1_mock',
        topic: topicName,
        questionText: "请解释一下 Java 中的 `volatile` 关键字是如何保证内存可见性的，并说明其与 `synchronized` 的主要区别。",
        textAnswer: `
好的，这个问题可以从两个方面来回答：

### \`volatile\` 的内存可见性原理
\`volatile\` 关键字主要通过以下两点来保证共享变量在多线程环境下的可见性：
1. **强制从主内存读取**：读取时从主内存重新加载值
2. **强制写回主内存**：修改时立即刷新到主内存

### 与 \`synchronized\` 的区别
| 特性         | \`volatile\`                  | \`synchronized\`               |
|--------------|-------------------------------|--------------------------------|
| **作用级别** | 变量级别（轻量级）            | 方法/代码块级别（重量级）      |
| **保证**     | 可见性和有序性                | 可见性、有序性和原子性         |
| **阻塞**     | 不会造成线程阻塞              | 会造成线程阻塞                 |
| **使用场景** | 一写多读或状态标记            | 需要保证复合操作原子性的场景   |
`.trim(),
        imageAnswerUrl: 'https://i.imgur.com/3J8B47G.png',  // Java内存模型示意图
        audioAnswerUrl: void 0
      },
      {
        id: 'juc_q2_mock',
        topic: topicName,
        questionText: "什么是 `AQS` (AbstractQueuedSynchronizer)？请举例说明它在 `ReentrantLock` 和 `CountDownLatch` 中的应用。",
        textAnswer: `
\`AQS\` 是 Java 并发包（JUC）的基石，核心组件：
1. **\`state\` 变量**：表示同步状态
2. **FIFO 等待队列**：管理等待线程

### 应用示例
**\`ReentrantLock\`**:
- \`lock()\` → \`acquire()\` → \`tryAcquire()\`
- \`unlock()\` → \`release()\` → \`tryRelease()\`

**\`CountDownLatch\`**:
- \`await()\` → \`acquireSharedInterruptibly()\`
- \`countDown()\` → \`releaseShared()\`
`.trim(),
        imageAnswerUrl: void 0,
        audioAnswerUrl: '/mock-audio/aqs_explanation.mp3'
      },
      {
        id: 'juc_q3_mock',
        topic: topicName,
        questionText: "请解释 `ThreadPoolExecutor` 的核心构造参数及其工作流程。",
        textAnswer: `
### 核心参数
1. \`corePoolSize\`：核心线程数
2. \`maximumPoolSize\`：最大线程数
3. \`workQueue\`：任务队列类型
4. \`handler\`：拒绝策略

### 工作流程
1. 当前线程数 < corePoolSize → 创建新线程
2. 线程数 ≥ corePoolSize → 任务入队
3. 队列满且线程数 < maximumPoolSize → 创建临时线程
4. 队列满且线程数达上限 → 执行拒绝策略
`.trim(),
        imageAnswerUrl: 'https://i.imgur.com/W2zTzXp.png',  // 线程池流程图
        audioAnswerUrl: void 0
      }
    ]);

    isLoading.value = false;
  }, 1500);
};

const formatMarkdown = (text: string) => md.render(text);

const toggleAnswer = (index: number) => {
  activeIndex.value = activeIndex.value === index ? null : index;
};
</script>

<style scoped>
.page-container { max-width: 900px; margin: 0 auto; padding: 2.5rem; }
.page-header { text-align: center; margin-bottom: 2rem; }
.page-header h1 { font-size: 2.25rem; font-weight: 700; }
.page-header p { font-size: 1rem; color: var(--text-color-muted); }

.generation-form-card {
  padding: 2rem;
  background-color: var(--card-bg-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}
.selection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
}
.form-input { /* ... (依赖全局样式) ... */ }
.select-input { /* ... (依赖全局样式) ... */ }

.large-button {
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  align-self: center; /* 按钮居中 */
}

.loading-state-small {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
  font-size: 1rem;
  color: var(--text-color-muted);
}
.loading-state-small .spinner { width: 32px; height: 32px; margin: 0; }
.loading-state-small .spinner div { width: 28px; height: 28px; border-width: 3px; }

.question-list-container { margin-top: 2.5rem; }
.list-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem; }
.accordion { border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; }
.accordion-item { border-bottom: 1px solid var(--border-color); }
.accordion-item:last-child { border-bottom: none; }

.accordion-header {
  width: 100%; padding: 1.25rem 1.5rem; background-color: var(--card-bg-color);
  border: none; text-align: left; font-size: 1rem; font-weight: 500;
  color: var(--text-color); cursor: pointer; display: flex;
  justify-content: space-between; align-items: center; transition: background-color 0.2s ease;
}
.accordion-header:hover { background-color: var(--border-color); }
.accordion-header .question-text {
  flex-grow: 1;
  padding-right: 1rem;
  line-height: 1.5;
}
.accordion-icon { transition: transform 0.3s ease; flex-shrink: 0; }
.accordion-header[aria-expanded="true"] .accordion-icon { transform: rotate(180deg); }

.accordion-content {
  padding: 0 1.5rem 1.5rem 1.5rem; /* 上方无padding，因为它与header有分割线 */
  background-color: var(--bg-color);
  border-top: 1px solid var(--border-color);
}
.content-section { margin-top: 1.5rem; }
.content-section:first-child { margin-top: 0; padding-top: 1.5rem; }
.content-section h3 {
  font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem;
  padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color);
  display: flex; align-items: center; gap: 0.5rem;
}
.answer-text { line-height: 1.8; font-size: 0.95rem; }
.answer-text :deep(p) { margin-bottom: 1em; }
.answer-text :deep(ul), .answer-text :deep(ol) { padding-left: 1.5rem; }
.answer-text :deep(code) {
  background-color: var(--border-color); padding: 0.15em 0.4em;
  border-radius: 4px; font-size: 0.85em;
}
[data-theme="dark"] .answer-text :deep(code) { background-color: #2c3035; }
.answer-text :deep(pre) {
  background-color: var(--input-bg-color);
  color: var(--input-text-color);
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
}

.answer-image { max-width: 100%; border-radius: 6px; margin-top: 1rem; border: 1px solid var(--border-color); }
.audio-player { width: 100%; margin-top: 1rem; }

.expand-enter-active, .expand-leave-active { transition: grid-template-rows 0.3s ease-out; }
.expand-enter-from, .expand-leave-to { grid-template-rows: 0fr; }
/* 上述手风琴动画需要JS配合或更复杂的CSS，为简单起见，我们使用一个淡入淡出 */
.expand-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.expand-leave-active { transition: opacity 0.2s ease; }
.expand-enter-from, .expand-leave-to { opacity: 0; transform: translateY(-10px); }

.empty-state.initial-prompt {
  border-style: dashed;
  opacity: 0.8;
}
.empty-state.initial-prompt .empty-icon {
  font-size: 2.5rem;
}
/* **新增/修改的样式** */
.question-list-container { margin-top: 2.5rem; }
.list-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem; }
.question-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* 每个问题卡片之间的间距 */
}

.question-card {
  background-color: var(--card-bg-color);
  border: 1px solid var(--border-color);
  border-radius: 10px; /* 更圆润的卡片 */
  padding: 1.5rem;
  box-shadow: 0 3px 10px rgba(0,0,0,0.04);
  transition: box-shadow 0.3s ease;
}
[data-theme="dark"] .question-card {
  box-shadow: 0 3px 10px rgba(0,0,0,0.15);
}
.question-card:hover {
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
}
[data-theme="dark"] .question-card:hover {
  box-shadow: 0 5px 15px rgba(0,0,0,0.25);
}


.question-header {
  display: flex;
  gap: 0.75rem; /* 题号和题目文本的间距 */
  align-items: flex-start; /* 垂直方向上对齐顶部 */
  margin-bottom: 1rem;
}
.question-index {
  font-weight: 600;
  color: var(--primary-color);
  font-size: 1.1rem;
  line-height: 1.6; /* 与题目文本行高对齐 */
}
.question-title-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
  line-height: 1.6;
  flex-grow: 1;
}
[data-theme="dark"] .question-title-text {
  color: #ffffff;
}


.toggle-answer-action {
  display: flex;
  justify-content: flex-start; /* 按钮靠左 */
  padding-top: 0.5rem;
  margin-top: 1rem;
  border-top: 1px dashed var(--border-color);
}
.toggle-answer-button {
  background-color: transparent;
  color: var(--text-color-muted);
  border: 1px solid var(--border-color);
  padding: 0.4rem 1rem;
  border-radius: 20px; /* 胶囊形状 */
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease-in-out;
}
.toggle-answer-button:hover {
  background-color: var(--primary-color-translucent);
  color: var(--primary-color);
  border-color: var(--primary-color);
}
.toggle-answer-button .toggle-icon {
  transition: transform 0.3s ease;
}


.answer-container {
  padding-top: 1.5rem;
  margin-top: 1rem;
  border-top: 1px solid var(--border-color); /* 答案区与按钮之间的分割线 */
}

/* 答案内部的样式 (与手风琴版本一致) */
.content-section { margin-bottom: 1.5rem; }
.content-section:last-child { margin-bottom: 0; }
.content-section h4 {
  font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem;
  display: flex; align-items: center; gap: 0.5rem;
}
.answer-text { line-height: 1.8; font-size: 0.95rem; }
.answer-text :deep(p) { margin-bottom: 1em; }
.answer-text :deep(ul), .answer-text :deep(ol) { padding-left: 1.5rem; }
.answer-text :deep(code) {
  background-color: var(--border-color); padding: 0.15em 0.4em;
  border-radius: 4px; font-size: 0.85em;
}
[data-theme="dark"] .answer-text :deep(code) { background-color: #2c3035; }
.answer-text :deep(pre) { /* ... (样式不变) ... */ }
.answer-image { max-width: 100%; border-radius: 6px; margin-top: 1rem; border: 1px solid var(--border-color); }
.audio-player { width: 100%; margin-top: 1rem; }

/* 展开/折叠的动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease-out;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
}
.expand-enter-to,
.expand-leave-from {
  max-height: 1000px; /* 一个足够大的值 */
  opacity: 1;
}
</style>