import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, Hammer, Users, Bot, Zap,
  ChevronRight, ArrowLeft, ThumbsUp, CheckCircle2,
  Flame, Trophy, Star, Plus, X, Send, Lock,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'

// ─── SEASON DATA ────────────────────────────────────────────────────────────
const SEASON = {
  name:    'Season 1',
  label:   'Jan – Mar 2025',
  stats: [
    { icon: '⚔️', label: 'Duels Fought',    value: 847  },
    { icon: '📰', label: 'Papers Decoded',   value: 134  },
    { icon: '🏗️', label: 'Builds Shipped',  value: 213  },
    { icon: '🤝', label: 'Collabs Sent',     value: 389  },
  ],
}

// ─── IDENTITY TRACKS ─────────────────────────────────────────────────────────
const TRACKS = [
  { id: 'researcher', label: 'The Researcher', icon: Brain,  color: '#FFD700', desc: 'Reads papers, decodes insights, contributes knowledge', keys: ['trend_decode'] },
  { id: 'builder',    label: 'The Builder',    icon: Hammer, color: '#00D4C8', desc: 'Ships things, posts projects, wins build duels',      keys: ['build_race'] },
  { id: 'connector',  label: 'The Connector',  icon: Users,  color: '#4CAF50', desc: 'Forms squads, sends collabs, bridges specs',          keys: ['connect'] },
  { id: 'prompter',   label: 'The Prompter',   icon: Bot,    color: '#E040FB', desc: 'Wins AI duels, designs agents, masters prompting',    keys: ['prompt_wars', 'agent_architect'] },
  { id: 'sprinter',   label: 'The Sprinter',   icon: Zap,    color: '#FF6B00', desc: 'Fast thinker, wins blitz rounds, top of speed ranks', keys: ['sprint', 'dsa'] },
]

function computeIdentity(duelHistory) {
  const counts = { researcher: 0, builder: 0, connector: 0, prompter: 0, sprinter: 0 }
  duelHistory.forEach(d => {
    if (d.type === 'trend_decode')    counts.researcher++
    if (d.type === 'build_race')      counts.builder++
    if (d.type === 'prompt_wars' || d.type === 'agent_architect') counts.prompter++
    if (d.type === 'sprint' || d.type === 'dsa') counts.sprinter++
  })
  // seed non-zero so first-time users see something
  const seeded = {
    researcher: counts.researcher || 1,
    builder:    counts.builder    || 2,
    connector:  counts.connector  || 1,
    prompter:   counts.prompter   || 3,
    sprinter:   counts.sprinter   || 1,
  }
  const total = Object.values(seeded).reduce((a, b) => a + b, 0)
  return TRACKS.map(t => ({ ...t, pct: Math.round((seeded[t.id] / total) * 100) }))
    .sort((a, b) => b.pct - a.pct)
}

// ─── CAMPUS PROBLEMS ─────────────────────────────────────────────────────────
const CAMPUS_PROBLEMS = [
  {
    id: 'cp1', title: 'Hostel WiFi dies at 11 PM every night',
    body: '500+ students lose connectivity every night right before exam season ends. The router resets but no one is around to fix it. Design a technical or process solution.',
    submitter: 'Arjun M', spec: 'CSE', votes: 84, solutions: 12, tag: 'Infrastructure', color: '#00D4C8', deadline: '3 days left',
  },
  {
    id: 'cp2', title: 'Internship matching is completely broken',
    body: '500 students want internships but have no visibility into which companies recruit from which specs, or who in the batch has already interned where. Build something.',
    submitter: 'Priya K', spec: 'Gen AI', votes: 127, solutions: 23, tag: 'Career', color: '#C8F135', deadline: '5 days left',
  },
  {
    id: 'cp3', title: 'No one knows what other specs are building',
    body: "CSE students don't know what AIML is working on. Gen AI doesn't know what Quantum is theorizing. Cross-spec awareness is zero. Fix the visibility problem.",
    submitter: 'Karthik R', spec: 'CSE', votes: 61, solutions: 8, tag: 'Collaboration', color: '#E040FB', deadline: '1 week left',
  },
  {
    id: 'cp4', title: 'Placement prep is uncoordinated chaos',
    body: 'Everyone is prepping individually with no shared resource base. Some students repeat the same mistakes. Design a collaborative prep system for the batch.',
    submitter: 'Neha S', spec: 'AIDA', votes: 93, solutions: 17, tag: 'Academics', color: '#FFD700', deadline: '4 days left',
  },
  {
    id: 'cp5', title: 'Campus events are discovered too late',
    body: 'Hackathons, talks, workshops — most students find out the day of or after. Build a campus event discovery and reminder system that actually works.',
    submitter: 'Vijay P', spec: 'Agentic AI', votes: 45, solutions: 6, tag: 'Events', color: '#FF6B00', deadline: '2 weeks left',
  },
]

// ─── SPEC WARS ───────────────────────────────────────────────────────────────
const SPEC_WAR = {
  week:      'Week 3 — Jan 2025',
  challenge: 'Build a campus-wide AI assistant that every spec contributes to',
  roles: [
    { spec: 'CSE',        task: 'Build the backend API and infra', color: '#00D4C8', score: 340, done: 12 },
    { spec: 'AIML',       task: 'Train the recommendation model',  color: '#C8F135', score: 290, done: 9  },
    { spec: 'Gen AI',     task: 'Write the system prompt and UX',  color: '#FF6B00', score: 310, done: 11 },
    { spec: 'Agentic AI', task: 'Design the agent architecture',   color: '#E040FB', score: 275, done: 8  },
    { spec: 'AIDA',       task: 'Analyze usage data and metrics',  color: '#4CAF50', score: 220, done: 7  },
    { spec: 'AIDS',       task: 'Security audit and compliance',   color: '#FF4444', score: 195, done: 6  },
    { spec: 'Quantum',    task: 'Optimize the search algorithm',   color: '#8B5CF6', score: 170, done: 5  },
  ],
  endsIn: '4 days',
}

// ─── BOUNTIES ─────────────────────────────────────────────────────────────────
const BOUNTIES = [
  { id: 'b1', title: 'Need a React dev for landing page',    poster: 'Arjun M',   spec: 'AIML',    xp: 200, claimed: false, tag: 'Frontend', color: '#00D4C8', timeLeft: '2h left',  desc: 'My startup needs a clean landing page with dark theme. Next.js preferred.' },
  { id: 'b2', title: 'Debug my Flask API — POST returns 500', poster: 'Priya K',  spec: 'Gen AI',  xp: 150, claimed: true,  tag: 'Backend',  color: '#C8F135', timeLeft: 'Claimed',  desc: 'Getting 500 on /submit endpoint. Suspect it\'s a JSON parsing issue.' },
  { id: 'b3', title: 'Train a small image classifier for me', poster: 'Neha S',   spec: 'AIDA',    xp: 300, claimed: false, tag: 'ML',       color: '#E040FB', timeLeft: '5h left',  desc: 'Need a CNN trained on 200 labeled images (cats vs dogs). PyTorch preferred.' },
  { id: 'b4', title: 'Write a system design doc for my app',  poster: 'Karthik R', spec: 'CSE',   xp: 180, claimed: false, tag: 'Design',   color: '#FFD700', timeLeft: '1d left',  desc: 'Need LLD + HLD for a real-time chat app. 2-3 pages is fine.' },
  { id: 'b5', title: 'Help debug my attention implementation', poster: 'Rahul T',  spec: 'Quantum', xp: 250, claimed: false, tag: 'ML',      color: '#8B5CF6', timeLeft: '3h left',  desc: 'My transformer attention block isn\'t converging. Need someone who knows PyTorch internals.' },
  { id: 'b6', title: 'Proofread my research paper abstract',  poster: 'Divya L',  spec: 'AIDS',    xp: 80,  claimed: false, tag: 'Writing',  color: '#FF6B00', timeLeft: '6h left',  desc: 'Writing a paper on federated learning. Need grammar + clarity feedback on abstract.' },
]

// ─── Sub-components ────────────────────────────────────────────────────────

const SPEC_COLORS = {
  'CSE': '#00D4C8', 'AIML': '#C8F135', 'Agentic AI': '#E040FB',
  'Gen AI': '#FF6B00', 'AIDA': '#4CAF50', 'AIDS': '#FF4444', 'Quantum': '#8B5CF6',
}

function Tag({ label, color }) {
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
      style={{ background: `${color}20`, color, fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 0.5 }}>
      {label}
    </span>
  )
}

// ─── Identity Tracks panel ───────────────────────────────────────────────────
function IdentityPanel({ tracks }) {
  const top = tracks[0]
  const TopIcon = top.icon
  return (
    <div className="flex flex-col gap-4">
      {/* Primary identity */}
      <div className="rounded-2xl p-4 flex items-center gap-4"
        style={{ background: `${top.color}12`, border: `1px solid ${top.color}40` }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${top.color}20` }}>
          <TopIcon size={28} style={{ color: top.color }} />
        </div>
        <div>
          <p className="text-xs text-neutral-500 mb-0.5" style={{ fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 1 }}>
            YOUR PRIMARY IDENTITY
          </p>
          <p className="text-white font-bold text-lg" style={{ fontFamily: 'Anton, sans-serif', letterSpacing: 0.5 }}>
            {top.label}
          </p>
          <p className="text-xs text-neutral-500 mt-0.5">{top.desc}</p>
        </div>
      </div>

      {/* All track bars */}
      <div className="flex flex-col gap-3">
        {tracks.map(t => {
          const Icon = t.icon
          return (
            <div key={t.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <Icon size={13} style={{ color: t.color }} />
                  <span className="text-xs font-bold text-white" style={{ fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 0.5 }}>{t.label}</span>
                </div>
                <span className="text-xs font-mono font-bold" style={{ color: t.color }}>{t.pct}%</span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background: '#1C1C1C' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${t.pct}%` }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  style={{ height: '100%', background: t.color, borderRadius: 999 }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-neutral-700 text-center">
        Your identity is computed from what you actually do — no one assigns it.
      </p>
    </div>
  )
}

// ─── Campus Problems panel ────────────────────────────────────────────────────
function CampusProblemsPanel() {
  const [selected, setSelected]   = useState(null)
  const [solution, setSolution]   = useState('')
  const [submitted, setSubmitted] = useState(new Set())
  const [voted, setVoted]         = useState(new Set())
  const [problems, setProblems]   = useState(CAMPUS_PROBLEMS)

  function handleVote(id) {
    if (voted.has(id)) return
    setVoted(v => new Set([...v, id]))
    setProblems(ps => ps.map(p => p.id === id ? { ...p, votes: p.votes + 1 } : p))
  }

  function handleSubmitSolution(id) {
    if (!solution.trim()) return
    setSubmitted(s => new Set([...s, id]))
    setProblems(ps => ps.map(p => p.id === id ? { ...p, solutions: p.solutions + 1 } : p))
    setSolution('')
    setSelected(null)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl p-3" style={{ background: '#0d1a00', border: '1px solid #C8F13525' }}>
        <p className="text-xs" style={{ color: '#C8F135' }}>
          🏆 Top solution each week gets featured on the batch homepage + 500 XP
        </p>
      </div>

      {problems.sort((a, b) => b.votes - a.votes).map(p => (
        <div key={p.id} className="rounded-2xl p-4 flex flex-col gap-3"
          style={{ background: '#1C1C1C', border: `1px solid ${p.color}30` }}>
          <div className="flex items-start gap-3">
            <Tag label={p.tag} color={p.color} />
            <span className="text-xs text-neutral-600 ml-auto flex-shrink-0">{p.deadline}</span>
          </div>

          <p className="text-white font-bold text-sm leading-snug">{p.title}</p>
          <p className="text-neutral-500 text-xs leading-relaxed">{p.body}</p>

          <div className="flex items-center gap-3 text-xs text-neutral-600">
            <span style={{ color: SPEC_COLORS[p.spec] || '#888' }}>{p.submitter}</span>
            <span>·</span>
            <span>{p.solutions} solutions</span>
          </div>

          <div className="flex gap-2">
            <button onClick={() => handleVote(p.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
              style={{
                background: voted.has(p.id) ? `${p.color}20` : '#2a2a2a',
                color:      voted.has(p.id) ? p.color          : '#888',
                fontFamily: 'Barlow Condensed, sans-serif',
              }}>
              <ThumbsUp size={11} /> {p.votes}
            </button>
            {!submitted.has(p.id) ? (
              <button onClick={() => setSelected(selected === p.id ? null : p.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold flex-1 justify-center"
                style={{ background: p.color, color: '#000', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 0.5 }}>
                <Plus size={11} /> SUBMIT SOLUTION
              </button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold flex-1 justify-center"
                style={{ background: '#1a2200', color: '#C8F135', border: '1px solid #C8F13530' }}>
                <CheckCircle2 size={11} /> SUBMITTED
              </div>
            )}
          </div>

          <AnimatePresence>
            {selected === p.id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden' }}>
                <div className="flex flex-col gap-2 pt-1">
                  <textarea
                    value={solution}
                    onChange={e => setSolution(e.target.value)}
                    placeholder="Describe your solution — be specific and practical..."
                    className="w-full rounded-xl p-3 text-xs text-white resize-none outline-none"
                    style={{ background: '#111', border: '1px solid #333', minHeight: 90, fontFamily: 'JetBrains Mono, monospace' }}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setSelected(null)}
                      className="px-3 py-2 rounded-lg text-xs text-neutral-500">Cancel</button>
                    <button onClick={() => handleSubmitSolution(p.id)}
                      disabled={!solution.trim()}
                      className="flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
                      style={{ background: solution.trim() ? p.color : '#333', color: solution.trim() ? '#000' : '#666',
                        fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 0.5 }}>
                      <Send size={11} /> POST SOLUTION
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

// ─── Spec Wars panel ──────────────────────────────────────────────────────────
function SpecWarsPanel({ mySpec }) {
  const maxScore = Math.max(...SPEC_WAR.roles.map(r => r.score))
  const sorted   = [...SPEC_WAR.roles].sort((a, b) => b.score - a.score)

  return (
    <div className="flex flex-col gap-4">
      {/* Current challenge */}
      <div className="rounded-2xl p-4" style={{ background: '#1C1C1C', border: '1px solid #C8F13530' }}>
        <div className="flex items-center justify-between mb-2">
          <Tag label={SPEC_WAR.week} color="#C8F135" />
          <span className="text-xs text-neutral-600">Ends in {SPEC_WAR.endsIn}</span>
        </div>
        <p className="text-white font-bold text-sm leading-snug">{SPEC_WAR.challenge}</p>
      </div>

      {/* Live scoreboard */}
      <div>
        <p className="text-xs font-bold text-neutral-600 mb-3"
          style={{ fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 1 }}>
          LIVE SPEC SCOREBOARD
        </p>
        <div className="flex flex-col gap-2">
          {sorted.map((role, idx) => {
            const isMe = role.spec === mySpec
            return (
              <div key={role.spec} className="rounded-xl p-3"
                style={{
                  background: isMe ? `${role.color}12` : '#1C1C1C',
                  border:     `1px solid ${isMe ? role.color + '50' : '#2a2a2a'}`,
                }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-neutral-600">#{idx + 1}</span>
                  <span className="text-xs font-bold" style={{ color: role.color, fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 0.5 }}>
                    {role.spec}
                  </span>
                  {isMe && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: `${role.color}20`, color: role.color }}>YOU</span>}
                  <span className="ml-auto text-xs font-mono font-bold text-white">{role.score} pts</span>
                  <span className="text-xs text-neutral-600">{role.done} done</span>
                </div>
                <div className="w-full h-1.5 rounded-full" style={{ background: '#2a2a2a' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(role.score / maxScore) * 100}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.05 }}
                    style={{ height: '100%', background: role.color, borderRadius: 999 }}
                  />
                </div>
                <p className="text-xs text-neutral-600 mt-1.5">{role.task}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* How to contribute */}
      <div className="rounded-xl p-3" style={{ background: '#0d0d0d', border: '1px solid #1C1C1C' }}>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Contribute to Spec Wars by completing duels and quests in your spec's role. Every win adds points to your spec's total.
        </p>
      </div>
    </div>
  )
}

// ─── Bounties panel ───────────────────────────────────────────────────────────
function BountiesPanel() {
  const [bounties, setBounties] = useState(BOUNTIES)
  const [claimed, setClaimed]   = useState(new Set())
  const [showPost, setShowPost] = useState(false)
  const [newBounty, setNewBounty] = useState({ title: '', desc: '', xp: 100 })

  function claimBounty(id) {
    if (claimed.has(id)) return
    setClaimed(c => new Set([...c, id]))
    setBounties(bs => bs.map(b => b.id === id ? { ...b, claimed: true } : b))
  }

  function postBounty() {
    if (!newBounty.title.trim()) return
    setBounties(bs => [{
      id:      `b${Date.now()}`,
      title:   newBounty.title,
      desc:    newBounty.desc,
      xp:      newBounty.xp,
      poster:  'You',
      spec:    'You',
      tag:     'Custom',
      color:   '#C8F135',
      timeLeft:'Just posted',
      claimed: false,
    }, ...bs])
    setNewBounty({ title: '', desc: '', xp: 100 })
    setShowPost(false)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Post a bounty */}
      <button onClick={() => setShowPost(s => !s)}
        className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
        style={{ background: '#1C1C1C', border: '1px solid #C8F13530', color: '#C8F135',
          fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 1 }}>
        <Plus size={15} /> POST A BOUNTY
      </button>

      <AnimatePresence>
        {showPost && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}>
            <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: '#1C1C1C', border: '1px solid #C8F13540' }}>
              <input value={newBounty.title} onChange={e => setNewBounty(b => ({ ...b, title: e.target.value }))}
                placeholder="What do you need help with?"
                className="w-full rounded-xl px-3 py-2 text-sm text-white outline-none"
                style={{ background: '#111', border: '1px solid #333' }} />
              <textarea value={newBounty.desc} onChange={e => setNewBounty(b => ({ ...b, desc: e.target.value }))}
                placeholder="Describe the task in detail..."
                className="w-full rounded-xl px-3 py-2 text-xs text-white resize-none outline-none"
                style={{ background: '#111', border: '1px solid #333', minHeight: 70 }} />
              <div className="flex items-center gap-3">
                <label className="text-xs text-neutral-500">XP reward:</label>
                <input type="number" value={newBounty.xp} onChange={e => setNewBounty(b => ({ ...b, xp: +e.target.value }))}
                  className="w-20 rounded-lg px-2 py-1 text-xs text-white outline-none"
                  style={{ background: '#111', border: '1px solid #333' }} />
                <button onClick={postBounty}
                  className="ml-auto px-4 py-1.5 rounded-lg text-xs font-bold"
                  style={{ background: '#C8F135', color: '#000', fontFamily: 'Barlow Condensed, sans-serif' }}>
                  POST
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {bounties.map(b => (
        <div key={b.id} className="rounded-2xl p-4 flex flex-col gap-3"
          style={{ background: '#1C1C1C', border: `1px solid ${b.claimed || claimed.has(b.id) ? '#2a2a2a' : b.color + '30'}`,
            opacity: b.claimed || claimed.has(b.id) ? 0.6 : 1 }}>
          <div className="flex items-start justify-between gap-2">
            <Tag label={b.tag} color={b.color} />
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs font-mono font-bold" style={{ color: b.color }}>+{b.xp} XP</span>
              <span className="text-xs text-neutral-600">{b.timeLeft}</span>
            </div>
          </div>

          <p className="text-white font-bold text-sm leading-snug">{b.title}</p>
          <p className="text-neutral-500 text-xs leading-relaxed">{b.desc}</p>

          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: SPEC_COLORS[b.spec] || '#C8F135' }}>
              Posted by {b.poster}
            </span>
            {b.claimed || claimed.has(b.id) ? (
              <span className="text-xs font-bold px-3 py-1 rounded-lg"
                style={{ background: '#1a1a1a', color: '#555', fontFamily: 'Barlow Condensed, sans-serif' }}>
                CLAIMED
              </span>
            ) : (
              <button onClick={() => claimBounty(b.id)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold"
                style={{ background: b.color, color: '#000', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 0.5 }}>
                CLAIM
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Compete page ────────────────────────────────────────────────────────
const TABS = [
  { id: 'identity', label: 'Identity',  emoji: '🧠' },
  { id: 'problems', label: 'Problems',  emoji: '🏗️' },
  { id: 'specwars', label: 'Spec Wars', emoji: '⚔️' },
  { id: 'bounties', label: 'Bounties',  emoji: '💰' },
]

export default function Compete() {
  const { profile } = useAuth()
  const { duelHistory } = useApp()
  const [tab, setTab] = useState('identity')

  const identityTracks = useMemo(() => computeIdentity(duelHistory), [duelHistory])

  return (
    <div style={{ background: '#000000', minHeight: '100%' }}>

      {/* Season strip */}
      <div className="px-4 pt-4 pb-3 border-b border-neutral-900">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-neutral-600" style={{ fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 1 }}>
              BATCH OF 2029
            </p>
            <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Anton, sans-serif', letterSpacing: 0.5 }}>
              COMPETE
            </h1>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold" style={{ color: '#C8F135', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 1 }}>{SEASON.name}</p>
            <p className="text-xs text-neutral-600">{SEASON.label}</p>
          </div>
        </div>

        {/* Season stats row */}
        <div className="grid grid-cols-4 gap-2">
          {SEASON.stats.map(s => (
            <div key={s.label} className="rounded-xl p-2 text-center" style={{ background: '#1C1C1C' }}>
              <p className="text-base">{s.icon}</p>
              <p className="text-xs font-mono font-bold text-white">{s.value}</p>
              <p className="text-xs text-neutral-600" style={{ fontSize: 9 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-neutral-900">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors"
            style={{
              color:        tab === t.id ? '#C8F135' : '#555',
              borderBottom: tab === t.id ? '2px solid #C8F135' : '2px solid transparent',
              fontFamily:   'Barlow Condensed, sans-serif',
            }}>
            <span style={{ fontSize: 14 }}>{t.emoji}</span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5 }}>{t.label.toUpperCase()}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-4 pt-4 pb-6">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}>
            {tab === 'identity' && <IdentityPanel tracks={identityTracks} />}
            {tab === 'problems' && <CampusProblemsPanel />}
            {tab === 'specwars' && <SpecWarsPanel mySpec={profile?.spec} />}
            {tab === 'bounties' && <BountiesPanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
