import { motion, AnimatePresence } from 'framer-motion'

export function SpeechBubble({ text, visible }) {
  return (
    <AnimatePresence>
      {visible && text && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -10 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: 10,
            background: '#1C1C1C',
            border: '1.5px solid #C8F135',
            borderRadius: 14,
            padding: '6px 12px',
            fontSize: '0.72rem',
            color: '#fff',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            boxShadow: '0 0 14px rgba(200,241,53,0.35)',
            fontFamily: 'Barlow Condensed, sans-serif',
            letterSpacing: '0.04em',
            zIndex: 10001,
            pointerEvents: 'none',
          }}
        >
          {text}
          {/* Triangle tip */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderTop: '7px solid #C8F135',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
