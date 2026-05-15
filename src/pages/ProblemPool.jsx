import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, Plus, ThumbsUp, MessageSquare, CheckCircle2, EyeOff, Loader2, Send } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  subscribeToposts, createPost, upvotePost, removeUpvote,
  markSolved, addComment, subscribeToComments,
} from '../services/firebaseService'
import { SkeletonCard } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { spring, staggerContainer, staggerItem } from '../lib/motion'

const TAGS = ['DSA', 'React', 'DBMS', 'OS', 'Networks', 'AI/ML', 'Python', 'Java', 'Algorithms', 'System Design', 'Other']

function CommentSection({ postId }) {
  const { user, profile } = useAuth()
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    return subscribeToComments(postId, setComments)
  }, [postId])

  const submit = async () => {
    if (!text.trim()) return
    setLoading(true)
    await addComment(postId, { text, authorId: user.uid, authorName: profile?.fullName })
    setText('')
    setLoading(false)
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {comments.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, ...spring.smooth }}
            className="rounded-xl px-3 py-2.5"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-secondary)' }}>{c.authorName}</p>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{c.text}</p>
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Add a comment..."
          className="input-field flex-1 text-xs py-2"
        />
        <motion.button
          onClick={submit}
          disabled={loading || !text.trim()}
          className="btn-primary px-3 py-2"
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={spring.snappy}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </motion.button>
      </div>
    </div>
  )
}

function PostCard({ post, onExpand, expanded }) {
  const { user } = useAuth()
  const hasUpvoted = post.upvotes?.includes(user?.uid)

  const handleUpvote = async (e) => {
    e.stopPropagation()
    if (!user) return
    if (hasUpvoted) await removeUpvote(post.id, user.uid)
    else await upvotePost(post.id, user.uid)
  }

  const handleSolve = async (e) => {
    e.stopPropagation()
    await markSolved(post.id)
  }

  return (
    <motion.div
      variants={staggerItem}
      layout
      whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }}
      transition={spring.smooth}
      className="card cursor-pointer"
      onClick={() => onExpand(post.id)}
      style={{ border: post.solved ? '1px solid rgba(16,185,129,0.2)' : undefined }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {post.solved && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={spring.bouncy}>
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#10b981' }} />
              </motion.div>
            )}
            <h3 className="font-semibold text-sm leading-snug truncate" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              {post.title}
            </h3>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {post.anonymous ? '🎭 Anonymous' : post.authorName} ·{' '}
            {post.createdAt?.toDate?.().toLocaleDateString?.() || 'just now'}
          </p>
        </div>
        {post.solved && (
          <span className="badge flex-shrink-0" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
            Solved
          </span>
        )}
      </div>

      {post.description && (
        <p className={`text-sm mt-2 ${expanded ? '' : 'line-clamp-2'}`} style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {post.description}
        </p>
      )}

      {post.tags?.length > 0 && (
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {post.tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      )}

      <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <motion.button
          onClick={handleUpvote}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} transition={spring.snappy}
          className="flex items-center gap-1.5 text-xs"
          style={{ color: hasUpvoted ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
        >
          <ThumbsUp className="w-3.5 h-3.5" /> {post.upvotes?.length || 0}
        </motion.button>
        <button className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          <MessageSquare className="w-3.5 h-3.5" /> Reply
        </button>
        {!post.solved && post.authorId === user?.uid && (
          <motion.button
            onClick={handleSolve}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} transition={spring.snappy}
            className="flex items-center gap-1.5 text-xs ml-auto"
            style={{ color: '#10b981' }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Solved
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 pt-4"
            style={{ borderTop: '1px solid var(--border)', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}
          >
            <CommentSection postId={post.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function ProblemPool() {
  const { user, profile } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [filterTag, setFilterTag] = useState('')
  const [form, setForm] = useState({ title: '', description: '', tags: [], anonymous: false })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    return subscribeToposts(data => { setPosts(data); setLoading(false) })
  }, [])

  const toggleTag = (t) => setForm(f => ({
    ...f, tags: f.tags.includes(t) ? f.tags.filter(x => x !== t) : [...f.tags, t]
  }))

  const submit = async () => {
    if (!form.title.trim()) return
    setSubmitting(true)
    await createPost({
      title: form.title, description: form.description, tags: form.tags,
      anonymous: form.anonymous, authorId: user.uid,
      authorName: form.anonymous ? 'Anonymous' : profile?.fullName,
      upvotes: [], solved: false,
    })
    setForm({ title: '', description: '', tags: [], anonymous: false })
    setShowModal(false)
    setSubmitting(false)
  }

  const filtered = filterTag ? posts.filter(p => p.tags?.includes(filterTag)) : posts

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>Problem Pool</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Ask questions anonymously, get help from peers</p>
        </div>
        <motion.button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
          whileHover={{ y: -1, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}
          whileTap={{ scale: 0.97 }}
          transition={spring.snappy}
        >
          <Plus className="w-4 h-4" /> Ask Question
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
        className="flex gap-2 flex-wrap mb-5"
      >
        {['All', ...TAGS].map(t => {
          const active = t === 'All' ? !filterTag : filterTag === t
          return (
            <motion.button
              key={t}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={spring.snappy}
              onClick={() => setFilterTag(t === 'All' ? '' : (filterTag === t ? '' : t))}
              className="tag cursor-pointer"
              style={{
                background: active ? 'var(--text-primary)' : 'var(--bg-secondary)',
                color: active ? 'var(--bg-card)' : 'var(--text-secondary)',
                border: active ? '1px solid var(--text-primary)' : '1px solid var(--border)',
              }}
            >
              {t}
            </motion.button>
          )
        })}
      </motion.div>

      {loading ? (
        <div className="space-y-4">{Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No questions yet"
          description="Be the first to ask! No judgment here."
          action={<button onClick={() => setShowModal(true)} className="btn-primary mt-2">Ask a Question</button>}
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {filtered.map(p => (
            <PostCard
              key={p.id}
              post={p}
              expanded={expanded === p.id}
              onExpand={id => setExpanded(expanded === id ? null : id)}
            />
          ))}
        </motion.div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Ask a Question">
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Question Title *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="What's your question?"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Provide more context..."
              rows={4}
              className="input-field resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Tags</label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(t => (
                <motion.button
                  key={t}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={spring.snappy}
                  onClick={() => toggleTag(t)}
                  className="tag cursor-pointer"
                  style={{
                    background: form.tags.includes(t) ? 'var(--text-primary)' : 'var(--bg-secondary)',
                    color: form.tags.includes(t) ? 'var(--bg-card)' : 'var(--text-secondary)',
                    border: form.tags.includes(t) ? '1px solid var(--text-primary)' : '1px solid var(--border)',
                  }}
                >
                  {t}
                </motion.button>
              ))}
            </div>
          </div>

          <motion.label
            whileHover={{ x: 2 }} transition={spring.snappy}
            className="flex items-center gap-3 cursor-pointer p-3 rounded-xl"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
          >
            <motion.div
              animate={form.anonymous ? { background: 'var(--text-primary)' } : { background: 'transparent' }}
              className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
              style={{ border: '2px solid var(--border-strong)' }}
            >
              <AnimatePresence>
                {form.anonymous && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    transition={spring.bouncy}
                    style={{ color: 'var(--bg-card)', fontSize: '0.7rem', fontWeight: 700 }}
                  >
                    ✓
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
            <div>
              <p className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <EyeOff className="w-4 h-4" /> Post Anonymously
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Your identity will be hidden</p>
            </div>
            <input
              type="checkbox"
              className="hidden"
              checked={form.anonymous}
              onChange={e => setForm(f => ({ ...f, anonymous: e.target.checked }))}
            />
          </motion.label>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <motion.button
              onClick={submit}
              disabled={submitting || !form.title.trim()}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {submitting ? 'Posting...' : 'Post Question'}
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
