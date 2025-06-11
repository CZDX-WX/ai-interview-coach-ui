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
      <div class="tab-content-wrapper">
        <ReportPhaseBreakdownContent v-if="activeTab === 'phaseBreakdown'" :phaseBreakdownData="reportData.phaseBreakdown" />
        <ReportKeyMomentsContent v-if="activeTab === 'keyMoments'" :keyMomentsData="reportData.keyMoments" />
        <ReportCoreAbilitiesDetailContent v-if="activeTab === 'coreAbilitiesDetail'" :coreAbilitiesData="reportData.coreAbilities" />
      </div>
    </section>

    <VideoPlaybackSection :videoUrl="mockVideoUrl" /> <RecommendedResourcesSection v-if="reportData.recommendedResources.length > 0" :resources="reportData.recommendedResources" />

    <ReportActionsSection @download-report="handleDownloadReport" />

  </div>
  <div v-else class="report-view-loading">
    <div class="spinner"><div></div><div></div><div></div><div></div></div> <p>正在加载报告数据...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useInterviewSetupStore, ALL_POSSIBLE_PHASES } from '@/stores/interviewSetup';
import type { InterviewReport, CoreAbilityScore, KeyMoment, PhaseBreakdown, RecommendedResource, PhaseMetric } from '@/types/reportTypes';

// Child components
import ReportHeader from '../../components/report/ReportHeader.vue';
import ReportOverallSummary from '../../components/report/ReportOverallSummary.vue';
import CoreAbilitiesRadarChart from '../../components/report/CoreAbilitiesRadarChart.vue';
import ReportTabs, { type TabDefinition } from '../../components/report/ReportTabs.vue';
import ReportPhaseBreakdownContent from '../../components/report/ReportPhaseBreakdownContent.vue';
import ReportKeyMomentsContent from '../../components/report/ReportKeyMomentsContent.vue';
import ReportCoreAbilitiesDetailContent from '../../components/report/ReportCoreAbilitiesDetailContent.vue';
import VideoPlaybackSection from '../../components/report/VideoPlaybackSection.vue';
import RecommendedResourcesSection from '../../components/report/RecommendedResourcesSection.vue';
import ReportActionsSection from '../../components/report/ReportActionsSection.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'; // Only if used directly in this parent

const route = useRoute();
const setupStore = useInterviewSetupStore();

const reportData = ref<InterviewReport | null>(null);
const activeTab = ref<'phaseBreakdown' | 'keyMoments' | 'coreAbilitiesDetail'>('phaseBreakdown');
const mockVideoUrl = ref<string | undefined>(undefined); // ref(''); // Example: 'your_video_url.mp4' or leave undefined for placeholder

const feedbackTabs = ref<TabDefinition[]>([
  { id: 'phaseBreakdown', label: '按阶段表现', icon: ['fas', 'layer-group'] },
  { id: 'keyMoments', label: '关键时刻与建议', icon: ['fas', 'star'] },
  { id: 'coreAbilitiesDetail', label: '核心能力详情', icon: ['fas', 'tasks'] },
]);

const generateMockReport = (sessionId: string): InterviewReport => { /* ... (same as before, ensure all text is Chinese) ... */
  const jobFieldLabel = setupStore.getJobFieldLabel || '通用岗位';
  const experienceLevelLabel = setupStore.getExperienceLevelLabel || '未指定级别';
  const selectedPhaseIdsFromSetup = setupStore.selectedPhaseIds;

  const coreAbilitiesData: CoreAbilityScore[] = [
    { id: 'professionalKnowledge', name: '专业知识', score: Math.floor(Math.random() * 30) + 65, description: "与职位相关的技术知识广度和深度。" },
    { id: 'skillsMatch', name: '技能匹配', score: Math.floor(Math.random() * 30) + 60, description: "个人技能与岗位需求的契合程度。" },
    { id: 'languageExpression', name: '语言表达', score: Math.floor(Math.random() * 35) + 55, description: "沟通的清晰度、流畅性及逻辑性。" },
    { id: 'logicalThinking', name: '逻辑思维', score: Math.floor(Math.random() * 30) + 60, description: "分析问题、构建论点和结构化思考的能力。" },
    { id: 'innovation', name: '创新应变', score: Math.floor(Math.random() * 30) + 50, description: "提出新颖解决方案及适应变化的能力。" },
    { id: 'stressResistance', name: '抗压能力', score: Math.floor(Math.random() * 30) + 55, description: "在压力环境下保持冷静和有效工作的能力。" },
  ];
  const phaseBreakdownData: PhaseBreakdown[] = selectedPhaseIdsFromSetup.map(phaseId => {
    const phaseDef = ALL_POSSIBLE_PHASES.find(p => p.id === phaseId);
    const metrics: PhaseMetric[] = []; let strengths: string[] = []; let areas: string[] = [];
    if (phaseId === 'selfIntro' || phaseId === 'projectDiscussion') {
      metrics.push({ name: '表达清晰度', score: Math.floor(Math.random() * 25) + 65, feedback: '表达基本清晰，部分内容可以更精炼。' });
      strengths.push("对过往经历的阐述较为流畅。"); areas.push("在项目成果方面提供更多可量化的数据。");
    } else if (phaseId === 'techQA') {
      metrics.push({ name: '答案准确性', score: Math.floor(Math.random() * 30) + 65, feedback: '多数技术问题回答准确。' });
      strengths.push("对核心技术概念有较好理解。"); areas.push("练习用更简洁的方式解释复杂技术点。");
    } else if (phaseId === 'codingExercise') {
      metrics.push({ name: '逻辑与方法', score: Math.floor(Math.random() * 35) + 55, feedback: '编程问题的解决思路基本合理。' });
      strengths.push("在时间压力下完成了题目。"); areas.push("注意代码规范和边界条件处理。");
    } else if (phaseId === 'behavioral' || phaseId === 'futureAspirations') {
      metrics.push({ name: '案例相关性', score: Math.floor(Math.random() * 25) + 65, feedback: '行为问题回答中能提供相关案例。' });
      strengths.push("对职业规划有清晰的阐述。"); areas.push("确保回答直接针对所提问题，避免偏题。");
    }
    return {
      phaseId: phaseId, phaseName: phaseDef?.name || '未知阶段',
      overallPhaseScore: Math.floor(metrics.reduce((sum, m) => sum + m.score, 0) / Math.max(1, metrics.length)) || Math.floor(Math.random() * 20) + 70,
      metrics: metrics.length > 0 ? metrics : [{name: '综合表现', score: Math.floor(Math.random()*20)+70, feedback: '该阶段表现整体符合预期。'}],
      strengths: strengths.length > 0 ? strengths : undefined, areasForImprovement: areas.length > 0 ? areas : undefined,
    };
  });
  const keyMomentsData: KeyMoment[] = [ /* ... ensure Chinese content ... */ ];
  const filteredKeyMoments = keyMomentsData; /* ... ensure Chinese content ... */
  const recommendedResourcesData: RecommendedResource[] = [ /* ... ensure Chinese content ... */
    { id: 'res1', title: '高效行为面试技巧 (视频课程)', type: '课程', url: '#', icon: 'graduation-cap', description: "学习高级技巧，轻松应对行为面试问题。" },
    { id: 'res2', title: '技术面试手册 (在线资源)', type: '文章', url: '#', icon: 'book-open', description: "全面覆盖常见技术面试主题的指南。" },
  ];
  return { /* ... (rest of the return object, ensure overallSummaryText is Chinese) ... */
    sessionId: sessionId, interviewJobFieldLabel: jobFieldLabel, interviewExperienceLevelLabel: experienceLevelLabel,
    interviewDate: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
    overallScore: Math.floor(coreAbilitiesData.reduce((sum, ab) => sum + ab.score, 0) / coreAbilitiesData.length),
    overallSummaryText: `在 ${jobFieldLabel} (${experienceLevelLabel}) 的模拟面试中表现良好。主要优点包括专业知识扎实、逻辑思维清晰。建议在语言表达的流畅性和案例阐述的结构性方面进一步提升，以取得更好的面试效果。`,
    coreAbilities: coreAbilitiesData, keyMoments: filteredKeyMoments.slice(0, Math.floor(Math.random()*2)+2),
    phaseBreakdown: phaseBreakdownData,
    recommendedResources: recommendedResourcesData.slice(0, Math.floor(Math.random()*2)+1),
    selectedPhaseIds: selectedPhaseIdsFromSetup,
  };
};

const handleDownloadReport = () => {
  // Logic for downloading report (e.g., using jsPDF or calling a backend endpoint)
  console.log("（模拟）下载报告...");
  alert("（模拟功能）报告下载功能暂未实现。");
};

onMounted(() => {
  const sessionId = route.params.sessionId as string;
  reportData.value = generateMockReport(sessionId);
  // If video URL were real and came from reportData:
  // mockVideoUrl.value = reportData.value?.videoUrl;
});
</script>

<style scoped>
.report-view { padding: 1.5rem 2rem; max-width: 1000px; margin: 0 auto; color: var(--text-color); }
.report-view-loading { text-align: center; padding: 3rem; font-size: 1.2rem; }
.report-view-loading .spinner { /* Ensure spinner styles are available or copied here */
  display: inline-block; position: relative; width: 60px; height: 60px; margin-bottom: 1rem;
}
.report-view-loading .spinner div { box-sizing: border-box; display: block; position: absolute; width: 48px; height: 48px; margin: 6px; border: 4px solid var(--primary-color); border-radius: 50%; animation: spinner-animation 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite; border-color: var(--primary-color) transparent transparent transparent; }
.report-view-loading .spinner div:nth-child(1) { animation-delay: -0.45s; }
.report-view-loading .spinner div:nth-child(2) { animation-delay: -0.3s; }
.report-view-loading .spinner div:nth-child(3) { animation-delay: -0.15s; }
@keyframes spinner-animation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }


.detailed-feedback-section {
  background-color: var(--card-bg-color);
  padding: 0; /* ReportTabs component handles its own padding for the nav */
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

/* Styles for sections that were previously .original-section-style are now inside their components */
/* Ensure global .form-button and .secondary-button styles are available for ReportActionsSection */
</style>