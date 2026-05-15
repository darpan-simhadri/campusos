import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Archive, Search, Plus, Loader2, Github, GraduationCap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { subscribeToArchivedProjects, createArchivedProject } from '../services/firebaseService'
import { SkeletonCard } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { spring, staggerContainer, staggerItem } from '../lib/motion'

function ArchiveCard({ project }) {
  return (
    <motion.div
      variants={staggerItem}
      layout
      whileHover={{ y: -4, boxShadow: 'var(--shadow-md)' }}
      transition={spring.smooth}
      className="card flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{project.title}</h3>
          <p className="text-xs mt-1 font-medium flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
            <GraduationCap className="w-3.5 h-3.5" />
            {project.course}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {project.grade && (
            <span className="badge font-bold px-3 py-1 text-sm"
              style={{ color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              Grade: {project.grade}
            </span>
          )}
          {project.batch && <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Batch {project.batch}</span>}
        </div>
      </div>

      <p className="text-sm mb-4 flex-1" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{project.description}</p>

      {project.techStack && project.techStack.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.techStack.map(tech => <span key={tech} className="tag text-[10px] py-0.5">{tech}</span>)}
        </div>
      )}

      <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
            {project.authorName?.[0]}
          </div>
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{project.authorName}</span>
        </div>
        {project.repoLink && (
          <a href={project.repoLink} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium hover:opacity-70 transition-opacity"
            style={{ color: 'var(--text-secondary)' }}>
            <Github className="w-4 h-4" /> Source
          </a>
        )}
      </div>
    </motion.div>
  )
}

export default function ProjectArchive() {
  const { user, profile } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [form, setForm] = useState({ title: '', course: '', description: '', techStack: '', repoLink: '', grade: '', batch: '2024' })

  useEffect(() => {
    const unsub = subscribeToArchivedProjects(data => { setProjects(data); setLoading(false) })
    return unsub
  }, [])

  const handleCreate = async () => {
    if (!form.title || !form.course) return
    setSubmitting(true)
    await createArchivedProject({
      ...form,
      techStack: form.techStack.split(',').map(t => t.trim()).filter(Boolean),
      authorId: user.uid,
      authorName: profile?.fullName,
    })
    setForm({ title: '', course: '', description: '', techStack: '', repoLink: '', grade: '', batch: '2024' })
    setShowModal(false)
    setSubmitting(false)
  }

  const uniqueCourses = [...new Set(projects.map(p => p.course))].filter(Boolean)

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.course?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    const matchesCourse = courseFilter === '' || p.course === courseFilter
    return matchesSearch && matchesCourse
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
            <Archive className="w-6 h-6" style={{ color: 'var(--text-secondary)' }} />
            Class Project Resurrection
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Explore past assignments, labs, and major projects from previous batches to see how they were solved.</p>
        </div>
        <motion.button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 whitespace-nowrap"
          whileHover={{ y: -1, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}
          whileTap={{ scale: 0.97 }}
          transition={spring.snappy}
        >
          <Plus className="w-4 h-4" /> Archive Project
        </motion.button>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-placeholder)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, description, or tech stack..."
            className="input-field pl-10" />
        </div>
        <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="input-field md:w-64">
          <option value="">All Courses</option>
          {uniqueCourses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState icon={Archive} title="No projects found" description="No past projects match your search criteria." />
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => <ArchiveCard key={project.id} project={project} />)}
        </motion.div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Archive a Class Project">
        <div className="p-6 space-y-4 w-full max-w-2xl">
          <div className="rounded-xl p-3 text-xs"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            Help future batches by uploading your completed assignments and projects. Sharing knowledge strengthens the whole campus!
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Project Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Hotel Booking System" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Course Name *</label>
              <input value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} placeholder="e.g. DBMS Lab" className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description *</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What did you build? What were the key challenges?" rows={3} className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Grade (Optional)</label>
              <input value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} placeholder="e.g. A+" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Graduation Batch</label>
              <input value={form.batch} onChange={e => setForm(f => ({ ...f, batch: e.target.value }))} placeholder="e.g. 2024" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Repo Link</label>
              <input value={form.repoLink} onChange={e => setForm(f => ({ ...f, repoLink: e.target.value }))} placeholder="https://github.com/..." className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Tech Stack (comma separated)</label>
            <input value={form.techStack} onChange={e => setForm(f => ({ ...f, techStack: e.target.value }))} placeholder="React, Express, MongoDB" className="input-field" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <motion.button
              onClick={handleCreate}
              disabled={submitting || !form.title || !form.course}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Archive Project
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
