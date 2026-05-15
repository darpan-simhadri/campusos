import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, UserPlus, UserCheck, MessageSquare, Users, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getAllUsers, followUser, unfollowUser } from '../services/firebaseService'
import { autoCompleteQuest } from '../lib/autoQuest'
import { staggerContainer, staggerItem, spring } from '../lib/motion'

const specColors = {
  'CSE': '#00D4C8', 'AIML': '#C8F135', 'Agentic AI': '#E040FB',
  'Gen AI': '#FF6B00', 'AIDA': '#4CAF50', 'AIDS': '#FF4444', 'Quantum': '#8B5CF6',
}

function UserCard({ person, myUid, isFollowing, onToggleFollow, onMessage }) {
  const [loading, setLoading] = useState(false)

  const handleFollow = async () => {
    setLoading(true)
    await onToggleFollow(person.id, isFollowing)
    setLoading(false)
  }

  const branchShort = person.branch?.split('(')[0]?.trim()?.split(' ').slice(-1)[0] || person.branch || 'CSE'
  const color = specColors[branchShort] || '#888'

  return (
    <motion.div layout variants={staggerItem} className="rounded-2xl p-4" style={{ background: '#1C1C1C', border: '1px solid #2a2a2a' }}>
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${color}, #00D4C8)` }}
        >
          {person.profileImage
            ? <img src={person.profileImage} alt="" className="w-full h-full object-cover" />
            : <span style={{ color: '#000', fontSize: '0.85rem', fontWeight: 900, fontFamily: 'Anton, sans-serif' }}>
                {person.fullName?.[0]?.toUpperCase() || 'U'}
              </span>
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.02em' }}>
              {person.fullName}
            </span>
            {person.isOnline && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#4CAF50' }} />}
          </div>
          <span
            className="rounded-full px-1.5 py-0.5 inline-block mt-0.5"
            style={{ background: `${color}22`, color, fontSize: '0.58rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}
          >
            {branchShort}
          </span>
          {person.skills?.length > 0 && (
            <p style={{ color: '#555', fontSize: '0.68rem', marginTop: 2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {person.skills.slice(0, 3).join(' · ')}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <motion.button
            onClick={() => onMessage(person.id)}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: '#2a2a2a' }}
            whileTap={{ scale: 0.92 }}
            transition={spring.snappy}
          >
            <MessageSquare className="w-3.5 h-3.5" style={{ color: '#888' }} />
          </motion.button>

          <motion.button
            onClick={handleFollow}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
            style={{
              background: isFollowing ? 'rgba(200,241,53,0.08)' : '#C8F135',
              border: `1px solid ${isFollowing ? '#C8F135' : 'transparent'}`,
              color: isFollowing ? '#C8F135' : '#000',
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 700,
              fontSize: '0.72rem',
              letterSpacing: '0.04em',
            }}
            whileTap={{ scale: 0.95 }}
            transition={spring.snappy}
          >
            {loading
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : isFollowing
                ? <><UserCheck className="w-3 h-3" />&nbsp;FOLLOWING</>
                : <><UserPlus className="w-3 h-3" />&nbsp;FOLLOW</>
            }
          </motion.button>
        </div>
      </div>

      {person.bio && (
        <p style={{ color: '#666', fontSize: '0.72rem', lineHeight: 1.5, marginTop: 10, paddingTop: 10, borderTop: '1px solid #2a2a2a' }}>
          {person.bio}
        </p>
      )}
    </motion.div>
  )
}

const DUMMY_USERS = [
  { id: 'du1', fullName: 'Arjun M',   branch: 'AIML',       xp: 920,  bio: 'Building AI agents for fun. Loves RAG pipelines.', isOnline: true  },
  { id: 'du2', fullName: 'Priya K',   branch: 'Gen AI',     xp: 780,  bio: 'Prompt engineer by day, researcher by night.',      isOnline: true  },
  { id: 'du3', fullName: 'Karthik R', branch: 'CSE',        xp: 1100, bio: 'DSA nerd. LeetCode streak: 45 days.',               isOnline: false },
  { id: 'du4', fullName: 'Neha S',    branch: 'AIDA',       xp: 650,  bio: 'Data tells stories. I just translate them.',        isOnline: true  },
  { id: 'du5', fullName: 'Vijay P',   branch: 'Agentic AI', xp: 560,  bio: 'Multiagent systems enthusiast. Crewai fan.',        isOnline: false },
  { id: 'du6', fullName: 'Divya L',   branch: 'AIDS',       xp: 870,  bio: 'Full stack + ML. Ship fast, learn faster.',         isOnline: true  },
  { id: 'du7', fullName: 'Rahul T',   branch: 'Quantum',    xp: 430,  bio: 'Quantum computing will change everything.',         isOnline: false },
  { id: 'du8', fullName: 'Ananya B',  branch: 'AIML',       xp: 990,  bio: 'NLP and computer vision. Building cool stuff.',     isOnline: true  },
]

export default function Friends() {
  const { user, profile, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [realUsers, setRealUsers] = useState([])
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState('ALL')
  const [loading, setLoading]     = useState(true)
  const [following, setFollowing] = useState([])

  useEffect(() => { setFollowing(profile?.following || []) }, [profile])

  useEffect(() => {
    getAllUsers().then(all => {
      setRealUsers(all.filter(u => u.id !== user?.uid && !u.suspended))
      setLoading(false)
    })
  }, [user])

  const users = realUsers.length >= 3
    ? realUsers
    : [...realUsers, ...DUMMY_USERS.filter(d => !realUsers.find(r => r.id === d.id) && d.id !== user?.uid)]

  const handleToggleFollow = async (theirId, isCurrentlyFollowing) => {
    if (isCurrentlyFollowing) {
      await unfollowUser(user.uid, theirId)
      const updated = following.filter(id => id !== theirId)
      setFollowing(updated)
      updateProfile({ following: updated })
    } else {
      await followUser(user.uid, theirId)
      const updated = [...following, theirId]
      setFollowing(updated)
      updateProfile({ following: updated })
      autoCompleteQuest(user.uid, 'collab', updateProfile)
    }
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchesSearch = !q ||
      u.fullName?.toLowerCase().includes(q) ||
      u.skills?.some(s => s.toLowerCase().includes(q)) ||
      u.branch?.toLowerCase().includes(q)
    if (filter === 'FOLLOWING') return matchesSearch && following.includes(u.id)
    if (filter === 'ONLINE')    return matchesSearch && u.isOnline
    return matchesSearch
  })

  return (
    <div style={{ background: '#000000', minHeight: '100%' }}>
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 style={{ fontFamily: 'Anton, sans-serif', fontSize: '1.6rem', color: '#fff', letterSpacing: '0.03em' }}>
            TEAMMATES
          </h1>
          <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: '#1C1C1C' }}>
            <Users className="w-3.5 h-3.5" style={{ color: '#C8F135' }} />
            <span style={{ color: '#fff', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
              {users.length} students
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 mb-3" style={{ background: '#1C1C1C', border: '1px solid #2a2a2a' }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#555' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, skill, or branch..."
            className="flex-1 bg-transparent outline-none"
            style={{ color: '#fff', fontSize: '0.85rem' }}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {['ALL', 'FOLLOWING', 'ONLINE'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="rounded-full px-4 py-1.5 flex-shrink-0 font-bold"
              style={{
                background: filter === f ? '#C8F135' : '#1C1C1C',
                color: filter === f ? '#000' : '#666',
                fontFamily: 'Anton, sans-serif',
                fontSize: '0.7rem',
                letterSpacing: '0.06em',
                border: `1px solid ${filter === f ? '#C8F135' : '#2a2a2a'}`,
              }}
            >
              {f}{f === 'FOLLOWING' && following.length > 0 ? ` (${following.length})` : ''}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="px-4 space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="rounded-2xl h-24 animate-pulse" style={{ background: '#1C1C1C' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <p style={{ fontSize: '2rem', marginBottom: 8 }}>🤝</p>
          <p style={{ color: '#888', fontFamily: 'Barlow Condensed, sans-serif', fontSize: '0.9rem' }}>
            {filter === 'FOLLOWING' ? "You haven't followed anyone yet." : 'No users found.'}
          </p>
        </div>
      ) : (
        <motion.div className="px-4 pb-6 space-y-3" variants={staggerContainer} initial="hidden" animate="show">
          {filtered.map(person => (
            <UserCard
              key={person.id}
              person={person}
              myUid={user?.uid}
              isFollowing={following.includes(person.id)}
              onToggleFollow={handleToggleFollow}
              onMessage={(uid) => navigate(`/messages?userId=${uid}`)}
            />
          ))}
        </motion.div>
      )}
    </div>
  )
}
