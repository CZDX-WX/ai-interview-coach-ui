<template>
  <section class="report-section radar-chart-section">
    <h2 class="section-title">核心能力雷达图</h2>
    <div class="chart-wrapper">
      <Radar
          v-if="chartDataReady"
          :data="themedChartData" :options="dynamicChartOptions" :key="themeStore.currentTheme" />
      <p v-else class="no-data-message">核心能力数据不足，无法生成雷达图。</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Radar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title,
  type ChartOptions // 导入 ChartOptions 类型
} from 'chart.js';
import type { CoreAbilityScore } from '@/types/reportTypes';
import { useThemeStore } from '@/stores/theme'; // 引入主题 store

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, Title);

const props = defineProps<{
  coreAbilities: CoreAbilityScore[];
}>();

const themeStore = useThemeStore(); // 获取主题 store 实例

const chartDataReady = computed(() => {
  return props.coreAbilities && props.coreAbilities.length > 0;
});

// 计算属性，根据主题动态生成图表数据 (主要是数据集颜色)
const themedChartData = computed(() => {
  if (!chartDataReady.value) return { labels: [], datasets: [] };

  const isDark = themeStore.currentTheme === 'dark';
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || (isDark ? '#4b89fc' : '#007bff');
  const textColorMuted = getComputedStyle(document.documentElement).getPropertyValue('--text-color-muted').trim() || (isDark ? '#a2aab3' : '#6c757d');


  return {
    labels: props.coreAbilities.map(ab => ab.name), // 假设 name 已经是中文
    datasets: [
      {
        label: '您的表现评估',
        data: props.coreAbilities.map(ab => ab.score),
        backgroundColor: isDark ? `rgba(${hexToRgb(primaryColor)}, 0.4)` : `rgba(${hexToRgb(primaryColor)}, 0.2)`,
        borderColor: primaryColor,
        borderWidth: 2,
        pointBackgroundColor: primaryColor,
        pointBorderColor: isDark ? 'var(--card-bg-color)' : '#fff', // 点的边框颜色
        pointHoverBackgroundColor: isDark ? '#fff' : 'var(--card-bg-color)',
        pointHoverBorderColor: primaryColor,
        pointRadius: 4, // 调整数据点大小
        pointHoverRadius: 6,
      }
    ]
  };
});

// 计算属性，根据主题动态生成图表选项
const dynamicChartOptions = computed((): ChartOptions<'radar'> => {
  const isDark = themeStore.currentTheme === 'dark';
  // 尝试从 CSS 变量获取颜色，提供备用值
  const docStyle = getComputedStyle(document.documentElement);
  const textColor = docStyle.getPropertyValue('--text-color').trim() || (isDark ? '#e0e0e7' : '#2c3e50');
  const gridAndAngleColor = docStyle.getPropertyValue('--border-color').trim() || (isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.1)');
  const tickColor = docStyle.getPropertyValue('--text-color-muted').trim() || (isDark ? 'rgba(224, 224, 224, 0.65)' : 'rgba(44, 62, 80, 0.65)');

  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { display: true, color: gridAndAngleColor },
        grid: { color: gridAndAngleColor },
        pointLabels: {
          font: { size: 11, family: "'Inter', sans-serif" },
          color: textColor
        },
        ticks: {
          backdropColor: 'transparent',
          color: tickColor,
          stepSize: 20,
          font: { size: 10, family: "'Inter', sans-serif" },
          showLabelBackdrop: false, // 移除刻度数字的背景板
        },
        suggestedMin: 0,
        suggestedMax: 100,
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: textColor,
          font: { family: "'Inter', sans-serif", size: 12 }
        }
      },
      tooltip: {
        bodyFont: { family: "'Inter', sans-serif" },
        titleFont: { family: "'Inter', sans-serif" },
        backgroundColor: isDark ? '#2c3035' : '#fff', // 工具提示背景
        titleColor: textColor,
        bodyColor: textColor,
        borderColor: gridAndAngleColor,
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) { label += '：'; }
            if (context.parsed.r !== null) { label += context.parsed.r; }
            return label;
          }
        }
      }
    },
    elements: { // 默认元素样式
      line: {
        borderWidth: 2, // 之前在 themedChartData 数据集里，这里是全局默认
      }
    }
  };
});

// Helper function to convert hex to rgb components for rgba usage
function hexToRgb(hex: string): string {
  let r = '0', g = '0', b = '0';
  if (hex.length === 4) { // #RGB
    r = "0x" + hex[1] + hex[1];
    g = "0x" + hex[2] + hex[2];
    b = "0x" + hex[3] + hex[3];
  } else if (hex.length === 7) { // #RRGGBB
    r = "0x" + hex[1] + hex[2];
    g = "0x" + hex[3] + hex[4];
    b = "0x" + hex[5] + hex[6];
  }
  return `${+r},${+g},${+b}`;
}

</script>

<style scoped>
/* ... (样式保持不变) ... */
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
[data-theme="dark"] .section-title {
  color: #ffffff;
}
.chart-wrapper {
  height: 380px;
  position: relative;
  padding: 1rem 0;
}
.no-data-message {
  text-align: center;
  padding: 2rem;
  font-style: italic;
  opacity: 0.7;
}
</style>