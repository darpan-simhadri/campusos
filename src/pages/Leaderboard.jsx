import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Trophy, Zap, Crown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { subscribeToLeaderboard } from '../services/firebaseService'
import { staggerContainer, staggerItem, spring } from '../lib/motion'

const specColors = {
  'CSE': '#00D4C8', 'AIML': '#C8F135', 'Agentic AI': '#E040FB',
  'Gen AI': '#FF6B00', 'AIDA': '#4CAF50', 'AIDS': '#FF4444', 'Quantum': '#8B5CF6',
}

const RANK_STYLES = {
  1: { bg: 'linear-gradient(135deg, #FFD700, #FF8C00)', color: '#000', icon: '👑' },
  2: { bg: 'linear-gradient(135deg, #C0C0C0, #888)', color: '#000', icon: '🥈' },
  3: { bg: 'linear-gradient(135deg, #CD7F32, #8B4513)', color: '#fff', icon: '🥉' },
}

function TopThree({ users }) {
  if (users.length < 1) return null
  const [second, first, third] = [users[1], users[0], users[2]]
  const cards = [second, first, third].filter(Boolean)
  const heights = second ? ['h-24', 'h-32', 'h-20'] : ['h-32']

  return (
    <div className="flex items-end justify-center gap-3 px-4 pt-4 pb-6">
      {cards.map((u, i) => {
        const rank = u?.rank
        const style = RANK_STYLES[rank] || {}
        const h = heights[i]
        const branchShort = u?.branch?.split('(')[0]?.trim()?.split(' ').slice(-1)[0] || 'CSE'
        return (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, ...spring.smooth }}
            className="flex flex-col items-center gap-1 flex-1"
          >
            {/* Crown for #1 */}
            {rank === 1 && <Crown className="w-5 h-5 mb-1" style={{ color: '#FFD700' }} />}
            {/* Avatar */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold overflow-hidden"
              style={{ background: style.bg || 'linear-gradient(135deg, #C8F135, #00D4C8)' }}
            >
              {u.profileImage
                ? <img src={u.profileImage} alt="" className="w-full h-full object-cover" />
                : <span style={{ color: style.color || '#000', fontSize: '1rem', fontFamily: 'Anton, sans-serif' }}>
                    {u.fullName?.[0]?.toUpperCase() || 'U'}
                  </span>
              }
            </div>
            {/* Rank badge */}
            <span style={{ fontSize: '1.1rem' }}>{style.icon}</span>
            {/* Name */}
            <p style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700, fontFamily: 'Barlow Condensed, sans-serif', textAlign: 'center', letterSpacing: '0.02em' }}>
              {u.fullName?.split(' ')[0]?.toUpperCase() || 'USER'}
            </p>
            {/* XP */}
            <p style={{ color: '#C8F135', fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
              {u.xp || 0} XP
            </p>
            {/* Podium */}
            <div
              className={`w-full ${h} rounded-t-xl`}
              style={{ background: rank === 1 ? 'rgba(200,241,53,0.15)' : '#1C1C1C', border: rank === 1 ? '1px solid rgba(200,241,53,0.3)' : '1px solid #2a2a2a', marginTop: 4 }}
            >
              <p className="text-center pt-2" style={{ color: '#555', fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace' }}>
                #{rank}
              </p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

const DUMMY_LEADERS = [
  { id: 'l1', fullName: 'Karthik R',  branch: 'CSE',        xp: 2840, streak: 14, rank: 1 },
  { id: 'l2', fullName: 'Ananya B',   branch: 'AIML',       xp: 2610, streak: 11, rank: 2 },
  { id: 'l3', fullName: 'Arjun M',    branch: 'AIML',       xp: 2390, streak: 9,  rank: 3 },
  { id: 'l4', fullName: 'Divya L',    branch: 'AIDS',       xp: 1980, streak: 7,  rank: 4 },
  { id: 'l5', fullName: 'Priya K',    branch: 'Gen AI',     xp: 1740, streak: 5,  rank: 5 },
  { id: 'l6', fullName: 'Vijay P',    branch: 'Agentic AI', xp: 1520, streak: 8,  rank: 6 },
  { id: 'l7', fullName: 'Neha S',     branch: 'AIDA',       xp: 1310, streak: 3,  rank: 7 },
  { id: 'l8', fullName: 'Rahul T',    branch: 'Quantum',    xp: 980,  streak: 2,  rank: 8 },
]

export default function Leaderboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [realUsers, setRealUsers] = useState([])
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState('xp')

  useEffect(() => {
    const unsub = subscribeToLeaderboard(data => {
      setRealUsers(data)
      setLoading(false)
    })
    return unsub
  }, [])

  const users  = realUsers.length >= 3 ? realUsers : DUMMY_LEADERS
  const myRank = users.findIndex(u => u.id === user?.uid) + 1

  return (
    <div style={{ background: '#000000', minHeight: '100%' }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-2 flex items-center justify-between">
        <h1 style={{ fontFamily: 'Anton, sans-serif', fontSize: '1.6rem', color: '#fff', letterSpacing: '0.03em' }}>
          LEADERBOARD
        </h1>
        {myRank > 0 && (
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: '#1C1C1C', border: '1px solid rgba(200,241,53,0.25)' }}>
            <span style={{ color: '#888', fontSize: '0.65rem', fontFamily: 'Barlow Condensed, sans-serif' }}>YOUR RANK</span>
            <span style={{ color: '#C8F135', fontSize: '0.78rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>#{myRank}</span>
          </div>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 px-4 mb-2">
        {[{ id: 'xp', label: '⬡ XP RANKING' }, { id: 'streak', label: '🔥 STREAK' }].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="rounded-full px-4 py-1.5 font-bold"
            style={{
              background: tab === t.id ? '#C8F135' : '#1C1C1C',
              color: tab === t.id ? '#000' : '#666',
              fontFamily: 'Anton, sans-serif', fontSize: '0.7rem', letterSpacing: '0.04em',
              border: `1px solid ${tab === t.id ? '#C8F135' : '#2a2a2a'}`,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="px-4 space-y-2 mt-4">
          {[1,2,3,4,5].map(i => <div key={i} className="rounded-2xl h-16 animate-pulse" style={{ background: '#1C1C1C' }} />)}
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          <TopThree users={users.slice(0, 3)} />

          {/* Rest of the list */}
          <motion.div
            className="px-4 space-y-2 pb-6"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {users.slice(3).map((u, i) => {
              const isMe = u.id === user?.uid
              const branchShort = u.branch?.split('(')[0]?.trim()?.split(' ').slice(-1)[0] || 'CSE'
              const color = specColors[branchShort] || '#888'
              return (
                <motion.div
                  key={u.id}
                  variants={staggerItem}
                  onClick={() => navigate(`/profile/${u.id}`)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 cursor-pointer"
                  style={{
                    background: isMe ? 'rgba(200,241,53,0.06)' : '#1C1C1C',
                    border: `1px solid ${isMe ? '#C8F135' : '#2a2a2a'}`,
                  }}
                >
                  {/* Rank */}
                  <span style={{ color: '#555', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', minWidth: 24 }}>
                    #{u.rank}
                  </span>

                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${color}, #00D4C8)` }}
                  >
                    {u.profileImage
                      ? <img src={u.profileImage} alt="" className="w-full h-full object-cover" />
                      : <span style={{ color: '#000', fontSize: '0.75rem', fontWeight: 900, fontFamily: 'Anton, sans-serif' }}>
                          {u.fullName?.[0]?.toUpperCase() || 'U'}
                        </span>
                    }
                  </div>

                  {/* Name + branch */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p style={{ color: isMe ? '#C8F135' : '#fff', fontSize: '0.82rem', fontWeight: 700, fontFamily: 'Barlow Condensed, sans-serif' }}>
                        {u.fullName || 'User'} {isMe && '(YOU)'}
                      </p>
                    </div>
                    <span
                      className="rounded-full px-1.5 py-0.5 inline-block"
                      style={{ background: `${color}22`, color, fontSize: '0.55rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      {branchShort}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="text-right flex-shrink-0">
                    <p style={{ color: '#C8F135', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                      {tab === 'xp' ? `${u.xp || 0} XP` : `${u.streak || 0}🔥`}
                    </p>
                    <p style={{ color: '#555', fontSize: '0.6rem', fontFamily: 'JetBrains Mono, monospace' }}>
                      Lv. {u.level || 1}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </>
      )}
    </div>
  )
}
