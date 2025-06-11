<template>
  <div class="tag-selection-group">
    <button
        v-for="option in options"
        :key="option.value"
        :class="['tag-button', { active: modelValue === option.value }]"
        @click="selectOption(option.value)"
        type="button"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  options: Array<{ value: string; label: string }>;
  modelValue: string | null; // For v-model
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void;
}>();

const selectOption = (value: string) => {
  emit('update:modelValue', value);
};
</script>

<style scoped>
.tag-selection-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.tag-button {
  padding: 0.6rem 1.2rem; /* 调整内边距使标签更舒适 */
  font-size: 0.9rem; /* text-sm or slightly larger */
  font-weight: 500;
  border-radius: 20px; /* rounded-full or large radius */
  background-color: var(--input-bg-color); /* 使用输入框背景色作为基准 */
  color: var(--text-color);
  border: 1px solid var(--input-border-color); /* 使用输入框边框色 */
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}
[data-theme="dark"] .tag-button {
  background-color: #2c3035; /* 暗色主题下的标签背景 */
  color: #ffffff;
  border-color: #40474f; /* 暗色主题下的标签边框 */
}

.tag-button:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  box-shadow: 0 0 0 1px var(--primary-color); /* 轻微的外发光效果 */
}
.tag-button.active {
  background-color: var(--primary-color);
  color: white; /* 确保选中状态下文字颜色与背景对比清晰 */
  border-color: var(--primary-color);
  font-weight: 600; /* 加粗选中项 */
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
[data-theme="dark"] .tag-button.active {
  color: #ffffff; /* 对于暗色主题下的主色调，白色文字通常是好的选择 */
}
</style>