<template>
  <section class="settings-section">
    <h2 class="section-title">个人信息</h2>
    <div class="profile-header">
      <div class="avatar-container">
        <img v-if="editableProfile.avatarUrl" :src="editableProfile.avatarUrl" alt="用户头像" class="avatar-image">
        <div v-else class="avatar-placeholder">
          <font-awesome-icon :icon="['fas', 'user']" />
        </div>
      </div>
      <div class="profile-summary-text">
        <p class="user-name-display">{{ initialNameDisplay || '未设置姓名' }}</p>
        <p class="user-email-display">{{ initialEmailDisplay }}</p>
      </div>
    </div>

    <div class="form-grid">
      <div class="form-group">
        <label for="fullName">全名 / 昵称</label>
        <input type="text" id="fullName" v-model="editableProfile.fullName" class="form-input-dark" placeholder="您的全名或昵称">
      </div>
      <div class="form-group">
        <label for="email">电子邮箱</label>
        <input type="email" id="email" v-model="editableProfile.email" class="form-input-dark" placeholder="您的电子邮箱">
      </div>
      <div class="form-group">
        <label for="school">学校 / 大学</label>
        <input type="text" id="school" v-model="editableProfile.school" class="form-input-dark" placeholder="例如：模拟大学">
      </div>
      <div class="form-group">
        <label for="major">专业</label>
        <input type="text" id="major" v-model="editableProfile.major" class="form-input-dark" placeholder="例如：计算机科学与技术">
      </div>
      <div class="form-group">
        <label for="graduationYear">毕业年份</label>
        <input type="text" id="graduationYear" v-model="editableProfile.graduationYear" class="form-input-dark" placeholder="例如：2025">
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { User } from '@/types/userTypes'; // 确保 User 类型已更新为使用 fullName
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// 定义 props 接收的数据结构
interface ProfileData {
  fullName?: string;
  email?: string;
  avatarUrl?: string;
  school?: string;
  major?: string;
  graduationYear?: string;
}

const props = defineProps<{
  profileData: ProfileData; // 从父组件接收初始数据
  initialNameDisplay: string; // 用于非编辑状态下显示的名字
  initialEmailDisplay: string; // 用于非编辑状态下显示的邮箱
}>();

const emit = defineEmits<{
  (e: 'update:profileData', value: ProfileData): void;
}>();

// 使用 reactive 创建本地可编辑副本，以避免直接修改 props
const editableProfile = reactive<ProfileData>({
  fullName: '',
  email: '',
  avatarUrl: '',
  school: '',
  major: '',
  graduationYear: ''
});

// 使用 watch 监听从父组件传递过来的 props.profileData 的变化
// 这确保了当父组件的数据源（如 Pinia store）更新时，子组件的表单能够同步
watch(() => props.profileData, (newData) => {
  // 使用 Object.assign 来更新本地的 reactive 对象
  Object.assign(editableProfile, newData);
}, { deep: true, immediate: true }); // immediate: true 确保组件加载时立即执行一次

// 监听本地 editableProfile 的变化，并通过事件通知父组件
// 这实现了 v-model 的效果，让父组件可以获取到表单的最新值
watch(editableProfile, (newData) => {
  emit('update:profileData', { ...newData });
}, { deep: true });
</script>