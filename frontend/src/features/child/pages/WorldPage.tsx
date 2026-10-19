import { ClipboardCheck } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CircleStage,
  GuideDialog,
  MapPin,
  TopoMap,
  type GuideDialogHandle,
  type PinState,
} from '@/components/lisan'
import { Badge } from '@/components/ui'
import { useQuests } from '@/lib/api'
import { useDirection } from '@/lib/hooks/useDirection'
import { LADDER_LEVELS, type LadderLevel, type Quest } from '@/types/domain'
import { useChildContext } from '../context'
import { LOCATIONS, mirrorX } from '../locations'

function levelState(level: LadderLevel, quests: Quest[]): PinState {
  const forLevel = quests.filter((q) => q.level === level)
  if (forLevel.some((q) => q.state === 'today' || q.state === 'available')) return 'current'
  if (forLevel.length && forLevel.every((q) => q.state === 'completed')) return 'done'
  return 'locked'
}

/** Quest map: the therapy ladder as places on a hand-drawn map; today's spot glows. */
export default function WorldPage() {
  const { t } = useTranslation('child')
  const { isRtl } = useDirection()
  const { child, guide, guideName } = useChildContext()
  const { data: quests = [] } = useQuests(child.id)
  const dialog = useRef<GuideDialogHandle>(null)
  const [line, setLine] = useState(0)
  const [typing, setTyping] = useState(true)

  const needsScreening = !child.latestScreeningId
  const today = quests.find((q) => q.state === 'today')

  const lines = useMemo(
    () => [
      t('world.intro', { guide: guideName }),
      needsScreening ? t('world.introScreening') : today ? t('world.today') : t('world.allDone'),
    ],
    [t, guideName, needsScreening, today],
  )

  const points = LADDER_LEVELS.map((l) => ({ x: mirrorX(LOCATIONS[l].x, isRtl), y: LOCATIONS[l].y }))
  const states = LADDER_LEVELS.map((l) => (needsScreening ? 'locked' : levelState(l, quests)))
  const progressIndex = states.lastIndexOf('done')

  const advance = () => {
    if (dialog.current?.complete()) return
    if (line < lines.length - 1) {
      setTyping(true)
      setLine((l) => l + 1)
    }
  }

  return (
    <div className="absolute inset-0">
      <TopoMap trail={points} progressIndex={progressIndex}>
        {needsScreening && (
          <MapPin
            x={points[0].x}
            y={points[0].y}
            icon={ClipboardCheck}
            label={t('world.screeningPin')}
            state="current"
            to={`/play/${child.id}/screening`}
          />
        )}
        {LADDER_LEVELS.map((level, i) =>
          needsScreening && i === 0 ? null : (
            <MapPin
              key={level}
              x={points[i].x}
              y={points[i].y}
              icon={LOCATIONS[level].icon}
              label={t(`world.locations.${level}`)}
              state={states[i]}
              to={states[i] === 'current' && today ? `/play/${child.id}/quest/${today.id}` : undefined}
              badge={
                states[i] === 'current' && (
                  <Badge tone="rust" className="mt-2">
                    {t('world.todayBadge')}
                  </Badge>
                )
              }
            />
          ),
        )}
      </TopoMap>

      <CircleStage guideId={guide?.id} speaking={typing} onClick={advance}>
        <GuideDialog
          ref={dialog}
          key={line}
          message={lines[line]}
          showNext={line < lines.length - 1}
          onCompleted={() => setTyping(false)}
        />
      </CircleStage>
    </div>
  )
}
