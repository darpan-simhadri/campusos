import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle2, Clock, MessageSquare, HandHeart, Loader2 } from 'lucide-react'
import { CommentSection } from '../components/ui/CommentSection'
import { useAuth } from '../context/AuthContext'
import { subscribeToSOSPosts, createSOSPost, claimSOSPost, resolveSOSPost } from '../services/firebaseService'
import { SkeletonCard } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { useNavigate } from 'react-router-dom'
import { spring, staggerContainer, staggerItem } from '../lib/motion'

function SOSCard({ post, currentUserId, onClaim, onResolve }) {
  const navigate = useNavigate()
  const isAuthor = post.authorId === currentUserId
  const isHelper = post.helperId === currentUserId

  const borderColor = post.resolved ? '#10b981' : post.status === 'claimed' ? '#f59e0b' : '#ef4444'
  const statusBg = post.resolved ? 'rgba(16,185,129,0.1)' : post.status === 'claimed' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)'
  const statusColor = post.resolved ? '#10b981' : post.status === 'claimed' ? '#f59e0b' : '#ef4444'
  const statusBorder = post.resolved ? 'rgba(16,185,129,0.2)' : post.status === 'claimed' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'

  return (
    <motion.div
      variants={staggerItem}
      layout
      whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }}
      transition={spring.smooth}
      exit={{ opacity: 0, scale: 0.95 }}
      className="card"
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>{post.title}</h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Posted by {post.authorName}</p>
        </div>
        <span className="badge text-xs flex items-center gap-1 font-medium"
          style={{ background: statusBg, color: statusColor, border: `1px solid ${statusBorder}` }}>
          {post.resolved
            ? <><CheckCircle2 className="w-3 h-3" /> Resolved</>
            : post.status === 'claimed'
            ? <><Clock className="w-3 h-3" /> Claimed by {post.helperName}</>
            : <><AlertCircle className="w-3 h-3" /> URGENT</>}
        </span>
      </div>

      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{post.description}</p>

      {post.tags && post.tags.length > 0 && (
        <div className="flex gap-2 mb-4">
          {post.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
        </div>
      )}

      <CommentSection collectionName="sosPosts" docId={post.id} />

      <div className="flex items-center justify-end gap-3 pt-4 mt-2" style={{ borderTop: '1px solid var(--border)' }}>
        {!post.resolved && !post.status && !isAuthor && (
          <motion.button
            onClick={() => onClaim(post.id)}
            whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
            className="btn-primary py-1.5 px-4 text-sm flex items-center gap-2"
          >
            <HandHeart className="w-4 h-4" /> I Can Help
          </motion.button>
        )}
        {!post.resolved && post.status === 'claimed' && (isAuthor || isHelper) && (
          <>
            <motion.button
              onClick={() => navigate(`/messages?userId=${isAuthor ? post.helperId : post.authorId}`)}
              whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
              className="btn-secondary py-1.5 px-4 text-sm flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" /> Message {isAuthor ? 'Helper' : 'Author'}
            </motion.button>
            {isAuthor && (
              <motion.button
                onClick={() => onResolve(post.id)}
                whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
                className="btn-primary py-1.5 px-4 text-sm flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark Resolved
              </motion.button>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}

export default function SOSBoard() {
  const { user, profile } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', tags: '' })
  const [filter, setFilter] = useState('active')

  useEffect(() => {
    const unsub = subscribeToSOSPosts(data => { setPosts(data); setLoading(false) })
    return unsub
  }, [])

  const handleCreate = async () => {
    if (!form.title || !form.description) return
    setSubmitting(true)
    await createSOSPost({
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      authorId: user.uid,
      authorName: profile?.fullName,
      status: null,
      resolved: false,
    })
    setForm({ title: '', description: '', tags: '' })
    setShowModal(false)
    setSubmitting(false)
  }

  const handleClaim = (id) => claimSOSPost(id, user.uid, profile.fullName)
  const handleResolve = (id) => resolveSOSPost(id)

  const activePosts = posts.filter(p => !p.resolved)
  const resolvedPosts = posts.filter(p => p.resolved)
  const displayPosts = filter === 'active' ? activePosts : resolvedPosts

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
            <AlertCircle className="w-6 h-6" style={{ color: '#ef4444' }} />
            The Stuck SOS Board
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Broadcast urgent roadblocks to the entire campus for immediate help.</p>
        </div>
        <motion.button
          onClick={() => setShowModal(true)}
          whileHover={{ y: -1, boxShadow: '0 4px 14px rgba(239,68,68,0.25)' }}
          whileTap={{ scale: 0.97 }}
          transition={spring.snappy}
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
        >
          Broadcast SOS
        </motion.button>
      </motion.div>

      <div className="flex gap-2 mb-6 pb-2" style={{ borderBottom: '1px solid var(--border)' }}>
        {[
          { id: 'active', label: `Active SOS (${activePosts.length})` },
          { id: 'resolved', label: `Resolved (${resolvedPosts.length})` },
        ].map(f => (
          <motion.button
            key={f.id}
            onClick={() => setFilter(f.id)}
            whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
            className="px-4 py-2 font-medium text-sm"
            style={{
              color: filter === f.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
              borderBottom: `2px solid ${filter === f.id ? 'var(--text-primary)' : 'transparent'}`,
              marginBottom: -1,
            }}
          >
            {f.label}
          </motion.button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : displayPosts.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title={filter === 'active' ? 'Campus is clear!' : 'No resolved SOS yet'}
          description={filter === 'active' ? 'Nobody is currently stuck. Keep up the good work!' : ''}
        />
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
          <AnimatePresence>
            {displayPosts.map(p => (
              <SOSCard key={p.id} post={p} currentUserId={user?.uid} onClaim={handleClaim} onResolve={handleResolve} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Broadcast SOS Alert">
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 rounded-xl px-3 py-3"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#ef4444' }} />
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Only use the SOS board for critical blockers where you are completely stuck. This alerts the community.</p>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>What are you stuck on? *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Firebase Auth CORS error in React" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Details / Code Context *</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the error, what you tried, etc..." rows={4} className="input-field resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tags (comma separated)</label>
            <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="React, Firebase, Urgent" className="input-field" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <motion.button
              onClick={handleCreate}
              disabled={submitting || !form.title || !form.description}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Broadcast Now
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
