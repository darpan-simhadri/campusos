import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bot, Send, Trophy, Newspaper, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AGENT_CHALLENGES, AGENT_TOOLS } from '../../data/duelContent'
import { useApp } from '../../context/AppContext'

const XP_REWARD = 85

export default function AgentArchitectModal({ onClose, profile, updateProfile }) {
  const { ripple, getRandomOpponent } = useApp()
  const navigate    = useNavigate()
  const [challenge] = useState(() => AGENT_CHALLENGES[Math.floor(Math.random() * AGENT_CHALLENGES.length)])
  const [opponent]  = useState(() => getRandomOpponent())

  const [systemPrompt,   setSystemPrompt]   = useState('')
  const [selectedTools,  setSelectedTools]  = useState([])
  const [decisionLoop,   setDecisionLoop]   = useState('')
  const [guardrails,     setGuardrails]     = useState('')
  const [failureMode,    setFailureMode]    = useState('')
  const [phase,          setPhase]          = useState('build') // build | done
  const [won,            setWon]            = useState(false)
  const [score,          setScore]          = useState(0)

  function toggleTool(tool) {
    setSelectedTools(prev =>
      prev.includes(tool) ? prev.filter(t => t !== tool) : [...prev, tool]
    )
  }

  function computeScore() {
    let s = 0
    if (systemPrompt.trim().length > 40) s += 25
    if (selectedTools.length >= 2)       s += 20
    if (decisionLoop.trim().length > 30) s += 25
    if (guardrails.trim().length > 20)   s += 15
    if (failureMode.trim().length > 20)  s += 15
    return s
  }

  async function handleSubmit() {
    const s = computeScore()
    setScore(s)
    const playerWon = s >= 60
    setWon(playerWon)
    setPhase('done')

    const earnedXP = playerWon ? XP_REWARD : Math.round(XP_REWARD * 0.4)

    await ripple({
      action:     playerWon ? 'duel_won' : 'duel_lost',
      xpAmount:   earnedXP,
      userName:   profile?.name || 'You',
      duelResult: {
        type:      'agent_architect',
        challenge,
        playerA:   profile?.name || 'You',
        playerB:   opponent.name,
        outputA:   `System: ${systemPrompt} | Tools: ${selectedTools.join(',')} | Loop: ${decisionLoop}`,
        outputB:   'Opponent agent design',
      },
      tickerText: playerWon
        ? `🤖 ${profile?.name || 'You'} designed an agent! +${earnedXP} XP`
        : `🤖 ${opponent.name} out-designed ${profile?.name || 'You'} in Agent Architect`,
      profile,
      updateProfile,
    })

    if (updateProfile) {
      await updateProfile({ xp: (profile?.xp || 0) + earnedXP })
    }
  }

  const isReady = systemPrompt.trim() && selectedTools.length > 0 && decisionLoop.trim()

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
            <Bot size={18} style={{ color: '#C8F135' }} />
            <span className="font-bold text-white" style={{ fontFamily: 'Anton, sans-serif', letterSpacing: 1 }}>
              AGENT ARCHITECT
            </span>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white"><X size={20} /></button>
        </div>

        <AnimatePresence mode="wait">
          {phase === 'build' && (
            <motion.div key="build" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex-1 overflow-y-auto">
              <div className="p-4 flex flex-col gap-5">

                {/* Challenge */}
                <div className="rounded-xl p-4" style={{ background: '#1C1C1C', border: '1px solid #2a2a2a' }}>
                  <p className="text-xs text-neutral-500 mb-1" style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>YOUR CHALLENGE</p>
                  <p className="text-white font-semibold text-sm leading-snug">{challenge}</p>
                </div>

                {/* System Prompt */}
                <Section label="SYSTEM PROMPT" hint="What personality and instructions does your agent have?">
                  <textarea
                    value={systemPrompt}
                    onChange={e => setSystemPrompt(e.target.value)}
                    placeholder="You are an agent that... Your goal is to... You should always..."
                    className="w-full rounded-xl p-3 text-sm text-white resize-none outline-none"
                    style={{ background: '#1C1C1C', border: '1px solid #333', minHeight: 90, fontFamily: 'JetBrains Mono, monospace' }}
                  />
                </Section>

                {/* Tools */}
                <Section label="TOOL SELECTION" hint="Pick the tools your agent can use (select 2+)">
                  <div className="flex flex-wrap gap-2">
                    {AGENT_TOOLS.map(tool => (
                      <button key={tool}
                        onClick={() => toggleTool(tool)}
                        className="px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all"
                        style={{
                          background: selectedTools.includes(tool) ? '#C8F135' : '#1C1C1C',
                          color:      selectedTools.includes(tool) ? '#000'    : '#888',
                          border:     `1px solid ${selectedTools.includes(tool) ? '#C8F135' : '#333'}`,
                        }}>
                        {tool}
                      </button>
                    ))}
                  </div>
                </Section>

                {/* Decision Loop */}
                <Section label="DECISION LOOP" hint="How does the agent decide what to do next?">
                  <textarea
                    value={decisionLoop}
                    onChange={e => setDecisionLoop(e.target.value)}
                    placeholder="The agent first searches for X, then evaluates Y, then decides whether to..."
                    className="w-full rounded-xl p-3 text-sm text-white resize-none outline-none"
                    style={{ background: '#1C1C1C', border: '1px solid #333', minHeight: 70, fontFamily: 'JetBrains Mono, monospace' }}
                  />
                </Section>

                {/* Guardrails */}
                <Section label="GUARDRAILS" hint="What should the agent never do?">
                  <textarea
                    value={guardrails}
                    onChange={e => setGuardrails(e.target.value)}
                    placeholder="Never send emails without confirmation. Never access private files..."
                    className="w-full rounded-xl p-3 text-sm text-white resize-none outline-none"
                    style={{ background: '#1C1C1C', border: '1px solid #333', minHeight: 60, fontFamily: 'JetBrains Mono, monospace' }}
                  />
                </Section>

                {/* Failure Mode */}
                <Section label="FAILURE CONDITION" hint="When should the agent stop and ask for help?">
                  <textarea
                    value={failureMode}
                    onChange={e => setFailureMode(e.target.value)}
                    placeholder="If the agent cannot complete the task in 3 attempts, it should..."
                    className="w-full rounded-xl p-3 text-sm text-white resize-none outline-none"
                    style={{ background: '#1C1C1C', border: '1px solid #333', minHeight: 60, fontFamily: 'JetBrains Mono, monospace' }}
                  />
                </Section>

              </div>

              {/* Submit */}
              <div className="px-4 pb-6 pt-1">
                <button
                  onClick={handleSubmit}
                  disabled={!isReady}
                  className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity"
                  style={{
                    background: isReady ? '#C8F135' : '#333',
                    color:      isReady ? '#000'    : '#666',
                    fontFamily: 'Barlow Condensed, sans-serif',
                    letterSpacing: 1,
                  }}>
                  <Send size={16} /> DEPLOY AGENT
                </button>
              </div>
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center gap-5 py-12 px-6">

              {won
                ? <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }}><Trophy size={64} style={{ color: '#C8F135' }} /></motion.div>
                : <Bot size={64} style={{ color: '#888' }} />
              }

              <p className="text-2xl font-bold" style={{ color: won ? '#C8F135' : '#fff', fontFamily: 'Anton, sans-serif' }}>
                {won ? 'SOLID DESIGN!' : 'NEEDS WORK'}
              </p>

              {/* Score bar */}
              <div className="w-full">
                <div className="flex justify-between text-xs text-neutral-500 mb-2">
                  <span>Design Score</span>
                  <span style={{ color: '#C8F135' }}>{score}/100</span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: '#1C1C1C' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    style={{ height: '100%', background: score >= 60 ? '#C8F135' : '#ef4444', borderRadius: 999 }}
                  />
                </div>
              </div>

              <p className="text-neutral-400 text-sm text-center">
                {won
                  ? `Well-designed agent! +${XP_REWARD} XP added and your design is posted to the Feed.`
                  : `Your agent design scored ${score}/100. Fill in all sections for a higher score.`}
              </p>

              {won && (
                <div className="w-full rounded-xl p-3 flex items-center gap-3"
                  style={{ background: '#1C1C1C', border: '1px solid #C8F13530' }}>
                  <Newspaper size={18} style={{ color: '#C8F135' }} />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">Posted to Campus Feed</p>
                    <p className="text-xs text-neutral-500">Others can see and comment on your agent design</p>
                  </div>
                  <button onClick={() => { onClose(); navigate('/feed') }}
                    className="flex items-center gap-1 text-xs font-bold"
                    style={{ color: '#C8F135' }}>
                    VIEW <ArrowRight size={12} />
                  </button>
                </div>
              )}

              <button onClick={onClose}
                className="mt-2 px-8 py-3 rounded-xl font-bold text-sm"
                style={{ background: '#C8F135', color: '#000', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 1 }}>
                BACK TO ARENA
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

function Section({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="text-xs font-bold" style={{ color: '#C8F135', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 1 }}>{label}</p>
        {hint && <p className="text-xs text-neutral-600">{hint}</p>}
      </div>
      {children}
    </div>
  )
}
