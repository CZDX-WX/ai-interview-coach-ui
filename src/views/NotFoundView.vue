<template>
  <div class="not-found-view">
    <div class="content">
      <h1 class="status-code">404</h1>
      <p class="message-title">页面未找到</p>
      <p class="message-details">
        抱歉，您访问的页面不存在、已被移除或输入了错误的地址。
      </p>
      <router-link to="/" class="home-link-button">返回首页</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// No specific script logic needed for a simple 404 page
</script>

<style scoped>
.not-found-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--header-height, 80px) - 2rem); /* Full viewport height minus header and padding */
  text-align: center;
  padding: 2rem;
  background-color: var(--bg-color);
  color: var(--text-color);
}

.content {
  max-width: 500px;
}

.status-code {
  font-size: 6rem; /* Large 404 text */
  font-weight: 700;
  color: var(--primary-color);
  margin: 0 0 1rem 0;
  line-height: 1;
}

.message-title {
  font-size: 2rem; /* Large "Page Not Found" */
  font-weight: 500;
  margin: 0 0 0.8rem 0;
  color: var(--text-color);
}

.message-details {
  font-size: 1rem;
  color: var(--text-secondary-color, #666);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.home-link-button {
  display: inline-block;
  padding: 0.8rem 1.8rem;
  font-size: 1rem;
  font-weight: 500;
  color: white;
  background-color: var(--primary-color);
  border-radius: 25px; /* Pill shape */
  text-decoration: none;
  transition: background-color 0.2s ease, transform 0.2s ease;
}
html.dark-theme .home-link-button {
  color: var(--bg-color); /* Ensure contrast in dark mode */
}

.home-link-button:hover {
  background-color: var(--secondary-color); /* Darken on hover */
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
</style>