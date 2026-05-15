import { useState, useEffect, useRef, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Timer, CheckCircle2, XCircle, Trophy, Zap, ChevronRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useApp } from '../../context/AppContext'
import { awardXP, awardPies } from '../../services/firebaseService'
import { spring } from '../../lib/motion'

const DIFF_COLOR = { Easy: '#4CAF50', Medium: '#FFD700', Hard: '#EF4444' }
const TIME_LIMIT = 300 // 5 minutes

function useTimer(active, onExpire) {
  const [left, setLeft] = useState(TIME_LIMIT)
  const ref = useRef(null)
  useEffect(() => {
    if (!active) return
    ref.current = setInterval(() => {
      setLeft(l => {
        if (l <= 1) { clearInterval(ref.current); onExpire(); return 0 }
        return l - 1
      })
    }, 1000)
    return () => clearInterval(ref.current)
  }, [active, onExpire])
  return { left, reset: () => setLeft(TIME_LIMIT) }
}

function runJSCode(code, functionName, testCases) {
  try {
    const fn = new Function(code + `\n return ${functionName}`)()
    if (typeof fn !== 'function') return testCases.map(tc => ({ passed: false, error: 'Function not found', expected: tc.expected }))
    return testCases.map(tc => {
      try {
        const actual = fn(...tc.args)
        const exp = tc.expected
        // For array results, accept any ordering if problem allows it
        const passed = JSON.stringify(actual) === JSON.stringify(exp)
          || (Array.isArray(actual) && Array.isArray(exp) && actual.length === exp.length && exp.every(v => actual.includes(v)))
        return { passed, actual, expected: exp }
      } catch (e) {
        return { passed: false, error: e.message, expected: tc.expected }
      }
    })
  } catch (e) {
    return testCases.map(tc => ({ passed: false, error: e.message, expected: tc.expected }))
  }
}

function fmt(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2,'0')}:${String(seconds % 60).padStart(2,'0')}`
}

export default function DSADuelModal({ problem, onClose, onSolved }) {
  const { user, profile, updateProfile } = useAuth()
  const { addDuelResult, addTickerItem, trackActivity } = useApp()
  const [lang, setLang]           = useState('javascript')
  const [code, setCode]           = useState(problem.starterCode?.javascript || '')
  const [tab, setTab]             = useState('code') // 'problem' | 'code' — default to editor
  const [results, setResults]     = useState(null)
  const [running, setRunning]     = useState(false)
  const [phase, setPhase]         = useState('playing') // 'playing' | 'won' | 'lost'
  const [xpEarned, setXpEarned]   = useState(0)
  const [timeTaken, setTimeTaken] = useState(0)
  const [opponentPct, setOpponentPct] = useState(0)
  const [opponentDone, setOpponentDone] = useState(false)
  const opponent = { name: 'ARJUN M', avatar: 'A', spec: 'AIML' }

  const handleExpire = useCallback(() => {
    if (phase === 'playing') setPhase('lost')
  }, [phase])

  const { left } = useTimer(phase === 'playing', handleExpire)
  const pct = ((TIME_LIMIT - left) / TIME_LIMIT) * 100

  // Opponent simulation: advances randomly, solves between 60-85% through timer
  useEffect(() => {
    if (phase !== 'playing') return
    const tick = setInterval(() => {
      setOpponentPct(prev => {
        const next = prev + (Math.random() * 1.5)
        if (next >= 100) { clearInterval(tick); setOpponentDone(true); return 100 }
        return next
      })
    }, 1500)
    return () => clearInterval(tick)
  }, [phase])

  const handleRun = () => {
    if (running || phase !== 'playing') return
    setRunning(true)
    setTab('code')

    if (lang === 'python') {
      setResults([{ passed: null, error: 'Python runs on our backend — switch to JavaScript to execute locally.' }])
      setRunning(false)
      return
    }

    setTimeout(() => {
      const res = runJSCode(code, problem.functionName, problem.testCases)
      setResults(res)
      setRunning(false)
      const allPassed = res.every(r => r.passed)
      if (allPassed) {
        const taken = TIME_LIMIT - left
        setTimeTaken(taken)
        triggerWin(taken)
      }
    }, 400)
  }

  const triggerWin = async (taken) => {
    setPhase('won')
    const xp = problem.xpReward
    const pies = Math.max(1, Math.floor(xp / 10))
    setXpEarned(xp)
    if (user) {
      await awardXP(user.uid, xp)
      await awardPies(user.uid, pies)
      updateProfile({ xp: (profile?.xp || 0) + xp, pies: (profile?.pies || 0) + pies })
    }
    addDuelResult({ problem: problem.title, difficulty: problem.difficulty, result: 'win', xp, timeTaken: taken })
    addTickerItem(`⚡ ${profile?.fullName?.split(' ')[0] || 'You'} solved ${problem.title} in ${fmt(taken)}`)
    trackActivity()
    if (onSolved) onSolved({ xp, pies, problem })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: '#000' }}
    >
      {/* Timer bar */}
      <div className="h-1 w-full flex-shrink-0" style={{ background: '#1C1C1C' }}>
        <motion.div
          className="h-full"
          animate={{ width: `${100 - pct}%` }}
          transition={{ duration: 1, ease: 'linear' }}
          style={{ background: left > 60 ? '#C8F135' : left > 20 ? '#FFD700' : '#EF4444' }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0" style={{ borderBottom: '1px solid #1C1C1C' }}>
        <div className="flex items-center gap-3">
          <span className="rounded-full px-2 py-0.5" style={{ background: `${DIFF_COLOR[problem.difficulty]}22`, color: DIFF_COLOR[problem.difficulty], fontSize: '0.6rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
            {problem.difficulty}
          </span>
          <span style={{ color: '#fff', fontFamily: 'Anton, sans-serif', fontSize: '0.95rem', letterSpacing: '0.03em' }}>
            {problem.title}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5" style={{ color: left <= 30 ? '#EF4444' : '#888' }} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', fontWeight: 700, color: left <= 30 ? '#EF4444' : '#fff' }}>
              {fmt(left)}
            </span>
          </div>
          {phase === 'playing' && (
            <button onClick={onClose} style={{ color: '#555' }}><X className="w-4 h-4" /></button>
          )}
        </div>
      </div>

      {/* VS bar */}
      <div className="flex items-center gap-3 px-4 py-2 flex-shrink-0" style={{ borderBottom: '1px solid #1C1C1C', background: '#0A0A0A' }}>
        {/* You */}
        <div className="flex items-center gap-1.5 flex-1">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#C8F135', color: '#000' }}>
            {profile?.fullName?.[0] || 'Y'}
          </div>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#1C1C1C' }}>
            <motion.div className="h-full rounded-full" style={{ background: '#C8F135' }} animate={{ width: results?.every(r => r.passed) ? '100%' : `${Math.min(90, pct * 0.5)}%` }} />
          </div>
        </div>
        <span style={{ color: '#444', fontSize: '0.65rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>VS</span>
        {/* Opponent */}
        <div className="flex items-center gap-1.5 flex-1 flex-row-reverse">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#E040FB', color: '#fff' }}>
            {opponent.avatar}
          </div>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#1C1C1C' }}>
            <motion.div className="h-full rounded-full" style={{ background: '#E040FB' }} animate={{ width: `${opponentPct}%` }} />
          </div>
          {opponentDone && <span style={{ color: '#EF4444', fontSize: '0.55rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>SOLVED</span>}
        </div>
      </div>

      {/* Mobile tab bar */}
      <div className="flex lg:hidden flex-shrink-0" style={{ borderBottom: '1px solid #1C1C1C', background: '#0A0A0A' }}>
        {['code', 'problem'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-3 text-center"
            style={{
              fontFamily: 'Anton, sans-serif', fontSize: '0.82rem', letterSpacing: '0.06em',
              color: tab === t ? '#C8F135' : '#555',
              borderBottom: tab === t ? '3px solid #C8F135' : '3px solid transparent',
              background: tab === t ? 'rgba(200,241,53,0.05)' : 'transparent',
            }}
          >
            {t === 'code' ? '✏️  WRITE CODE' : '📋  PROBLEM'}
          </button>
        ))}
      </div>

      {/* Language selector (code tab only) */}
      {tab === 'code' && (
        <div className="flex gap-2 px-3 py-2 flex-shrink-0 lg:hidden" style={{ borderBottom: '1px solid #1C1C1C' }}>
          {['javascript', 'python'].map(l => (
            <button
              key={l}
              onClick={() => {
                setLang(l)
                setCode(problem.starterCode?.[l] || '')
                setResults(null)
              }}
              className="rounded-full px-3 py-1"
              style={{ background: lang === l ? '#C8F135' : '#1C1C1C', color: lang === l ? '#000' : '#666', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', fontWeight: 700, border: lang === l ? 'none' : '1px solid #2a2a2a' }}
            >
              {l === 'javascript' ? 'JS' : 'PY'}
            </button>
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Problem pane */}
        <div
          className={`overflow-y-auto flex-shrink-0 flex-col w-full lg:w-96 ${tab === 'problem' ? 'flex' : 'hidden'} lg:flex`}
        >
          <div className="p-4 flex-1">
            <p style={{ color: '#ccc', fontSize: '0.82rem', lineHeight: 1.7, marginBottom: 16 }}>{problem.description}</p>
            {problem.examples?.map((ex, i) => (
              <div key={i} className="rounded-xl p-3 mb-3" style={{ background: '#0D0D0D', border: '1px solid #1C1C1C' }}>
                <p style={{ color: '#888', fontSize: '0.65rem', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.04em', marginBottom: 4 }}>EXAMPLE {i+1}</p>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: '#C8F135' }}>Input: {ex.input}</p>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: '#4CAF50', marginTop: 2 }}>Output: {ex.output}</p>
                {ex.explanation && <p style={{ color: '#666', fontSize: '0.65rem', marginTop: 4 }}>{ex.explanation}</p>}
              </div>
            ))}
            <div>
              <p style={{ color: '#555', fontSize: '0.65rem', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.04em', marginBottom: 6 }}>CONSTRAINTS</p>
              {problem.constraints?.map((c, i) => (
                <p key={i} style={{ color: '#555', fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace', marginBottom: 2 }}>• {c}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Code pane (desktop: always shown right; mobile: tab) */}
        <div
          className={`flex-col flex-1 ${tab === 'code' ? 'flex' : 'hidden'} lg:flex`}
          style={{ borderLeft: '1px solid #1C1C1C', minWidth: 0 }}
        >
          {/* Desktop language selector */}
          <div className="hidden lg:flex gap-2 px-3 py-2 flex-shrink-0" style={{ borderBottom: '1px solid #1C1C1C' }}>
            {['javascript', 'python'].map(l => (
              <button
                key={l}
                onClick={() => { setLang(l); setCode(problem.starterCode?.[l] || ''); setResults(null) }}
                className="rounded-full px-3 py-1"
                style={{ background: lang === l ? '#C8F135' : '#1C1C1C', color: lang === l ? '#000' : '#666', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.68rem', fontWeight: 700, border: lang === l ? 'none' : '1px solid #2a2a2a' }}
              >
                {l === 'javascript' ? 'JavaScript' : 'Python'}
              </button>
            ))}
          </div>

          {/* Monaco */}
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={lang === 'python' ? 'python' : 'javascript'}
              theme="vs-dark"
              value={code}
              onChange={val => setCode(val || '')}
              options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false, padding: { top: 12 }, lineNumbersMinChars: 3 }}
            />
          </div>

          {/* Test results */}
          {results && (
            <div className="flex-shrink-0 p-3 space-y-1.5 overflow-y-auto" style={{ maxHeight: 180, borderTop: '1px solid #1C1C1C', background: '#050505' }}>
              <p style={{ color: '#555', fontSize: '0.6rem', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.06em', marginBottom: 6 }}>TEST RESULTS</p>
              {results.map((r, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg p-2" style={{ background: r.passed ? 'rgba(76,175,80,0.08)' : 'rgba(239,68,68,0.08)' }}>
                  {r.passed === null
                    ? <span style={{ color: '#FFD700', fontSize: '0.68rem', fontFamily: 'JetBrains Mono, monospace' }}>ℹ {r.error}</span>
                    : r.passed
                      ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#4CAF50' }} />
                      : <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#EF4444' }} />
                  }
                  {r.passed !== null && (
                    <div>
                      <p style={{ color: r.passed ? '#4CAF50' : '#EF4444', fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace' }}>
                        {r.passed ? 'PASSED' : r.error ? `ERROR: ${r.error}` : `Expected ${JSON.stringify(r.expected)}, got ${JSON.stringify(r.actual)}`}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Run button */}
          <div className="flex-shrink-0 p-3" style={{ borderTop: '1px solid #1C1C1C' }}>
            <motion.button
              onClick={handleRun}
              disabled={running || phase !== 'playing'}
              className="w-full rounded-xl py-3 flex items-center justify-center gap-2"
              style={{ background: phase === 'playing' ? '#C8F135' : '#1C1C1C', color: phase === 'playing' ? '#000' : '#555', fontFamily: 'Anton, sans-serif', fontSize: '0.9rem', letterSpacing: '0.06em' }}
              whileTap={phase === 'playing' ? { scale: 0.97 } : {}}
              transition={spring.snappy}
            >
              <Play className="w-4 h-4" />
              {running ? 'RUNNING...' : 'RUN TESTS'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Win/Lose overlay */}
      <AnimatePresence>
        {phase !== 'playing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center z-10 px-6"
            style={{ background: 'rgba(0,0,0,0.92)' }}
          >
            <div className="rounded-3xl p-8 text-center w-full" style={{ background: '#111', border: `1px solid ${phase === 'won' ? '#C8F135' : '#EF4444'}`, maxWidth: 360 }}>
              <p style={{ fontSize: '3.5rem', marginBottom: 8 }}>{phase === 'won' ? '🏆' : '⏱️'}</p>
              <h2 style={{ fontFamily: 'Anton, sans-serif', fontSize: '2rem', color: phase === 'won' ? '#C8F135' : '#EF4444', letterSpacing: '0.04em' }}>
                {phase === 'won' ? 'SOLVED!' : "TIME'S UP"}
              </h2>

              {phase === 'won' ? (
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div><p style={{ color: '#888', fontSize: '0.65rem', fontFamily: 'Barlow Condensed, sans-serif' }}>XP EARNED</p>
                    <p style={{ color: '#C8F135', fontFamily: 'Anton, sans-serif', fontSize: '1.8rem' }}>+{xpEarned}</p></div>
                  <div><p style={{ color: '#888', fontSize: '0.65rem', fontFamily: 'Barlow Condensed, sans-serif' }}>TIME</p>
                    <p style={{ color: '#fff', fontFamily: 'Anton, sans-serif', fontSize: '1.8rem' }}>{fmt(timeTaken)}</p></div>
                </div>
              ) : (
                <p style={{ color: '#666', fontSize: '0.82rem', marginTop: 12, lineHeight: 1.5 }}>
                  Better luck next time! The correct approach for {problem.title} uses a hash map for O(n) time.
                </p>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-xl py-3"
                  style={{ background: '#1C1C1C', border: '1px solid #2a2a2a', color: '#888', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700 }}
                >
                  EXIT
                </button>
                {phase === 'won' && (
                  <motion.button
                    onClick={onClose}
                    className="flex-1 rounded-xl py-3"
                    style={{ background: '#C8F135', color: '#000', fontFamily: 'Anton, sans-serif', fontSize: '0.9rem', letterSpacing: '0.04em' }}
                    whileTap={{ scale: 0.97 }}
                    transition={spring.snappy}
                  >
                    AWESOME!
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
