import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Byte } from './Byte'
import { SpeechBubble } from './SpeechBubble'
import { Confetti } from './Confetti'
import { useByte } from '../../context/ByteContext'

// ZZZ bubbles for sleeping mood
function ZzzBubbles() {
  return (
    <div style={{ position: 'absolute', top: -18, right: -8, pointerEvents: 'none' }}>
      {[{ z: 'z', size: 9, dx: 0 }, { z: 'Z', size: 12, dx: 8 }, { z: 'Z', size: 15, dx: 16 }].map((item, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 1, 1, 0], y: -28, x: item.dx }}
          transition={{ duration: 2.2, delay: i * 0.75, repeat: Infinity, repeatDelay: 0.4 }}
          style={{
            position: 'absolute',
            color: '#666',
            fontSize: item.size,
            fontWeight: 800,
            fontFamily: 'monospace',
            lineHeight: 1,
          }}
        >
          {item.z}
        </motion.span>
      ))}
    </div>
  )
}

const MOOD_ANIM = {
  idle: {
    animate:    { y: [0, -8, 0] },
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
  happy: {
    animate:    { y: [0, -20, 0, -12, 0], rotate: [0, -5, 5, -3, 0] },
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  excited: {
    animate:    { y: [0, -30, 0, -20, 0], rotate: [0, -10, 10, -8, 8, 0], scale: [1, 1.2, 1, 1.1, 1] },
    transition: { duration: 0.8 },
  },
  winning: {
    animate:    { y: [0, -40, 0, -25, 0, -15, 0], rotate: [0, 0, 360, 360, 365, 360], scale: [1, 1.3, 1.3, 1, 1] },
    transition: { duration: 1.2, ease: 'easeInOut' },
  },
  sad: {
    animate:    { y: [0, 5, 10], rotate: [0, -3, -5], opacity: [1, 1, 0.7] },
    transition: { duration: 0.8, ease: 'easeIn' },
  },
  losing: {
    animate:    { y: [0, 5, 10], rotate: [0, -3, -5], opacity: [1, 1, 0.7] },
    transition: { duration: 0.8, ease: 'easeIn' },
  },
  thinking: {
    animate:    { rotate: [-8, 8, -8] },
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
  levelup: {
    animate:    { y: [0, -200, -200, 0, -20, 0], scale: [1, 0.8, 1.5, 1.5, 1, 1], rotate: [0, 0, 720, 720, 0, 0] },
    transition: { duration: 1.5, times: [0, 0.3, 0.5, 0.7, 0.9, 1] },
  },
  streak: {
    animate:    { x: [-3, 3, -3, 3, -2, 2, 0], rotate: [-5, 5, -4, 4, -2, 2, 0] },
    transition: { duration: 0.5, repeat: 3 },
  },
  sleeping: {
    animate:    { rotate: [-3, -9, -3], y: [0, 3, 0] },
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
  },
  working: {
    animate:    { x: [-2, 2, -2] },
    transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' },
  },
  celebrating: {
    animate:    { y: [0, -50, 0], scale: [1, 1.4, 1], rotate: [0, 360] },
    transition: { duration: 1 },
  },
}

const CONFETTI_MOODS = new Set(['winning', 'celebrating', 'levelup'])

export function ByteMascot() {
  const { mood, message, showBubble, triggerByte } = useByte()
  const [showConfetti, setShowConfetti] = useState(false)
  const [byteSize, setByteSize] = useState(80)

  // Responsive size
  useEffect(() => {
    const update = () => setByteSize(window.innerWidth < 768 ? 60 : 80)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // App open greeting on mount
  useEffect(() => {
    const t = setTimeout(() => {
      const hour = new Date().getHours()
      triggerByte('happy', hour >= 5 && hour < 17 ? 'app_open_morning' : 'app_open_night')
    }, 1800)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Confetti for win/celebrate/levelup moods
  useEffect(() => {
    if (CONFETTI_MOODS.has(mood)) {
      setShowConfetti(true)
      const t = setTimeout(() => setShowConfetti(false), 1100)
      return () => clearTimeout(t)
    }
  }, [mood])

  const anim = MOOD_ANIM[mood] ?? MOOD_ANIM.idle

  const handleClick = () => {
    if (mood === 'idle' || mood === 'sleeping') {
      triggerByte('happy', 'idle_random')
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 80,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        userSelect: 'none',
      }}
    >
      <SpeechBubble text={message} visible={showBubble} />

      <div
        onClick={handleClick}
        style={{ position: 'relative', cursor: mood === 'idle' || mood === 'sleeping' ? 'pointer' : 'default' }}
        title={mood === 'idle' ? 'Click BYTE!' : undefined}
      >
        <Confetti active={showConfetti} />
        {mood === 'sleeping' && <ZzzBubbles />}

        <motion.div
          animate={anim.animate}
          transition={anim.transition}
          style={{ originX: '50%', originY: '50%', display: 'flex' }}
        >
          <Byte mood={mood} size={byteSize} />
        </motion.div>
      </div>
    </div>
  )
}
