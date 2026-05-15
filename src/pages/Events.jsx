import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Users, Plus, X, Loader2, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { subscribeToEvents, createEvent, rsvpEvent, unrsvpEvent, seedEvents } from '../services/firebaseService'
import { staggerContainer, staggerItem, spring } from '../lib/motion'

const EVENT_TYPES = [
  { id: 'hackathon',  label: 'Hackathon',  color: '#C8F135', icon: '💻' },
  { id: 'workshop',   label: 'Workshop',   color: '#00D4C8', icon: '🛠️' },
  { id: 'seminar',    label: 'Seminar',    color: '#E040FB', icon: '🎤' },
  { id: 'cultural',   label: 'Cultural',   color: '#FF6B00', icon: '🎭' },
  { id: 'sports',     label: 'Sports',     color: '#4CAF50', icon: '⚽' },
  { id: 'meetup',     label: 'Meetup',     color: '#FFD700', icon: '🤝' },
]

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  const days = Math.ceil(diff / 86400000)
  if (days < 0) return 'Past'
  if (days === 0) return 'Today!'
  if (days === 1) return 'Tomorrow'
  return `In ${days} days`
}

function EventCard({ event, myUid }) {
  const [loading, setLoading] = useState(false)
  const rsvped = event.rsvps?.includes(myUid)
  const type = EVENT_TYPES.find(t => t.id === event.type) || EVENT_TYPES[0]
  const days = daysUntil(event.eventDate)
  const isPast = days === 'Past'

  const handleRSVP = async () => {
    if (!myUid || loading || isPast) return
    setLoading(true)
    if (rsvped) await unrsvpEvent(event.id, myUid)
    else await rsvpEvent(event.id, myUid)
    setLoading(false)
  }

  return (
    <motion.div
      variants={staggerItem}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: `1px solid ${isPast ? 'var(--border)' : 'var(--border)'}`, opacity: isPast ? 0.6 : 1 }}
    >
      {/* Color strip */}
      <div className="h-1.5" style={{ background: type.color }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '1.2rem' }}>{type.icon}</span>
            <span
              className="rounded-full px-2 py-0.5"
              style={{ background: `${type.color}22`, color: type.color, fontSize: '0.6rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}
            >
              {type.label.toUpperCase()}
            </span>
          </div>
          {days && (
            <span
              className="rounded-full px-2 py-0.5 flex-shrink-0"
              style={{
                background: days === 'Today!' ? 'rgba(200,241,53,0.15)' : 'var(--border)',
                color: days === 'Today!' ? '#C8F135' : '#888',
                fontSize: '0.6rem',
                fontWeight: 700,
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {days}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 style={{ color: 'var(--text-primary)', fontFamily: 'Anton, sans-serif', fontSize: '1.1rem', letterSpacing: '0.03em', marginBottom: 6 }}>
          {event.title}
        </h3>
        {event.description && (
          <p style={{ color: '#888', fontSize: '0.78rem', lineHeight: 1.5, marginBottom: 12 }}>
            {event.description}
          </p>
        )}

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#555' }} />
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{formatDate(event.eventDate)}</span>
          </div>
          {event.time && (
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#555' }} />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{event.time}</span>
            </div>
          )}
          {event.venue && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#555' }} />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{event.venue}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#555' }} />
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
              {event.rsvps?.length || 0} going
              {event.maxAttendees ? ` / ${event.maxAttendees} max` : ''}
            </span>
          </div>
        </div>

        {/* RSVP button */}
        {!isPast && (
          <motion.button
            onClick={handleRSVP}
            disabled={loading}
            className="w-full rounded-xl py-2.5 flex items-center justify-center gap-2 font-bold"
            style={{
              background: rsvped ? 'rgba(200,241,53,0.08)' : '#C8F135',
              border: `1px solid ${rsvped ? '#C8F135' : 'transparent'}`,
              color: rsvped ? '#C8F135' : '#000',
              fontFamily: 'Anton, sans-serif',
              fontSize: '0.82rem',
              letterSpacing: '0.04em',
            }}
            whileTap={{ scale: 0.97 }}
            transition={spring.snappy}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {rsvped ? "I'M GOING ✓" : 'RSVP NOW'}
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

function CreateEventModal({ onClose }) {
  const { profile } = useAuth()
  const [form, setForm] = useState({ title: '', description: '', type: 'hackathon', eventDate: '', time: '', venue: '', maxAttendees: '' })
  const [posting, setPosting] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handlePost = async () => {
    if (!form.title || !form.eventDate || posting) return
    setPosting(true)
    await createEvent({
      ...form,
      maxAttendees: form.maxAttendees ? parseInt(form.maxAttendees) : null,
      rsvps: [],
      createdBy: profile?.uid,
      createdByName: profile?.fullName || 'User',
    })
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        exit={{ y: 80 }}
        transition={spring.smooth}
        className="w-full rounded-t-3xl p-5 overflow-y-auto"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', maxWidth: 480, maxHeight: '90vh' }}
      >
        <div className="flex items-center justify-between mb-4">
          <span style={{ fontFamily: 'Anton, sans-serif', color: 'var(--text-primary)', fontSize: '1.1rem', letterSpacing: '0.04em' }}>CREATE EVENT</span>
          <button onClick={onClose} style={{ color: '#666' }}><X className="w-5 h-5" /></button>
        </div>

        {/* Event type */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4">
          {EVENT_TYPES.map(t => (
            <button
              key={t.id}
              onClick={() => setForm(f => ({ ...f, type: t.id }))}
              className="rounded-full px-3 py-1.5 flex-shrink-0 flex items-center gap-1"
              style={{
                background: form.type === t.id ? t.color : '#1C1C1C',
                color: form.type === t.id ? '#000' : '#888',
                border: `1px solid ${form.type === t.id ? t.color : 'var(--border)'}`,
                fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, fontSize: '0.78rem',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {[
            { k: 'title', ph: 'Event Title *', type: 'text' },
            { k: 'eventDate', ph: 'Event Date *', type: 'date' },
            { k: 'time', ph: 'Time (e.g. 10:00 AM)', type: 'text' },
            { k: 'venue', ph: 'Venue / Location', type: 'text' },
            { k: 'maxAttendees', ph: 'Max Attendees (optional)', type: 'number' },
          ].map(f => (
            <input
              key={f.k}
              type={f.type}
              placeholder={f.ph}
              value={form[f.k]}
              onChange={set(f.k)}
              className="w-full rounded-xl px-3 py-2.5 outline-none"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
            />
          ))}
          <textarea
            placeholder="Description (optional)"
            value={form.description}
            onChange={set('description')}
            rows={3}
            className="w-full rounded-xl px-3 py-2.5 resize-none outline-none"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
          />
        </div>

        <motion.button
          onClick={handlePost}
          disabled={!form.title || !form.eventDate || posting}
          className="w-full mt-4 rounded-xl py-3 flex items-center justify-center gap-2 font-bold"
          style={{
            background: form.title && form.eventDate ? '#C8F135' : '#1C1C1C',
            color: form.title && form.eventDate ? '#000' : '#555',
            fontFamily: 'Anton, sans-serif', fontSize: '0.9rem', letterSpacing: '0.04em',
          }}
          whileTap={{ scale: 0.97 }}
          transition={spring.snappy}
        >
          {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {posting ? 'CREATING...' : 'CREATE EVENT'}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

export default function Events() {
  const { user, profile } = useAuth()
  const [events, setEvents]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter]       = useState('upcoming')
  const [seeding, setSeeding]     = useState(false)

  const handleSeedEvents = async () => {
    setSeeding(true)
    await seedEvents()
    setSeeding(false)
  }

  useEffect(() => {
    const unsub = subscribeToEvents(data => {
      setEvents(data)
      setLoading(false)
    })
    return unsub
  }, [])

  const now = Date.now()
  const filtered = events.filter(e => {
    const ts = new Date(e.eventDate).getTime()
    if (filter === 'upcoming') return ts >= now - 86400000
    if (filter === 'past') return ts < now - 86400000
    return true
  })

  return (
    <div style={{ background: 'var(--bg-app)', minHeight: '100%' }}>
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <h1 style={{ fontFamily: 'Anton, sans-serif', fontSize: '1.6rem', color: 'var(--text-primary)', letterSpacing: '0.03em' }}>
          CAMPUS EVENTS
        </h1>
        <motion.button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-full px-4 py-2"
          style={{ background: '#C8F135', color: '#000', fontFamily: 'Anton, sans-serif', fontSize: '0.72rem', letterSpacing: '0.06em' }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={spring.snappy}
        >
          <Plus className="w-3.5 h-3.5" /> CREATE
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-4 mb-4">
        {[{ id: 'upcoming', label: '📅 Upcoming' }, { id: 'past', label: '🕰 Past' }, { id: 'all', label: '📋 All' }].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="rounded-full px-4 py-1.5 font-bold"
            style={{
              background: filter === f.id ? '#C8F135' : '#1C1C1C',
              color: filter === f.id ? '#000' : '#666',
              fontFamily: 'Anton, sans-serif', fontSize: '0.7rem', letterSpacing: '0.04em',
              border: `1px solid ${filter === f.id ? '#C8F135' : 'var(--border)'}`,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="px-4 space-y-3">
          {[1,2,3].map(i => <div key={i} className="rounded-2xl h-48 animate-pulse" style={{ background: 'var(--bg-card)' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-4">
          <p style={{ fontSize: '2rem' }}>📅</p>
          <p style={{ color: '#888', fontFamily: 'Barlow Condensed, sans-serif', fontSize: '0.9rem' }}>
            No events yet. Create the first one!
          </p>
          {events.length === 0 && (
            <motion.button
              onClick={handleSeedEvents}
              disabled={seeding}
              className="px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2"
              style={{ background: '#C8F135', color: '#000', fontFamily: 'Anton, sans-serif', letterSpacing: '0.04em', opacity: seeding ? 0.6 : 1 }}
              whileTap={{ scale: 0.97 }}
              transition={spring.snappy}
            >
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {seeding ? 'SEEDING...' : 'LOAD DEMO EVENTS'}
            </motion.button>
          )}
        </div>
      ) : (
        <motion.div className="px-4 pb-6 space-y-4" variants={staggerContainer} initial="hidden" animate="show">
          {filtered.map(event => (
            <EventCard key={event.id} event={event} myUid={user?.uid} />
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} />}
      </AnimatePresence>
    </div>
  )
}
