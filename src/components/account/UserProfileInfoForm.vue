<template>
  <section class="settings-section">
    <h2 class="section-title">个人信息</h2>
    <div class="profile-header">
      <div class="avatar-container">
        <img v-if="profileData.avatarUrl" :src="profileData.avatarUrl" alt="用户头像" class="avatar-image">
        <div v-else class="avatar-placeholder">
          <font-awesome-icon :icon="['fas', 'user']" />
        </div>
      </div>
      <div class="profile-summary-text">
        <p class="user-name-display">{{ initialNameDisplay }}</p>
        <p class="user-email-display">{{ initialEmailDisplay }}</p>
      </div>
    </div>

    <div class="form-grid">
      <div class="form-group">
        <label for="fullName">全名</label>
        <input type="text" id="fullName" v-model="editableProfile.name" class="form-input-dark" placeholder="您的全名">
      </div>
      <div class="form-group">
        <label for="email">电子邮箱</label>
        <input type="email" id="email" v-model="editableProfile.email" class="form-input-dark" placeholder="您的电子邮箱">
      </div>
      <div class="form-group">
        <label for="school">学校/大学</label>
        <input type="text" id="school" v-model="editableProfile.school" class="form-input-dark" placeholder="例如：示例大学">
      </div>
      <div class="form-group">
        <label for="major">专业</label>
        <input type="text" id="major" v-model="editableProfile.major" class="form-input-dark" placeholder="例如：计算机科学">
      </div>
      <div class="form-group">
        <label for="graduationYear">毕业年份</label>
        <input type="text" id="graduationYear" v-model="editableProfile.graduationYear" class="form-input-dark" placeholder="例如：2024">
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, watch, toRefs } from 'vue';
import type { User } from '../../stores/auth'; // 假设 User 类型已导出
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

interface ProfileData {
  name?: string;
  email?: string;
  avatarUrl?: string;
  school?: string;
  major?: string;
  graduationYear?: string;
}

const props = defineProps<{
  profileData: Partial<Omit<User, 'resumes' | 'id'>>; // 从父组件接收初始数据
  initialNameDisplay: string; // 用于非编辑状态下显示的名字
  initialEmailDisplay: string; // 用于非编辑状态下显示的邮箱
}>();

const emit = defineEmits<{
  (e: 'update:profileData', value: ProfileData): void;
}>();

// 使用 reactive 来创建本地可编辑副本
const editableProfile = reactive<ProfileData>({ ...props.profileData });

// 监听 props.profileData 的变化，以防外部（例如 store）更新它
watch(() => props.profileData, (newData) => {
  Object.assign(editableProfile, newData);
}, { deep: true, immediate: true });

// 监听本地 editableProfile 的变化，并通过事件通知父组件
watch(editableProfile, (newData) => {
  emit('update:profileData', { ...newData });
}, { deep: true });

</script>

<style scoped>
/* 样式从 AccountSettingsView.vue 迁移和调整 */
.settings-section {
  background-color: var(--card-bg-color);
  padding: 1.5rem 2rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}
.section-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--text-color);
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}
[data-theme="dark"] .section-title { color: #ffffff; }

.profile-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.avatar-container { position: relative; }
.avatar-image, .avatar-placeholder { width: 8rem; height: 8rem; border-radius: 50%; object-fit: cover; border: 3px solid var(--border-color); }
.avatar-placeholder { background-color: var(--border-color); display: flex; align-items: center; justify-content: center; font-size: 3rem; color: var(--text-color); opacity: 0.7; }
[data-theme="dark"] .avatar-placeholder { background-color: #2c3035; color: #ffffff; }

.profile-summary-text .user-name-display { font-size: 1.375rem; font-weight: bold; color: var(--text-color); }
[data-theme="dark"] .profile-summary-text .user-name-display { color: #ffffff; }
.profile-summary-text .user-email-display { font-size: 1rem; color: var(--text-color); opacity: 0.7; }
[data-theme="dark"] .profile-summary-text .user-email-display { color: #a2aab3; }

.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem 1.5rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.form-group label { font-size: 0.9rem; font-weight: 500; color: var(--text-color); }
[data-theme="dark"] .form-group label { color: #ffffff; }

.form-input-dark { /* 这些样式应该已经是全局 .form-input 的一部分，或者专门为暗色主题输入框定义的 */
  width: 100%; padding: 0.875rem 1rem; font-size: 1rem; border-radius: 0.75rem;
  border: 1px solid var(--input-border-color, #40474f);
  background-color: var(--input-bg-color, #1e2124);
  color: var(--text-color); /* text-white for dark theme */
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
[data-theme="dark"] .form-input-dark { border-color: #40474f; background-color: #1e2124; color: #ffffff; }
.form-input-dark::placeholder { color: var(--placeholder-color, #a2aab3); }
[data-theme="dark"] .form-input-dark::placeholder { color: #a2aab3; }
.form-input-dark:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 2px var(--primary-color-translucent); }
</style>