import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar } from '../components/Sidebar'
import { TopNav } from '../components/TopNav'

export function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {mobileOpen && (
        <Sidebar mobile onClose={() => setMobileOpen(false)} />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav onMenuClick={() => setMobileOpen(true)} />
        <motion.main
          className="flex-1 overflow-y-auto"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  )
}
