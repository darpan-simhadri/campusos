import { motion } from 'framer-motion'
import { CategoryBadge } from './CategoryBadge'
import { spring } from '../../lib/motion'

export function FeaturedDuelCard({ challenge }) {
  const { category, categoryColor, title, subtitle, hasLive, emoji } = challenge
  return (
    <motion.div
      className="rounded-2xl p-5 relative overflow-hidden cursor-pointer"
      style={{ background: '#1C1C1C', minHeight: 164, border: '1px solid #2a2a2a' }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={spring.smooth}
    >
      {/* Category badge */}
      <CategoryBadge label={category} color={categoryColor} />

      {/* Big title — Anton font */}
      <div className="mt-2.5 mb-1.5">
        {title.split('\n').map((line, i) => (
          <div
            key={i}
            style={{ color: '#ffffff', fontFamily: 'Anton, sans-serif', fontSize: '2.6rem', lineHeight: 0.95, letterSpacing: '0.01em' }}
          >
            {line}
          </div>
        ))}
      </div>

      {/* Subtitle */}
      <p style={{ color: '#555555', fontSize: '0.65rem', letterSpacing: '0.1em', fontWeight: 600, textTransform: 'uppercase' }}>
        {subtitle}
      </p>

      {/* Play arrow */}
      <div
        className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full"
        style={{ background: 'rgba(255,255,255,0.08)' }}
      >
        <span style={{ color: '#ffffff', fontSize: '0.85rem', marginLeft: 2 }}>▶</span>
      </div>

      {/* Decorative emoji */}
      <div
        className="absolute bottom-3 right-14 select-none pointer-events-none"
        style={{ fontSize: '2.8rem', opacity: 0.2 }}
      >
        {emoji}
      </div>

      {/* Live badge */}
      {hasLive && (
        <div
          className="absolute top-5 right-16 flex items-center gap-1 rounded-full px-2 py-0.5"
          style={{ background: '#EF4444' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping inline-block" />
          <span style={{ color: '#fff', fontSize: '0.52rem', fontWeight: 800, letterSpacing: '0.06em' }}>LIVE</span>
        </div>
      )}
    </motion.div>
  )
}
