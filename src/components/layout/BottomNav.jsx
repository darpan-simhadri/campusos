import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, ClipboardList, Activity, LayoutGrid, Swords } from 'lucide-react'
import { spring } from '../../lib/motion'

const TABS = [
  { path: '/arena',   label: 'ARENA',   Icon: Swords        },
  { path: '/compete', label: 'COMPETE', Icon: Trophy        },
  { path: '/quests',  label: 'QUESTS',  Icon: ClipboardList, badge: '0/3' },
  { path: '/feed',    label: 'FEED',    Icon: Activity      },
  { path: '/more',    label: 'MORE',    Icon: LayoutGrid,    dot: true },
]

export function BottomNav() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 w-full"
      style={{ background: 'var(--bg-app)', borderTop: '1px solid var(--border)', zIndex: 50 }}
    >
      <div className="flex items-stretch justify-around">
        {TABS.map(({ path, label, Icon, badge, dot }) => (
          <NavLink key={path} to={path} className="flex-1">
            {({ isActive }) => (
              <motion.div
                className="flex flex-col items-center justify-center gap-0.5 py-2.5 relative"
                whileTap={{ scale: 0.88 }}
                transition={spring.bouncy}
              >
                {/* Icon with badge */}
                <div className="relative">
                  <Icon
                    className="w-6 h-6"
                    style={{ color: isActive ? '#C8F135' : '#666666' }}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                  {badge && (
                    <span
                      className="absolute -top-1.5 -right-2.5 flex items-center justify-center rounded-full font-bold"
                      style={{ background: '#EF4444', color: '#fff', fontSize: '0.55rem', minWidth: 18, height: 14, padding: '0 3px' }}
                    >
                      {badge}
                    </span>
                  )}
                  {dot && (
                    <span
                      className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full"
                      style={{ background: '#EF4444' }}
                    />
                  )}
                </div>
                {/* Label */}
                <span
                  style={{
                    color: isActive ? '#C8F135' : '#666666',
                    fontSize: '0.6rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    fontFamily: 'Barlow Condensed, sans-serif',
                    lineHeight: 1,
                  }}
                >
                  {label}
                </span>
                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    layoutId="navDot"
                    className="absolute top-1 w-1 h-1 rounded-full"
                    style={{ background: '#C8F135' }}
                    transition={spring.snappy}
                  />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  )
}
