import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useDirection } from '@/lib/hooks/useDirection'
import type { SoundProgress } from '@/types/domain'

const lineColors = ['#bb4d34', '#21393b', '#58635d', '#c99230', '#7a8f6b']

/** Weekly accuracy per sound/position; the dashed line marks the 80% level-up threshold. */
export function AccuracyChart({ sounds, height = 320 }: { sounds: SoundProgress[]; height?: number }) {
  const { t } = useTranslation()
  const { isRtl } = useDirection()

  const { data, keys } = useMemo(() => {
    const keys = sounds.map((s) => `${s.sound} · ${t(`positions.${s.position}`)}`)
    const weeks = sounds[0]?.series.map((p) => p.week) ?? []
    const data = weeks.map((week, i) => ({
      week,
      ...Object.fromEntries(sounds.map((s, k) => [keys[k], s.series[i]?.accuracy])),
    }))
    return { data, keys }
  }, [sounds, t])

  return (
    <div style={{ height }} dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="#d7c4ab" strokeDasharray="4 6" vertical={false} />
          <XAxis
            dataKey="week"
            reversed={isRtl}
            stroke="#58635d"
            tickLine={false}
            axisLine={false}
            fontSize={12}
          />
          <YAxis
            domain={[0, 100]}
            orientation={isRtl ? 'right' : 'left'}
            stroke="#58635d"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            unit="%"
          />
          <ReferenceLine y={80} stroke="#5f8a5a" strokeDasharray="6 6" />
          <Tooltip
            contentStyle={{ background: '#fcf7f1', border: '1px solid #d7c4ab', borderRadius: 8 }}
            formatter={(v) => `${v}%`}
          />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          {keys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={lineColors[i % lineColors.length]}
              strokeWidth={2.5}
              dot={{ r: 3.5 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
