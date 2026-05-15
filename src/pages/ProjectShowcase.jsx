import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Code2, Plus, Heart, Github, ExternalLink, Loader2, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { subscribeToProjects, createProject, likeProject } from '../services/firebaseService'
import { SkeletonCard } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import { spring, staggerContainer, staggerItem } from '../lib/motion'

const TECH_STACK_OPTIONS = ['React', 'Node.js', 'Python', 'Firebase', 'MongoDB', 'PostgreSQL', 'TensorFlow', 'FastAPI', 'Flutter', 'Next.js', 'TypeScript', 'Docker', 'AWS']

function ProjectCard({ proj, uid, onLike }) {
  const liked = proj.likes?.includes(uid)
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4, boxShadow: 'var(--shadow-md)' }}
      transition={spring.smooth}
      className="card flex flex-col"
    >
      {proj.screenshot && (
        <img src={proj.screenshot} alt={proj.title}
          className="w-full h-40 object-cover rounded-xl mb-4"
          style={{ border: '1px solid var(--border)' }}
        />
      )}
      <h3 className="font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        {proj.title}
      </h3>
      <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>by {proj.authorName}</p>
      {proj.description && (
        <p className="text-sm mt-2 line-clamp-2" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{proj.description}</p>
      )}

      {proj.techStack?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {proj.techStack.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-3 mt-4" style={{ borderTop: '1px solid var(--border)' }}>
        <motion.button
          onClick={() => onLike(proj.id, liked)}
          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.85 }} transition={spring.bouncy}
          className="flex items-center gap-1.5 text-sm"
          style={{ color: liked ? '#ef4444' : 'var(--text-tertiary)' }}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          {proj.likes?.length || 0}
        </motion.button>

        <div className="flex items-center gap-2">
          {proj.githubLink && (
            <motion.a
              href={proj.githubLink} target="_blank" rel="noopener noreferrer"
              whileHover={{ scale: 1.15 }} transition={spring.snappy}
              className="p-1.5 rounded-lg"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
            >
              <Github className="w-4 h-4" />
            </motion.a>
          )}
          {proj.demoLink && (
            <motion.a
              href={proj.demoLink} target="_blank" rel="noopener noreferrer"
              whileHover={{ scale: 1.15 }} transition={spring.snappy}
              className="p-1.5 rounded-lg"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
            >
              <ExternalLink className="w-4 h-4" />
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function ProjectShowcase() {
  const { user, profile } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [techInput, setTechInput] = useState('')
  const [form, setForm] = useState({
    title: '', description: '', techStack: [],
    githubLink: '', demoLink: '', screenshot: '',
  })

  useEffect(() => {
    return subscribeToProjects(data => { setProjects(data); setLoading(false) })
  }, [])

  const addTech = (t) => {
    const tech = t || techInput.trim()
    if (tech && !form.techStack.includes(tech)) {
      setForm(f => ({ ...f, techStack: [...f.techStack, tech] }))
      setTechInput('')
    }
  }

  const removeTech = (t) => setForm(f => ({ ...f, techStack: f.techStack.filter(x => x !== t) }))

  const handleCreate = async () => {
    if (!form.title) return
    setSubmitting(true)
    await createProject({ ...form, authorId: user.uid, authorName: profile?.fullName, likes: [] })
    setForm({ title: '', description: '', techStack: [], githubLink: '', demoLink: '', screenshot: '' })
    setShowModal(false)
    setSubmitting(false)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>Project Showcase</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Showcase your builds to the campus community</p>
        </div>
        <motion.button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
          whileHover={{ y: -1, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}
          whileTap={{ scale: 0.97 }}
          transition={spring.snappy}
        >
          <Plus className="w-4 h-4" /> Add Project
        </motion.button>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={Code2}
          title="No projects yet"
          description="Share your first project with the campus!"
          action={<button onClick={() => setShowModal(true)} className="btn-primary mt-2">Add Project</button>}
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {projects.map(p => (
            <ProjectCard key={p.id} proj={p} uid={user?.uid}
              onLike={(id, hasLiked) => likeProject(id, user?.uid, hasLiked)} />
          ))}
        </motion.div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Showcase a Project" size="lg">
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Project Name *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="My Awesome Project" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What does this project do?" rows={3} className="input-field resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Tech Stack</label>
            <div className="flex gap-2 mb-2">
              <input value={techInput} onChange={e => setTechInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTech())}
                placeholder="Add technology..." className="input-field flex-1 text-sm py-2" />
              <button onClick={() => addTech()} className="btn-secondary px-3 text-sm">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {TECH_STACK_OPTIONS.map(t => (
                <motion.button
                  key={t}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={spring.snappy}
                  onClick={() => addTech(t)}
                  className="tag cursor-pointer"
                  style={{ opacity: form.techStack.includes(t) ? 0.4 : 1 }}
                >
                  {t}
                </motion.button>
              ))}
            </div>
            {form.techStack.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                {form.techStack.map(t => (
                  <span key={t} className="flex items-center gap-1 tag">
                    {t}
                    <button onClick={() => removeTech(t)} style={{ color: 'var(--text-tertiary)' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>GitHub Link</label>
              <input value={form.githubLink} onChange={e => setForm(f => ({ ...f, githubLink: e.target.value }))}
                placeholder="https://github.com/..." className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Live Demo Link</label>
              <input value={form.demoLink} onChange={e => setForm(f => ({ ...f, demoLink: e.target.value }))}
                placeholder="https://..." className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Screenshot URL</label>
            <input value={form.screenshot} onChange={e => setForm(f => ({ ...f, screenshot: e.target.value }))}
              placeholder="https://..." className="input-field" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <motion.button
              onClick={handleCreate}
              disabled={submitting || !form.title}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Showcase Project
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
