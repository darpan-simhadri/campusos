import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Timer, Zap, ArrowRight, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DAILY_QUESTS, getQuestProgress } from '../services/firebaseService'

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState('')
  useEffect(() => {
    const tick = () => {
      const now      = new Date()
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)
      const diff = midnight - now
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0')
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0')
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')
      setTimeLeft(`${h}:${m}:${s}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return timeLeft
}

// Where each quest action takes the user
const QUEST_ROUTES = {
  connect: '/friends',
  post:    '/build-in-public',
  collab:  '/skill-exchange',
  standup: '/feed',
  message: '/messages',
  streak:  null, // auto-granted, no navigation
}

const QUEST_HOW = {
  connect: 'Go to Friends → find a student from a different spec and connect',
  post:    'Go to Build in Public → post a project update',
  collab:  'Go to Skill Exchange → send a collab request to someone',
  standup: 'Go to Feed → post your daily standup update',
  message: 'Go to Messages → send a message to a classmate',
  streak:  'Complete any 3 other quests today to unlock this automatically',
}

export default function Quests() {
  const { user, profile } = useAuth()
  const navigate          = useNavigate()
  const [questsDone, setQuestsDone] = useState([])
  const [loading, setLoading]       = useState(true)
  const timeLeft = useCountdown()

  useEffect(() => {
    if (!user) return
    getQuestProgress(user.uid).then(({ questsDone }) => {
      setQuestsDone(questsDone)
      setLoading(false)
    })
  }, [user])

  const completed          = questsDone.length
  const totalXP            = DAILY_QUESTS.filter(q => questsDone.includes(q.id)).reduce((s, q) => s + q.xp, 0)
  const streakBonusLocked  = completed < 3

  return (
    <div style={{ background: '#000000', minHeight: '100%', paddingBottom: 32 }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <h1 style={{ fontFamily: 'Anton, sans-serif', fontSize: '1.6rem', color: '#fff', letterSpacing: '0.03em' }}>
            DAILY QUESTS
          </h1>
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: '#1C1C1C' }}>
            <Timer className="w-3.5 h-3.5" style={{ color: '#FFD700' }} />
            <span style={{ color: '#FFD700', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
              {timeLeft}
            </span>
          </div>
        </div>

        <div className="flex gap-3 mt-2">
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1" style={{ background: '#1C1C1C' }}>
            <Zap className="w-3 h-3" style={{ color: '#C8F135' }} />
            <span style={{ color: '#C8F135', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
              +{totalXP} XP today
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1" style={{ background: '#1C1C1C' }}>
            <span style={{ color: '#C8F135', fontSize: '0.72rem' }}>π</span>
            <span style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
              {profile?.pies ?? 100}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span style={{ color: '#888', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em', fontFamily: 'Barlow Condensed, sans-serif' }}>
              {completed}/{DAILY_QUESTS.length} COMPLETED TODAY
            </span>
            <span style={{ color: '#C8F135', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
              {Math.round((completed / DAILY_QUESTS.length) * 100)}%
            </span>
          </div>
          <div className="rounded-full overflow-hidden" style={{ background: '#1C1C1C', height: 6 }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #C8F135, #00D4C8)' }}
              initial={{ width: 0 }}
              animate={{ width: `${(completed / DAILY_QUESTS.length) * 100}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        {/* Info banner */}
        <div className="mt-3 rounded-xl px-3 py-2.5" style={{ background: '#0d1a00', border: '1px solid #C8F13525' }}>
          <p style={{ color: '#C8F135', fontSize: '0.72rem', fontWeight: 600 }}>
            ℹ️ Quests complete automatically when you do the real action — no shortcuts!
          </p>
        </div>
      </div>

      {/* Quest Cards */}
      {loading ? (
        <div className="px-4 mt-3 space-y-2">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="rounded-2xl h-20 animate-pulse" style={{ background: '#1C1C1C' }} />
          ))}
        </div>
      ) : (
        <div className="px-4 mt-3 space-y-2">
          {DAILY_QUESTS.map((quest, idx) => {
            const isDone   = questsDone.includes(quest.id)
            const isStreak = quest.id === 'q6'
            const locked   = isStreak && streakBonusLocked && !isDone
            const route    = QUEST_ROUTES[quest.action]
            const how      = QUEST_HOW[quest.action]

            return (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-2xl p-4"
                style={{
                  background: isDone ? 'rgba(200,241,53,0.06)' : '#1C1C1C',
                  border: `1px solid ${isDone ? '#C8F13540' : locked ? '#1a1a1a' : '#2a2a2a'}`,
                  opacity: locked ? 0.5 : 1,
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
                    style={{ background: isDone ? 'rgba(200,241,53,0.15)' : '#2a2a2a', fontSize: '1.1rem' }}>
                    {quest.icon}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span style={{
                        color: isDone ? '#C8F135' : locked ? '#444' : '#fff',
                        fontSize: '0.8rem', fontWeight: 700,
                        fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.05em',
                        textDecoration: isDone ? 'line-through' : 'none',
                      }}>
                        {quest.label}
                      </span>
                      <span style={{
                        color: '#C8F135', fontSize: '0.68rem', fontWeight: 700,
                        fontFamily: 'JetBrains Mono, monospace',
                      }}>
                        +{quest.xp} XP
                      </span>
                      {locked && <Lock size={11} style={{ color: '#555' }} />}
                    </div>

                    <p style={{ color: '#666', fontSize: '0.7rem', marginBottom: isDone ? 0 : 6, lineHeight: 1.4 }}>
                      {quest.desc}
                    </p>

                    {/* How to complete hint */}
                    {!isDone && !locked && (
                      <p style={{ color: '#444', fontSize: '0.65rem', lineHeight: 1.4 }}>{how}</p>
                    )}

                    {isDone && (
                      <p style={{ color: '#C8F135', fontSize: '0.68rem', fontWeight: 600 }}>✓ Completed today!</p>
                    )}

                    {locked && (
                      <p style={{ color: '#555', fontSize: '0.68rem' }}>Complete 3 quests first to unlock</p>
                    )}
                  </div>

                  {/* Right side: status or go button */}
                  <div className="flex-shrink-0 flex flex-col items-end gap-2">
                    {isDone ? (
                      <CheckCircle2 size={22} style={{ color: '#C8F135' }} />
                    ) : locked ? (
                      <Lock size={18} style={{ color: '#444' }} />
                    ) : route ? (
                      <button
                        onClick={() => navigate(route)}
                        className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold"
                        style={{ background: '#C8F135', color: '#000', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 0.5 }}>
                        GO <ArrowRight size={12} />
                      </button>
                    ) : (
                      <Circle size={22} style={{ color: '#333' }} />
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Streak bonus tip */}
      {!questsDone.includes('q6') && completed >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-4 rounded-xl px-3 py-2.5 flex items-center gap-2"
          style={{ background: 'rgba(200,241,53,0.08)', border: '1px solid rgba(200,241,53,0.25)' }}>
          <span style={{ fontSize: '1rem' }}>🔥</span>
          <span style={{ color: '#C8F135', fontSize: '0.72rem', fontWeight: 700 }}>
            3 quests done! STREAK KEEP bonus of 100 XP will be awarded automatically!
          </span>
        </motion.div>
      )}
    </div>
  )
}
