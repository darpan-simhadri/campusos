import { motion, AnimatePresence } from 'framer-motion'

const COLORS = ['#C8F135', '#00D4C8', '#E040FB', '#FFD700', '#FF6B00']

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  color: COLORS[i % COLORS.length],
  angle: (i / 30) * 360,
  distance: 70 + (i * 11 % 100),
  size: 4 + (i % 4) * 2,
  delay: (i % 8) * 0.04,
  rotate: (i * 43) % 360,
  isSquare: i % 3 === 0,
}))

export function Confetti({ active }) {
  return (
    <AnimatePresence>
      {active && PARTICLES.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            background: p.color,
            top: '50%',
            left: '50%',
            borderRadius: p.isSquare ? 2 : '50%',
            zIndex: 9998,
            pointerEvents: 'none',
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
          animate={{
            x: Math.cos(p.angle * Math.PI / 180) * p.distance,
            y: Math.sin(p.angle * Math.PI / 180) * p.distance,
            opacity: 0,
            scale: 0,
            rotate: p.rotate,
          }}
          exit={{}}
          transition={{ duration: 0.9, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </AnimatePresence>
  )
}
