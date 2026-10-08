import { useMemo } from 'react'
import { ParentSize } from '@visx/responsive'
import { Group } from '@visx/group'
import { scaleLinear } from '@visx/scale'
import { EmptyState } from '../shared/StateViews.jsx'

// Taxta (Admin-Stats, 6.22) o'lchamlari: qator = yorliq (18) + 4 + ustun (12); qatorlar oralig'i 12;
// o'ngda 36 px qiymat ustuni va 10 px masofa.
const LABEL_HEIGHT = 18 // yorliq qatori (ustun tepasida)
const LABEL_GAP = 4
const BAR_HEIGHT = 12
const ROW_GAP = 12
const VALUE_WIDTH = 36
const VALUE_GAP = 10
const ROW_HEIGHT = LABEL_HEIGHT + LABEL_GAP + BAR_HEIGHT
const BAR_RADIUS = BAR_HEIGHT / 2

// Gorizontal "reyting" ustunli grafik — top-yangiliklar, top-tadbirlar,
// SortingHat va ariza yo'nalishlari statistikasi uchun qayta ishlatiladi. Har bir qator
// ikki qatlamdan iborat: tepada yorliq (HTML — uzun o'zbekcha sarlavhalar
// SVG <text>'da o'ralmaydi, shuning uchun ellipsis bilan kesiladi), pastda esa
// ustun. Yorliq ustunning USTIGA chizilmaydi — avval shunday edi va matn ustun
// bilan (ayniqsa qizil fonda va "0" qiymat bilan) qoplanib, o'qib bo'lmasdi.
const chartHeight = count => count * (ROW_HEIGHT + ROW_GAP) - ROW_GAP

function Chart({ width, height, data, color }) {
  const trackWidth = Math.max(width - VALUE_WIDTH - VALUE_GAP, 10)

  const maxValue = Math.max(1, ...data.map(d => d.value))
  // Ustun chegarali yo'lak ichida chiziladi (1 px chegara ichkarida) — shuning uchun masshtab
  // yo'lakning ichki kengligiga (trackWidth - 2) qurilgan.
  const xScale = useMemo(() => scaleLinear({ domain: [0, maxValue], range: [0, trackWidth - 2], nice: true }), [maxValue, trackWidth])

  return (
    <div className="adm-chart-box" style={{ width, height }}>
      {/* Yorliqlar — har bir ustunning tepasida, o'z qatorida */}
      {data.map((d, i) => (
        // Faqat geometriya inline (qator joyi konstantalardan hisoblanadi); ko'rinish `.adm-bar-label` da
        <div key={i} title={d.label} className="adm-bar-label" style={{
          left: 0, top: i * (ROW_HEIGHT + ROW_GAP),
          height: LABEL_HEIGHT, width, lineHeight: `${LABEL_HEIGHT}px`,
        }}>
          {d.label}
        </div>
      ))}
      <svg className="adm-chart-svg" width={width} height={height} aria-hidden="true" focusable="false">
        {data.map((d, i) => {
          const barY = i * (ROW_HEIGHT + ROW_GAP) + LABEL_HEIGHT + LABEL_GAP
          const barWidth = Math.max(xScale(d.value), 3)
          return (
            <Group key={i}>
              {/* yo'lak: 0.5 px ichkariga — 1 px chegara piksel chegarasiga to'g'ri tushadi */}
              <rect className="adm-bar-track" x={0.5} y={barY + 0.5} width={trackWidth - 1} height={BAR_HEIGHT - 1} rx={BAR_RADIUS - 0.5} />
              <rect x={1} y={barY + 1} width={barWidth} height={BAR_HEIGHT - 2} rx={BAR_RADIUS - 1} fill={color} />
              <text className="adm-bar-value" x={width} y={barY + BAR_HEIGHT / 2} dy="0.35em" textAnchor="end">
                {d.value}
              </text>
            </Group>
          )
        })}
      </svg>
    </div>
  )
}

// `ariaLabel` — kartaning nomi: grafik ekran o'quvchiga bitta rasm sifatida o'qiladi
// ("Eng ko'p ko'rilgan yangiliklar: A — 120, B — 80"), ichki yorliqlar takrorlanmaydi.
export default function RankedBarChart({ data, color = 'var(--color-brand)', emptyLabel = "Ma'lumot yo'q", ariaLabel }) {
  if (data.length === 0) {
    return <EmptyState>{emptyLabel}</EmptyState>
  }

  // MUHIM: `ParentSize` grafikni o'zining ichidagi ABSOLUTE konteynerda chizadi, shuning
  // uchun uning o'zi oqimda 0 balandlikda qoladi — kartaning balandligi grafikni
  // sig'dirmay, grafik kartadan pastga toshib chiqib kesilib ketadi (Stats'dagi pastki
  // 3 ta karta shunday buzilgan edi). Tashqi konteynerga aniq `height` berish shart
  // (TrendLineChart ham xuddi shunday qiladi). Balandlik faqat qatorlar soniga bog'liq.
  const height = chartHeight(data.length)
  const summary = data.map(d => `${d.label} — ${d.value}`).join(', ')
  return (
    <div className="adm-chart-frame" style={{ height }} role="img" aria-label={ariaLabel ? `${ariaLabel}: ${summary}` : summary}>
      <ParentSize>
        {({ width }) => (width > 0 ? <Chart width={width} height={height} data={data} color={color} /> : null)}
      </ParentSize>
    </div>
  )
}
