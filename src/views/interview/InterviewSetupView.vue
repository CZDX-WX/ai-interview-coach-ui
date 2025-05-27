<template>
  <div class="interview-setup-view">
    <div class="breadcrumbs">
      <router-link to="/practice" class="breadcrumb-link">Practice</router-link>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-current">New Interview Setup</span>
    </div>

    <h1 class="page-title">Select Your Interview Scenario</h1>
    <p class="page-subtitle">Configure the details for your mock interview session.</p>

    <div class="setup-steps-container">
      <section class="setup-step">
        <h2 class="step-title">
          <font-awesome-icon :icon="['fas', 'briefcase']" class="step-icon" />
          Choose Job Field
        </h2>
        <div class="tag-selection-group">
          <button
              v-for="field in setupStore.availableJobFields"
              :key="field.value"
              :class="['tag-button', { active: setupStore.selectedJobField === field.value }]"
              @click="setupStore.setJobField(field.value)"
          >
            {{ field.label }}
          </button>
        </div>
      </section>

      <section class="setup-step">
        <h2 class="step-title">
          <font-awesome-icon :icon="['fas', 'layer-group']" class="step-icon" />
          Choose Experience Level
        </h2>
        <div class="tag-selection-group">
          <button
              v-for="level in setupStore.availableExperienceLevels"
              :key="level.value"
              :class="['tag-button', { active: setupStore.selectedExperienceLevel === level.value }]"
              @click="setupStore.setExperienceLevel(level.value)"
          >
            {{ level.label }}
          </button>
        </div>
      </section>

      <section class="setup-step">
        <h2 class="step-title">
          <font-awesome-icon :icon="['fas', 'file-alt']" class="step-icon" />
          (Optional) Select or Upload Your Resume
        </h2>
        <p class="step-description">Using a resume helps tailor the interview and feedback.</p>
        <div class="form-group">
          <label for="resume-selection">Your Resumes</label>
          <select id="resume-selection" v-model="selectedResumeOption" @change="handleResumeSelectionChange" class="form-input select-input">
            <option :value="null">No resume / Skip this step</option>
            <option v-for="resume in setupStore.userResumes" :key="resume.id" :value="resume.id">
              {{ resume.name }} (Uploaded: {{ resume.uploadDate }})
            </option>
            <option value="upload_new">Upload a new resume...</option>
          </select>
        </div>
        <div v-if="showFileUpload" class="file-upload-area">
          <input type="file" id="resume-upload-input" @change="handleFileChange" accept=".pdf,.doc,.docx" ref="fileInputRef" class="file-input-hidden" />
          <label for="resume-upload-input" class="file-upload-label">
            <font-awesome-icon :icon="['fas', 'upload']" class="upload-icon" />
            <span v-if="!setupStore.selectedResume?.file">Drag & drop or click to upload (PDF, DOC, DOCX)</span>
            <span v-else>File selected: {{ setupStore.selectedResume.name }}</span>
          </label>
        </div>
        <div v-if="setupStore.selectedResume && setupStore.selectedResume.id && !showFileUpload" class="selected-resume-info">
          Selected: <strong>{{ setupStore.selectedResume.name }}</strong>
        </div>
      </section>

      <section class="setup-step">
        <h2 class="step-title">
          <font-awesome-icon :icon="['fas', 'tasks']" class="step-icon" />
          Choose Interview Phases
        </h2>
        <p class="step-description">Select the stages you want to include in this mock interview.</p>
        <div class="phase-selection-group">
          <label v-for="phase in setupStore.availablePhases" :key="phase.id" class="checkbox-label">
            <input
                type="checkbox"
                :checked="setupStore.isPhaseSelected(phase.id)"
                @change="setupStore.togglePhase(phase.id)"
                class="form-checkbox"
            />
            <div class="checkbox-custom-display">
              <font-awesome-icon :icon="['fas', 'check']" class="checkmark-icon" />
            </div>
            <div class="phase-details">
              <span class="phase-name">{{ phase.name }}</span>
              <span v-if="phase.description" class="phase-desc-small">{{ phase.description }}</span>
            </div>
          </label>
        </div>
      </section>

      <section class="setup-step review-step">
        <h2 class="step-title">
          <font-awesome-icon :icon="['fas', 'check-circle']" class="step-icon" />
          Review & Start
        </h2>
        <div class="review-summary" v-if="setupStore.selectedJobField && setupStore.selectedExperienceLevel && setupStore.selectedPhaseIds.length > 0">
          <p><strong>Job Field:</strong> {{ setupStore.getJobFieldLabel }}</p>
          <p><strong>Experience Level:</strong> {{ setupStore.getExperienceLevelLabel }}</p>
          <p v-if="setupStore.selectedResume?.name && setupStore.selectedResume.name !== 'New Upload Pending'">
            <strong>Resume:</strong> {{ setupStore.selectedResume.name }}
          </p>
          <p v-else-if="!setupStore.selectedResume"><strong>Resume:</strong> None selected</p>
          <p><strong>Selected Phases:</strong></p>
          <ul>
            <li v-for="phaseId in setupStore.selectedPhaseIds" :key="phaseId">
              {{ setupStore.availablePhases.find(p => p.id === phaseId)?.name }}
            </li>
          </ul>
        </div>
        <p v-else class="step-description">Please complete all required selections above to see a summary.</p>

        <button @click="proceedToDeviceCheck" class="form-button proceed-button" :disabled="!setupStore.selectedJobField || !setupStore.selectedExperienceLevel || setupStore.selectedPhaseIds.length === 0">
          <font-awesome-icon :icon="['fas', 'video']" /> Proceed to Device Check
        </button>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useInterviewSetupStore } from '../../stores/interviewSetup';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const router = useRouter();
const setupStore = useInterviewSetupStore();

const selectedResumeOption = ref<string | null>(null);
const showFileUpload = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

// Initialize selectedResumeOption based on store state when component mounts
onMounted(() => {
  if (setupStore.selectedResume) {
    if (setupStore.selectedResume.file) { // Was a new upload
      selectedResumeOption.value = 'upload_new';
      showFileUpload.value = true;
    } else if (setupStore.selectedResume.id) { // Was an existing resume
      selectedResumeOption.value = setupStore.selectedResume.id;
      showFileUpload.value = false;
    } else { // Was "No resume" or an incomplete new upload selection
      selectedResumeOption.value = null;
    }
  } else {
    selectedResumeOption.value = null;
  }
});


watch(selectedResumeOption, (newVal) => {
  if (newVal === 'upload_new') {
    showFileUpload.value = true;
    if (!setupStore.selectedResume?.file) { // if it's not already a file selection
      setupStore.selectedResume = { name: 'New Upload Pending' };
    }
  } else {
    showFileUpload.value = false;
  }
});

const handleResumeSelectionChange = () => {
  setupStore.setSelectedResumeById(selectedResumeOption.value);
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload PDF, DOC, or DOCX.');
      target.value = ''; return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('File is too large. Maximum size is 5MB.');
      target.value = ''; return;
    }
    setupStore.setUploadedResumeFile(file);
  }
};

const proceedToDeviceCheck = () => {
  if (!setupStore.selectedJobField || !setupStore.selectedExperienceLevel || setupStore.selectedPhaseIds.length === 0) {
    alert('Please select a job field, experience level, and at least one interview phase.');
    return;
  }
  router.push({ name: 'DeviceCheck' });
};
</script>

<style scoped>
/* Using dark theme variables for this page as per prototype */
.interview-setup-view {
  padding: 1.5rem 2rem; /* Adjusted padding */
  max-width: 960px; /* max-w-[960px] */
  margin: 0 auto;
  color: var(--text-color); /* This will be light on dark theme */
}
.dark-theme-override .interview-setup-view { /* Example if forcing dark, but theme store handles this */
  /* --bg-color: #111418; */
  /* --text-color: #e0e0e0; */
  /* --card-bg-color: #1e2329; */
  /* --border-color: #293038; */
}

.breadcrumbs {
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: var(--text-color); /* Should be light grey on dark theme */
  opacity: 0.7;
}
.breadcrumb-link {
  color: var(--text-color); /* Should be light grey */
  text-decoration: none;
}
.breadcrumb-link:hover {
  color: var(--primary-color);
}
.breadcrumb-separator {
  margin: 0 0.5rem;
}
.breadcrumb-current {
  font-weight: 500;
  color: var(--text-color); /* White in prototype */
  opacity: 1;
}
[data-theme="dark"] .breadcrumb-current {
  color: #ffffff;
}


.page-title {
  font-size: 2rem; /* text-[32px] */
  font-weight: 700; /* font-bold */
  color: var(--text-color); /* text-white in prototype */
  margin-bottom: 0.5rem;
}
[data-theme="dark"] .page-title {
  color: #ffffff;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--text-color); /* text-gray-400 or similar for dark theme */
  opacity: 0.8;
  margin-bottom: 2.5rem;
}

.setup-steps-container {
  display: flex;
  flex-direction: column;
  gap: 2rem; /* Spacing between step sections */
}

.setup-step {
  background-color: var(--card-bg-color); /* Darker card for dark theme */
  padding: 1.5rem; /* p-4 */
  border-radius: 8px;
  border: 1px solid var(--border-color); /* border-[#293038] */
}

.step-title {
  font-size: 1.25rem; /* text-lg font-bold */
  font-weight: bold;
  color: var(--text-color); /* text-white */
  margin-bottom: 1rem; /* pb-2 pt-4 combined */
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
[data-theme="dark"] .step-title {
  color: #ffffff;
}
.step-icon {
  color: var(--primary-color);
  font-size: 1.1em;
}
.step-description {
  font-size: 0.875rem; /* text-sm */
  color: var(--text-color); /* text-gray-400 for dark theme */
  opacity: 0.7;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.tag-selection-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem; /* gap-3 p-3 */
}

.tag-button {
  padding: 0.5rem 1rem; /* h-8 pl-4 pr-4 */
  font-size: 0.875rem; /* text-sm */
  font-weight: 500; /* font-medium */
  border-radius: 9999px; /* rounded-full */
  background-color: var(--border-color); /* bg-[#293038] */
  color: var(--text-color); /* text-white */
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}
[data-theme="dark"] .tag-button {
  background-color: #293038;
  color: #ffffff;
}

.tag-button:hover {
  background-color: color-mix(in srgb, var(--primary-color) 20%, var(--border-color) 80%);
}
.tag-button.active {
  background-color: var(--primary-color);
  color: white; /* Or a contrasting color if primary is light */
  font-weight: bold;
  border: 1px solid var(--primary-color);
}
[data-theme="dark"] .tag-button.active {
  color: #ffffff; /* Ensure contrast on dark theme primary */
}


/* Resume selection uses existing .form-group, .form-input.select-input */
/* File upload uses existing .file-upload-area, .file-upload-label */
.form-input.select-input {
  padding: 0.875rem 1rem;
  background-image: var(--select-button-svg);
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1.25em;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
}
.file-upload-area { margin-top: 1rem; }
.file-input-hidden { width: 0.1px; height: 0.1px; opacity: 0; overflow: hidden; position: absolute; z-index: -1;}
.file-upload-label { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem 1rem; border: 2px dashed var(--border-color); border-radius: 8px; cursor: pointer; transition: border-color 0.2s ease, background-color 0.2s ease; text-align: center; font-size: 0.9rem; opacity: 0.9;}
.file-upload-label:hover { border-color: var(--primary-color); background-color: color-mix(in srgb, var(--primary-color) 5%, transparent); }
.upload-icon { font-size: 2rem; color: var(--primary-color); margin-bottom: 0.75rem; }
.selected-resume-info { margin-top: 1rem; padding: 0.75rem 1rem; background-color: color-mix(in srgb, var(--primary-color) 10%, transparent); border: 1px solid color-mix(in srgb, var(--primary-color) 30%, transparent); border-radius: 6px; font-size: 0.9rem; }
.selected-resume-info strong { font-weight: 600; color: var(--primary-color); }


.phase-selection-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}
.checkbox-label {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color); /* border-[#3c4753] */
  border-radius: 6px;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
  background-color: var(--bg-color); /* Slightly lighter than card for distinction */
}
.checkbox-label:hover {
  border-color: var(--primary-color);
}
.checkbox-label input[type="checkbox"]:checked + .checkbox-custom-display {
  background-color: var(--primary-color); /* bg-[#1978e5] */
  border-color: var(--primary-color);
}
.checkbox-label input[type="checkbox"]:checked + .checkbox-custom-display .checkmark-icon {
  opacity: 1;
}
.form-checkbox { /* Hide the default checkbox */
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}
.checkbox-custom-display {
  width: 20px; /* h-5 w-5 */
  height: 20px;
  border: 2px solid var(--border-color); /* border-[#3c4753] */
  border-radius: 4px; /* rounded */
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem; /* gap-x-3 */
  transition: background-color 0.2s ease, border-color 0.2s ease;
  background-color: var(--bg-color);
}
.checkmark-icon {
  font-size: 0.8em;
  color: white; /* Tick color */
  opacity: 0; /* Hidden by default */
  transition: opacity 0.2s ease;
}
.phase-details {
  display: flex;
  flex-direction: column;
}
.phase-name {
  font-size: 0.9rem; /* text-base */
  font-weight: 500;
  color: var(--text-color); /* text-white */
}
[data-theme="dark"] .phase-name {
  color: #ffffff;
}
.phase-desc-small {
  font-size: 0.75rem;
  opacity: 0.7;
}


.review-step { text-align: center; }
.review-summary { background-color: var(--bg-color); padding: 1.5rem; border-radius: 6px; border: 1px solid var(--border-color); margin-bottom: 1.5rem; text-align: left; font-size: 0.95rem; line-height: 1.6;}
.review-summary p { margin-bottom: 0.5rem; }
.review-summary strong { font-weight: 600; color: var(--primary-color); }
.review-summary ul { list-style-position: inside; padding-left: 0.5rem; margin-top: 0.5rem; }
.review-summary ul li { margin-bottom: 0.25rem; }


.proceed-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.75rem;
  padding: 0.625rem 1.5rem; /* h-10 px-4 */
  font-size: 0.9rem; font-weight: bold;
  background-color: var(--primary-color); /* bg-[#1978e5] */
  color: white; /* text-white */
  border: none; border-radius: 9999px; /* rounded-full */
  cursor: pointer; transition: background-color 0.2s ease;
  letter-spacing: 0.015em;
  margin-top: 1rem;
}
.proceed-button:hover { opacity: 0.9; }
.proceed-button:disabled { background-color: #555; opacity: 0.7; cursor: not-allowed; }
.proceed-button .fa-icon { font-size: 1em; }

</style>