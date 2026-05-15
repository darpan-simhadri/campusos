import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Plus, Clock, Bookmark, BookmarkCheck, ExternalLink, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { subscribeToOpportunities, createOpportunity, saveOpportunity } from '../services/firebaseService'
import { SkeletonCard } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { OPPORTUNITY_TYPES } from '../data/constants'
import { spring, staggerContainer, staggerItem } from '../lib/motion'

const TYPE_STYLE = {
  Hackathon:     { bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6' },
  Workshop:      { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
  Internship:    { bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
  'Campus Event':{ bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  Placement:     { bg: 'rgba(239,68,68,0.1)',  color: '#ef4444' },
  Seminar:       { bg: 'rgba(99,102,241,0.1)', color: '#6366f1' },
  Competition:   { bg: 'rgba(236,72,153,0.1)', color: '#ec4899' },
  Research:      { bg: 'rgba(6,182,212,0.1)',  color: '#06b6d4' },
}

function OppCard({ opp, uid, onSave }) {
  const saved = opp.savedBy?.includes(uid)
  const typeStyle = TYPE_STYLE[opp.type] || { bg: 'var(--bg-secondary)', color: 'var(--text-secondary)' }

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4, boxShadow: 'var(--shadow-md)' }}
      transition={spring.smooth}
      className="card flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span
            className="badge text-xs mb-2 inline-block"
            style={{ background: typeStyle.bg, color: typeStyle.color, border: `1px solid ${typeStyle.color}22` }}
          >
            {opp.type}
          </span>
          <h3 className="font-semibold leading-snug" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {opp.title}
          </h3>
          {opp.company && (
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{opp.company}</p>
          )}
        </div>
        <motion.button
          onClick={() => onSave(opp.id)}
          whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.85 }} transition={spring.bouncy}
          className="p-2 rounded-lg flex-shrink-0"
          style={{ color: saved ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </motion.button>
      </div>

      {opp.description && (
        <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{opp.description}</p>
      )}

      <div className="flex items-center justify-between pt-3 mt-auto" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 text-xs">
          {opp.deadline && (
            <span className="flex items-center gap-1" style={{ color: '#f59e0b' }}>
              <Clock className="w-3.5 h-3.5" /> {opp.deadline}
            </span>
          )}
          {opp.stipend && (
            <span style={{ color: '#10b981', fontWeight: 500 }}>{opp.stipend}</span>
          )}
        </div>
        {opp.link && (
          <motion.a
            href={opp.link}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ x: 2 }} transition={spring.snappy}
            className="flex items-center gap-1 text-xs font-medium"
            style={{ color: 'var(--text-secondary)' }}
            onClick={e => e.stopPropagation()}
          >
            Apply <ExternalLink className="w-3 h-3" />
          </motion.a>
        )}
      </div>
    </motion.div>
  )
}

export default function Opportunities() {
  const { user, profile } = useAuth()
  const [opps, setOpps] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [savedOnly, setSavedOnly] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '', company: '', type: '', description: '',
    deadline: '', stipend: '', link: '',
  })

  useEffect(() => {
    return subscribeToOpportunities(data => { setOpps(data); setLoading(false) })
  }, [])

  const handleSave = (id) => {
    const opp = opps.find(o => o.id === id)
    const isSaved = opp?.savedBy?.includes(user.uid)
    saveOpportunity(id, user.uid, isSaved)
  }

  const handleCreate = async () => {
    if (!form.title || !form.type) return
    setSubmitting(true)
    await createOpportunity({ ...form, postedBy: user.uid, savedBy: [] })
    setForm({ title: '', company: '', type: '', description: '', deadline: '', stipend: '', link: '' })
    setShowModal(false)
    setSubmitting(false)
  }

  const filtered = opps.filter(o => {
    if (filter && o.type !== filter) return false
    if (savedOnly && !o.savedBy?.includes(user?.uid)) return false
    return true
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>Opportunities</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Hackathons, internships, campus events & more</p>
        </div>
        {(profile?.role === 'admin' || profile?.role === 'moderator') && (
          <motion.button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
            whileHover={{ y: -1, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}
            whileTap={{ scale: 0.97 }}
            transition={spring.snappy}
          >
            <Plus className="w-4 h-4" /> Post Opportunity
          </motion.button>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
        className="flex flex-wrap gap-2 mb-6"
      >
        {['All', ...OPPORTUNITY_TYPES].map(t => {
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
              {t}
            </motion.button>
          )
        })}
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={spring.snappy}
          onClick={() => setSavedOnly(v => !v)}
          className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5"
          style={{
            background: savedOnly ? 'rgba(245,158,11,0.1)' : 'var(--bg-secondary)',
            color: savedOnly ? '#f59e0b' : 'var(--text-secondary)',
            border: savedOnly ? '1px solid rgba(245,158,11,0.3)' : '1px solid var(--border)',
          }}
        >
          <Bookmark className="w-3.5 h-3.5" /> Saved
        </motion.button>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Briefcase} title="No opportunities found" description="Check back later for new postings." />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filtered.map(o => <OppCard key={o.id} opp={o} uid={user?.uid} onSave={handleSave} />)}
        </motion.div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Post Opportunity">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Opportunity title" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Type *</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field">
                <option value="">Select Type</option>
                {OPPORTUNITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Company / Org</label>
              <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                placeholder="Organization name" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Deadline</label>
              <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Stipend / Prize</label>
              <input value={form.stipend} onChange={e => setForm(f => ({ ...f, stipend: e.target.value }))}
                placeholder="e.g. ₹20,000/month" className="input-field" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3} placeholder="Details about this opportunity..." className="input-field resize-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Apply Link</label>
              <input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                placeholder="https://..." className="input-field" />
            </div>
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
              Post Opportunity
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
