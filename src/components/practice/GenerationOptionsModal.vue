<template>
  <BaseModal
      :is-open="isOpen"
      title="生成专属练习题"
      @close="emit('close')"
  >
    <div class="options-form">
      <div class="summary-section">
        <p class="summary-description">AI 将根据您已选的以下条件，为您生成题目：</p>
        <ul class="summary-list">
          <li class="summary-item">
            <strong class="summary-label"><font-awesome-icon :icon="['fas', 'briefcase']" /> 目标岗位</strong>
            <span class="summary-value">{{ selectedRoleName || '未选择' }}</span>
          </li>
          <li class="summary-item">
            <strong class="summary-label"><font-awesome-icon :icon="['fas', 'tags']" /> 技术标签</strong>
            <div v-if="selectedTags && selectedTags.length > 0" class="summary-tags-cloud">
              <span v-for="tag in selectedTags" :key="tag" class="summary-tag-item">{{ tag }}</span>
            </div>
            <span v-else class="summary-value">未选择</span>
          </li>
          <li class="summary-item">
            <strong class="summary-label"><font-awesome-icon :icon="['fas', 'lightbulb']" /> 生成策略</strong>
            <span class="summary-value">{{ selectedStrategyText }}</span>
          </li>
          <li class="summary-item">
            <strong class="summary-label"><font-awesome-icon :icon="['fas', 'graduation-cap']" /> 题目难度</strong>
            <span class="summary-value">{{ selectedDifficulty }}</span>
          </li>
        </ul>
      </div>

      <div class="config-section">
        <div class="form-group">
          <label for="count-input">生成数量 (最大10题)</label>
          <input
              id="count-input"
              type="number"
              v-model.number="generationCount"
              class="form-input"
              min="1"
              max="10"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <button type="button" @click="emit('close')" class="form-button secondary-button">返回修改</button>
      <button
          type="button"
          @click="confirmGeneration"
          class="form-button primary-button"
          :disabled="isLoading"
      >
        <font-awesome-icon v-if="isLoading" :icon="['fas', 'spinner']" spin />
        <span v-else>确认并生成</span>
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseModal from '../common/BaseModal.vue';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// **核心修正点 1**: 组件的 Props 定义现在是完整且正确的
const props = defineProps<{
  isOpen: boolean;
  isLoading: boolean;
  selectedRoleName?: string | null;
  selectedTags?: string[];
  selectedDifficulty: string;
  selectedStrategyText: string;
}>();

// **核心修正点 2**: emit 的事件负载类型现在只包含 count
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm', options: { count: number }): void;
}>();

const generationCount = ref(5);

const confirmGeneration = () => {
  if (generationCount.value > 10) generationCount.value = 10;
  if (generationCount.value < 1) generationCount.value = 1;
  emit('confirm', { count: generationCount.value });
};
</script>
<style scoped>
.summary-section { padding: 1rem; background-color: var(--bg-color); border-radius: 8px; }
[data-theme="dark"] .summary-section { background-color: #111418; border: 1px solid #3c4753; }
.summary-description { font-size: 0.95rem; color: var(--text-color-muted); margin-bottom: 1rem; }
.summary-list { list-style: none; display: flex; flex-direction: column; gap: 1rem; }
.summary-item { display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.9rem; }
.summary-label { font-weight: 600; display: inline-flex; align-items: center; gap: 0.5rem; color: #9daab8; }
.summary-value { font-size: 1rem; font-weight: 500; color: #ffffff; padding-left: 1.75rem;}
.summary-tags-cloud { display: flex; flex-wrap: wrap; gap: 0.5rem; padding-left: 1.75rem; }
.tag-item { padding: 0.2rem 0.6rem; background-color: var(--primary-color-translucent); color: var(--primary-color); border-radius: 4px; font-weight: 500; }
.config-section { border-top: 1px dashed var(--border-color); padding-top: 1.5rem; margin-top: 1.5rem; }
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.form-group label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-color);
}
[data-theme="dark"] .form-group label { color: #e0e0e7; }
</style>