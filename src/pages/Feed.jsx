import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, X, Send, Loader2, MessageSquare, Swords,
  Newspaper, ThumbsUp, ThumbsDown, HandHeart, ExternalLink,
  ChevronDown, ChevronUp, Hammer, Bot, Zap,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import {
  subscribeToFeed, createFeedPost, celebratePost, uncelebratePost, voteHotTake,
} from '../services/firebaseService'
import { autoCompleteQuest } from '../lib/autoQuest'

// ─── Mock seed posts (shown when Firestore is empty) ─────────────────────────
const MOCK_POSTS = [
  {
    id: 'mock1', type: 'hot_take',
    authorName: 'Arjun M', authorSpec: 'AIML',
    content: 'Python will be obsolete in 5 years because AI will write all the code anyway. Learn prompt engineering, not syntax.',
    agreeCount: 34, disagreeCount: 18,
    createdAt: { toDate: () => new Date(Date.now() - 1800000) },
  },
  {
    id: 'mock2', type: 'duel_result',
    authorName: 'Priya K', authorSpec: 'Gen AI',
    duelType: 'prompt_wars', won: true, xpEarned: 100,
    challenge: 'Make Claude explain recursion using a student asking their senior',
    outputPreview: 'So Arjun walks up to his senior: "How do I understand recursion?" The senior says: "First understand recursion."...',
    createdAt: { toDate: () => new Date(Date.now() - 3600000) },
  },
  {
    id: 'mock3', type: 'paper_decoded',
    authorName: 'Karthik R', authorSpec: 'CSE',
    paperTitle: 'Attention Is All You Need (Vaswani et al., 2017)',
    content: '• The paper replaces RNNs with a pure attention-based Transformer — no recurrence needed\n• Attention lets every token look at every other token simultaneously, enabling massive parallelism\n• This became the foundation of GPT, BERT, and every modern LLM — the most cited ML paper ever',
    claps: 12,
    createdAt: { toDate: () => new Date(Date.now() - 7200000) },
  },
  {
    id: 'mock4', type: 'text',
    authorName: 'Neha S', authorSpec: 'AIDA',
    content: 'Just finished my first DSA Duel — solved Two Sum in 3 minutes! The Monaco Editor is 🔥 The opponent barely made it to 40%. Keep grinding everyone!',
    claps: 8,
    createdAt: { toDate: () => new Date(Date.now() - 10800000) },
  },
  {
    id: 'mock5', type: 'hot_take',
    authorName: 'Vijay P', authorSpec: 'Agentic AI',
    content: 'GPT-4 is actually worse than Claude for coding tasks. Anthropic just has better marketing 😂',
    agreeCount: 22, disagreeCount: 41,
    createdAt: { toDate: () => new Date(Date.now() - 14400000) },
  },
  {
    id: 'mock6', type: 'duel_result',
    authorName: 'Divya L', authorSpec: 'AIDS',
    duelType: 'agent_architect', won: true, xpEarned: 85,
    challenge: 'Design an agent that monitors HuggingFace for new models',
    outputPreview: 'System: Research assistant agent. Tools: web_search, email_send, notion_write. Loop: Check HF every 6h → filter by stars > 50 → summarize → notify.',
    createdAt: { toDate: () => new Date(Date.now() - 18000000) },
  },
  {
    id: 'mock7', type: 'achievement',
    authorName: 'Rahul T', authorSpec: 'Quantum',
    content: 'Just hit Level 5 and got promoted to Div3! 500 XP grind in 2 days 💪 The Sprint Blitz streak is real.',
    claps: 19,
    createdAt: { toDate: () => new Date(Date.now() - 21600000) },
  },
]

const specColors = {
  'CSE': '#00D4C8', 'AIML': '#C8F135', 'Agentic AI': '#E040FB',
  'Gen AI': '#FF6B00', 'AIDA': '#4CAF50', 'AIDS': '#FF4444', 'Quantum': '#8B5CF6',
}

function timeAgo(ts) {
  if (!ts?.toDate) return 'just now'
  const diff = Date.now() - ts.toDate().getTime()
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

function Avatar({ name, color, image }) {
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
      style={{ background: color || 'linear-gradient(135deg,#C8F135,#00D4C8)' }}>
      {image
        ? <img src={image} alt="" className="w-full h-full object-cover" />
        : <span style={{ color: '#000', fontSize: '0.7rem', fontWeight: 900, fontFamily: 'Anton, sans-serif' }}>
            {name?.[0]?.toUpperCase() || 'U'}
          </span>}
    </div>
  )
}

// ─── AI News horizontal scroll ───────────────────────────────────────────────
const NEWS_COLORS = ['#C8F135', '#00D4C8', '#E040FB', '#FFD700', '#FF6B00', '#8B5CF6']

function NewsDetailSheet({ item, color, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 260 }}
        className="w-full max-w-lg rounded-t-3xl overflow-hidden"
        style={{ background: '#111', border: `1px solid ${color}30` }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: '#333' }} />
        </div>

        <div className="px-5 pb-8 pt-2 flex flex-col gap-4">
          {/* Tag + emoji row */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: `${color}20`, color, fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 1 }}>
              {item.tag}
            </span>
            <span className="text-2xl">{item.emoji}</span>
          </div>

          {/* Headline */}
          <h2 style={{ color: '#fff', fontFamily: 'Anton, sans-serif', fontSize: '1.25rem', letterSpacing: '0.02em', lineHeight: 1.3 }}>
            {item.headline}
          </h2>

          {/* Source */}
          {item.source && (
            <p style={{ color: '#555', fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', marginTop: -8 }}>
              SOURCE: {item.source}
            </p>
          )}

          {/* Divider */}
          <div style={{ height: 1, background: `${color}20` }} />

          {/* Full summary */}
          <p style={{ color: '#aaa', fontSize: '0.88rem', lineHeight: 1.7 }}>
            {item.summary}
          </p>

          {/* Extra context if available */}
          {item.detail && (
            <p style={{ color: '#666', fontSize: '0.8rem', lineHeight: 1.6 }}>{item.detail}</p>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="w-full rounded-2xl py-3 mt-2 font-bold text-sm"
            style={{ background: `${color}15`, color, border: `1px solid ${color}30`, fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 1 }}
          >
            CLOSE
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function AINewsScroll({ items }) {
  const [selected, setSelected] = useState(null)
  if (!items?.length) return null

  const color = selected ? NEWS_COLORS[items.indexOf(selected) % NEWS_COLORS.length] : '#C8F135'

  return (
    <div className="pt-4 pb-2">
      <p className="px-4 text-xs font-bold mb-3"
        style={{ color: '#C8F135', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 1 }}>
        AI NEWS TODAY
      </p>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
        {items.map((item, i) => {
          const c = NEWS_COLORS[i % NEWS_COLORS.length]
          return (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => setSelected(item)}
              className="flex-shrink-0 rounded-2xl p-3 flex flex-col gap-2 text-left cursor-pointer"
              style={{ width: 200, background: '#1C1C1C', border: `1px solid ${c}30` }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${c}20`, color: c, fontFamily: 'Barlow Condensed, sans-serif' }}>
                  {item.tag}
                </span>
                <span className="text-lg">{item.emoji}</span>
              </div>
              <p className="text-white font-bold text-xs leading-snug line-clamp-2">{item.headline}</p>
              <p className="text-neutral-500 text-xs leading-relaxed line-clamp-2">{item.summary}</p>
              <p style={{ color: c, fontSize: '0.62rem', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 1, marginTop: 2 }}>
                TAP TO READ MORE →
              </p>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {selected && (
          <NewsDetailSheet
            key="news-detail"
            item={selected}
            color={color}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Comment section ─────────────────────────────────────────────────────────
function CommentSection({ postId }) {
  const { profile } = useAuth()
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')

  const addComment = () => {
    if (!text.trim()) return
    setComments(prev => [...prev, {
      id: Date.now(), author: profile?.fullName || profile?.name || 'You',
      text: text.trim(), time: 'just now',
    }])
    setText('')
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      {comments.map(c => (
        <div key={c.id} className="flex gap-2 items-start">
          <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
            style={{ background: '#C8F13530', color: '#C8F135' }}>
            {c.author[0]}
          </div>
          <div>
            <span className="text-xs font-bold text-white">{c.author} </span>
            <span className="text-xs text-neutral-400">{c.text}</span>
            <p className="text-xs text-neutral-700 mt-0.5">{c.time}</p>
          </div>
        </div>
      ))}
      <div className="flex gap-2 items-center mt-1">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addComment()}
          placeholder="Add a comment..."
          className="flex-1 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
          style={{ background: '#2a2a2a', border: '1px solid #333' }}
        />
        <button onClick={addComment} className="text-neutral-500 hover:text-white"><Send size={13} /></button>
      </div>
    </div>
  )
}

// ─── Post type renderers ──────────────────────────────────────────────────────

function HotTakeCard({ post }) {
  const { user, updateProfile } = useAuth()
  const [agree, setAgree]       = useState((post.agrees?.length ?? post.agreeCount) || 0)
  const [disagree, setDisagree] = useState((post.disagrees?.length ?? post.disagreeCount) || 0)
  const [voted, setVoted]       = useState(() => {
    if (!user?.uid) return null
    if (post.agrees?.includes(user.uid)) return 'agree'
    if (post.disagrees?.includes(user.uid)) return 'disagree'
    return null
  })
  const [showComments, setShowComments] = useState(false)

  function vote(side) {
    if (voted) return
    setVoted(side)
    if (side === 'agree')    setAgree(a => a + 1)
    if (side === 'disagree') setDisagree(d => d + 1)
    if (user?.uid && post.id && !post.id.startsWith('mock')) {
      voteHotTake(post.id, user.uid, side)
    }
    if (user?.uid) {
      autoCompleteQuest(user.uid, 'standup', updateProfile)
    }
  }

  const total = agree + disagree || 1
  const agreePct = Math.round((agree / total) * 100)

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: '#1C1C1C', border: '1px solid #FF6B0030' }}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Avatar name={post.authorName} color={specColors[post.authorSpec] || '#C8F135'} image={post.authorImage} />
        <div>
          <p className="text-xs font-bold text-white">{post.authorName}</p>
          <p className="text-xs text-neutral-600">{timeAgo(post.createdAt)}</p>
        </div>
        <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: '#FF6B0020', color: '#FF6B00', fontFamily: 'Barlow Condensed, sans-serif' }}>
          🔥 HOT TAKE
        </span>
      </div>

      {/* Take */}
      <p className="text-white text-sm font-semibold leading-snug">{post.content}</p>

      {/* Vote bar */}
      {(agree + disagree) > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-1 h-2 rounded-full overflow-hidden">
            <motion.div style={{ width: `${agreePct}%`, background: '#C8F135', height: '100%' }}
              animate={{ width: `${agreePct}%` }} transition={{ duration: 0.5 }} />
            <div style={{ flex: 1, background: '#333' }} />
          </div>
          <div className="flex justify-between text-xs text-neutral-500">
            <span style={{ color: '#C8F135' }}>{agree} agree ({agreePct}%)</span>
            <span>{disagree} disagree</span>
          </div>
        </div>
      )}

      {/* Vote buttons */}
      {!voted ? (
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => vote('agree')}
            className="py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            style={{ background: '#C8F13520', color: '#C8F135', border: '1px solid #C8F13530', fontFamily: 'Barlow Condensed, sans-serif' }}>
            <ThumbsUp size={12} /> AGREE
          </button>
          <button onClick={() => vote('disagree')}
            className="py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            style={{ background: '#1a1a1a', color: '#888', border: '1px solid #333', fontFamily: 'Barlow Condensed, sans-serif' }}>
            <ThumbsDown size={12} /> DISAGREE
          </button>
        </div>
      ) : (
        <p className="text-center text-xs text-neutral-500">You voted · {voted}</p>
      )}

      {/* Comments toggle */}
      <button onClick={() => setShowComments(s => !s)}
        className="flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-400">
        <MessageSquare size={12} />
        {showComments ? 'Hide' : 'Comments'}
        {showComments ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {showComments && <CommentSection postId={post.id} />}
    </div>
  )
}

function PaperDecodedCard({ post }) {
  const { user } = useAuth()
  const [showComments, setShowComments] = useState(false)
  const [claps, setClaps]   = useState(post.celebrations?.length ?? post.claps ?? 0)
  const [clapped, setClapped] = useState(() => user?.uid ? (post.celebrations?.includes(user.uid) || false) : false)

  function handleClap() {
    if (clapped) return
    setClapped(true)
    setClaps(c => c + 1)
    if (user?.uid && post.id && !post.id.startsWith('mock')) celebratePost(post.id, user.uid)
  }

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: '#1C1C1C', border: '1px solid #FFD70030' }}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Avatar name={post.authorName} color={specColors[post.authorSpec] || '#C8F135'} image={post.authorImage} />
        <div>
          <p className="text-xs font-bold text-white">{post.authorName}</p>
          <p className="text-xs text-neutral-600">{timeAgo(post.createdAt)}</p>
        </div>
        <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: '#FFD70020', color: '#FFD700', fontFamily: 'Barlow Condensed, sans-serif' }}>
          📰 PAPER DECODED
        </span>
      </div>

      {/* Paper title */}
      {post.paperTitle && (
        <div className="rounded-xl p-3" style={{ background: '#111', border: '1px solid #FFD70020' }}>
          <p className="text-xs text-neutral-500 mb-0.5">Paper</p>
          <p className="text-white text-sm font-bold leading-snug">{post.paperTitle}</p>
        </div>
      )}

      {/* Bullets */}
      <div className="flex flex-col gap-1.5">
        {(post.content || '').split('\n').filter(l => l.trim()).map((line, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-neutral-300 leading-relaxed">
            <span style={{ color: '#FFD700', flexShrink: 0, marginTop: 1 }}>•</span>
            <span>{line.replace(/^•\s*/, '')}</span>
          </div>
        ))}
      </div>

      {/* Clap */}
      <div className="flex items-center justify-between">
        <button onClick={handleClap}
          className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition-colors">
          <HandHeart size={13} style={{ color: clapped ? '#C8F135' : undefined }} />
          <span style={{ color: clapped ? '#C8F135' : undefined }}>{claps} claps</span>
        </button>
        <button onClick={() => setShowComments(s => !s)}
          className="flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-400">
          <MessageSquare size={12} />
          {showComments ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>
      {showComments && <CommentSection postId={post.id} />}
    </div>
  )
}

const DUEL_TYPE_ICONS = {
  prompt_wars:     Swords,
  build_race:      Hammer,
  agent_architect: Bot,
  trend_decode:    Newspaper,
  sprint:          Zap,
  dsa:             Zap,
}

function DuelResultCard({ post }) {
  const { user } = useAuth()
  const [showComments, setShowComments] = useState(false)
  const [claps, setClaps]   = useState(post.celebrations?.length ?? post.claps ?? 0)
  const [clapped, setClapped] = useState(() => user?.uid ? (post.celebrations?.includes(user.uid) || false) : false)
  const Icon = DUEL_TYPE_ICONS[post.duelType] || Swords

  function handleClap() {
    if (clapped) return
    setClapped(true)
    setClaps(c => c + 1)
    if (user?.uid && post.id && !post.id.startsWith('mock')) celebratePost(post.id, user.uid)
  }
  const isHTML = post.duelType === 'build_race'

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: '#1C1C1C', border: '1px solid #C8F13520' }}>
      <div className="flex items-center gap-2">
        <Avatar name={post.authorName} color={specColors[post.authorSpec] || '#C8F135'} image={post.authorImage} />
        <div>
          <p className="text-xs font-bold text-white">{post.authorName}</p>
          <p className="text-xs text-neutral-600">{timeAgo(post.createdAt)}</p>
        </div>
        <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
          style={{ background: '#C8F13520', color: '#C8F135', fontFamily: 'Barlow Condensed, sans-serif' }}>
          <Icon size={10} /> DUEL RESULT
        </span>
      </div>

      <p className="text-sm text-white font-semibold">
        {post.won ? '🏆 Won' : '⚔️ Completed'} {(post.duelType || 'duel').replace('_', ' ')} · <span style={{ color: '#C8F135' }}>+{post.xpEarned || 0} XP</span>
      </p>
      {post.challenge && <p className="text-xs text-neutral-500 -mt-1">"{post.challenge}"</p>}

      {/* Preview */}
      {post.outputPreview && !isHTML && (
        <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3 italic">
          "{post.outputPreview}"
        </p>
      )}
      {post.outputPreview && isHTML && (
        <div className="rounded-xl overflow-hidden border border-neutral-800 p-2 text-xs text-neutral-600">
          [HTML Build — vote in Arena]
        </div>
      )}

      <div className="flex items-center justify-between">
        <button onClick={handleClap}
          className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition-colors">
          <HandHeart size={13} style={{ color: clapped ? '#C8F135' : undefined }} />
          <span style={{ color: clapped ? '#C8F135' : undefined }}>{claps}</span>
        </button>
        <button onClick={() => setShowComments(s => !s)}
          className="flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-400">
          <MessageSquare size={12} />
          {showComments ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>
      {showComments && <CommentSection postId={post.id} />}
    </div>
  )
}

function StandardCard({ post }) {
  const { user } = useAuth()
  const [showComments, setShowComments] = useState(false)
  const [claps, setClaps]   = useState(post.celebrations?.length ?? post.claps ?? 0)
  const [clapped, setClapped] = useState(() => user?.uid ? (post.celebrations?.includes(user.uid) || false) : false)

  function handleClap() {
    if (clapped) return
    setClapped(true)
    setClaps(c => c + 1)
    if (user?.uid && post.id && !post.id.startsWith('mock')) celebratePost(post.id, user.uid)
  }

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: '#1C1C1C', border: '1px solid #2a2a2a' }}>
      <div className="flex items-center gap-2">
        <Avatar name={post.authorName} color={specColors[post.authorSpec] || '#888'} image={post.authorImage} />
        <div>
          <p className="text-xs font-bold text-white">{post.authorName}</p>
          <p className="text-xs text-neutral-600">{timeAgo(post.createdAt)}</p>
        </div>
        {post.type === 'achievement' && (
          <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: '#C8F13520', color: '#C8F135', fontFamily: 'Barlow Condensed, sans-serif' }}>
            🏅 ACHIEVEMENT
          </span>
        )}
      </div>
      {post.content && <p className="text-sm text-white leading-relaxed">{post.content}</p>}
      <div className="flex items-center justify-between">
        <button onClick={handleClap}
          className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition-colors">
          <HandHeart size={13} style={{ color: clapped ? '#C8F135' : undefined }} />
          <span style={{ color: clapped ? '#C8F135' : undefined }}>{claps || 0}</span>
        </button>
        <button onClick={() => setShowComments(s => !s)}
          className="flex items-center gap-1 text-xs text-neutral-600 hover:text-neutral-400">
          <MessageSquare size={12} />
          {showComments ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>
      {showComments && <CommentSection postId={post.id} />}
    </div>
  )
}

function PostCard({ post }) {
  if (post.type === 'hot_take')      return <HotTakeCard post={post} />
  if (post.type === 'paper_decoded') return <PaperDecodedCard post={post} />
  if (post.type === 'duel_result')   return <DuelResultCard post={post} />
  return <StandardCard post={post} />
}

// ─── New post modal ───────────────────────────────────────────────────────────
const POST_TYPES = [
  { id: 'text',       label: 'Thought',    icon: '💭', color: '#888' },
  { id: 'hot_take',   label: 'Hot Take',   icon: '🔥', color: '#FF6B00' },
  { id: 'build',      label: 'Build',      icon: '🏗️', color: '#00D4C8' },
  { id: 'achievement',label: 'Achievement',icon: '🏅', color: '#C8F135' },
]

function NewPostModal({ onClose, onPost }) {
  const { profile } = useAuth()
  const [type, setType]       = useState('text')
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)

  async function handlePost() {
    if (!content.trim() || posting) return
    setPosting(true)
    await onPost({ type, content, authorName: profile?.fullName || profile?.name || 'You', authorSpec: profile?.spec, claps: 0 })
    setPosting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 260 }}
        className="w-full max-w-lg rounded-t-2xl overflow-hidden"
        style={{ background: '#111' }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
          <p className="font-bold text-white text-sm" style={{ fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 1 }}>NEW POST</p>
          <button onClick={onClose}><X size={20} className="text-neutral-400" /></button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          {/* Type selector */}
          <div className="flex gap-2">
            {POST_TYPES.map(pt => (
              <button key={pt.id}
                onClick={() => setType(pt.id)}
                className="flex-1 py-2 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 transition-all"
                style={{
                  background: type === pt.id ? `${pt.color}20` : '#1C1C1C',
                  border: `1px solid ${type === pt.id ? pt.color : '#2a2a2a'}`,
                  color: type === pt.id ? pt.color : '#666',
                  fontFamily: 'Barlow Condensed, sans-serif',
                }}>
                <span>{pt.icon}</span>
                <span>{pt.label}</span>
              </button>
            ))}
          </div>

          {type === 'hot_take' && (
            <p className="text-xs text-neutral-500">A Hot Take lets campus Agree or Disagree with a live vote split.</p>
          )}

          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={
              type === 'hot_take'    ? 'Your controversial opinion...'
              : type === 'build'     ? 'What did you build? Share the details...'
              : type === 'achievement' ? "I just unlocked..."
              : "What's on your mind?"
            }
            autoFocus
            className="w-full rounded-xl p-3 text-sm text-white resize-none outline-none"
            style={{ background: '#1C1C1C', border: '1px solid #333', minHeight: 120 }}
          />

          <button onClick={handlePost} disabled={!content.trim() || posting}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            style={{
              background: content.trim() ? '#C8F135' : '#333',
              color:      content.trim() ? '#000'    : '#666',
              fontFamily: 'Barlow Condensed, sans-serif',
              letterSpacing: 1,
            }}>
            {posting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            POST
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main Feed page ───────────────────────────────────────────────────────────
export default function Feed() {
  const { user, profile, updateProfile } = useAuth()
  const { aiNews, addTickerItem }        = useApp()
  const [firestorePosts, setFirestorePosts] = useState([])
  const [loading, setLoading]              = useState(true)
  const [showNew, setShowNew]              = useState(false)

  useEffect(() => {
    const unsub = subscribeToFeed(posts => {
      setFirestorePosts(posts)
      setLoading(false)
    })
    return unsub
  }, [])

  // Merge: real posts first, then mock posts for any not already covered
  const posts = useMemo(() => {
    if (firestorePosts.length >= 3) return firestorePosts
    const realIds = new Set(firestorePosts.map(p => p.id))
    const fill    = MOCK_POSTS.filter(p => !realIds.has(p.id))
    return [...firestorePosts, ...fill]
  }, [firestorePosts])

  async function handlePost(data) {
    const uid = user?.uid
    if (!uid) return
    await createFeedPost({
      ...data,
      authorId:    uid,
      authorName:  profile?.fullName || profile?.name || 'Anonymous',
      authorSpec:  profile?.spec,
      authorImage: profile?.photoURL || null,
    })
    addTickerItem(`💬 ${profile?.name || 'You'} posted on the Feed`)
    await autoCompleteQuest(uid, 'post', updateProfile)
  }

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#000' }}>

      {/* AI news scroll */}
      <AINewsScroll items={aiNews} />

      {/* Feed header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div>
          <p className="text-xs text-neutral-600" style={{ fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 1 }}>CAMPUS FEED</p>
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Anton, sans-serif' }}>FEED</h1>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: '#C8F135' }}>
          <Plus size={20} style={{ color: '#000' }} />
        </button>
      </div>

      {/* Posts */}
      <div className="px-4 flex flex-col gap-3 mt-2">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-5">
            {/* Orbit dots animation */}
            <div className="relative w-14 h-14">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="absolute w-2.5 h-2.5 rounded-full"
                  style={{
                    background: ['#C8F135', '#00D4C8', '#E040FB'][i],
                    top: '50%', left: '50%',
                    marginTop: -5, marginLeft: -5,
                  }}
                  animate={{
                    x: [0, Math.cos((i * 2 * Math.PI) / 3) * 20, 0],
                    y: [0, Math.sin((i * 2 * Math.PI) / 3) * 20, 0],
                    scale: [1, 0.6, 1],
                    opacity: [0.8, 0.3, 0.8],
                  }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
                />
              ))}
            </div>
            <p style={{ color: '#333', fontSize: '0.7rem', fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 2 }}>
              LOADING FEED
            </p>
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-neutral-600">
            <p className="text-4xl">📭</p>
            <p className="text-sm">No posts yet. Be the first!</p>
          </div>
        )}

        {posts.map((post, i) => (
          <motion.div key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}>
            <PostCard post={post} />
          </motion.div>
        ))}
      </div>

      {/* New post modal */}
      <AnimatePresence>
        {showNew && <NewPostModal key="new" onClose={() => setShowNew(false)} onPost={handlePost} />}
      </AnimatePresence>
    </div>
  )
}
