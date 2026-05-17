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

const SUBJECTS = ['DSA', 'DBMS', 'Operating Systems', 'Computer Networks', 'React', 'Machine Learning', 'Python', 'Java', 'System Design', 'Algorithms']

function GroupCard({ group, onJoin, onLeave, uid }) {
  const isMember = group.members?.includes(uid)
  return (
    <motion.div whileHover={{ y: -2 }} className="card hover:border-gray-700 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-white">{group.name}</h3>
          <p className="text-indigo-400 text-xs font-medium mt-0.5">{group.subject}</p>
        </div>
        <span className={`badge text-xs ${isMember ? 'bg-indigo-900/40 text-indigo-400' : 'bg-gray-800 text-gray-400'}`}>
          {isMember ? 'Joined' : 'Open'}
        </span>
      </div>

      {group.description && <p className="text-gray-400 text-sm mt-2">{group.description}</p>}

      <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {group.members?.length || 0} members</span>
        {group.schedule && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {group.schedule}</span>}
        {group.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {group.location}</span>}
        {group.section && <span className="flex items-center gap-1">Section {group.section}</span>}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-800">
        {isMember ? (
          <button onClick={() => onLeave(group.id)} className="btn-secondary w-full text-xs py-2">Leave Group</button>
        ) : (
          <button onClick={() => onJoin(group.id)} className="btn-primary w-full text-xs py-2">Join Group</button>
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
    const unsub = subscribeToStudyGroups(data => { setGroups(data); setLoading(false) })
    return unsub
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Study Groups</h1>
          <p className="text-gray-400 text-sm mt-1">Find study partners for any subject</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Group
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {['all', 'mine', 'section'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
            {f === 'all' ? 'All Groups' : f === 'mine' ? 'My Groups' : `Section ${profile?.section}`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="No study groups found"
          description="Create one and invite your classmates!"
          action={<button onClick={() => setShowModal(true)} className="btn-primary mt-2">Create Group</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(g => (
            <GroupCard key={g.id} group={g} onJoin={handleJoin} onLeave={handleLeave} uid={user?.uid} />
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Study Group">
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Group Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. DSA Warriors" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Subject *</label>
            <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="input-field">
              <option value="">Select Subject</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What will you study?" rows={3} className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Schedule</label>
              <input value={form.schedule} onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))}
                placeholder="e.g. Mon, Wed 5pm" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Location</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Library, Room 201" className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Section (Optional)</label>
            <select value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))} className="input-field">
              <option value="">All Sections</option>
              {SECTION_OPTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleCreate} disabled={submitting || !form.name || !form.subject}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Group
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
