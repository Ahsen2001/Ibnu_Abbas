import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
)

export const analyticsPalette = {
  teal: '#0f766e',
  emerald: '#059669',
  cyan: '#0891b2',
  amber: '#d97706',
  rose: '#e11d48',
  slate: '#64748b',
  violet: '#7c3aed',
  blue: '#2563eb',
  indigo: '#4f46e5',
  mint: '#14b8a6',
  surface: '#ffffff',
  grid: 'rgba(148, 163, 184, 0.18)',
  text: '#0f172a',
}

export const chartFontColor = '#475569'

export const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: chartFontColor,
        boxWidth: 12,
        boxHeight: 12,
        padding: 16,
      },
    },
    tooltip: {
      backgroundColor: '#0f172a',
      titleColor: '#f8fafc',
      bodyColor: '#e2e8f0',
      padding: 12,
      cornerRadius: 10,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: chartFontColor,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: analyticsPalette.grid,
      },
      ticks: {
        color: chartFontColor,
        precision: 0,
      },
    },
  },
} as const
