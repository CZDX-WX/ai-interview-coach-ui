<template>
  <div class="report-view" v-if="reportData">
    <div class="report-header">
      <h1 class="page-title">
        <font-awesome-icon :icon="['fas', 'file-invoice']" />
        Interview Report
      </h1>
      <p class="report-subtitle">{{ reportData.interviewJobFieldLabel }} - {{ reportData.interviewExperienceLevelLabel }} | {{ reportData.interviewDate }}</p>
    </div>

    <section class="report-section overall-summary-section">
      <h2 class="section-title">Overall Summary</h2>
      <div class="summary-card">
        <div class="overall-score">
          <p class="score-value">{{ reportData.overallScore }}<span>/100</span></p>
          <p class="score-label">Overall Score</p>
        </div>
        <p class="summary-text">{{ reportData.overallSummaryText }}</p>
      </div>
    </section>

    <section class="report-section radar-chart-section">
      <h2 class="section-title">Core Ability Metrics</h2>
      <div class="chart-container">
        <Radar v-if="chartData.labels?.length" :data="chartData" :options="chartOptions" />
        <p v-else>No ability data to display.</p>
      </div>
    </section>

    <section class="report-section detailed-feedback-section">
      <div class="tabs">
        <button
            :class="['tab-button', { active: activeTab === 'phaseBreakdown' }]"
            @click="activeTab = 'phaseBreakdown'">
          <font-awesome-icon :icon="['fas', 'layer-group']"/> Performance by Phase
        </button>
        <button
            :class="['tab-button', { active: activeTab === 'keyMoments' }]"
            @click="activeTab = 'keyMoments'">
          <font-awesome-icon :icon="['fas', 'star']"/> Key Moments & Suggestions
        </button>
        <button
            :class="['tab-button', { active: activeTab === 'coreAbilitiesDetail' }]"
            @click="activeTab = 'coreAbilitiesDetail'">
          <font-awesome-icon :icon="['fas', 'tasks']"/> Core Abilities Detail
        </button>
      </div>

      <div class="tab-content">
        <div v-if="activeTab === 'phaseBreakdown'" class="phase-breakdown-content">
          <div v-for="phase in reportData.phaseBreakdown" :key="phase.phaseId" class="phase-card">
            <h3 class="phase-name">{{ phase.phaseName }} <span v-if="phase.overallPhaseScore" class="phase-score-badge">{{ phase.overallPhaseScore }}/100</span></h3>
            <div class="phase-metrics-grid">
              <div v-for="metric in phase.metrics" :key="metric.name" class="metric-item">
                <p class="metric-name">{{ metric.name }}: <span class="metric-score">{{ metric.score }}/100</span></p>
                <p class="metric-feedback">{{ metric.feedback }}</p>
              </div>
            </div>
            <div v-if="phase.strengths?.length" class="strengths-list">
              <strong>Strengths:</strong>
              <ul><li v-for="strength in phase.strengths" :key="strength">{{ strength }}</li></ul>
            </div>
            <div v-if="phase.areasForImprovement?.length" class="improvements-list">
              <strong>Areas for Improvement:</strong>
              <ul><li v-for="area in phase.areasForImprovement" :key="area">{{ area }}</li></ul>
            </div>
          </div>
        </div>

        <div v-if="activeTab === 'keyMoments'" class="key-moments-content">
          <div v-for="(moment, index) in reportData.keyMoments" :key="index" class="key-moment-item" :class="{ positive: moment.isPositive, improvement: !moment.isPositive }">
            <div class="moment-icon">
              <font-awesome-icon :icon="moment.isPositive ? ['fas', 'thumbs-up'] : ['fas', 'exclamation-triangle']" />
            </div>
            <div class="moment-details">
              <p class="moment-timestamp">{{ moment.timestampDisplay }}</p>
              <p class="moment-observation">{{ moment.observation }}</p>
              <p v-if="moment.suggestion" class="moment-suggestion"><strong>Suggestion:</strong> {{ moment.suggestion }}</p>
            </div>
          </div>
          <p v-if="!reportData.keyMoments.length">No specific key moments highlighted for this interview.</p>
        </div>

        <div v-if="activeTab === 'coreAbilitiesDetail'" class="core-abilities-detail-content">
          <div v-for="ability in reportData.coreAbilities" :key="ability.id" class="ability-detail-item">
            <h4>{{ ability.name }} - <span class="score-value-small">{{ ability.score }}/100</span></h4>
            <p v-if="ability.description">{{ ability.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="report-section video-playback-section">
      <h2 class="section-title">Interview Playback</h2>
      <div class="video-placeholder">
        <font-awesome-icon :icon="['fas', 'play-circle']" class="play-icon"/>
        <p>Video playback will be available here.</p>
      </div>
    </section>

    <section class="report-section recommended-resources-section" v-if="reportData.recommendedResources.length > 0">
      <h2 class="section-title">Personalized Learning Resources</h2>
      <div class="resources-grid">
        <a v-for="resource in reportData.recommendedResources" :key="resource.id" :href="resource.url" target="_blank" rel="noopener noreferrer" class="resource-card">
          <div class="resource-icon-container">
            <font-awesome-icon :icon="['fas', resource.icon]" />
          </div>
          <div class="resource-text">
            <h4 class="resource-title">{{ resource.title }}</h4>
            <p v-if="resource.description" class="resource-description">{{ resource.description }}</p>
          </div>
          <span class="resource-type-badge">{{ resource.type }}</span>
        </a>
      </div>
    </section>

    <section class="report-actions">
      <button class="form-button secondary-button">
        <font-awesome-icon :icon="['fas', 'download']" /> Download Report (PDF)
      </button>
      <router-link :to="{ name: 'InterviewSetup' }" class="form-button">
        <font-awesome-icon :icon="['fas', 'calendar-plus']" /> Schedule Another Practice
      </router-link>
    </section>

  </div>
  <div v-else class="report-view-loading">
    <p>Loading report data...</p> </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useInterviewSetupStore, ALL_POSSIBLE_PHASES } from '../../stores/interviewSetup'; // For phase names
import type { InterviewReport, CoreAbilityScore, KeyMoment, PhaseBreakdown, RecommendedResource, PhaseMetric } from '../../types/reportTypes'; // Import types
// Chart.js imports
import { Radar } from 'vue-chartjs';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, Title } from 'chart.js';
// import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, Title);

const route = useRoute();
const setupStore = useInterviewSetupStore(); // To get labels and phase definitions

const reportData = ref<InterviewReport | null>(null);
const activeTab = ref<'phaseBreakdown' | 'keyMoments' | 'coreAbilitiesDetail'>('phaseBreakdown'); // Default tab

const chartData = computed(() => {
  if (!reportData.value) return { labels: [], datasets: [] };
  return {
    labels: reportData.value.coreAbilities.map(ab => ab.name),
    datasets: [
      {
        label: 'Your Performance',
        data: reportData.value.coreAbilities.map(ab => ab.score),
        backgroundColor: 'rgba(59, 130, 246, 0.2)', // primary-color with alpha
        borderColor: 'rgba(59, 130, 246, 1)', // primary-color
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
      }
    ]
  };
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      angleLines: { display: true, color: 'rgba(255, 255, 255, 0.2)' }, // For dark theme
      grid: { color: 'rgba(255, 255, 255, 0.2)' }, // For dark theme
      pointLabels: {
        font: { size: 12 },
        color: 'var(--text-color)' // Use CSS variable for text color
      },
      ticks: {
        backdropColor: 'transparent', // transparent background for ticks
        color: 'var(--text-color-muted)', // Muted text color for ticks
        stepSize: 20, // Score steps (0, 20, 40, 60, 80, 100)
        font: { size: 10 }
      },
      suggestedMin: 0,
      suggestedMax: 100,
    }
  },
  plugins: {
    legend: {
      position: 'top' as const,
      labels: { color: 'var(--text-color)' }
    },
    title: {
      display: false,
      text: 'Core Abilities Radar',
      color: 'var(--text-color)'
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.r !== null) {
            label += context.parsed.r;
          }
          return label;
        }
      }
    }
  }
});


const generateMockReport = (sessionId: string): InterviewReport => {
  // Use setupStore to get info about the interview that was set up
  // This assumes setupStore still holds the data for this sessionId (good for mock, real app would fetch)
  const jobFieldLabel = setupStore.getJobFieldLabel || 'N/A';
  const experienceLevelLabel = setupStore.getExperienceLevelLabel || 'N/A';
  const selectedPhaseIdsFromSetup = setupStore.selectedPhaseIds;


  // --- Core Abilities (as per 赛项书) ---
  const coreAbilitiesData: CoreAbilityScore[] = [
    { id: 'professionalKnowledge', name: 'Professional Knowledge', score: Math.floor(Math.random() * 40) + 60, description: "Depth and breadth of technical expertise relevant to the role." },
    { id: 'skillsMatch', name: 'Skills Match', score: Math.floor(Math.random() * 40) + 55, description: "Alignment of your skills and experiences with job requirements." },
    { id: 'languageExpression', name: 'Language Expression', score: Math.floor(Math.random() * 30) + 50, description: "Clarity, conciseness, and fluency of verbal communication." },
    { id: 'logicalThinking', name: 'Logical Thinking', score: Math.floor(Math.random() * 35) + 60, description: "Ability to structure thoughts, analyze problems, and form coherent arguments." },
    { id: 'innovation', name: 'Innovation & Creativity', score: Math.floor(Math.random() * 30) + 45, description: "Capacity to generate novel ideas and solutions." },
    { id: 'stressResistance', name: 'Stress Resistance & Adaptability', score: Math.floor(Math.random() * 30) + 50, description: "Composure under pressure and ability to adapt to changing situations." },
  ];

  // --- Phase Breakdown ---
  const phaseBreakdownData: PhaseBreakdown[] = selectedPhaseIdsFromSetup.map(phaseId => {
    const phaseDef = ALL_POSSIBLE_PHASES.find(p => p.id === phaseId);
    const metrics: PhaseMetric[] = [];
    let strengths: string[] = [];
    let areas: string[] = [];

    // Mock metrics based on phase type
    if (phaseId === 'selfIntro' || phaseId === 'projectDiscussion') {
      metrics.push({ name: 'Clarity', score: Math.floor(Math.random() * 30) + 60, feedback: 'Generally clear, could be more concise.' });
      metrics.push({ name: 'Confidence', score: Math.floor(Math.random() * 30) + 55, feedback: 'Appeared reasonably confident.' });
      metrics.push({ name: 'STAR Method (Projects)', score: Math.floor(Math.random() * 40) + 50, feedback: 'Consider using STAR for project descriptions more consistently.' });
      strengths.push("Good articulation of past roles.");
      areas.push("Provide more quantifiable results in project examples.");
    } else if (phaseId === 'techQA') {
      metrics.push({ name: 'Correctness', score: Math.floor(Math.random() * 40) + 60, feedback: 'Most technical answers were accurate.' });
      metrics.push({ name: 'Explanation Depth', score: Math.floor(Math.random() * 35) + 55, feedback: 'Could elaborate more on certain concepts.' });
      metrics.push({ name: 'Problem Solving Approach', score: Math.floor(Math.random() * 30) + 60, feedback: 'Logical approach to hypothetical technical problems.' });
      strengths.push("Solid understanding of core technical concepts.");
      areas.push("Practice explaining complex topics in simpler terms.");
    } else if (phaseId === 'codingExercise') {
      metrics.push({ name: 'Logic & Approach', score: Math.floor(Math.random() * 40) + 50, feedback: 'The approach to the coding problem was sound.' });
      metrics.push({ name: 'Code Clarity/Readability', score: Math.floor(Math.random() * 30) + 55, feedback: 'Code structure could be cleaner.' });
      metrics.push({ name: 'Efficiency (Big O)', score: Math.floor(Math.random() * 30) + 45, feedback: 'Consider time/space complexity more explicitly.' });
      strengths.push("Good attempt at solving the problem under time pressure.");
      areas.push("Review common data structures for optimal solutions.");
    } else if (phaseId === 'behavioral' || phaseId === 'futureAspirations') {
      metrics.push({ name: 'Relevance of Examples', score: Math.floor(Math.random() * 30) + 65, feedback: 'Provided relevant examples for behavioral questions.' });
      metrics.push({ name: 'Authenticity', score: Math.floor(Math.random() * 25) + 60, feedback: 'Responses felt genuine.' });
      strengths.push("Clear articulation of career goals.");
      areas.push("Ensure answers directly address the question asked.");
    }

    return {
      phaseId: phaseId,
      phaseName: phaseDef?.name || 'Unknown Phase',
      overallPhaseScore: Math.floor(metrics.reduce((sum, m) => sum + m.score, 0) / Math.max(1, metrics.length)),
      metrics: metrics,
      strengths: strengths.length > 0 ? strengths : undefined,
      areasForImprovement: areas.length > 0 ? areas : undefined,
    };
  });


  // --- Key Moments ---
  const keyMomentsData: KeyMoment[] = [
    { timestampDisplay: "01:32 (Self Introduction)", observation: "Good energy and clear introduction of background.", isPositive: true },
    { timestampDisplay: "05:12 (Technical Q&A - Question on REST APIs)", observation: "Slight hesitation when defining idempotency, but recovered well.", suggestion: "Review HTTP methods and their properties like idempotency.", isPositive: false },
    { timestampDisplay: "12:45 (Coding Exercise - Palindrome Check)", observation: "Efficient two-pointer approach identified quickly.", isPositive: true, suggestion: "Remember to discuss edge cases (e.g., empty string, single character string) even if not explicitly asked." },
    { timestampDisplay: "18:03 (Behavioral - Team Conflict)", observation: "Used STAR method effectively to describe the situation and resolution.", isPositive: true },
  ];
  // Filter key moments based on actual phases included
  const filteredKeyMoments = keyMomentsData.filter(moment => {
    const phaseNameInTimestamp = moment.timestampDisplay.substring(moment.timestampDisplay.indexOf('(') + 7, moment.timestampDisplay.indexOf(')'));
    return selectedPhaseIdsFromSetup.some(id => ALL_POSSIBLE_PHASES.find(p => p.id === id)?.name.includes(phaseNameInTimestamp) || ALL_POSSIBLE_PHASES.find(p => p.id === id)?.shortName.includes(phaseNameInTimestamp) );
  });


  // --- Recommended Resources ---
  const recommendedResourcesData: RecommendedResource[] = [
    { id: 'res1', title: 'Mastering Behavioral Interviews (Video Course)', type: 'course', url: '#', icon: 'graduation-cap', description: "Learn advanced techniques for acing behavioral questions." },
    { id: 'res2', title: 'Technical Interview Handbook (Online Resource)', type: 'article', url: '#', icon: 'book-open', description: "Comprehensive guide covering common tech interview topics." },
    { id: 'res3', title: 'LeetCode Daily Challenge (Practice Tool)', type: 'tool', url: '#', icon: 'code', description: "Sharpen your coding skills with daily problems." },
  ];

  return {
    sessionId: sessionId,
    interviewJobFieldLabel: jobFieldLabel,
    interviewExperienceLevelLabel: experienceLevelLabel,
    interviewDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    overallScore: Math.floor(coreAbilitiesData.reduce((sum, ab) => sum + ab.score, 0) / coreAbilitiesData.length),
    overallSummaryText: `Good performance overall in the ${jobFieldLabel} (${experienceLevelLabel}) mock interview. Key strengths include [mock strength area]. Areas to focus on include [mock improvement area for better results].`,
    coreAbilities: coreAbilitiesData,
    keyMoments: filteredKeyMoments.slice(0, Math.floor(Math.random()*2)+2), // Show 2-3 relevant moments
    phaseBreakdown: phaseBreakdownData,
    // videoUrl: '#', // Placeholder
    recommendedResources: recommendedResourcesData.slice(0, Math.floor(Math.random()*2)+1), // Show 1-2 resources
    selectedPhaseIds: selectedPhaseIdsFromSetup,
  };
};

onMounted(() => {
  const sessionId = route.params.sessionId as string;
  // Simulate fetching/generating report data
  reportData.value = generateMockReport(sessionId);

  // Update chart options for current theme dynamically
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const textColor = currentTheme === 'dark' ? 'rgba(224, 224, 224, 0.8)' : 'rgba(44, 62, 80, 0.8)';
  const gridColor = currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)';

  chartOptions.value = {
    ...chartOptions.value,
    scales: {
      r: {
        ...chartOptions.value.scales.r,
        angleLines: { display: true, color: gridColor },
        grid: { color: gridColor },
        pointLabels: {
          font: { size: 11 }, // Slightly smaller for more labels
          color: textColor
        },
        ticks: {
          ...chartOptions.value.scales.r.ticks,
          color: currentTheme === 'dark' ? 'rgba(224,224,224,0.6)' : 'rgba(44,62,80,0.6)'
        }
      }
    },
    plugins: {
      ...chartOptions.value.plugins,
      legend: {
        ...chartOptions.value.plugins?.legend,
        labels: { color: textColor }
      },
      title: {
        ...chartOptions.value.plugins?.title,
        color: textColor
      }
    }
  };
});
</script>

<style scoped>
.report-view {
  padding: 1.5rem 2rem;
  max-width: 1000px; /* Consistent max-width */
  margin: 0 auto;
  color: var(--text-color);
}
.report-view-loading {
  text-align: center; padding: 3rem; font-size: 1.2rem;
}

.report-header {
  margin-bottom: 2rem;
  text-align: center;
}
.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.25rem;
  display: inline-flex; align-items: center; gap: 0.75rem;
}
.page-title .fa-icon { color: var(--primary-color); }

.report-subtitle {
  font-size: 1rem;
  color: var(--text-color);
  opacity: 0.8;
}

.report-section {
  background-color: var(--card-bg-color);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
  box-shadow: 0 3px 10px rgba(0,0,0,0.05);
}
[data-theme="dark"] .report-section {
  box-shadow: 0 3px 10px rgba(0,0,0,0.15);
}


.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.overall-summary-section .summary-card {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}
.overall-score {
  background-color: var(--primary-color);
  color: white;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  min-width: 150px;
}
.score-value {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
}
.score-value span {
  font-size: 1rem;
  opacity: 0.8;
  font-weight: 500;
}
.score-label {
  font-size: 0.9rem;
  margin-top: 0.25rem;
  opacity: 0.9;
}
.summary-text {
  flex: 1;
  font-size: 1rem;
  line-height: 1.6;
  min-width: 250px;
}

.radar-chart-section .chart-container {
  height: 350px; /* Adjust as needed */
  position: relative; /* For chart.js responsiveness */
}
@media (max-width: 600px) {
  .radar-chart-section .chart-container {
    height: 300px;
  }
  .chart-container .pointLabels { font-size: 10px !important; } /* Attempt to make labels smaller */
}


.tabs {
  display: flex;
  border-bottom: 2px solid var(--border-color);
  margin-bottom: 1.5rem;
}
.tab-button {
  padding: 0.75rem 1.25rem;
  background: none;
  border: none;
  color: var(--text-color);
  opacity: 0.7;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px; /* Align with parent border */
  transition: color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.tab-button:hover {
  opacity: 1;
  color: var(--primary-color);
}
.tab-button.active {
  opacity: 1;
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
  font-weight: 600;
}

.tab-content {
  /* Styles for content area if needed */
}

.phase-breakdown-content .phase-card {
  background-color: var(--bg-color); /* Slightly different bg for cards within tabs */
  padding: 1.25rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
}
.phase-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--primary-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.phase-score-badge {
  font-size: 0.8rem;
  font-weight: normal;
  background-color: var(--primary-color);
  color: white;
  padding: 0.2em 0.6em;
  border-radius: 1em;
}


.phase-metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}
.metric-item {
  background-color: var(--card-bg-color);
  padding: 0.75rem;
  border-radius: 4px;
  border-left: 3px solid var(--primary-color);
}
.metric-name { font-weight: 500; font-size: 0.9rem; margin-bottom: 0.25rem; }
.metric-score { font-weight: bold; color: var(--primary-color); }
.metric-feedback { font-size: 0.85rem; opacity: 0.8; line-height: 1.5; }

.strengths-list, .improvements-list { margin-top: 0.75rem; }
.strengths-list strong, .improvements-list strong { font-size: 0.9rem; display: block; margin-bottom: 0.25rem;}
.strengths-list ul, .improvements-list ul { list-style: disc; padding-left: 1.25rem; font-size: 0.85rem; opacity: 0.9;}
.strengths-list li { color: #28a745; } /* Green for strengths */
[data-theme="dark"] .strengths-list li { color: #68d391; }
.improvements-list li { color: #e53e3e; } /* Red for improvements */
[data-theme="dark"] .improvements-list li { color: #fc8181; }


.key-moments-content .key-moment-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-color);
  border-radius: 4px;
  margin-bottom: 0.5rem;
}
.key-moment-item:last-child { border-bottom: none; }
.moment-icon { font-size: 1.25rem; padding-top: 0.2rem; }
.key-moment-item.positive .moment-icon { color: #28a745; } /* Green */
[data-theme="dark"] .key-moment-item.positive .moment-icon { color: #68d391; }
.key-moment-item.improvement .moment-icon { color: #e53e3e; } /* Red */
[data-theme="dark"] .key-moment-item.improvement .moment-icon { color: #fc8181; }

.moment-timestamp { font-size: 0.8rem; opacity: 0.7; margin-bottom: 0.25rem; font-weight: 500;}
.moment-observation { font-size: 0.95rem; margin-bottom: 0.35rem; line-height: 1.5;}
.moment-suggestion { font-size: 0.9rem; opacity: 0.9; line-height: 1.5;}
.moment-suggestion strong { font-weight: 500; color: var(--primary-color); }

.core-abilities-detail-content .ability-detail-item {
  padding: 1rem;
  margin-bottom: 0.75rem;
  background-color: var(--bg-color);
  border-radius: 4px;
  border-left: 3px solid var(--primary-color);
}
.ability-detail-item h4 { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.3rem; }
.ability-detail-item p { font-size: 0.9rem; opacity: 0.8; line-height: 1.5; }
.score-value-small { font-size: 0.9em; color: var(--primary-color); font-weight: bold;}


.video-playback-section .video-placeholder {
  background-color: #000;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #777;
  border: 1px solid var(--border-color);
}
.video-placeholder .play-icon {
  font-size: 3rem;
  color: rgba(255,255,255,0.7);
  margin-bottom: 0.5rem;
  cursor: pointer;
}
.video-placeholder p { font-size: 0.9rem; }


.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}
.resource-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  text-decoration: none;
  color: var(--text-color);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
}
.resource-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.08);
}
[data-theme="dark"] .resource-card:hover {
  box-shadow: 0 6px 12px rgba(0,0,0,0.2);
}

.resource-icon-container {
  background-color: var(--primary-color-translucent, color-mix(in srgb, var(--primary-color) 15%, transparent));
  color: var(--primary-color);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1.1rem;
}
.resource-text { flex-grow: 1; }
.resource-title { font-weight: 600; font-size: 0.95rem; margin-bottom: 0.2rem; }
.resource-description { font-size: 0.8rem; opacity: 0.7; line-height: 1.4; }
.resource-type-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 0.7rem;
  background-color: var(--border-color);
  padding: 0.15rem 0.4rem;
  border-radius: 0.25rem;
  text-transform: capitalize;
}

.report-actions {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center; /* Center buttons */
  flex-wrap: wrap;
}
.report-actions .form-button {
  /* Reuses global form-button styling or define specific ones */
  padding: 0.75rem 1.5rem;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 200px;
  justify-content: center;
}
.report-actions .form-button.secondary-button {
  background-color: var(--card-bg-color);
  color: var(--text-color);
  border: 1px solid var(--primary-color);
}
.report-actions .form-button.secondary-button:hover {
  background-color: color-mix(in srgb, var(--border-color) 50%, var(--card-bg-color) 50%);
}
</style>