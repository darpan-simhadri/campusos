import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, ThumbsUp, Plus, Loader2, Bot, BrainCircuit, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { subscribeToIdeas, createIdea, upvoteIdea, removeIdeaUpvote, updateIdeaAIAnalysis } from '../services/firebaseService'
import { askOllama } from '../services/aiService'
import { SkeletonCard } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import ReactMarkdown from 'react-markdown'
import { CommentSection } from '../components/ui/CommentSection'
import { spring, staggerContainer, staggerItem } from '../lib/motion'

function IdeaCard({ idea, currentUserId }) {
  const [analyzing, setAnalyzing] = useState(false)
  const [aiError, setAiError] = useState('')
  const hasUpvoted = idea.upvotes?.includes(currentUserId)

  const handleToggleVote = () => {
    if (hasUpvoted) removeIdeaUpvote(idea.id, currentUserId)
    else upvoteIdea(idea.id, currentUserId)
  }

  const handleAIEvaluate = async () => {
    if (idea.aiAnalysis || analyzing) return
    setAnalyzing(true)
    setAiError('')
    const prompt = `Analyze this student startup idea for feasibility, technical complexity, and market viability on a campus scale. Keep it concise (3-4 short bullet points).\nIdea Title: ${idea.title}\nDescription: ${idea.description}`
    try {
      const result = await askOllama(prompt, "You are an expert startup advisor for college students.")
      await updateIdeaAIAnalysis(idea.id, result)
    } catch (e) {
      setAiError('Ollama is not running. Start Ollama locally to use AI evaluation.')
    }
    setAnalyzing(false)
  }

  return (
    <motion.div
      variants={staggerItem}
      layout
      whileHover={{ y: -3, boxShadow: 'var(--shadow-md)' }}
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
            {idea.upvotes?.length || 0}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {idea.title}
              </h3>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Pitched by {idea.authorName}</p>
            </div>
            {idea.tags && (
              <div className="flex flex-wrap gap-1.5 justify-end">
                {idea.tags.map(tag => <span key={tag} className="tag text-[10px] py-0.5">{tag}</span>)}
              </div>
            )}
          </div>

          <p className="text-sm mt-3" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{idea.description}</p>

          <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
            <div />
            {!idea.aiAnalysis ? (
              <motion.button
                onClick={handleAIEvaluate}
                disabled={analyzing}
                whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
                className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-2"
              >
                {analyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BrainCircuit className="w-3.5 h-3.5" />}
                {analyzing ? 'Evaluating...' : 'AI Evaluate'}
              </motion.button>
            ) : (
              <span className="text-xs font-medium flex items-center gap-1" style={{ color: '#10b981' }}>
                <CheckCircle2 className="w-3.5 h-3.5" /> AI Evaluated
              </span>
            )}
          </div>

          {aiError && (
            <div className="mt-2 flex items-center gap-2 text-xs rounded-xl px-3 py-2"
              style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {aiError}
            </div>
          )}

          <CommentSection collectionName="ideas" docId={idea.id} />

          {idea.aiAnalysis && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mt-4 rounded-xl p-4"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2 mb-2 pb-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <Bot className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  AI Feasibility Report
                </span>
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                <ReactMarkdown>{idea.aiAnalysis}</ReactMarkdown>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function IdeaValidation() {
  const { user, profile } = useAuth()
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', tags: '' })
  const [filter, setFilter] = useState('trending')

  useEffect(() => {
    return subscribeToIdeas(data => { setIdeas(data); setLoading(false) })
  }, [])

  const handleCreate = async () => {
    if (!form.title || !form.description) return
    setSubmitting(true)
    await createIdea({
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      authorId: user.uid,
      authorName: profile?.fullName,
      upvotes: [],
    })
    setForm({ title: '', description: '', tags: '' })
    setShowModal(false)
    setSubmitting(false)
  }

  const sortedIdeas = [...ideas].sort((a, b) => {
    if (filter === 'trending') return (b.upvotes?.length || 0) - (a.upvotes?.length || 0)
    return b.createdAt - a.createdAt
  })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
            <Lightbulb className="w-6 h-6" style={{ color: '#f59e0b' }} />
            Idea Validation
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Pitch your startup ideas, get community votes, and receive instant AI feasibility reports.
          </p>
        </div>
        <motion.button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
          whileHover={{ y: -1, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}
          whileTap={{ scale: 0.97 }}
          transition={spring.snappy}
        >
          <Plus className="w-4 h-4" /> Pitch Idea
        </motion.button>
      </motion.div>

      <div className="flex gap-2 mb-6 pb-2" style={{ borderBottom: '1px solid var(--border)' }}>
        {[{ id: 'trending', label: 'Trending' }, { id: 'recent', label: 'Recent' }].map(f => (
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
      ) : sortedIdeas.length === 0 ? (
        <EmptyState icon={Lightbulb} title="No ideas pitched yet" description="Be the first to pitch a startup idea to the campus!" />
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
          {sortedIdeas.map(idea => (
            <IdeaCard key={idea.id} idea={idea} currentUserId={user?.uid} />
          ))}
        </motion.div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Pitch Startup Idea">
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Idea Name *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. CampusOS" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>The Pitch / Problem you're solving *</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Explain what it does, who it's for, and why it's needed..." rows={4} className="input-field resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tags (comma separated)</label>
            <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              placeholder="SaaS, EdTech, AI" className="input-field" />
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
              Publish Pitch
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
