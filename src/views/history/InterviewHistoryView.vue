<template>
  <div class="interview-history-view">
    <h1 class="page-title">
      <font-awesome-icon :icon="['fas', 'history']" class="title-icon"/>
      我的练习历史
    </h1>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"><div></div><div></div><div></div><div></div></div>
      <p>正在加载练习历史...</p>
    </div>

    <div v-else-if="allHistoryItems.length === 0" class="empty-state"> <font-awesome-icon :icon="['fas', 'folder-open']" class="empty-icon"/>
      <p>您还没有完成任何面试练习。</p>
      <router-link :to="{ name: 'InterviewSetup' }" class="form-button primary-button">
        <font-awesome-icon :icon="['fas', 'play-circle']" /> 开始您的第一次练习
      </router-link>
    </div>

    <div v-else class="history-table-container">
      <table class="history-table">
        <thead>
        <tr>
          <th>日期</th>
          <th>面试岗位</th>
          <th>状态 / 得分</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in sortedHistoryItems" :key="item.sessionId">
          <td data-label="日期">{{ formatDate(item.date) }}</td>
          <td data-label="面试岗位">{{ item.jobProfileDisplay }}</td>
          <td data-label="状态 / 得分">
              <span :class="['status-badge', getStatusClass(item.status, item.overallScore)]">
                {{ getStatusText(item.status, item.overallScore) }}
              </span>
          </td>
          <td data-label="操作">
            <button
                @click="viewReport(item.sessionId)"
                class="action-button view-report-button"
                :disabled="item.status === 'Analysis Pending' || item.status === 'Error' || !(item.status === 'Report Ready' || (item.status === 'Completed' && item.overallScore !== undefined))"
                title="查看报告"
            >
              <font-awesome-icon :icon="['fas', 'eye']" /> 查看报告
            </button>
          </td>
        </tr>
        </tbody>
      </table>
      <div class="pagination-controls" v-if="totalPages > 1">
        <button @click="currentPage--" :disabled="currentPage === 1" class="pagination-button">
          <font-awesome-icon :icon="['fas', 'chevron-left']" /> 上一页
        </button>
        <span>第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
        <button @click="currentPage++" :disabled="currentPage === totalPages" class="pagination-button">
          下一页 <font-awesome-icon :icon="['fas', 'chevron-right']" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
// 假设 InterviewHistoryItem 类型定义在 types/historyTypes.ts
import type { InterviewHistoryItem } from '../../types/historyTypes';
import { useInterviewSetupStore } from '../../stores/interviewSetup';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const router = useRouter();
const setupStore = useInterviewSetupStore();

const allHistoryItems = ref<InterviewHistoryItem[]>([]);
const isLoading = ref(true);
const currentPage = ref(1);
const itemsPerPage = ref(10);

const fetchInterviewHistory = async () => {
  isLoading.value = true;
  await new Promise(resolve => setTimeout(resolve, 1000));

  const mockItems: InterviewHistoryItem[] = [];
  const jobFields = setupStore.availableJobFields; // 应已中文化 (label 字段)
  const experienceLevels = setupStore.availableExperienceLevels; // 应已中文化 (label 字段)
  const statuses: Array<InterviewHistoryItem['status']> = ['Report Ready', 'Analysis Pending', 'Completed', 'Error'];

  for (let i = 0; i < 25; i++) {
    const date = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000 - i * 3 * 24 * 60 * 60 * 1000);
    const randomJobField = jobFields[Math.floor(Math.random() * jobFields.length)];
    const randomExperienceLevel = experienceLevels[Math.floor(Math.random() * experienceLevels.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    let score = randomStatus === 'Report Ready' || randomStatus === 'Completed' ? Math.floor(Math.random() * 50) + 50 : undefined; // 得分在50-99之间

    let currentStatus: InterviewHistoryItem['status'] = randomStatus;
    if (score !== undefined) { // 如果有分数，状态应为 Report Ready 或 Completed
      currentStatus = Math.random() > 0.5 ? 'Report Ready' : 'Completed';
    } else if (currentStatus === 'Report Ready' || currentStatus === 'Completed') { // 如果随机到这两个状态但没有分数，则改为 Pending
      currentStatus = 'Analysis Pending';
    }


    mockItems.push({
      sessionId: `mockSess${100 + i}`,
      date: date.toISOString().split('T')[0],
      // jobProfileDisplay 确保使用中文标签
      jobProfileDisplay: `${randomJobField.label} - ${randomExperienceLevel.label}`,
      status: currentStatus,
      overallScore: score,
    });
  }
  allHistoryItems.value = mockItems;
  isLoading.value = false;
};

const sortedHistoryItems = computed(() => {
  return [...paginatedHistoryItems.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

const totalPages = computed(() => {
  return Math.ceil(allHistoryItems.value.length / itemsPerPage.value);
});

const paginatedHistoryItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return allHistoryItems.value.slice(start, end);
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN', { // 使用中文日期格式
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getStatusText = (status: InterviewHistoryItem['status'], score?: number) => {
  if ((status === 'Report Ready' || status === 'Completed') && score !== undefined) {
    return `已完成 (得分: ${score}/100)`;
  }
  switch (status) {
    case 'Analysis Pending':
      return '报告生成中';
    case 'Error':
      return '分析出错';
    default:
      return '状态未知';
  }
};

const getStatusClass = (status: InterviewHistoryItem['status'], score?: number) => {
  if ((status === 'Report Ready' || status === 'Completed') && score !== undefined) {
    if (score >= 75) return 'status-good';
    if (score >= 50) return 'status-average';
    return 'status-improvement';
  }
  if (status === 'Analysis Pending') return 'status-pending';
  if (status === 'Error') return 'status-error';
  return '';
};

const viewReport = (sessionId: string) => {
  const item = allHistoryItems.value.find(i => i.sessionId === sessionId); // 从 allHistoryItems 查找
  if (item && (item.status === 'Report Ready' || (item.status === 'Completed' && item.overallScore !== undefined))) {
    router.push({ name: 'ReportView', params: { sessionId } });
  } else {
    alert("该面试的报告尚未生成或无法查看。"); // 中文提示
  }
};

onMounted(() => {
  fetchInterviewHistory();
});
</script>

<style scoped>
/* ... (样式与上一轮基本一致，确保所有文本元素有足够的空间显示中文) ... */
.interview-history-view { padding: 1.5rem 2rem; max-width: 1100px; margin: 0 auto; color: var(--text-color); }
.page-title { font-size: 2rem; font-weight: 700; color: var(--text-color); margin-bottom: 2rem; display: flex; align-items: center; gap: 0.75rem; }
[data-theme="dark"] .page-title { color: #ffffff; }
.page-title .title-icon { color: var(--primary-color); }

.loading-state, .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem; text-align: center; min-height: 300px; background-color: var(--card-bg-color); border-radius: 8px; border: 1px solid var(--border-color); }
.empty-state .empty-icon { font-size: 4rem; color: var(--primary-color); opacity: 0.5; margin-bottom: 1.5rem; }
.empty-state p { font-size: 1.1rem; margin-bottom: 1.5rem; opacity: 0.8; }
.empty-state .form-button { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; }
.primary-button { background-color: var(--primary-color); color: white; border: none; } /* 确保 primary-button 有样式 */
.primary-button:hover { opacity: 0.9; }


.history-table-container { background-color: var(--card-bg-color); border-radius: 8px; overflow-x: auto; border: 1px solid var(--border-color); box-shadow: 0 3px 10px rgba(0,0,0,0.03); }
[data-theme="dark"] .history-table-container { box-shadow: 0 3px 10px rgba(0,0,0,0.1); }
.history-table { width: 100%; border-collapse: collapse; }
.history-table th, .history-table td { padding: 1rem 1.25rem; text-align: left; font-size: 0.9rem; line-height: 1.5; }
.history-table thead tr { background-color: var(--bg-color); border-bottom: 2px solid var(--border-color); }
[data-theme="dark"] .history-table thead tr { background-color: color-mix(in srgb, var(--card-bg-color) 80%, black 20%); }
.history-table th { color: var(--text-color); font-weight: 600; text-transform: uppercase; letter-spacing: 0.025em; opacity: 0.9; }
.history-table tbody tr { border-bottom: 1px solid var(--border-color); }
.history-table tbody tr:last-child { border-bottom: none; }
.history-table tbody tr:hover { background-color: color-mix(in srgb, var(--primary-color) 5%, var(--card-bg-color) 95%); }
.history-table td { color: var(--text-color); opacity: 0.9; height: 72px; vertical-align: middle; }
.history-table td[data-label="面试岗位"] { font-weight: 500; }
.history-table td[data-label="操作"] { text-align: right; }

.status-badge { padding: 0.3rem 0.75rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 500; display: inline-block; min-width: 120px; text-align: center; }
.status-badge.status-good { background-color: #28a74520; color: #1c7430; }
[data-theme="dark"] .status-badge.status-good { background-color: #2f5c3a40; color: #68d391; }
.status-badge.status-average { background-color: #ffc10720; color: #b98900; }
[data-theme="dark"] .status-badge.status-average { background-color: #574b1e40; color: #ffda6a; }
.status-badge.status-improvement { background-color: #dc354520; color: #a71d2a; }
[data-theme="dark"] .status-badge.status-improvement { background-color: #5c2f2f40; color: #fc8181; }
.status-badge.status-pending { background-color: #6c757d20; color: #495057; }
[data-theme="dark"] .status-badge.status-pending { background-color: #4a4a4a40; color: #adb5bd; }
.status-badge.status-error { background-color: #dc354530; color: #a71d2a; border: 1px dashed #a71d2a80; }
[data-theme="dark"] .status-badge.status-error { background-color: #5c2f2f50; color: #fc8181; border-color: #fc818180; }

.action-button { padding: 0.4rem 0.8rem; font-size: 0.85rem; font-weight: 500; border-radius: 0.375rem; cursor: pointer; transition: background-color 0.2s, color 0.2s; display: inline-flex; align-items: center; gap: 0.4rem; border: 1px solid var(--primary-color); background-color: transparent; color: var(--primary-color); }
.action-button:hover { background-color: var(--primary-color); color: white; }
.action-button:disabled { border-color: var(--border-color); color: var(--text-color-muted); opacity: 0.5; cursor: not-allowed; }
.action-button:disabled:hover { background-color: transparent; }
[data-theme="dark"] .action-button:hover { color: var(--bg-color); }
[data-theme="dark"] .action-button:disabled { color: var(--text-color-muted); }

.pagination-controls { display: flex; justify-content: center; align-items: center; padding: 1.5rem 0; gap: 1rem; font-size: 0.9rem; }
.pagination-button { padding: 0.5rem 1rem; background-color: var(--card-bg-color); border: 1px solid var(--border-color); color: var(--text-color); border-radius: 4px; cursor: pointer; display: inline-flex; align-items: center; gap: 0.3rem; }
.pagination-button:hover:not(:disabled) { background-color: var(--border-color); }
.pagination-button:disabled { opacity: 0.5; cursor: not-allowed; }
.spinner { display: inline-block; position: relative; width: 60px; height: 60px; margin-bottom: 1rem; }
.spinner div { box-sizing: border-box; display: block; position: absolute; width: 48px; height: 48px; margin: 6px; border: 4px solid var(--primary-color); border-radius: 50%; animation: spinner-animation 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite; border-color: var(--primary-color) transparent transparent transparent; }
.spinner div:nth-child(1) { animation-delay: -0.45s; }
.spinner div:nth-child(2) { animation-delay: -0.3s; }
.spinner div:nth-child(3) { animation-delay: -0.15s; }
@keyframes spinner-animation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>