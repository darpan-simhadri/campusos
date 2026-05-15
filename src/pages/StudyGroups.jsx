import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Plus, Users, Clock, MapPin, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  subscribeToStudyGroups, createStudyGroup,
  joinStudyGroup, leaveStudyGroup,
} from '../services/firebaseService'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonCard } from '../components/ui/Skeleton'
import { Modal } from '../components/ui/Modal'
import { SECTION_OPTIONS } from '../data/constants'
import { spring, staggerContainer, staggerItem } from '../lib/motion'

const SUBJECTS = ['DSA', 'DBMS', 'Operating Systems', 'Computer Networks', 'React', 'Machine Learning', 'Python', 'Java', 'System Design', 'Algorithms']

function GroupCard({ group, onJoin, onLeave, uid }) {
  const isMember = group.members?.includes(uid)

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4, boxShadow: 'var(--shadow-md)' }}
      transition={spring.smooth}
      className="card flex flex-col"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold leading-snug" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {group.name}
          </h3>
          <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>{group.subject}</p>
        </div>
        <span
          className="badge flex-shrink-0 text-xs"
          style={{
            background: isMember ? 'var(--text-primary)' : 'var(--bg-secondary)',
            color: isMember ? 'var(--bg-card)' : 'var(--text-tertiary)',
            border: isMember ? '1px solid var(--text-primary)' : '1px solid var(--border)',
          }}
        >
          {isMember ? 'Joined' : 'Open'}
        </span>
      </div>

      {group.description && (
        <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{group.description}</p>
      )}

      <div className="flex flex-wrap gap-3 mt-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {group.members?.length || 0} members</span>
        {group.schedule && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {group.schedule}</span>}
        {group.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {group.location}</span>}
        {group.section && <span>Section {group.section}</span>}
      </div>

      <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        {isMember ? (
          <motion.button
            onClick={() => onLeave(group.id)}
            className="btn-secondary w-full text-xs py-2"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
          >
            Leave Group
          </motion.button>
        ) : (
          <motion.button
            onClick={() => onJoin(group.id)}
            className="btn-primary w-full text-xs py-2"
            whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
            whileTap={{ scale: 0.97 }}
            transition={spring.snappy}
          >
            Join Group
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

export default function StudyGroups() {
  const { user, profile } = useAuth()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({
    name: '', subject: '', description: '',
    schedule: '', location: '', section: '', maxMembers: 10,
  })

  useEffect(() => {
    return subscribeToStudyGroups(data => { setGroups(data); setLoading(false) })
  }, [])

  const handleJoin = (id) => joinStudyGroup(id, user.uid)
  const handleLeave = (id) => leaveStudyGroup(id, user.uid)

  const handleCreate = async () => {
    if (!form.name || !form.subject) return
    setSubmitting(true)
    await createStudyGroup({ ...form, creatorId: user.uid, members: [user.uid] })
    setForm({ name: '', subject: '', description: '', schedule: '', location: '', section: '', maxMembers: 10 })
    setShowModal(false)
    setSubmitting(false)
  }

  const filtered = groups.filter(g => {
    if (filter === 'mine') return g.members?.includes(user?.uid)
    if (filter === 'section') return g.section === profile?.section
    return true
  })

  const filters = [
    { id: 'all', label: 'All Groups' },
    { id: 'mine', label: 'My Groups' },
    { id: 'section', label: `Section ${profile?.section || ''}` },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>Study Groups</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Find study partners for any subject</p>
        </div>
        <motion.button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
          whileHover={{ y: -1, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}
          whileTap={{ scale: 0.97 }}
          transition={spring.snappy}
        >
          <Plus className="w-4 h-4" /> Create Group
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
        className="flex gap-2 mb-6"
      >
        {filters.map(f => (
          <motion.button
            key={f.id}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={spring.snappy}
            onClick={() => setFilter(f.id)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium"
            style={{
              background: filter === f.id ? 'var(--text-primary)' : 'var(--bg-secondary)',
              color: filter === f.id ? 'var(--bg-card)' : 'var(--text-secondary)',
              border: filter === f.id ? '1px solid var(--text-primary)' : '1px solid var(--border)',
            }}
          >
            {f.label}
          </motion.button>
        ))}
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No study groups found"
          description="Create one and invite your classmates!"
          action={<button onClick={() => setShowModal(true)} className="btn-primary mt-2">Create Group</button>}
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filtered.map(g => (
            <GroupCard key={g.id} group={g} onJoin={handleJoin} onLeave={handleLeave} uid={user?.uid} />
          ))}
        </motion.div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Study Group">
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Group Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. DSA Warriors" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Subject *</label>
            <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="input-field">
              <option value="">Select Subject</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What will you study?" rows={3} className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Schedule</label>
              <input value={form.schedule} onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))}
                placeholder="e.g. Mon, Wed 5pm" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Location</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Library, Room 201" className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Section (Optional)</label>
            <select value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))} className="input-field">
              <option value="">All Sections</option>
              {SECTION_OPTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <motion.button
              onClick={handleCreate}
              disabled={submitting || !form.name || !form.subject}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Group
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
