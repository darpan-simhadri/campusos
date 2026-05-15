import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Swords, Zap, Hammer, Bot, Newspaper, BarChart2,
  ThumbsUp, ThumbsDown, ChevronRight, Vote
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { setOnline, setOffline } from '../services/firebaseService'
import DSADuelModal from '../components/ui/DSADuelModal'
import SprintModal from '../components/ui/SprintModal'
import PromptWarsModal from '../components/ui/PromptWarsModal'
import BuildRaceModal from '../components/ui/BuildRaceModal'
import AgentArchitectModal from '../components/ui/AgentArchitectModal'
import TrendDecodeModal from '../components/ui/TrendDecodeModal'
import VibeCodingModal from '../components/ui/VibeCodingModal'
import { getRandomDSAProblem } from '../data/dsaProblems'

// ─── Duel card definitions ────────────────────────────────────────────────────
const DUEL_TYPES = [
  {
    id: 'prompt_wars',
    label: 'PROMPT WARS',
    icon: Swords,
    color: '#C8F135',
    subtitle: 'WRITE · SUBMIT · CAMPUS VOTES',
    desc: 'Write a prompt, Claude runs it, campus votes on the winner.',
    xp: 100,
    badge: 'HOT',
  },
  {
    id: 'build_race',
    label: 'BUILD RACE',
    icon: Hammer,
    color: '#00D4C8',
    subtitle: 'HTML/CSS · LIVE PREVIEW · RACE',
    desc: 'Recreate a target UI in HTML/CSS before time runs out.',
    xp: 120,
    badge: null,
  },
  {
    id: 'vibe_coding',
    label: 'VIBE CODING',
    icon: Zap,
    color: '#E040FB',
    subtitle: 'FEEL IT · CODE IT · CAMPUS VOTES',
    desc: '"Build something that feels like rain on a window at 2am." Pure creativity, no right answer.',
    xp: 90,
    badge: '✨ NEW',
  },
  {
    id: 'agent_architect',
    label: 'AGENT ARCHITECT',
    icon: Bot,
    color: '#E040FB',
    subtitle: 'DESIGN · DEPLOY · EARN',
    desc: 'Design an AI agent: system prompt, tools, decision loop.',
    xp: 85,
    badge: null,
  },
  {
    id: 'trend_decode',
    label: 'TREND DECODE',
    icon: Newspaper,
    color: '#FFD700',
    subtitle: 'READ ARXIV · DECODE · POST',
    desc: "Summarise a real AI paper in 3 bullets. It posts to the Feed.",
    xp: 75,
    badge: null,
  },
  {
    id: 'sprint',
    label: 'SPRINT BLITZ',
    icon: Zap,
    color: '#FF6B00',
    subtitle: '60 SECONDS · FASTEST MIND WINS',
    desc: 'Answer CS/AI questions as fast as you can in 60 seconds.',
    xp: 50,
    badge: null,
  },
  {
    id: 'dsa',
    label: 'DSA DUEL',
    icon: BarChart2,
    color: '#00BCD4',
    subtitle: 'CODE · JUDGE · WIN',
    desc: 'Real coding problems in Monaco Editor. Beat the clock.',
    xp: 80,
    badge: null,
  },
]

// ─── Activity Ticker ──────────────────────────────────────────────────────────
function ActivityTicker({ items }) {
  const ref = useRef(null)
  return (
    <div className="overflow-hidden w-full" style={{ height: 28 }}>
      <motion.div
        ref={ref}
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ repeat: Infinity, duration: 28, ease: 'linear' }}
        style={{ width: 'max-content' }}
      >
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-xs text-neutral-400"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 0.5 }}>
            {item.text}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

// playerA/playerB may be a string OR an object { name, ... } depending on the source
function playerName(p) {
  if (!p) return 'Unknown'
  if (typeof p === 'string') return p
  return p.name || 'Unknown'
}

// ─── Voting Queue Panel ───────────────────────────────────────────────────────
function VotingPanel({ queue, votesGiven, onVote }) {
  if (!queue || queue.length === 0) return null

  return (
    <div className="flex flex-col gap-3 mt-6">
      <div className="flex items-center gap-2">
        <Vote size={15} style={{ color: '#C8F135' }} />
        <p className="text-xs font-bold" style={{ color: '#C8F135', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 1 }}>
          CAMPUS VOTING QUEUE
        </p>
        <span className="text-xs px-1.5 py-0.5 rounded-full ml-auto"
          style={{ background: '#C8F13520', color: '#C8F135', fontFamily: 'Barlow Condensed, sans-serif' }}>
          +5 XP / VOTE
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {queue.slice(0, 4).map(duel => {
          const hasVoted = votesGiven?.includes(duel.id)
          const nameA = playerName(duel.playerA)
          const nameB = playerName(duel.playerB)
          return (
            <div key={duel.id}
              className="rounded-xl p-3 flex flex-col gap-3"
              style={{ background: '#1C1C1C', border: '1px solid #2a2a2a' }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white line-clamp-1">{duel.challenge || duel.type}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {nameA} vs {nameB}
                  </p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: '#333', color: '#888', fontFamily: 'Barlow Condensed, sans-serif' }}>
                  {(duel.type || 'DUEL').replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {/* Side by side snippets */}
              {(duel.outputA || duel.outputB) && (
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: nameA, text: duel.outputA },
                    { label: nameB, text: duel.outputB },
                  ].map(({ label, text }) => (
                    <div key={label} className="rounded-lg p-2" style={{ background: '#111' }}>
                      <p className="text-xs font-bold text-neutral-500 mb-1">{label}</p>
                      <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">{String(text || '')}</p>
                    </div>
                  ))}
                </div>
              )}

              {!hasVoted ? (
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => onVote(duel.id, 'playerA')}
                    className="py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    style={{ background: '#C8F13520', color: '#C8F135', border: '1px solid #C8F13530', fontFamily: 'Barlow Condensed, sans-serif' }}>
                    <ThumbsUp size={12} /> {nameA.split(' ')[0]} WON
                  </button>
                  <button onClick={() => onVote(duel.id, 'playerB')}
                    className="py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    style={{ background: '#1a1a1a', color: '#888', border: '1px solid #333', fontFamily: 'Barlow Condensed, sans-serif' }}>
                    <ThumbsDown size={12} /> {nameB.split(' ')[0]} WON
                  </button>
                </div>
              ) : (
                <p className="text-center text-xs" style={{ color: '#C8F135' }}>✓ Voted · +5 XP</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Arena page ──────────────────────────────────────────────────────────
export default function Arena() {
  const navigate = useNavigate()
  const { user, profile, updateProfile } = useAuth()
  const { ticker, votingQueue, votesGiven, castVote, addNotification, unreadNotifications } = useApp()

  const [activeModal, setActiveModal] = useState(null) // duel id
  const [dsaProblem]  = useState(() => getRandomDSAProblem())
  const [winFlash, setWinFlash]       = useState(false)
  const [sessionXP, setSessionXP]     = useState(0)

  // Online presence
  useEffect(() => {
    if (user?.uid) {
      setOnline(user.uid)
      return () => setOffline(user.uid)
    }
  }, [user?.uid])

  function openModal(id) { setActiveModal(id) }
  function closeModal()  { setActiveModal(null) }

  async function handleVote(duelId, winner) {
    castVote(duelId, winner)
    addNotification({ message: '🗳️ Vote cast! +5 XP', link: '/arena' })
    if (updateProfile) {
      await updateProfile({ xp: (profile?.xp || 0) + 5 })
    }
    setSessionXP(x => x + 5)
  }

  const modalProps = { onClose: closeModal, profile, updateProfile }

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#000' }}>

      {/* Ticker */}
      <div className="px-4 py-2 border-b border-neutral-900">
        <ActivityTicker items={ticker.length ? ticker : [{ id: 0, text: 'Welcome to CampusOS Arena' }]} />
      </div>

      {/* XP strip */}
      {sessionXP > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-3 rounded-xl py-2 px-4 flex items-center justify-between"
          style={{ background: '#1a2200', border: '1px solid #C8F13540' }}>
          <span className="text-xs text-neutral-400">Session XP</span>
          <span className="font-mono font-bold text-sm" style={{ color: '#C8F135' }}>+{sessionXP} XP</span>
        </motion.div>
      )}

      {/* Header */}
      <div className="px-4 pt-5 pb-2">
        <p className="text-xs text-neutral-600 mb-0.5" style={{ fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 1 }}>
          ARENA
        </p>
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Anton, sans-serif', letterSpacing: 1 }}>
          CHOOSE YOUR DUEL
        </h1>
        <p className="text-xs text-neutral-500 mt-1">Create → Submit → Campus Votes → XP</p>
      </div>

      {/* Duel cards grid */}
      <div className="px-4 mt-4 grid grid-cols-1 gap-3">
        {DUEL_TYPES.map((duel, i) => {
          const Icon = duel.icon
          return (
            <motion.button
              key={duel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => openModal(duel.id)}
              className="w-full rounded-2xl p-4 flex items-center gap-4 text-left transition-colors"
              style={{ background: '#1C1C1C', border: `1px solid ${duel.color}30` }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Icon bubble */}
              <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `${duel.color}15`, border: `1px solid ${duel.color}30` }}>
                <Icon size={22} style={{ color: duel.color }} />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-bold text-white text-sm"
                    style={{ fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 0.8 }}>
                    {duel.label}
                  </p>
                  {duel.badge && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                      style={{ background: `${duel.color}25`, color: duel.color, fontFamily: 'Barlow Condensed, sans-serif' }}>
                      {duel.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mb-1"
                  style={{ fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 0.4 }}>
                  {duel.subtitle}
                </p>
                <p className="text-xs text-neutral-600 line-clamp-1">{duel.desc}</p>
              </div>

              {/* XP + arrow */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-xs font-bold font-mono" style={{ color: duel.color }}>+{duel.xp} XP</span>
                <ChevronRight size={16} className="text-neutral-600" />
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Voting queue */}
      <div className="px-4">
        <VotingPanel
          queue={votingQueue}
          votesGiven={votesGiven}
          onVote={handleVote}
        />
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal === 'prompt_wars'  && <PromptWarsModal   key="pw"   {...modalProps} xpReward={100} />}
        {activeModal === 'build_race'   && <BuildRaceModal    key="br"   {...modalProps} />}
        {activeModal === 'vibe_coding'  && <VibeCodingModal   key="vc"   onClose={closeModal} />}
        {activeModal === 'agent_architect' && <AgentArchitectModal key="aa" {...modalProps} />}
        {activeModal === 'trend_decode'    && <TrendDecodeModal    key="td" {...modalProps} />}
        {activeModal === 'sprint'          && <SprintModal         key="sp" {...modalProps} />}
        {activeModal === 'dsa'             && <DSADuelModal        key="dsa" problem={dsaProblem} onClose={closeModal} onSolved={async () => {
          const xpGain = 80
          await updateProfile({ xp: (profile?.xp || 0) + xpGain, level: Math.floor(((profile?.xp || 0) + xpGain) / 500) + 1 })
          setSessionXP(x => x + xpGain)
          setWinFlash(true)
          setTimeout(() => setWinFlash(false), 2000)
          closeModal()
        }} />}
      </AnimatePresence>

      {/* Win flash */}
      <AnimatePresence>
        {winFlash && (
          <motion.div
            key="flash"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none flex items-center justify-center"
            style={{ background: 'rgba(200,241,53,0.08)', zIndex: 60 }}
          >
            <motion.p
              initial={{ scale: 0.5 }} animate={{ scale: 1.2 }} exit={{ scale: 0 }}
              className="text-5xl font-black"
              style={{ color: '#C8F135', fontFamily: 'Anton, sans-serif' }}>
              WIN!
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
