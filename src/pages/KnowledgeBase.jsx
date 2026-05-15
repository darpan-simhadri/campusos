import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Search, Plus, Loader2, ThumbsUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { subscribeToKnowledgeBase, createKnowledgeResource } from '../services/firebaseService'
import { SkeletonCard } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '../firebase/config'
import ReactMarkdown from 'react-markdown'
import { spring, staggerContainer, staggerItem } from '../lib/motion'

const CATEGORIES = ["All", "DBMS", "React", "DSA", "OS", "AI", "Placement Prep"]

function ResourceCard({ resource, currentUserId }) {
  const hasUpvoted = resource.upvotes?.includes(currentUserId)
  const [expanded, setExpanded] = useState(false)

  const handleToggleVote = () => {
    const ref = doc(db, 'knowledgeBase', resource.id)
    if (hasUpvoted) updateDoc(ref, { upvotes: arrayRemove(currentUserId) })
    else updateDoc(ref, { upvotes: arrayUnion(currentUserId) })
  }

  return (
    <motion.div
      variants={staggerItem}
      layout
      whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }}
      transition={spring.smooth}
      className="card"
    >
      <div className="flex gap-4">
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <motion.button
            onClick={handleToggleVote}
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.85 }} transition={spring.bouncy}
            className="p-2 rounded-xl"
            style={{
              background: hasUpvoted ? 'var(--bg-secondary)' : 'transparent',
              color: hasUpvoted ? 'var(--text-primary)' : 'var(--text-tertiary)',
            }}
          >
            <ThumbsUp className="w-5 h-5" />
          </motion.button>
          <span className="font-bold text-sm" style={{ color: hasUpvoted ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
            {resource.upvotes?.length || 0}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{resource.title}</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Contributed by {resource.authorName}</p>
            </div>
            <span className="badge font-medium whitespace-nowrap"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              {resource.category}
            </span>
          </div>

          {resource.description && (
            <p className="text-sm italic mb-4" style={{ color: 'var(--text-tertiary)' }}>{resource.description}</p>
          )}

          <div className="relative rounded-xl p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <div className={`text-sm ${!expanded ? 'line-clamp-4' : ''}`} style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              <ReactMarkdown>{resource.content}</ReactMarkdown>
            </div>
            {!expanded && (
              <div className="absolute bottom-0 left-0 right-0 h-10 rounded-b-xl"
                style={{ background: 'linear-gradient(to top, var(--bg-secondary), transparent)' }} />
            )}
          </div>

          <motion.button
            onClick={() => setExpanded(!expanded)}
            whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
            className="text-xs font-medium mt-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            {expanded ? 'Show Less' : 'Read Full Document'}
          </motion.button>

          {resource.tags && resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              {resource.tags.map(tag => <span key={tag} className="tag text-[10px] py-0.5">{tag}</span>)}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function KnowledgeBase() {
  const { user, profile } = useAuth()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [form, setForm] = useState({ title: '', description: '', content: '', category: 'DSA', tags: '' })

  useEffect(() => {
    const cat = category === 'All' ? null : category
    const unsub = subscribeToKnowledgeBase(data => { setResources(data); setLoading(false) }, cat)
    return unsub
  }, [category])

  const handleCreate = async () => {
    if (!form.title || !form.content) return
    setSubmitting(true)
    await createKnowledgeResource({
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      authorId: user.uid,
      authorName: profile?.fullName,
      upvotes: [],
    })
    setForm({ title: '', description: '', content: '', category: 'DSA', tags: '' })
    setShowModal(false)
    setSubmitting(false)
  }

  const filteredResources = resources.filter(r =>
    r.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
            <BookOpen className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
            Permanent Knowledge Base
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Preserving valuable academic discussions, notes, and resources permanently.</p>
        </div>
        <motion.button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
          whileHover={{ y: -1, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}
          whileTap={{ scale: 0.97 }}
          transition={spring.snappy}
        >
          <Plus className="w-4 h-4" /> Add Resource
        </motion.button>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-placeholder)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search notes, algorithms, cheatsheets..."
            className="input-field pl-10" />
        </div>
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
          {CATEGORIES.map(cat => {
            const active = category === cat
            return (
              <motion.button
                key={cat}
                onClick={() => setCategory(cat)}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={spring.snappy}
                className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
                style={{
                  background: active ? 'var(--text-primary)' : 'var(--bg-secondary)',
                  color: active ? 'var(--bg-card)' : 'var(--text-secondary)',
                  border: active ? '1px solid var(--text-primary)' : '1px solid var(--border)',
                }}
              >
                {cat}
              </motion.button>
            )
          })}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">{Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : filteredResources.length === 0 ? (
        <EmptyState icon={BookOpen} title={`No resources in ${category}`} description="Be the first to contribute a resource to this category!" />
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
          {filteredResources.map(resource => (
            <ResourceCard key={resource.id} resource={resource} currentUserId={user?.uid} />
          ))}
        </motion.div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Contribute Knowledge">
        <div className="p-6 space-y-4 w-full max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Resource Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Complete Graph Algorithms" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Category *</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Short Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief summary of what this covers..." className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Content (Markdown Supported) *</label>
            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="# Heading 1&#10;## Subheading&#10;Write your notes here..." rows={8} className="input-field resize-y font-mono text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tags (comma separated)</label>
            <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="Dijkstra, MST, Graphs" className="input-field" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <motion.button
              onClick={handleCreate}
              disabled={submitting || !form.title || !form.content}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Publish Resource
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
