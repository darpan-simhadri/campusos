import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Plus, Heart, Loader2, BadgeCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { subscribeToAchievements, createAchievement, likeAchievement } from '../services/firebaseService'
import { SkeletonCard } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { CommentSection } from '../components/ui/CommentSection'
import { spring, staggerContainer, staggerItem } from '../lib/motion'

const ACH_TYPES = ['Hackathon', 'Internship', 'Certification', 'Research', 'Competition', 'Project', 'Award', 'Other']
const TYPE_ICONS = { Hackathon: '🏆', Internship: '💼', Certification: '📜', Research: '🔬', Competition: '🥇', Project: '🚀', Award: '🎖️', Other: '⭐' }

function AchCard({ ach, uid, onLike }) {
  const liked = ach.likes?.includes(uid)
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4, boxShadow: 'var(--shadow-md)' }}
      transition={spring.smooth}
      className="card"
    >
      <div className="flex items-start gap-3">
        <motion.span
          whileHover={{ scale: 1.2, rotate: 5 }} transition={spring.bouncy}
          className="text-3xl flex-shrink-0"
        >
          {TYPE_ICONS[ach.type] || '⭐'}
        </motion.span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {ach.title}
              </h3>
              <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>{ach.type}</p>
            </div>
            {ach.verified && (
              <span
                className="badge text-xs flex items-center gap-1 flex-shrink-0"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
              >
                <BadgeCheck className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>{ach.authorName}</p>
        </div>
      </div>

      {ach.description && (
        <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{ach.description}</p>
      )}
      {ach.organization && (
        <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>@ {ach.organization}</p>
      )}

      <div className="flex items-center gap-4 mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <motion.button
          onClick={() => onLike(ach.id, liked)}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.85 }} transition={spring.bouncy}
          className="flex items-center gap-1.5 text-sm"
          style={{ color: liked ? '#ef4444' : 'var(--text-tertiary)' }}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          {ach.likes?.length || 0}
        </motion.button>
      </div>
      <CommentSection collectionName="achievements" docId={ach.id} />
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
    return subscribeToAchievements(data => { setAchs(data); setLoading(false) })
  }, [])

  const handleLike = (id, hasLiked) => likeAchievement(id, user.uid, hasLiked)

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
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>Achievement Wall</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Celebrate your wins with the campus community</p>
        </div>
        <motion.button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
          whileHover={{ y: -1, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}
          whileTap={{ scale: 0.97 }}
          transition={spring.snappy}
        >
          <Plus className="w-4 h-4" /> Add Achievement
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
        className="flex flex-wrap gap-2 mb-6"
      >
        {['All', ...ACH_TYPES].map(t => {
          const active = t === 'All' ? !filter : filter === t
          return (
            <motion.button
              key={t}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={spring.snappy}
              onClick={() => setFilter(t === 'All' ? '' : (filter === t ? '' : t))}
              className="px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{
                background: active ? 'var(--text-primary)' : 'var(--bg-secondary)',
                color: active ? 'var(--bg-card)' : 'var(--text-secondary)',
                border: active ? '1px solid var(--text-primary)' : '1px solid var(--border)',
              }}
            >
              {t !== 'All' && TYPE_ICONS[t]} {t}
            </motion.button>
          )
        })}
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No achievements yet"
          description="Be the first to share your win!"
          action={<button onClick={() => setShowModal(true)} className="btn-primary mt-2">Add Achievement</button>}
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filtered.map(a => <AchCard key={a.id} ach={a} uid={user?.uid} onLike={handleLike} />)}
        </motion.div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Share Achievement">
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Won HackIndia 2024" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Type *</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field">
              <option value="">Select Type</option>
              {ACH_TYPES.map(t => <option key={t} value={t}>{TYPE_ICONS[t]} {t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Organization / Event</label>
            <input value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))}
              placeholder="e.g. Google, IIT Delhi Hackathon" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Tell us about your achievement..." rows={3} className="input-field resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <motion.button
              onClick={handleCreate}
              disabled={submitting || !form.title || !form.type}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Share Achievement
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
