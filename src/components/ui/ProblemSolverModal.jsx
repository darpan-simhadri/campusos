import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Timer, CheckCircle2, XCircle, Zap, Trophy } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { awardXP, awardPies, completeQuest, getQuestProgress, DAILY_QUESTS } from '../../services/firebaseService'
import { spring } from '../../lib/motion'

const DIFF_COLOR = { Easy: '#4CAF50', Medium: '#FFD700', Hard: '#EF4444' }

function useTimer(seconds, onExpire) {
  const [left, setLeft] = useState(seconds)
  useEffect(() => {
    if (left <= 0) { onExpire(); return }
    const id = setTimeout(() => setLeft(l => l - 1), 1000)
    return () => clearTimeout(id)
  }, [left, onExpire])
  return left
}

export default function ProblemSolverModal({ problem, onClose, onSolved, context = 'practice' }) {
  const { user, profile, updateProfile } = useAuth()
  const [selected, setSelected]   = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult]       = useState(null) // 'correct' | 'wrong' | 'timeout'
  const [xpEarned, setXpEarned]   = useState(0)
  const [piesEarned, setPiesEarned] = useState(0)
  const TIME_LIMIT = problem.difficulty === 'Hard' ? 90 : problem.difficulty === 'Medium' ? 60 : 45

  const handleExpire = useCallback(() => {
    if (!submitted) {
      setSubmitted(true)
      setResult('timeout')
    }
  }, [submitted])

  const timeLeft = useTimer(submitted ? TIME_LIMIT : TIME_LIMIT, handleExpire)
  const pct = ((TIME_LIMIT - timeLeft) / TIME_LIMIT) * 100

  const handleSubmit = async () => {
    if (selected === null || submitted) return
    setSubmitted(true)
    const correct = selected === problem.answer
    setResult(correct ? 'correct' : 'wrong')

    if (correct && user) {
      const xp    = problem.xp
      const pies  = Math.max(1, Math.floor(xp / 10))
      setXpEarned(xp)
      setPiesEarned(pies)
      await awardXP(user.uid, xp)
      await awardPies(user.uid, pies)
      updateProfile({ xp: (profile?.xp || 0) + xp, pies: (profile?.pies || 0) + pies })

      // Auto-complete relevant quests
      if (context === 'compete') {
        const { questsDone, questsCompletedDate } = await getQuestProgress(user.uid)
        const today = new Date().toISOString().slice(0, 10)
        const done  = questsCompletedDate === today ? questsDone : []
        const leagueQuest = DAILY_QUESTS.find(q => q.action === 'connect')
        if (leagueQuest && !done.includes(leagueQuest.id)) {
          await completeQuest(user.uid, leagueQuest.id, leagueQuest.xp)
        }
      }

      if (onSolved) onSolved({ xp, pies, problem })
    }
  }

  const catColor = {
    DSA: '#00D4C8', 'System Design': '#E040FB', React: '#61DAFB',
    OS: '#FF6B00', DBMS: '#4CAF50', 'AI/ML': '#C8F135',
  }[problem.category] || '#888'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={(e) => e.target === e.currentTarget && !submitted && onClose()}
    >
      <motion.div
        initial={{ y: 60, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 60, scale: 0.97 }}
        transition={spring.smooth}
        className="w-full rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{ background: '#111', border: '1px solid #2a2a2a', maxWidth: 520, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Timer bar */}
        <div className="h-1.5 w-full" style={{ background: '#1C1C1C' }}>
          <motion.div
            className="h-full"
            animate={{ width: `${100 - pct}%` }}
            transition={{ duration: 1, ease: 'linear' }}
            style={{
              background: timeLeft > 15 ? '#C8F135' : timeLeft > 5 ? '#FFD700' : '#EF4444',
              height: '100%',
            }}
          />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-4 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="rounded-full px-2 py-0.5"
              style={{ background: `${catColor}22`, color: catColor, fontSize: '0.6rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}
            >
              {problem.category}
            </span>
            <span
              className="rounded-full px-2 py-0.5"
              style={{ background: `${DIFF_COLOR[problem.difficulty]}22`, color: DIFF_COLOR[problem.difficulty], fontSize: '0.6rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}
            >
              {problem.difficulty}
            </span>
            <span style={{ color: '#C8F135', fontSize: '0.62rem', fontFamily: 'JetBrains Mono, monospace' }}>
              +{problem.xp} XP
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-1">
              <Timer className="w-3.5 h-3.5" style={{ color: timeLeft <= 10 ? '#EF4444' : '#888' }} />
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: timeLeft <= 10 ? '#EF4444' : '#ccc',
                }}
              >
                {String(Math.floor(timeLeft / 60)).padStart(2,'0')}:{String(timeLeft % 60).padStart(2,'0')}
              </span>
            </div>
            {!submitted && (
              <button onClick={onClose} style={{ color: '#555' }}>
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {/* Question */}
          <h2 style={{ color: '#fff', fontFamily: 'Anton, sans-serif', fontSize: '1.05rem', letterSpacing: '0.03em', lineHeight: 1.35, marginBottom: 20 }}>
            {problem.question}
          </h2>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {problem.options.map((opt, i) => {
              const isSelected = selected === i
              const isCorrect  = submitted && i === problem.answer
              const isWrong    = submitted && isSelected && i !== problem.answer

              let bg = '#1C1C1C'
              let border = '#2a2a2a'
              let textColor = '#ccc'

              if (isCorrect) { bg = 'rgba(76,175,80,0.12)'; border = '#4CAF50'; textColor = '#4CAF50' }
              else if (isWrong) { bg = 'rgba(239,68,68,0.12)'; border = '#EF4444'; textColor = '#EF4444' }
              else if (isSelected && !submitted) { bg = 'rgba(200,241,53,0.1)'; border = '#C8F135'; textColor = '#fff' }

              return (
                <motion.button
                  key={i}
                  onClick={() => !submitted && setSelected(i)}
                  className="w-full rounded-2xl px-4 py-3 text-left flex items-center gap-3"
                  style={{ background: bg, border: `1.5px solid ${border}`, cursor: submitted ? 'default' : 'pointer' }}
                  whileTap={!submitted ? { scale: 0.98 } : {}}
                  transition={spring.snappy}
                >
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-bold"
                    style={{ background: isCorrect ? '#4CAF50' : isWrong ? '#EF4444' : isSelected ? '#C8F135' : '#2a2a2a', color: (isCorrect || isWrong || isSelected) ? '#000' : '#666', fontSize: '0.72rem' }}
                  >
                    {isCorrect ? '✓' : isWrong ? '✕' : String.fromCharCode(65 + i)}
                  </span>
                  <span style={{ color: textColor, fontSize: '0.85rem', lineHeight: 1.4 }}>{opt}</span>
                </motion.button>
              )
            })}
          </div>

          {/* Explanation (after submit) */}
          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={spring.smooth}
                className="rounded-2xl p-4 mb-4"
                style={{
                  background: result === 'correct' ? 'rgba(76,175,80,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${result === 'correct' ? '#4CAF50' : '#EF4444'}`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  {result === 'correct'
                    ? <CheckCircle2 className="w-4 h-4" style={{ color: '#4CAF50' }} />
                    : <XCircle className="w-4 h-4" style={{ color: '#EF4444' }} />
                  }
                  <span style={{ color: result === 'correct' ? '#4CAF50' : '#EF4444', fontFamily: 'Anton, sans-serif', fontSize: '0.9rem', letterSpacing: '0.04em' }}>
                    {result === 'correct' ? 'CORRECT!' : result === 'timeout' ? 'TIME UP!' : 'WRONG ANSWER'}
                  </span>
                  {result === 'correct' && (
                    <span style={{ color: '#C8F135', fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', marginLeft: 'auto' }}>
                      +{xpEarned} XP  +{piesEarned}π
                    </span>
                  )}
                </div>
                <p style={{ color: '#aaa', fontSize: '0.8rem', lineHeight: 1.6 }}>
                  <strong style={{ color: '#ccc' }}>Explanation: </strong>{problem.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit / Next button */}
          {!submitted ? (
            <motion.button
              onClick={handleSubmit}
              disabled={selected === null}
              className="w-full rounded-xl py-3 font-bold"
              style={{
                background: selected !== null ? '#C8F135' : '#1C1C1C',
                color: selected !== null ? '#000' : '#555',
                fontFamily: 'Anton, sans-serif',
                fontSize: '0.95rem',
                letterSpacing: '0.06em',
              }}
              whileTap={selected !== null ? { scale: 0.97 } : {}}
              transition={spring.snappy}
            >
              SUBMIT ANSWER
            </motion.button>
          ) : (
            <motion.button
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full rounded-xl py-3 font-bold"
              style={{ background: '#1C1C1C', border: '1px solid #2a2a2a', color: '#fff', fontFamily: 'Anton, sans-serif', fontSize: '0.95rem', letterSpacing: '0.06em' }}
              whileTap={{ scale: 0.97 }}
              transition={spring.snappy}
            >
              CLOSE
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
