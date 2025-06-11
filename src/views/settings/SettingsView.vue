<template>
  <div class="settings-view">
    <h1 class="page-title">
      <font-awesome-icon :icon="['fas', 'cog']" class="title-icon"/> Settings
    </h1>

    <form @submit.prevent="handleSaveChanges" class="settings-form">
      <section class="settings-section">
        <h2 class="section-title">Appearance</h2>
        <div class="form-group">
          <label>Theme Preference</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" name="theme" value="light" v-model="currentPreferences.selectedThemeOption" @change="applyThemeChange">
              <span class="radio-custom"></span> Light
            </label>
            <label class="radio-label">
              <input type="radio" name="theme" value="dark" v-model="currentPreferences.selectedThemeOption" @change="applyThemeChange">
              <span class="radio-custom"></span> Dark
            </label>
            <label class="radio-label">
              <input type="radio" name="theme" value="system" v-model="currentPreferences.selectedThemeOption" @change="applyThemeChange">
              <span class="radio-custom"></span> Use System Preference
            </label>
          </div>
        </div>
      </section>

      <section class="settings-section">
        <h2 class="section-title">Notification Preferences</h2>
        <div class="form-group">
          <label class="switch-label">
            <span class="switch-text">Email me when my interview report is ready</span>
            <div class="switch-control">
              <input type="checkbox" id="notif-report-email" v-model="currentPreferences.notifications.reportReadyEmail" @change="preferencesStore.updateNotificationPreference('reportReadyEmail', currentPreferences.notifications.reportReadyEmail)">
              <label for="notif-report-email" class="slider"></label>
            </div>
          </label>
        </div>
        <div class="form-group">
          <label class="switch-label">
            <span class="switch-text">In-app notification for new reports</span>
            <div class="switch-control">
              <input type="checkbox" id="notif-report-app" v-model="currentPreferences.notifications.reportReadyApp" @change="preferencesStore.updateNotificationPreference('reportReadyApp', currentPreferences.notifications.reportReadyApp)">
              <label for="notif-report-app" class="slider"></label>
            </div>
          </label>
        </div>
        <div class="form-group">
          <label class="switch-label">
            <span class="switch-text">In-app notification for system updates & new features</span>
            <div class="switch-control">
              <input type="checkbox" id="notif-system-app" v-model="currentPreferences.notifications.systemUpdatesApp" @change="preferencesStore.updateNotificationPreference('systemUpdatesApp', currentPreferences.notifications.systemUpdatesApp)">
              <label for="notif-system-app" class="slider"></label>
            </div>
          </label>
        </div>
        <div class="form-group">
          <label class="switch-label">
            <span class="switch-text">In-app notification for recommended learning resources</span>
            <div class="switch-control">
              <input type="checkbox" id="notif-resources-app" v-model="currentPreferences.notifications.newResourceRecommendationsApp" @change="preferencesStore.updateNotificationPreference('newResourceRecommendationsApp', currentPreferences.notifications.newResourceRecommendationsApp)">
              <label for="notif-resources-app" class="slider"></label>
            </div>
          </label>
        </div>
      </section>

      <section class="settings-section">
        <h2 class="section-title">Data & Privacy</h2>
        <div class="form-group">
          <label class="switch-label">
            <span class="switch-text">Allow anonymized data usage for AI model improvement</span>
            <div class="switch-control">
              <input type="checkbox" id="data-usage-ai" v-model="currentPreferences.allowDataUsageForAI" @change="preferencesStore.setAllowDataUsageForAI(currentPreferences.allowDataUsageForAI)">
              <label for="data-usage-ai" class="slider"></label>
            </div>
          </label>
          <p class="setting-description">Help us improve our AI by allowing us to use your anonymized interview data. We respect your privacy.</p>
        </div>
        <div class="form-group">
          <button type="button" @click="confirmAccountDeletion" class="form-button danger-button">
            <font-awesome-icon :icon="['fas', 'trash-alt']" /> Delete My Account
          </button>
          <p class="setting-description">This action is irreversible and will permanently delete all your data associated with this account.</p>
        </div>
      </section>

      <p v-if="statusMessage" class="status-message" :class="isError ? 'error' : 'success'">{{ statusMessage }}</p>
    </form>

    <Teleport to="body">
      <div v-if="showDeleteConfirmationModal" class="modal-overlay" @click.self="showDeleteConfirmationModal = false">
        <div class="modal-content">
          <h3>Confirm Account Deletion</h3>
          <p>Are you absolutely sure you want to delete your account? This will permanently erase all your interview data, reports, and personal information. This action cannot be undone.</p>
          <div class="modal-actions">
            <button @click="showDeleteConfirmationModal = false" class="form-button secondary-button">Cancel</button>
            <button @click="handleAccountDeletion" class="form-button danger-button">Yes, Delete My Account</button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { useUserPreferencesStore} from '@/stores/preferencesStore';
import type {UserPreferences, NotificationPreferences } from '@/stores/preferencesStore';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const preferencesStore = useUserPreferencesStore();
const authStore = useAuthStore();
const router = useRouter();

// Use reactive for the form data to allow direct v-model binding that updates the store on @change
// Make a copy to avoid direct mutation before explicit save or if an action handles it.
// Since store actions update immediately on @change, we can directly bind to store state.
// However, it's often cleaner to have a local copy for a form and then a "save" action.
// For this example, actions save immediately on @change for toggles.
const currentPreferences = reactive<UserPreferences>(JSON.parse(JSON.stringify(preferencesStore.$state)));

const statusMessage = ref('');
const isError = ref(false);
const showDeleteConfirmationModal = ref(false);


// Sync local reactive copy if store changes externally (e.g. on load)
watch(() => preferencesStore.$state, (newState) => {
  Object.assign(currentPreferences, JSON.parse(JSON.stringify(newState)));
}, { deep: true });

const applyThemeChange = () => {
  preferencesStore.setThemeOption(currentPreferences.selectedThemeOption);
  statusMessage.value = 'Theme preference updated.';
  isError.value = false;
  setTimeout(() => statusMessage.value = '', 3000);
};

const confirmAccountDeletion = () => {
  showDeleteConfirmationModal.value = true;
};

const handleAccountDeletion = async () => {
  showDeleteConfirmationModal.value = false;
  statusMessage.value = 'Processing account deletion...';
  isError.value = false;
  const success = await preferencesStore.requestAccountDeletion();
  if (success) {
    // In a real app, user would be logged out by the store action.
    authStore.logout(); // Ensure logout
    router.push({ name: 'Login' }); // Redirect to login
  } else {
    statusMessage.value = 'Account deletion failed. Please try again or contact support.';
    isError.value = true;
  }
};


const handleSaveChanges = () => {
  preferencesStore.setThemeOption(currentPreferences.selectedThemeOption);
  Object.keys(currentPreferences.notifications).forEach(key => {
    preferencesStore.updateNotificationPreference(
        key as keyof NotificationPreferences,
        currentPreferences.notifications[key as keyof NotificationPreferences]
    );
  });
  preferencesStore.setAllowDataUsageForAI(currentPreferences.allowDataUsageForAI);
  statusMessage.value = 'Settings saved successfully!';
  isError.value = false;
  setTimeout(() => statusMessage.value = '', 3000);
};

onMounted(() => {
  // Ensure local state `currentPreferences` is synced with the store's initial state
  Object.assign(currentPreferences, JSON.parse(JSON.stringify(preferencesStore.$state)));
});

</script>

<style scoped>
.settings-view {
  padding: 1.5rem 2rem;
  max-width: 900px;
  margin: 0 auto;
  color: var(--text-color);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
[data-theme="dark"] .page-title { color: #ffffff; }
.page-title .title-icon { color: var(--primary-color); }

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.settings-section {
  background-color: var(--card-bg-color);
  padding: 1.5rem 2rem; /* More padding */
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.section-title {
  font-size: 1.35rem; /* Slightly larger */
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}
[data-theme="dark"] .section-title { color: #ffffff; }

.form-group {
  margin-bottom: 1.5rem; /* Space between settings within a section */
}
.form-group:last-child {
  margin-bottom: 0;
}

.form-group > label:not(.switch-label):not(.radio-label) { /* Label for a group of radios/switches */
  display: block;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-color);
  margin-bottom: 0.75rem;
}
[data-theme="dark"] .form-group > label:not(.switch-label):not(.radio-label) {
  color: #ffffff;
}


.radio-group {
  display: flex;
  flex-direction: column; /* Stack radios */
  gap: 0.75rem;
}
.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.95rem;
  color: var(--text-color);
}
.radio-label input[type="radio"] {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}
.radio-custom {
  width: 20px;
  height: 20px;
  border: 2px solid var(--input-border-color, #adb5bd);
  border-radius: 50%;
  margin-right: 0.75rem;
  display: inline-block;
  position: relative;
  transition: border-color 0.2s ease;
}
.radio-label:hover .radio-custom {
  border-color: var(--primary-color);
}
.radio-label input[type="radio"]:checked + .radio-custom {
  border-color: var(--primary-color);
}
.radio-label input[type="radio"]:checked + .radio-custom::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background-color: var(--primary-color);
  border-radius: 50%;
}

.switch-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
  color: var(--text-color);
  padding: 0.5rem 0; /* Add some padding for better touch targets if needed */
}
.switch-text {
  margin-right: 1rem;
  flex-grow: 1;
}
.switch-control {
  position: relative;
  display: inline-block;
  width: 44px; /* Width of the switch */
  height: 24px; /* Height of the switch */
  flex-shrink: 0;
}
.switch-control input[type="checkbox"] {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-color); /* bg-[#ccc] */
  transition: .4s;
  border-radius: 24px; /* height */
}
[data-theme="dark"] .slider {
  background-color: #2c3035; /* Darker inactive switch */
}
.slider:before {
  position: absolute;
  content: "";
  height: 18px; /* Size of the knob */
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}
.switch-control input:checked + .slider {
  background-color: var(--primary-color);
}
.switch-control input:focus + .slider {
  box-shadow: 0 0 1px var(--primary-color);
}
.switch-control input:checked + .slider:before {
  transform: translateX(20px); /* (width of switch - knob width - 2*offset) */
}

.setting-description {
  font-size: 0.85rem;
  color: var(--text-color);
  opacity: 0.7;
  margin-top: 0.5rem;
  padding-left: 0.25rem; /* Align with general text if switch has padding */
}
[data-theme="dark"] .setting-description {
  color: #a2aab3;
}


.danger-button {
  background-color: #dc3545; /* Red for danger */
  color: white;
  border-color: #dc3545;
  width: auto; /* Don't make it full width like other form buttons */
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.danger-button:hover {
  background-color: #c82333;
  border-color: #bd2130;
}
[data-theme="dark"] .danger-button {
  background-color: #e53e3e;
  border-color: #e53e3e;
}
[data-theme="dark"] .danger-button:hover {
  background-color: #c53030;
  border-color: #b72b2b;
}


.form-actions { display: flex; justify-content: flex-end; margin-top: 1.5rem; }
.save-settings-button { /* Uses .form-button */
  display: inline-flex; align-items: center; justify-content: center; gap: 0.6rem;
  padding: 0.625rem 1.5rem;
}

.status-message { /* Copied from AccountSettingsView */
  margin-top: 1rem; padding: 0.75rem 1rem; border-radius: 6px; font-size: 0.9rem; text-align: center;
}
.status-message.success { background-color: color-mix(in srgb, var(--primary-color) 15%, transparent); color: var(--primary-color); border: 1px solid var(--primary-color); }
.status-message.error { background-color: #ffe3e3; color: #c00; border: 1px solid #ffb3b3; }
[data-theme="dark"] .status-message.success { background-color: color-mix(in srgb, var(--primary-color) 20%, var(--bg-color) 80%); color: color-mix(in srgb, var(--primary-color) 90%, white 10%); border-color: var(--primary-color); }
[data-theme="dark"] .status-message.error { background-color: #4d1f1f; color: #ffcccc; border-color: #8b3333; }
.loading-state { text-align: center; padding: 2rem; font-size: 1.1rem; opacity: 0.8;}


/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050; /* Above header */
}
.modal-content {
  background-color: var(--card-bg-color);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  width: 90%;
  max-width: 500px;
  color: var(--text-color);
}
.modal-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin-top: 0;
  margin-bottom: 1rem;
}
[data-theme="dark"] .modal-content h3 {
  color: #ffffff;
}
.modal-content p {
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
.modal-actions .form-button { /* For buttons inside modal */
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
}
.modal-actions .secondary-button {
  background-color: var(--bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}
.modal-actions .secondary-button:hover {
  background-color: var(--border-color);
}

</style>