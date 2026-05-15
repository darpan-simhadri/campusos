import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { TopBar } from '../components/layout/TopBar'
import { BottomNav } from '../components/layout/BottomNav'
import { DesktopSidebar } from '../components/layout/DesktopSidebar'
import { ByteMascot } from '../components/mascot/ByteMascot'

const pageVariants = {
  initial:  { opacity: 0, x: 16 },
  animate:  { opacity: 1, x: 0,  transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
  exit:     { opacity: 0, x: -12, transition: { duration: 0.12 } },
}

function AnimatedOutlet() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ minHeight: '100%' }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  )
}

export function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-app)' }}>

      {/* Desktop Sidebar — visible lg+ */}
      <div
        className="hidden lg:flex flex-col flex-shrink-0 h-screen"
        style={{ width: 240, background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}
      >
        <DesktopSidebar />
      </div>

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 h-screen">

        {/* Sticky TopBar */}
        <div className="flex-shrink-0 z-40" style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border)' }}>
          <TopBar />
        </div>

        {/* Scrollable page content */}
        <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-app)' }}>
          <div className="w-full mx-auto lg:mx-0 max-w-[430px] lg:max-w-none pb-24 lg:pb-6">
            <AnimatedOutlet />
          </div>
        </div>
      </div>

      {/* Bottom Nav — mobile only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <BottomNav />
      </div>

      {/* BYTE — the mascot, always visible */}
      <ByteMascot />

    </div>
  )
}
