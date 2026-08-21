import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'

const SEVERITY = [
  { name: 'High', value: 13, color: '#ff7246' },
  { name: 'Mid', value: 41, color: '#f6ac4c' },
  { name: 'Low', value: 12, color: '#afea00' },
]

const TREND = [18, 22, 19, 28, 24, 31, 27, 34, 30, 38, 33, 42]

export function IssuesSeverityChart({ compact = false }: { compact?: boolean }) {
  const option = useMemo(
    () => ({
      animation: false,
      tooltip: { show: false },
      series: [
        {
          type: 'pie',
          radius: compact ? ['58%', '82%'] : ['55%', '78%'],
          center: ['50%', '50%'],
          silent: true,
          label: { show: false },
          labelLine: { show: false },
          itemStyle: {
            borderColor: 'rgba(0,0,0,0.55)',
            borderWidth: 2,
          },
          data: SEVERITY.map((item) => ({
            name: item.name,
            value: item.value,
            itemStyle: { color: item.color },
          })),
        },
      ],
    }),
    [compact],
  )

  return (
    <ReactECharts
      option={option}
      style={{ width: compact ? 54 : 72, height: compact ? 54 : 72 }}
      opts={{ renderer: 'svg' }}
    />
  )
}

export function IssuesTrendChart({ height = 56 }: { height?: number }) {
  const option = useMemo(
    () => ({
      animation: false,
      grid: { left: 0, right: 0, top: 4, bottom: 0 },
      xAxis: { type: 'category', show: false, data: TREND.map((_, i) => i) },
      yAxis: { type: 'value', show: false, min: 10, max: 50 },
      series: [
        {
          type: 'line',
          data: TREND,
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 2, color: '#afea00' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(174, 234, 0, 0.55)' },
                { offset: 1, color: 'rgba(174, 234, 0, 0)' },
              ],
            },
          },
        },
      ],
    }),
    [],
  )

  return (
    <ReactECharts
      option={option}
      style={{ width: '100%', height }}
      opts={{ renderer: 'svg' }}
    />
  )
}

export function IssuesSeverityLegend() {
  return (
    <div className="issues__sev-list">
      <div>
        <strong className="is-red">13</strong> High (5)
      </div>
      <div>
        <strong className="is-orange">41</strong> Mid (3-4)
      </div>
      <div>
        <strong className="is-lime">12</strong> Low (1-2)
      </div>
    </div>
  )
}
