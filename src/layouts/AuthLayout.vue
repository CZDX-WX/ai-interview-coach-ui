<template>
  <div class="auth-layout">
    <header class="auth-header">
      <div class="logo-container">
        <svg class="logo-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
        </svg>
        <h2 class="logo-text">CareerPrep</h2>
      </div>
      <nav class="auth-nav">
      </nav>
      <div class="header-actions">
        <ThemeToggle />
      </div>
    </header>
    <main class="auth-main-content">
      <slot /> </main>
    <footer class="auth-footer">
      <p>&copy; {{ new Date().getFullYear() }} AI Interview Coach. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import ThemeToggle from '../components/common/ThemeToggle.vue';
// No specific script needed for this layout component usually
</script>

<style scoped>
.auth-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--bg-color); /* Uses global theme */
}

.auth-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 2.5rem; /* Equivalent to py-3 px-10 */
  border-bottom: 1px solid var(--border-color);
  background-color: var(--card-bg-color); /* Slightly different background for header */
  color: var(--text-color);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 1rem; /* Equivalent to gap-4 */
}

.logo-icon {
  width: 1.25rem; /* Equivalent to size-4 (if 1rem = 16px, adjust if base is different) */
  height: 1.25rem;
  color: var(--primary-color); /* Make logo icon use primary color */
}

.logo-text {
  font-size: 1.125rem; /* text-lg */
  font-weight: bold;
  line-height: 1.375; /* leading-tight */
  letter-spacing: -0.015em;
}

.auth-nav {
  display: flex;
  gap: 2.25rem; /* gap-9 */
}

.auth-nav a {
  font-size: 0.875rem; /* text-sm */
  font-weight: 500; /* font-medium */
  color: var(--text-color);
  text-decoration: none;
}
.auth-nav a:hover {
  color: var(--primary-color);
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}


.auth-main-content {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start; /* Align items to top */
  padding: 1.25rem 0; /* py-5, px-40 is too much for just vertical padding for the content area */
  margin-top: 2rem; /* Add some space from header */
}

.auth-footer {
  text-align: center;
  padding: 1.5rem;
  font-size: 0.875em;
  color: var(--text-color);
  border-top: 1px solid var(--border-color);
  background-color: var(--card-bg-color);
}
</style>