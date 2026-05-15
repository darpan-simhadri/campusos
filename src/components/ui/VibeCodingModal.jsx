import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { awardXP, awardPies } from '../../services/firebaseService'
import { spring } from '../../lib/motion'

// ─── Vibe prompts ─────────────────────────────────────────────────────────────
const VIBE_PROMPTS = [
  {
    vibe: 'Rain on a window at 2am',
    desc: 'Melancholic. Quiet. Each drop a tiny world. Time slows down.',
    mood: '🌧️', color: '#4A9EFF',
    hint: 'Think: falling drops, blurred light, dark glass, slow motion',
  },
  {
    vibe: 'The last 10 seconds before a deadline',
    desc: 'Panic. Adrenaline. Colors bleeding. Everything accelerates.',
    mood: '⏰', color: '#FF4444',
    hint: 'Think: countdown, shaking UI, red bleeding in, urgency',
  },
  {
    vibe: 'Saturday morning with no plans',
    desc: 'Warm. Unhurried. Soft light through curtains. Nothing needs to happen.',
    mood: '☀️', color: '#FFD700',
    hint: 'Think: golden gradients, slow breathing animations, warmth',
  },
  {
    vibe: 'A message from someone you miss',
    desc: 'Sudden warmth. That pause before you reply. Unexpected.',
    mood: '💬', color: '#C8F135',
    hint: 'Think: a single notification, soft glow, hesitation, pulse',
  },
  {
    vibe: 'Static on an old TV at midnight',
    desc: 'Noise as texture. Something lost in the signal. Almost a pattern.',
    mood: '📺', color: '#aaa',
    hint: 'Think: noise/grain, flickering, monochrome, late night',
  },
  {
    vibe: 'First page of a new notebook',
    desc: 'Possibility. A little intimidating. The pen hasn\'t touched it yet.',
    mood: '📓', color: '#E040FB',
    hint: 'Think: blank space, ruled lines, that perfect white',
  },
  {
    vibe: 'A city at 3am',
    desc: 'Empty streets. Neon on wet asphalt. The world belongs to no one.',
    mood: '🌆', color: '#00D4C8',
    hint: 'Think: neon reflections, deep blue, isolated street lights',
  },
  {
    vibe: 'Lo-fi music on repeat while studying',
    desc: 'Repetitive but not boring. Focus mixed with daydream. Amber hues.',
    mood: '🎵', color: '#FF6B00',
    hint: 'Think: vinyl grain, cozy orange tones, slow loops',
  },
  {
    vibe: 'The exact moment before a storm breaks',
    desc: 'Pressure. Everything still. The air tastes like electricity.',
    mood: '⛈️', color: '#8B5CF6',
    hint: 'Think: heavy atmosphere, charged silence, dark purple, tension',
  },
  {
    vibe: 'An empty classroom after the final exam',
    desc: 'Relief mixed with something else. Paper smell. Chairs still warm.',
    mood: '🏫', color: '#4CAF50',
    hint: 'Think: fading light, quiet rows, something ending',
  },
  {
    vibe: 'Opening a package you forgot you ordered',
    desc: 'Surprise. Small joy. Rediscovering your own past self.',
    mood: '📦', color: '#FFD700',
    hint: 'Think: unwrapping reveal, unexpected delight, layers',
  },
  {
    vibe: 'The 3 seconds of silence before applause',
    desc: 'Suspense. Your heart drops. Then it lifts.',
    mood: '🎭', color: '#FF6B00',
    hint: 'Think: held breath, anticipation, then explosive release',
  },
]

const STARTER_HTML = `<div class="scene">
  <div class="element"></div>
</div>`

const STARTER_CSS = `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #0a0a0a;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  overflow: hidden;
}
.scene {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.element {
  width: 80px;
  height: 80px;
  background: #C8F135;
  border-radius: 50%;
}`

const STARTER_JS = `// Bring your vibe to life with JS
// Example: animate, add particles, respond to mouse
document.addEventListener('mousemove', e => {
  // your code here
})`

function fmt(s) {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

// ─── Atmospheric particle background ─────────────────────────────────────────
function AtmosphereParticles({ color }) {
  const particles = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 5,
    dur: 4 + Math.random() * 6,
    delay: Math.random() * 4,
  }))
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            borderRadius: '50%',
            background: color,
            opacity: 0,
          }}
          animate={{ opacity: [0, 0.4, 0], y: [-10, -40, -70] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────
export default function VibeCodingModal({ onClose }) {
  const { user, profile, updateProfile } = useAuth()
  const { addTickerItem, addToVotingQueue } = useApp()
  const navigate = useNavigate()

  const [prompt]   = useState(() => VIBE_PROMPTS[Math.floor(Math.random() * VIBE_PROMPTS.length)])
  const [phase, setPhase]     = useState('reveal')   // reveal | build | done
  const [tab, setTab]         = useState('html')
  const [html, setHtml]       = useState(STARTER_HTML)
  const [css, setCss]         = useState(STARTER_CSS)
  const [js, setJs]           = useState(STARTER_JS)
  const [timeLeft, setTimeLeft] = useState(600)
  const [xpEarned, setXpEarned] = useState(0)

  const previewSrc = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`

  // Reveal → build after 5 seconds
  useEffect(() => {
    if (phase !== 'reveal') return
    const t = setTimeout(() => setPhase('build'), 5000)
    return () => clearTimeout(t)
  }, [phase])

  // Countdown timer
  useEffect(() => {
    if (phase !== 'build') return
    const t = setInterval(() => {
      setTimeLeft(l => {
        if (l <= 1) { clearInterval(t); handleSubmit(); return 0 }
        return l - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [phase])

  async function handleSubmit() {
    if (phase === 'done') return
    setPhase('done')
    const xp = 90
    setXpEarned(xp)
    if (user) {
      await awardXP(user.uid, xp)
      await awardPies(user.uid, 4)
      updateProfile({ xp: (profile?.xp || 0) + xp, pies: (profile?.pies || 0) + 4 })
    }
    addToVotingQueue({
      id: `vibe_${Date.now()}`,
      type: 'vibe_coding',
      challenge: prompt.vibe,
      playerA: { name: profile?.fullName || 'You', spec: profile?.spec },
      playerB: { name: 'CAMPUS', spec: 'CSE' },
      outputA: `[Vibe: ${prompt.vibe}] — ${profile?.fullName || 'You'}'s interpretation`,
      outputB: 'Waiting for more submissions...',
    })
    addTickerItem(`✨ ${profile?.fullName?.split(' ')[0] || 'You'} vibed "${prompt.vibe}"`)
  }

  const timePct = (timeLeft / 600) * 100

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: '#000' }}
    >

      {/* ── REVEAL phase ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {phase === 'reveal' && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ exit: { duration: 0.4 } }}
            className="absolute inset-0 flex flex-col items-center justify-center z-10"
            style={{ background: `radial-gradient(ellipse at 50% 60%, ${prompt.color}18 0%, #000 65%)` }}
          >
            <AtmosphereParticles color={prompt.color} />

            <div className="flex flex-col items-center gap-4 relative z-10 px-8 text-center">
              <motion.p
                initial={{ opacity: 0, letterSpacing: '0.4em' }}
                animate={{ opacity: 1, letterSpacing: '0.15em' }}
                transition={{ delay: 0.2, duration: 0.8 }}
                style={{ color: '#444', fontFamily: 'Barlow Condensed, sans-serif', fontSize: '0.75rem' }}
              >
                YOUR VIBE IS
              </motion.p>

              <motion.span
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                style={{ fontSize: '3.5rem', lineHeight: 1 }}
              >
                {prompt.mood}
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                style={{
                  fontFamily: 'Anton, sans-serif',
                  fontSize: 'clamp(1.5rem, 6vw, 2.4rem)',
                  color: '#fff',
                  letterSpacing: '0.03em',
                  lineHeight: 1.15,
                  maxWidth: 360,
                }}
              >
                {prompt.vibe.toUpperCase()}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                style={{
                  color: '#555', fontSize: '0.85rem', lineHeight: 1.7,
                  fontStyle: 'italic', maxWidth: 300,
                }}
              >
                "{prompt.desc}"
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2 }}
                className="rounded-2xl px-4 py-2.5 mt-2"
                style={{ background: `${prompt.color}12`, border: `1px solid ${prompt.color}30` }}
              >
                <p style={{ color: prompt.color, fontSize: '0.7rem', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.04em' }}>
                  💡 {prompt.hint}
                </p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ delay: 3.5, duration: 1, repeat: Infinity }}
                style={{ color: '#333', fontSize: '0.62rem', fontFamily: 'JetBrains Mono, monospace', marginTop: 12 }}
              >
                OPENING EDITOR...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BUILD phase ─────────────────────────────────────────────────────── */}
      {phase === 'build' && (
        <>
          {/* Timer bar */}
          <div className="h-1 w-full flex-shrink-0" style={{ background: '#111' }}>
            <motion.div
              className="h-full"
              animate={{ width: `${timePct}%` }}
              transition={{ duration: 1, ease: 'linear' }}
              style={{ background: timeLeft > 120 ? prompt.color : timeLeft > 60 ? '#FFD700' : '#EF4444' }}
            />
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-2.5 flex-shrink-0"
            style={{ borderBottom: '1px solid #1C1C1C' }}>
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{prompt.mood}</span>
            <div className="flex-1 min-w-0">
              <p style={{
                color: '#fff', fontFamily: 'Anton, sans-serif', fontSize: '0.9rem',
                letterSpacing: '0.03em', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
              }}>
                {prompt.vibe.toUpperCase()}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', fontWeight: 700,
                color: timeLeft < 120 ? '#EF4444' : '#fff',
              }}>
                {fmt(timeLeft)}
              </span>
              <button onClick={onClose} style={{ color: '#444' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Vibe description strip */}
          <div className="px-4 py-2 flex-shrink-0"
            style={{ background: `${prompt.color}08`, borderBottom: `1px solid ${prompt.color}18` }}>
            <p style={{ color: `${prompt.color}bb`, fontSize: '0.68rem', fontStyle: 'italic', lineHeight: 1.5 }}>
              💡 {prompt.hint}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-shrink-0" style={{ borderBottom: '1px solid #1C1C1C', background: '#080808' }}>
            {['html', 'css', 'js', 'preview'].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2.5 text-center"
                style={{
                  fontFamily: 'Anton, sans-serif', fontSize: '0.7rem', letterSpacing: '0.06em',
                  color: tab === t ? (t === 'preview' ? prompt.color : '#C8F135') : '#444',
                  borderBottom: tab === t ? `2px solid ${t === 'preview' ? prompt.color : '#C8F135'}` : '2px solid transparent',
                  background: tab === t ? `rgba(200,241,53,0.04)` : 'transparent',
                }}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Editor / Preview */}
          <div className="flex-1 min-h-0">
            {tab !== 'preview' ? (
              <Editor
                height="100%"
                language={tab === 'js' ? 'javascript' : tab}
                theme="vs-dark"
                value={tab === 'html' ? html : tab === 'css' ? css : js}
                onChange={v => {
                  if (tab === 'html') setHtml(v || '')
                  else if (tab === 'css') setCss(v || '')
                  else setJs(v || '')
                }}
                options={{
                  fontSize: 13,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  padding: { top: 12 },
                  lineNumbersMinChars: 3,
                }}
              />
            ) : (
              <div className="w-full h-full flex flex-col">
                <iframe
                  srcDoc={previewSrc}
                  title="vibe-preview"
                  sandbox="allow-scripts"
                  className="flex-1 border-none"
                  style={{ background: '#fff' }}
                />
              </div>
            )}
          </div>

          {/* Submit bar */}
          <div className="flex-shrink-0 p-3 flex items-center gap-3"
            style={{ borderTop: '1px solid #1C1C1C', background: '#080808' }}>
            <p style={{ flex: 1, color: '#333', fontSize: '0.65rem', fontFamily: 'Barlow Condensed, sans-serif', lineHeight: 1.4 }}>
              No right answer — campus votes on whose build best captures the vibe.
            </p>
            <motion.button
              onClick={handleSubmit}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 flex-shrink-0"
              style={{
                background: prompt.color,
                color: '#000',
                fontFamily: 'Anton, sans-serif',
                fontSize: '0.82rem',
                letterSpacing: '0.04em',
              }}
              whileTap={{ scale: 0.95 }}
              transition={spring.snappy}
            >
              <Send className="w-3.5 h-3.5" />
              SUBMIT VIBE
            </motion.button>
          </div>
        </>
      )}

      {/* ── DONE phase ──────────────────────────────────────────────────────── */}
      {phase === 'done' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 text-center">
          <AtmosphereParticles color={prompt.color} />

          <motion.span
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={spring.smooth}
            style={{ fontSize: '4rem', zIndex: 1 }}
          >
            ✨
          </motion.span>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-2 z-10"
          >
            <h2 style={{ fontFamily: 'Anton, sans-serif', fontSize: '2rem', color: prompt.color, letterSpacing: '0.04em' }}>
              VIBE SUBMITTED
            </h2>
            <p style={{ color: '#555', fontSize: '0.82rem', lineHeight: 1.6 }}>
              Campus will vote on whose code best captures<br />
              <span style={{ color: '#888', fontStyle: 'italic' }}>"{prompt.vibe}"</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl px-8 py-4 z-10"
            style={{ background: '#1C1C1C', border: `1px solid ${prompt.color}30` }}
          >
            <p style={{ color: '#555', fontSize: '0.62rem', fontFamily: 'Barlow Condensed, sans-serif', marginBottom: 4 }}>XP EARNED</p>
            <p style={{ color: '#C8F135', fontFamily: 'Anton, sans-serif', fontSize: '2.5rem', lineHeight: 1 }}>+{xpEarned}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex gap-3 w-full z-10"
            style={{ maxWidth: 320 }}
          >
            <button
              onClick={onClose}
              className="flex-1 rounded-xl py-3"
              style={{ background: '#1C1C1C', border: '1px solid #2a2a2a', color: '#666', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
            >
              EXIT
            </button>
            <motion.button
              onClick={() => { onClose(); navigate('/arena') }}
              className="flex-1 rounded-xl py-3"
              style={{ background: prompt.color, color: '#000', fontFamily: 'Anton, sans-serif', fontSize: '0.85rem', letterSpacing: '0.04em' }}
              whileTap={{ scale: 0.97 }}
              transition={spring.snappy}
            >
              SEE VOTES →
            </motion.button>
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
