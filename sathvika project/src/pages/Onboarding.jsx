import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Github, FileText, Users, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { updateUserProfile } from '../services/firebaseService'
import { SKILL_CATEGORIES } from '../data/constants'

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
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12),transparent_60%)]" />
      <div className="relative w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Set up your profile</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome, {profile?.fullName?.split(' ')[0]}! Let's get you started.</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            {STEPS.map((s, i) => (
              <span key={s} className={i <= step ? 'text-indigo-400' : ''}>{s}</span>
            ))}
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-indigo-600 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card space-y-4">
              <h2 className="font-semibold text-white flex items-center gap-2"><FileText className="w-4 h-4 text-indigo-400" /> Basic Info</h2>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Profile Image URL (Optional)</label>
                <input value={data.profileImage} onChange={e => setData(d => ({ ...d, profileImage: e.target.value }))}
                  placeholder="https://..." className="input-field" />
                {data.profileImage && (
                  <img src={data.profileImage} alt="" className="w-16 h-16 rounded-full object-cover mt-2 border-2 border-indigo-600" />
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Bio</label>
                <textarea value={data.bio} onChange={e => setData(d => ({ ...d, bio: e.target.value }))}
                  placeholder="Tell the campus about yourself..." rows={3} className="input-field resize-none" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">GitHub Profile URL</label>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input value={data.githubLink} onChange={e => setData(d => ({ ...d, githubLink: e.target.value }))}
                    placeholder="https://github.com/username" className="input-field pl-10" />
                </div>
              </div>

              <button onClick={() => setStep(1)} className="btn-primary w-full py-2.5">Continue →</button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card space-y-4">
              <h2 className="font-semibold text-white flex items-center gap-2"><Plus className="w-4 h-4 text-indigo-400" /> Your Skills</h2>
              <p className="text-gray-400 text-sm">Add skills you have or are learning (max 10)</p>

              <div className="flex gap-2">
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Type a skill and press Enter" className="input-field flex-1" />
                <button onClick={() => addSkill()} className="btn-secondary px-3">Add</button>
              </div>

              <div className="flex flex-wrap gap-2">
                {SKILL_CATEGORIES.map(s => (
                  <button key={s} onClick={() => addSkill(s)}
                    className={`tag cursor-pointer hover:bg-indigo-600/30 transition-colors ${data.skills.includes(s) ? 'opacity-50' : ''}`}>
                    {s}
                  </button>
                ))}
              </div>

              {data.skills.length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">Your skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.map(s => (
                      <span key={s} className="flex items-center gap-1 tag">
                        {s}
                        <button onClick={() => removeSkill(s)} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="btn-secondary flex-1">← Back</button>
                <button onClick={() => setStep(2)} className="btn-primary flex-1">Continue →</button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card space-y-4">
              <h2 className="font-semibold text-white flex items-center gap-2"><Users className="w-4 h-4 text-indigo-400" /> Preferences</h2>

              <div>
                <p className="text-sm text-gray-300 mb-3">Are you open to collaborations?</p>
                <div className="flex gap-3">
                  {[true, false].map(v => (
                    <button key={String(v)} onClick={() => setData(d => ({ ...d, collaborationAvailable: v }))}
                      className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${data.collaborationAvailable === v ? 'border-indigo-500 bg-indigo-600/20 text-indigo-400' : 'border-gray-700 text-gray-400 hover:border-gray-600'}`}>
                      {v ? '✅ Yes, I am open!' : '⏸️ Not right now'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-300 mb-3">Study interests:</p>
                <div className="flex flex-wrap gap-2">
                  {SKILL_CATEGORIES.map(i => (
                    <button key={i} onClick={() => toggleInterest(i)}
                      className={`tag cursor-pointer transition-all ${data.studyInterests.includes(i) ? 'bg-indigo-600/40 border-indigo-500' : 'hover:bg-indigo-600/20'}`}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
                <button onClick={finish} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {loading ? 'Saving...' : 'Finish Setup'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
