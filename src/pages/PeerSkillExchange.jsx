import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRightLeft, Search, Plus, MessageSquare, Loader2, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { subscribeToSkillExchanges, createSkillExchange } from '../services/firebaseService'
import { SkeletonCard } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { useNavigate } from 'react-router-dom'
import { spring, staggerContainer, staggerItem } from '../lib/motion'

function ExchangeCard({ exchange, currentUserId }) {
  const navigate = useNavigate()
  const isAuthor = exchange.authorId === currentUserId

  return (
    <motion.div
      variants={staggerItem}
      layout
      whileHover={{ y: -4, boxShadow: 'var(--shadow-md)' }}
      transition={spring.smooth}
      className="card flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            {exchange.authorName?.[0]}
          </div>
          <div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{exchange.authorName}</h3>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>wants to barter skills</p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3">
        <div className="rounded-xl p-3" style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <p className="text-xs font-medium mb-1.5" style={{ color: '#10b981' }}>I can teach you:</p>
          <div className="flex flex-wrap gap-1.5">
            {(exchange.offerSkills || (exchange.offerSkill ? [exchange.offerSkill] : [])).map(s => (
              <span key={s} className="tag">{s}</span>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <div className="p-2 rounded-full" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <ArrowRightLeft className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
          </div>
        </div>

        <div className="rounded-xl p-3" style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <p className="text-xs font-medium mb-1.5" style={{ color: '#6366f1' }}>If you teach me:</p>
          <div className="flex flex-wrap gap-1.5">
            {(exchange.wantedSkills || (exchange.wantSkill ? [exchange.wantSkill] : [])).map(s => (
              <span key={s} className="tag">{s}</span>
            ))}
          </div>
        </div>
      </div>

      {exchange.description && (
        <p className="text-xs mt-4 line-clamp-2" style={{ color: 'var(--text-tertiary)' }}>{exchange.description}</p>
      )}

      <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        {!isAuthor ? (
          <motion.button
            onClick={() => navigate(`/messages?userId=${exchange.authorId}`)}
            whileHover={{ y: -1, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}
            whileTap={{ scale: 0.97 }}
            transition={spring.snappy}
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2"
          >
            <MessageSquare className="w-4 h-4" /> Send Request
          </motion.button>
        ) : (
          <p className="text-xs text-center py-1" style={{ color: 'var(--text-tertiary)' }}>This is your listing</p>
        )}
      </div>
    </motion.div>
  )
}

export default function PeerSkillExchange() {
  const { user, profile } = useAuth()
  const [exchanges, setExchanges] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ offerSkills: '', wantedSkills: '', description: '' })
  const [search, setSearch] = useState('')
  const [showMatches, setShowMatches] = useState(false)

  useEffect(() => {
    const unsub = subscribeToSkillExchanges(data => { setExchanges(data); setLoading(false) })
    return unsub
  }, [])

  const handleCreate = async () => {
    if (!form.offerSkills || !form.wantedSkills) return
    setSubmitting(true)
    await createSkillExchange({
      offerSkills: form.offerSkills.split(',').map(s => s.trim()).filter(Boolean),
      wantedSkills: form.wantedSkills.split(',').map(s => s.trim()).filter(Boolean),
      description: form.description,
      authorId: user.uid,
      authorName: profile?.fullName,
    })
    setForm({ offerSkills: '', wantedSkills: '', description: '' })
    setShowModal(false)
    setSubmitting(false)
  }

  const filtered = exchanges.filter(e => {
    if (!search) return true
    const q = search.toLowerCase()
    const offer = e.offerSkills || (e.offerSkill ? [e.offerSkill] : [])
    const wanted = e.wantedSkills || (e.wantSkill ? [e.wantSkill] : [])
    return offer.some(s => s.toLowerCase().includes(q)) || wanted.some(s => s.toLowerCase().includes(q))
  })

  const displayExchanges = showMatches && profile?.skills ? filtered.filter(e =>
    e.wantedSkills?.some(ws => profile.skills.includes(ws)) || e.offerSkills?.some(os => profile.studyInterests?.includes(os))
  ) : filtered

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
            <ArrowRightLeft className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
            Peer Skill Exchange
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Barter your skills with other students. Teach what you know, learn what you don't.</p>
        </div>
        <motion.button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
          whileHover={{ y: -1, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}
          whileTap={{ scale: 0.97 }}
          transition={spring.snappy}
        >
          <Plus className="w-4 h-4" /> Create Listing
        </motion.button>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-placeholder)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search for skills..." className="input-field pl-10" />
        </div>
        <motion.button
          onClick={() => setShowMatches(!showMatches)}
          whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
          className="btn-secondary flex items-center gap-2"
          style={showMatches ? { borderColor: 'rgba(245,158,11,0.5)', color: '#f59e0b' } : {}}
        >
          <Sparkles className="w-4 h-4" /> {showMatches ? 'All Listings' : 'Match Me'}
        </motion.button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : displayExchanges.length === 0 ? (
        <EmptyState
          icon={ArrowRightLeft}
          title={showMatches ? 'No perfect matches found' : 'No listings yet'}
          description={showMatches ? 'Try updating your profile skills or search manually.' : 'Be the first to offer a skill exchange!'}
        />
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayExchanges.map(e => <ExchangeCard key={e.id} exchange={e} currentUserId={user?.uid} />)}
        </motion.div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Skill Exchange">
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#10b981' }}>I can teach... (comma separated) *</label>
            <input value={form.offerSkills} onChange={e => setForm(f => ({ ...f, offerSkills: e.target.value }))} placeholder="e.g. React, Tailwind, Figma" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#6366f1' }}>If you teach me... (comma separated) *</label>
            <input value={form.wantedSkills} onChange={e => setForm(f => ({ ...f, wantedSkills: e.target.value }))} placeholder="e.g. Python, Machine Learning, DSA" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Details (Optional)</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Any specifics about how you prefer to learn/teach?" rows={3} className="input-field resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <motion.button
              onClick={handleCreate}
              disabled={submitting || !form.offerSkills || !form.wantedSkills}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Post Listing
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
