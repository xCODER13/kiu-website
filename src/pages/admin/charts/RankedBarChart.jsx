import { useMemo } from 'react'
import { ParentSize } from '@visx/responsive'
import { Group } from '@visx/group'
import { scaleLinear } from '@visx/scale'
import { Bar } from '@visx/shape'

const MARGIN = { top: 2, right: 36, bottom: 2, left: 0 }
const LABEL_HEIGHT = 18 // yorliq qatori (ustun tepasida)
const BAR_HEIGHT = 14
const ROW_GAP = 14
const ROW_HEIGHT = LABEL_HEIGHT + BAR_HEIGHT

// Gorizontal "reyting" ustunli grafik — top-yangiliklar, top-tadbirlar,
// SortingHat va ariza yo'nalishlari statistikasi uchun qayta ishlatiladi. Har bir qator
// ikki qatlamdan iborat: tepada yorliq (HTML — uzun o'zbekcha sarlavhalar
// SVG <text>'da o'ralmaydi, shuning uchun ellipsis bilan kesiladi), pastda esa
// ustun. Yorliq ustunning USTIGA chizilmaydi — avval shunday edi va matn ustun
// bilan (ayniqsa qizil fonda va "0" qiymat bilan) qoplanib, o'qib bo'lmasdi.
const chartHeight = count => count * (ROW_HEIGHT + ROW_GAP) - ROW_GAP + MARGIN.top + MARGIN.bottom

function Chart({ width, height, data, color }) {
  const innerWidth = Math.max(width - MARGIN.left - MARGIN.right, 10)

  const maxValue = Math.max(1, ...data.map(d => d.value))
  const xScale = useMemo(() => scaleLinear({ domain: [0, maxValue], range: [0, innerWidth], nice: true }), [maxValue, innerWidth])

  return (
    <div className="adm-chart-box" style={{ width, height }}>
      {/* Yorliqlar — har bir ustunning tepasida, o'z qatorida */}
      {data.map((d, i) => (
        // Faqat geometriya inline (qator joyi konstantalardan hisoblanadi); ko'rinish `.adm-bar-label` da
        <div key={i} title={d.label} className="adm-bar-label" style={{
          left: MARGIN.left, top: MARGIN.top + i * (ROW_HEIGHT + ROW_GAP),
          height: LABEL_HEIGHT, width: innerWidth, lineHeight: `${LABEL_HEIGHT}px`,
        }}>
          {d.label}
        </div>
      ))}
      <svg className="adm-chart-svg" width={width} height={height}>
        <Group left={MARGIN.left} top={MARGIN.top}>
          {data.map((d, i) => {
            const barY = i * (ROW_HEIGHT + ROW_GAP) + LABEL_HEIGHT
            const barWidth = Math.max(xScale(d.value), 3)
            return (
              <Group key={i}>
                <rect x={0} y={barY} width={innerWidth} height={BAR_HEIGHT} rx={5} fill="var(--color-surface-2)" />
                <Bar x={0} y={barY} width={barWidth} height={BAR_HEIGHT} rx={5} fill={color} />
                <text x={innerWidth + 8} y={barY + BAR_HEIGHT / 2} dy="0.35em" fontSize={11} fontWeight={700} fill="var(--color-text)">
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

export default function RankedBarChart({ data, color = 'var(--color-brand)', emptyLabel = "Ma'lumot yo'q" }) {
  if (data.length === 0) {
    return <p className="adm-chart-empty">{emptyLabel}</p>
  }

  // MUHIM: `ParentSize` grafikni o'zining ichidagi ABSOLUTE konteynerda chizadi, shuning
  // uchun uning o'zi oqimda 0 balandlikda qoladi — kartaning balandligi grafikni
  // sig'dirmay, grafik kartadan pastga toshib chiqib kesilib ketadi (Stats'dagi pastki
  // 3 ta karta shunday buzilgan edi). Tashqi konteynerga aniq `height` berish shart
  // (TrendLineChart ham xuddi shunday qiladi). Balandlik faqat qatorlar soniga bog'liq.
  const height = chartHeight(data.length)
  return (
    <div className="adm-chart-frame" style={{ height }}>
      <ParentSize>
        {({ width }) => (width > 0 ? <Chart width={width} height={height} data={data} color={color} /> : null)}
      </ParentSize>
    </div>
  )
}