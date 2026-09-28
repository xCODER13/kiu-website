import { useMemo, useCallback } from 'react'
import { ParentSize } from '@visx/responsive'
import { Group } from '@visx/group'
import { scaleTime, scaleLinear } from '@visx/scale'
import { LinePath, Circle } from '@visx/shape'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { GridRows } from '@visx/grid'
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip'
import { localPoint } from '@visx/event'

const MARGIN = { top: 12, right: 16, bottom: 28, left: 34 }
const tooltipStyles = {
  ...defaultStyles,
  background: 'var(--bg, #fff)',
  color: 'var(--text, #1a1a2e)',
  border: '1px solid var(--border, #e5e7eb)',
  borderRadius: 8,
  padding: '8px 10px',
  fontSize: 11,
  boxShadow: '0 4px 16px rgba(0,0,0,.12)',
}

// visx — past darajadagi kutubxona (D3 primitivlariga yaqin), shuning uchun
// bu komponent barcha o'lchash/scale/tooltip mantig'ini o'z ichiga oladi va
// Stats.jsx tomonidan faqat {date, ...seriesQiymatlari} massivi bilan chaqiriladi.
//
// data: [{ date: Date, [series[].key]: number }]
// series: [{ key, label, color }]
function Chart({ width, height, data, series, dateLabel }) {
  const { tooltipData, tooltipLeft, tooltipTop, showTooltip, hideTooltip } = useTooltip()

  const innerWidth = Math.max(width - MARGIN.left - MARGIN.right, 10)
  const innerHeight = Math.max(height - MARGIN.top - MARGIN.bottom, 10)

  const xScale = useMemo(() => scaleTime({
    domain: [data[0]?.date, data[data.length - 1]?.date],
    range: [0, innerWidth],
  }), [data, innerWidth])

  const yMax = useMemo(() => {
    const max = Math.max(1, ...data.flatMap(d => series.map(s => d[s.key] || 0)))
    return max
  }, [data, series])

  const yScale = useMemo(() => scaleLinear({
    domain: [0, yMax],
    range: [innerHeight, 0],
    nice: true,
  }), [yMax, innerHeight])

  // Sichqoncha eng yaqin nuqtaga bog'lanadi — d3-array'ga qaram bo'lmaslik uchun
  // oddiy chiziqli qidiruv (nuqtalar soni kichik, 30-52 ta, performance muammo emas).
  const findNearest = useCallback(x => {
    const targetMs = xScale.invert(x).getTime()
    let nearest = data[0]
    let nearestDiff = Infinity
    for (const d of data) {
      const diff = Math.abs(d.date.getTime() - targetMs)
      if (diff < nearestDiff) { nearestDiff = diff; nearest = d }
    }
    return nearest
  }, [data, xScale])

  const handleMove = useCallback(event => {
    const point = localPoint(event)
    if (!point) return
    const x = point.x - MARGIN.left
    if (x < 0 || x > innerWidth) return hideTooltip()
    const d = findNearest(x)
    if (!d) return
    showTooltip({ tooltipData: d, tooltipLeft: xScale(d.date) + MARGIN.left, tooltipTop: MARGIN.top })
  }, [findNearest, xScale, innerWidth, showTooltip, hideTooltip])

  if (data.length === 0) return null

  return (
    <div style={{ position: 'relative' }}>
      <svg width={width} height={height} onMouseMove={handleMove} onMouseLeave={hideTooltip} style={{ overflow: 'visible' }}>
        <Group left={MARGIN.left} top={MARGIN.top}>
          <GridRows scale={yScale} width={innerWidth} height={innerHeight} stroke="var(--border, #e5e7eb)" strokeDasharray="3,3" numTicks={4} />
          {series.map(s => (
            <LinePath
              key={s.key}
              data={data}
              x={d => xScale(d.date)}
              y={d => yScale(d[s.key] || 0)}
              stroke={s.color}
              strokeWidth={2}
              curve={undefined}
            />
          ))}
          {tooltipData && series.map(s => (
            <Circle key={s.key} cx={xScale(tooltipData.date)} cy={yScale(tooltipData[s.key] || 0)} r={4} fill={s.color} stroke="#fff" strokeWidth={1.5} />
          ))}
          <AxisLeft scale={yScale} numTicks={4} stroke="var(--muted, #6b7280)" tickStroke="var(--muted, #6b7280)"
            tickLabelProps={() => ({ fill: 'var(--muted, #6b7280)', fontSize: 10, textAnchor: 'end', dx: -4, dy: 3 })} />
          <AxisBottom top={innerHeight} scale={xScale} numTicks={Math.min(6, data.length)} stroke="var(--muted, #6b7280)" tickStroke="var(--muted, #6b7280)"
            tickFormat={v => dateLabel(v instanceof Date ? v : new Date(v))}
            tickLabelProps={() => ({ fill: 'var(--muted, #6b7280)', fontSize: 10, textAnchor: 'middle' })} />
        </Group>
      </svg>
      {tooltipData && (
        <TooltipWithBounds left={tooltipLeft} top={tooltipTop} style={tooltipStyles}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{dateLabel(tooltipData.date, true)}</div>
          {series.map(s => (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
              {s.label}: <strong>{tooltipData[s.key] || 0}</strong>
            </div>
          ))}
        </TooltipWithBounds>
      )}
    </div>
  )
}

export default function TrendLineChart({ data, series, height = 240, dateLabel }) {
  return (
    <div style={{ width: '100%', height }}>
      <ParentSize>
        {({ width }) => (width > 0 ? <Chart width={width} height={height} data={data} series={series} dateLabel={dateLabel} /> : null)}
      </ParentSize>
    </div>
  )
}
