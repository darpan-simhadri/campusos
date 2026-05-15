import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Swords, Trophy, ClipboardList, Activity, LayoutGrid,
  MessageSquare, BookOpen, Bot, Code2, HelpCircle,
  Briefcase, LogOut, ShoppingBag, Users, Crown, Calendar,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { spring } from '../../lib/motion'

const MAIN_NAV = [
  { path: '/arena',   label: 'ARENA',   Icon: Swords        },
  { path: '/compete', label: 'COMPETE', Icon: Trophy        },
  { path: '/quests',  label: 'QUESTS',  Icon: ClipboardList },
  { path: '/feed',    label: 'FEED',    Icon: Activity      },
]

const QUICK_LINKS = [
  { path: '/messages',       label: 'Messages',     Icon: MessageSquare, color: '#00D4C8' },
  { path: '/leaderboard',    label: 'Leaderboard',  Icon: Crown,         color: '#FFD700' },
  { path: '/events',         label: 'Events',       Icon: Calendar,      color: '#C8F135' },
  { path: '/study-groups',   label: 'Study Groups', Icon: BookOpen,      color: '#4CAF50' },
  { path: '/ai-buddy',       label: 'AI Buddy',     Icon: Bot,           color: '#C8F135' },
  { path: '/build-in-public',label: 'Build Public', Icon: Code2,         color: '#FF6B00' },
  { path: '/problem-pool',   label: 'Problem Pool', Icon: HelpCircle,    color: '#E040FB' },
  { path: '/opportunities',  label: 'Opportunities',Icon: Briefcase,     color: '#FF6B00' },
  { path: '/skills',         label: 'Skill Dir',    Icon: Users,         color: '#00D4C8' },
  { path: '/store',          label: 'Store',        Icon: ShoppingBag,   color: '#C8F135' },
]

function SideNavLink({ path, label, Icon, color }) {
  return (
    <NavLink to={path}>
      {({ isActive }) => (
        <motion.div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer"
          style={{
            background: isActive ? 'rgba(200,241,53,0.1)' : 'transparent',
            color: isActive ? '#C8F135' : '#888',
          }}
          whileHover={{ background: 'rgba(255,255,255,0.05)', color: '#ccc' }}
          whileTap={{ scale: 0.98 }}
          transition={spring.snappy}
        >
          <Icon
            className="w-4.5 h-4.5 flex-shrink-0"
            style={{ color: isActive ? '#C8F135' : (color || '#666'), width: 18, height: 18 }}
            strokeWidth={isActive ? 2.5 : 1.8}
          />
          <span
            style={{
              fontFamily: isActive ? 'Anton, sans-serif' : 'Barlow, sans-serif',
              fontSize: '0.82rem',
              fontWeight: isActive ? 700 : 500,
              letterSpacing: isActive ? '0.04em' : '0.01em',
              color: isActive ? '#C8F135' : '#888',
            }}
          >
            {label}
          </span>
          {isActive && (
            <motion.div
              layoutId="sidebarActive"
              className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: '#C8F135', boxShadow: '0 0 6px rgba(200,241,53,0.8)' }}
              transition={spring.snappy}
            />
          )}
        </motion.div>
      )}
    </NavLink>
  )
}

export function DesktopSidebar() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const pies   = profile?.pies   ?? 0
  const streak = profile?.streak ?? 0
  const xp     = profile?.xp     ?? 0

  return (
    <div className="flex flex-col h-full" style={{ padding: '0 8px' }}>
      {/* Logo */}
      <div className="px-3 py-5 flex-shrink-0">
        <motion.button
          className="flex items-center gap-2.5"
          onClick={() => navigate('/arena')}
          whileHover={{ scale: 1.02 }}
          transition={spring.snappy}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#C8F135', boxShadow: '0 0 12px rgba(200,241,53,0.4)' }}
          >
            <span style={{ color: '#000', fontWeight: 900, fontFamily: 'Anton, sans-serif', fontSize: '1rem' }}>C</span>
          </div>
          <span style={{ fontFamily: 'Anton, sans-serif', fontWeight: 900, color: '#fff', fontSize: '1.1rem', letterSpacing: '0.06em' }}>
            CAMPUS<span style={{ color: '#C8F135' }}>OS</span>
          </span>
        </motion.button>
      </div>

      {/* Stat chips */}
      <div className="px-3 mb-4 flex flex-col gap-1.5">
        <div className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: '#1C1C1C', border: '1px solid rgba(200,241,53,0.25)' }}>
          <div className="flex items-center gap-2">
            <span style={{ color: '#C8F135', fontFamily: 'Anton, sans-serif', fontSize: '0.85rem' }}>π</span>
            <span style={{ color: '#fff', fontSize: '0.78rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{pies} PIES</span>
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className="flex-1 flex items-center gap-1.5 rounded-xl px-2.5 py-1.5" style={{ background: '#1C1C1C' }}>
            <span style={{ fontSize: '0.8rem' }}>🔥</span>
            <span style={{ color: '#fff', fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{streak}</span>
          </div>
          <div className="flex-1 flex items-center gap-1.5 rounded-xl px-2.5 py-1.5" style={{ background: '#1C1C1C' }}>
            <span style={{ color: '#FFD700', fontSize: '0.8rem' }}>⬡</span>
            <span style={{ color: '#fff', fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>{xp} XP</span>
          </div>
        </div>
      </div>

      <div className="mx-3 mb-3" style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* Main nav */}
      <div className="space-y-0.5 mb-2">
        {MAIN_NAV.map(item => (
          <SideNavLink key={item.path} {...item} />
        ))}
        <NavLink to="/more">
          {({ isActive }) => (
            <motion.div
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer"
              style={{ background: isActive ? 'rgba(200,241,53,0.1)' : 'transparent' }}
              whileHover={{ background: 'rgba(255,255,255,0.05)' }}
              whileTap={{ scale: 0.98 }}
              transition={spring.snappy}
            >
              <LayoutGrid style={{ color: isActive ? '#C8F135' : '#666', width: 18, height: 18 }} strokeWidth={isActive ? 2.5 : 1.8} />
              <span style={{ fontFamily: isActive ? 'Anton, sans-serif' : 'Barlow, sans-serif', fontSize: '0.82rem', fontWeight: isActive ? 700 : 500, letterSpacing: isActive ? '0.04em' : '0', color: isActive ? '#C8F135' : '#888' }}>
                MORE
              </span>
            </motion.div>
          )}
        </NavLink>
      </div>

      <div className="mx-3 mb-3" style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* Quick links */}
      <p style={{ color: '#444', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', paddingLeft: 12, marginBottom: 6, fontFamily: 'Barlow Condensed, sans-serif' }}>
        FEATURES
      </p>
      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-0.5 pb-2">
        {QUICK_LINKS.map(item => (
          <SideNavLink key={item.path} {...item} />
        ))}
      </div>

      <div className="mx-3 my-2" style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

      {/* User profile footer */}
      <div className="px-2 pb-4 flex-shrink-0">
        <motion.button
          onClick={() => navigate(`/profile/${profile?.uid}`)}
          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl"
          style={{ color: '#fff' }}
          whileHover={{ background: 'rgba(255,255,255,0.05)' }}
          whileTap={{ scale: 0.98 }}
          transition={spring.snappy}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #C8F135, #00D4C8)', boxShadow: '0 0 8px rgba(200,241,53,0.35)' }}
          >
            {profile?.profileImage
              ? <img src={profile.profileImage} alt="" className="w-full h-full object-cover" />
              : <span style={{ color: '#000', fontSize: '0.7rem', fontWeight: 900, fontFamily: 'Anton, sans-serif' }}>
                  {profile?.fullName?.[0]?.toUpperCase() || 'U'}
                </span>
            }
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p style={{ color: '#ccc', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.fullName || 'User'}
            </p>
            <p style={{ color: '#555', fontSize: '0.62rem', fontFamily: 'JetBrains Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.branch || 'CSE'}
            </p>
          </div>
        </motion.button>
        <motion.button
          onClick={async () => { await logout(); navigate('/login') }}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg mt-0.5"
          style={{ color: '#555' }}
          whileHover={{ color: '#f87171', background: 'rgba(239,68,68,0.08)' }}
          whileTap={{ scale: 0.97 }}
          transition={spring.snappy}
        >
          <LogOut style={{ width: 14, height: 14 }} />
          <span style={{ fontSize: '0.72rem', fontFamily: 'Barlow, sans-serif' }}>Sign out</span>
        </motion.button>
      </div>
    </div>
  )
}
