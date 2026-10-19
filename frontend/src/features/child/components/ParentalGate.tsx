import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Modal } from '@/components/ui'
import { formatNumber } from '@/lib/utils/format'

/** Simple adult check before leaving child mode (a sum a young child can't read). */
export function ParentalGate({
  open,
  onClose,
  onPass,
}: {
  open: boolean
  onClose: () => void
  onPass: () => void
}) {
  const { t } = useTranslation('child')
  const [a, b] = useMemo(() => [3 + Math.floor(Math.random() * 6), 4 + Math.floor(Math.random() * 5)], [open]) // eslint-disable-line react-hooks/exhaustive-deps
  const answer = a + b
  const options = useMemo(
    () => [answer, answer + 2, answer - 1, answer + 3].sort(() => Math.random() - 0.5),
    [answer],
  )
  const [wrong, setWrong] = useState(false)

  return (
    <Modal open={open} onClose={onClose} title={t('gate.title')}>
      <p className="text-sage mb-5">{t('gate.body')}</p>
      <p className="font-display text-teal mb-5 text-center text-4xl" dir="ltr">
        {formatNumber(a)} + {formatNumber(b)} = ?
      </p>
      <div className="grid grid-cols-4 gap-2">
        {options.map((o) => (
          <Button
            key={o}
            variant="outline"
            onClick={() => {
              if (o === answer) {
                setWrong(false)
                onPass()
              } else setWrong(true)
            }}
          >
            {formatNumber(o)}
          </Button>
        ))}
      </div>
      {wrong && <p className="text-rust mt-3 text-center text-sm">{t('gate.wrong')}</p>}
    </Modal>
  )
}
