import { useMemo, useCallback } from 'react'
import { ParentSize } from '@visx/responsive'
import { Group } from '@visx/group'
import { scaleTime, scaleLinear } from '@visx/scale'
import { LinePath, Circle, Line } from '@visx/shape'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { GridRows } from '@visx/grid'
import { useTooltip, TooltipWithBounds } from '@visx/tooltip'
import { localPoint } from '@visx/event'

// Taxta (Admin-Stats, 6.22): chap 40 px (y-o'q yorliqlari), o'ng 16, tepa 12, past 28
const MARGIN = { top: 12, right: 16, bottom: 28, left: 40 }
// visx — past darajadagi kutubxona (D3 primitivlariga yaqin), shuning uchun
// bu komponent barcha o'lchash/scale/tooltip mantig'ini o'z ichiga oladi va
// Stats.jsx tomonidan faqat {date, ...seriesQiymatlari} massivi bilan chaqiriladi.
//
// data: [{ date: Date, [series[].key]: number }]
// series: [{ key, label, color }]
// ariaLabel: grafikning nomi (ekran o'quvchi uchun)
function Chart({ width, height, data, series, dateLabel, ariaLabel }) {
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

  // X o'qi yorliqlari: nuqtalar orasida teng qadam bilan ~6 ta (taxta: 02.09, 08.09 … 01.10) — visx'ning
  // "chiroyli" sanalari (har 7 kun, oy boshi …) oxirgi kunni tashlab ketardi. Oxirgi nuqta, agar oxirgi
  // yorliqdan yarim qadamdan uzoq bo'lsa, qo'shiladi.
  const tickValues = useMemo(() => {
    const step = Math.max(1, Math.ceil((data.length - 1) / 5))
    const ticks = data.filter((_, i) => i % step === 0).map(d => d.date)
    if ((data.length - 1) % step >= step / 2) ticks.push(data[data.length - 1].date)
    return ticks
  }, [data])

  const showPoint = useCallback(d => {
    showTooltip({ tooltipData: d, tooltipLeft: xScale(d.date) + MARGIN.left, tooltipTop: MARGIN.top })
  }, [showTooltip, xScale])

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
    showPoint(d)
  }, [findNearest, showPoint, innerWidth, hideTooltip])

  // Klaviatura: Tab bilan grafikka fokus → oxirgi nuqta; ←/→ — qo'shni nuqta, Home/End — chetki
  // nuqtalar, Esc — tooltip yopiladi. Sichqonchasiz foydalanuvchi ham har bir qiymatni o'qiy oladi.
  const handleFocus = useCallback(() => {
    if (!tooltipData) showPoint(data[data.length - 1])
  }, [tooltipData, showPoint, data])

  const handleKeyDown = useCallback(event => {
    const i = tooltipData ? data.indexOf(tooltipData) : data.length - 1
    let next
    if (event.key === 'ArrowLeft') next = Math.max(i - 1, 0)
    else if (event.key === 'ArrowRight') next = Math.min(i + 1, data.length - 1)
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = data.length - 1
    else if (event.key === 'Escape') return hideTooltip()
    else return
    event.preventDefault()
    showPoint(data[next])
  }, [tooltipData, data, showPoint, hideTooltip])

  if (data.length === 0) return null

  const tickLabel = anchor => () => ({ className: 'adm-chart-tick', textAnchor: anchor })

  return (
    <div className="adm-chart-box">
      <svg
        className="adm-chart-svg--visible" width={width} height={height}
        role="img" aria-label={`${ariaLabel}. Nuqtalar orasida o'tish: chap va o'ng strelka tugmalari`}
        tabIndex={0}
        onMouseMove={handleMove} onMouseLeave={hideTooltip}
        onFocus={handleFocus} onBlur={hideTooltip} onKeyDown={handleKeyDown}
      >
        <Group left={MARGIN.left} top={MARGIN.top}>
          <GridRows scale={yScale} width={innerWidth} height={innerHeight} stroke="var(--color-border)" strokeDasharray="3 3" numTicks={4} />
          <AxisLeft scale={yScale} numTicks={4} hideAxisLine hideTicks tickLabelProps={() => ({ className: 'adm-chart-tick', textAnchor: 'end', dx: -8, dy: 4 })} />
          <AxisBottom top={innerHeight} scale={xScale} tickValues={tickValues} hideAxisLine hideTicks
            tickFormat={v => dateLabel(v instanceof Date ? v : new Date(v))}
            tickLabelProps={tickLabel('middle')} />
          {series.map(s => (
            <LinePath
              key={s.key}
              data={data}
              x={d => xScale(d.date)}
              y={d => yScale(d[s.key] || 0)}
              stroke={s.color}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="none"
            />
          ))}
          {tooltipData && (
            <>
              {/* yo'naltiruvchi vertikal chiziq (taxta) */}
              <Line className="adm-chart-guide" from={{ x: xScale(tooltipData.date), y: 0 }} to={{ x: xScale(tooltipData.date), y: innerHeight }} />
              {series.map(s => (
                <Circle key={s.key} cx={xScale(tooltipData.date)} cy={yScale(tooltipData[s.key] || 0)} r={5} fill={s.color} stroke="var(--color-bg)" strokeWidth={2} />
              ))}
            </>
          )}
        </Group>
      </svg>
      {tooltipData && (
        // `unstyled` — visx'ning standart (oq fon, kulrang matn) stillari o'chiriladi; ko'rinish `.adm-tooltip` da.
        // `role="status"` — klaviatura bilan o'tganda ekran o'quvchi joriy nuqtani o'qiydi.
        <TooltipWithBounds left={tooltipLeft} top={tooltipTop} unstyled className="adm-tooltip" role="status">
          <div className="adm-tooltip-title">{dateLabel(tooltipData.date, true)}</div>
          {series.map(s => (
            <div key={s.key} className="adm-tooltip-row">
              <span className="adm-tooltip-dot" style={{ background: s.color }} />
              {s.label}: <strong>{tooltipData[s.key] || 0}</strong>
            </div>
          ))}
        </TooltipWithBounds>
      )}
    </div>
  )
}

export default function TrendLineChart({ data, series, height = 240, dateLabel, ariaLabel = 'Trend grafigi' }) {
  return (
    <div className="adm-chart-frame" style={{ height }}>
      <ParentSize>
        {({ width }) => (width > 0 ? <Chart width={width} height={height} data={data} series={series} dateLabel={dateLabel} ariaLabel={ariaLabel} /> : null)}
      </ParentSize>
    </div>
  )
}
