import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Loader2, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { spring, staggerContainer, staggerItem } from '../lib/motion'

const SPECS = ['CSE', 'AIML', 'Agentic AI', 'Gen AI', 'AIDA', 'AIDS', 'Quantum Eng']
const SPEC_COLORS = {
  'CSE': '#06B6D4', 'AIML': '#7C3AED', 'Agentic AI': '#EC4899',
  'Gen AI': '#F59E0B', 'AIDA': '#10B981', 'AIDS': '#EF4444', 'Quantum Eng': '#8B5CF6',
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message.includes('invalid') ? 'Invalid email or password.' : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: 'var(--bg-app)' }}>
      {/* ── Left panel ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex flex-col justify-between w-[44%] p-12 relative overflow-hidden"
        style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}
      >
        {/* Animated background orbs */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ repeat: Infinity, duration: 4 + i * 2, ease: 'easeInOut', delay: i * 1.5 }}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 300 + i * 100,
              height: 300 + i * 100,
              background: i === 0 ? 'radial-gradient(circle, rgba(197,240,0,0.2), transparent)' :
                          i === 1 ? 'radial-gradient(circle, rgba(0,229,208,0.15), transparent)' :
                                    'radial-gradient(circle, rgba(255,31,156,0.15), transparent)',
              top: `${i * 25}%`,
              left: `${i * 10 - 10}%`,
            }}
          />
        ))}

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #C5F000, #00E5D0)', boxShadow: '0 0 20px rgba(197,240,0,0.5)' }}>
              <span style={{ color: '#000', fontWeight: 900, fontSize: '1rem', fontFamily: 'Barlow Condensed, sans-serif' }}>C</span>
            </div>
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, fontSize: '1.3rem', color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CAMPUS<span style={{ color: '#C5F000' }}>OS</span>
            </span>
          </div>

          <h1 className="text-5xl font-black leading-none mb-4 uppercase" style={{ fontFamily: 'Barlow Condensed, sans-serif', color: '#FFFFFF', letterSpacing: '0.01em' }}>
            YOUR CAMPUS.<br />
            <span style={{ color: '#C5F000' }}>LEVELED UP.</span>
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Connect with 1,400+ students. Find teammates, compete for XP, and build projects together.
          </p>

          {/* Spec badges */}
          <div className="flex flex-wrap gap-2">
            {SPECS.map(spec => (
              <motion.span
                key={spec}
                whileHover={{ scale: 1.05, boxShadow: `0 0 12px ${SPEC_COLORS[spec]}40` }}
                transition={spring.snappy}
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: `${SPEC_COLORS[spec]}15`,
                  color: SPEC_COLORS[spec],
                  border: `1px solid ${SPEC_COLORS[spec]}35`,
                  cursor: 'default',
                }}
              >
                {spec}
              </motion.span>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace' }}>
              847 students online now
            </span>
          </div>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>© 2025 CampusOS</p>
        </div>
      </motion.div>

      {/* ── Right — form ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #C5F000, #00E5D0)', boxShadow: '0 0 12px rgba(197,240,0,0.5)' }}>
              <span style={{ color: '#000', fontWeight: 900, fontFamily: 'Barlow Condensed, sans-serif' }}>C</span>
            </div>
            <span style={{ fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 900, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              CAMPUS<span style={{ color: '#C5F000' }}>OS</span>
            </span>
          </div>

          <h1 className="text-3xl font-black mb-1 uppercase" style={{ fontFamily: 'Barlow Condensed, sans-serif', color: '#FFFFFF', letterSpacing: '0.02em' }}>
            WELCOME BACK
          </h1>
          <p className="text-sm mb-7" style={{ color: 'var(--text-tertiary)' }}>Sign in to your account</p>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={spring.smooth}
                className="rounded-xl px-4 py-3 text-sm mb-5"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form
            variants={staggerContainer} initial="hidden" animate="show"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <motion.div variants={staggerItem}>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-placeholder)' }} />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@college.edu"
                  required
                  className="input-field pl-10"
                />
              </div>
            </motion.div>

            <motion.div variants={staggerItem}>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-placeholder)' }} />
                <input
                  type={show ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="input-field pl-10 pr-10"
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={spring.snappy}
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-placeholder)' }}
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </motion.button>
              </div>
            </motion.div>

            <motion.div variants={staggerItem}>
              <motion.button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5 mt-1"
                whileHover={!loading ? { y: -1 } : {}}
                whileTap={{ scale: 0.98 }}
                transition={spring.snappy}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {loading
                    ? <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                      </motion.span>
                    : <motion.span key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2">
                        <Zap className="w-4 h-4" /> Sign in
                      </motion.span>
                  }
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-center text-sm mt-6"
            style={{ color: 'var(--text-tertiary)' }}
          >
            No account?{' '}
            <Link to="/register"
              className="font-semibold transition-colors"
              style={{ color: '#C5F000' }}
              onMouseEnter={e => e.currentTarget.style.textShadow = '0 0 8px rgba(197,240,0,0.5)'}
              onMouseLeave={e => e.currentTarget.style.textShadow = 'none'}
            >
              Register →
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
