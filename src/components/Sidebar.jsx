import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, HelpCircle, BookOpen, MessageSquare,
  Briefcase, Trophy, Code2, Zap, Bot, BarChart2, Search,
  Shield, LogOut, X, ChevronRight, AlertCircle, ArrowRightLeft,
  Lightbulb, Rocket, Archive, Github, BookMarked, Building2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { NAV_ITEMS } from '../data/constants'
import { cn } from '../lib/utils'
import { spring, staggerContainer, staggerItemLeft, drawer } from '../lib/motion'

const ICONS = {
  LayoutDashboard, Users, HelpCircle, BookOpen, MessageSquare,
  Briefcase, Trophy, Code2, Zap, Bot, BarChart2, Search, Shield,
  AlertCircle, ArrowRightLeft, Lightbulb, Rocket, Archive, Github,
  BookMarked, Building2,
}

function NavItem({ path, label, icon, mobile, onClose }) {
  const Icon = ICONS[icon]
  return (
    <motion.div variants={staggerItemLeft}>
      <NavLink
        to={path}
        onClick={mobile ? onClose : undefined}
        className={({ isActive }) => cn('sidebar-link group', isActive && 'active')}
      >
        {({ isActive }) => (
          <>
            <motion.span
              animate={isActive ? { scale: 1.1 } : { scale: 1 }}
              transition={spring.snappy}
              style={{ color: isActive ? '#C5F000' : undefined }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
            </motion.span>
            <span className="truncate text-[0.82rem]">{label}</span>
            {isActive && (
              <motion.span
                layoutId="activeIndicator"
                className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: '#C5F000', boxShadow: '0 0 6px rgba(197,240,0,0.8)' }}
              />
            )}
          </>
        )}
      </NavLink>
    </motion.div>
  )
}

function SidebarContent({ mobile, onClose }) {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const xpPct = Math.min(((profile?.reputation || 0) % 1000) / 10, 100)

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 pt-5 pb-4 flex items-center justify-between flex-shrink-0">
        <motion.div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => navigate('/dashboard')}
          whileHover={{ scale: 1.02 }}
          transition={spring.snappy}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: '#C5F000',
              boxShadow: '0 0 12px rgba(197,240,0,0.5)',
            }}
          >
            <span style={{ color: '#000', fontWeight: 900, fontSize: '0.85rem', fontFamily: 'Barlow Condensed, sans-serif' }}>C</span>
          </div>
          <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.05em', fontSize: '1.1rem', textTransform: 'uppercase' }}>
            CAMPUS<span style={{ color: '#C5F000' }}>OS</span>
          </span>
        </motion.div>

        {mobile && (
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-1.5 rounded-lg"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Divider */}
      <div className="mx-3 mb-2" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(197,240,0,0.3), transparent)' }} />

      {/* Nav */}
      <motion.nav
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="flex-1 px-2.5 space-y-0.5 overflow-y-auto pb-3 pt-1 scrollbar-hide"
      >
        {NAV_ITEMS.map(item => (
          <NavItem key={item.path} {...item} mobile={mobile} onClose={onClose} />
        ))}

        {profile?.email === 'sathvikatummala281@gmail.com' && (
          <>
            <div className="mx-1 my-2" style={{ height: '1px', background: 'var(--border)' }} />
            <NavItem path="/admin" label="Admin Panel" icon="Shield" mobile={mobile} onClose={onClose} />
          </>
        )}
      </motion.nav>

      {/* XP Bar + Profile Footer */}
      <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        {/* Mini XP bar */}
        <div className="mb-3 px-1">
          <div className="flex justify-between text-[0.65rem] mb-1" style={{ color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono, monospace' }}>
            <span style={{ color: '#67E8F9' }}>XP</span>
            <span>{profile?.reputation || 0}</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
            <motion.div
              className="h-full xp-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${xpPct}%` }}
              transition={{ duration: 1.2, ease: [0.16,1,0.3,1] }}
            />
          </div>
        </div>

        {/* Profile link */}
        <motion.div whileHover={{ x: 1 }} transition={spring.snappy}>
          <NavLink
            to={`/profile/${profile?.uid}`}
            onClick={mobile ? onClose : undefined}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl group"
            style={{ color: 'var(--text-primary)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(197,240,0,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <motion.div
              whileHover={{ scale: 1.08 }}
              transition={spring.bouncy}
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #C5F000, #00E5D0)', boxShadow: '0 0 8px rgba(197,240,0,0.4)' }}
            >
              {profile?.profileImage
                ? <img src={profile.profileImage} alt="" className="w-full h-full object-cover" />
                : <span style={{ color: '#000', fontSize: '0.68rem', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800 }}>
                    {profile?.fullName?.[0]?.toUpperCase() || 'U'}
                  </span>
              }
            </motion.div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)', fontFamily: 'Barlow Condensed, sans-serif' }}>
                {profile?.fullName}
              </p>
              <p className="truncate" style={{ color: '#C5F000', fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace' }}>
                {profile?.branch?.split(' ')[0]}
              </p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 opacity-25 group-hover:opacity-60 transition-opacity" />
          </NavLink>
        </motion.div>

        <motion.button
          whileHover={{ x: 1 }}
          whileTap={{ scale: 0.97 }}
          transition={spring.snappy}
          onClick={async () => { await logout(); navigate('/login') }}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs mt-0.5"
          style={{ color: 'var(--text-tertiary)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign out</span>
        </motion.button>
      </div>
    </div>
  )
}

export function Sidebar({ mobile, onClose }) {
  if (mobile) {
    return (
      <div className="fixed inset-0 z-40 flex">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
        <motion.div
          variants={drawer}
          initial="initial"
          animate="animate"
          exit="exit"
          className="relative h-full flex flex-col"
          style={{ width: 220, background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}
        >
          <SidebarContent mobile onClose={onClose} />
        </motion.div>
      </div>
    )
  }
  return <SidebarContent />
}
