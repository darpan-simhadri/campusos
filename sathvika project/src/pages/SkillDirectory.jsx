import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Github, Users, Filter, MessageSquare } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getAllUsers } from '../services/firebaseService'
import { SkeletonCard } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { BRANCH_OPTIONS, SECTION_OPTIONS } from '../data/constants'

function StudentCard({ student, onMessage }) {
  const navigate = useNavigate()
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="card hover:border-gray-700 transition-all cursor-pointer"
      onClick={() => navigate(`/profile/${student.id}`)}
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-indigo-600/30 flex items-center justify-center overflow-hidden flex-shrink-0">
          {student.profileImage ? (
            <img src={student.profileImage} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-indigo-400 font-bold text-lg">{student.fullName?.[0]}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm truncate">{student.fullName}</h3>
            {student.collaborationAvailable && (
              <span className="badge bg-emerald-900/40 text-emerald-400 text-xs ml-2 flex-shrink-0">Open to Collab</span>
            )}
          </div>
          <p className="text-gray-500 text-xs mt-0.5 truncate">{student.branch} · Section {student.section}</p>
        </div>
      </div>

      {student.bio && (
        <p className="text-gray-400 text-xs mt-3 line-clamp-2">{student.bio}</p>
      )}

      {student.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {student.skills.slice(0, 5).map(s => <span key={s} className="tag">{s}</span>)}
          {student.skills.length > 5 && <span className="tag">+{student.skills.length - 5}</span>}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {student.githubLink && (
            <a href={student.githubLink} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 hover:text-white transition-colors">
              <Github className="w-3.5 h-3.5" /> GitHub
            </a>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" /> {student.reputation || 0} rep
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onMessage(student) }}
          className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" /> Message
        </button>
      </div>
    </motion.div>
  )
}

export default function SkillDirectory() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('skill') || '')
  const [branch, setBranch] = useState('')
  const [section, setSection] = useState('')
  const [collabOnly, setCollabOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    getAllUsers().then(data => { setUsers(data); setLoading(false) })
  }, [])

  const filtered = users.filter(u => {
    if (branch && u.branch !== branch) return false
    if (section && u.section !== section) return false
    if (collabOnly && !u.collaborationAvailable) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        u.fullName?.toLowerCase().includes(q) ||
        u.skills?.some(s => s.toLowerCase().includes(q)) ||
        u.branch?.toLowerCase().includes(q)
      )
    }
    return true
  })

  const handleMessage = (student) => navigate(`/messages?userId=${student.id}`)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Skill Directory</h1>
        <p className="text-gray-400 text-sm mt-1">Discover and connect with talented students</p>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or skill..."
            className="input-field pl-10"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary flex items-center gap-2 ${showFilters ? 'border-indigo-500 text-indigo-400' : ''}`}
        >
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="card mb-4 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Branch</label>
            <select value={branch} onChange={e => setBranch(e.target.value)} className="input-field">
              <option value="">All Branches</option>
              {BRANCH_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Section</label>
            <select value={section} onChange={e => setSection(e.target.value)} className="input-field">
              <option value="">All Sections</option>
              {SECTION_OPTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>
          <div className="flex items-end pb-0.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={collabOnly} onChange={e => setCollabOnly(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded" />
              <span className="text-sm text-gray-300">Open to collaboration only</span>
            </label>
          </div>
        </motion.div>
      )}

      <div className="text-xs text-gray-500 mb-4">
        Showing <span className="text-gray-300">{filtered.length}</span> students
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No students found"
          description="Try adjusting your search or filters." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(u => (
            <StudentCard key={u.id} student={u} onMessage={handleMessage} />
          ))}
        </div>
      )}
    </div>
  )
}
