import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, Timer } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { awardXP, awardPies } from '../../services/firebaseService'
import { SPRINT_QUESTIONS } from '../../data/dsaProblems'
import { spring } from '../../lib/motion'

const SPRINT_TIME = 60

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function SprintModal({ onClose, onFinished }) {
  const { user, profile, updateProfile } = useAuth()
  const { addSprintScore, addTickerItem, trackActivity } = useApp()
  const [phase, setPhase] = useState('countdown') // countdown | playing | done
  const [countdown, setCountdown] = useState(3)
  const [timeLeft, setTimeLeft]   = useState(SPRINT_TIME)
  const [questions, setQuestions] = useState([])
  const [current, setCurrent]     = useState(0)
  const [answer, setAnswer]       = useState('')
  const [score, setScore]         = useState(0)
  const [feedback, setFeedback]   = useState(null) // 'correct' | 'wrong'
  const inputRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    setQuestions(shuffle(SPRINT_QUESTIONS))
  }, [])

  // Countdown 3..2..1
  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown <= 0) { setPhase('playing'); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, countdown])

  // Game timer
  useEffect(() => {
    if (phase !== 'playing') return
    inputRef.current?.focus()
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); endGame(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase])

  const endGame = useCallback(async () => {
    setPhase('done')
    const xp = score * 10
    const pies = Math.floor(score * 2)
    if (user && score > 0) {
      await awardXP(user.uid, xp)
      await awardPies(user.uid, pies)
      updateProfile({ xp: (profile?.xp || 0) + xp, pies: (profile?.pies || 0) + pies })
    }
    addSprintScore({ score, name: profile?.fullName?.split(' ')[0] || 'You', xp })
    addTickerItem(`⚡ ${profile?.fullName?.split(' ')[0] || 'You'} solved ${score} problems in Sprint!`)
    trackActivity()
    if (onFinished) onFinished({ score, xp })
  }, [score, user, profile])

  const handleSubmit = () => {
    if (!answer.trim() || phase !== 'playing') return
    const q = questions[current]
    const correct = answer.trim().toLowerCase() === q.a.toLowerCase() ||
      q.a.toLowerCase().includes(answer.trim().toLowerCase())

    setFeedback(correct ? 'correct' : 'wrong')
    if (correct) setScore(s => s + 1)
    setAnswer('')

    setTimeout(() => {
      setFeedback(null)
      if (correct) setCurrent(c => (c + 1) % questions.length)
    }, correct ? 300 : 600)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  const q = questions[current]
  const pct = (timeLeft / SPRINT_TIME) * 100

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.92)' }}
      onClick={e => e.target === e.currentTarget && phase === 'done' && onClose()}
    >
      <motion.div
        initial={{ y: 80, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 80, scale: 0.95 }}
        transition={spring.smooth}
        className="w-full rounded-t-3xl sm:rounded-3xl overflow-hidden relative"
        style={{ background: '#111', border: '1px solid #2a2a2a', maxWidth: 440 }}
      >
        {/* Back button — visible before game ends */}
        {phase !== 'done' && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: '#1a1a1a', border: '1px solid #2a2a2a' }}
          >
            <X className="w-3.5 h-3.5" style={{ color: '#555' }} />
          </button>
        )}

        {/* Timer bar */}
        <div className="h-1.5" style={{ background: '#1C1C1C' }}>
          <motion.div
            className="h-full"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'linear' }}
            style={{ background: timeLeft > 20 ? '#C8F135' : timeLeft > 10 ? '#FFD700' : '#EF4444' }}
          />
        </div>

        {/* COUNTDOWN */}
        {phase === 'countdown' && (
          <div className="py-20 text-center">
            <p style={{ color: '#555', fontFamily: 'Barlow Condensed, sans-serif', fontSize: '0.9rem', letterSpacing: '0.1em', marginBottom: 8 }}>SPRINT STARTS IN</p>
            <motion.p
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              style={{ fontFamily: 'Anton, sans-serif', fontSize: '5rem', color: '#C8F135' }}
            >
              {countdown || 'GO!'}
            </motion.p>
          </div>
        )}

        {/* PLAYING */}
        {phase === 'playing' && q && (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" style={{ color: '#C8F135' }} />
                <span style={{ fontFamily: 'Anton, sans-serif', fontSize: '1rem', color: '#C8F135', letterSpacing: '0.04em' }}>
                  {score} SOLVED
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5" style={{ color: timeLeft <= 10 ? '#EF4444' : '#888' }} />
                <span style={{ fontFamily: 'Anton, sans-serif', fontSize: '1.4rem', color: timeLeft <= 10 ? '#EF4444' : '#fff' }}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={spring.snappy}
              >
                <p style={{ color: '#fff', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.4, marginBottom: 16, letterSpacing: '0.01em' }}>
                  {q.q}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="relative">
              <input
                ref={inputRef}
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Type your answer..."
                className="w-full rounded-xl px-4 py-3 outline-none pr-16"
                style={{
                  background: feedback === 'correct' ? 'rgba(76,175,80,0.15)' : feedback === 'wrong' ? 'rgba(239,68,68,0.15)' : '#1C1C1C',
                  border: `1.5px solid ${feedback === 'correct' ? '#4CAF50' : feedback === 'wrong' ? '#EF4444' : '#2a2a2a'}`,
                  color: '#fff',
                  fontSize: '0.9rem',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                autoFocus
              />
              <motion.button
                onClick={handleSubmit}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5"
                style={{ background: '#C8F135', color: '#000', fontFamily: 'Anton, sans-serif', fontSize: '0.68rem', letterSpacing: '0.06em' }}
                whileTap={{ scale: 0.95 }}
                transition={spring.snappy}
              >
                GO
              </motion.button>
            </div>
            <p style={{ color: '#333', fontSize: '0.62rem', marginTop: 8, textAlign: 'center', fontFamily: 'JetBrains Mono, monospace' }}>
              Press Enter to submit · Close answers count!
            </p>
          </div>
        )}

        {/* DONE */}
        {phase === 'done' && (
          <div className="p-6 text-center">
            <p style={{ fontSize: '3rem', marginBottom: 8 }}>⚡</p>
            <h2 style={{ fontFamily: 'Anton, sans-serif', fontSize: '1.6rem', color: '#C8F135', letterSpacing: '0.04em' }}>
              SPRINT DONE!
            </h2>
            <div className="flex items-center justify-center gap-8 mt-5">
              <div>
                <p style={{ color: '#888', fontSize: '0.65rem', fontFamily: 'Barlow Condensed, sans-serif' }}>SOLVED</p>
                <p style={{ color: '#fff', fontFamily: 'Anton, sans-serif', fontSize: '2.5rem', lineHeight: 1 }}>{score}</p>
              </div>
              <div>
                <p style={{ color: '#888', fontSize: '0.65rem', fontFamily: 'Barlow Condensed, sans-serif' }}>XP EARNED</p>
                <p style={{ color: '#C8F135', fontFamily: 'Anton, sans-serif', fontSize: '2.5rem', lineHeight: 1 }}>+{score * 10}</p>
              </div>
            </div>
            <p style={{ color: '#555', fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', marginTop: 8 }}>
              {score * 10} XP added to your profile
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl py-3"
                style={{ background: '#1C1C1C', border: '1px solid #2a2a2a', color: '#888', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
              >
                EXIT
              </button>
              <motion.button
                onClick={() => { setPhase('countdown'); setCountdown(3); setTimeLeft(SPRINT_TIME); setScore(0); setCurrent(0); setQuestions(shuffle(SPRINT_QUESTIONS)) }}
                className="flex-1 rounded-xl py-3"
                style={{ background: '#C8F135', color: '#000', fontFamily: 'Anton, sans-serif', fontSize: '0.9rem', letterSpacing: '0.04em' }}
                whileTap={{ scale: 0.97 }}
                transition={spring.snappy}
              >
                PLAY AGAIN
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
