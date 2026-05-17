import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users, HelpCircle, Briefcase, Trophy, Zap, TrendingUp,
  BookOpen, MessageSquare, ArrowRight, Star, Clock,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { SkeletonCard } from '../components/ui/Skeleton'
import {
  subscribeToOpportunities, subscribeToposts,
  subscribeToStudyGroups, subscribeToChallenges,
} from '../services/firebaseService'
import { REPUTATION_LEVELS } from '../data/constants'

function StatCard({ icon: Icon, label, value, color, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="card flex items-center gap-4 cursor-pointer hover:border-gray-700 transition-all group"
    >
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-700 ml-auto group-hover:text-gray-400 transition-colors" />
    </motion.div>
  )
}

function getReputationLevel(rep) {
  return REPUTATION_LEVELS.find(l => rep >= l.min && rep < l.max) || REPUTATION_LEVELS[0]
}

export default function Dashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [opportunities, setOpportunities] = useState([])
  const [posts, setPosts] = useState([])
  const [groups, setGroups] = useState([])
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubs = [
      subscribeToOpportunities(setOpportunities),
      subscribeToposts(setPosts),
      subscribeToStudyGroups(setGroups),
      subscribeToChallenges(setChallenges),
    ]
    const t = setTimeout(() => setLoading(false), 800)
    return () => { unsubs.forEach(u => u()); clearTimeout(t) }
  }, [])

  const repLevel = getReputationLevel(profile?.reputation || 0)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600/20 to-purple-600/10 border border-indigo-600/20 rounded-2xl p-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-400 text-sm">Welcome back,</p>
            <h1 className="text-2xl font-bold text-white mt-0.5">{profile?.fullName} 👋</h1>
            <div className="flex items-center gap-3 mt-3">
              <span className={`badge ${repLevel.bg} ${repLevel.color} border border-current/20`}>
                {repLevel.label}
              </span>
              <span className="text-gray-400 text-sm">{profile?.branch}</span>
              <span className="text-gray-600">·</span>
              <span className="text-gray-400 text-sm">Section {profile?.section}</span>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-3xl font-bold text-white">{profile?.reputation || 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">Reputation Points</p>
          </div>
        </div>

        {profile?.skills?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {profile.skills.slice(0, 6).map(s => (
              <span key={s} className="tag">{s}</span>
            ))}
            {profile.skills.length > 6 && (
              <span className="tag">+{profile.skills.length - 6} more</span>
            )}
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard icon={Users} label="Students" value="1400+" color="bg-indigo-600" onClick={() => navigate('/skills')} />
            <StatCard icon={HelpCircle} label="Questions" value={posts.length} color="bg-purple-600" onClick={() => navigate('/problem-pool')} />
            <StatCard icon={Briefcase} label="Opportunities" value={opportunities.length} color="bg-emerald-600" onClick={() => navigate('/opportunities')} />
            <StatCard icon={Zap} label="Challenges" value={challenges.length} color="bg-amber-600" onClick={() => navigate('/challenges')} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" /> Latest Opportunities
            </h2>
            <button onClick={() => navigate('/opportunities')} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">{Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : opportunities.length === 0 ? (
            <div className="card text-center py-8 text-gray-500 text-sm">No opportunities yet.</div>
          ) : (
            <div className="space-y-3">
              {opportunities.slice(0, 4).map(opp => (
                <motion.div
                  key={opp.id}
                  whileHover={{ x: 2 }}
                  onClick={() => navigate('/opportunities')}
                  className="card cursor-pointer hover:border-gray-700 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-white text-sm">{opp.title}</h3>
                      <p className="text-gray-500 text-xs mt-0.5">{opp.company} · {opp.type}</p>
                    </div>
                    <span className="badge bg-indigo-900/40 text-indigo-400 text-xs">{opp.type}</span>
                  </div>
                  {opp.deadline && (
                    <p className="text-xs text-amber-400 flex items-center gap-1 mt-2">
                      <Clock className="w-3 h-3" /> Deadline: {opp.deadline}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" /> Study Groups
            </h2>
            <button onClick={() => navigate('/study-groups')} className="text-xs text-indigo-400 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {loading ? (
            <div className="space-y-3">{Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : (
            <div className="space-y-3">
              {groups.slice(0, 4).map(g => (
                <div key={g.id} className="card hover:border-gray-700 transition-all cursor-pointer" onClick={() => navigate('/study-groups')}>
                  <h3 className="font-medium text-white text-sm">{g.name}</h3>
                  <p className="text-gray-500 text-xs mt-1">{g.subject} · {g.members?.length || 0} members</p>
                </div>
              ))}
              {groups.length === 0 && (
                <div className="card text-center py-6 text-gray-500 text-sm">
                  No study groups yet.<br />
                  <button onClick={() => navigate('/study-groups')} className="text-indigo-400 text-xs mt-1 hover:underline">Create one</button>
                </div>
              )}
            </div>
          )}

          <div className="card">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-indigo-400" /> Trending Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {['React', 'Python', 'Machine Learning', 'DSA', 'Generative AI', 'Node.js'].map(s => (
                <button key={s} onClick={() => navigate(`/skills?skill=${s}`)} className="tag hover:bg-indigo-600/30 transition-colors">{s}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-400" /> Recent Questions
          </h2>
          <button onClick={() => navigate('/problem-pool')} className="text-xs text-indigo-400 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {posts.slice(0, 4).map(p => (
              <div key={p.id} className="card cursor-pointer hover:border-gray-700 transition-all" onClick={() => navigate('/problem-pool')}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-white text-sm line-clamp-2">{p.title}</h3>
                  {p.solved && <span className="badge bg-emerald-900/40 text-emerald-400 text-xs flex-shrink-0">Solved</span>}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-gray-500 text-xs flex items-center gap-1">
                    <Star className="w-3 h-3" /> {p.upvotes?.length || 0}
                  </span>
                  <span className="text-gray-700 text-xs">{p.anonymous ? 'Anonymous' : p.authorName}</span>
                </div>
                {p.tags?.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {p.tags.slice(0, 3).map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
