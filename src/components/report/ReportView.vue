<template>
  <div class="report-view" v-if="reportData">
    <ReportHeader
        :jobFieldLabel="reportData.interviewJobFieldLabel"
        :experienceLevelLabel="reportData.interviewExperienceLevelLabel"
        :interviewDate="reportData.interviewDate"
        :sessionId="reportData.sessionId"
    />

    <ReportOverallSummary
        :overallScore="reportData.overallScore"
        :summaryText="reportData.overallSummaryText"
    />

    <CoreAbilitiesRadarChart
        :coreAbilities="reportData.coreAbilities"
    />

    <section class="report-section detailed-feedback-section">
      <ReportTabs :tabs="feedbackTabs" v-model:activeTabId="activeTab" />
      <div class="tab-content-wrapper"> <ReportPhaseBreakdownContent v-if="activeTab === 'phaseBreakdown'" :phaseBreakdownData="reportData.phaseBreakdown" />
        <ReportKeyMomentsContent v-if="activeTab === 'keyMoments'" :keyMomentsData="reportData.keyMoments" />
        <ReportCoreAbilitiesDetailContent v-if="activeTab === 'coreAbilitiesDetail'" :coreAbilitiesData="reportData.coreAbilities" />
      </div>
    </section>

    <section class="report-section video-playback-section original-section-style">
      <h2 class="section-title">面试回放</h2>
      <div class="video-placeholder">
        <font-awesome-icon :icon="['fas', 'play-circle']" class="play-icon"/>
        <p>视频回放将在此处提供。</p>
      </div>
    </section>
    <section class="report-section recommended-resources-section original-section-style" v-if="reportData.recommendedResources.length > 0">
      <h2 class="section-title">个性化学习资源</h2>
    </section>
    <section class="report-actions original-section-style">
      <button class="form-button secondary-button">
        <font-awesome-icon :icon="['fas', 'download']" /> 下载报告 (PDF)
      </button>
      <router-link :to="{ name: 'InterviewSetup' }" class="form-button">
        <font-awesome-icon :icon="['fas', 'calendar-plus']" /> 安排下一次练习
      </router-link>
    </section>

  </div>
  <div v-else class="report-view-loading">
    <p>正在加载报告数据...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useInterviewSetupStore, ALL_POSSIBLE_PHASES } from '@/stores/interviewSetup';
import type { InterviewReport, CoreAbilityScore, KeyMoment, PhaseBreakdown, RecommendedResource, PhaseMetric } from '@/types/reportTypes';

// 新引入的子组件
import ReportHeader from '../../components/report/ReportHeader.vue';
import ReportOverallSummary from '../../components/report/ReportOverallSummary.vue';
import CoreAbilitiesRadarChart from '../../components/report/CoreAbilitiesRadarChart.vue';
import ReportTabs, { type TabDefinition } from '../../components/report/ReportTabs.vue'; // 导入 TabDefinition
import ReportPhaseBreakdownContent from '../../components/report/ReportPhaseBreakdownContent.vue';
import ReportKeyMomentsContent from '../../components/report/ReportKeyMomentsContent.vue';
import ReportCoreAbilitiesDetailContent from '../../components/report/ReportCoreAbilitiesDetailContent.vue';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const route = useRoute();
const setupStore = useInterviewSetupStore();

const reportData = ref<InterviewReport | null>(null);
const activeTab = ref<'phaseBreakdown' | 'keyMoments' | 'coreAbilitiesDetail'>('phaseBreakdown'); // 默认标签

const feedbackTabs = ref<TabDefinition[]>([
  { id: 'phaseBreakdown', label: '按阶段表现', icon: ['fas', 'layer-group'] },
  { id: 'keyMoments', label: '关键时刻与建议', icon: ['fas', 'star'] },
  { id: 'coreAbilitiesDetail', label: '核心能力详情', icon: ['fas', 'tasks'] },
]);

// generateMockReport 函数保持不变，但其返回的 InterviewReport 中的文本应为中文
const generateMockReport = (sessionId: string): InterviewReport => { /* ... (与之前相同，确保中文内容) ... */
  const jobFieldLabel = setupStore.getJobFieldLabel || '通用岗位';
  const experienceLevelLabel = setupStore.getExperienceLevelLabel || '未指定级别';
  const selectedPhaseIdsFromSetup = setupStore.selectedPhaseIds;

  const coreAbilitiesData: CoreAbilityScore[] = [
    { id: 'professionalKnowledge', name: '专业知识水平', score: Math.floor(Math.random() * 30) + 65, description: "与职位相关的技术知识广度和深度。" },
    { id: 'skillsMatch', name: '技能匹配度', score: Math.floor(Math.random() * 30) + 60, description: "个人技能与岗位需求的契合程度。" },
    { id: 'languageExpression', name: '语言表达能力', score: Math.floor(Math.random() * 35) + 55, description: "沟通的清晰度、流畅性及逻辑性。" },
    { id: 'logicalThinking', name: '逻辑思维能力', score: Math.floor(Math.random() * 30) + 60, description: "分析问题、构建论点和结构化思考的能力。" },
    { id: 'innovation', name: '创新与应变能力', score: Math.floor(Math.random() * 30) + 50, description: "提出新颖解决方案及适应变化的能力。" },
    { id: 'stressResistance', name: '抗压能力', score: Math.floor(Math.random() * 30) + 55, description: "在压力环境下保持冷静和有效工作的能力。" },
  ];
  const phaseBreakdownData: PhaseBreakdown[] = selectedPhaseIdsFromSetup.map(phaseId => {
    const phaseDef = ALL_POSSIBLE_PHASES.find(p => p.id === phaseId);
    const metrics: PhaseMetric[] = []; let strengths: string[] = []; let areas: string[] = [];
    if (phaseId === 'selfIntro' || phaseId === 'projectDiscussion') { /* ... */ }
    else if (phaseId === 'techQA') { /* ... */ }
    // ... (确保中文内容和逻辑)
    if (phaseId === 'selfIntro' || phaseId === 'projectDiscussion') {
      metrics.push({ name: '表达清晰度', score: Math.floor(Math.random() * 25) + 65, feedback: '表达基本清晰，部分内容可以更精炼。' });
      metrics.push({ name: '自信心展现', score: Math.floor(Math.random() * 30) + 55, feedback: '整体表现出较好的自信。' });
      metrics.push({ name: 'STAR法则运用(项目)', score: Math.floor(Math.random() * 30) + 50, feedback: '在项目描述中可更系统地运用STAR法则。' });
      strengths.push("对过往经历的阐述较为流畅。"); areas.push("在项目成果方面提供更多可量化的数据。");
    } else if (phaseId === 'techQA') {
      metrics.push({ name: '答案准确性', score: Math.floor(Math.random() * 30) + 65, feedback: '多数技术问题回答准确。' });
      metrics.push({ name: '阐述深度', score: Math.floor(Math.random() * 30) + 55, feedback: '部分概念的阐述可以更深入。' });
      strengths.push("对核心技术概念有较好理解。"); areas.push("练习用更简洁的方式解释复杂技术点。");
    } else if (phaseId === 'codingExercise') {
      metrics.push({ name: '逻辑与方法', score: Math.floor(Math.random() * 35) + 55, feedback: '编程问题的解决思路基本合理。' });
      metrics.push({ name: '代码清晰度', score: Math.floor(Math.random() * 30) + 50, feedback: '代码结构和可读性有提升空间。' });
      strengths.push("在时间压力下完成了题目。"); areas.push("注意代码规范和边界条件处理。");
    } else if (phaseId === 'behavioral' || phaseId === 'futureAspirations') {
      metrics.push({ name: '案例相关性', score: Math.floor(Math.random() * 25) + 65, feedback: '行为问题回答中能提供相关案例。' });
      metrics.push({ name: '回答真实性', score: Math.floor(Math.random() * 25) + 60, feedback: '回答显得较为真诚。' });
      strengths.push("对职业规划有清晰的阐述。"); areas.push("确保回答直接针对所提问题，避免偏题。");
    }
    return {
      phaseId: phaseId, phaseName: phaseDef?.name || '未知阶段',
      overallPhaseScore: Math.floor(metrics.reduce((sum, m) => sum + m.score, 0) / Math.max(1, metrics.length)),
      metrics: metrics, strengths: strengths.length > 0 ? strengths : undefined, areasForImprovement: areas.length > 0 ? areas : undefined,
    };
  });
  const keyMomentsData: KeyMoment[] = [
    { timestampDisplay: "01:32 (自我介绍阶段)", observation: "开场自信，对个人背景介绍清晰。", isPositive: true },
    { timestampDisplay: "05:12 (技术问答 - 关于REST API)", observation: "在定义幂等性时略有犹豫，但很快调整过来。", suggestion: "建议复习HTTP方法及其特性，如幂等性。", isPositive: false },
  ];
  const filteredKeyMoments = keyMomentsData.filter(moment => { /* ... */
    const phaseNameInTimestamp = moment.timestampDisplay.substring(moment.timestampDisplay.indexOf('(') + 4, moment.timestampDisplay.indexOf(')'));
    return selectedPhaseIdsFromSetup.some(id => (ALL_POSSIBLE_PHASES.find(p => p.id === id)?.name.includes(phaseNameInTimestamp) || ALL_POSSIBLE_PHASES.find(p => p.id === id)?.shortName.includes(phaseNameInTimestamp)));
  });
  const recommendedResourcesData: RecommendedResource[] = [
    { id: 'res1', title: '高效行为面试技巧 (视频课程)', type: '课程', url: '#', icon: 'graduation-cap', description: "学习高级技巧，轻松应对行为面试问题。" },
    { id: 'res2', title: '技术面试手册 (在线资源)', type: '文章', url: '#', icon: 'book-open', description: "全面覆盖常见技术面试主题的指南。" },
  ];
  return {
    sessionId: sessionId, interviewJobFieldLabel: jobFieldLabel, interviewExperienceLevelLabel: experienceLevelLabel,
    interviewDate: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
    overallScore: Math.floor(coreAbilitiesData.reduce((sum, ab) => sum + ab.score, 0) / coreAbilitiesData.length),
    overallSummaryText: `在 ${jobFieldLabel} (${experienceLevelLabel}) 的模拟面试中表现良好。主要优点包括[模拟的优点领域]。需要重点提升的方面是[模拟的待改进领域]。`,
    coreAbilities: coreAbilitiesData, keyMoments: filteredKeyMoments.slice(0, Math.floor(Math.random()*2)+2),
    phaseBreakdown: phaseBreakdownData,
    recommendedResources: recommendedResourcesData.slice(0, Math.floor(Math.random()*2)+1),
    selectedPhaseIds: selectedPhaseIdsFromSetup,
  };
};

onMounted(() => {
  const sessionId = route.params.sessionId as string;
  reportData.value = generateMockReport(sessionId);
});
</script>

<style scoped>
/* ... (大部分 ReportView.vue 的样式保持不变) ... */
.report-view { padding: 1.5rem 2rem; max-width: 1000px; margin: 0 auto; color: var(--text-color); }
.report-view-loading { text-align: center; padding: 3rem; font-size: 1.2rem; }

.detailed-feedback-section { /* 原 report-section 样式 */
  background-color: var(--card-bg-color);
  padding: 0; /* Tab component will have padding for its content area if needed */
  border-radius: 8px;
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
  box-shadow: 0 3px 10px rgba(0,0,0,0.05);
}
[data-theme="dark"] .detailed-feedback-section {
  box-shadow: 0 3px 10px rgba(0,0,0,0.15);
}
.tab-content-wrapper {
  padding: 1.5rem; /* Inner padding for tab content */
}


/* 临时保留旧样式类，直到所有部分都被新组件替代 */
.original-section-style {
  background-color: var(--card-bg-color);
  padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;
  border: 1px solid var(--border-color); box-shadow: 0 3px 10px rgba(0,0,0,0.05);
}
[data-theme="dark"] .original-section-style { box-shadow: 0 3px 10px rgba(0,0,0,0.15); }
.section-title {
  font-size: 1.5rem; font-weight: 600; color: var(--text-color);
  margin-bottom: 1.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color);
}
[data-theme="dark"] .section-title { color: #ffffff; }
.video-playback-section .video-placeholder { background-color: #000; aspect-ratio: 16 / 9; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #777; border: 1px solid var(--border-color); }
.video-placeholder .play-icon { font-size: 3rem; color: rgba(255,255,255,0.7); margin-bottom: 0.5rem; cursor: pointer; }
.video-placeholder p { font-size: 0.9rem; }
.report-actions { margin-top: 2rem; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
.report-actions .form-button { padding: 0.75rem 1.5rem; font-size: 0.95rem; display: inline-flex; align-items: center; gap: 0.5rem; min-width: 200px; justify-content: center; }
.report-actions .form-button.secondary-button { background-color: var(--card-bg-color); color: var(--text-color); border: 1px solid var(--primary-color); }
.report-actions .form-button.secondary-button:hover { background-color: color-mix(in srgb, var(--border-color) 50%, var(--card-bg-color) 50%); }

.empty-content-message { /* For empty tab content */
  text-align: center;
  padding: 2rem;
  font-style: italic;
  opacity: 0.7;
  background-color: var(--bg-color);
  border-radius: 6px;
}
</style>