import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Send, MessageSquare, ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  subscribeToConversations, subscribeToMessages, sendMessage,
  createOrGetConversation, getAllUsers,
} from '../services/firebaseService'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

function formatTime(ts) {
  if (!ts?.toDate) return ''
  const d = ts.toDate()
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function Messages() {
  const { user, profile } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [activePeer, setActivePeer] = useState(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [users, setUsers] = useState([])
  const [userSearch, setUserSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToConversations(user.uid, setConversations)
    return unsub
  }, [user])

  useEffect(() => {
    getAllUsers().then(setUsers)
  }, [])

  useEffect(() => {
    const uid = searchParams.get('userId')
    if (uid) openChat(uid)
  }, [searchParams])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const openChat = async (peerId) => {
    const peer = users.find(u => u.id === peerId)
    setActivePeer(peer || { id: peerId, fullName: 'User' })
    const chatId = await createOrGetConversation(user.uid, peerId)
    setActiveChat(chatId)
  }

  useEffect(() => {
    if (!activeChat) return
    const unsub = subscribeToMessages(activeChat, setMessages)
    return unsub
  }, [activeChat])

  const handleSend = async () => {
    if (!text.trim() || !activeChat) return
    setSending(true)
    const chatRef = doc(db, 'conversations', activeChat)
    await Promise.all([
      sendMessage(activeChat, { text, senderId: user.uid, senderName: profile?.fullName }),
      updateDoc(chatRef, { lastMessage: text, lastMessageAt: serverTimestamp() }),
    ])
    setText('')
    setSending(false)
  }

  const filteredUsers = users.filter(u =>
    u.id !== user?.uid &&
    u.fullName?.toLowerCase().includes(userSearch.toLowerCase())
  )

  return (
    <div className="flex h-[calc(100vh-57px)]">
      <div className={`${activeChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-72 border-r border-gray-800 bg-gray-900`}>
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white">Messages</h2>
            <button onClick={() => setShowSearch(!showSearch)}
              className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </div>
          {showSearch && (
            <div>
              <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                placeholder="Search students..." className="input-field text-xs py-2" />
              {userSearch && (
                <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                  {filteredUsers.slice(0, 8).map(u => (
                    <button key={u.id} onClick={() => { openChat(u.id); setShowSearch(false); setUserSearch('') }}
                      className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800 transition-colors text-left">
                      <div className="w-7 h-7 rounded-full bg-indigo-600/30 flex items-center justify-center text-xs text-indigo-400 font-medium">
                        {u.fullName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm text-gray-200">{u.fullName}</p>
                        <p className="text-xs text-gray-500">{u.branch}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <MessageSquare className="w-8 h-8 text-gray-700 mb-2" />
              <p className="text-gray-500 text-sm">No conversations yet</p>
              <p className="text-gray-600 text-xs mt-1">Search for a student to start chatting</p>
            </div>
          ) : (
            conversations.map(conv => {
              const peerId = conv.participants?.find(p => p !== user?.uid)
              const peer = users.find(u => u.id === peerId)
              return (
                <button key={conv.id} onClick={() => openChat(peerId)}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-gray-800/50 transition-colors text-left border-b border-gray-800/50 ${activeChat === conv.id ? 'bg-gray-800/60' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-indigo-600/30 flex items-center justify-center flex-shrink-0 text-sm font-medium text-indigo-400">
                    {peer?.fullName?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{peer?.fullName || 'Unknown'}</p>
                    <p className="text-xs text-gray-500 truncate">{conv.lastMessage || 'No messages yet'}</p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      <div className={`${!activeChat ? 'hidden md:flex' : 'flex'} flex-col flex-1`}>
        {!activeChat ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <MessageSquare className="w-12 h-12 text-gray-700 mb-3" />
            <h3 className="text-gray-400 font-medium">Select a conversation</h3>
            <p className="text-gray-600 text-sm mt-1">Or search for a student to start messaging</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-gray-900">
              <button onClick={() => { setActiveChat(null); setActivePeer(null) }}
                className="md:hidden p-1.5 rounded-lg hover:bg-gray-800 text-gray-400">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="w-9 h-9 rounded-full bg-indigo-600/30 flex items-center justify-center text-sm font-medium text-indigo-400">
                {activePeer?.fullName?.[0] || '?'}
              </div>
              <div>
                <p className="font-medium text-white text-sm">{activePeer?.fullName}</p>
                <p className="text-xs text-gray-500">{activePeer?.branch}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => {
                const isMe = msg.senderId === user?.uid
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                      isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-gray-800 text-gray-200 rounded-bl-sm'
                    }`}>
                      <p>{msg.text}</p>
                      <p className={`text-xs mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-500'}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-gray-800 p-4 bg-gray-900">
              <div className="flex gap-3">
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  placeholder="Type a message..."
                  className="input-field flex-1"
                />
                <button onClick={handleSend} disabled={sending || !text.trim()}
                  className="btn-primary px-4 flex items-center gap-2">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
