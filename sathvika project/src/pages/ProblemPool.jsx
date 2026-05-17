import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, Plus, ThumbsUp, MessageSquare, CheckCircle2, Tag, Eye, EyeOff, X, Loader2, Send } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  subscribeToposts, createPost, upvotePost, removeUpvote,
  markSolved, addComment, subscribeToComments,
} from '../services/firebaseService'
import { SkeletonCard } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'

const TAGS = ['DSA', 'React', 'DBMS', 'OS', 'Networks', 'AI/ML', 'Python', 'Java', 'Algorithms', 'System Design', 'Other']

function CommentSection({ postId }) {
  const { user, profile } = useAuth()
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const unsub = subscribeToComments(postId, setComments)
    return unsub
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
      {comments.map(c => (
        <div key={c.id} className="bg-gray-800/50 rounded-lg px-3 py-2">
          <p className="text-xs font-medium text-indigo-400">{c.authorName}</p>
          <p className="text-sm text-gray-300 mt-0.5">{c.text}</p>
        </div>
      ))}
      <div className="flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Add a comment..." className="input-field flex-1 text-xs py-2" />
        <button onClick={submit} disabled={loading || !text.trim()} className="btn-primary px-3 py-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
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
    <motion.div layout className="card hover:border-gray-700 transition-all cursor-pointer" onClick={() => onExpand(post.id)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {post.solved && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
            <h3 className="font-semibold text-white text-sm">{post.title}</h3>
          </div>
          <p className="text-xs text-gray-500">
            {post.anonymous ? '🎭 Anonymous' : post.authorName} ·{' '}
            {post.createdAt?.toDate?.().toLocaleDateString?.() || 'just now'}
          </p>
        </div>
        {post.solved && <span className="badge bg-emerald-900/40 text-emerald-400 text-xs">Solved</span>}
      </div>

      {post.description && (
        <p className={`text-gray-400 text-sm mt-2 ${expanded ? '' : 'line-clamp-2'}`}>{post.description}</p>
      )}

      {post.tags?.length > 0 && (
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {post.tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      )}

      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-800">
        <button onClick={handleUpvote}
          className={`flex items-center gap-1.5 text-xs transition-colors ${hasUpvoted ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}>
          <ThumbsUp className="w-3.5 h-3.5" /> {post.upvotes?.length || 0}
        </button>
        <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300">
          <MessageSquare className="w-3.5 h-3.5" /> Reply
        </button>
        {!post.solved && post.authorId === user?.uid && (
          <button onClick={handleSolve} className="flex items-center gap-1.5 text-xs text-emerald-500 hover:text-emerald-400 ml-auto">
            <CheckCircle2 className="w-3.5 h-3.5" /> Mark Solved
          </button>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-800"
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
    const unsub = subscribeToposts(data => { setPosts(data); setLoading(false) })
    return unsub
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Problem Pool</h1>
          <p className="text-gray-400 text-sm mt-1">Ask questions anonymously, get help from peers</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Ask Question
        </button>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        <button onClick={() => setFilterTag('')}
          className={`tag cursor-pointer ${!filterTag ? 'bg-indigo-600/40 border-indigo-500' : ''}`}>
          All
        </button>
        {TAGS.map(t => (
          <button key={t} onClick={() => setFilterTag(t === filterTag ? '' : t)}
            className={`tag cursor-pointer ${filterTag === t ? 'bg-indigo-600/40 border-indigo-500' : ''}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={HelpCircle} title="No questions yet"
          description="Be the first to ask! No judgment here."
          action={<button onClick={() => setShowModal(true)} className="btn-primary mt-2">Ask a Question</button>} />
      ) : (
        <div className="space-y-4">
          {filtered.map(p => (
            <PostCard key={p.id} post={p}
              expanded={expanded === p.id}
              onExpand={id => setExpanded(expanded === id ? null : id)} />
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Ask a Question">
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Question Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="What's your question?" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Provide more context..." rows={4} className="input-field resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(t => (
                <button key={t} onClick={() => toggleTag(t)}
                  className={`tag cursor-pointer ${form.tags.includes(t) ? 'bg-indigo-600/40 border-indigo-500' : ''}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${form.anonymous ? 'bg-indigo-600 border-indigo-600' : 'border-gray-600'}`}>
              {form.anonymous && <span className="text-white text-xs">✓</span>}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-200 flex items-center gap-2">
                <EyeOff className="w-4 h-4" /> Post Anonymously
              </p>
              <p className="text-xs text-gray-500">Your identity will be hidden</p>
            </div>
            <input type="checkbox" className="hidden" checked={form.anonymous}
              onChange={e => setForm(f => ({ ...f, anonymous: e.target.checked }))} />
          </label>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={submit} disabled={submitting || !form.title.trim()}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {submitting ? 'Posting...' : 'Post Question'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
