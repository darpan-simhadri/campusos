import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Code2, Plus, Heart, Github, ExternalLink, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { subscribeToProjects, createProject, likeProject } from '../services/firebaseService'
import { SkeletonCard } from '../components/ui/Skeleton'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'

const TECH_STACK_OPTIONS = ['React', 'Node.js', 'Python', 'Firebase', 'MongoDB', 'PostgreSQL', 'TensorFlow', 'FastAPI', 'Flutter', 'Next.js', 'TypeScript', 'Docker', 'AWS']

function ProjectCard({ proj, uid, onLike }) {
  const liked = proj.likes?.includes(uid)
  return (
    <motion.div whileHover={{ y: -2 }} className="card hover:border-gray-700 transition-all">
      {proj.screenshot && (
        <img src={proj.screenshot} alt={proj.title} className="w-full h-40 object-cover rounded-lg mb-4 border border-gray-800" />
      )}
      <h3 className="font-semibold text-white">{proj.title}</h3>
      <p className="text-xs text-gray-500 mt-0.5">by {proj.authorName}</p>
      {proj.description && <p className="text-gray-400 text-sm mt-2 line-clamp-2">{proj.description}</p>}

      {proj.techStack?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {proj.techStack.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={() => onLike(proj.id)}
            className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'}`}>
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            {proj.likes?.length || 0}
          </button>
        </div>
        <div className="flex items-center gap-2">
          {proj.githubLink && (
            <a href={proj.githubLink} target="_blank" rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
              <Github className="w-4 h-4" />
            </a>
          )}
          {proj.demoLink && (
            <a href={proj.demoLink} target="_blank" rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
              <ExternalLink className="w-4 h-4" />
            </a>
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
    const unsub = subscribeToProjects(data => { setProjects(data); setLoading(false) })
    return unsub
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Project Showcase</h1>
          <p className="text-gray-400 text-sm mt-1">Showcase your builds to the campus community</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState icon={Code2} title="No projects yet"
          description="Share your first project with the campus!"
          action={<button onClick={() => setShowModal(true)} className="btn-primary mt-2">Add Project</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => <ProjectCard key={p.id} proj={p} uid={user?.uid} onLike={likeProject} />)}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Showcase a Project" size="lg">
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Project Name *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="My Awesome Project" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What does this project do?" rows={3} className="input-field resize-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Tech Stack</label>
            <div className="flex gap-2 mb-2">
              <input value={techInput} onChange={e => setTechInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTech())}
                placeholder="Add technology..." className="input-field flex-1 text-sm py-2" />
              <button onClick={() => addTech()} className="btn-secondary px-3 text-sm">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {TECH_STACK_OPTIONS.map(t => (
                <button key={t} onClick={() => addTech(t)}
                  className={`tag cursor-pointer hover:bg-indigo-600/30 transition-colors ${form.techStack.includes(t) ? 'opacity-50' : ''}`}>{t}</button>
              ))}
            </div>
            {form.techStack.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-800">
                {form.techStack.map(t => (
                  <span key={t} className="flex items-center gap-1 tag">
                    {t} <button onClick={() => removeTech(t)} className="hover:text-red-400 ml-1">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">GitHub Link</label>
              <input value={form.githubLink} onChange={e => setForm(f => ({ ...f, githubLink: e.target.value }))}
                placeholder="https://github.com/..." className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Live Demo Link</label>
              <input value={form.demoLink} onChange={e => setForm(f => ({ ...f, demoLink: e.target.value }))}
                placeholder="https://..." className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Screenshot URL</label>
            <input value={form.screenshot} onChange={e => setForm(f => ({ ...f, screenshot: e.target.value }))}
              placeholder="https://..." className="input-field" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleCreate} disabled={submitting || !form.title}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Showcase Project
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
