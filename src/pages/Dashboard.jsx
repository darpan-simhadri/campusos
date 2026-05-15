import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { subscribeToLeaderboard, getQuestProgress, DAILY_QUESTS } from '../services/firebaseService'
import { spring } from '../lib/motion'

// ─── League tiers ─────────────────────────────────────────────────────────────
const LEAGUES = [
  { name: 'BRONZE',   min: 0,     max: 999,   color: '#CD7F32', icon: '🥉' },
  { name: 'SILVER',   min: 1000,  max: 2499,  color: '#C0C0C0', icon: '🥈' },
  { name: 'GOLD',     min: 2500,  max: 4999,  color: '#FFD700', icon: '🥇' },
  { name: 'DIAMOND',  min: 5000,  max: 9999,  color: '#00D4C8', icon: '💎' },
  { name: 'OBSIDIAN', min: 10000, max: Infinity, color: '#E040FB', icon: '🔮' },
]

function getLeague(xp) {
  for (let i = LEAGUES.length - 1; i >= 0; i--) {
    if (xp >= LEAGUES[i].min) return { ...LEAGUES[i], index: i }
  }
  return { ...LEAGUES[0], index: 0 }
}

// ─── Daily XP (localStorage, resets each calendar day) ────────────────────────
const DAILY_GOAL = 100

function getDailyKey() { return `cos_dailyXP_${new Date().toDateString()}` }
function getTodayXP()  { return parseInt(localStorage.getItem(getDailyKey()) || '0', 10) }

// ─── Learning path nodes ──────────────────────────────────────────────────────
const PATH_NODES = [
  { id: 'login',   label: 'Daily Login',  emoji: '🔥', route: null,        questKey: 'streak'  },
  { id: 'arena',   label: 'Enter Arena',  emoji: '⚔️',  route: '/arena',    questKey: null      },
  { id: 'feed',    label: 'Post to Feed', emoji: '📢',  route: '/feed',     questKey: 'standup' },
  { id: 'friends', label: 'Connect',      emoji: '🤝',  route: '/friends',  questKey: 'connect' },
  { id: 'message', label: 'Send Message', emoji: '💬',  route: '/messages', questKey: 'message' },
  { id: 'boss',    label: 'Weekly Boss',  emoji: '👑',  route: '/compete',  questKey: null, boss: true },
]

// ─── Confetti burst ───────────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#C8F135', '#00D4C8', '#E040FB', '#FFD700', '#FF6B00', '#fff']

function Confetti({ active }) {
  if (!active) return null
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.6,
    dur: 1.2 + Math.random() * 1,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 4 + Math.random() * 6,
    rotate: Math.random() * 360,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map(p => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: -16,
            width: p.size,
            height: p.size,
            borderRadius: p.id % 3 === 0 ? '50%' : 2,
            background: p.color,
            rotate: p.rotate,
          }}
          animate={{ y: ['0vh', '110vh'], rotate: p.rotate + 360 * 3, opacity: [1, 1, 0] }}
          transition={{ duration: p.dur, delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}

// ─── Goal ring (SVG) ──────────────────────────────────────────────────────────
function GoalRing({ todayXP, done }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const pct  = Math.min(100, (todayXP / DAILY_GOAL) * 100)
  const offset = circ * (1 - pct / 100)

  return (
    <div className="relative flex items-center justify-center" style={{ width: 148, height: 148 }}>
      <svg width="148" height="148" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx="74" cy="74" r={r} fill="none" stroke="#1C1C1C" strokeWidth="11" />
        <motion.circle
          cx="74" cy="74" r={r}
          fill="none"
          stroke={done ? '#00D4C8' : '#C8F135'}
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={circ}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="flex flex-col items-center z-10">
        <span style={{ fontFamily: 'Anton, sans-serif', fontSize: '2rem', color: done ? '#00D4C8' : '#fff', lineHeight: 1 }}>
          {todayXP}
        </span>
        <span style={{ color: '#555', fontSize: '0.58rem', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
          / {DAILY_GOAL} XP
        </span>
        {done && (
          <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring.snappy}
            style={{ fontSize: '1rem', marginTop: 4 }}>
            🎉
          </motion.span>
        )}
      </div>
    </div>
  )
}

// ─── Single path node ─────────────────────────────────────────────────────────
function PathNode({ node, status, navigate }) {
  const isDone   = status === 'done'
  const isActive = status === 'active'
  const isLocked = status === 'locked'

  return (
    <motion.button
      onClick={() => !isLocked && node.route && navigate(node.route)}
      disabled={isLocked || !node.route}
      className="flex flex-col items-center gap-1.5 cursor-pointer"
      whileTap={!isLocked ? { scale: 0.88 } : {}}
      transition={spring.snappy}
    >
      {/* Circle */}
      <motion.div
        className="flex items-center justify-center rounded-full"
        style={{
          width:  isActive ? 72 : 60,
          height: isActive ? 72 : 60,
          background: isDone
            ? 'linear-gradient(135deg, #C8F135, #8BC34A)'
            : isActive
              ? '#1C1C1C'
              : '#0D0D0D',
          border: `${isActive ? 3 : 2}px solid ${isDone ? '#C8F135' : isActive ? '#C8F135' : '#222'}`,
          boxShadow: isActive ? '0 0 0 6px rgba(200,241,53,0.12)' : 'none',
        }}
        animate={isActive ? {
          boxShadow: [
            '0 0 0 6px rgba(200,241,53,0.10)',
            '0 0 0 14px rgba(200,241,53,0.04)',
            '0 0 0 6px rgba(200,241,53,0.10)',
          ],
        } : {}}
        transition={{ duration: 2.2, repeat: Infinity }}
      >
        <span style={{ fontSize: isActive ? '1.6rem' : isDone ? '1.3rem' : '1.1rem' }}>
          {isDone ? '✅' : isLocked ? '🔒' : node.emoji}
        </span>
      </motion.div>

      {/* Label */}
      <span style={{
        fontFamily: 'Barlow Condensed, sans-serif',
        fontSize: '0.65rem',
        fontWeight: 700,
        letterSpacing: '0.04em',
        color: isDone ? '#C8F135' : isActive ? '#fff' : isLocked ? '#2a2a2a' : '#555',
      }}>
        {node.label.toUpperCase()}
      </span>

      {/* XP badge on active */}
      {isActive && (
        <motion.span
          initial={{ scale: 0, y: -4 }}
          animate={{ scale: 1, y: 0 }}
          style={{
            background: '#C8F135',
            color: '#000',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.55rem',
            fontWeight: 700,
            borderRadius: 99,
            padding: '1px 6px',
          }}
        >
          START →
        </motion.span>
      )}
    </motion.button>
  )
}

// ─── Learning path with connecting line ───────────────────────────────────────
function LearningPath({ questsDone, navigate }) {
  // Work out which nodes are done/active/locked
  const statuses = PATH_NODES.map((node, i) => {
    const done = node.questKey ? questsDone.includes(node.questKey) : false
    if (done) return 'done'
    // boss unlocks only when 4+ quests done
    if (node.boss && questsDone.length < 4) return 'locked'
    // active = first non-done node
    const prevDone = PATH_NODES.slice(0, i).every((n, j) =>
      statuses ? statuses[j] === 'done' : false
    )
    return 'active' // simplified: all non-done non-boss are active
  })

  // Recalculate properly
  let foundActive = false
  const finalStatuses = PATH_NODES.map((node, i) => {
    if (node.questKey && questsDone.includes(node.questKey)) return 'done'
    if (node.boss && questsDone.length < 4) return 'locked'
    if (!foundActive) { foundActive = true; return 'active' }
    return 'available'
  })

  // Split into left and right columns (zigzag)
  const left  = PATH_NODES.filter((_, i) => i % 2 === 0)
  const right = PATH_NODES.filter((_, i) => i % 2 === 1)
  const leftS  = finalStatuses.filter((_, i) => i % 2 === 0)
  const rightS = finalStatuses.filter((_, i) => i % 2 === 1)

  return (
    <div className="px-6 py-2">
      <p style={{ color: '#444', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', fontFamily: 'Barlow Condensed, sans-serif', marginBottom: 20 }}>
        TODAY'S PATH
      </p>
      {/* Zigzag: render pairs */}
      <div className="flex flex-col gap-6">
        {left.map((lNode, row) => {
          const rNode = right[row]
          const lSt   = leftS[row]
          const rSt   = rNode ? rightS[row] : null
          return (
            <div key={lNode.id} className="flex items-start justify-around">
              <PathNode node={lNode} status={lSt} navigate={navigate} />
              {/* Connector arrow */}
              {rNode && (
                <div className="flex items-center self-center" style={{ marginTop: -16 }}>
                  <motion.span
                    style={{ color: lSt === 'done' ? '#C8F135' : '#222', fontSize: '1.2rem' }}
                    animate={lSt !== 'done' ? {} : { x: [0, 4, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </div>
              )}
              {rNode && <PathNode node={rNode} status={rSt} navigate={navigate} />}
              {!rNode && <div style={{ width: 72 }} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── League card ──────────────────────────────────────────────────────────────
function LeagueCard({ league, xp }) {
  const next = LEAGUES[Math.min(league.index + 1, LEAGUES.length - 1)]
  const pct  = league.index === LEAGUES.length - 1
    ? 100
    : Math.round(((xp - league.min) / (next.min - league.min)) * 100)

  return (
    <div className="mx-4 rounded-2xl p-4" style={{ background: '#1C1C1C', border: `1px solid ${league.color}30` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '1.4rem' }}>{league.icon}</span>
          <div>
            <p style={{ fontFamily: 'Anton, sans-serif', fontSize: '1rem', color: league.color, letterSpacing: '0.04em' }}>
              {league.name} LEAGUE
            </p>
            <p style={{ color: '#555', fontSize: '0.62rem', fontFamily: 'JetBrains Mono, monospace' }}>
              {xp.toLocaleString()} XP total
            </p>
          </div>
        </div>
        {league.index < LEAGUES.length - 1 && (
          <div className="text-right">
            <p style={{ color: '#444', fontSize: '0.58rem', fontFamily: 'Barlow Condensed, sans-serif' }}>NEXT</p>
            <p style={{ color: next.color, fontSize: '0.75rem', fontFamily: 'Anton, sans-serif' }}>{next.icon} {next.name}</p>
          </div>
        )}
      </div>
      {league.index < LEAGUES.length - 1 && (
        <>
          <div className="rounded-full overflow-hidden" style={{ background: '#2a2a2a', height: 7 }}>
            <motion.div
              style={{ height: '100%', background: `linear-gradient(90deg, ${league.color}, ${next.color})`, borderRadius: 99 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <p style={{ color: '#444', fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace', marginTop: 6 }}>
            {(next.min - xp).toLocaleString()} XP to {next.name}
          </p>
        </>
      )}
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [myRank, setMyRank]         = useState(null)
  const [questsDone, setQuestsDone] = useState([])
  const [todayXP, setTodayXP]       = useState(() => getTodayXP())
  const [confetti, setConfetti]     = useState(false)
  const [goalCelebrated, setGoalCelebrated] = useState(false)

  const xp      = profile?.xp || 0
  const streak  = profile?.streak || 0
  const league  = getLeague(xp)
  const level   = Math.floor(xp / 500) + 1
  const xpInLvl = xp % 500
  const lvlPct  = (xpInLvl / 500) * 100
  const dailyPct = Math.min(100, (todayXP / DAILY_GOAL) * 100)
  const goalDone = todayXP >= DAILY_GOAL

  // Watch for daily goal reached
  useEffect(() => {
    if (goalDone && !goalCelebrated) {
      setGoalCelebrated(true)
      setConfetti(true)
      setTimeout(() => setConfetti(false), 3000)
    }
  }, [goalDone, goalCelebrated])

  useEffect(() => {
    return subscribeToLeaderboard(data => {
      const rank = data.findIndex(u => u.id === user?.uid)
      setMyRank(rank >= 0 ? rank + 1 : null)
    })
  }, [user])

  useEffect(() => {
    if (!user) return
    getQuestProgress(user.uid).then(({ questsDone: qd }) => setQuestsDone(qd || []))
  }, [user])

  const branchShort  = profile?.branch?.split('(')[0]?.trim()?.split(' ').slice(-1)[0] || 'CSE'
  const branchColors = { CSE:'#00D4C8', AIML:'#C8F135', 'Agentic AI':'#E040FB', 'Gen AI':'#FF6B00', AIDA:'#4CAF50', AIDS:'#FF4444', Quantum:'#8B5CF6' }
  const branchColor  = branchColors[branchShort] || '#888'

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'GOOD MORNING'
    if (h < 17) return 'GOOD AFTERNOON'
    return 'GOOD EVENING'
  })()

  return (
    <div style={{ background: '#000', minHeight: '100%', paddingBottom: 100 }}>

      {/* ── Duolingo top stats strip ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: '1px solid #111' }}>

        {/* Streak */}
        <div className="flex items-center gap-1.5">
          <motion.span
            style={{ fontSize: '1.3rem', display: 'inline-block' }}
            animate={streak > 0 ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >🔥</motion.span>
          <span style={{
            fontFamily: 'Anton, sans-serif', fontSize: '1.1rem',
            color: streak > 0 ? '#FF6B00' : '#333',
          }}>{streak}</span>
        </div>

        {/* Daily goal mini bar */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <span style={{ color: '#C8F135', fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace' }}>⬡</span>
            <div className="rounded-full overflow-hidden" style={{ width: 72, height: 7, background: '#1C1C1C' }}>
              <motion.div
                style={{ height: '100%', background: goalDone ? '#00D4C8' : '#C8F135', borderRadius: 99 }}
                animate={{ width: `${dailyPct}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
          <span style={{ color: '#444', fontSize: '0.55rem', fontFamily: 'JetBrains Mono, monospace' }}>
            {todayXP}/{DAILY_GOAL} XP today
          </span>
        </div>

        {/* League */}
        <div className="flex items-center gap-1.5">
          <motion.span
            style={{ fontSize: '1.2rem' }}
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          >{league.icon}</motion.span>
          <span style={{
            fontFamily: 'Barlow Condensed, sans-serif', fontSize: '0.72rem',
            color: league.color, fontWeight: 700, letterSpacing: '0.05em',
          }}>{league.name}</span>
        </div>
      </div>

      {/* ── Greeting + avatar + goal ring ───────────────────────────────────── */}
      <div className="flex flex-col items-center pt-6 pb-4 px-4 gap-4">
        <p style={{ color: '#444', fontFamily: 'Barlow Condensed, sans-serif', fontSize: '0.72rem', letterSpacing: '0.12em' }}>
          {greeting}, {profile?.fullName?.split(' ')[0]?.toUpperCase() || 'STUDENT'}!
        </p>

        <div className="flex items-center gap-6">
          {/* Avatar with glow ring */}
          <div className="relative">
            <svg width="80" height="80" style={{ position: 'absolute', top: -4, left: -4 }}>
              <motion.circle
                cx="40" cy="40" r="36"
                fill="none"
                stroke={branchColor}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="226"
                animate={{ strokeDashoffset: [226 * 0.3, 0, 226 * 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transform: 'rotate(-90deg)', transformOrigin: '40px 40px' }}
              />
            </svg>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${branchColor}, #00D4C8)` }}
            >
              {profile?.profileImage
                ? <img src={profile.profileImage} alt="" className="w-full h-full object-cover" />
                : <span style={{ color: '#000', fontSize: '1.3rem', fontWeight: 900, fontFamily: 'Anton, sans-serif' }}>
                    {profile?.fullName?.[0]?.toUpperCase() || 'U'}
                  </span>
              }
            </div>
          </div>

          {/* Daily goal ring */}
          <GoalRing todayXP={todayXP} done={goalDone} />

          {/* Level */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: '#1C1C1C', border: '2px solid #2a2a2a' }}>
              <div className="flex flex-col items-center">
                <span style={{ color: '#555', fontSize: '0.5rem', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.06em' }}>LVL</span>
                <span style={{ fontFamily: 'Anton, sans-serif', fontSize: '1.4rem', color: '#C8F135', lineHeight: 1 }}>{level}</span>
              </div>
            </div>
            <div className="rounded-full overflow-hidden" style={{ width: 60, height: 4, background: '#1C1C1C' }}>
              <motion.div
                style={{ height: '100%', background: 'linear-gradient(90deg,#C8F135,#00D4C8)', borderRadius: 99 }}
                animate={{ width: `${lvlPct}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <span style={{ color: '#333', fontSize: '0.52rem', fontFamily: 'JetBrains Mono, monospace' }}>
              {xpInLvl}/500
            </span>
          </div>
        </div>

        {/* Goal reached banner */}
        <AnimatePresence>
          {goalDone && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="rounded-2xl px-5 py-3 flex items-center gap-3"
              style={{ background: 'rgba(0,212,200,0.1)', border: '1px solid rgba(0,212,200,0.3)' }}
            >
              <span style={{ fontSize: '1.3rem' }}>🎉</span>
              <div>
                <p style={{ color: '#00D4C8', fontFamily: 'Anton, sans-serif', fontSize: '0.85rem', letterSpacing: '0.04em' }}>
                  DAILY GOAL REACHED!
                </p>
                <p style={{ color: '#555', fontSize: '0.62rem', fontFamily: 'JetBrains Mono, monospace' }}>
                  Come back tomorrow to keep your streak
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#111', marginBottom: 8 }} />

      {/* ── Learning path ────────────────────────────────────────────────────── */}
      <LearningPath questsDone={questsDone} navigate={navigate} />

      {/* Divider */}
      <div style={{ height: 1, background: '#111', margin: '16px 0' }} />

      {/* ── League card ──────────────────────────────────────────────────────── */}
      <LeagueCard league={league} xp={xp} />

      {/* ── Rank strip ───────────────────────────────────────────────────────── */}
      <div className="mx-4 mt-3 rounded-2xl p-4 flex items-center justify-between"
        style={{ background: '#1C1C1C', border: '1px solid #2a2a2a' }}>
        <div>
          <p style={{ color: '#555', fontSize: '0.62rem', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.06em' }}>YOUR CAMPUS RANK</p>
          <p style={{ fontFamily: 'Anton, sans-serif', fontSize: '1.8rem', color: '#fff', lineHeight: 1 }}>
            {myRank ? `#${myRank}` : '--'}
          </p>
        </div>
        <motion.button
          onClick={() => navigate('/leaderboard')}
          className="rounded-xl px-4 py-2.5"
          style={{ background: '#C8F135', color: '#000', fontFamily: 'Anton, sans-serif', fontSize: '0.78rem', letterSpacing: '0.04em' }}
          whileTap={{ scale: 0.95 }}
          transition={spring.snappy}
        >
          LEADERBOARD →
        </motion.button>
      </div>

      {/* ── Quick actions ─────────────────────────────────────────────────────── */}
      <div className="px-4 mt-4">
        <p style={{ color: '#333', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', fontFamily: 'Barlow Condensed, sans-serif', marginBottom: 10 }}>
          QUICK ACCESS
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'ARENA',      emoji: '⚔️',  route: '/arena'      },
            { label: 'COMPETE',    emoji: '🏆',  route: '/compete'    },
            { label: 'FRIENDS',    emoji: '👥',  route: '/friends'    },
            { label: 'MESSAGES',   emoji: '💬',  route: '/messages'   },
            { label: 'QUESTS',     emoji: '🎯',  route: '/quests'     },
            { label: 'STORE',      emoji: '🛒',  route: '/store'      },
          ].map(item => (
            <motion.button
              key={item.label}
              onClick={() => navigate(item.route)}
              className="rounded-xl py-3 flex flex-col items-center gap-1.5"
              style={{ background: '#1C1C1C', border: '1px solid #2a2a2a' }}
              whileTap={{ scale: 0.94 }}
              transition={spring.snappy}
            >
              <span style={{ fontSize: '1.15rem' }}>{item.emoji}</span>
              <span style={{ color: '#555', fontSize: '0.58rem', fontWeight: 700, fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.06em' }}>
                {item.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Confetti ─────────────────────────────────────────────────────────── */}
      <Confetti active={confetti} />
    </div>
  )
}
