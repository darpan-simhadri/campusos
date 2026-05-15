import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Bell, Sun, Moon, X, Brain } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { subscribeToNotifications, markAllNotificationsRead, markNotificationRead } from '../../services/firebaseService'
import { spring } from '../../lib/motion'

const PAGE_TITLES = {
  '/arena':'ARENA', '/compete':'COMPETE', '/quests':'DAILY QUESTS', '/feed':'FEED',
  '/more':'MORE', '/store':'STORE', '/friends':'TEAMMATES', '/messages':'MESSAGES',
  '/dashboard':'DASHBOARD', '/skills':'SKILL DIRECTORY', '/problem-pool':'PROBLEM POOL',
  '/study-groups':'STUDY GROUPS', '/opportunities':'OPPORTUNITIES',
  '/achievements':'ACHIEVEMENTS', '/projects':'PROJECTS', '/challenges':'CHALLENGES',
  '/ai-buddy':'AI BUDDY', '/polls':'POLLS', '/lost-found':'LOST & FOUND',
  '/admin':'ADMIN', '/sos-board':'SOS BOARD', '/skill-exchange':'SKILL EXCHANGE',
  '/ideas':'IDEAS', '/build-in-public':'BUILD IN PUBLIC', '/knowledge-base':'KNOWLEDGE BASE',
  '/project-archive':'PROJECT ARCHIVE', '/campus-github':'CAMPUS GITHUB',
  '/internships':'INTERNSHIPS', '/leaderboard':'LEADERBOARD', '/events':'CAMPUS EVENTS',
}

const NOTIF_ICONS = { follow:'PERSON', message:'CHAT', achievement:'TROPHY', quest:'ZAP', default:'BELL' }

function timeAgo(ts) {
  if (!ts?.toDate) return ''
  const diff = Date.now() - ts.toDate().getTime()
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

const ICONS_EMOJI = { follow:'_FOLLOW_', message:'_MSG_', achievement:'_WIN_', quest:'_ZAP_', default:'_BELL_' }

function NotifPanel({ notifs, onClose, onMarkAll }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={spring.snappy}
      className="absolute right-0 top-full mt-2 rounded-2xl overflow-hidden"
      style={{ width: 300, background: '#111', border: '1px solid #2a2a2a', zIndex: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.7)' }}
    >
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #2a2a2a' }}>
        <span style={{ fontFamily: 'Anton, sans-serif', color: '#fff', fontSize: '0.9rem', letterSpacing: '0.04em' }}>NOTIFICATIONS</span>
        <div className="flex items-center gap-3">
          {notifs.some(n => !n.read) && (
            <button onClick={onMarkAll} style={{ color: '#C8F135', fontSize: '0.65rem', fontWeight: 700, fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.04em' }}>
              MARK ALL READ
            </button>
          )}
          <button onClick={onClose} style={{ color: '#555' }}><X className="w-4 h-4" /></button>
        </div>
      </div>
      <div style={{ maxHeight: 340, overflowY: 'auto' }}>
        {notifs.length === 0
          ? <div className="py-10 text-center"><p style={{ fontSize: '1.5rem' }}>🔔</p><p style={{ color: '#555', fontSize: '0.78rem', marginTop: 6 }}>No notifications yet</p></div>
          : notifs.map(n => (
            <div
              key={n.id}
              className="flex items-start gap-3 px-4 py-3 cursor-pointer"
              style={{ borderBottom: '1px solid #1a1a1a', background: n.read ? 'transparent' : 'rgba(200,241,53,0.04)' }}
              onClick={() => markNotificationRead(n.id)}
            >
              <div className="flex-1 min-w-0">
                <p style={{ color: '#ccc', fontSize: '0.78rem', lineHeight: 1.4 }}>{n.message}</p>
                <p style={{ color: '#555', fontSize: '0.62rem', marginTop: 2, fontFamily: 'JetBrains Mono, monospace' }}>{timeAgo(n.createdAt)}</p>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: '#C8F135' }} />}
            </div>
          ))
        }
      </div>
    </motion.div>
  )
}

export function TopBar() {
  const { profile, user } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [notifs, setNotifs]         = useState([])
  const [showNotifs, setShowNotifs] = useState(false)
  const panelRef = useRef(null)

  const pies   = profile?.pies   ?? 0
  const streak = profile?.streak ?? 0
  const xp     = profile?.xp     ?? 0
  const unread = notifs.filter(n => !n.read).length
  const pageTitle = PAGE_TITLES[location.pathname] || ''

  useEffect(() => {
    if (!user) return
    return subscribeToNotifications(user.uid, setNotifs)
  }, [user])

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setShowNotifs(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="flex items-center justify-between px-4 gap-3" style={{ height: 56 }}>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: 'var(--bg-secondary)', border: '1.5px solid #C8F135' }}>
          <span style={{ color: '#C8F135', fontSize: '0.82rem', fontWeight: 900, fontFamily: 'Anton, sans-serif' }}>π</span>
          <span style={{ color: 'var(--text-primary)', fontSize: '0.78rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{pies}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: 'var(--bg-secondary)' }}>
          <span style={{ fontSize: '0.82rem' }}>🔥</span>
          <span style={{ color: 'var(--text-primary)', fontSize: '0.78rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{streak}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: 'var(--bg-secondary)' }}>
          <span style={{ color: '#FFD700', fontSize: '0.82rem' }}>⬡</span>
          <span style={{ color: 'var(--text-primary)', fontSize: '0.78rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{xp} XP</span>
        </div>
      </div>

      {pageTitle && (
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <span style={{ fontFamily: 'Anton, sans-serif', fontSize: '1.1rem', color: '#fff', letterSpacing: '0.06em' }}>{pageTitle}</span>
        </div>
      )}
      {!pageTitle && <div className="hidden lg:flex flex-1" />}

      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* AI Study Buddy */}
        <motion.button
          onClick={() => navigate('/ai-buddy')}
          className="flex items-center justify-center rounded-xl"
          style={{ background: 'var(--bg-secondary)', width: 36, height: 36 }}
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} transition={spring.snappy}
          title="AI Study Buddy"
        >
          <Brain style={{ color: '#C8F135', width: 16, height: 16 }} />
        </motion.button>

        {/* Dark / Light toggle */}
        <motion.button
          onClick={toggleTheme}
          className="flex items-center justify-center rounded-xl"
          style={{ background: 'var(--bg-secondary)', width: 36, height: 36 }}
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} transition={spring.snappy}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark
            ? <Sun  style={{ color: '#FFD700', width: 16, height: 16 }} />
            : <Moon style={{ color: '#8B5CF6', width: 16, height: 16 }} />}
        </motion.button>

        {/* Notifications */}
        <div className="relative" ref={panelRef}>
          <motion.button
            onClick={() => setShowNotifs(v => !v)}
            className="flex items-center justify-center rounded-xl relative"
            style={{ background: 'var(--bg-secondary)', width: 36, height: 36 }}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} transition={spring.snappy}
          >
            <Bell style={{ color: 'var(--text-primary)', width: 17, height: 17 }} />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center rounded-full font-bold"
                style={{ background: '#EF4444', color: '#fff', fontSize: '0.5rem', minWidth: 16, height: 16, padding: '0 3px' }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </motion.button>
          <AnimatePresence>
            {showNotifs && <NotifPanel notifs={notifs} onClose={() => setShowNotifs(false)} onMarkAll={() => user && markAllNotificationsRead(user.uid)} />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}