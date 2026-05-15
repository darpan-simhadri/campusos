import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Github, FileText, Users, Loader2, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { updateUserProfile } from '../services/firebaseService'
import { SKILL_CATEGORIES } from '../data/constants'
import { spring, staggerContainer, staggerItem } from '../lib/motion'

const STEPS = ['Profile', 'Skills', 'Preferences']

export default function Onboarding() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    bio: '',
    githubLink: '',
    profileImage: '',
    skills: [],
    studyInterests: [],
    collaborationAvailable: true,
  })
  const [skillInput, setSkillInput] = useState('')

  const addSkill = (s) => {
    const skill = s || skillInput.trim()
    if (skill && !data.skills.includes(skill) && data.skills.length < 10) {
      setData(d => ({ ...d, skills: [...d.skills, skill] }))
      setSkillInput('')
    }
  }

  const removeSkill = (s) => setData(d => ({ ...d, skills: d.skills.filter(x => x !== s) }))

  const toggleInterest = (i) => {
    setData(d => ({
      ...d,
      studyInterests: d.studyInterests.includes(i)
        ? d.studyInterests.filter(x => x !== i)
        : [...d.studyInterests, i],
    }))
  }

  const finish = async () => {
    setLoading(true)
    try {
      await updateUserProfile(user.uid, { ...data, onboardingComplete: true })
      await refreshProfile()
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-app)' }}>
      <div className="relative w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <span style={{ color: 'var(--accent-fg)', fontWeight: 800, fontSize: '0.85rem' }}>C</span>
            </div>
            <span className="font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>CampusOS</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
            Set up your profile
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Welcome, {profile?.fullName?.split(' ')[0]}! Let's get you started.
          </p>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <div className="flex justify-between text-xs mb-2">
            {STEPS.map((s, i) => (
              <span
                key={s}
                style={{ color: i <= step ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: i === step ? 600 : 400 }}
              >
                {s}
              </span>
            ))}
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'var(--text-primary)' }}
              animate={{ width: `${progress}%` }}
              transition={spring.smooth}
            />
          </div>
        </motion.div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 30, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -30, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="card space-y-4"
            >
              <h2 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <FileText className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /> Basic Info
              </h2>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Profile Image URL <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(Optional)</span>
                </label>
                <input value={data.profileImage} onChange={e => setData(d => ({ ...d, profileImage: e.target.value }))}
                  placeholder="https://..." className="input-field" />
                {data.profileImage && (
                  <motion.img
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    src={data.profileImage}
                    alt=""
                    className="w-16 h-16 rounded-full object-cover mt-2"
                    style={{ border: '2px solid var(--border)' }}
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Bio</label>
                <textarea value={data.bio} onChange={e => setData(d => ({ ...d, bio: e.target.value }))}
                  placeholder="Tell the campus about yourself..." rows={3} className="input-field resize-none" />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>GitHub Profile URL</label>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-placeholder)' }} />
                  <input value={data.githubLink} onChange={e => setData(d => ({ ...d, githubLink: e.target.value }))}
                    placeholder="https://github.com/username" className="input-field pl-10" />
                </div>
              </div>

              <motion.button
                onClick={() => setStep(1)}
                className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
                whileHover={{ y: -1, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}
                whileTap={{ scale: 0.97 }}
                transition={spring.snappy}
              >
                Continue <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -30, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="card space-y-4"
            >
              <div>
                <h2 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Plus className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /> Your Skills
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Add skills you have or are learning (max 10)</p>
              </div>

              <div className="flex gap-2">
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Type a skill and press Enter" className="input-field flex-1" />
                <button onClick={() => addSkill()} className="btn-secondary px-3">Add</button>
              </div>

              <div className="flex flex-wrap gap-2">
                {SKILL_CATEGORIES.map(s => (
                  <motion.button
                    key={s}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={spring.snappy}
                    onClick={() => addSkill(s)}
                    className="tag cursor-pointer"
                    style={{ opacity: data.skills.includes(s) ? 0.4 : 1 }}
                  >
                    {s}
                  </motion.button>
                ))}
              </div>

              <AnimatePresence>
                {data.skills.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>Your skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.map(s => (
                        <motion.span
                          key={s}
                          initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                          transition={spring.bouncy}
                          className="flex items-center gap-1 tag text-sm"
                        >
                          {s}
                          <button onClick={() => removeSkill(s)} style={{ color: 'var(--text-tertiary)' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setStep(0)} className="btn-secondary flex-1 flex items-center justify-center gap-2"
                  whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </motion.button>
                <motion.button
                  onClick={() => setStep(2)} className="btn-primary flex-1 flex items-center justify-center gap-2"
                  whileHover={{ y: -1, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -30, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="card space-y-5"
            >
              <h2 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Users className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /> Preferences
              </h2>

              <div>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Are you open to collaborations?</p>
                <div className="flex gap-3">
                  {[
                    { value: true, label: 'Yes, I am open!' },
                    { value: false, label: 'Not right now' },
                  ].map(({ value, label }) => (
                    <motion.button
                      key={String(value)}
                      onClick={() => setData(d => ({ ...d, collaborationAvailable: value }))}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
                      className="flex-1 py-2.5 rounded-xl border text-sm font-medium"
                      style={{
                        background: data.collaborationAvailable === value ? 'var(--text-primary)' : 'transparent',
                        color: data.collaborationAvailable === value ? 'var(--bg-card)' : 'var(--text-secondary)',
                        borderColor: data.collaborationAvailable === value ? 'var(--text-primary)' : 'var(--border)',
                      }}
                    >
                      {label}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Study interests:</p>
                <div className="flex flex-wrap gap-2">
                  {SKILL_CATEGORIES.map(i => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={spring.snappy}
                      onClick={() => toggleInterest(i)}
                      className="tag cursor-pointer"
                      style={{
                        background: data.studyInterests.includes(i) ? 'var(--text-primary)' : 'var(--bg-secondary)',
                        color: data.studyInterests.includes(i) ? 'var(--bg-card)' : 'var(--text-secondary)',
                        border: data.studyInterests.includes(i) ? '1px solid var(--text-primary)' : '1px solid var(--border)',
                      }}
                    >
                      {i}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setStep(1)} className="btn-secondary flex-1 flex items-center justify-center gap-2"
                  whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </motion.button>
                <motion.button
                  onClick={finish}
                  disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                  whileHover={!loading ? { y: -1, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' } : {}}
                  whileTap={{ scale: 0.97 }}
                  transition={spring.snappy}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {loading
                      ? <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                        </motion.span>
                      : <motion.span key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Finish Setup
                        </motion.span>
                    }
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
