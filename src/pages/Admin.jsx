import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, Users, BarChart2, AlertTriangle, Trash2, Ban,
  CheckCircle, Loader2, TrendingUp, Briefcase, Trophy,
  Zap, BookOpen, Activity, Database, RefreshCw,
  Code2, HelpCircle, UserCheck, Star, MessageSquare, Settings,
  Lightbulb, Rocket, HandHeart, ArrowLeftRight, FileQuestion,
  MapPin, Archive, GitBranch, Building2, BookMarked,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  getAllUsersAdmin, suspendUser, unsuspendUser,
  deleteDocument, seedDummyData,
} from '../services/firebaseService'
import { SkeletonCard } from '../components/ui/Skeleton'
import { useNavigate } from 'react-router-dom'
import {
  getDocs, collection, query, orderBy, updateDoc, doc,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { spring } from '../lib/motion'

// ─── Color palette for chart bars ────────────────────────────────────────────

const BAR_COLORS = [
  '#6366f1', '#8b5cf6', '#3b82f6', '#10b981',
  '#f59e0b', '#f43f5e', '#06b6d4', '#f97316', '#ec4899',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, iconColor, iconBg, trend }) {
  return (
    <div className="card flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
        <Icon className="w-6 h-6" style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold" style={{ color: iconColor }}>{value}</p>
        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
      </div>
      {trend && (
        <span className="text-xs flex items-center gap-1 flex-shrink-0" style={{ color: '#10b981' }}>
          <TrendingUp className="w-3 h-3" /> {trend}
        </span>
      )}
    </div>
  )
}

function HorizontalBar({ label, count, total, color }) {
  const pct = total ? Math.round((count / total) * 100) : 0
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="truncate max-w-[200px]" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="ml-2 flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>{count} ({pct}%)</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function TabBtn({ active, onClick, icon: Icon, label, badge }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
      className="relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
      style={{
        background: active ? 'var(--text-primary)' : 'var(--bg-secondary)',
        color: active ? 'var(--bg-card)' : 'var(--text-secondary)',
        border: `1px solid ${active ? 'var(--text-primary)' : 'var(--border)'}`,
      }}
    >
      <Icon className="w-4 h-4" />
      {label}
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] rounded-full flex items-center justify-center font-bold"
          style={{ background: '#ef4444', color: 'white' }}>
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </motion.button>
  )
}

function DeleteRow({ children, onDelete }) {
  return (
    <div className="card flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">{children}</div>
      <button
        onClick={onDelete}
        className="flex items-center gap-1 text-xs px-2 py-1 rounded flex-shrink-0 hover:opacity-80 transition-opacity"
        style={{ color: '#ef4444' }}
      >
        <Trash2 className="w-3.5 h-3.5" /> Delete
      </button>
    </div>
  )
}

// ─── Content Moderation Sub-panel ─────────────────────────────────────────────

function ContentModeration({
  posts, setPosts,
  achievements, setAchievements,
  projects, setProjects,
  challenges, setChallenges,
  sosPosts, setSosPosts,
  ideas, setIdeas,
  buildUpdates, setBuildUpdates,
  skillExchanges, setSkillExchanges,
  polls, setPolls,
  lostFound, setLostFound,
  studyGroups, setStudyGroups,
  knowledgeBase, setKnowledgeBase,
  projectArchive, setProjectArchive,
  repositories, setRepositories,
  internshipReviews, setInternshipReviews,
}) {
  const [subtab, setSubtab] = useState('posts')

  const del = (col, id, setter) => async () => {
    await deleteDocument(col, id)
    setter(prev => prev.filter(item => item.id !== id))
  }

  const handleVerifyAchievement = async (id, current) => {
    await updateDoc(doc(db, 'achievements', id), { verified: !current })
    setAchievements(prev => prev.map(a => a.id === id ? { ...a, verified: !current } : a))
  }

  const subtabs = [
    { id: 'posts',             label: `Questions (${posts.length})` },
    { id: 'achievements',      label: `Achievements (${achievements.length})` },
    { id: 'projects',          label: `Projects (${projects.length})` },
    { id: 'challenges',        label: `Challenges (${challenges.length})` },
    { id: 'sosPosts',          label: `SOS Posts (${sosPosts.length})` },
    { id: 'ideas',             label: `Ideas (${ideas.length})` },
    { id: 'buildUpdates',      label: `Build Logs (${buildUpdates.length})` },
    { id: 'skillExchanges',    label: `Skill Exchange (${skillExchanges.length})` },
    { id: 'polls',             label: `Polls (${polls.length})` },
    { id: 'lostFound',         label: `Lost & Found (${lostFound.length})` },
    { id: 'studyGroups',       label: `Study Groups (${studyGroups.length})` },
    { id: 'knowledgeBase',     label: `Knowledge Base (${knowledgeBase.length})` },
    { id: 'projectArchive',    label: `Project Archive (${projectArchive.length})` },
    { id: 'repositories',      label: `Repositories (${repositories.length})` },
    { id: 'internshipReviews', label: `Internship Reviews (${internshipReviews.length})` },
  ]

  const empty = (msg = 'Nothing here yet.') => (
    <div className="card text-center py-8" style={{ color: 'var(--text-tertiary)' }}>{msg}</div>
  )

  const Badge = ({ children, color, bg }) => (
    <span className="badge text-xs" style={{ color, background: bg, border: `1px solid ${color}22` }}>{children}</span>
  )

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {subtabs.map(st => (
          <motion.button
            key={st.id}
            onClick={() => setSubtab(st.id)}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{
              background: subtab === st.id ? 'var(--bg-secondary)' : 'transparent',
              color: subtab === st.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
              border: `1px solid ${subtab === st.id ? 'var(--border)' : 'transparent'}`,
            }}
          >
            {st.label}
          </motion.button>
        ))}
      </div>

      {subtab === 'posts' && (
        <div className="space-y-2">
          {posts.length === 0 ? empty() : posts.map(p => (
            <DeleteRow key={p.id} onDelete={del('posts', p.id, setPosts)}>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {p.solved && <Badge color="#10b981" bg="rgba(16,185,129,0.1)">Solved</Badge>}
                {p.anonymous && <Badge color="var(--text-tertiary)" bg="var(--bg-secondary)">Anonymous</Badge>}
                {(p.tags || []).slice(0, 2).map(tag => (
                  <Badge key={tag} color="#6366f1" bg="rgba(99,102,241,0.1)">{tag}</Badge>
                ))}
              </div>
              <h4 className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{p.title}</h4>
              <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>{p.description}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                By: {p.anonymous ? 'Anonymous' : (p.authorName || 'Unknown')} · {(p.upvotes || []).length} upvotes
              </p>
            </DeleteRow>
          ))}
        </div>
      )}

      {subtab === 'achievements' && (
        <div className="space-y-2">
          {achievements.length === 0 ? empty() : achievements.map(a => (
            <div key={a.id} className="card flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge color="#f59e0b" bg="rgba(245,158,11,0.1)">{a.type}</Badge>
                  {a.verified && <Badge color="#10b981" bg="rgba(16,185,129,0.1)">✓ Verified</Badge>}
                </div>
                <h4 className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{a.title}</h4>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>By: {a.authorName} · {(a.likes || []).length} likes</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => handleVerifyAchievement(a.id, a.verified)}
                  className="text-xs px-2 py-1 rounded hover:opacity-80 transition-opacity"
                  style={{ color: a.verified ? '#f59e0b' : '#10b981' }}>
                  {a.verified ? 'Unverify' : 'Verify'}
                </button>
                <button onClick={del('achievements', a.id, setAchievements)}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded hover:opacity-80 transition-opacity"
                  style={{ color: '#ef4444' }}>
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {subtab === 'projects' && (
        <div className="space-y-2">
          {projects.length === 0 ? empty() : projects.map(p => (
            <DeleteRow key={p.id} onDelete={del('projects', p.id, setProjects)}>
              <div className="flex gap-1 flex-wrap mb-1">
                {(p.techStack || []).slice(0, 3).map(t => (
                  <Badge key={t} color="var(--text-secondary)" bg="var(--bg-secondary)">{t}</Badge>
                ))}
              </div>
              <h4 className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{p.title}</h4>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>By: {p.authorName} · {(p.likes || []).length} likes</p>
            </DeleteRow>
          ))}
        </div>
      )}

      {subtab === 'challenges' && (
        <div className="space-y-2">
          {challenges.length === 0 ? empty() : challenges.map(c => (
            <DeleteRow key={c.id} onDelete={del('challenges', c.id, setChallenges)}>
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  color={c.difficulty === 'Hard' ? '#ef4444' : c.difficulty === 'Medium' ? '#f59e0b' : '#10b981'}
                  bg={c.difficulty === 'Hard' ? 'rgba(239,68,68,0.1)' : c.difficulty === 'Medium' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)'}
                >
                  {c.difficulty}
                </Badge>
                <Badge color="#6366f1" bg="rgba(99,102,241,0.1)">{c.type}</Badge>
              </div>
              <h4 className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{c.title}</h4>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{c.rewardPoints || c.points || 0} pts · By: {c.authorName}</p>
            </DeleteRow>
          ))}
        </div>
      )}

      {subtab === 'sosPosts' && (
        <div className="space-y-2">
          {sosPosts.length === 0 ? empty() : sosPosts.map(p => (
            <DeleteRow key={p.id} onDelete={del('sosPosts', p.id, setSosPosts)}>
              <div className="flex items-center gap-2 mb-1">
                <Badge color={p.resolved ? '#10b981' : '#ef4444'} bg={p.resolved ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'}>
                  {p.resolved ? 'Resolved' : 'Active'}
                </Badge>
                {p.status === 'claimed' && <Badge color="#f59e0b" bg="rgba(245,158,11,0.1)">Claimed</Badge>}
              </div>
              <h4 className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{p.title}</h4>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>By: {p.authorName}</p>
            </DeleteRow>
          ))}
        </div>
      )}

      {subtab === 'ideas' && (
        <div className="space-y-2">
          {ideas.length === 0 ? empty() : ideas.map(i => (
            <DeleteRow key={i.id} onDelete={del('ideas', i.id, setIdeas)}>
              <div className="flex gap-1 flex-wrap mb-1">
                {(i.tags || []).slice(0, 3).map(t => (
                  <Badge key={t} color="#f59e0b" bg="rgba(245,158,11,0.1)">{t}</Badge>
                ))}
              </div>
              <h4 className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{i.title}</h4>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>By: {i.authorName} · {(i.upvotes || []).length} upvotes</p>
              <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>{i.description}</p>
            </DeleteRow>
          ))}
        </div>
      )}

      {subtab === 'buildUpdates' && (
        <div className="space-y-2">
          {buildUpdates.length === 0 ? empty() : buildUpdates.map(b => (
            <DeleteRow key={b.id} onDelete={del('buildUpdates', b.id, setBuildUpdates)}>
              <div className="flex gap-1 flex-wrap mb-1">
                {(b.tags || []).slice(0, 3).map(t => (
                  <Badge key={t} color="var(--text-secondary)" bg="var(--bg-secondary)">{t}</Badge>
                ))}
              </div>
              <h4 className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{b.title}</h4>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>By: {b.authorName} · {(b.likes || []).length} likes</p>
            </DeleteRow>
          ))}
        </div>
      )}

      {subtab === 'skillExchanges' && (
        <div className="space-y-2">
          {skillExchanges.length === 0 ? empty() : skillExchanges.map(s => (
            <DeleteRow key={s.id} onDelete={del('skillExchanges', s.id, setSkillExchanges)}>
              <h4 className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{s.title || `${s.authorName}'s Exchange`}</h4>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Offers: {(s.offerSkills || [s.offerSkill]).filter(Boolean).join(', ')}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Wants: {(s.wantedSkills || [s.wantSkill]).filter(Boolean).join(', ')}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>By: {s.authorName}</p>
            </DeleteRow>
          ))}
        </div>
      )}

      {subtab === 'polls' && (
        <div className="space-y-2">
          {polls.length === 0 ? empty() : polls.map(p => (
            <DeleteRow key={p.id} onDelete={del('polls', p.id, setPolls)}>
              <h4 className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{p.question}</h4>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                By: {p.authorName} · {(p.options || []).length} options
              </p>
            </DeleteRow>
          ))}
        </div>
      )}

      {subtab === 'lostFound' && (
        <div className="space-y-2">
          {lostFound.length === 0 ? empty() : lostFound.map(l => (
            <DeleteRow key={l.id} onDelete={del('lostFound', l.id, setLostFound)}>
              <div className="flex items-center gap-2 mb-1">
                <Badge color={l.type === 'lost' ? '#ef4444' : '#10b981'} bg={l.type === 'lost' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)'}>
                  {l.type === 'lost' ? 'Lost' : 'Found'}
                </Badge>
                {l.resolved && <Badge color="var(--text-tertiary)" bg="var(--bg-secondary)">Resolved</Badge>}
              </div>
              <h4 className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{l.title || l.itemName}</h4>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>By: {l.reporterName || l.authorName} · {l.location || 'No location'}</p>
            </DeleteRow>
          ))}
        </div>
      )}

      {subtab === 'studyGroups' && (
        <div className="space-y-2">
          {studyGroups.length === 0 ? empty() : studyGroups.map(sg => (
            <DeleteRow key={sg.id} onDelete={del('studyGroups', sg.id, setStudyGroups)}>
              <div className="flex items-center gap-2 mb-1">
                <Badge color="var(--text-secondary)" bg="var(--bg-secondary)">{sg.subject || sg.topic}</Badge>
              </div>
              <h4 className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{sg.name || sg.title}</h4>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                By: {sg.creatorName || sg.authorName} · {(sg.members || []).length} members
              </p>
            </DeleteRow>
          ))}
        </div>
      )}

      {subtab === 'knowledgeBase' && (
        <div className="space-y-2">
          {knowledgeBase.length === 0 ? empty() : knowledgeBase.map(k => (
            <DeleteRow key={k.id} onDelete={del('knowledgeBase', k.id, setKnowledgeBase)}>
              <div className="flex items-center gap-2 mb-1">
                <Badge color="var(--text-secondary)" bg="var(--bg-secondary)">{k.category}</Badge>
              </div>
              <h4 className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{k.title}</h4>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>By: {k.authorName}</p>
            </DeleteRow>
          ))}
        </div>
      )}

      {subtab === 'projectArchive' && (
        <div className="space-y-2">
          {projectArchive.length === 0 ? empty() : projectArchive.map(p => (
            <DeleteRow key={p.id} onDelete={del('projectArchive', p.id, setProjectArchive)}>
              <div className="flex items-center gap-2 mb-1">
                <Badge color="var(--text-secondary)" bg="var(--bg-secondary)">{p.course}</Badge>
                {p.year && <Badge color="var(--text-tertiary)" bg="var(--bg-secondary)">{p.year}</Badge>}
              </div>
              <h4 className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{p.title}</h4>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>By: {p.authorName}</p>
            </DeleteRow>
          ))}
        </div>
      )}

      {subtab === 'repositories' && (
        <div className="space-y-2">
          {repositories.length === 0 ? empty() : repositories.map(r => (
            <DeleteRow key={r.id} onDelete={del('repositories', r.id, setRepositories)}>
              <div className="flex gap-1 flex-wrap mb-1">
                {(r.tags || r.techStack || []).slice(0, 3).map(t => (
                  <Badge key={t} color="var(--text-secondary)" bg="var(--bg-secondary)">{t}</Badge>
                ))}
              </div>
              <h4 className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{r.title || r.name}</h4>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>By: {r.authorName}</p>
            </DeleteRow>
          ))}
        </div>
      )}

      {subtab === 'internshipReviews' && (
        <div className="space-y-2">
          {internshipReviews.length === 0 ? empty() : internshipReviews.map(r => (
            <DeleteRow key={r.id} onDelete={del('internshipReviews', r.id, setInternshipReviews)}>
              <div className="flex items-center gap-2 mb-1">
                <Badge color="#10b981" bg="rgba(16,185,129,0.1)">{r.company}</Badge>
                {r.rating && <Badge color="#f59e0b" bg="rgba(245,158,11,0.1)">⭐ {r.rating}/5</Badge>}
              </div>
              <h4 className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{r.role || r.title}</h4>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>By: {r.authorName}</p>
            </DeleteRow>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Admin Component ─────────────────────────────────────────────────────

export default function Admin() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [tab, setTab] = useState('overview')

  const [users, setUsers] = useState([])
  const [reports, setReports] = useState([])
  const [opportunities, setOpportunities] = useState([])
  const [posts, setPosts] = useState([])
  const [achievements, setAchievements] = useState([])
  const [challenges, setChallenges] = useState([])
  const [projects, setProjects] = useState([])
  const [studyGroups, setStudyGroups] = useState([])
  const [sosPosts, setSosPosts] = useState([])
  const [ideas, setIdeas] = useState([])
  const [buildUpdates, setBuildUpdates] = useState([])
  const [skillExchanges, setSkillExchanges] = useState([])
  const [polls, setPolls] = useState([])
  const [lostFound, setLostFound] = useState([])
  const [knowledgeBase, setKnowledgeBase] = useState([])
  const [projectArchive, setProjectArchive] = useState([])
  const [repositories, setRepositories] = useState([])
  const [internshipReviews, setInternshipReviews] = useState([])

  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [userBranchFilter, setUserBranchFilter] = useState('all')

  useEffect(() => {
    if (profile?.email !== 'sathvikatummala281@gmail.com') { navigate('/dashboard'); return }
    fetchAll()
  }, [profile])

  const fetchAll = async () => {
    setLoading(true)
    const fetch = (col, ord = 'createdAt') =>
      getDocs(query(collection(db, col), orderBy(ord, 'desc')))
        .then(s => s.docs.map(d => ({ id: d.id, ...d.data() })))
        .catch(() => [])

    const [
      u, r, opp, p, ach, ch, proj, sg,
      sos, id, bu, se, po, lf, kb, pa, repo, ir,
    ] = await Promise.all([
      getDocs(collection(db, 'users')).then(s => s.docs.map(d => ({ id: d.id, ...d.data() }))),
      fetch('reports'),
      fetch('opportunities'),
      fetch('posts'),
      fetch('achievements'),
      fetch('challenges'),
      fetch('projects'),
      fetch('studyGroups'),
      fetch('sosPosts'),
      fetch('ideas'),
      fetch('buildUpdates'),
      fetch('skillExchanges'),
      fetch('polls'),
      fetch('lostFound'),
      fetch('knowledgeBase'),
      fetch('projectArchive'),
      fetch('repositories'),
      fetch('internshipReviews'),
    ])

    setUsers(u); setReports(r); setOpportunities(opp)
    setPosts(p); setAchievements(ach); setChallenges(ch)
    setProjects(proj); setStudyGroups(sg)
    setSosPosts(sos); setIdeas(id); setBuildUpdates(bu)
    setSkillExchanges(se); setPolls(po); setLostFound(lf)
    setKnowledgeBase(kb); setProjectArchive(pa)
    setRepositories(repo); setInternshipReviews(ir)
    setLoading(false)
  }

  const handleSuspend = async (uid, suspended) => {
    if (suspended) await unsuspendUser(uid)
    else await suspendUser(uid)
    setUsers(prev => prev.map(u => u.id === uid ? { ...u, suspended: !suspended } : u))
  }

  const handleRoleChange = async (uid, newRole) => {
    await updateDoc(doc(db, 'users', uid), { role: newRole })
    setUsers(prev => prev.map(u => u.id === uid ? { ...u, role: newRole } : u))
  }

  const handlePinOpportunity = async (id, pinned) => {
    await updateDoc(doc(db, 'opportunities', id), { pinned: !pinned })
    setOpportunities(prev => prev.map(o => o.id === id ? { ...o, pinned: !pinned } : o))
  }

  const handleDismissReport = async (id) => {
    await deleteDocument('reports', id)
    setReports(prev => prev.filter(r => r.id !== id))
  }

  const handleRemoveOpportunity = async (id) => {
    await deleteDocument('opportunities', id)
    setOpportunities(prev => prev.filter(o => o.id !== id))
  }

  const handleSeed = async () => {
    setSeeding(true)
    await seedDummyData()
    setSeeding(false)
    await fetchAll()
  }

  const branchCounts = users.reduce((acc, u) => {
    if (u.branch) acc[u.branch] = (acc[u.branch] || 0) + 1
    return acc
  }, {})
  const sortedBranches = Object.entries(branchCounts).sort((a, b) => b[1] - a[1])

  const skillCounts = users.reduce((acc, u) => {
    ;(u.skills || []).forEach(s => { acc[s] = (acc[s] || 0) + 1 })
    return acc
  }, {})
  const topSkills = Object.entries(skillCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)

  const sectionCounts = users.reduce((acc, u) => {
    if (u.section) acc[u.section] = (acc[u.section] || 0) + 1
    return acc
  }, {})

  const totalContent = posts.length + achievements.length + projects.length + challenges.length +
    sosPosts.length + ideas.length + buildUpdates.length + skillExchanges.length +
    polls.length + lostFound.length + studyGroups.length + knowledgeBase.length +
    projectArchive.length + repositories.length + internshipReviews.length

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => !u.suspended).length,
    suspended: users.filter(u => u.suspended).length,
    admins: users.filter(u => u.role === 'admin').length,
    moderators: users.filter(u => u.role === 'moderator').length,
    posts: posts.length,
    solvedPosts: posts.filter(p => p.solved).length,
    opportunities: opportunities.length,
    achievements: achievements.length,
    challenges: challenges.length,
    projects: projects.length,
    studyGroups: studyGroups.length,
    reports: reports.length,
    sosPosts: sosPosts.length,
    ideas: ideas.length,
    buildUpdates: buildUpdates.length,
    skillExchanges: skillExchanges.length,
    polls: polls.length,
    lostFound: lostFound.length,
    knowledgeBase: knowledgeBase.length,
    projectArchive: projectArchive.length,
    repositories: repositories.length,
    internshipReviews: internshipReviews.length,
    totalContent,
  }

  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase()
    const matchSearch = !q ||
      u.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.registrationNumber?.toLowerCase().includes(q)
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter
    const matchBranch = userBranchFilter === 'all' || u.branch === userBranchFilter
    return matchSearch && matchRole && matchBranch
  })

  const branches = [...new Set(users.map(u => u.branch).filter(Boolean))].sort()

  if (loading) return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <Shield className="w-5 h-5" style={{ color: '#ef4444' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>Admin Panel</h1>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              CampusOS community management · {stats.totalUsers} users · {stats.totalContent} posts
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <motion.button
            onClick={fetchAll}
            whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </motion.button>
          <motion.button
            onClick={handleSeed}
            disabled={seeding}
            whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
            className="btn-secondary flex items-center gap-2"
            style={{ borderColor: 'rgba(99,102,241,0.4)', color: '#6366f1' }}
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            {seeding ? 'Seeding…' : 'Seed Data'}
          </motion.button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        <TabBtn active={tab === 'overview'} onClick={() => setTab('overview')} icon={Activity} label="Overview" />
        <TabBtn active={tab === 'users'} onClick={() => setTab('users')} icon={Users} label={`Users (${stats.totalUsers})`} />
        <TabBtn active={tab === 'content'} onClick={() => setTab('content')} icon={Code2} label={`Content (${stats.totalContent})`} />
        <TabBtn active={tab === 'opportunities'} onClick={() => setTab('opportunities')} icon={Briefcase} label={`Opportunities (${stats.opportunities})`} />
        <TabBtn active={tab === 'reports'} onClick={() => setTab('reports')} icon={AlertTriangle} label="Reports" badge={stats.reports} />
        <TabBtn active={tab === 'analytics'} onClick={() => setTab('analytics')} icon={BarChart2} label="Analytics" />
      </div>

      {/* ── Overview ────────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Users" value={stats.totalUsers} icon={Users} iconColor="#6366f1" iconBg="rgba(99,102,241,0.12)" trend="+12%" />
            <StatCard label="Active Users" value={stats.activeUsers} icon={UserCheck} iconColor="#10b981" iconBg="rgba(16,185,129,0.12)" />
            <StatCard label="Suspended" value={stats.suspended} icon={Ban} iconColor="#ef4444" iconBg="rgba(239,68,68,0.12)" />
            <StatCard label="Open Reports" value={stats.reports} icon={AlertTriangle} iconColor="#f59e0b" iconBg="rgba(245,158,11,0.12)" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Opportunities" value={stats.opportunities} icon={Briefcase} iconColor="#3b82f6" iconBg="rgba(59,130,246,0.12)" />
            <StatCard label="Achievements" value={stats.achievements} icon={Trophy} iconColor="#8b5cf6" iconBg="rgba(139,92,246,0.12)" />
            <StatCard label="Challenges" value={stats.challenges} icon={Zap} iconColor="#eab308" iconBg="rgba(234,179,8,0.12)" />
            <StatCard label="Study Groups" value={stats.studyGroups} icon={BookOpen} iconColor="#06b6d4" iconBg="rgba(6,182,212,0.12)" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Questions Asked" value={stats.posts} icon={HelpCircle} iconColor="#ec4899" iconBg="rgba(236,72,153,0.12)" />
            <StatCard label="Solved Questions" value={stats.solvedPosts} icon={CheckCircle} iconColor="#10b981" iconBg="rgba(16,185,129,0.12)" />
            <StatCard label="Projects" value={stats.projects} icon={Code2} iconColor="#f97316" iconBg="rgba(249,115,22,0.12)" />
            <StatCard label="Admins / Mods" value={`${stats.admins} / ${stats.moderators}`} icon={Shield} iconColor="#ef4444" iconBg="rgba(239,68,68,0.12)" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="SOS Posts" value={stats.sosPosts} icon={HandHeart} iconColor="#ef4444" iconBg="rgba(239,68,68,0.12)" />
            <StatCard label="Startup Ideas" value={stats.ideas} icon={Lightbulb} iconColor="#f59e0b" iconBg="rgba(245,158,11,0.12)" />
            <StatCard label="Build Logs" value={stats.buildUpdates} icon={Rocket} iconColor="#3b82f6" iconBg="rgba(59,130,246,0.12)" />
            <StatCard label="Skill Exchanges" value={stats.skillExchanges} icon={ArrowLeftRight} iconColor="#10b981" iconBg="rgba(16,185,129,0.12)" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Polls" value={stats.polls} icon={BarChart2} iconColor="#8b5cf6" iconBg="rgba(139,92,246,0.12)" />
            <StatCard label="Lost & Found" value={stats.lostFound} icon={MapPin} iconColor="#f43f5e" iconBg="rgba(244,63,94,0.12)" />
            <StatCard label="Knowledge Base" value={stats.knowledgeBase} icon={BookMarked} iconColor="#06b6d4" iconBg="rgba(6,182,212,0.12)" />
            <StatCard label="Internship Reviews" value={stats.internshipReviews} icon={Building2} iconColor="#6366f1" iconBg="rgba(99,102,241,0.12)" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <BarChart2 className="w-4 h-4" style={{ color: '#6366f1' }} /> Branch Distribution
              </h3>
              {sortedBranches.length === 0
                ? <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No branch data yet.</p>
                : <div className="space-y-3">
                  {sortedBranches.map(([branch, count], i) => (
                    <HorizontalBar key={branch} label={branch} count={count} total={users.length} color={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </div>
              }
            </div>

            <div className="card">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Star className="w-4 h-4" style={{ color: '#f59e0b' }} /> Top Skills on Campus
              </h3>
              {topSkills.length === 0
                ? <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No skills data yet.</p>
                : <div className="space-y-2">
                  {topSkills.map(([skill, count]) => (
                    <div key={skill} className="flex items-center justify-between rounded-lg px-3 py-2"
                      style={{ background: 'var(--bg-secondary)' }}>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{skill}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ color: '#6366f1', background: 'rgba(99,102,241,0.1)' }}>{count} students</span>
                    </div>
                  ))}
                </div>
              }
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Section Distribution</h3>
            {Object.keys(sectionCounts).length === 0
              ? <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No section data yet.</p>
              : <div className="flex gap-4 flex-wrap">
                {Object.entries(sectionCounts).sort().map(([section, count]) => (
                  <div key={section} className="text-center">
                    <div className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center gap-1"
                      style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                      <span className="text-2xl font-bold" style={{ color: '#6366f1' }}>{section}</span>
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{count} students</span>
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        </motion.div>
      )}

      {/* ── Users ───────────────────────────────────────────────────────── */}
      {tab === 'users' && (
        <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
              placeholder="Search name, email, reg#…" className="input-field flex-1 min-w-[200px] max-w-sm" />
            <select value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)} className="input-field w-36">
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
            <select value={userBranchFilter} onChange={e => setUserBranchFilter(e.target.value)} className="input-field w-56">
              <option value="all">All Branches</option>
              {branches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{filteredUsers.length} of {users.length} users</p>

          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ background: 'var(--bg-secondary)' }}>
                  <tr>
                    {['Student', 'Branch', 'Reg. No.', 'Sec.', 'Role', 'Rep.', 'Status', 'Actions'].map((h, i) => (
                      <th key={h} className={`text-left px-4 py-3 font-medium ${i > 1 && i < 4 ? 'hidden lg:table-cell' : i === 1 ? 'hidden md:table-cell' : ''}`}
                        style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ borderTop: '1px solid var(--border)' }}>
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:opacity-90 transition-opacity" style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}>
                            {u.fullName?.[0] || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{u.fullName}</p>
                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs max-w-[140px] truncate" style={{ color: 'var(--text-secondary)' }}>{u.branch}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{u.registrationNumber}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="badge text-xs" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>{u.section}</span>
                      </td>
                      <td className="px-4 py-3">
                        {u.email === 'sathvikatummala281@gmail.com'
                          ? <span className="badge text-xs" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)' }}>admin</span>
                          : <select
                            value={u.role || 'student'}
                            onChange={e => handleRoleChange(u.id, e.target.value)}
                            className="text-xs rounded px-2 py-1 focus:outline-none"
                            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                          >
                            <option value="student">student</option>
                            <option value="moderator">moderator</option>
                            <option value="admin">admin</option>
                          </select>
                        }
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold" style={{ color: '#f59e0b' }}>{u.reputation || 0}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge text-xs"
                          style={{
                            background: u.suspended ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                            color: u.suspended ? '#ef4444' : '#10b981',
                            border: `1px solid ${u.suspended ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
                          }}>
                          {u.suspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.email !== 'sathvikatummala281@gmail.com' && (
                          <button onClick={() => handleSuspend(u.id, u.suspended)}
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded hover:opacity-80 transition-opacity"
                            style={{ color: u.suspended ? '#10b981' : '#ef4444' }}>
                            {u.suspended
                              ? <><CheckCircle className="w-3.5 h-3.5" /> Restore</>
                              : <><Ban className="w-3.5 h-3.5" /> Suspend</>
                            }
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="py-10 text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>No users match your search.</div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Content ─────────────────────────────────────────────────────── */}
      {tab === 'content' && (
        <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <ContentModeration
            posts={posts} setPosts={setPosts}
            achievements={achievements} setAchievements={setAchievements}
            projects={projects} setProjects={setProjects}
            challenges={challenges} setChallenges={setChallenges}
            sosPosts={sosPosts} setSosPosts={setSosPosts}
            ideas={ideas} setIdeas={setIdeas}
            buildUpdates={buildUpdates} setBuildUpdates={setBuildUpdates}
            skillExchanges={skillExchanges} setSkillExchanges={setSkillExchanges}
            polls={polls} setPolls={setPolls}
            lostFound={lostFound} setLostFound={setLostFound}
            studyGroups={studyGroups} setStudyGroups={setStudyGroups}
            knowledgeBase={knowledgeBase} setKnowledgeBase={setKnowledgeBase}
            projectArchive={projectArchive} setProjectArchive={setProjectArchive}
            repositories={repositories} setRepositories={setRepositories}
            internshipReviews={internshipReviews} setInternshipReviews={setInternshipReviews}
          />
        </motion.div>
      )}

      {/* ── Opportunities ────────────────────────────────────────────────── */}
      {tab === 'opportunities' && (
        <motion.div key="opportunities" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {opportunities.length === 0
            ? <div className="card text-center py-8" style={{ color: 'var(--text-tertiary)' }}>No opportunities yet.</div>
            : opportunities.map(opp => (
              <div key={opp.id} className="card flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {opp.pinned && <span className="badge text-xs" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>📌 Pinned</span>}
                    <span className="badge text-xs" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>{opp.type}</span>
                  </div>
                  <h3 className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>{opp.title}</h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                    {opp.organization}{opp.deadline ? ` · Due: ${opp.deadline}` : ''}{opp.stipend ? ` · ${opp.stipend}` : ''}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handlePinOpportunity(opp.id, opp.pinned)}
                    className="text-xs px-2 py-1 rounded hover:opacity-80 transition-opacity"
                    style={{ color: opp.pinned ? '#f59e0b' : 'var(--text-tertiary)' }}>
                    📌 {opp.pinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button onClick={() => handleRemoveOpportunity(opp.id)}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded hover:opacity-80 transition-opacity"
                    style={{ color: '#ef4444' }}>
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))
          }
        </motion.div>
      )}

      {/* ── Reports ─────────────────────────────────────────────────────── */}
      {tab === 'reports' && (
        <motion.div key="reports" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {reports.length === 0
            ? <div className="card text-center py-8" style={{ color: 'var(--text-tertiary)' }}>No reports. Community is clean! 🎉</div>
            : reports.map(r => (
              <div key={r.id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="badge text-xs" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>{r.type || 'Report'}</span>
                      {r.contentType && <span className="badge text-xs" style={{ background: 'var(--bg-secondary)', color: 'var(--text-tertiary)', border: '1px solid var(--border)' }}>{r.contentType}</span>}
                      {r.priority === 'high' && <span className="badge text-xs" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>⚠ High Priority</span>}
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{r.reason}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Reported by: {r.reporterName || 'Anonymous'}</p>
                  </div>
                  <button onClick={() => handleDismissReport(r.id)}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded hover:opacity-80 transition-opacity flex-shrink-0"
                    style={{ color: '#ef4444' }}>
                    <Trash2 className="w-3.5 h-3.5" /> Dismiss
                  </button>
                </div>
              </div>
            ))
          }
        </motion.div>
      )}

      {/* ── Analytics ───────────────────────────────────────────────────── */}
      {tab === 'analytics' && (
        <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="card">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <TrendingUp className="w-4 h-4" style={{ color: '#6366f1' }} /> Skill Popularity
              </h3>
              {topSkills.length === 0
                ? <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No skill data yet. Seed the database first.</p>
                : <div className="space-y-3">
                  {topSkills.map(([skill, count], i) => (
                    <div key={skill}>
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: 'var(--text-secondary)' }}>{skill}</span>
                        <span style={{ color: 'var(--text-tertiary)' }}>{count} students</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${topSkills[0]?.[1] ? (count / topSkills[0][1]) * 100 : 0}%`,
                            background: BAR_COLORS[i % BAR_COLORS.length],
                          }} />
                      </div>
                    </div>
                  ))}
                </div>
              }
            </div>

            <div className="card">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Activity className="w-4 h-4" style={{ color: '#10b981' }} /> Platform Content Breakdown
              </h3>
              {(() => {
                const items = [
                  { label: 'Problem Pool Questions', count: stats.posts, color: '#3b82f6' },
                  { label: 'Projects Showcased', count: stats.projects, color: '#8b5cf6' },
                  { label: 'Achievements Shared', count: stats.achievements, color: '#f59e0b' },
                  { label: 'Active Challenges', count: stats.challenges, color: '#ef4444' },
                  { label: 'Study Groups', count: stats.studyGroups, color: '#06b6d4' },
                  { label: 'Opportunities', count: stats.opportunities, color: '#10b981' },
                  { label: 'SOS Posts', count: stats.sosPosts, color: '#f43f5e' },
                  { label: 'Startup Ideas', count: stats.ideas, color: '#eab308' },
                  { label: 'Build Logs', count: stats.buildUpdates, color: '#6366f1' },
                  { label: 'Skill Exchanges', count: stats.skillExchanges, color: '#10b981' },
                ]
                const maxCount = Math.max(...items.map(i => i.count), 1)
                return (
                  <div className="space-y-2">
                    {items.map(({ label, count, color }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                          <span className="font-medium" style={{ color: 'var(--text-tertiary)' }}>{count}</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${(count / maxCount) * 100}%`, background: color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>

            <div className="card">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>User Role Distribution</h3>
              <div className="flex gap-4">
                {[
                  { role: 'Students', count: users.filter(u => !u.role || u.role === 'student').length, color: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)' },
                  { role: 'Moderators', count: stats.moderators, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
                  { role: 'Admins', count: stats.admins, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
                ].map(({ role, count, color, bg, border }) => (
                  <div key={role} className="flex-1 rounded-xl p-4 text-center"
                    style={{ background: bg, border: `1px solid ${border}` }}>
                    <p className="text-3xl font-bold" style={{ color }}>{count}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{role}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Problem Pool Health</h3>
              <div className="space-y-4">
                {[
                  { label: 'Solved', count: stats.solvedPosts, color: '#10b981' },
                  { label: 'Unsolved', count: stats.posts - stats.solvedPosts, color: '#ef4444' },
                ].map(({ label, count, color }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-2">
                      <span style={{ color }}>{label}</span>
                      <span style={{ color: 'var(--text-tertiary)' }}>{count} / {stats.posts}</span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${stats.posts ? (count / stats.posts) * 100 : 0}%`, background: color }} />
                    </div>
                  </div>
                ))}
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Overall solve rate: {stats.posts ? Math.round((stats.solvedPosts / stats.posts) * 100) : 0}%
                </p>
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </div>
  )
}
