import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Users, HelpCircle, BookOpen, MessageSquare, Briefcase, Trophy,
  Code2, Bot, BarChart2, Shield, AlertCircle, ArrowRightLeft,
  Lightbulb, Rocket, Archive, Github, BookMarked, Building2,
  ShoppingBag, UserCheck, Settings, LogOut, Search, Calendar, Crown,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { spring, staggerContainer, staggerItem } from '../lib/motion'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

const FEATURE_SECTIONS = [
  {
    title: 'CONNECT',
    items: [
      { label: 'Messages',      icon: MessageSquare, path: '/messages',    color: '#00D4C8' },
      { label: 'Study Groups',  icon: BookOpen,      path: '/study-groups', color: '#4CAF50' },
      { label: 'SOS Board',     icon: AlertCircle,   path: '/sos-board',   color: '#FF4444' },
      { label: 'Skill Exchange',icon: ArrowRightLeft,path: '/skill-exchange', color: '#E040FB' },
      { label: 'Teammates',     icon: UserCheck,     path: '/friends',     color: '#00D4C8' },
    ],
  },
  {
    title: 'BUILD',
    items: [
      { label: 'Projects',      icon: Rocket,      path: '/projects',         color: '#C8F135' },
      { label: 'Build Public',  icon: Code2,       path: '/build-in-public',  color: '#FF6B00' },
      { label: 'Campus GitHub', icon: Github,      path: '/campus-github',    color: '#fff'    },
      { label: 'Idea Validate', icon: Lightbulb,   path: '/ideas',            color: '#FFD700' },
      { label: 'Archive',       icon: Archive,     path: '/project-archive',  color: '#888'    },
    ],
  },
  {
    title: 'LEARN',
    items: [
      { label: 'Challenges',    icon: Trophy,      path: '/challenges',       color: '#FFD700' },
      { label: 'Knowledge',     icon: BookMarked,  path: '/knowledge-base',   color: '#4CAF50' },
      { label: 'AI Buddy',      icon: Bot,         path: '/ai-buddy',         color: '#C8F135' },
      { label: 'Skills Dir',    icon: Search,      path: '/skills',           color: '#00D4C8' },
      { label: 'Problem Pool',  icon: HelpCircle,  path: '/problem-pool',     color: '#E040FB' },
    ],
  },
  {
    title: 'CAMPUS',
    items: [
      { label: 'Leaderboard',   icon: Crown,       path: '/leaderboard',      color: '#FFD700' },
      { label: 'Events',        icon: Calendar,    path: '/events',           color: '#C8F135' },
      { label: 'Opportunities', icon: Briefcase,   path: '/opportunities',    color: '#FF6B00' },
      { label: 'Achievements',  icon: Trophy,      path: '/achievements',     color: '#E040FB' },
      { label: 'Internships',   icon: Building2,   path: '/internships',      color: '#00D4C8' },
      { label: 'Polls',         icon: BarChart2,   path: '/polls',            color: '#4CAF50' },
      { label: 'Lost & Found',  icon: Search,      path: '/lost-found',       color: '#888'    },
    ],
  },
]

function FeatureButton({ item, onNavigate }) {
  const { icon: Icon, label, path, color } = item
  return (
    <motion.button
      onClick={() => onNavigate(path)}
      className="flex flex-col items-center gap-2 p-3 rounded-2xl"
      style={{ background: 'var(--bg-card)', border: '1px solid #2a2a2a' }}
      whileTap={{ scale: 0.92 }}
      transition={spring.snappy}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${color}15` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.62rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.3, fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
        {label}
      </span>
    </motion.button>
  )
}

export default function More() {
  const navigate = useNavigate()
  const { profile, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div style={{ background: 'var(--bg-app)', minHeight: '100%' }}>
      {/* Profile strip */}
      <motion.button
        onClick={() => navigate(`/profile/${profile?.uid}`)}
        className="flex items-center gap-3 w-full px-4 py-4"
        style={{ borderBottom: '1px solid var(--border)' }}
        whileTap={{ scale: 0.99 }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #C8F135, #00D4C8)' }}
        >
          {profile?.profileImage
            ? <img src={profile.profileImage} alt="" className="w-full h-full object-cover rounded-full" />
            : <span style={{ color: '#000', fontSize: '1rem', fontWeight: 900, fontFamily: 'Anton, sans-serif' }}>
                {profile?.fullName?.[0]?.toUpperCase() || 'U'}
              </span>
          }
        </div>
        <div className="flex-1 text-left">
          <p style={{ color: 'var(--text-primary)', fontFamily: 'Anton, sans-serif', fontSize: '1rem', letterSpacing: '0.03em' }}>
            {profile?.fullName?.toUpperCase() || 'USER'}
          </p>
          <p style={{ color: '#666', fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace' }}>
            {profile?.branch || 'CSE'} · VIEW PROFILE ›
          </p>
        </div>
      </motion.button>

      {/* Quick actions row */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <motion.button
          onClick={() => navigate('/store')}
          className="flex items-center gap-2 flex-1 rounded-xl px-3 py-2.5"
          style={{ background: 'var(--bg-card)', border: '1px solid #2a2a2a' }}
          whileTap={{ scale: 0.96 }}
          transition={spring.snappy}
        >
          <ShoppingBag className="w-4 h-4" style={{ color: '#C8F135' }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontFamily: 'Anton, sans-serif', letterSpacing: '0.04em' }}>STORE</span>
        </motion.button>
        <motion.button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 flex-1 rounded-xl px-3 py-2.5"
          style={{ background: 'var(--bg-card)', border: '1px solid #2a2a2a' }}
          whileTap={{ scale: 0.96 }}
          transition={spring.snappy}
        >
          <Shield className="w-4 h-4" style={{ color: '#E040FB' }} />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontFamily: 'Anton, sans-serif', letterSpacing: '0.04em' }}>ADMIN</span>
        </motion.button>
        <motion.button
          onClick={toggleTheme}
          className="flex items-center gap-2 flex-1 rounded-xl px-3 py-2.5"
          style={{ background: 'var(--bg-card)', border: '1px solid #2a2a2a' }}
          whileTap={{ scale: 0.96 }}
          transition={spring.snappy}
        >
          {isDark
            ? <Sun  className="w-4 h-4" style={{ color: '#FFD700' }} />
            : <Moon className="w-4 h-4" style={{ color: '#8B5CF6' }} />
          }
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontFamily: 'Anton, sans-serif', letterSpacing: '0.04em' }}>
            {isDark ? 'LIGHT' : 'DARK'}
          </span>
        </motion.button>
      </div>

      {/* Feature sections */}
      <motion.div
        className="px-4 pb-4"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {FEATURE_SECTIONS.map(section => (
          <motion.div key={section.title} variants={staggerItem} className="mt-5">
            <p style={{ color: '#555', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', marginBottom: 10, fontFamily: 'Barlow Condensed, sans-serif' }}>
              {section.title}
            </p>
            <div className="grid grid-cols-5 gap-2">
              {section.items.map(item => (
                <FeatureButton key={item.path} item={item} onNavigate={navigate} />
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Sign out */}
      <div className="px-4 pb-8 mt-2">
        <motion.button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-4"
          style={{ background: 'var(--bg-card)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontFamily: 'Anton, sans-serif', letterSpacing: '0.06em', fontSize: '0.9rem' }}
          whileTap={{ scale: 0.98 }}
          transition={spring.snappy}
        >
          <LogOut className="w-4 h-4" />
          SIGN OUT
        </motion.button>
      </div>
    </div>
  )
}
