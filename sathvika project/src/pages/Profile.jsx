import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Github, Edit2, MessageSquare, Users, Trophy, Code2, Star, Loader2, Save, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getDocument, updateUserProfile } from '../services/firebaseService'
import { SkeletonCard } from '../components/ui/Skeleton'
import { SKILL_CATEGORIES, REPUTATION_LEVELS, BADGES } from '../data/constants'

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

  if (loading) return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      {Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )

  if (!profile) return (
    <div className="p-6 text-center text-gray-400">Profile not found.</div>
  )

  const repLevel = getRepLevel(profile.reputation || 0)
  const profileBadges = BADGES.filter(b => profile.badges?.includes(b.id))

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-indigo-600/30 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-indigo-600/30">
              {profile.profileImage ? (
                <img src={profile.profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-indigo-400">{profile.fullName?.[0]}</span>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{profile.fullName}</h1>
              <p className="text-gray-400 text-sm mt-0.5">{profile.branch} · Section {profile.section}</p>
              <p className="text-xs text-gray-500 mt-0.5">{profile.registrationNumber}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`badge text-xs ${repLevel.bg} ${repLevel.color}`}>{repLevel.label}</span>
                <span className="text-xs text-gray-500">{profile.reputation || 0} reputation</span>
                {profile.collaborationAvailable && (
                  <span className="badge bg-emerald-900/40 text-emerald-400 text-xs">Open to Collab</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {!isMe && (
              <button onClick={() => navigate(`/messages?userId=${id}`)} className="btn-secondary flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Message
              </button>
            )}
            {isMe && !editing && (
              <button onClick={startEdit} className="btn-secondary flex items-center gap-2">
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {editing ? (
          <div className="mt-6 space-y-4 pt-6 border-t border-gray-800">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name</label>
                <input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Profile Image URL</label>
                <input value={form.profileImage} onChange={e => setForm(f => ({ ...f, profileImage: e.target.value }))} className="input-field" placeholder="https://..." />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Bio</label>
              <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                rows={3} className="input-field resize-none" placeholder="Tell the campus about yourself..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">GitHub Link</label>
              <input value={form.githubLink} onChange={e => setForm(f => ({ ...f, githubLink: e.target.value }))}
                className="input-field" placeholder="https://github.com/username" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Skills</label>
              <div className="flex gap-2 mb-2">
                <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Add skill..." className="input-field flex-1 text-sm py-2" />
                <button onClick={() => addSkill()} className="btn-secondary px-3">Add</button>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {SKILL_CATEGORIES.map(s => (
                  <button key={s} onClick={() => addSkill(s)}
                    className={`tag cursor-pointer hover:bg-indigo-600/30 transition-colors text-xs ${form.skills?.includes(s) ? 'opacity-40' : ''}`}>{s}</button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {form.skills?.map(s => (
                  <span key={s} className="flex items-center gap-1 tag text-xs">
                    {s} <button onClick={() => removeSkill(s)} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditing(false)} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                <X className="w-4 h-4" /> Cancel
              </button>
              <button onClick={saveEdit} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {profile.bio && <p className="text-gray-300 text-sm mt-4 pt-4 border-t border-gray-800">{profile.bio}</p>}
            {profile.githubLink && (
              <a href={profile.githubLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mt-3 transition-colors">
                <Github className="w-4 h-4" /> {profile.githubLink}
              </a>
            )}
          </>
        )}
      </motion.div>

      {profile.skills?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-indigo-400" /> Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map(s => <span key={s} className="tag">{s}</span>)}
          </div>
        </div>
      )}

      {profileBadges.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" /> Badges
          </h2>
          <div className="flex flex-wrap gap-3">
            {profileBadges.map(b => (
              <div key={b.id} className="flex items-center gap-2 bg-gray-800 rounded-xl px-3 py-2">
                <span>{b.icon}</span>
                <span className={`text-sm font-medium ${b.color}`}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Trophy, label: 'Achievements', value: profile.achievements?.length || 0 },
          { icon: Code2, label: 'Projects', value: 0 },
          { icon: Users, label: 'Collaborations', value: 0 },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="card text-center">
            <Icon className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
