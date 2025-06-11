<template>
  <div class="interview-setup-view">
    <div class="breadcrumbs">
      <router-link to="/practice" class="breadcrumb-link">练习中心</router-link>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-current">设置新面试</span>
    </div>

    <h1 class="page-title">设置您的模拟面试</h1>
    <p class="page-subtitle">请配置以下选项，以便我们为您量身定制面试体验。</p>

    <div class="setup-steps-container">
      <SetupSectionCard
          title="第一步：选择职位领域"
          icon="briefcase"
          description="请选择您希望模拟面试的职位所属领域。"
      >
        <TagSelector
            :options="setupStore.availableJobFields"
            v-model="setupStore.selectedJobField"
        />
      </SetupSectionCard>

      <SetupSectionCard
          title="第二步：选择经验水平"
          icon="layer-group"
          description="选择与您当前或目标经验水平相符的选项。"
      >
        <TagSelector
            :options="setupStore.availableExperienceLevels"
            v-model="setupStore.selectedExperienceLevel"
        />
      </SetupSectionCard>

      <SetupSectionCard
          title="第三步：(可选) 选择或上传您的简历"
          icon="file-alt"
          description="使用简历有助于 AI 根据您的经验定制面试和反馈。"
      >
        <ResumeSelectorUpload
            :user-resumes="setupStore.userResumes"
            v-model="setupStore.selectedResume"
        />
      </SetupSectionCard>

      <SetupSectionCard
          title="第四步：选择面试阶段"
          icon="tasks"
          description="选择您希望在此次模拟面试中包含的阶段。"
      >
        <PhaseSelector
            :available-phases="setupStore.availablePhasesList" v-model:selected-phase-ids="setupStore.selectedPhaseIds"
        />
      </SetupSectionCard>

      <SetupSectionCard
          title="第五步：回顾并开始"
          icon="check-circle"
      >
        <InterviewReview
            :job-field-label="setupStore.getJobFieldLabel"
            :experience-level-label="setupStore.getExperienceLevelLabel"
            :selected-resume-name="setupStore.selectedResume?.name"
            :selected-phase-names="selectedPhaseNamesComputed"
        />
        <div class="proceed-button-container">
          <button @click="proceedToDeviceCheck" class="form-button proceed-button" :disabled="!canProceed">
            <font-awesome-icon :icon="['fas', 'video']" /> 进入设备检查
          </button>
        </div>
      </SetupSectionCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'; // Removed ref, watch, onMounted if not used directly for resume logic
import { useRouter } from 'vue-router';
import { useInterviewSetupStore, ALL_POSSIBLE_PHASES } from '@/stores/interviewSetup'; // Import ALL_POSSIBLE_PHASES
import SetupSectionCard from '../../components/setup/SetupSectionCard.vue';
import TagSelector from '../../components/setup/TagSelector.vue';
import ResumeSelectorUpload from '../../components/setup/ResumeSelectorUpload.vue';
import PhaseSelector from '../../components/setup/PhaseSelector.vue';
import InterviewReview from '../../components/setup/InterviewReview.vue';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const router = useRouter();
const setupStore = useInterviewSetupStore();

// Resume logic is now encapsulated in ResumeSelectorUpload.vue
// The parent (this component) will interact with setupStore.selectedResume for its value.

const selectedPhaseNamesComputed = computed(() => {
  return setupStore.selectedPhaseIds
      .map(id => ALL_POSSIBLE_PHASES.find(p => p.id === id)?.name)
      .filter(name => name !== undefined) as string[];
});

const canProceed = computed(() => {
  return setupStore.selectedJobField &&
      setupStore.selectedExperienceLevel &&
      setupStore.selectedPhaseIds.length > 0;
});

const proceedToDeviceCheck = () => {
  if (!canProceed.value) {
    alert('请选择职位领域、经验水平以及至少一个面试阶段。');
    return;
  }
  router.push({ name: 'DeviceCheck' });
};
</script>

<style scoped>
/* Styles that remain in the parent or are general layout for this view */
.interview-setup-view {
  padding: 1.5rem 2rem;
  max-width: 900px;
  margin: 0 auto;
  color: var(--text-color);
}

.breadcrumbs {
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.7;
}
.breadcrumb-link { color: var(--text-color); text-decoration: none; }
.breadcrumb-link:hover { color: var(--primary-color); }
.breadcrumb-separator { margin: 0 0.5rem; }
.breadcrumb-current { font-weight: 500; color: var(--text-color); opacity: 1;}
[data-theme="dark"] .breadcrumb-current { color: #ffffff; }


.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.5rem;
}
[data-theme="dark"] .page-title { color: #ffffff; }

.page-subtitle {
  font-size: 1rem;
  color: var(--text-color);
  opacity: 0.8;
  margin-bottom: 2.5rem;
}
[data-theme="dark"] .page-subtitle { color: #a2aab3; }


.setup-steps-container {
  display: flex;
  flex-direction: column;
  gap: 2rem; /* Gap between SetupSectionCard components */
}

.proceed-button-container {
  display: flex;
  justify-content: center; /* Center the button */
  margin-top: 1.5rem;
}

.proceed-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.75rem;
  padding: 0.75rem 2rem; font-size: 1rem; /* Adjusted size for better prominence */
  width: auto;
  background-color: var(--primary-color); color: white; border-radius: 6px;
  font-weight: 500; /* Standard weight */
}
.proceed-button:hover { opacity: 0.9; }
.proceed-button:disabled { background-color: #555; opacity: 0.7; cursor: not-allowed; }
.proceed-button .fa-icon { font-size: 1em; }

/* Styles for .form-group, .select-input, .file-upload-area, etc.
   are now mostly within their respective child components or global if applicable.
   Ensure any remaining direct styles here are minimal or specific to this parent's layout. */
</style>