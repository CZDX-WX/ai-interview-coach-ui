<template>
  <div class="phase-selection-group">
    <label v-for="phase in availablePhases" :key="phase.id" class="checkbox-label">
      <input
          type="checkbox"
          :checked="selectedPhaseIds.includes(phase.id)"
          @change="togglePhase(phase.id)"
          class="form-checkbox"
      />
      <div class="checkbox-custom-display">
        <font-awesome-icon :icon="['fas', 'check']" class="checkmark-icon" />
      </div>
      <div class="phase-details">
        <span class="phase-name">{{ phase.name }}</span> <span v-if="phase.description" class="phase-desc-small">{{ phase.description }}</span> </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import type { PhaseDefinition } from '../../stores/interviewSetup'; // 或共享类型文件
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  availablePhases: PhaseDefinition[];
  selectedPhaseIds: string[]; // For v-model:selectedPhaseIds
}>();

const emit = defineEmits<{
  (e: 'update:selectedPhaseIds', updatedIds: string[]): void;
}>();

const togglePhase = (phaseId: string) => {
  const newSelectedIds = [...props.selectedPhaseIds];
  const index = newSelectedIds.indexOf(phaseId);
  if (index > -1) {
    newSelectedIds.splice(index, 1);
  } else {
    newSelectedIds.push(phaseId);
  }
  emit('update:selectedPhaseIds', newSelectedIds);
};
</script>

<style scoped>
/* 样式从 InterviewSetupView.vue 迁移 */
.phase-selection-group { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; }
.checkbox-label {
  display: flex; align-items: center; padding: 0.75rem 1rem;
  border: 1px solid var(--border-color); border-radius: 6px;
  cursor: pointer; transition: border-color 0.2s ease, background-color 0.2s ease;
  background-color: var(--bg-color);
}
.checkbox-label:hover { border-color: var(--primary-color); }
/* Active state will be handled by :checked + .checkbox-custom-display */

.form-checkbox { opacity: 0; width: 0; height: 0; position: absolute; }

.checkbox-custom-display {
  width: 20px; height: 20px; border: 2px solid var(--input-border-color); /* Use input border color */
  border-radius: 4px; display: flex; align-items: center; justify-content: center;
  margin-right: 0.75rem; transition: background-color 0.2s ease, border-color 0.2s ease;
  background-color: var(--bg-color); flex-shrink: 0;
}
.form-checkbox:checked + .checkbox-custom-display {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.checkmark-icon { font-size: 0.8em; color: white; opacity: 0; transition: opacity 0.2s ease; }
.form-checkbox:checked + .checkbox-custom-display .checkmark-icon { opacity: 1; }

.phase-details { display: flex; flex-direction: column; }
.phase-name { font-size: 0.9rem; font-weight: 500; color: var(--text-color); }
[data-theme="dark"] .phase-name { color: #ffffff; }
.phase-desc-small { font-size: 0.75rem; opacity: 0.7; color: var(--text-color); }
[data-theme="dark"] .phase-desc-small { opacity: 0.6; }
</style>