import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, RefreshCw, AlertCircle, Loader2, User, Wifi, WifiOff, Copy, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { streamOllama, checkOllamaConnection, getAvailableModels } from '../services/aiService'
import { useAuth } from '../context/AuthContext'

const SUGGESTIONS = [
  'Explain how Binary Search Trees work',
  'Help me debug this React useEffect issue',
  'What are the ACID properties of DBMS?',
  'Give me a mock interview question for FAANG',
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
    <button onClick={copy} className="p-1.5 rounded hover:bg-gray-700 text-gray-500 hover:text-gray-300 transition-colors absolute top-2 right-2">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center flex-shrink-0 mt-1">
          <Bot className="w-4 h-4 text-indigo-400" />
        </div>
      )}
      <div className={`max-w-2xl ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`px-4 py-3 rounded-2xl ${isUser
          ? 'bg-indigo-600 text-white rounded-br-sm'
          : 'bg-gray-800 text-gray-100 rounded-bl-sm border border-gray-700'
        }`}>
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none text-gray-100">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    if (inline) return <code className="bg-gray-900 text-indigo-300 px-1.5 py-0.5 rounded text-xs" {...props}>{children}</code>
                    return (
                      <div className="relative my-2">
                        <pre className="bg-gray-950 border border-gray-700 rounded-lg p-4 overflow-x-auto text-xs">
                          <code {...props}>{children}</code>
                        </pre>
                        <CopyButton text={String(children)} />
                      </div>
                    )
                  },
                  p: ({ children }) => <p className="mb-2 last:mb-0 text-sm leading-relaxed">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1 text-sm">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1 text-sm">{children}</ol>,
                  h1: ({ children }) => <h1 className="text-base font-bold mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-sm font-bold mb-1.5">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                  blockquote: ({ children }) => <blockquote className="border-l-2 border-indigo-500 pl-3 text-gray-400 italic">{children}</blockquote>,
                }}
              >
                {msg.content}
              </ReactMarkdown>
              {msg.streaming && <span className="inline-block w-2 h-4 bg-indigo-400 animate-pulse ml-0.5 align-middle rounded" />}
            </div>
          )}
        </div>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-4 h-4 text-gray-300" />
        </div>
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
  const [mode, setMode] = useState('local')
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

    const aiMsg = { role: 'assistant', content: '', streaming: true }
    setMessages(prev => [...prev, aiMsg])

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
          content: `⚠️ Error: ${err.message}. Make sure Ollama is running with \`ollama serve\`.`,
          streaming: false,
        }
        return updated
      })
    } finally {
      setStreaming(false)
      inputRef.current?.focus()
    }
  }

  const clearChat = () => setMessages([])

  return (
    <div className="flex flex-col h-[calc(100vh-57px)]">
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center">
            <Bot className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="font-semibold text-white text-sm">AI Study Buddy</h1>
            <div className="flex items-center gap-1.5">
              {ollamaOnline === null ? (
                <span className="text-xs text-gray-500">Checking connection...</span>
              ) : ollamaOnline ? (
                <>
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span className="text-xs text-emerald-400">Ollama connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-red-400" />
                  <span className="text-xs text-red-400">Ollama offline — run: ollama serve</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {models.length > 0 && (
            <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-gray-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
              {models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          )}
          <div className="flex rounded-lg bg-gray-800 border border-gray-700 p-0.5">
            {['local', 'cloud'].map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${mode === m ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                {m === 'local' ? '🖥️ Local' : '☁️ Cloud'}
              </button>
            ))}
          </div>
          {messages.length > 0 && (
            <button onClick={clearChat} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors" title="Clear chat">
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">AI Study Buddy</h2>
            <p className="text-gray-400 text-sm mb-8 text-center max-w-sm">
              Powered by Ollama. Ask me anything — concepts, code, interview prep, or academic doubts.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => { setInput(s); inputRef.current?.focus() }}
                  className="text-left p-3 rounded-xl bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 hover:border-indigo-500/40 text-gray-300 text-xs transition-all">
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-800 p-4 bg-gray-900">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
            }}
            placeholder="Ask anything... (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="input-field flex-1 resize-none min-h-[44px] max-h-32"
            style={{ height: 'auto' }}
          />
          <button onClick={sendMessage} disabled={streaming || !input.trim() || !ollamaOnline}
            className="btn-primary px-4 flex items-center gap-2 self-end py-2.5">
            {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-gray-600 text-center mt-2">Shift+Enter for new line · Enter to send · Powered by Ollama ({selectedModel})</p>
      </div>
    </div>
  )
}
