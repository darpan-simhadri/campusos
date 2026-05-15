import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Github, Search, Plus, Loader2, BookMarked, GitFork, Star } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { subscribeToRepositories, createRepository, starRepository, unstarRepository } from '../services/firebaseService'
import { SkeletonCard } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { spring, staggerContainer, staggerItem } from '../lib/motion'

// Stable fake counts based on repo id (won't re-randomize on re-render)
function stableNum(seed, max, offset = 1) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffffffff
  return (Math.abs(h) % max) + offset
}

function RepoCard({ repo }) {
  const { user } = useAuth()
  const forks = stableNum((repo.id || 'x') + 'f', 25, 1)
  const initialStarred = user?.uid ? (repo.starredBy?.includes(user.uid) || false) : false
  const initialCount   = Array.isArray(repo.starredBy)
    ? repo.starredBy.length
    : (typeof repo.stars === 'number' ? repo.stars : stableNum(repo.id || repo.title || 'x', 60, 3))
  const [starred, setStarred]     = useState(initialStarred)
  const [starCount, setStarCount] = useState(initialCount)

  function toggleStar(e) {
    e.stopPropagation()
    const next = !starred
    setStarred(next)
    setStarCount(c => next ? c + 1 : c - 1)
    if (user?.uid && repo.id) {
      if (next) starRepository(repo.id, user.uid)
      else unstarRepository(repo.id, user.uid)
    }
  }

  const githubUrl = repo.repoLink?.startsWith('http')
    ? repo.repoLink
    : repo.repoLink
      ? `https://github.com/${repo.repoLink}`
      : 'https://github.com'

  return (
    <motion.div
      variants={staggerItem}
      layout
      whileHover={{ y: -4, boxShadow: 'var(--shadow-md)' }}
      transition={spring.smooth}
      className="card flex flex-col h-full"
    >
      <div className="flex items-start gap-3 mb-3">
        <BookMarked className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }} />
        <div className="flex-1 min-w-0">
          <a href={repo.repoLink} target="_blank" rel="noreferrer"
            className="font-bold text-lg truncate block hover:underline"
            style={{ color: 'var(--text-primary)' }}>
            {repo.title}
          </a>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>by {repo.authorName}</p>
        </div>
      </div>

      <p className="text-sm mb-4 flex-1 line-clamp-3" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{repo.description}</p>

      {repo.techStack && repo.techStack.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {repo.techStack.map(tech => (
            <span key={tech} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--text-secondary)' }} />
              {tech}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 pt-4 text-xs font-medium" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-tertiary)' }}>
        {/* Star toggle */}
        <motion.button
          onClick={toggleStar}
          className="flex items-center gap-1 transition-colors"
          style={{ color: starred ? '#FFD700' : 'var(--text-tertiary)', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          whileTap={{ scale: 0.85 }}
          transition={{ duration: 0.12 }}
          title={starred ? 'Unstar' : 'Star this repo'}
        >
          <Star className="w-4 h-4" fill={starred ? '#FFD700' : 'none'} />
          {starCount}
        </motion.button>

        {/* Fork → opens GitHub */}
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="flex items-center gap-1 transition-colors hover:text-white"
          style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }}
          title="Open on GitHub"
        >
          <GitFork className="w-4 h-4" />
          {forks}
        </a>
      </div>
    </motion.div>
  )
}

export default function CampusGitHub() {
  const { user, profile } = useAuth()
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ title: '', description: '', techStack: '', repoLink: '' })

  useEffect(() => {
    const unsub = subscribeToRepositories(data => { setRepos(data); setLoading(false) })
    return unsub
  }, [])

  const handleCreate = async () => {
    if (!form.title || !form.repoLink) return
    setSubmitting(true)
    await createRepository({
      ...form,
      techStack: form.techStack.split(',').map(t => t.trim()).filter(Boolean),
      authorId: user.uid,
      authorName: profile?.fullName,
    })
    setForm({ title: '', description: '', techStack: '', repoLink: '' })
    setShowModal(false)
    setSubmitting(false)
  }

  const filteredRepos = repos.filter(r => {
    const q = search.toLowerCase()
    return r.title?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.techStack?.some(t => t.toLowerCase().includes(q))
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
            <Github className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
            College's GitHub
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Institutional repository memory. Search campus open-source projects by tech stack.</p>
        </div>
        <motion.button
          onClick={() => setShowModal(true)}
          className="btn-secondary flex items-center gap-2 whitespace-nowrap"
          whileHover={{ y: -1, boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}
          whileTap={{ scale: 0.97 }}
          transition={spring.snappy}
        >
          <Plus className="w-4 h-4" /> Index Repository
        </motion.button>
      </motion.div>

      <div className="relative mb-6 max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-placeholder)' }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search repos by name, description, or tech stack..."
          className="input-field pl-10" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredRepos.length === 0 ? (
        <EmptyState icon={Github} title="No repositories found" description="No projects match your search criteria. Try a different tech stack." />
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepos.map(repo => <RepoCard key={repo.id} repo={repo} />)}
        </motion.div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Index a New Repository">
        <div className="p-6 space-y-4 w-full max-w-xl">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Repository Name *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. campusos-core" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description *</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What does this repository do?" rows={3} className="input-field resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Repository URL *</label>
            <input value={form.repoLink} onChange={e => setForm(f => ({ ...f, repoLink: e.target.value }))} placeholder="https://github.com/yourusername/repo" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tech Stack (comma separated) *</label>
            <input value={form.techStack} onChange={e => setForm(f => ({ ...f, techStack: e.target.value }))} placeholder="TypeScript, Next.js, Prisma" className="input-field" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <motion.button
              onClick={handleCreate}
              disabled={submitting || !form.title || !form.repoLink}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Index Repository
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
