import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Hammer, Play, Send, Trophy, Timer, Eye, Code } from 'lucide-react'
import { BUILD_TARGETS } from '../../data/duelContent'
import { useApp } from '../../context/AppContext'

const DUEL_DURATION = 300

const TABS = [
  { id: 'target',  label: 'Target',  icon: Eye  },
  { id: 'html',    label: 'HTML',    icon: Code },
  { id: 'css',     label: 'CSS',     icon: Code },
  { id: 'js',      label: 'JS',      icon: Code },
  { id: 'python',  label: 'Python',  icon: Code },
  { id: 'preview', label: 'Preview', icon: Play },
]

const STARTER = {
  html:   '<div class="card">\n  \n</div>',
  css:    '.card {\n  font-family: sans-serif;\n  \n}',
  js:     '// Runs inside the preview\n// e.g. document.querySelector(\'.card\').style.color = \'white\'',
  python: '# Python cannot run in the browser preview\n# But write your logic here for reference\n\ndef build_card():\n    pass\n',
}

export default function BuildRaceModal({ onClose, profile, updateProfile }) {
  const { ripple, getRandomOpponent } = useApp()
  const [target]   = useState(() => BUILD_TARGETS[Math.floor(Math.random() * BUILD_TARGETS.length)])
  const [opponent] = useState(() => getRandomOpponent())
  const [html, setHtml]     = useState(STARTER.html)
  const [css,  setCss]      = useState(STARTER.css)
  const [js,   setJs]       = useState(STARTER.js)
  const [python, setPython] = useState(STARTER.python)
  const [tab,  setTab]      = useState('target')
  const [timeLeft, setTimeLeft] = useState(DUEL_DURATION)
  const [phase, setPhase]   = useState('build')
  const [won, setWon]       = useState(false)
  const timerRef            = useRef(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  async function handleSubmit(timeout = false) {
    clearInterval(timerRef.current)
    const timeBonus = Math.max(0, Math.floor(timeLeft / 10))
    const playerWon = !timeout && timeLeft > 30
    setWon(playerWon)
    setPhase('done')
    const earnedXP = playerWon ? target.xp + timeBonus : Math.round(target.xp * 0.35)
    await ripple({
      action:     playerWon ? 'duel_won' : 'duel_lost',
      xpAmount:   earnedXP,
      userName:   profile?.name || 'You',
      duelResult: {
        type: 'build_race', challenge: target.title,
        playerA: profile?.name || 'You', playerB: opponent.name,
        outputA: html, outputB: target.targetHTML,
      },
      tickerText: playerWon
        ? `🏗️ ${profile?.name || 'You'} completed "${target.title}"! +${earnedXP} XP`
        : `🏗️ ${opponent.name} finished "${target.title}" first`,
      profile, updateProfile,
    })
    if (updateProfile) await updateProfile({ xp: (profile?.xp || 0) + earnedXP })
  }

  const previewSrc = `<!DOCTYPE html><html><head><style>body{margin:0;background:#111;}${css}</style></head><body>${html}<script>${js}<\/script></body></html>`

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 260 }}
        className="w-full max-w-lg rounded-t-2xl flex flex-col overflow-hidden"
        style={{ background: '#111', maxHeight: '92vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Hammer size={18} style={{ color: '#C8F135' }} />
            <span className="font-bold text-white" style={{ fontFamily: 'Anton, sans-serif', letterSpacing: 1 }}>BUILD RACE</span>
            <span className="text-xs px-2 py-0.5 rounded-full ml-1" style={{ background: '#1C1C1C', color: '#C8F135' }}>{target.xp} XP</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Timer size={14} style={{ color: timeLeft < 60 ? '#ef4444' : '#C8F135' }} />
              <span className="font-mono text-sm font-bold" style={{ color: timeLeft < 60 ? '#ef4444' : '#C8F135' }}>{fmt(timeLeft)}</span>
            </div>
            <button onClick={onClose} className="text-neutral-400 hover:text-white"><X size={20} /></button>
          </div>
        </div>

        {/* Tab bar — scrollable so all 6 fit */}
        <div className="flex border-b border-neutral-800 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className="flex-shrink-0 flex items-center justify-center gap-1 px-3 py-2.5 text-xs font-semibold transition-colors"
              style={{
                color:        tab === id ? '#C8F135' : '#666',
                borderBottom: tab === id ? '2px solid #C8F135' : '2px solid transparent',
                fontFamily:   'Barlow Condensed, sans-serif',
                minWidth: 60,
              }}>
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>

        {phase === 'build' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">

              {/* Target */}
              {tab === 'target' && (
                <motion.div key="target" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                  <div className="rounded-xl p-4" style={{ background: '#1C1C1C', border: '1px solid #2a2a2a' }}>
                    <p className="text-xs text-neutral-500 mb-0.5" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>BUILD THIS</p>
                    <p className="text-white font-bold">{target.title}</p>
                    <p className="text-xs text-neutral-400 mt-1">{target.description}</p>
                  </div>
                  <p className="text-xs text-neutral-500">Target output:</p>
                  <div className="rounded-xl overflow-hidden border border-neutral-800 p-2"
                    dangerouslySetInnerHTML={{ __html: target.targetHTML }} />
                </motion.div>
              )}

              {/* HTML */}
              {tab === 'html' && (
                <motion.div key="html" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col p-4 gap-2">
                  <p className="text-xs text-neutral-500">HTML structure:</p>
                  <textarea value={html} onChange={e => setHtml(e.target.value)}
                    className="flex-1 rounded-xl p-3 text-sm text-white resize-none outline-none"
                    style={{ background: '#1C1C1C', border: '1px solid #333', fontFamily: 'JetBrains Mono, monospace', minHeight: 260 }} />
                </motion.div>
              )}

              {/* CSS */}
              {tab === 'css' && (
                <motion.div key="css" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col p-4 gap-2">
                  <p className="text-xs text-neutral-500">CSS styles:</p>
                  <textarea value={css} onChange={e => setCss(e.target.value)}
                    className="flex-1 rounded-xl p-3 text-sm text-white resize-none outline-none"
                    style={{ background: '#1C1C1C', border: '1px solid #333', fontFamily: 'JetBrains Mono, monospace', minHeight: 260 }} />
                </motion.div>
              )}

              {/* JS */}
              {tab === 'js' && (
                <motion.div key="js" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col p-4 gap-2">
                  <p className="text-xs text-neutral-500">JavaScript (runs in preview iframe):</p>
                  <textarea value={js} onChange={e => setJs(e.target.value)}
                    className="flex-1 rounded-xl p-3 text-sm text-white resize-none outline-none"
                    style={{ background: '#1C1C1C', border: '1px solid #333', fontFamily: 'JetBrains Mono, monospace', minHeight: 260 }} />
                </motion.div>
              )}

              {/* Python */}
              {tab === 'python' && (
                <motion.div key="python" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col p-4 gap-2">
                  <div className="rounded-xl p-3 mb-1" style={{ background: '#1a1200', border: '1px solid #FFD70040' }}>
                    <p className="text-xs" style={{ color: '#FFD700' }}>
                      ⚠️ Python cannot run in the browser preview — write your logic here for reference or planning. Switch to JS to see live results.
                    </p>
                  </div>
                  <textarea value={python} onChange={e => setPython(e.target.value)}
                    className="flex-1 rounded-xl p-3 text-sm text-white resize-none outline-none"
                    style={{ background: '#1C1C1C', border: '1px solid #333', fontFamily: 'JetBrains Mono, monospace', minHeight: 220 }} />
                </motion.div>
              )}

              {/* Live preview */}
              {tab === 'preview' && (
                <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col p-4 gap-2">
                  <p className="text-xs text-neutral-500">Live preview (HTML + CSS + JS):</p>
                  <iframe srcDoc={previewSrc}
                    className="flex-1 rounded-xl border border-neutral-800"
                    style={{ minHeight: 260, background: '#111' }}
                    sandbox="allow-scripts"
                    title="preview" />
                </motion.div>
              )}

            </AnimatePresence>

            <div className="px-4 pb-4 pt-2 border-t border-neutral-800">
              <button onClick={() => handleSubmit(false)}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: '#C8F135', color: '#000', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 1 }}>
                <Send size={16} /> SUBMIT BUILD
              </button>
            </div>
          </div>
        )}

        {phase === 'done' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center gap-5 py-12 px-4">
            {won
              ? <motion.div animate={{ rotate: [0,-10,10,-5,5,0] }} transition={{ duration: 0.6 }}><Trophy size={64} style={{ color: '#C8F135' }} /></motion.div>
              : <Hammer size={64} style={{ color: '#888' }} />}
            <p className="text-2xl font-bold" style={{ color: won ? '#C8F135' : '#fff', fontFamily: 'Anton, sans-serif' }}>
              {won ? 'BUILD COMPLETE!' : "TIME'S UP"}
            </p>
            <p className="text-neutral-400 text-sm text-center">
              {won ? `Great build! XP awarded and your duel is in the campus voting queue.` : `${opponent.name} finished first this time. Keep practicing!`}
            </p>
            <button onClick={onClose} className="mt-2 px-8 py-3 rounded-xl font-bold text-sm"
              style={{ background: '#C8F135', color: '#000', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 1 }}>
              BACK TO ARENA
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
