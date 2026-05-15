const EYE_COLORS = {
  idle:        '#C8F135',
  happy:       '#C8F135',
  excited:     '#FFFFFF',
  sad:         '#888888',
  losing:      '#888888',
  thinking:    '#00D4C8',
  winning:     '#FFD700',
  celebrating: '#FFD700',
  levelup:     '#FFD700',
  streak:      '#FF6B00',
  sleeping:    null,
  working:     '#00D4C8',
}

export function Byte({ mood = 'idle', size = 80 }) {
  const eyeColor  = EYE_COLORS[mood] ?? '#C8F135'
  const isSleeping = mood === 'sleeping'

  return (
    <svg viewBox="0 0 80 120" width={size} height={size * 1.5} style={{ overflow: 'visible' }}>
      <defs>
        <filter id="byte-bolt-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="byte-eye-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="byte-antenna-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Antenna */}
      <line x1="40" y1="8" x2="40" y2="3" stroke="#C8F135" strokeWidth="2" strokeLinecap="round" />
      <circle cx="40" cy="2" r="3.5" fill="#C8F135" filter="url(#byte-antenna-glow)" />

      {/* Head */}
      <rect x="20" y="8" width="40" height="34" rx="10" fill="#1C1C1C" stroke="#C8F135" strokeWidth="1.5" />

      {/* Eyes */}
      {isSleeping ? (
        <>
          <line x1="26" y1="22" x2="38" y2="22" stroke="#444" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="42" y1="22" x2="54" y2="22" stroke="#444" strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="32" cy="22" r="6" fill="#000" />
          <circle cx="48" cy="22" r="6" fill="#000" />
          <circle cx="32" cy="22" r="4" fill={eyeColor} opacity="0.9" filter="url(#byte-eye-glow)" />
          <circle cx="48" cy="22" r="4" fill={eyeColor} opacity="0.9" filter="url(#byte-eye-glow)" />
          <circle cx="34" cy="20" r="1.5" fill="white" />
          <circle cx="50" cy="20" r="1.5" fill="white" />
        </>
      )}

      {/* Mouth per mood */}
      {(mood === 'idle') &&
        <path d="M 31 35 Q 40 38 49 35" stroke="#C8F135" strokeWidth="1.5" fill="none" strokeLinecap="round" />}
      {(mood === 'happy') &&
        <path d="M 30 34 Q 40 41 50 34" stroke="#C8F135" strokeWidth="2" fill="none" strokeLinecap="round" />}
      {(mood === 'excited') &&
        <path d="M 28 33 Q 40 43 52 33" stroke="#C8F135" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
      {(mood === 'sad' || mood === 'losing') &&
        <path d="M 30 38 Q 40 33 50 38" stroke="#888" strokeWidth="2" fill="none" strokeLinecap="round" />}
      {(mood === 'thinking') &&
        <path d="M 32 36 L 48 36" stroke="#888" strokeWidth="2" strokeLinecap="round" />}
      {(mood === 'working') &&
        <path d="M 32 36 L 48 36" stroke="#00D4C8" strokeWidth="2" strokeLinecap="round" />}
      {(mood === 'winning') &&
        <path d="M 27 33 Q 40 44 53 33" stroke="#FFD700" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
      {(mood === 'celebrating') &&
        <path d="M 27 33 Q 40 44 53 33" stroke="#FFD700" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
      {(mood === 'levelup') &&
        <path d="M 26 33 Q 40 45 54 33" stroke="#FFD700" strokeWidth="3" fill="none" strokeLinecap="round" />}
      {(mood === 'streak') &&
        <path d="M 28 33 Q 40 43 52 33" stroke="#FF6B00" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
      {(mood === 'sleeping') &&
        <path d="M 33 35 Q 40 37 47 35" stroke="#555" strokeWidth="1.5" fill="none" strokeLinecap="round" />}

      {/* Neck */}
      <rect x="36" y="42" width="8" height="6" fill="#1C1C1C" />

      {/* Body */}
      <rect x="16" y="48" width="48" height="44" rx="12" fill="#1C1C1C" stroke="#2a2a2a" strokeWidth="1.5" />

      {/* Chest lightning bolt — always glowing */}
      <path
        d="M 42 58 L 37 70 L 41 70 L 38 82 L 46 68 L 41 68 L 45 58 Z"
        fill="#C8F135"
        filter="url(#byte-bolt-glow)"
      />

      {/* Left arm */}
      <rect x="4" y="52" width="12" height="6" rx="3" fill="#1C1C1C" stroke="#2a2a2a" strokeWidth="1" />
      <circle cx="4" cy="55" r="4" fill="#1C1C1C" stroke="#2a2a2a" strokeWidth="1" />

      {/* Right arm */}
      <rect x="64" y="52" width="12" height="6" rx="3" fill="#1C1C1C" stroke="#2a2a2a" strokeWidth="1" />
      <circle cx="76" cy="55" r="4" fill="#1C1C1C" stroke="#2a2a2a" strokeWidth="1" />

      {/* Legs */}
      <rect x="24" y="92" width="12" height="20" rx="6" fill="#1C1C1C" stroke="#2a2a2a" strokeWidth="1" />
      <rect x="44" y="92" width="12" height="20" rx="6" fill="#1C1C1C" stroke="#2a2a2a" strokeWidth="1" />

      {/* Feet */}
      <ellipse cx="30" cy="112" rx="8" ry="4" fill="#C8F135" opacity="0.7" />
      <ellipse cx="50" cy="112" rx="8" ry="4" fill="#C8F135" opacity="0.7" />
    </svg>
  )
}
