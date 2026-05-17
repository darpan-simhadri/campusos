import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart2, Plus, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { subscribeToPolls, createPoll, votePoll } from '../services/firebaseService'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonCard } from '../components/ui/Skeleton'
import { Modal } from '../components/ui/Modal'

function PollCard({ poll, uid }) {
  const totalVotes = poll.options?.reduce((s, o) => s + (o.votes || 0), 0) || 0
  const hasVoted = poll.options?.some(o => o.voters?.includes(uid))

  return (
    <div className="card hover:border-gray-700 transition-all">
      <h3 className="font-semibold text-white mb-1">{poll.question}</h3>
      <p className="text-xs text-gray-500 mb-4">by {poll.authorName} · {totalVotes} votes</p>

      <div className="space-y-2">
        {poll.options?.map((opt, i) => {
          const pct = totalVotes ? Math.round((opt.votes || 0) / totalVotes * 100) : 0
          const voted = opt.voters?.includes(uid)
          return (
            <button key={i} onClick={() => !poll.closed && votePoll(poll.id, i, uid)}
              disabled={poll.closed}
              className={`w-full text-left relative overflow-hidden rounded-lg border transition-all ${voted ? 'border-indigo-500' : 'border-gray-700 hover:border-gray-600'}`}>
              <div className="absolute inset-y-0 left-0 bg-indigo-600/20 transition-all rounded-l-lg"
                style={{ width: hasVoted ? `${pct}%` : '0%' }} />
              <div className="relative flex items-center justify-between px-3 py-2.5">
                <span className={`text-sm font-medium ${voted ? 'text-indigo-300' : 'text-gray-300'}`}>{opt.text}</span>
                {hasVoted && <span className="text-xs text-gray-400 font-medium">{pct}%</span>}
              </div>
            </button>
          )
        })}
      </div>
    </div>
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
    const unsub = subscribeToPolls(data => { setPolls(data); setLoading(false) })
    return unsub
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Campus Polls</h1>
          <p className="text-gray-400 text-sm mt-1">Vote on what matters to the campus community</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Poll
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">{Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : polls.length === 0 ? (
        <EmptyState icon={BarChart2} title="No polls yet"
          description="Create a poll to get campus-wide opinions!"
          action={<button onClick={() => setShowModal(true)} className="btn-primary mt-2">Create Poll</button>} />
      ) : (
        <div className="space-y-4">
          {polls.map(p => <PollCard key={p.id} poll={p} uid={user?.uid} />)}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Poll">
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Question *</label>
            <input value={question} onChange={e => setQuestion(e.target.value)}
              placeholder="What do you want to know?" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Options *</label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <input value={opt} onChange={e => updateOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`} className="input-field flex-1 text-sm py-2" />
                  {options.length > 2 && (
                    <button onClick={() => removeOption(i)} className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors">×</button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 6 && (
              <button onClick={addOption} className="text-xs text-indigo-400 hover:text-indigo-300 mt-2">+ Add option</button>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleCreate} disabled={submitting || !question.trim() || options.filter(o => o.trim()).length < 2}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Poll
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
