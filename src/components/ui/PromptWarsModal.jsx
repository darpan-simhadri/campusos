import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Swords, Radar, Send, ThumbsUp, ThumbsDown, Zap, Trophy, User } from 'lucide-react'
import { runPrompt } from '../../lib/claudeService'
import { PROMPT_CHALLENGES, MOCK_OPPONENTS } from '../../data/duelContent'
import { useApp } from '../../context/AppContext'

const PHASE = {
  MATCHMAKING: 'matchmaking',
  VS:          'vs',
  WRITE:       'write',
  RUNNING:     'running',
  VOTE:        'vote',
  DONE:        'done',
}

const DUEL_DURATION = 120 // seconds to write prompt

export default function PromptWarsModal({ onClose, profile, updateProfile, xpReward = 100 }) {
  const { ripple, getRandomOpponent } = useApp()
  const [phase, setPhase]       = useState(PHASE.MATCHMAKING)
  const [opponent]              = useState(() => getRandomOpponent())
  const [challenge]             = useState(() => PROMPT_CHALLENGES[Math.floor(Math.random() * PROMPT_CHALLENGES.length)])
  const [myPrompt, setMyPrompt] = useState('')
  const [myOutput, setMyOutput] = useState('')
  const [oppOutput, setOppOutput] = useState('')
  const [myVotes, setMyVotes]   = useState(0)
  const [oppVotes, setOppVotes] = useState(0)
  const [voted, setVoted]       = useState(false)
  const [won, setWon]           = useState(false)
  const [timeLeft, setTimeLeft] = useState(DUEL_DURATION)
  const timerRef                = useRef(null)

  // ── Phase: Matchmaking ───────────────────────────────────────────────────
  function startMatchmaking() {
    setPhase(PHASE.MATCHMAKING)
    setTimeout(() => setPhase(PHASE.VS), 2500)
    setTimeout(() => {
      setPhase(PHASE.WRITE)
      startTimer()
    }, 4200)
  }

  function startTimer() {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          handleSubmit()
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  // ── Submit prompt → run Claude for both ─────────────────────────────────
  async function handleSubmit() {
    clearInterval(timerRef.current)
    if (!myPrompt.trim()) return
    setPhase(PHASE.RUNNING)

    const opponentPrompt = `${challenge} — ${opponent.name}'s interpretation: make it creative and specific to ${opponent.spec} students in India.`

    const [playerOut, oppOut] = await Promise.all([
      runPrompt(myPrompt),
      runPrompt(opponentPrompt),
    ])

    setMyOutput(playerOut)
    setOppOutput(oppOut)

    // Seed initial campus votes (random, skewed slightly toward player)
    const base = Math.floor(Math.random() * 30) + 10
    setMyVotes(base + Math.floor(Math.random() * 15))
    setOppVotes(base + Math.floor(Math.random() * 10))

    setPhase(PHASE.VOTE)
  }

  // ── Cast vote ────────────────────────────────────────────────────────────
  async function castVote(winner) {
    if (voted) return
    setVoted(true)
    const playerWon = winner === 'player'
    setWon(playerWon)
    if (playerWon) setMyVotes(v => v + 1)
    else setOppVotes(v => v + 1)

    const earnedXP = playerWon ? xpReward : Math.round(xpReward * 0.4)
    setPhase(PHASE.DONE)

    await ripple({
      action:      playerWon ? 'duel_won' : 'duel_lost',
      xpAmount:    earnedXP,
      userName:    profile?.name || 'You',
      duelResult:  {
        type:      'prompt_wars',
        challenge,
        playerA:   profile?.name || 'You',
        playerB:   opponent.name,
        outputA:   myOutput,
        outputB:   oppOutput,
      },
      tickerText:  playerWon
        ? `⚔️ ${profile?.name || 'You'} won a Prompt Wars duel! +${earnedXP} XP`
        : `⚔️ ${opponent.name} won a Prompt Wars duel`,
      profile,
      updateProfile,
      firebaseUpdateFn: updateProfile
        ? async (xp) => updateProfile({ xp: (profile?.xp || 0) + earnedXP })
        : null,
    })

    if (updateProfile) {
      await updateProfile({ xp: (profile?.xp || 0) + earnedXP })
    }
  }

  const total = myVotes + oppVotes || 1
  const myPct = Math.round((myVotes / total) * 100)
  const fmt   = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 260 }}
        className="w-full max-w-lg rounded-t-2xl flex flex-col overflow-hidden"
        style={{ background: '#111', maxHeight: '92vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Swords size={18} style={{ color: '#C8F135' }} />
            <span className="font-bold text-white" style={{ fontFamily: 'Anton, sans-serif', letterSpacing: 1 }}>
              PROMPT WARS
            </span>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* ── MATCHMAKING ─────────────────────────────────────────── */}
            {phase === PHASE.MATCHMAKING && (
              <motion.div key="mm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-6 py-16 px-4">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                  <Radar size={56} style={{ color: '#C8F135' }} />
                </motion.div>
                <p className="text-white font-semibold text-lg">Finding opponent...</p>
                <p className="text-neutral-500 text-sm text-center">Scanning {Math.floor(Math.random() * 200 + 50)} students online</p>
              </motion.div>
            )}

            {/* ── VS SCREEN ───────────────────────────────────────────── */}
            {phase === PHASE.VS && (
              <motion.div key="vs" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-6 py-14 px-4">
                <div className="flex items-center gap-6 w-full justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                      style={{ background: '#C8F135', color: '#000' }}>
                      {(profile?.name || 'Y')[0]}
                    </div>
                    <span className="text-white font-semibold text-sm">{profile?.name || 'You'}</span>
                    <span className="text-xs text-neutral-400">{profile?.spec || 'Student'}</span>
                  </div>
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: 3, duration: 0.4 }}>
                    <Swords size={36} style={{ color: '#C8F135' }} />
                  </motion.div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                      style={{ background: opponent.color, color: '#000' }}>
                      {opponent.avatar}
                    </div>
                    <span className="text-white font-semibold text-sm">{opponent.name}</span>
                    <span className="text-xs text-neutral-400">{opponent.spec}</span>
                  </div>
                </div>
                <p className="text-neutral-400 text-sm">Match found! Get ready...</p>
              </motion.div>
            )}

            {/* ── WRITE PROMPT ─────────────────────────────────────────── */}
            {phase === PHASE.WRITE && (
              <motion.div key="write" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4 p-4">
                {/* Challenge */}
                <div className="rounded-xl p-4" style={{ background: '#1C1C1C', border: '1px solid #2a2a2a' }}>
                  <p className="text-xs text-neutral-500 mb-1" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>CHALLENGE</p>
                  <p className="text-white font-semibold text-sm leading-snug">{challenge}</p>
                </div>

                {/* Timer */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Write your prompt below</span>
                  <span className="font-mono text-sm font-bold" style={{ color: timeLeft < 30 ? '#ef4444' : '#C8F135' }}>
                    {fmt(timeLeft)}
                  </span>
                </div>

                {/* Textarea */}
                <textarea
                  value={myPrompt}
                  onChange={e => setMyPrompt(e.target.value)}
                  placeholder="Write a prompt that would make Claude produce something amazing for this challenge..."
                  className="w-full rounded-xl p-3 text-sm text-white resize-none outline-none"
                  style={{ background: '#1C1C1C', border: '1px solid #333', minHeight: 160, fontFamily: 'JetBrains Mono, monospace' }}
                />

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!myPrompt.trim()}
                  className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity"
                  style={{
                    background: myPrompt.trim() ? '#C8F135' : '#333',
                    color:      myPrompt.trim() ? '#000'    : '#666',
                    fontFamily: 'Barlow Condensed, sans-serif',
                    letterSpacing: 1,
                  }}
                >
                  <Send size={16} /> SUBMIT PROMPT
                </button>

                {/* Opponent status */}
                <div className="flex items-center gap-2 rounded-lg p-2" style={{ background: '#1a1a1a' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: opponent.color, color: '#000' }}>
                    {opponent.avatar}
                  </div>
                  <span className="text-xs text-neutral-400">{opponent.name} is writing their prompt...</span>
                  <motion.div className="flex gap-1 ml-auto" animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                    {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: opponent.color }} />)}
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* ── RUNNING ─────────────────────────────────────────────── */}
            {phase === PHASE.RUNNING && (
              <motion.div key="run" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center gap-4 py-16 px-4">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
                  <Zap size={48} style={{ color: '#C8F135' }} />
                </motion.div>
                <p className="text-white font-semibold">Claude is judging both prompts...</p>
                <p className="text-neutral-500 text-sm text-center">Running your prompt and {opponent.name}'s in parallel</p>
              </motion.div>
            )}

            {/* ── VOTE ────────────────────────────────────────────────── */}
            {phase === PHASE.VOTE && (
              <motion.div key="vote" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4 p-4">
                <p className="text-center text-white font-bold text-sm" style={{ fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 1 }}>
                  CAMPUS VOTES — WHICH PROMPT WON?
                </p>

                {/* Vote split bar */}
                <div className="w-full h-2 rounded-full overflow-hidden flex" style={{ background: '#222' }}>
                  <motion.div
                    animate={{ width: `${myPct}%` }}
                    transition={{ duration: 0.8 }}
                    style={{ background: '#C8F135', height: '100%' }}
                  />
                </div>
                <div className="flex justify-between text-xs text-neutral-400">
                  <span style={{ color: '#C8F135' }}>{myVotes} votes · You</span>
                  <span>{oppVotes} votes · {opponent.name}</span>
                </div>

                {/* Side by side outputs */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Your Output', text: myOutput, color: '#C8F135', tag: '← You' },
                    { label: opponent.name, text: oppOutput, color: opponent.color, tag: 'Opponent →' },
                  ].map(({ label, text, color, tag }) => (
                    <div key={label} className="rounded-xl p-3 flex flex-col gap-2"
                      style={{ background: '#1C1C1C', border: `1px solid ${color}33` }}>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold" style={{ color, fontFamily: 'Barlow Condensed, sans-serif' }}>{label}</p>
                        <span className="text-xs text-neutral-600">{tag}</span>
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed line-clamp-6">{text}</p>
                    </div>
                  ))}
                </div>

                {/* Vote buttons */}
                {!voted && (
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <button onClick={() => castVote('player')}
                      className="py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                      style={{ background: '#C8F135', color: '#000', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 1 }}>
                      <ThumbsUp size={16} /> MINE IS BETTER
                    </button>
                    <button onClick={() => castVote('opponent')}
                      className="py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                      style={{ background: '#1C1C1C', color: '#ccc', border: '1px solid #333', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 1 }}>
                      <ThumbsDown size={16} /> THEIRS IS BETTER
                    </button>
                  </div>
                )}
                {voted && (
                  <p className="text-center text-sm" style={{ color: '#C8F135' }}>
                    Vote cast! This duel is now in the campus voting queue.
                  </p>
                )}
              </motion.div>
            )}

            {/* ── DONE ────────────────────────────────────────────────── */}
            {phase === PHASE.DONE && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center gap-5 py-14 px-4">
                {won ? (
                  <motion.div animate={{ rotate: [0, -10, 10, -5, 5, 0] }} transition={{ duration: 0.6 }}>
                    <Trophy size={64} style={{ color: '#C8F135' }} />
                  </motion.div>
                ) : (
                  <User size={64} style={{ color: '#888' }} />
                )}
                <p className="text-2xl font-bold" style={{ color: won ? '#C8F135' : '#fff', fontFamily: 'Anton, sans-serif' }}>
                  {won ? 'YOU WON!' : 'CLOSE MATCH'}
                </p>
                <p className="text-neutral-400 text-sm text-center">
                  {won
                    ? `Campus voted your prompt as the winner! +${xpReward} XP earned.`
                    : `${opponent.name}'s prompt got more votes this time. +${Math.round(xpReward * 0.4)} XP for participating.`}
                </p>
                <p className="text-xs text-neutral-600 text-center">Your duel has been added to the campus voting queue for more votes.</p>
                <button onClick={onClose}
                  className="mt-2 px-8 py-3 rounded-xl font-bold text-sm"
                  style={{ background: '#C8F135', color: '#000', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 1 }}>
                  BACK TO ARENA
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Start button when first opening */}
        {phase === PHASE.MATCHMAKING && (
          <div className="px-4 pb-4">
            <button onClick={startMatchmaking}
              className="w-full py-3 rounded-xl font-bold text-sm"
              style={{ background: '#C8F135', color: '#000', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 1 }}>
              FIND OPPONENT
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
