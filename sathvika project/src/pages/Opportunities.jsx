import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Plus, Clock, Bookmark, BookmarkCheck, Filter, ExternalLink, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { subscribeToOpportunities, createOpportunity, saveOpportunity } from '../services/firebaseService'
import { SkeletonCard } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { OPPORTUNITY_TYPES } from '../data/constants'

const TYPE_COLORS = {
  Hackathon: 'bg-purple-900/40 text-purple-400',
  Workshop: 'bg-blue-900/40 text-blue-400',
  Internship: 'bg-emerald-900/40 text-emerald-400',
  'Campus Event': 'bg-amber-900/40 text-amber-400',
  Placement: 'bg-red-900/40 text-red-400',
  Seminar: 'bg-indigo-900/40 text-indigo-400',
  Competition: 'bg-pink-900/40 text-pink-400',
  Research: 'bg-cyan-900/40 text-cyan-400',
}

function OppCard({ opp, uid, onSave }) {
  const saved = opp.savedBy?.includes(uid)
  return (
    <motion.div whileHover={{ y: -2 }} className="card hover:border-gray-700 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`badge text-xs ${TYPE_COLORS[opp.type] || 'bg-gray-800 text-gray-400'}`}>{opp.type}</span>
          </div>
          <h3 className="font-semibold text-white">{opp.title}</h3>
          {opp.company && <p className="text-gray-400 text-sm mt-0.5">{opp.company}</p>}
        </div>
        <button onClick={() => onSave(opp.id)} className={`p-2 rounded-lg hover:bg-gray-800 transition-colors ${saved ? 'text-indigo-400' : 'text-gray-500'}`}>
          {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>

      {opp.description && <p className="text-gray-400 text-sm mt-3 line-clamp-2">{opp.description}</p>}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {opp.deadline && (
            <span className="flex items-center gap-1 text-amber-400">
              <Clock className="w-3.5 h-3.5" /> {opp.deadline}
            </span>
          )}
          {opp.stipend && <span className="text-emerald-400">{opp.stipend}</span>}
        </div>
        {opp.link && (
          <a href={opp.link} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
            Apply <ExternalLink className="w-3 h-3" />
          </a>
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
    const unsub = subscribeToOpportunities(data => { setOpps(data); setLoading(false) })
    return unsub
  }, [])

  const handleSave = (id) => saveOpportunity(id, user.uid)

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Opportunities</h1>
          <p className="text-gray-400 text-sm mt-1">Hackathons, internships, campus events & more</p>
        </div>
        {(profile?.role === 'admin' || profile?.role === 'moderator') && (
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Post Opportunity
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter('')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${!filter ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
          All
        </button>
        {OPPORTUNITY_TYPES.map(t => (
          <button key={t} onClick={() => setFilter(filter === t ? '' : t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === t ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
            {t}
          </button>
        ))}
        <button onClick={() => setSavedOnly(!savedOnly)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${savedOnly ? 'bg-amber-600/20 text-amber-400 border border-amber-600/30' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
          <Bookmark className="w-3.5 h-3.5" /> Saved
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Briefcase} title="No opportunities found" description="Check back later for new postings." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(o => <OppCard key={o.id} opp={o} uid={user?.uid} onSave={handleSave} />)}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Post Opportunity">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Opportunity title" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Type *</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field">
                <option value="">Select Type</option>
                {OPPORTUNITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Company / Org</label>
              <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                placeholder="Organization name" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Deadline</label>
              <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Stipend / Prize</label>
              <input value={form.stipend} onChange={e => setForm(f => ({ ...f, stipend: e.target.value }))}
                placeholder="e.g. ₹20,000/month" className="input-field" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3} placeholder="Details about this opportunity..." className="input-field resize-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Apply Link</label>
              <input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                placeholder="https://..." className="input-field" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleCreate} disabled={submitting || !form.title || !form.type}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Post Opportunity
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
