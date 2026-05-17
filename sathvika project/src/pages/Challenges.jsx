import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Plus, Trophy, Users, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { subscribeToChallenges, createChallenge } from '../services/firebaseService'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonCard } from '../components/ui/Skeleton'
import { Modal } from '../components/ui/Modal'
import { CHALLENGE_TYPES } from '../data/constants'
import { updateDoc, doc, arrayUnion } from 'firebase/firestore'
import { db } from '../firebase/config'

const DIFFICULTY = { Easy: 'text-emerald-400 bg-emerald-900/40', Medium: 'text-amber-400 bg-amber-900/40', Hard: 'text-red-400 bg-red-900/40' }

function ChallengeCard({ ch, uid }) {
  const attempted = ch.attempts?.includes(uid)
  const attempt = () => {
    if (!attempted) updateDoc(doc(db, 'challenges', ch.id), { attempts: arrayUnion(uid) })
  }
  return (
    <motion.div whileHover={{ y: -2 }} className="card hover:border-gray-700 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`badge text-xs ${DIFFICULTY[ch.difficulty] || 'bg-gray-800 text-gray-400'}`}>{ch.difficulty}</span>
            <span className="badge bg-gray-800 text-gray-400 text-xs">{ch.type}</span>
          </div>
          <h3 className="font-semibold text-white">{ch.title}</h3>
        </div>
        <div className="flex items-center gap-1 text-amber-400">
          <Trophy className="w-4 h-4" />
          <span className="text-sm font-bold">{ch.points}</span>
        </div>
      </div>
      {ch.description && <p className="text-gray-400 text-sm mt-2 line-clamp-2">{ch.description}</p>}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <Users className="w-3.5 h-3.5" /> {ch.attempts?.length || 0} attempts
        </span>
        <button onClick={attempt}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${attempted ? 'bg-indigo-900/40 text-indigo-400' : 'btn-primary'}`}>
          {attempted ? '✓ Attempted' : 'Take Challenge'}
        </button>
      </div>
    </motion.div>
  )
}

export default function Challenges() {
  const { user, profile } = useAuth()
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState('')
  const [form, setForm] = useState({ title: '', description: '', type: '', difficulty: 'Medium', points: 50 })

  useEffect(() => {
    const unsub = subscribeToChallenges(data => { setChallenges(data); setLoading(false) })
    return unsub
  }, [])

  const handleCreate = async () => {
    if (!form.title || !form.type) return
    setSubmitting(true)
    await createChallenge({ ...form, authorId: user.uid, authorName: profile?.fullName, attempts: [], solved: [] })
    setForm({ title: '', description: '', type: '', difficulty: 'Medium', points: 50 })
    setShowModal(false)
    setSubmitting(false)
  }

  const filtered = filter ? challenges.filter(c => c.type === filter) : challenges

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Challenges</h1>
          <p className="text-gray-400 text-sm mt-1">Prove your skills and earn reputation</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Post Challenge
        </button>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        <button onClick={() => setFilter('')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${!filter ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
          All
        </button>
        {CHALLENGE_TYPES.map(t => (
          <button key={t} onClick={() => setFilter(filter === t ? '' : t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === t ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Zap} title="No challenges yet"
          description="Post a challenge to test your peers!"
          action={<button onClick={() => setShowModal(true)} className="btn-primary mt-2">Post Challenge</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => <ChallengeCard key={c.id} ch={c} uid={user?.uid} />)}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Post a Challenge">
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Challenge Title *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Implement a Red-Black Tree" className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Type *</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field">
                <option value="">Select Type</option>
                {CHALLENGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Difficulty</label>
              <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))} className="input-field">
                {['Easy', 'Medium', 'Hard'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} placeholder="Describe the challenge..." className="input-field resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Reputation Points: {form.points}</label>
            <input type="range" min={10} max={200} step={10} value={form.points}
              onChange={e => setForm(f => ({ ...f, points: Number(e.target.value) }))}
              className="w-full accent-indigo-600" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleCreate} disabled={submitting || !form.title || !form.type}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Post Challenge
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
