import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Newspaper, Send, Trophy, ExternalLink, Loader2, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { FALLBACK_PAPERS } from '../../data/duelContent'
import { useApp } from '../../context/AppContext'

const XP_REWARD = 75

async function fetchArxivPaper() {
  const ids = [
    '2312.11805', // Mixtral of Experts
    '2402.06196', // Gemma
    '2401.04088', // MoE
    '2305.10601', // LIMA
    '2307.09288', // Llama 2
  ]
  const id = ids[Math.floor(Math.random() * ids.length)]
  try {
    const res = await fetch(`https://export.arxiv.org/abs/${id}`, { signal: AbortSignal.timeout(4000) })
    const text = await res.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(text, 'text/html')
    const titleEl = doc.querySelector('.title.mathjax')
    const absEl   = doc.querySelector('.abstract.mathjax')
    if (titleEl && absEl) {
      return {
        title:    titleEl.textContent.replace('Title:', '').trim(),
        authors:  'ArXiv',
        year:     2024,
        abstract: absEl.textContent.replace('Abstract:', '').trim(),
        url:      `https://arxiv.org/abs/${id}`,
        tag:      'Latest',
      }
    }
  } catch {}
  return null
}

export default function TrendDecodeModal({ onClose, profile, updateProfile }) {
  const navigate    = useNavigate()
  const { ripple } = useApp()
  const [paper,    setPaper]    = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [bullets,  setBullets]  = useState('')
  const [phase,    setPhase]    = useState('read') // read | write | done
  const [won,      setWon]      = useState(false)

  useEffect(() => {
    fetchArxivPaper().then(p => {
      setPaper(p || FALLBACK_PAPERS[Math.floor(Math.random() * FALLBACK_PAPERS.length)])
      setLoading(false)
    })
  }, [])

  function scoreBullets(text) {
    const lines = text.split('\n').filter(l => l.trim().length > 15)
    let score = 0
    if (lines.length >= 3)  score += 40
    if (lines.length >= 2)  score += 20
    if (text.length > 150)  score += 20
    if (text.length > 250)  score += 20
    return Math.min(score, 100)
  }

  async function handleSubmit() {
    const s = scoreBullets(bullets)
    const playerWon = s >= 60
    setWon(playerWon)
    setPhase('done')

    const earnedXP = playerWon ? XP_REWARD : Math.round(XP_REWARD * 0.4)

    await ripple({
      action:     'paper_decoded',
      xpAmount:   earnedXP,
      userName:   profile?.name || 'You',
      duelResult: {
        type:      'trend_decode',
        challenge: paper?.title || 'Paper',
        playerA:   profile?.name || 'You',
        playerB:   'AI',
        outputA:   bullets,
        outputB:   paper?.abstract || '',
      },
      tickerText: `📰 ${profile?.name || 'You'} decoded "${paper?.title?.slice(0, 40)}..."`,
      profile,
      updateProfile,
    })

    if (updateProfile) {
      await updateProfile({ xp: (profile?.xp || 0) + earnedXP })
    }
  }

  const TAG_COLORS = {
    Foundational: '#C8F135', LLM: '#00D4C8', Alignment: '#E040FB',
    RAG: '#FFD700', Prompting: '#FF6B00', 'Fine-tuning': '#00BCD4', Latest: '#C8F135',
  }

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
            <Newspaper size={18} style={{ color: '#C8F135' }} />
            <span className="font-bold text-white" style={{ fontFamily: 'Anton, sans-serif', letterSpacing: 1 }}>
              TREND DECODE
            </span>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white"><X size={20} /></button>
        </div>

        <AnimatePresence mode="wait">

          {/* Loading */}
          {loading && (
            <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
              <Loader2 size={40} className="animate-spin" style={{ color: '#C8F135' }} />
              <p className="text-neutral-400 text-sm">Fetching latest AI paper...</p>
            </motion.div>
          )}

          {/* Read phase */}
          {!loading && phase === 'read' && paper && (
            <motion.div key="read" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex-1 overflow-y-auto flex flex-col gap-4 p-4">

              {/* Paper card */}
              <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: '#1C1C1C', border: '1px solid #2a2a2a' }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${TAG_COLORS[paper.tag] || '#C8F135'}20`, color: TAG_COLORS[paper.tag] || '#C8F135', fontFamily: 'Barlow Condensed, sans-serif' }}>
                        {paper.tag}
                      </span>
                      <span className="text-xs text-neutral-600">{paper.year}</span>
                    </div>
                    <p className="text-white font-bold text-sm leading-snug">{paper.title}</p>
                    <p className="text-xs text-neutral-500 mt-1">{paper.authors}</p>
                  </div>
                  {paper.url && (
                    <a href={paper.url} target="_blank" rel="noreferrer" className="text-neutral-600 hover:text-white flex-shrink-0">
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">{paper.abstract}</p>
              </div>

              {/* Instruction */}
              <div className="rounded-xl p-3" style={{ background: '#1a1a00', border: '1px solid #C8F13530' }}>
                <p className="text-xs" style={{ color: '#C8F135' }}>
                  Read the paper above, then write 3 bullet points explaining its key contributions in your own words.
                </p>
              </div>

              <button onClick={() => setPhase('write')}
                className="w-full py-3 rounded-xl font-bold text-sm"
                style={{ background: '#C8F135', color: '#000', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 1 }}>
                I'VE READ IT — START DECODING
              </button>
            </motion.div>
          )}

          {/* Write phase */}
          {phase === 'write' && (
            <motion.div key="write" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col p-4 gap-4">

              <div className="rounded-xl p-3" style={{ background: '#1C1C1C', border: '1px solid #2a2a2a' }}>
                <p className="text-xs text-neutral-500 mb-0.5">Paper</p>
                <p className="text-white text-sm font-semibold line-clamp-2">{paper?.title}</p>
              </div>

              <div>
                <p className="text-xs text-neutral-500 mb-2">
                  Write 3 bullet points explaining the key ideas (one per line, start each with •):
                </p>
                <textarea
                  value={bullets}
                  onChange={e => setBullets(e.target.value)}
                  placeholder="• The paper proposes...\n• The key innovation is...\n• The results show that..."
                  className="w-full rounded-xl p-3 text-sm text-white resize-none outline-none"
                  style={{
                    background: '#1C1C1C',
                    border: '1px solid #333',
                    minHeight: 180,
                    fontFamily: 'JetBrains Mono, monospace',
                    lineHeight: 1.8,
                  }}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={bullets.trim().length < 30}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-opacity"
                style={{
                  background: bullets.trim().length >= 30 ? '#C8F135' : '#333',
                  color:      bullets.trim().length >= 30 ? '#000'    : '#666',
                  fontFamily: 'Barlow Condensed, sans-serif',
                  letterSpacing: 1,
                }}>
                <Send size={16} /> SUBMIT DECODE
              </button>
            </motion.div>
          )}

          {/* Done */}
          {phase === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center gap-5 py-12 px-6">
              {won
                ? <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }}><Trophy size={64} style={{ color: '#C8F135' }} /></motion.div>
                : <Newspaper size={64} style={{ color: '#888' }} />
              }
              <p className="text-2xl font-bold" style={{ color: won ? '#C8F135' : '#fff', fontFamily: 'Anton, sans-serif' }}>
                {won ? 'PAPER DECODED!' : 'KEEP READING'}
              </p>
              <p className="text-neutral-400 text-sm text-center">
                {won
                  ? `Great analysis! +${XP_REWARD} XP earned.`
                  : `Write at least 3 detailed bullet points to earn full XP. +${Math.round(XP_REWARD * 0.4)} XP for trying.`}
              </p>

              {won && (
                <div className="w-full rounded-xl p-3 flex items-center gap-3"
                  style={{ background: '#1C1C1C', border: '1px solid #FFD70030' }}>
                  <Newspaper size={18} style={{ color: '#FFD700' }} />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">Posted to Campus Feed</p>
                    <p className="text-xs text-neutral-500">Your paper decode is live — classmates can read and comment</p>
                  </div>
                  <button onClick={() => { onClose(); navigate('/feed') }}
                    className="flex items-center gap-1 text-xs font-bold"
                    style={{ color: '#FFD700' }}>
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
