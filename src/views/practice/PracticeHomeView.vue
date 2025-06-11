<template>
  <div class="page-container">
    <header class="page-header">
      <h1>开始练习</h1>
      <p>选择一个模块，开启您的技能提升之旅。</p>
    </header>
    <div class="module-selection-grid">
      <router-link :to="{ name: 'TechnicalPractice' }" class="module-card">
        <div class="card-icon tech-icon">
          <font-awesome-icon :icon="['fas', 'brain']" />
        </div>
        <h2 class="card-title">技术练习</h2>
        <p class="card-description">通过AI生成定制化的技术问题（如Java并发、Spring、Vue原理等），进行深度练习。</p>
      </router-link>
      <router-link :to="{ name: 'AlgorithmPractice' }" class="module-card">
        <div class="card-icon algo-icon">
          <font-awesome-icon :icon="['fas', 'code']" />
        </div>
        <h2 class="card-title">算法练习</h2>
        <p class="card-description">进入在线编程（OJ）环境，挑战经典的算法题目，提升编码和问题解决能力。</p>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
/* 样式与通用页面样式保持一致 */
.page-container { max-width: 1200px; margin: 0 auto; padding: 2.5rem; }
.page-header { text-align: center; margin-bottom: 3rem; }
.page-header h1 { font-size: 2.5rem; font-weight: 700; }
.page-header p { font-size: 1.1rem; color: var(--text-color-muted); }

.module-selection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}
.module-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background-color: var(--card-bg-color);
  text-decoration: none;
  color: var(--text-color);
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}
.module-card:hover {
  transform: translateY(-5px);
  border-color: var(--primary-color);
  box-shadow: 0 8px 25px rgba(0, 123, 255, 0.1);
}
.card-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.tech-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.algo-icon { background: linear-gradient(135deg, #2af598 0%, #009efd 100%); }
.card-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 0.75rem; }
.card-description { font-size: 0.95rem; color: var(--text-color-muted); line-height: 1.6; }
</style>