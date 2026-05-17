import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, CheckCircle2, Loader2, MapPin, Phone } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { subscribeToLostFound, createLostItem, markItemFound } from '../services/firebaseService'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonCard } from '../components/ui/Skeleton'
import { Modal } from '../components/ui/Modal'

function ItemCard({ item, uid }) {
  const isOwner = item.reporterId === uid
  return (
    <motion.div whileHover={{ y: -2 }} className="card hover:border-gray-700 transition-all">
      {item.imageUrl && (
        <img src={item.imageUrl} alt={item.itemName} className="w-full h-40 object-cover rounded-lg mb-3 border border-gray-800" />
      )}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className={`badge text-xs ${item.type === 'lost' ? 'bg-red-900/40 text-red-400' : 'bg-emerald-900/40 text-emerald-400'}`}>
              {item.type === 'lost' ? '🔴 Lost' : '🟢 Found'}
            </span>
            {item.status === 'found' && <span className="badge bg-gray-800 text-gray-400 text-xs">Resolved</span>}
          </div>
          <h3 className="font-semibold text-white mt-1">{item.itemName}</h3>
        </div>
      </div>

      {item.description && <p className="text-gray-400 text-sm mt-2">{item.description}</p>}

      <div className="flex flex-col gap-1.5 mt-3 text-xs text-gray-500">
        {item.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {item.location}</span>}
        {item.contact && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {item.contact}</span>}
        <span>Reported by {item.reporterName}</span>
      </div>

      {isOwner && item.status !== 'found' && (
        <button onClick={() => markItemFound(item.id)}
          className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
          <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Found/Resolved
        </button>
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
    const unsub = subscribeToLostFound(data => { setItems(data); setLoading(false) })
    return unsub
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Lost & Found</h1>
          <p className="text-gray-400 text-sm mt-1">Report lost items or help return found items</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Report Item
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search items..." className="input-field pl-10" />
        </div>
        <div className="flex gap-2">
          {['all', 'lost', 'found', 'active'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${filter === f ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} title="Nothing found"
          description="No lost or found items matching your search."
          action={<button onClick={() => setShowModal(true)} className="btn-primary mt-2">Report an Item</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(i => <ItemCard key={i.id} item={i} uid={user?.uid} />)}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Report an Item">
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Type *</label>
            <div className="flex gap-3">
              {['lost', 'found'].map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={`flex-1 py-2.5 rounded-lg border text-sm font-medium capitalize transition-all ${form.type === t ? 'border-indigo-500 bg-indigo-600/20 text-indigo-400' : 'border-gray-700 text-gray-400'}`}>
                  {t === 'lost' ? '🔴' : '🟢'} I {t} something
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Item Name *</label>
            <input value={form.itemName} onChange={e => setForm(f => ({ ...f, itemName: e.target.value }))}
              placeholder="e.g. Blue Backpack, iPhone 13" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2} placeholder="Color, brand, identifying features..." className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Location</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Library, Canteen" className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Contact</label>
              <input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                placeholder="Phone or email" className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Image URL (Optional)</label>
            <input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
              placeholder="https://..." className="input-field" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleCreate} disabled={submitting || !form.itemName}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Report
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
