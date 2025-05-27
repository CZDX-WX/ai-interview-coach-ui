<template>
  <button @click="themeStore.toggleTheme" class="theme-toggle-button">
    <span v-if="themeStore.isDarkMode">☀️ Light Mode</span>
    <span v-else>🌙 Dark Mode</span>
  </button>
</template>

<script setup lang="ts">
import { useThemeStore } from '../../stores/theme';
const themeStore = useThemeStore();
</script>

<style scoped>
.theme-toggle-button {
  background-color: transparent;
  color: var(--text-color);
  border: 1px solid var(--text-color);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
  font-size: 0.9em;
}

.theme-toggle-button:hover {
  background-color: var(--text-color);
  color: var(--bg-color);
}
</style>