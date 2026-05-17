import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Plus, Heart, MessageSquare, Star, Loader2, BadgeCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { subscribeToAchievements, createAchievement, likeAchievement } from '../services/firebaseService'
import { SkeletonCard } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'

const ACH_TYPES = ['Hackathon', 'Internship', 'Certification', 'Research', 'Competition', 'Project', 'Award', 'Other']
const TYPE_ICONS = { Hackathon: '🏆', Internship: '💼', Certification: '📜', Research: '🔬', Competition: '🥇', Project: '🚀', Award: '🎖️', Other: '⭐' }

function AchCard({ ach, uid, onLike }) {
  const liked = ach.likes?.includes(uid)
  return (
    <motion.div whileHover={{ y: -2 }} className="card hover:border-gray-700 transition-all">
      <div className="flex items-start gap-3">
        <span className="text-3xl">{TYPE_ICONS[ach.type] || '⭐'}</span>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-white">{ach.title}</h3>
              <p className="text-indigo-400 text-xs font-medium mt-0.5">{ach.type}</p>
            </div>
            {ach.verified && (
              <span className="flex items-center gap-1 badge bg-emerald-900/40 text-emerald-400 text-xs">
                <BadgeCheck className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
          <p className="text-sm text-gray-300 mt-1">{ach.authorName}</p>
        </div>
      </div>

      {ach.description && <p className="text-gray-400 text-sm mt-3">{ach.description}</p>}
      {ach.organization && <p className="text-xs text-gray-500 mt-1">@ {ach.organization}</p>}

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-800">
        <button onClick={() => onLike(ach.id)}
          className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'}`}>
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          {ach.likes?.length || 0}
        </button>
        <span className="flex items-center gap-1.5 text-sm text-gray-500">
          <MessageSquare className="w-4 h-4" /> {ach.comments || 0}
        </span>
      </div>
    </motion.div>
  )
}

export default function AchievementWall() {
  const { user, profile } = useAuth()
  const [achs, setAchs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState('')
  const [form, setForm] = useState({ title: '', type: '', description: '', organization: '' })

  useEffect(() => {
    const unsub = subscribeToAchievements(data => { setAchs(data); setLoading(false) })
    return unsub
  }, [])

  const handleLike = (id) => likeAchievement(id, user.uid)

  const handleCreate = async () => {
    if (!form.title || !form.type) return
    setSubmitting(true)
    await createAchievement({ ...form, authorId: user.uid, authorName: profile?.fullName, likes: [], verified: false })
    setForm({ title: '', type: '', description: '', organization: '' })
    setShowModal(false)
    setSubmitting(false)
  }

  const filtered = filter ? achs.filter(a => a.type === filter) : achs

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Achievement Wall</h1>
          <p className="text-gray-400 text-sm mt-1">Celebrate your wins with the campus community</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Achievement
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter('')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${!filter ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
          All
        </button>
        {ACH_TYPES.map(t => (
          <button key={t} onClick={() => setFilter(filter === t ? '' : t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === t ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
            {TYPE_ICONS[t]} {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Trophy} title="No achievements yet"
          description="Be the first to share your win!"
          action={<button onClick={() => setShowModal(true)} className="btn-primary mt-2">Add Achievement</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(a => <AchCard key={a.id} ach={a} uid={user?.uid} onLike={handleLike} />)}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Share Achievement">
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Won HackIndia 2024" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Type *</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field">
              <option value="">Select Type</option>
              {ACH_TYPES.map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Organization / Event</label>
            <input value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))}
              placeholder="e.g. Google, IIT Delhi Hackathon" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Tell us about your achievement..." rows={3} className="input-field resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleCreate} disabled={submitting || !form.title || !form.type}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Share Achievement
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
