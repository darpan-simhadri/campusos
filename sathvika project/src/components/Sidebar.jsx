import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, HelpCircle, BookOpen, MessageSquare,
  Briefcase, Trophy, Code2, Zap, Bot, BarChart2, Search,
  Shield, LogOut, X, ChevronRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const ICONS = {
  LayoutDashboard, Users, HelpCircle, BookOpen, MessageSquare,
  Briefcase, Trophy, Code2, Zap, Bot, BarChart2, Search, Shield,
}

const NAV = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/skills', label: 'Skill Directory', icon: 'Users' },
  { path: '/problem-pool', label: 'Problem Pool', icon: 'HelpCircle' },
  { path: '/study-groups', label: 'Study Groups', icon: 'BookOpen' },
  { path: '/messages', label: 'Messages', icon: 'MessageSquare' },
  { path: '/opportunities', label: 'Opportunities', icon: 'Briefcase' },
  { path: '/achievements', label: 'Achievement Wall', icon: 'Trophy' },
  { path: '/projects', label: 'Project Showcase', icon: 'Code2' },
  { path: '/challenges', label: 'Challenges', icon: 'Zap' },
  { path: '/ai-buddy', label: 'AI Study Buddy', icon: 'Bot' },
  { path: '/polls', label: 'Polls', icon: 'BarChart2' },
  { path: '/lost-found', label: 'Lost & Found', icon: 'Search' },
]

export function Sidebar({ mobile, onClose }) {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const content = (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-bold text-white text-lg">CampusOS</span>
        </div>
        {mobile && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-4">
        {NAV.map(({ path, label, icon }) => {
          const Icon = ICONS[icon]
          return (
            <NavLink
              key={path}
              to={path}
              onClick={mobile ? onClose : undefined}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          )
        })}

        {profile?.role === 'admin' && (
          <NavLink
            to="/admin"
            onClick={mobile ? onClose : undefined}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Shield className="w-4 h-4 flex-shrink-0" />
            <span>Admin Panel</span>
          </NavLink>
        )}
      </nav>

      <div className="border-t border-gray-800 p-3">
        <NavLink
          to={`/profile/${profile?.uid}`}
          onClick={mobile ? onClose : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-600/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {profile?.profileImage ? (
              <img src={profile.profileImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-indigo-400 font-medium text-sm">
                {profile?.fullName?.[0]?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">{profile?.fullName}</p>
            <p className="text-xs text-gray-500 truncate">{profile?.branch}</p>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 transition-colors" />
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-all text-sm mt-1"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )

  if (mobile) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-40 flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-64 bg-gray-900 border-r border-gray-800 h-full"
          >
            {content}
          </motion.div>
        </div>
      </AnimatePresence>
    )
  }

  return (
    <div className="w-60 bg-gray-900 border-r border-gray-800 h-screen flex-shrink-0 sticky top-0">
      {content}
    </div>
  )
}
