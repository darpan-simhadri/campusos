import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Github, Edit2, MessageSquare, Users, Trophy, Code2, Star, Loader2, Save, X, Sparkles, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getDocument, updateUserProfile, addUserAchievement, addUserProject, addUserCollaboration } from '../services/firebaseService'
import ReactMarkdown from 'react-markdown'
import { SkeletonCard } from '../components/ui/Skeleton'
import { SKILL_CATEGORIES, REPUTATION_LEVELS, BADGES } from '../data/constants'
import { spring, staggerContainer, staggerItem } from '../lib/motion'

function getRepLevel(rep) {
  return REPUTATION_LEVELS.find(l => rep >= l.min && rep < l.max) || REPUTATION_LEVELS[0]
}

export default function Profile() {
  const { id } = useParams()
  const { user, profile: myProfile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const isMe = id === user?.uid

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})
  const [skillInput, setSkillInput] = useState('')
  const [analyzingAngle, setAnalyzingAngle] = useState(false)
  const [showAchievementForm, setShowAchievementForm] = useState(false)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [showCollabForm, setShowCollabForm] = useState(false)
  const [achievementForm, setAchievementForm] = useState({ title: '', description: '' })
  const [projectForm, setProjectForm] = useState({ title: '', description: '', link: '', tech: '' })
  const [collabForm, setCollabForm] = useState({ project: '', partnerName: '', role: '' })
  const [savingItem, setSavingItem] = useState(false)

  useEffect(() => {
    if (!id) return
    if (isMe && myProfile) { setProfile(myProfile); setLoading(false); return }
    getDocument('users', id).then(data => { setProfile(data); setLoading(false) })
  }, [id, isMe, myProfile])

  const startEdit = () => {
    setForm({
      fullName: profile?.fullName || '',
      bio: profile?.bio || '',
      githubLink: profile?.githubLink || '',
      profileImage: profile?.profileImage || '',
      skills: [...(profile?.skills || [])],
      collaborationAvailable: profile?.collaborationAvailable ?? true,
    })
    setEditing(true)
  }

  const saveEdit = async () => {
    setSaving(true)
    await updateUserProfile(user.uid, form)
    await refreshProfile()
    setProfile(p => ({ ...p, ...form }))
    setEditing(false)
    setSaving(false)
  }

  const addSkill = (s) => {
    const skill = s || skillInput.trim()
    if (skill && !form.skills?.includes(skill) && (form.skills?.length || 0) < 10) {
      setForm(f => ({ ...f, skills: [...(f.skills || []), skill] }))
      setSkillInput('')
    }
  }
  const removeSkill = (s) => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }))

  const generateUniqueAngle = async () => {
    if (analyzingAngle) return
    setAnalyzingAngle(true)
    const branch = profile.branch || 'Tech'
    const skills = profile.skills?.join(', ') || 'programming'
    const templates = [
      `As a ${branch} student with expertise in ${skills}, your rare edge is the ability to bridge theory and real-world application — a combination that most teams desperately need but rarely find.`,
      `Your background in ${branch} combined with hands-on skills in ${skills} gives you a multi-disciplinary superpower. You can see problems that specialists miss and build solutions that generalists can't.`,
      `With ${branch} foundations and deep skills in ${skills}, you're positioned at the intersection of depth and breadth — exactly where the most impactful work in tech happens today.`,
    ]
    const result = templates[Math.floor(Math.random() * templates.length)]
    try {
      await updateUserProfile(user.uid, { uniqueAngle: result })
      await refreshProfile()
      setProfile(p => ({ ...p, uniqueAngle: result }))
    } catch (e) {
      console.error(e)
    }
    setAnalyzingAngle(false)
  }

  const handleAddAchievement = async () => {
    if (!achievementForm.title.trim() || savingItem) return
    setSavingItem(true)
    const item = { title: achievementForm.title.trim(), description: achievementForm.description.trim(), addedAt: new Date().toISOString() }
    await addUserAchievement(user.uid, item)
    await refreshProfile()
    setProfile(p => ({ ...p, achievements: [...(p.achievements || []), item] }))
    setAchievementForm({ title: '', description: '' })
    setShowAchievementForm(false)
    setSavingItem(false)
  }

  const handleAddProject = async () => {
    if (!projectForm.title.trim() || savingItem) return
    setSavingItem(true)
    const item = { title: projectForm.title.trim(), description: projectForm.description.trim(), link: projectForm.link.trim(), tech: projectForm.tech.trim(), addedAt: new Date().toISOString() }
    await addUserProject(user.uid, item)
    await refreshProfile()
    setProfile(p => ({ ...p, projects: [...(p.projects || []), item] }))
    setProjectForm({ title: '', description: '', link: '', tech: '' })
    setShowProjectForm(false)
    setSavingItem(false)
  }

  const handleAddCollab = async () => {
    if (!collabForm.project.trim() || !collabForm.partnerName.trim() || savingItem) return
    setSavingItem(true)
    const item = { project: collabForm.project.trim(), partnerName: collabForm.partnerName.trim(), role: collabForm.role.trim() || 'Collaborator' }
    await addUserCollaboration(user.uid, item)
    await refreshProfile()
    setProfile(p => ({ ...p, collaborationHistory: [...(p.collaborationHistory || []), item] }))
    setCollabForm({ project: '', partnerName: '', role: '' })
    setShowCollabForm(false)
    setSavingItem(false)
  }

  if (loading) return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      {Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )

  if (!profile) return (
    <div className="p-6 text-center" style={{ color: 'var(--text-tertiary)' }}>Profile not found.</div>
  )

  const repLevel = getRepLevel(profile.reputation || 0)
  const profileBadges = BADGES.filter(b => profile.badges?.includes(b.id))

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="p-6 max-w-4xl mx-auto space-y-5"
    >
      {/* ── Hero card ──────────────────────────────────────── */}
      <motion.div variants={staggerItem} className="card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }} transition={spring.bouncy}
              className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 text-3xl font-bold"
              style={{
                background: profile.profileImage ? 'transparent' : 'var(--bg-secondary)',
                border: '2px solid var(--border)',
              }}
            >
              {profile.profileImage
                ? <img src={profile.profileImage} alt="" className="w-full h-full object-cover" />
                : <span style={{ color: 'var(--text-secondary)' }}>{profile.fullName?.[0]}</span>
              }
            </motion.div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                {profile.fullName}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {profile.branch} · Section {profile.section}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)', opacity: 0.6 }}>
                {profile.registrationNumber}
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span
                  className="badge text-xs"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                >
                  {repLevel.label}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {profile.reputation || 0} reputation
                </span>
                {profile.collaborationAvailable && (
                  <span
                    className="badge text-xs"
                    style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
                  >
                    Open to Collab
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {!isMe && (
              <motion.button
                onClick={() => navigate(`/messages?userId=${id}`)}
                className="btn-secondary flex items-center gap-2"
                whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
              >
                <MessageSquare className="w-4 h-4" /> Message
              </motion.button>
            )}
            {isMe && !editing && (
              <motion.button
                onClick={startEdit}
                className="btn-secondary flex items-center gap-2"
                whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
              >
                <Edit2 className="w-4 h-4" /> Edit Profile
              </motion.button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 space-y-4 pt-6"
              style={{ borderTop: '1px solid var(--border)', overflow: 'hidden' }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
                  <input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Profile Image URL</label>
                  <input value={form.profileImage} onChange={e => setForm(f => ({ ...f, profileImage: e.target.value }))}
                    className="input-field" placeholder="https://..." />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Bio</label>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  rows={3} className="input-field resize-none" placeholder="Tell the campus about yourself..." />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>GitHub Link</label>
                <input value={form.githubLink} onChange={e => setForm(f => ({ ...f, githubLink: e.target.value }))}
                  className="input-field" placeholder="https://github.com/username" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Skills</label>
                <div className="flex gap-2 mb-2">
                  <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="Add skill..." className="input-field flex-1 text-sm py-2" />
                  <button onClick={() => addSkill()} className="btn-secondary px-3">Add</button>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {SKILL_CATEGORIES.map(s => (
                    <motion.button
                      key={s}
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={spring.snappy}
                      onClick={() => addSkill(s)}
                      className="tag cursor-pointer text-xs"
                      style={{ opacity: form.skills?.includes(s) ? 0.4 : 1 }}
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {form.skills?.map(s => (
                    <motion.span
                      key={s}
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      transition={spring.bouncy}
                      className="flex items-center gap-1 tag text-xs"
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
              </div>
              <div className="flex gap-3">
                <motion.button
                  onClick={() => setEditing(false)}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                  whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
                >
                  <X className="w-4 h-4" /> Cancel
                </motion.button>
                <motion.button
                  onClick={saveEdit}
                  disabled={saving}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                  whileHover={!saving ? { y: -1, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' } : {}}
                  whileTap={{ scale: 0.97 }}
                  transition={spring.snappy}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              {profile.bio && (
                <p className="text-sm mt-4 pt-4" style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', lineHeight: 1.7 }}>
                  {profile.bio}
                </p>
              )}
              {profile.githubLink && (
                <motion.a
                  href={profile.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ x: 2 }} transition={spring.snappy}
                  className="inline-flex items-center gap-2 text-sm mt-3"
                  style={{ color: 'var(--text-tertiary)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
                >
                  <Github className="w-4 h-4" /> {profile.githubLink}
                </motion.a>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Unique angle ──────────────────────────────────── */}
      {profile.uniqueAngle && (
        <motion.div
          variants={staggerItem}
          className="card"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
        >
          <h2 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Sparkles className="w-4 h-4" style={{ color: '#f59e0b' }} /> Your Unique Angle
          </h2>
          <div className="text-sm italic" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <ReactMarkdown>{profile.uniqueAngle}</ReactMarkdown>
          </div>
        </motion.div>
      )}

      {/* ── Skills ─────────────────────────────────────────── */}
      {profile.skills?.length > 0 && (
        <motion.div variants={staggerItem} className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Star className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /> Skills
            </h2>
            {isMe && !profile.uniqueAngle && (
              <motion.button
                onClick={generateUniqueAngle}
                disabled={analyzingAngle}
                whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
                className="btn-secondary py-1 text-xs flex items-center gap-1.5"
              >
                {analyzingAngle ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {analyzingAngle ? 'Analyzing...' : 'Discover Unique Angle'}
              </motion.button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((s, i) => (
              <motion.span
                key={s}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...spring.bouncy, delay: i * 0.04 }}
                className="tag"
              >
                {s}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Badges ─────────────────────────────────────────── */}
      {profileBadges.length > 0 && (
        <motion.div variants={staggerItem} className="card">
          <h2 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Trophy className="w-4 h-4" style={{ color: '#f59e0b' }} /> Badges
          </h2>
          <div className="flex flex-wrap gap-3">
            {profileBadges.map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...spring.bouncy, delay: i * 0.07 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
              >
                <span>{b.icon}</span>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{b.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Achievements ────────────────────────────────────── */}
      <motion.div variants={staggerItem} className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Trophy className="w-4 h-4" style={{ color: '#f59e0b' }} /> Achievements
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-secondary)', color: 'var(--text-tertiary)' }}>
              {profile.achievements?.length || 0}
            </span>
          </h2>
          {isMe && (
            <button onClick={() => setShowAchievementForm(s => !s)}
              className="btn-secondary py-1 text-xs flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          )}
        </div>
        <AnimatePresence>
          {showAchievementForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-3 space-y-2" style={{ overflow: 'hidden' }}>
              <input value={achievementForm.title} onChange={e => setAchievementForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Achievement title *" className="input-field text-sm" />
              <textarea value={achievementForm.description} onChange={e => setAchievementForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Description (optional)" rows={2} className="input-field resize-none text-sm" />
              <div className="flex gap-2">
                <button onClick={() => setShowAchievementForm(false)} className="btn-secondary flex-1 text-xs py-1.5">Cancel</button>
                <button onClick={handleAddAchievement} disabled={!achievementForm.title.trim() || savingItem}
                  className="btn-primary flex-1 text-xs py-1.5 flex items-center justify-center gap-1">
                  {savingItem ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Save
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {profile.achievements?.length > 0 ? (
          <div className="space-y-2">
            {profile.achievements.map((a, i) => (
              <div key={i} className="p-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{a.title || a}</p>
                {a.description && <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{a.description}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No achievements yet.{isMe ? ' Add your first one!' : ''}</p>
        )}
      </motion.div>

      {/* ── Projects ────────────────────────────────────────── */}
      <motion.div variants={staggerItem} className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Code2 className="w-4 h-4" style={{ color: '#3b82f6' }} /> Projects
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-secondary)', color: 'var(--text-tertiary)' }}>
              {profile.projects?.length || 0}
            </span>
          </h2>
          {isMe && (
            <button onClick={() => setShowProjectForm(s => !s)}
              className="btn-secondary py-1 text-xs flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          )}
        </div>
        <AnimatePresence>
          {showProjectForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-3 space-y-2" style={{ overflow: 'hidden' }}>
              <input value={projectForm.title} onChange={e => setProjectForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Project name *" className="input-field text-sm" />
              <textarea value={projectForm.description} onChange={e => setProjectForm(f => ({ ...f, description: e.target.value }))}
                placeholder="What does it do?" rows={2} className="input-field resize-none text-sm" />
              <input value={projectForm.link} onChange={e => setProjectForm(f => ({ ...f, link: e.target.value }))}
                placeholder="Link (GitHub, deployed URL, etc.)" className="input-field text-sm" />
              <input value={projectForm.tech} onChange={e => setProjectForm(f => ({ ...f, tech: e.target.value }))}
                placeholder="Tech stack (e.g. React, Node, Firebase)" className="input-field text-sm" />
              <div className="flex gap-2">
                <button onClick={() => setShowProjectForm(false)} className="btn-secondary flex-1 text-xs py-1.5">Cancel</button>
                <button onClick={handleAddProject} disabled={!projectForm.title.trim() || savingItem}
                  className="btn-primary flex-1 text-xs py-1.5 flex items-center justify-center gap-1">
                  {savingItem ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Save
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {profile.projects?.length > 0 ? (
          <div className="space-y-2">
            {profile.projects.map((p, i) => (
              <div key={i} className="p-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{p.title || p}</p>
                    {p.description && <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{p.description}</p>}
                    {p.tech && <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{p.tech}</p>}
                  </div>
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noreferrer"
                      className="text-xs flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}>
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No projects yet.{isMe ? ' Add your first one!' : ''}</p>
        )}
      </motion.div>

      {/* ── Team history ───────────────────────────────────── */}
      <motion.div variants={staggerItem} className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Users className="w-4 h-4" style={{ color: '#10b981' }} /> Collaborations
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-secondary)', color: 'var(--text-tertiary)' }}>
              {profile.collaborationHistory?.length || 0}
            </span>
          </h2>
          {isMe && (
            <button onClick={() => setShowCollabForm(s => !s)}
              className="btn-secondary py-1 text-xs flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          )}
        </div>
        <AnimatePresence>
          {showCollabForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-3 space-y-2" style={{ overflow: 'hidden' }}>
              <input value={collabForm.project} onChange={e => setCollabForm(f => ({ ...f, project: e.target.value }))}
                placeholder="Project name *" className="input-field text-sm" />
              <input value={collabForm.partnerName} onChange={e => setCollabForm(f => ({ ...f, partnerName: e.target.value }))}
                placeholder="Partner / teammate name *" className="input-field text-sm" />
              <input value={collabForm.role} onChange={e => setCollabForm(f => ({ ...f, role: e.target.value }))}
                placeholder="Your role (e.g. Frontend, ML Engineer)" className="input-field text-sm" />
              <div className="flex gap-2">
                <button onClick={() => setShowCollabForm(false)} className="btn-secondary flex-1 text-xs py-1.5">Cancel</button>
                <button onClick={handleAddCollab} disabled={!collabForm.project.trim() || !collabForm.partnerName.trim() || savingItem}
                  className="btn-primary flex-1 text-xs py-1.5 flex items-center justify-center gap-1">
                  {savingItem ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Save
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {profile.collaborationHistory?.length > 0 ? (
          <div className="space-y-3">
            {profile.collaborationHistory.map((collab, i) => (
              <motion.div
                key={i}
                whileHover={{ x: 2 }} transition={spring.snappy}
                className="flex justify-between items-center p-3 rounded-xl"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{collab.project}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>with {collab.partnerName}</p>
                </div>
                <span className="badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                  {collab.role}
                </span>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No collaborations yet.{isMe ? ' Add your first one!' : ''}</p>
        )}
      </motion.div>
    </motion.div>
  )
}
