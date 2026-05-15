import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Building2, Search, Plus, Loader2, Star, Briefcase, ShieldAlert } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { subscribeToInternshipReviews, createInternshipReview } from '../services/firebaseService'
import { SkeletonCard } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { spring, staggerContainer, staggerItem } from '../lib/motion'

function ReviewCard({ review }) {
  return (
    <motion.div
      variants={staggerItem}
      layout
      whileHover={{ y: -4, boxShadow: 'var(--shadow-md)' }}
      transition={spring.smooth}
      className="card flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{review.company}</h3>
          <p className="text-xs mt-1 font-medium flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
            <Briefcase className="w-3.5 h-3.5" />
            {review.role}
          </p>
        </div>
        <div className="flex items-center px-2.5 py-1 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <Star className="w-4 h-4 mr-1" style={{ color: '#f59e0b', fill: '#f59e0b' }} />
          <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{review.rating}/5</span>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>The Experience</span>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{review.review}</p>
        </div>
        {review.interviewProcess && (
          <div className="rounded-xl p-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Interview Process</span>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{review.interviewProcess}</p>
          </div>
        )}
      </div>

      {review.tags && review.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {review.tags.map(tag => <span key={tag} className="tag text-[10px] py-0.5">{tag}</span>)}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 mt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="text-xs">
          {review.isAnonymous ? (
            <span className="flex items-center gap-1.5 font-medium" style={{ color: 'var(--text-tertiary)' }}>
              <ShieldAlert className="w-4 h-4" /> Anonymous Senior
            </span>
          ) : (
            <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>By {review.authorName}</span>
          )}
        </div>
        {review.stipend && (
          <span className="text-xs font-bold px-2 py-1 rounded-lg"
            style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
            {review.stipend}
          </span>
        )}
      </div>
    </motion.div>
  )
}

export default function InternshipReviews() {
  const { user, profile } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    company: '', role: '', stipend: '', review: '',
    interviewProcess: '', rating: '5', tags: '', isAnonymous: true,
  })

  useEffect(() => {
    const unsub = subscribeToInternshipReviews(data => { setReviews(data); setLoading(false) })
    return unsub
  }, [])

  const handleCreate = async () => {
    if (!form.company || !form.review) return
    setSubmitting(true)
    await createInternshipReview({
      ...form,
      rating: parseInt(form.rating),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      authorId: user.uid,
      authorName: form.isAnonymous ? 'Anonymous' : profile?.fullName,
    })
    setForm({ company: '', role: '', stipend: '', review: '', interviewProcess: '', rating: '5', tags: '', isAnonymous: true })
    setShowModal(false)
    setSubmitting(false)
  }

  const filteredReviews = reviews.filter(r => {
    const q = search.toLowerCase()
    return r.company?.toLowerCase().includes(q) || r.role?.toLowerCase().includes(q) || r.review?.toLowerCase().includes(q)
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
            <Building2 className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
            Internship Reality Check
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Unfiltered, verified reviews of company internships from your seniors. Anonymous posting encouraged.</p>
        </div>
        <motion.button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
          whileHover={{ y: -1, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}
          whileTap={{ scale: 0.97 }}
          transition={spring.snappy}
        >
          <Plus className="w-4 h-4" /> Drop a Review
        </motion.button>
      </motion.div>

      <div className="relative mb-6 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-placeholder)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by company, role, or keyword..."
          className="input-field pl-10" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredReviews.length === 0 ? (
        <EmptyState icon={Building2} title="No reviews found" description="No companies match your search. Be the first to drop a review!" />
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map(review => <ReviewCard key={review.id} review={review} />)}
        </motion.div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Drop an Internship Review">
        <div className="p-6 space-y-4 w-full max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Company Name *</label>
              <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="e.g. Google" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Role / Title *</label>
              <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="e.g. SDE Intern" className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>The Reality (Review) *</label>
            <textarea value={form.review} onChange={e => setForm(f => ({ ...f, review: e.target.value }))} placeholder="How was the work culture? Did you learn anything? Were they toxic?" rows={3} className="input-field resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Interview Process (Optional but helpful)</label>
            <textarea value={form.interviewProcess} onChange={e => setForm(f => ({ ...f, interviewProcess: e.target.value }))} placeholder="How many rounds? What kind of questions?" rows={2} className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Overall Rating</label>
              <select value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} className="input-field">
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Okay</option>
                <option value="2">2 - Bad</option>
                <option value="1">1 - Terrible</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Stipend / Pay</label>
              <input value={form.stipend} onChange={e => setForm(f => ({ ...f, stipend: e.target.value }))} placeholder="e.g. $4000/mo" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tags</label>
              <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="Remote, Hard" className="input-field" />
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 rounded-xl cursor-pointer"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <input
              type="checkbox"
              checked={form.isAnonymous}
              onChange={e => setForm(f => ({ ...f, isAnonymous: e.target.checked }))}
              className="w-4 h-4 rounded"
              style={{ accentColor: 'var(--text-primary)' }}
            />
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Post Anonymously</p>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Your name will be hidden. Highly recommended for honest reviews.</p>
            </div>
          </label>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <motion.button
              onClick={handleCreate}
              disabled={submitting || !form.company || !form.review}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Publish Review
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
