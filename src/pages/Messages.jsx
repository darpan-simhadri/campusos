import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, MessageSquare, ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  subscribeToConversations, subscribeToMessages, sendMessage,
  createOrGetConversation, getAllUsers,
} from '../services/firebaseService'
import { autoCompleteQuest } from '../lib/autoQuest'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

// ─── Dummy contacts (shown when no Firebase users are found) ─────────────────
const DUMMY_CONTACTS = [
  { id: 'd1', fullName: 'Arjun M',   spec: 'AIML',       xp: 920,  online: true  },
  { id: 'd2', fullName: 'Priya K',   spec: 'Gen AI',     xp: 780,  online: true  },
  { id: 'd3', fullName: 'Karthik R', spec: 'CSE',        xp: 1100, online: false },
  { id: 'd4', fullName: 'Neha S',    spec: 'AIDA',       xp: 650,  online: true  },
  { id: 'd5', fullName: 'Vijay P',   spec: 'Agentic AI', xp: 560,  online: false },
  { id: 'd6', fullName: 'Divya L',   spec: 'AIDS',       xp: 870,  online: true  },
  { id: 'd7', fullName: 'Rahul T',   spec: 'Quantum',    xp: 430,  online: false },
  { id: 'd8', fullName: 'Ananya B',  spec: 'AIML',       xp: 990,  online: true  },
]

const DUMMY_MESSAGES = {
  d1: [
    { id: 'm1', senderId: 'd1', senderName: 'Arjun M', text: 'Hey! Did you check the new Prompt Wars challenge?', createdAt: { toDate: () => new Date(Date.now() - 3600000) } },
    { id: 'm2', senderId: 'me', senderName: 'You', text: 'Yeah! My prompt crushed it 😄', createdAt: { toDate: () => new Date(Date.now() - 3500000) } },
    { id: 'm3', senderId: 'd1', senderName: 'Arjun M', text: 'Want to team up for the Build Race later?', createdAt: { toDate: () => new Date(Date.now() - 3400000) } },
  ],
  d2: [
    { id: 'm4', senderId: 'd2', senderName: 'Priya K', text: 'Can you explain the LoRA paper? I decoded it but not sure I got it right', createdAt: { toDate: () => new Date(Date.now() - 7200000) } },
  ],
  d4: [
    { id: 'm5', senderId: 'd4', senderName: 'Neha S', text: 'Hey are you joining the Neural Nomads squad?', createdAt: { toDate: () => new Date(Date.now() - 10800000) } },
    { id: 'm6', senderId: 'me', senderName: 'You', text: 'I am! Who else is in?', createdAt: { toDate: () => new Date(Date.now() - 10700000) } },
  ],
}

const SPEC_COLORS = {
  'CSE': '#00D4C8', 'AIML': '#C8F135', 'Agentic AI': '#E040FB',
  'Gen AI': '#FF6B00', 'AIDA': '#4CAF50', 'AIDS': '#FF4444', 'Quantum': '#8B5CF6',
}

function formatTime(ts) {
  if (!ts?.toDate) return ''
  return ts.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function Avatar({ name, spec, size = 36 }) {
  const color = SPEC_COLORS[spec] || '#888'
  return (
    <div className="rounded-full flex items-center justify-center flex-shrink-0 font-bold"
      style={{ width: size, height: size, background: `${color}25`, border: `1.5px solid ${color}50`, color, fontSize: size * 0.38 }}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  )
}

export default function Messages() {
  const { user, profile, updateProfile } = useAuth()
  const [searchParams]  = useSearchParams()
  const [realUsers, setRealUsers]         = useState([])
  const [conversations, setConversations] = useState([])
  const [messages, setMessages]           = useState([])
  const [activeContact, setActiveContact] = useState(null) // { id, fullName, spec, isDummy }
  const [activeChat, setActiveChat]       = useState(null) // firestore chat id or dummy key
  const [isDummyChat, setIsDummyChat]     = useState(false)
  const [text, setText]   = useState('')
  const [sending, setSending] = useState(false)
  const [localMessages, setLocalMessages] = useState([]) // for dummy contacts
  const bottomRef = useRef(null)

  useEffect(() => { getAllUsers().then(setRealUsers) }, [])

  useEffect(() => {
    if (!user) return
    return subscribeToConversations(user.uid, setConversations)
  }, [user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, localMessages])

  useEffect(() => {
    const uid = searchParams.get('userId')
    if (uid) openContact(uid)
  }, [searchParams, realUsers])

  // Merge real users + dummy contacts (show dummy when real list is short)
  const allContacts = (() => {
    if (realUsers.length >= 4) return realUsers.map(u => ({ ...u, isDummy: false }))
    const realIds = new Set(realUsers.map(u => u.id))
    return [
      ...realUsers.map(u => ({ ...u, isDummy: false })),
      ...DUMMY_CONTACTS.filter(d => !realIds.has(d.id)).map(d => ({ ...d, isDummy: true })),
    ]
  })()

  async function openContact(contactId) {
    const dummy = DUMMY_CONTACTS.find(d => d.id === contactId)
    const real  = realUsers.find(u => u.id === contactId)

    if (dummy && !real) {
      setActiveContact({ ...dummy, isDummy: true })
      setIsDummyChat(true)
      setActiveChat(contactId)
      setLocalMessages(DUMMY_MESSAGES[contactId] || [])
      setMessages([])
    } else if (real || (!dummy && !real)) {
      const peer = real || { id: contactId, fullName: 'User', isDummy: false }
      setActiveContact({ ...peer, isDummy: false })
      setIsDummyChat(false)
      const chatId = await createOrGetConversation(user.uid, contactId)
      setActiveChat(chatId)
    }
  }

  useEffect(() => {
    if (!activeChat || isDummyChat) return
    return subscribeToMessages(activeChat, setMessages)
  }, [activeChat, isDummyChat])

  const handleSend = async () => {
    if (!text.trim() || sending) return
    const msg = text.trim()
    setText('')

    if (isDummyChat) {
      setLocalMessages(prev => [...prev, {
        id:         `local_${Date.now()}`,
        senderId:   'me',
        senderName: profile?.fullName || profile?.name || 'You',
        text:       msg,
        createdAt:  { toDate: () => new Date() },
      }])
      // Simulate reply after 1.5s
      setTimeout(() => {
        const replies = [
          "That's interesting! Tell me more 🤔",
          "Sure, let's sync up later!",
          "Yeah I saw that too — wild right?",
          "Haha true 😂",
          "Sounds good, I'll check it out",
          "Did you finish the Trend Decode quest?",
        ]
        setLocalMessages(prev => [...prev, {
          id:         `auto_${Date.now()}`,
          senderId:   activeContact?.id,
          senderName: activeContact?.fullName,
          text:       replies[Math.floor(Math.random() * replies.length)],
          createdAt:  { toDate: () => new Date() },
        }])
      }, 1500)
      return
    }

    setSending(true)
    try {
      const chatRef = doc(db, 'conversations', activeChat)
      await Promise.all([
        sendMessage(activeChat, { text: msg, senderId: user.uid, senderName: profile?.fullName }),
        updateDoc(chatRef, { lastMessage: msg, lastMessageAt: serverTimestamp() }),
      ])
      autoCompleteQuest(user.uid, 'message', updateProfile)
    } finally {
      setSending(false)
    }
  }

  const displayMessages = isDummyChat ? localMessages : messages

  return (
    <div className="flex h-full" style={{ minHeight: 0, background: '#000' }}>

      {/* ── Contacts sidebar ─────────────────────────────────── */}
      <div className={`${activeContact ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-72 flex-shrink-0`}
        style={{ borderRight: '1px solid #1C1C1C', height: '100%', minHeight: 0 }}>

        <div className="px-4 pt-5 pb-3 border-b border-neutral-900">
          <h2 className="font-bold text-base text-white" style={{ fontFamily: 'Anton, sans-serif', letterSpacing: 1 }}>MESSAGES</h2>
          <p className="text-xs text-neutral-600 mt-0.5">Tap any name to chat</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Active conversations at top */}
          {conversations.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-xs font-bold text-neutral-600"
                style={{ fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 1 }}>RECENT</p>
              {conversations.map(conv => {
                const peerId = conv.participants?.find(p => p !== user?.uid)
                const peer   = realUsers.find(u => u.id === peerId)
                return (
                  <button key={conv.id}
                    onClick={() => openContact(peerId)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-900 transition-colors"
                    style={{ borderBottom: '1px solid #1C1C1C' }}>
                    <Avatar name={peer?.fullName || '?'} spec={peer?.spec} size={36} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{peer?.fullName || 'Unknown'}</p>
                      <p className="text-xs text-neutral-600 truncate">{conv.lastMessage || 'No messages yet'}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* All contacts */}
          <p className="px-4 pt-3 pb-1 text-xs font-bold text-neutral-600"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: 1 }}>ALL STUDENTS</p>
          {allContacts.filter(c => c.id !== user?.uid).map(contact => (
            <button key={contact.id}
              onClick={() => openContact(contact.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-900 transition-colors"
              style={{
                borderBottom: '1px solid #1a1a1a',
                background: activeContact?.id === contact.id ? '#1C1C1C' : 'transparent',
              }}>
              <div className="relative">
                <Avatar name={contact.fullName} spec={contact.spec} size={36} />
                {contact.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-black"
                    style={{ background: '#4CAF50' }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{contact.fullName}</p>
                <p className="text-xs truncate" style={{ color: SPEC_COLORS[contact.spec] || '#888' }}>{contact.spec}</p>
              </div>
              <span className="text-xs font-mono text-neutral-700">{contact.xp} XP</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Chat area ─────────────────────────────────────────── */}
      <div className={`${!activeContact ? 'hidden md:flex' : 'flex'} flex-col flex-1 min-w-0`} style={{ background: '#000' }}>
        {!activeContact ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <MessageSquare size={48} className="mb-4" style={{ color: '#2a2a2a' }} />
            <p className="font-semibold text-white text-sm">Select a student to chat</p>
            <p className="text-xs text-neutral-600 mt-1">Pick from the contacts list on the left</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0 border-b border-neutral-900">
              <button onClick={() => { setActiveContact(null); setActiveChat(null) }}
                className="md:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white">
                <ArrowLeft size={18} />
              </button>
              <Avatar name={activeContact.fullName} spec={activeContact.spec} size={36} />
              <div>
                <p className="font-bold text-sm text-white">{activeContact.fullName}</p>
                <p className="text-xs" style={{ color: SPEC_COLORS[activeContact.spec] || '#888' }}>
                  {activeContact.spec}
                  {activeContact.isDummy && <span className="text-neutral-700 ml-2">· demo account</span>}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {displayMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center flex-1 text-center">
                  <p className="text-neutral-600 text-sm">No messages yet</p>
                  <p className="text-neutral-700 text-xs mt-1">Say hi to {activeContact.fullName}!</p>
                </div>
              )}
              {displayMessages.map(msg => {
                const isMe = msg.senderId === user?.uid || msg.senderId === 'me'
                return (
                  <motion.div key={msg.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-xs px-4 py-2.5 text-sm"
                      style={{
                        background:   isMe ? '#C8F135' : '#1C1C1C',
                        color:        isMe ? '#000'    : '#fff',
                        borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        border:       isMe ? 'none' : '1px solid #2a2a2a',
                      }}>
                      <p className="leading-relaxed">{msg.text}</p>
                      <p className="mt-0.5 text-xs" style={{ opacity: 0.5 }}>{formatTime(msg.createdAt)}</p>
                    </div>
                  </motion.div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 flex-shrink-0 border-t border-neutral-900">
              <div className="flex gap-2">
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder={`Message ${activeContact.fullName}...`}
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  style={{ background: '#1C1C1C', border: '1px solid #333' }}
                />
                <button onClick={handleSend}
                  disabled={sending || !text.trim()}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: text.trim() ? '#C8F135' : '#1C1C1C' }}>
                  {sending
                    ? <Loader2 size={16} className="animate-spin text-black" />
                    : <Send size={16} style={{ color: text.trim() ? '#000' : '#444' }} />
                  }
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
