import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Search, Menu, Bot, Settings, X, Check, Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { subscribeToNotifications, markNotificationRead } from '../services/firebaseService'
import { cn } from '../lib/utils'
import { spring, slideDown } from '../lib/motion'

function useCountUp(target, duration = 1500) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setValue(target); clearInterval(timer) }
      else setValue(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return value
}

function LiveCounter() {
  const online = useCountUp(847, 1800)
  const projects = useCountUp(23, 1400)
  const duels = useCountUp(6, 1000)

  return (
    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(197,240,0,0.06)', border: '1px solid rgba(197,240,0,0.15)' }}>
      {/* Live dot */}
      <div className="relative flex items-center justify-center w-2 h-2">
        <div className="w-2 h-2 rounded-full bg-red-500" />
        <div className="absolute w-2 h-2 rounded-full bg-red-500 animate-ping opacity-75" />
      </div>
      <span className="text-xs font-semibold" style={{ color: '#f87171', fontFamily: 'JetBrains Mono, monospace' }}>LIVE</span>
      <span className="w-px h-3" style={{ background: 'rgba(197,240,0,0.25)' }} />
      <span className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
        <span style={{ color: '#67E8F9' }}>{online}</span> online
      </span>
      <span className="w-px h-3" style={{ background: 'rgba(197,240,0,0.25)' }} />
      <span className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
        <span style={{ color: '#C5F000' }}>{projects}</span> projects
      </span>
      <span className="w-px h-3" style={{ background: 'rgba(197,240,0,0.25)' }} />
      <span className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
        <span style={{ color: '#F9A8D4' }}>{duels}</span> duels
      </span>
    </div>
  )
}

export function TopNav({ onMenuClick }) {
  const { user, profile } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [showNotifs, setShowNotifs] = useState(false)
  const [notifications, setNotifications] = useState([])
  const notifRef = useRef(null)

  useEffect(() => {
    if (!user) return
    return subscribeToNotifications(user.uid, setNotifications)
  }, [user])

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unread = notifications.filter(n => !n.read).length

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search)}`)
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2.5" style={{ height: 56 }}>
      {/* Mobile menu */}
      <motion.button
        className="md:hidden p-2 rounded-lg"
        style={{ color: 'var(--text-tertiary)' }}
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
        transition={spring.snappy}
        onClick={onMenuClick}
      >
        <Menu className="w-5 h-5" />
      </motion.button>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-shrink-0 w-44">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--text-placeholder)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search..."
            className="w-full rounded-lg pl-8 pr-3 py-1.5 text-sm outline-none"
            style={{
              background: 'var(--bg-input)',
              border: `1px solid ${searchFocused ? '#C5F000' : 'var(--border)'}`,
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              boxShadow: searchFocused ? '0 0 12px rgba(197,240,0,0.15)' : 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            }}
          />
        </div>
      </form>

      {/* Live counter — center */}
      <div className="flex-1 flex justify-center">
        <LiveCounter />
      </div>

      {/* Right icons */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <motion.button
          onClick={toggleTheme}
          className="p-2 rounded-lg"
          style={{ color: 'var(--text-tertiary)' }}
          whileHover={{ scale: 1.08, color: '#C5F000' }}
          whileTap={{ scale: 0.92 }}
          transition={spring.snappy}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(197,240,0,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isDark
              ? <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <Sun className="w-4 h-4" />
                </motion.span>
              : <motion.span key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                  <Moon className="w-4 h-4" />
                </motion.span>
            }
          </AnimatePresence>
        </motion.button>

        {/* AI Buddy */}
        <motion.button
          onClick={() => navigate('/ai-buddy')}
          className="relative p-2 rounded-lg"
          style={{ color: 'var(--text-tertiary)' }}
          whileHover={{ scale: 1.08, color: '#C5F000' }}
          whileTap={{ scale: 0.92 }}
          transition={spring.snappy}
          title="AI Study Buddy"
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(197,240,0,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Bot className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-neon-green"
            style={{ boxShadow: '0 0 4px rgba(197,240,0,0.8)' }} />
        </motion.button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <motion.button
            onClick={() => setShowNotifs(v => !v)}
            className="relative p-2 rounded-lg"
            style={{ color: 'var(--text-tertiary)' }}
            whileHover={{ scale: 1.08, color: 'var(--text-primary)' }}
            whileTap={{ scale: 0.92 }}
            transition={spring.snappy}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(197,240,0,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <motion.span
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring.bouncy}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                style={{ background: '#EC4899', color: '#fff', boxShadow: '0 0 8px rgba(236,72,153,0.6)' }}
              >
                {unread > 9 ? '9+' : unread}
              </motion.span>
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                variants={slideDown}
                initial="hidden" animate="show" exit="exit"
                className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden"
                style={{ background: 'var(--bg-notif)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-xl)', zIndex: 50 }}
              >
                <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'Barlow Condensed, sans-serif' }}>
                    Notifications
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={spring.snappy}
                    onClick={() => setShowNotifs(false)}
                    className="p-1 rounded-md" style={{ color: 'var(--text-tertiary)' }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center">
                      <Check className="w-5 h-5 mx-auto mb-2" style={{ color: 'var(--neon-green)' }} />
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>All caught up</p>
                    </div>
                  ) : (
                    notifications.map((n, i) => (
                      <motion.button
                        key={n.id}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.2 }}
                        className={cn('w-full flex items-start gap-3 px-4 py-3 text-left')}
                        style={{ borderBottom: '1px solid var(--border)', background: !n.read ? 'rgba(197,240,0,0.05)' : 'transparent' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(197,240,0,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = !n.read ? 'rgba(197,240,0,0.05)' : 'transparent'}
                        onClick={() => markNotificationRead(n.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{n.message}</p>
                          <p className="mt-0.5" style={{ color: 'var(--text-tertiary)', fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace' }}>{n.time}</p>
                        </div>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                            style={{ background: '#C5F000', boxShadow: '0 0 4px rgba(197,240,0,0.8)' }} />
                        )}
                      </motion.button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings */}
        <motion.button
          onClick={() => navigate('/settings')}
          className="p-2 rounded-lg"
          style={{ color: 'var(--text-tertiary)' }}
          whileHover={{ scale: 1.08, color: 'var(--text-primary)' }}
          whileTap={{ scale: 0.92 }}
          transition={spring.snappy}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(197,240,0,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <Settings className="w-4 h-4" />
        </motion.button>

        {/* Avatar */}
        <motion.button
          onClick={() => navigate(`/profile/${profile?.uid}`)}
          className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center ml-1 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #C5F000, #00E5D0)', boxShadow: '0 0 8px rgba(197,240,0,0.4)' }}
          whileHover={{ scale: 1.12, boxShadow: '0 0 16px rgba(197,240,0,0.6)' }}
          whileTap={{ scale: 0.94 }}
          transition={spring.bouncy}
        >
          {profile?.profileImage
            ? <img src={profile.profileImage} alt="" className="w-full h-full object-cover" />
            : <span style={{ color: '#000', fontSize: '0.63rem', fontWeight: 900, fontFamily: 'Barlow Condensed, sans-serif' }}>
                {profile?.fullName?.[0]?.toUpperCase() || 'U'}
              </span>
          }
        </motion.button>
      </div>
    </div>
  )
}
