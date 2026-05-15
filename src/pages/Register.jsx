import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Lock, Hash, Phone, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { BRANCH_OPTIONS, SECTION_OPTIONS } from '../data/constants'
import { spring, staggerContainer, staggerItem } from '../lib/motion'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '', registrationNumber: '', email: '',
    password: '', confirmPassword: '', branch: '',
    section: '', phoneNumber: '',
  })
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    if (!form.branch) return setError('Please select your branch.')
    if (!form.section) return setError('Please select your section.')

    setLoading(true)
    try {
      await register(form)
      navigate('/onboarding')
    } catch (err) {
      if (err.message.includes('email-already-in-use')) setError('Email already in use.')
      else if (err.message.includes('Registration number')) setError(err.message)
      else setError('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: 'var(--bg-app)' }}>
      {/* ── Left panel ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex flex-col justify-between w-[38%] p-12 relative overflow-hidden"
        style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ rotate: [0, 360] }}
              transition={{ repeat: Infinity, duration: 25 + i * 10, ease: 'linear' }}
              className="absolute rounded-full"
              style={{
                width: 180 + i * 90,
                height: 180 + i * 90,
                border: '1px solid rgba(255,255,255,0.05)',
                top: `${5 + i * 18}%`,
                left: `${-15 + i * 10}%`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-fg)' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '0.85rem' }}>C</span>
          </div>
          <span className="font-bold" style={{ letterSpacing: '-0.04em' }}>CampusOS</span>
        </div>

        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-4xl font-bold leading-tight mb-4" style={{ letterSpacing: '-0.05em', color: 'var(--accent-fg)' }}>
            Join your<br />campus network.
          </h1>
          <p className="text-sm" style={{ color: 'var(--accent-fg)', opacity: 0.65, lineHeight: 1.7 }}>
            Connect with peers, discover opportunities, and build together on the platform made for your college.
          </p>
        </motion.div>

        <p className="relative z-10 text-xs" style={{ color: 'var(--accent-fg)', opacity: 0.3 }}>
          © 2025 CampusOS
        </p>
      </motion.div>

      {/* ── Right — form ───────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md py-8"
        >
          {/* Mobile logo */}
          <motion.div
            className="lg:hidden flex items-center gap-2 mb-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <span style={{ color: 'var(--accent-fg)', fontWeight: 800, fontSize: '0.85rem' }}>C</span>
            </div>
            <span className="font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>CampusOS</span>
          </motion.div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
            Create your account
          </h1>
          <p className="text-sm mb-7" style={{ color: 'var(--text-tertiary)' }}>Join the campus ecosystem</p>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={spring.smooth}
                className="rounded-xl px-4 py-3 text-sm mb-5"
                style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {[
              { label: 'Full Name', key: 'fullName', type: 'text', placeholder: 'Your full name', Icon: User },
              { label: 'Registration Number', key: 'registrationNumber', type: 'text', placeholder: '22XXXXXX', Icon: Hash, extra: 'uppercase' },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'you@gmail.com', Icon: Mail },
            ].map(({ label, key, type, placeholder, Icon, extra }) => (
              <motion.div key={key} variants={staggerItem}>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  {label} *
                </label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-placeholder)' }} />
                  <input
                    type={type}
                    value={form[key]}
                    onChange={set(key)}
                    required
                    placeholder={placeholder}
                    className={`input-field pl-10 ${extra || ''}`}
                  />
                </div>
              </motion.div>
            ))}

            <motion.div variants={staggerItem} className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Branch *</label>
                <select value={form.branch} onChange={set('branch')} required className="input-field">
                  <option value="">Select Branch</option>
                  {BRANCH_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Section *</label>
                <select value={form.section} onChange={set('section')} required className="input-field">
                  <option value="">Section</option>
                  {SECTION_OPTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                </select>
              </div>
            </motion.div>

            <motion.div variants={staggerItem}>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Phone <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-placeholder)' }} />
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={set('phoneNumber')}
                  placeholder="+91 XXXXXXXXXX"
                  className="input-field pl-10"
                />
              </div>
            </motion.div>

            <motion.div variants={staggerItem}>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-placeholder)' }} />
                <input
                  type={show ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  required
                  placeholder="Min. 6 characters"
                  className="input-field pl-10 pr-10"
                />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={spring.snappy}
                  onClick={() => setShow(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-placeholder)' }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={show ? 'off' : 'on'}
                      initial={{ rotate: -20, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 20, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>

            <motion.div variants={staggerItem}>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-placeholder)' }} />
                <input
                  type={show ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  required
                  placeholder="Repeat password"
                  className="input-field pl-10"
                />
              </div>
            </motion.div>

            <motion.div variants={staggerItem}>
              <motion.button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5"
                whileHover={!loading ? { y: -1, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' } : {}}
                whileTap={{ scale: 0.98 }}
                transition={spring.snappy}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {loading
                    ? <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Creating account...
                      </motion.span>
                    : <motion.span key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center gap-2 justify-center">
                        Create account <ArrowRight className="w-4 h-4" />
                      </motion.span>
                  }
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="text-center text-sm mt-6"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Already have an account?{' '}
            <Link to="/login"
              className="font-semibold underline underline-offset-2 transition-opacity hover:opacity-70"
              style={{ color: 'var(--text-primary)' }}>
              Sign in
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
