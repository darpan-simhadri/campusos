import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, CheckCircle2, Loader2, MapPin, Phone } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { subscribeToLostFound, createLostItem, markItemFound } from '../services/firebaseService'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonCard } from '../components/ui/Skeleton'
import { Modal } from '../components/ui/Modal'
import { spring, staggerContainer, staggerItem } from '../lib/motion'

function ItemCard({ item, uid }) {
  const isOwner = item.reporterId === uid
  const isLost = item.type === 'lost'

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ y: -4, boxShadow: 'var(--shadow-md)' }}
      transition={spring.smooth}
      className="card"
    >
      {item.imageUrl && (
        <img src={item.imageUrl} alt={item.itemName}
          className="w-full h-40 object-cover rounded-xl mb-3"
          style={{ border: '1px solid var(--border)' }}
        />
      )}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="badge text-xs"
              style={{
                background: isLost ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                color: isLost ? '#ef4444' : '#10b981',
                border: isLost ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(16,185,129,0.2)',
              }}
            >
              {isLost ? '🔴 Lost' : '🟢 Found'}
            </span>
            {item.status === 'found' && (
              <span className="badge text-xs" style={{ background: 'var(--bg-secondary)', color: 'var(--text-tertiary)', border: '1px solid var(--border)' }}>
                Resolved
              </span>
            )}
          </div>
          <h3 className="font-semibold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {item.itemName}
          </h3>
        </div>
      </div>

      {item.description && (
        <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.description}</p>
      )}

      <div className="flex flex-col gap-1.5 mt-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
        {item.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {item.location}</span>}
        {item.contact && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {item.contact}</span>}
        <span>Reported by {item.reporterName}</span>
      </div>

      {isOwner && item.status !== 'found' && (
        <motion.button
          onClick={() => markItemFound(item.id)}
          whileHover={{ x: 2 }} transition={spring.snappy}
          className="mt-3 flex items-center gap-1.5 text-xs"
          style={{ color: '#10b981' }}
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Found/Resolved
        </motion.button>
      )}
    </motion.div>
  )
}

export default function LostFound() {
  const { user, profile } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ itemName: '', type: 'lost', description: '', location: '', contact: '', imageUrl: '' })

  useEffect(() => {
    return subscribeToLostFound(data => { setItems(data); setLoading(false) })
  }, [])

  const handleCreate = async () => {
    if (!form.itemName) return
    setSubmitting(true)
    await createLostItem({ ...form, reporterId: user.uid, reporterName: profile?.fullName, status: 'active' })
    setForm({ itemName: '', type: 'lost', description: '', location: '', contact: '', imageUrl: '' })
    setShowModal(false)
    setSubmitting(false)
  }

  const filtered = items.filter(i => {
    if (filter === 'lost' && i.type !== 'lost') return false
    if (filter === 'found' && i.type !== 'found') return false
    if (filter === 'active' && i.status === 'found') return false
    if (search && !i.itemName?.toLowerCase().includes(search.toLowerCase()) &&
      !i.description?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>Lost & Found</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Report lost items or help return found items</p>
        </div>
        <motion.button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
          whileHover={{ y: -1, boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}
          whileTap={{ scale: 0.97 }}
          transition={spring.snappy}
        >
          <Plus className="w-4 h-4" /> Report Item
        </motion.button>
      </motion.div>

      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-placeholder)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search items..." className="input-field pl-10" />
        </div>
        <div className="flex gap-2">
          {['all', 'lost', 'found', 'active'].map(f => {
            const active = filter === f
            return (
              <motion.button
                key={f}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={spring.snappy}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium capitalize"
                style={{
                  background: active ? 'var(--text-primary)' : 'var(--bg-secondary)',
                  color: active ? 'var(--bg-card)' : 'var(--text-secondary)',
                  border: active ? '1px solid var(--text-primary)' : '1px solid var(--border)',
                }}
              >
                {f}
              </motion.button>
            )
          })}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Nothing found"
          description="No lost or found items matching your search."
          action={<button onClick={() => setShowModal(true)} className="btn-primary mt-2">Report an Item</button>}
        />
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filtered.map(i => <ItemCard key={i.id} item={i} uid={user?.uid} />)}
        </motion.div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Report an Item">
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Type *</label>
            <div className="flex gap-3">
              {['lost', 'found'].map(t => (
                <motion.button
                  key={t}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
                  onClick={() => setForm(f => ({ ...f, type: t }))}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium capitalize"
                  style={{
                    background: form.type === t ? 'var(--text-primary)' : 'transparent',
                    color: form.type === t ? 'var(--bg-card)' : 'var(--text-secondary)',
                    border: `1px solid ${form.type === t ? 'var(--text-primary)' : 'var(--border)'}`,
                  }}
                >
                  {t === 'lost' ? '🔴' : '🟢'} I {t} something
                </motion.button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Item Name *</label>
            <input value={form.itemName} onChange={e => setForm(f => ({ ...f, itemName: e.target.value }))}
              placeholder="e.g. Blue Backpack, iPhone 13" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2} placeholder="Color, brand, identifying features..." className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Location</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Library, Canteen" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Contact</label>
              <input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                placeholder="Phone or email" className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Image URL (Optional)</label>
            <input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
              placeholder="https://..." className="input-field" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <motion.button
              onClick={handleCreate}
              disabled={submitting || !form.itemName}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={spring.snappy}
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Report
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
