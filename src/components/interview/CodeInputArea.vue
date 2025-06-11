<template>
  <div class="code-input-wrapper">
    <Codemirror
        v-model="code"
        :placeholder="placeholderText"
        :style="{ height: '100%', width: '100%' }"
        :autofocus="true"
        :indent-with-tab="true"
        :tab-size="2"
        :extensions="currentExtensions"
        @ready="handleReady"
        @change="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, watch } from 'vue';
import { Codemirror } from 'vue-codemirror';

// CodeMirror 6 核心和常用扩展
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, highlightActiveLine } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { defaultHighlightStyle, syntaxHighlighting, indentOnInput, bracketMatching, foldGutter, foldKeymap } from '@codemirror/language';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { closeBrackets, autocompletion, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
// import { lintKeymap } from '@codemirror/lint'; // 如果需要代码检查功能

// 主题 (选择一个暗色主题)
import { oneDark } from '@codemirror/theme-one-dark';

// 语言包
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java as langJava } from '@codemirror/lang-java'; // 导入时重命名以避免与关键字冲突
import { cpp as langCpp } from '@codemirror/lang-cpp';   // 同上
import type { ViewUpdate } from '@codemirror/view'

const props = defineProps<{
  modelValue: string;
  placeholderText?: string;
  language?: 'javascript' | 'python' | 'java' | 'cpp'; // 新增 prop 用于语言切换
  readOnly?: boolean; // 可选，用于展示代码等场景
}>();

const emit = defineEmits(['update:modelValue', 'ready']);

const code = ref(props.modelValue);
const view = shallowRef<EditorView>(); // CodeMirror 编辑器实例

// 用于动态切换语言的 Compartment
const languageCompartment = new Compartment();

// 基础扩展
const baseExtensions = [
  lineNumbers(),
  highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  foldGutter(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }), // 默认高亮样式
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  rectangularSelection(),
  highlightActiveLine(),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...historyKeymap,
    ...foldKeymap,
    ...completionKeymap,
    // ...lintKeymap, // 如果启用了 lint
    indentWithTab, // Tab键缩进，Shift+Tab反缩进
  ]),
  oneDark, // 应用暗色主题
  EditorView.theme({ // 自定义一些主题相关的样式
    '&': {
      color: '#c9d1d9', // 编辑器文本颜色
      backgroundColor: '#0d1117', // 编辑器背景色
      height: '100%', // 确保编辑器填满容器
      fontSize: '14px', // 设置字体大小
    },
    '.cm-content': {
      caretColor: '#c9d1d9', // 光标颜色
      fontFamily: "'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace", // 等宽字体
    },
    '.cm-gutters': {
      backgroundColor: '#0d1117', //行号区背景
      color: '#6a737d', //行号颜色
      borderRight: '1px solid #22272e',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#161b22'
    },
    '.cm-lineNumbers .cm-gutterElement': {
      paddingLeft: '0.5rem', // 行号左侧内边距
      paddingRight: '0.5rem' // 行号右侧内边距
    },
    '.cm-placeholder': {
      color: '#586069',
      fontStyle: 'italic'
    }
  }),
  EditorView.lineWrapping, // 自动换行
  props.readOnly ? EditorState.readOnly.of(true) : [], // 只读模式
];

// 根据 props.language 动态选择语言扩展
const currentLanguageExtension = computed(() => {
  switch (props.language) {
    case 'python':
      return python();
    case 'java':
      return langJava();
    case 'cpp':
      return langCpp();
    case 'javascript':
    default:
      return javascript();
  }
});

// 完整的扩展列表，包含动态语言
const currentExtensions = computed(() => {
  return [
    ...baseExtensions,
    languageCompartment.of(currentLanguageExtension.value)
  ];
});

// 监听父组件的 modelValue 变化，同步到本地 code (通常用于外部重置代码)
watch(() => props.modelValue, (newValue) => {
  if (newValue !== code.value) {
    code.value = newValue;
  }
});

// 监听本地 code 变化，通过 emit 更新父组件的 modelValue
const handleChange = (newVal: string) => {
  code.value = newVal; // 更新本地 ref (Codemirror v-model 会自动做这个)
  emit('update:modelValue', newVal);
};

const handleReady = (payload: {
  view: EditorView
  state: EditorState
  container: HTMLDivElement
}) => {
  view.value = payload.view
  emit('ready', payload)
  console.log('CodeMirror ready. Container:', payload.container)
}

// 当语言 prop 变化时，重新配置语言扩展
watch(() => props.language, (newLanguage) => {
  if (view.value) {
    console.log(`语言变更为: ${newLanguage}, 重新配置编辑器语言。`);
    view.value.dispatch({
      effects: languageCompartment.reconfigure(currentLanguageExtension.value)
    });
  }
});

</script>

<style scoped>
.code-input-wrapper {
  width: 100%;
  height: 100%; /* 让 wrapper 占据父组件分配的高度 */
  background-color: #0d1117; /* 与编辑器主题背景一致 */
  border-radius: 6px; /* 与编辑器内部一致 */
  overflow: hidden; /* 确保 Codemirror 的圆角生效 */
  border: 1px solid var(--border-color); /* 与编辑器主题边框协调 */
  display: flex; /* 使 Codemirror 组件填满 */
}
/* Codemirror 组件会自己处理内部样式和主题，我们只需要确保包装器尺寸正确 */
</style>