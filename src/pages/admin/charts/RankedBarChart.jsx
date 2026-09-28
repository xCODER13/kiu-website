import { useMemo } from 'react'
import { ParentSize } from '@visx/responsive'
import { Group } from '@visx/group'
import { scaleBand, scaleLinear } from '@visx/scale'
import { Bar } from '@visx/shape'

const MARGIN = { top: 4, right: 40, bottom: 4, left: 4 }
const BAR_HEIGHT = 26
const BAR_GAP = 10

// Gorizontal "reyting" ustunli grafik — top-yangiliklar, top-tadbirlar va
// SortingHat fakultetlari statistikasi uchun qayta ishlatiladi. Yorliq har
// doim ustun ustida (chapda) matn sifatida chiziladi — SVG ichida uzun
// o'zbekcha sarlavhalarni kesish/qisqartirish shart bo'lmasin deb, HTML overlay
// ishlatiladi (SVG <text> uzun matnni o'ralmaydi).
function Chart({ width, data, color, emptyLabel }) {
  const innerWidth = Math.max(width - MARGIN.left - MARGIN.right, 10)
  const height = data.length * (BAR_HEIGHT + BAR_GAP) - BAR_GAP + MARGIN.top + MARGIN.bottom

  const yScale = useMemo(() => scaleBand({
    domain: data.map((_, i) => i),
    range: [0, data.length * (BAR_HEIGHT + BAR_GAP) - BAR_GAP],
    padding: 0.25,
  }), [data])

  const maxValue = Math.max(1, ...data.map(d => d.value))
  const xScale = useMemo(() => scaleLinear({ domain: [0, maxValue], range: [0, innerWidth], nice: true }), [maxValue, innerWidth])

  if (data.length === 0) {
    return <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', padding: '1.5rem 0' }}>{emptyLabel}</p>
  }

  return (
    <div style={{ position: 'relative', width, height }}>
      {/* Yorliqlar — SVG ustidagi HTML qatlam, har bir ustun bilan bir xil y pozitsiyada */}
      {data.map((d, i) => (
        <div key={i} style={{
          position: 'absolute', left: 0, top: MARGIN.top + i * (BAR_HEIGHT + BAR_GAP),
          height: BAR_HEIGHT, display: 'flex', alignItems: 'center',
          fontSize: 11.5, color: 'var(--text)', fontWeight: 500,
          maxWidth: width - 46, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          zIndex: 1, pointerEvents: 'none', textShadow: '0 0 4px var(--bg, #fff), 0 0 4px var(--bg, #fff)',
        }}>
          {d.label}
        </div>
      ))}
      <svg width={width} height={height}>
        <Group left={MARGIN.left} top={MARGIN.top}>
          {data.map((d, i) => {
            const barWidth = xScale(d.value)
            const barY = yScale(i)
            return (
              <Group key={i}>
                <rect x={0} y={barY} width={innerWidth} height={BAR_HEIGHT} rx={6} fill="var(--bg-2, #f3f4f6)" />
                <Bar x={0} y={barY} width={Math.max(barWidth, 3)} height={BAR_HEIGHT} rx={6} fill={color} />
                <text x={Math.max(barWidth, 3) + 8} y={barY + BAR_HEIGHT / 2} dy="0.35em" fontSize={11} fontWeight={700} fill="var(--text)">
                  {d.value}
                </text>
              </Group>
            )
          })}
        </Group>
      </svg>
    </div>
  )
}

export default function RankedBarChart({ data, color = '#7c3aed', emptyLabel = "Ma'lumot yo'q" }) {
  return (
    <ParentSize>
      {({ width }) => (width > 0 ? <Chart width={width} data={data} color={color} emptyLabel={emptyLabel} /> : null)}
    </ParentSize>
  )
}
