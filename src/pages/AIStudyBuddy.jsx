import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, RefreshCw, Loader2, User, Wifi, WifiOff, Copy, Check, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { streamOllama, checkOllamaConnection, getAvailableModels } from '../services/aiService'
import { useAuth } from '../context/AuthContext'
import { spring, staggerContainer, staggerItemFast, messageBubble } from '../lib/motion'

const SUGGESTIONS = [
  'Explain how Binary Search Trees work',
  'Help me debug this React useEffect issue',
  'What are the ACID properties of DBMS?',
  'Give me a mock FAANG interview question',
  'Summarize the OSI model layers',
  'Write a Python function to reverse a linked list',
]

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <motion.button
      onClick={copy}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={spring.snappy}
      className="absolute top-2.5 right-2.5 p-1.5 rounded-lg transition-colors"
      style={{ color: 'var(--text-tertiary)' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied
          ? <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={spring.bouncy}>
              <Check className="w-3.5 h-3.5" style={{ color: '#16a34a' }} />
            </motion.span>
          : <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Copy className="w-3.5 h-3.5" />
            </motion.span>
        }
      </AnimatePresence>
    </motion.button>
  )
}

function Message({ msg, index }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      variants={messageBubble}
      initial="initial"
      animate="animate"
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <motion.div
          whileHover={{ scale: 1.08 }}
          transition={spring.snappy}
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
          }}
        >
          <Bot className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        </motion.div>
      )}

      <div className={`max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <motion.div
          style={isUser ? {
            background: 'var(--accent)',
            color: 'var(--accent-fg)',
            borderRadius: '18px 18px 4px 18px',
            padding: '10px 14px',
            fontSize: '0.875rem',
            lineHeight: 1.6,
          } : {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '18px 18px 18px 4px',
            padding: '12px 16px',
            fontSize: '0.875rem',
          }}
        >
          {isUser ? (
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{msg.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none" style={{ color: 'var(--text-primary)' }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    if (inline) return (
                      <code
                        style={{
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          padding: '1px 6px',
                          borderRadius: 4,
                          fontSize: '0.82em',
                          border: '1px solid var(--border)',
                        }}
                        {...props}
                      >
                        {children}
                      </code>
                    )
                    return (
                      <div className="relative my-3">
                        <pre style={{
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border)',
                          borderRadius: 10,
                          padding: '14px 16px',
                          overflowX: 'auto',
                          fontSize: '0.82rem',
                          margin: 0,
                        }}>
                          <code {...props}>{children}</code>
                        </pre>
                        <CopyButton text={String(children)} />
                      </div>
                    )
                  },
                  p: ({ children }) => <p style={{ marginBottom: '8px', lineHeight: 1.65, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{children}</p>,
                  ul: ({ children }) => <ul style={{ listStyleType: 'disc', paddingLeft: '1.2rem', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-primary)' }}>{children}</ul>,
                  ol: ({ children }) => <ol style={{ listStyleType: 'decimal', paddingLeft: '1.2rem', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-primary)' }}>{children}</ol>,
                  h1: ({ children }) => <h1 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{children}</h1>,
                  h2: ({ children }) => <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)', letterSpacing: '-0.015em' }}>{children}</h2>,
                  h3: ({ children }) => <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>{children}</h3>,
                  strong: ({ children }) => <strong style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{children}</strong>,
                  blockquote: ({ children }) => (
                    <blockquote style={{
                      borderLeft: '2px solid var(--border-strong)',
                      paddingLeft: '12px',
                      color: 'var(--text-secondary)',
                      fontStyle: 'italic',
                      margin: '8px 0',
                    }}>
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {msg.content}
              </ReactMarkdown>
              {msg.streaming && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="inline-block w-[3px] h-4 rounded-sm ml-0.5 align-middle"
                  style={{ background: 'var(--text-primary)' }}
                />
              )}
            </div>
          )}
        </motion.div>
      </div>

      {isUser && (
        <motion.div
          whileHover={{ scale: 1.08 }}
          transition={spring.snappy}
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
        >
          <User className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
        </motion.div>
      )}
    </motion.div>
  )
}

export default function AIStudyBuddy() {
  const { profile } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [ollamaOnline, setOllamaOnline] = useState(null)
  const [models, setModels] = useState([])
  const [selectedModel, setSelectedModel] = useState('llama3')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    checkOllamaConnection().then(online => {
      setOllamaOnline(online)
      if (online) getAvailableModels().then(m => { setModels(m); if (m.length) setSelectedModel(m[0]) })
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const systemPrompt = `You are an AI Study Buddy for college students at CampusOS.
You help with academic questions, coding problems, interview prep, and study guidance.
The student's name is ${profile?.fullName || 'Student'}, studying ${profile?.branch || 'Computer Science'}.
Their skills include: ${profile?.skills?.join(', ') || 'programming'}.
Be concise, educational, and supportive. Format code properly with markdown.`

  const sendMessage = async () => {
    if (!input.trim() || streaming) return
    const userMsg = { role: 'user', content: input.trim() }
    setInput('')
    setMessages(prev => [...prev, userMsg])
    setStreaming(true)
    setMessages(prev => [...prev, { role: 'assistant', content: '', streaming: true }])

    const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
    const allMessages = [{ role: 'system', content: systemPrompt }, ...history]

    try {
      let full = ''
      for await (const chunk of streamOllama(allMessages, selectedModel)) {
        full += chunk
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: full, streaming: true }
          return updated
        })
      }
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: full, streaming: false }
        return updated
      })
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: `⚠️ ${err.message}. Make sure Ollama is running with \`ollama serve\`.`,
          streaming: false,
        }
        return updated
      })
    } finally {
      setStreaming(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="flex flex-col" style={{ height: '100%' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={spring.bouncy}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
          >
            <Bot className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          </motion.div>
          <div>
            <h1 className="font-bold text-sm" style={{ color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
              AI Study Buddy
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              {ollamaOnline === null ? (
                <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Checking...</span>
              ) : ollamaOnline ? (
                <>
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: '#16a34a' }}
                  />
                  <span className="text-xs" style={{ color: '#16a34a' }}>Connected</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#dc2626' }} />
                  <span className="text-xs" style={{ color: '#dc2626' }}>Offline · run: ollama serve</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {models.length > 0 && (
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              className="input-field text-xs py-1.5 px-2.5"
              style={{ width: 'auto' }}
            >
              {models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          )}
          {messages.length > 0 && (
            <motion.button
              whileHover={{ rotate: 180, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMessages([])}
              className="p-2 rounded-lg"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              title="Clear chat"
            >
              <RefreshCw className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center h-full min-h-[300px]"
            >
              <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
              >
                <Sparkles className="w-8 h-8" style={{ color: 'var(--text-secondary)' }} />
              </motion.div>
              <h2 className="text-xl font-bold mb-1.5" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
                Ask me anything
              </h2>
              <p className="text-sm mb-8 text-center max-w-xs" style={{ color: 'var(--text-tertiary)', lineHeight: 1.7 }}>
                Concepts, code, interview prep, or academic doubts — powered by Ollama.
              </p>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-lg"
              >
                {SUGGESTIONS.map(s => (
                  <motion.button
                    key={s}
                    variants={staggerItemFast}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    transition={spring.smooth}
                    onClick={() => { setInput(s); inputRef.current?.focus() }}
                    className="text-left p-3 rounded-xl text-xs"
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--bg-hover)'
                      e.currentTarget.style.borderColor = 'var(--border-strong)'
                      e.currentTarget.style.color = 'var(--text-primary)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'var(--bg-secondary)'
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }}
                  >
                    {s}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {messages.map((msg, i) => <Message key={i} msg={msg} index={i} />)}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="flex-shrink-0 px-4 pb-4 pt-3"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="flex gap-2.5 max-w-3xl mx-auto">
          <motion.div
            className="flex-1"
            animate={{
              boxShadow: streaming
                ? '0 0 0 2px var(--border-strong)'
                : '0 0 0 0px transparent'
            }}
            transition={{ duration: 0.2 }}
            style={{ borderRadius: 10 }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
              }}
              placeholder="Ask anything... (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="input-field resize-none"
              style={{ minHeight: '42px', maxHeight: '120px', lineHeight: 1.6 }}
            />
          </motion.div>
          <motion.button
            onClick={sendMessage}
            disabled={streaming || !input.trim() || !ollamaOnline}
            className="btn-primary px-4 self-end"
            style={{ height: '42px' }}
            whileHover={(!streaming && input.trim() && ollamaOnline) ? { y: -1, scale: 1.03 } : {}}
            whileTap={{ scale: 0.96 }}
            transition={spring.snappy}
          >
            <AnimatePresence mode="wait" initial={false}>
              {streaming
                ? <motion.span key="loader" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </motion.span>
                : <motion.span key="send" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Send className="w-4 h-4" />
                  </motion.span>
              }
            </AnimatePresence>
          </motion.button>
        </div>
        <p className="text-center mt-2" style={{ color: 'var(--text-tertiary)', fontSize: '0.67rem' }}>
          Shift+Enter for new line · Enter to send · {selectedModel}
        </p>
      </motion.div>
    </div>
  )
}
