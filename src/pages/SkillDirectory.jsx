import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Github, Users, Filter, MessageSquare, X } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getAllUsers } from '../services/firebaseService'
import { SkeletonCard } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { BRANCH_OPTIONS, SECTION_OPTIONS } from '../data/constants'
import { spring, staggerContainer, staggerItem } from '../lib/motion'

function StudentCard({ student, onMessage }) {
  const navigate = useNavigate()
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4, boxShadow: 'var(--shadow-md)' }}
      transition={spring.smooth}
      className="card cursor-pointer flex flex-col"
      onClick={() => navigate(`/profile/${student.id}`)}
    >
      <div className="flex items-start gap-3">
        <motion.div
          whileHover={{ scale: 1.06 }} transition={spring.bouncy}
          className="w-11 h-11 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 text-sm font-bold"
          style={{
            background: student.profileImage ? 'transparent' : 'var(--bg-secondary)',
            border: '2px solid var(--border)',
          }}
        >
          {student.profileImage
            ? <img src={student.profileImage} alt="" className="w-full h-full object-cover" />
            : <span style={{ color: 'var(--text-secondary)' }}>{student.fullName?.[0]}</span>
          }
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {student.fullName}
            </h3>
            {student.collaborationAvailable && (
              <span
                className="badge text-xs flex-shrink-0"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}
              >
                Open to Collab
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-tertiary)' }}>
            {student.branch} · Section {student.section}
          </p>
        </div>
      </div>

      {student.bio && (
        <p className="text-xs mt-3 line-clamp-2" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{student.bio}</p>
      )}

      {student.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {student.skills.slice(0, 5).map(s => <span key={s} className="tag">{s}</span>)}
          {student.skills.length > 5 && (
            <span className="tag" style={{ color: 'var(--text-tertiary)' }}>+{student.skills.length - 5}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {student.githubLink && (
            <a
              href={student.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1 transition-colors"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
            >
              <Github className="w-3.5 h-3.5" /> GitHub
            </a>
          )}
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" /> {student.reputation || 0} rep
          </span>
        </div>
        <motion.button
          onClick={(e) => { e.stopPropagation(); onMessage(student) }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} transition={spring.snappy}
          className="flex items-center gap-1.5 text-xs font-medium"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <MessageSquare className="w-3.5 h-3.5" /> Message
        </motion.button>
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
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>Skill Directory</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Discover and connect with talented students</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
        className="flex gap-3 mb-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-placeholder)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or skill..."
            className="input-field pl-10"
          />
        </div>
        <motion.button
          onClick={() => setShowFilters(v => !v)}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
          className="btn-secondary flex items-center gap-2"
          style={showFilters ? { borderColor: 'var(--border-strong)', color: 'var(--text-primary)' } : {}}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={showFilters ? 'x' : 'f'}
              initial={{ rotate: -20, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 20, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {showFilters ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
            </motion.span>
          </AnimatePresence>
          Filters
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="card mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Branch</label>
                <select value={branch} onChange={e => setBranch(e.target.value)} className="input-field">
                  <option value="">All Branches</option>
                  {BRANCH_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Section</label>
                <select value={section} onChange={e => setSection(e.target.value)} className="input-field">
                  <option value="">All Sections</option>
                  {SECTION_OPTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                </select>
              </div>
              <div className="flex items-end pb-0.5">
                <motion.label
                  whileHover={{ x: 2 }} transition={spring.snappy}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div
                    className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                    style={{
                      background: collabOnly ? 'var(--text-primary)' : 'transparent',
                      border: `2px solid ${collabOnly ? 'var(--text-primary)' : 'var(--border-strong)'}`,
                    }}
                    onClick={() => setCollabOnly(v => !v)}
                  >
                    {collabOnly && <span style={{ color: 'var(--bg-card)', fontSize: '0.65rem', fontWeight: 700 }}>✓</span>}
                  </div>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Open to collaboration only</span>
                </motion.label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="text-xs mb-4"
        style={{ color: 'var(--text-tertiary)' }}
      >
        Showing <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{filtered.length}</span> students
      </motion.p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No students found" description="Try adjusting your search or filters." />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filtered.map(u => (
            <StudentCard key={u.id} student={u} onMessage={handleMessage} />
          ))}
        </motion.div>
      )}
    </div>
  )
}
