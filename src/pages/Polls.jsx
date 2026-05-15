import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart2, Plus, Loader2, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { subscribeToPolls, createPoll, votePoll } from '../services/firebaseService'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonCard } from '../components/ui/Skeleton'
import { Modal } from '../components/ui/Modal'
import { spring, staggerContainer, staggerItem } from '../lib/motion'

function PollCard({ poll, uid }) {
  const totalVotes = poll.options?.reduce((s, o) => s + (o.votes || 0), 0) || 0
  const hasVoted = poll.options?.some(o => o.voters?.includes(uid))

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -3, boxShadow: 'var(--shadow-md)' }}
      transition={spring.smooth}
      className="card"
    >
      <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        {poll.question}
      </h3>
      <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>
        by {poll.authorName} · {totalVotes} votes
      </p>

      <div className="space-y-2">
        {poll.options?.map((opt, i) => {
          const pct = totalVotes ? Math.round((opt.votes || 0) / totalVotes * 100) : 0
          const voted = opt.voters?.includes(uid)
          return (
            <motion.button
              key={i}
              onClick={() => !poll.closed && votePoll(poll.id, i, uid)}
              disabled={poll.closed}
              whileHover={!poll.closed && !hasVoted ? { x: 2 } : {}}
              whileTap={!poll.closed ? { scale: 0.99 } : {}}
              transition={spring.snappy}
              className="w-full text-left relative overflow-hidden rounded-xl"
              style={{
                border: `1px solid ${voted ? 'var(--border-strong)' : 'var(--border)'}`,
                background: voted ? 'var(--bg-secondary)' : 'transparent',
              }}
            >
              <motion.div
                className="absolute inset-y-0 left-0 rounded-l-xl"
                style={{ background: 'var(--bg-secondary)' }}
                initial={{ width: 0 }}
                animate={{ width: hasVoted ? `${pct}%` : 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
              <div className="relative flex items-center justify-between px-3 py-2.5">
                <span className="text-sm font-medium" style={{ color: voted ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                  {opt.text}
                </span>
                {hasVoted && (
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-tertiary)' }}>{pct}%</span>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}

export default function Polls() {
  const { user, profile } = useAuth()
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])

  useEffect(() => {
    return subscribeToPolls(data => { setPolls(data); setLoading(false) })
  }, [])

  const addOption = () => setOptions(o => [...o, ''])
  const updateOption = (i, v) => setOptions(o => o.map((x, j) => j === i ? v : x))
  const removeOption = (i) => setOptions(o => o.filter((_, j) => j !== i))

  const handleCreate = async () => {
    const validOptions = options.filter(o => o.trim())
    if (!question.trim() || validOptions.length < 2) return
    setSubmitting(true)
    await createPoll({
      question, authorId: user.uid, authorName: profile?.fullName, closed: false,
      options: validOptions.map(text => ({ text, votes: 0, voters: [] })),
    })
    setQuestion('')
    setOptions(['', ''])
    setShowModal(false)
    setSubmitting(false)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>Campus Polls</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Vote on what matters to the campus community</p>
        </div>
        <motion.button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
          whileHover={{ y: -1, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}
          whileTap={{ scale: 0.97 }}
          transition={spring.snappy}
        >
          <Plus className="w-4 h-4" /> Create Poll
        </motion.button>
      </motion.div>

      {loading ? (
        <div className="space-y-4">{Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : polls.length === 0 ? (
        <EmptyState
          icon={BarChart2}
          title="No polls yet"
          description="Create a poll to get campus-wide opinions!"
          action={<button onClick={() => setShowModal(true)} className="btn-primary mt-2">Create Poll</button>}
        />
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-4">
          {polls.map(p => <PollCard key={p.id} poll={p} uid={user?.uid} />)}
        </motion.div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Poll">
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Question *</label>
            <input value={question} onChange={e => setQuestion(e.target.value)}
              placeholder="What do you want to know?" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Options *</label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input value={opt} onChange={e => updateOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`} className="input-field flex-1 text-sm py-2" />
                  {options.length > 2 && (
                    <motion.button
                      onClick={() => removeOption(i)}
                      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={spring.snappy}
                      className="p-2 rounded-lg"
                      style={{ color: 'var(--text-tertiary)' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent' }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 6 && (
              <motion.button
                onClick={addOption}
                whileHover={{ x: 2 }} transition={spring.snappy}
                className="text-xs mt-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                + Add option
              </motion.button>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <motion.button
              onClick={handleCreate}
              disabled={submitting || !question.trim() || options.filter(o => o.trim()).length < 2}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Poll
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
