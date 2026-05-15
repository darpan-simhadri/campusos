import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Plus, Trophy, Users, Loader2, CheckCircle2, X, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { subscribeToChallenges, createChallenge, awardXP, awardPies } from '../services/firebaseService'
import { getRandomProblem } from '../data/problems'
import ProblemSolverModal from '../components/ui/ProblemSolverModal'
import { updateDoc, doc, arrayUnion } from 'firebase/firestore'
import { db } from '../firebase/config'
import { spring, staggerContainer, staggerItem } from '../lib/motion'
import { CHALLENGE_TYPES } from '../data/constants'

const DIFF_COLOR = { Easy: '#4CAF50', Medium: '#FFD700', Hard: '#EF4444' }

const TYPE_CATEGORY = {
  Coding: 'DSA', Research: 'AI/ML', Design: 'System Design',
  Startup: 'System Design', AI: 'AI/ML',
}

const TYPE_ICON = { Coding: '⚙️', Research: '🔬', Design: '🎨', Startup: '🚀', AI: '🤖' }

function ChallengeCard({ ch, uid, onPlay }) {
  const attemptsList = Array.isArray(ch.attempts) ? ch.attempts : []
  const solvedList = Array.isArray(ch.solvedBy) ? ch.solvedBy : []
  const solved = solvedList.includes(uid)

  return (
    <motion.div
      variants={staggerItem}
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ background: '#1C1C1C', border: `1px solid ${solved ? 'rgba(76,175,80,0.4)' : '#2a2a2a'}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span style={{ fontSize: '1.1rem' }}>{TYPE_ICON[ch.type] || '⚡'}</span>
          <span
            className="rounded-full px-2 py-0.5"
            style={{ background: `${DIFF_COLOR[ch.difficulty] || '#888'}22`, color: DIFF_COLOR[ch.difficulty] || '#888', fontSize: '0.58rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}
          >
            {ch.difficulty}
          </span>
          <span
            className="rounded-full px-2 py-0.5"
            style={{ background: '#2a2a2a', color: '#888', fontSize: '0.58rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}
          >
            {ch.type}
          </span>
          {solved && (
            <span
              className="rounded-full px-2 py-0.5 flex items-center gap-1"
              style={{ background: 'rgba(76,175,80,0.12)', color: '#4CAF50', fontSize: '0.58rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}
            >
              <CheckCircle2 className="w-2.5 h-2.5" /> SOLVED
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Trophy className="w-3.5 h-3.5" style={{ color: '#FFD700' }} />
          <span style={{ color: '#FFD700', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
            {ch.rewardPoints || ch.points || 0}π
          </span>
        </div>
      </div>

      <div>
        <p style={{ color: '#fff', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.01em', lineHeight: 1.3 }}>
          {ch.title}
        </p>
        {ch.description && (
          <p style={{ color: '#666', fontSize: '0.72rem', lineHeight: 1.5, marginTop: 4 }} className="line-clamp-2">
            {ch.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mt-auto pt-2" style={{ borderTop: '1px solid #2a2a2a' }}>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1" style={{ color: '#555', fontSize: '0.62rem', fontFamily: 'JetBrains Mono, monospace' }}>
            <Users className="w-3 h-3" /> {attemptsList.length}
          </span>
          <span className="flex items-center gap-1" style={{ color: '#4CAF50', fontSize: '0.62rem', fontFamily: 'JetBrains Mono, monospace' }}>
            <CheckCircle2 className="w-3 h-3" /> {solvedList.length} solved
          </span>
        </div>
        <motion.button
          onClick={() => onPlay(ch)}
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
          style={{
            background: solved ? 'rgba(76,175,80,0.08)' : '#C8F135',
            border: solved ? '1px solid #4CAF50' : 'none',
            color: solved ? '#4CAF50' : '#000',
            fontFamily: 'Anton, sans-serif',
            fontSize: '0.72rem',
            letterSpacing: '0.06em',
          }}
          whileTap={{ scale: 0.95 }}
          transition={spring.snappy}
        >
          {solved ? <><CheckCircle2 className="w-3 h-3" /> RETRY</> : <><Zap className="w-3 h-3" /> ATTEMPT</>}
        </motion.button>
      </div>
    </motion.div>
  )
}

function CreateModal({ onClose, onCreated, uid, fullName }) {
  const [form, setForm] = useState({ title: '', description: '', type: 'Coding', difficulty: 'Medium', rewardPoints: 50 })
  const [submitting, setSubmitting] = useState(false)

  const handleCreate = async () => {
    if (!form.title) return
    setSubmitting(true)
    await createChallenge({ ...form, authorId: uid, authorName: fullName, attempts: [], solvedBy: [] })
    onCreated()
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        exit={{ y: 60 }}
        transition={spring.smooth}
        className="w-full rounded-t-3xl sm:rounded-3xl p-5 space-y-4"
        style={{ background: '#111', border: '1px solid #2a2a2a', maxWidth: 440 }}
      >
        <div className="flex items-center justify-between">
          <span style={{ fontFamily: 'Anton, sans-serif', color: '#fff', fontSize: '1.1rem', letterSpacing: '0.04em' }}>POST CHALLENGE</span>
          <button onClick={onClose} style={{ color: '#555' }}><X className="w-5 h-5" /></button>
        </div>

        <input
          placeholder="Challenge title *"
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          className="w-full rounded-xl px-3 py-2.5 outline-none"
          style={{ background: '#1C1C1C', border: '1px solid #2a2a2a', color: '#fff', fontSize: '0.85rem' }}
        />

        <div className="grid grid-cols-2 gap-3">
          <select
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            className="rounded-xl px-3 py-2.5 outline-none"
            style={{ background: '#1C1C1C', border: '1px solid #2a2a2a', color: '#fff', fontSize: '0.82rem' }}
          >
            {CHALLENGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={form.difficulty}
            onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
            className="rounded-xl px-3 py-2.5 outline-none"
            style={{ background: '#1C1C1C', border: '1px solid #2a2a2a', color: '#fff', fontSize: '0.82rem' }}
          >
            {['Easy', 'Medium', 'Hard'].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <textarea
          placeholder="Describe the challenge..."
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={3}
          className="w-full rounded-xl px-3 py-2.5 outline-none resize-none"
          style={{ background: '#1C1C1C', border: '1px solid #2a2a2a', color: '#fff', fontSize: '0.82rem' }}
        />

        <div>
          <p style={{ color: '#888', fontSize: '0.65rem', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.04em', marginBottom: 6 }}>
            REWARD: <span style={{ color: '#FFD700' }}>{form.rewardPoints}π</span>
          </p>
          <input
            type="range" min={10} max={200} step={10}
            value={form.rewardPoints}
            onChange={e => setForm(f => ({ ...f, rewardPoints: Number(e.target.value) }))}
            className="w-full"
            style={{ accentColor: '#C8F135' }}
          />
        </div>

        <motion.button
          onClick={handleCreate}
          disabled={!form.title || submitting}
          className="w-full rounded-xl py-3 flex items-center justify-center gap-2"
          style={{
            background: form.title ? '#C8F135' : '#1C1C1C',
            color: form.title ? '#000' : '#555',
            fontFamily: 'Anton, sans-serif',
            fontSize: '0.9rem',
            letterSpacing: '0.06em',
          }}
          whileTap={{ scale: 0.97 }}
          transition={spring.snappy}
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {submitting ? 'POSTING...' : 'POST CHALLENGE'}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

export default function Challenges() {
  const { user, profile, updateProfile } = useAuth()
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState('ALL')
  const [activeProblem, setActiveProblem] = useState(null)
  const [activeChallenge, setActiveChallenge] = useState(null)

  useEffect(() => {
    return subscribeToChallenges(data => { setChallenges(data); setLoading(false) })
  }, [])

  const handlePlay = (ch) => {
    const category = TYPE_CATEGORY[ch.type] || 'DSA'
    const problem = getRandomProblem(category)
    setActiveChallenge(ch)
    setActiveProblem(problem)
  }

  const handleSolved = async ({ xp: earned, pies: piesEarned }) => {
    if (activeChallenge && user) {
      await updateDoc(doc(db, 'challenges', activeChallenge.id), {
        attempts: arrayUnion(user.uid),
        solvedBy: arrayUnion(user.uid),
      })
      const bonus = activeChallenge.rewardPoints || 0
      if (bonus > 0) {
        await awardPies(user.uid, bonus)
        updateProfile({ pies: (profile?.pies || 0) + piesEarned + bonus })
      }
    }
    setActiveProblem(null)
    setActiveChallenge(null)
  }

  const filtered = challenges.filter(c => {
    if (filter === 'ALL') return true
    if (filter === 'SOLVED') return c.solvedBy?.includes(user?.uid)
    return c.type === filter
  })

  const solvedCount = challenges.filter(c => c.solvedBy?.includes(user?.uid)).length

  return (
    <div style={{ background: '#000000', minHeight: '100%' }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 style={{ fontFamily: 'Anton, sans-serif', fontSize: '1.6rem', color: '#fff', letterSpacing: '0.03em' }}>
              CHALLENGES
            </h1>
            <p style={{ color: '#555', fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
              {solvedCount} solved · {challenges.length} total
            </p>
          </div>
          <motion.button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-full px-4 py-2"
            style={{ background: '#C8F135', color: '#000', fontFamily: 'Anton, sans-serif', fontSize: '0.72rem', letterSpacing: '0.06em' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={spring.snappy}
          >
            <Plus className="w-3.5 h-3.5" />
            POST
          </motion.button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {['ALL', 'SOLVED', ...CHALLENGE_TYPES].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="rounded-full px-4 py-1.5 flex-shrink-0 font-bold"
              style={{
                background: filter === f ? '#C8F135' : '#1C1C1C',
                color: filter === f ? '#000' : '#666',
                fontFamily: 'Anton, sans-serif',
                fontSize: '0.68rem',
                letterSpacing: '0.06em',
                border: `1px solid ${filter === f ? '#C8F135' : '#2a2a2a'}`,
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="px-4 space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="rounded-2xl h-36 animate-pulse" style={{ background: '#1C1C1C' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <p style={{ fontSize: '2rem', marginBottom: 8 }}>⚡</p>
          <p style={{ color: '#888', fontFamily: 'Barlow Condensed, sans-serif', fontSize: '0.9rem' }}>
            {filter === 'SOLVED' ? "You haven't solved any challenges yet." : 'No challenges here yet.'}
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 rounded-full px-5 py-2"
            style={{ background: '#C8F135', color: '#000', fontFamily: 'Anton, sans-serif', fontSize: '0.75rem', letterSpacing: '0.06em' }}
          >
            POST ONE
          </button>
        </div>
      ) : (
        <motion.div className="px-4 pb-6 space-y-3" variants={staggerContainer} initial="hidden" animate="show">
          {filtered.map(ch => (
            <ChallengeCard
              key={ch.id}
              ch={ch}
              uid={user?.uid}
              onPlay={handlePlay}
            />
          ))}
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showCreate && (
          <CreateModal
            onClose={() => setShowCreate(false)}
            onCreated={() => {}}
            uid={user?.uid}
            fullName={profile?.fullName}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeProblem && (
          <ProblemSolverModal
            problem={activeProblem}
            context="challenge"
            onClose={() => { setActiveProblem(null); setActiveChallenge(null) }}
            onSolved={handleSolved}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
