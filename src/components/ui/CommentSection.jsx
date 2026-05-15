import { useState, useEffect } from 'react'
import { MessageSquare, Send, Loader2 } from 'lucide-react'
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase/config'
import { useAuth } from '../../context/AuthContext'

export function CommentSection({ collectionName, docId }) {
  const { user, profile } = useAuth()
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    const q = query(
      collection(db, `${collectionName}/${docId}/comments`),
      orderBy('createdAt', 'asc')
    )
    const unsub = onSnapshot(q, snap => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [open, collectionName, docId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    await addDoc(collection(db, `${collectionName}/${docId}/comments`), {
      text: text.trim(),
      authorId: user.uid,
      authorName: profile?.fullName || 'Anonymous',
      createdAt: serverTimestamp(),
    })
    setText('')
    setSubmitting(false)
  }

  return (
    <div className="mt-4 pt-3 border-t border-gray-800">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${open ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}
      >
        <MessageSquare className="w-4 h-4" />
        {open ? 'Hide' : 'Discuss'} {comments.length > 0 && !open ? `(${comments.length})` : ''}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {loading ? (
            <p className="text-xs text-gray-500 animate-pulse">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-gray-600 italic">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {comments.map(c => (
                <div key={c.id} className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-400 text-xs font-bold flex-shrink-0 mt-0.5">
                    {c.authorName?.[0]}
                  </div>
                  <div className="bg-gray-800/60 rounded-lg px-3 py-2 flex-1">
                    <span className="text-xs font-medium text-indigo-400">{c.authorName} </span>
                    <span className="text-xs text-gray-300">{c.text}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Write a comment..."
              className="input-field flex-1 text-xs py-2"
            />
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="btn-primary px-3 py-2 flex items-center gap-1 text-xs"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
