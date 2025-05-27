<template>
  <div class="default-layout">
    <header class="app-header">
      <div class="header-left">
        <router-link to="/" class="logo-link">
          <svg class="logo-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path></svg>
          <h2 class="logo-text">CareerPrep</h2>
        </router-link>
      </div>

      <nav class="app-nav-center">
        <router-link to="/" class="nav-link">
          Dashboard
        </router-link>
        <router-link to="/practice" class="nav-link">
          Practice
        </router-link>
        <router-link to="/history" class="nav-link">
          History
        </router-link>
        <router-link to="/learn" class="nav-link">
          Learn
        </router-link>
      </nav>

      <div class="header-right">
        <button class="icon-button notification-button" aria-label="Notifications">
          <font-awesome-icon :icon="['fas', 'bell']" />
        </button>
        <div class="user-menu-container">
          <button @click="toggleUserMenu" class="user-avatar-button" aria-label="User Menu">
            <div class="user-avatar-placeholder">
              <span v-if="authStore.currentUser?.name">{{ authStore.currentUser.name.charAt(0).toUpperCase() }}</span>
              <font-awesome-icon :icon="['fas', 'user']" v-else />
            </div>
          </button>
          <div v-if="showUserMenu" class="user-dropdown-menu">
            <div class="user-info">
              <strong>{{ authStore.currentUser?.name || 'User' }}</strong>
              <small>{{ authStore.currentUser?.email }}</small>
            </div>
            <router-link to="/profile" class="dropdown-item">
              <font-awesome-icon :icon="['fas', 'user-circle']" /> Profile
            </router-link>
            <router-link to="/settings" class="dropdown-item">
              <font-awesome-icon :icon="['fas', 'cog']" /> Settings
            </router-link>
            <hr class="dropdown-divider">
            <button @click="handleLogout" class="dropdown-item logout">
              <font-awesome-icon :icon="['fas', 'sign-out-alt']" /> Logout
            </button>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>

    <main class="app-main-content-wrapper">
      <slot /> </main>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ThemeToggle from '../components/common/ThemeToggle.vue';
import { useAuthStore } from '../stores/auth';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
// For v-on-click-outside, you might need a library like `vue-click-outside` or a custom directive
// Example with a simple custom directive (add this to your main.ts or a plugins file)
// const vOnClickOutside = {
//   mounted(el, binding) {
//     el.__vueClickOutside__ = event => {
//       if (!(el == event.target || el.contains(event.target))) {
//         binding.value(event);
//       }
//     };
//     document.body.addEventListener('click', el.__vueClickOutside__);
//   },
//   unmounted(el) {
//     document.body.removeEventListener('click', el.__vueClickOutside__);
//   },
// };
// Then in main.ts: app.directive('on-click-outside', vOnClickOutside);
// For simplicity, I'm assuming you have a way to handle this. If not, the menu won't auto-close on outside click.

const authStore = useAuthStore();
const router = useRouter();
const showUserMenu = ref(false);

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};
const closeUserMenu = () => { // To be called by v-on-click-outside or when a menu item is clicked
  showUserMenu.value = false;
};

const handleLogout = () => {
  closeUserMenu();
  authStore.logout();
  router.push({ name: 'Login' });
};
</script>

<style scoped>
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--bg-color);
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 2rem; /* Consistent padding */
  border-bottom: 1px solid var(--border-color);
  background-color: var(--card-bg-color);
  color: var(--text-color);
  flex-shrink: 0;
  position: sticky; /* Make header sticky */
  top: 0;
  z-index: 1000; /* Ensure it's above other content */
}

.header-left .logo-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--text-color);
}

.logo-icon {
  width: 1.5rem; /* Adjusted size */
  height: 1.5rem;
  color: var(--primary-color);
}

.logo-text {
  font-size: 1.25rem; /* Adjusted size */
  font-weight: bold;
}

.app-nav-center {
  display: flex;
  gap: 1.5rem; /* Adjust gap as needed */
}

.app-nav-center .nav-link {
  font-weight: 500;
  color: var(--text-color);
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem; /* Rounded hover effect */
  transition: background-color 0.2s ease, color 0.2s ease;
}

.app-nav-center .nav-link .fa-icon { /* Target FontAwesome icons if you use them */
  margin-right: 0.5em;
}

.app-nav-center .nav-link:hover {
  background-color: color-mix(in srgb, var(--primary-color) 10%, transparent);
  color: var(--primary-color);
}

.app-nav-center .nav-link.router-link-exact-active {
  color: var(--primary-color);
  background-color: color-mix(in srgb, var(--primary-color) 15%, transparent);
  font-weight: bold;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem; /* Gap between items in right header */
}

.icon-button {
  background: none;
  border: none;
  color: var(--text-color);
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}
.icon-button:hover {
  background-color: var(--border-color);
}
.icon-button .fa-icon, .icon-button svg { /* Target FontAwesome or direct SVG */
  font-size: 1.25rem; /* Adjust icon size */
}


.user-menu-container {
  position: relative;
}
.user-avatar-button {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.user-avatar-placeholder {
  width: 2.25rem; /* size-9 */
  height: 2.25rem;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  border: 2px solid var(--card-bg-color); /* To make it pop a bit */
  box-shadow: 0 0 0 1px var(--border-color);
}
.user-avatar-placeholder .fa-icon {
  font-size: 1rem;
}


.user-dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background-color: var(--card-bg-color);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 1010;
  width: 220px;
  padding: 0.5rem 0;
}
.user-dropdown-menu .user-info {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 0.5rem;
}
.user-dropdown-menu .user-info strong {
  display: block;
  font-size: 0.9rem;
}
.user-dropdown-menu .user-info small {
  display: block;
  font-size: 0.75rem;
  opacity: 0.7;
}

.user-dropdown-menu .dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
  font-size: 0.875rem;
  color: var(--text-color);
  text-decoration: none;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
}
.user-dropdown-menu .dropdown-item:hover {
  background-color: var(--border-color);
}
.user-dropdown-menu .dropdown-item .fa-icon {
  width: 16px; /* Fixed width for icon alignment */
  text-align: center;
  opacity: 0.8;
}
.user-dropdown-menu .dropdown-divider {
  height: 1px;
  background-color: var(--border-color);
  border: none;
  margin: 0.5rem 0;
}
.user-dropdown-menu .dropdown-item.logout {
  color: #e53e3e; /* Red for logout */
}
[data-theme="dark"] .user-dropdown-menu .dropdown-item.logout {
  color: #fc8181;
}


.app-main-content-wrapper {
  flex-grow: 1; /* Crucial: takes up all available vertical space after the header */
  display: flex; /* Make it a flex container so the child (slot content) can be controlled */
  flex-direction: column; /* Stack children (like a single view) vertically */
  overflow: hidden; /* Prevent this wrapper from scrolling; let children handle their scroll */
  position: relative; /* Good for potential absolute children or overlays */
}

.app-nav-center .nav-link.router-link-exact-active,
.app-nav-center .nav-link.router-link-active { /* For parent routes */
  color: var(--primary-color);
  background-color: color-mix(in srgb, var(--primary-color) 15%, transparent);
  font-weight: bold;
}
</style>