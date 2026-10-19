import type { GuideId } from '@/types/domain'

/**
 * Placeholder character art for the guides. Replace with the illustrator's files in
 * public/assets/guides/ and swap this component for an <img>.
 */
export function GuideArt({ id, className }: { id: GuideId; className?: string }) {
  const Art = arts[id] ?? arts.samsam
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`halo-${id}`} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#FCE9D2" />
          <stop offset="100%" stopColor="#FCE9D2" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="96" fill={`url(#halo-${id})`} />
      <Art />
    </svg>
  )
}

const Eye = ({ x, y, r = 7 }: { x: number; y: number; r?: number }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="#fff" />
    <circle cx={x + 1.5} cy={y + 1} r={r * 0.55} fill="#1d1d1b" />
    <circle cx={x + 3} cy={y - 1.5} r={r * 0.2} fill="#fff" />
  </g>
)

const arts: Record<GuideId, () => JSX.Element> = {
  samsam: () => (
    <g>
      <path
        d="M40 160 C 40 120, 110 135, 110 105 C 110 80, 70 85, 75 60"
        stroke="#5f8a63"
        strokeWidth="30"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M40 160 C 40 120, 110 135, 110 105 C 110 80, 70 85, 75 60"
        stroke="#86ad7f"
        strokeWidth="10"
        strokeDasharray="2 14"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M40 160 C 70 175, 140 175, 165 150"
        stroke="#5f8a63"
        strokeWidth="26"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="85" cy="55" rx="38" ry="30" fill="#5f8a63" />
      <ellipse cx="85" cy="62" rx="24" ry="14" fill="#a6c79a" />
      <Eye x={70} y={46} />
      <Eye x={98} y={46} />
      <path d="M78 66 Q 85 72 92 66" stroke="#21393b" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path
        d="M85 80 L85 92 M85 92 L79 99 M85 92 L91 99"
        stroke="#bb4d34"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M60 28 Q 85 8 112 28 L 104 34 Q 85 22 68 34 Z" fill="#bb4d34" />
      <circle cx="62" cy="62" r="5" fill="#e9a28f" opacity="0.7" />
      <circle cx="108" cy="62" r="5" fill="#e9a28f" opacity="0.7" />
    </g>
  ),
  zuzu: () => (
    <g>
      <ellipse cx="65" cy="80" rx="30" ry="42" fill="#fff" opacity="0.75" transform="rotate(-25 65 80)" />
      <ellipse cx="135" cy="80" rx="30" ry="42" fill="#fff" opacity="0.75" transform="rotate(25 135 80)" />
      <ellipse cx="100" cy="125" rx="52" ry="48" fill="#e2ad4a" />
      <path d="M55 115 Q 100 100 145 115" stroke="#21393b" strokeWidth="13" fill="none" />
      <path d="M52 140 Q 100 128 148 140" stroke="#21393b" strokeWidth="13" fill="none" />
      <circle cx="100" cy="72" r="34" fill="#e2ad4a" />
      <Eye x={88} y={68} />
      <Eye x={113} y={68} />
      <path d="M92 86 Q 100 93 108 86" stroke="#21393b" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path
        d="M86 40 Q 78 20 66 18 M114 40 Q 122 20 134 18"
        stroke="#21393b"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="66" cy="18" r="5" fill="#21393b" />
      <circle cx="134" cy="18" r="5" fill="#21393b" />
      <circle cx="79" cy="82" r="5" fill="#e9a28f" opacity="0.8" />
      <circle cx="121" cy="82" r="5" fill="#e9a28f" opacity="0.8" />
    </g>
  ),
  shadi: () => (
    <g>
      <ellipse cx="100" cy="115" rx="58" ry="64" fill="#8a6a4f" />
      <ellipse cx="100" cy="130" rx="36" ry="42" fill="#d7c4ab" />
      <path
        d="M78 120 l6 6 l6 -6 M96 132 l6 6 l6 -6 M112 120 l6 6 l6 -6"
        stroke="#8a6a4f"
        strokeWidth="2.5"
        fill="none"
      />
      <path d="M48 62 L62 40 L76 58 Z M152 62 L138 40 L124 58 Z" fill="#8a6a4f" />
      <circle cx="78" cy="78" r="22" fill="#fcf7f1" />
      <circle cx="122" cy="78" r="22" fill="#fcf7f1" />
      <Eye x={78} y={78} r={11} />
      <Eye x={122} y={78} r={11} />
      <path d="M94 94 L100 106 L106 94 Z" fill="#d49a3a" />
      <rect x="64" y="52" width="72" height="10" rx="4" fill="#21393b" opacity="0.15" />
    </g>
  ),
  sara: () => (
    <g>
      <path d="M150 150 Q 190 120 170 80 Q 160 130 120 140 Z" fill="#bb4d34" />
      <path d="M170 80 Q 165 98 158 106 Q 174 100 170 80 Z" fill="#fcf7f1" />
      <ellipse cx="100" cy="135" rx="45" ry="42" fill="#bb4d34" />
      <ellipse cx="100" cy="145" rx="26" ry="28" fill="#fcf7f1" />
      <path d="M52 50 L70 95 L130 95 L148 50 L120 72 L80 72 Z" fill="#bb4d34" />
      <path d="M60 60 L72 86 L84 74 Z M140 60 L128 86 L116 74 Z" fill="#1d1d1b" opacity="0.35" />
      <path d="M60 85 Q 100 60 140 85 Q 130 125 100 128 Q 70 125 60 85 Z" fill="#bb4d34" />
      <path d="M72 100 Q 100 140 128 100 Q 118 128 100 130 Q 82 128 72 100 Z" fill="#fcf7f1" />
      <Eye x={84} y={94} r={6.5} />
      <Eye x={116} y={94} r={6.5} />
      <ellipse cx="100" cy="114" rx="6" ry="4.5" fill="#1d1d1b" />
    </g>
  ),
}
