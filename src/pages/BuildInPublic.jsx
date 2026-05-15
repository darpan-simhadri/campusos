import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, Heart, Plus, Loader2, Link as LinkIcon, Github } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { subscribeToBuildUpdates, createBuildUpdate } from '../services/firebaseService'
import { SkeletonCard } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '../firebase/config'
import ReactMarkdown from 'react-markdown'
import { CommentSection } from '../components/ui/CommentSection'

function BuildCard({ update, currentUserId }) {
  const hasLiked = update.likes?.includes(currentUserId)

  const handleToggleLike = () => {
    const ref = doc(db, 'buildUpdates', update.id)
    if (hasLiked) {
      updateDoc(ref, { likes: arrayRemove(currentUserId) })
    } else {
      updateDoc(ref, { likes: arrayUnion(currentUserId) })
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, boxShadow: 'var(--shadow-md)' }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="card"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            {update.authorName?.[0]}
          </div>
          <div>
            <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{update.title}</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Built by {update.authorName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {update.projectLink && (
            <a href={update.projectLink} target="_blank" rel="noreferrer"
              className="p-1.5 rounded-lg"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
            >
              {update.projectLink.includes('github.com') ? <Github className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
            </a>
          )}
        </div>
      </div>

      <div className="text-sm mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        <ReactMarkdown>{update.description}</ReactMarkdown>
      </div>

      {update.tags && update.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {update.tags.map(tag => <span key={tag} className="tag text-[10px] py-0.5">{tag}</span>)}
        </div>
      )}

      <div className="flex items-center gap-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <motion.button
          onClick={handleToggleLike}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.85 }}
          transition={{ type: 'spring', stiffness: 420, damping: 22 }}
          className="flex items-center gap-1.5 text-xs font-medium"
          style={{ color: hasLiked ? '#ef4444' : 'var(--text-tertiary)' }}
        >
          <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
          {update.likes?.length || 0}
        </motion.button>
      </div>
      <CommentSection collectionName="buildUpdates" docId={update.id} />
    </motion.div>
  )
}

export default function BuildInPublic() {
  const { user, profile } = useAuth()
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', tags: '', projectLink: '' })

  useEffect(() => {
    const unsub = subscribeToBuildUpdates(data => { setUpdates(data); setLoading(false) })
    return unsub
  }, [])

  const handleCreate = async () => {
    if (!form.title || !form.description) return
    setSubmitting(true)
    await createBuildUpdate({
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      authorId: user.uid,
      authorName: profile?.fullName,
      likes: [],
    })
    setForm({ title: '', description: '', tags: '', projectLink: '' })
    setShowModal(false)
    setSubmitting(false)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
            <Rocket className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
            Build in Public
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Share your progress, post build logs, and show the campus what you are working on.</p>
        </div>
        <motion.button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
          whileHover={{ y: -1, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 340, damping: 30 }}
        >
          <Plus className="w-4 h-4" /> Post Update
        </motion.button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : updates.length === 0 ? (
        <EmptyState icon={Rocket} title="No updates yet" description="Be the first to share what you're building!" />
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {updates.map(update => (
              <BuildCard key={update.id} update={update} currentUserId={user?.uid} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Post Build Update">
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>What did you accomplish? *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Finished the database schema" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Build Log (Markdown Supported) *</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Share the technical details, challenges faced, or code snippets..." rows={6} className="input-field resize-y font-mono text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Project Link (Optional)</label>
              <input value={form.projectLink} onChange={e => setForm(f => ({ ...f, projectLink: e.target.value }))} placeholder="https://github.com/..." className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tags</label>
              <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="React, Node, etc." className="input-field" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleCreate} disabled={submitting || !form.title || !form.description} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Post Log
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
