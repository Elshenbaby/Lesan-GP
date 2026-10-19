import { Volume2, VolumeX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils/cn'
import { stopSpeaking } from '@/lib/audio/speak'
import { usePreferences } from '@/stores/preferences'

export function SoundToggle({ className }: { className?: string }) {
  const { t } = useTranslation()
  const { muted, toggleMuted } = usePreferences()
  const Icon = muted ? VolumeX : Volume2
  return (
    <button
      type="button"
      onClick={() => {
        if (!muted) stopSpeaking()
        toggleMuted()
      }}
      className={cn('flex items-center gap-2.5 text-current transition-opacity hover:opacity-70', className)}
      aria-pressed={!muted}
    >
      <Icon className="size-5" />
      <span className="text-start text-[0.62rem] leading-tight font-bold tracking-wider uppercase">
        {t('sound.label')}
        <br />
        <span className="font-semibold opacity-80">{muted ? t('sound.off') : t('sound.on')}</span>
      </span>
    </button>
  )
}
