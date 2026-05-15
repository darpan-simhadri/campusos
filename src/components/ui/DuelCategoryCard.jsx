import { motion, AnimatePresence } from 'framer-motion'
import { spring } from '../../lib/motion'

export function DuelCategoryCard({ cat, isActive, onClick }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.button
        onClick={onClick}
        className="w-full flex flex-col items-center justify-center rounded-2xl gap-1.5"
        style={{
          background: isActive ? cat.color : '#1C1C1C',
          minHeight: 76,
          padding: '12px 6px',
          border: isActive ? 'none' : '1px solid #2a2a2a',
        }}
        whileTap={{ scale: 0.9 }}
        animate={{ scale: isActive ? 1.04 : 1 }}
        transition={spring.snappy}
      >
        <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{cat.icon}</span>
        <AnimatePresence>
          {isActive && (
            <motion.span
              initial={{ opacity: 0, y: 4, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={spring.snappy}
              style={{
                color: cat.color === '#C8F135' ? '#000000' : '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 800,
                fontFamily: 'JetBrains Mono, monospace',
                lineHeight: 1,
              }}
            >
              {cat.rating}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
      <span
        style={{
          color: isActive ? cat.color : '#666666',
          fontSize: '0.62rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          fontFamily: 'Barlow Condensed, sans-serif',
        }}
      >
        {cat.label}
      </span>
    </div>
  )
}
