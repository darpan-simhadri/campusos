import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Search, Menu, Bot, Settings, X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { subscribeToNotifications, markNotificationRead } from '../services/firebaseService'

export function TopNav({ onMenuClick }) {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [showNotifs, setShowNotifs] = useState(false)
  const [notifications, setNotifications] = useState([])
  const notifRef = useRef(null)

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToNotifications(user.uid, setNotifications)
    return unsub
  }, [user])

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false)
      }
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
    <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800 px-4 py-3 flex items-center gap-3">
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-lg hover:bg-gray-800 text-gray-400"
      >
        <Menu className="w-5 h-5" />
      </button>

      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students, projects, skills..."
            className="w-full bg-gray-800/60 border border-gray-700/50 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
          />
        </div>
      </form>

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={() => navigate('/ai-buddy')}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-indigo-400 transition-colors relative group"
          title="AI Study Buddy"
        >
          <Bot className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse-slow" />
        </button>

        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                  <span className="font-semibold text-sm text-white">Notifications</span>
                  <button onClick={() => setShowNotifs(false)} className="text-gray-500 hover:text-gray-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-800">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-gray-500 text-sm">All caught up!</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-800/50 transition-colors ${!n.read ? 'bg-indigo-900/10' : ''}`}
                        onClick={() => markNotificationRead(n.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-200">{n.message}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{n.time}</p>
                        </div>
                        {!n.read && <span className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => navigate('/settings')}
          className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>

        <button
          onClick={() => navigate(`/profile/${profile?.uid}`)}
          className="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all"
        >
          {profile?.profileImage ? (
            <img src={profile.profileImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-indigo-400 font-medium text-sm">
              {profile?.fullName?.[0]?.toUpperCase() || 'U'}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
