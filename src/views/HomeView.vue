<template>
  <div class="home-view-content"> <aside class="sidebar">
    <nav class="sidebar-nav">
      <router-link to="/" class="sidebar-link" active-class="active">
        <font-awesome-icon :icon="['fas', 'house']" class="icon" />
        <span>Home</span>
      </router-link>
      <router-link to="/practice" class="sidebar-link" active-class="active">
        <font-awesome-icon :icon="['fas', 'briefcase']" class="icon" />
        <span>Practice</span>
      </router-link>
      <router-link to="/history" class="sidebar-link" active-class="active">
        <font-awesome-icon :icon="['fas', 'list-check']" class="icon" />
        <span>History</span>
      </router-link>
      <router-link to="/learn" class="sidebar-link" active-class="active">
        <font-awesome-icon :icon="['fas', 'graduation-cap']" class="icon" />
        <span>Learn</span>
      </router-link>
      <router-link to="/discussion" class="sidebar-link" active-class="active">
        <font-awesome-icon :icon="['fas', 'users']" class="icon" />
        <span>Discussion</span>
      </router-link>
      <router-link to="/career-insights" class="sidebar-link" active-class="active">
        <font-awesome-icon :icon="['fas', 'briefcase']" class="icon" />
        <span>Jobs</span>
      </router-link>
    </nav>
  </aside>

    <main class="main-content-area">
      <div class="welcome-header">
        <h1>Welcome back, {{ authStore.currentUser?.name || 'User' }}!</h1>
      </div>

      <div class="action-buttons">
        <router-link to="/interview-setup" class="action-button primary">
          <font-awesome-icon :icon="['fas', 'play-circle']" /> Start New Interview
        </router-link>
        <router-link to="/history" class="action-button secondary">
          <font-awesome-icon :icon="['fas', 'history']" /> View All Interviews
        </router-link>
      </div>

      <section class="content-section recent-performance">
        <h2>Recent Performance</h2>
        <div class="performance-cards">
          <div class="card">
            <p class="card-title">Average Score</p>
            <p class="card-value">85%</p>
          </div>
          <div class="card">
            <p class="card-title">Interviews Completed</p>
            <p class="card-value">5</p>
          </div>
          <div class="card">
            <p class="card-title">Areas for Improvement</p>
            <p class="card-value">2</p>
          </div>
        </div>
      </section>

      <section class="content-section suggested-improvements">
        <h2>Suggested Areas for Improvement</h2>
        <ul class="improvement-list">
          <li class="improvement-item">
            <div class="item-icon-container">
              <font-awesome-icon :icon="['fas', 'bullhorn']" class="item-icon" /> </div>
            <div class="item-text">
              <p class="item-title">Behavioral Questions</p>
              <p class="item-description">Focus on providing specific examples to support your answers using the STAR method.</p>
            </div>
          </li>
          <li class="improvement-item">
            <div class="item-icon-container">
              <font-awesome-icon :icon="['fas', 'comments']" class="item-icon" /> </div>
            <div class="item-text">
              <p class="item-title">Communication Skills</p>
              <p class="item-description">Practice articulating your thoughts clearly and concisely. Pay attention to your pace and tone.</p>
            </div>
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'; // If not globally registered

const authStore = useAuthStore();
</script>

<style scoped>
.home-view-content {
  display: flex; /* This is the key for sidebar + main content */
  flex-grow: 1; /* Takes remaining height from DefaultLayout */
  background-color: var(--bg-color);
  /* overflow: hidden; /* Prevent whole page scroll if sidebar/main content are handled internally */
}

.sidebar {
  width: 260px; /* Fixed width for sidebar, adjust as needed (w-80 from proto ~ 20rem/320px) */
  flex-shrink: 0;
  background-color: var(--card-bg-color); /* Sidebar distinct from main bg */
  padding: 1.5rem 1rem;
  border-right: 1px solid var(--border-color);
  height: calc(100vh - 3.8rem); /* Adjust based on your header height */
  position: sticky;
  top: 3.8rem; /* Adjust based on your header height */
  overflow-y: auto;
}
[data-theme="light"] .sidebar {
  background-color: #f8f9fc; /* Specific light theme sidebar bg */
}


.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem; /* Softer radius */
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-color);
  transition: background-color 0.2s ease, color 0.2s ease;
}
.sidebar-link .icon {
  width: 20px; /* Fixed width for icons */
  text-align: center;
  font-size: 1.1em; /* Relative to link font size */
  opacity: 0.9;
}

.sidebar-link:hover {
  background-color: color-mix(in srgb, var(--primary-color) 10%, transparent);
  color: var(--primary-color);
}

.sidebar-link.active { /* Relies on router-link-active-class="active" */
  background-color: var(--primary-color);
  color: white; /* Text color for active link on primary background */
  font-weight: 600;
}
[data-theme="dark"] .sidebar-link.active {
  /* Ensure good contrast for dark theme primary */
  color: var(--bg-color); /* Or a specific dark theme active text color */
}


.main-content-area {
  flex-grow: 1;
  padding: 2rem; /* Main content padding */
  overflow-y: auto; /* Allow main content to scroll independently */
  height: calc(100vh - 3.8rem); /* Adjust based on header height */
}

.welcome-header h1 {
  font-size: 1.875rem; /* text-[30px] */
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 1.5rem;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.action-button {
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  border-radius: 0.375rem;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.1s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.action-button:hover {
  opacity: 0.85;
}
.action-button:active {
  transform: translateY(1px);
}

.action-button .fa-icon {
  font-size: 1em;
}

.action-button.primary {
  background-color: var(--primary-color);
  color: white;
}
.action-button.secondary {
  background-color: var(--card-bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
}
[data-theme="light"] .action-button.secondary {
  background-color: #e9ecef; /* Slightly different secondary for light */
  color: #212529;
  border-color: #dee2e6;
}


.content-section {
  margin-bottom: 2.5rem;
}
.content-section h2 {
  font-size: 1.25rem; /* text-[20px] */
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.performance-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); /* Responsive cards */
  gap: 1.5rem;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background-color: var(--card-bg-color);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
[data-theme="dark"] .card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
}


.card-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-color);
  opacity: 0.9;
}

.card-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--primary-color);
}

.improvement-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.improvement-item {
  display: flex;
  align-items: flex-start; /* Align icon to top of text */
  gap: 1rem;
  padding: 1rem;
  background-color: var(--card-bg-color);
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
[data-theme="dark"] .improvement-item {
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.item-icon-container {
  width: 2.75rem; /* size-11 */
  height: 2.75rem;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  background-color: color-mix(in srgb, var(--primary-color) 15%, transparent);
  color: var(--primary-color);
}

.item-icon-container .item-icon {
  font-size: 1.25rem;
}

.item-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: 1;
}

.item-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 0.25rem;
}

.item-description {
  font-size: 0.875rem;
  color: var(--text-color);
  opacity: 0.8;
  line-height: 1.5;
}
</style>