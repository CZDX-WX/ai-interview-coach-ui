<template>
  <div
      class="user-avatar-container"
      :style="{ width: `${size}px`, height: `${size}px` }"
      :title="username"
  >
    <img
        :src="displayAvatarSrc"
        :alt="`${username} 的头像`"
        class="avatar-image"
        @error="onImageError"
    >
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { API_ROOT_URL } from '@/config'; // <-- 从统一配置中导入 ROOT_URL

const props = withDefaults(defineProps<{
  avatarUrl?: string | null;
  username: string;
  size?: number;
}>(), {
  size: 40,
  username: '用户',
});

const displayAvatarSrc = computed(() => {
  const url = props.avatarUrl;
  if (!url) {
    // 生成默认头像
    const userName = props.username || '用户';
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}&...`;
  }

  // 如果已经是完整的 http/https 链接，则直接使用
  if (url.startsWith('http')) {
    return url;
  }

  // **核心修正点**: 使用 API_ROOT_URL (e.g., http://localhost:9090/interview-agent)
  // 与后端返回的相对路径 (e.g., /api/files/avatars/...) 拼接。
  // 注意：后端返回的路径应以 / 开头，例如 /api/files/...
  return `${API_ROOT_URL}${url}`;
});

// 图片加载失败时的处理
const onImageError = (event: Event) => {
  const imgElement = event.target as HTMLImageElement;
  // 如果头像加载失败，也显示一个默认的生成头像
  const userName = props.username || 'Error';
  imgElement.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&backgroundType=gradientLinear&fontSize=45`;
  console.warn(`图片加载失败: ${props.avatarUrl}`);
};
</script>

<style scoped>
.user-avatar-container {
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0; /* 防止在flex布局中被压缩 */
  background-color: var(--border-color); /* 图片加载时的背景色 */
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 确保图片不变形地填满容器 */
}
</style>