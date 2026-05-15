import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info, CheckCircle2, ShoppingCart, X, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { STORE_CATALOG, purchaseStoreItem } from '../services/firebaseService'
import { staggerContainer, staggerItem, spring } from '../lib/motion'

export default function Store() {
  const { user, profile, updateProfile } = useAuth()
  const pies = profile?.pies ?? 0
  const owned = profile?.storeItems || []

  const [buying, setBuying]     = useState(null)
  const [toast, setToast]       = useState(null)

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 2800)
  }

  const handleBuy = async (item) => {
    if (!user || buying) return
    setBuying(item.id)
    try {
      const result = await purchaseStoreItem(user.uid, item.id)
      if (result.success) {
        updateProfile({
          pies: Math.max(0, (profile?.pies || 0) - item.price),
          storeItems: [...owned, item.id],
        })
        showToast(`${item.icon} ${item.name} purchased!`, true)
      } else {
        showToast(result.reason, false)
      }
    } finally {
      setBuying(null)
    }
  }

  const ownedCount = (id) => owned.filter(i => i === id).length

  return (
    <div style={{ background: '#000000', minHeight: '100%' }}>
      {/* Header */}
      <div className="px-4 pt-5 pb-4" style={{ borderBottom: '1px solid #1C1C1C' }}>
        <span style={{ color: '#C8F135', fontFamily: 'Anton, sans-serif', fontSize: '0.72rem', letterSpacing: '0.12em' }}>
          PIES BALANCE
        </span>
        <div className="flex items-end gap-2 mt-1">
          <span style={{ fontFamily: 'Anton, sans-serif', fontSize: '2.8rem', color: '#fff', lineHeight: 1 }}>{pies}</span>
          <span style={{ color: '#C8F135', fontSize: '1.4rem', marginBottom: 4 }}>π</span>
        </div>
        <p style={{ color: '#555', fontSize: '0.72rem', marginTop: 2 }}>
          Earn Pies by completing daily quests
        </p>
      </div>

      {/* Items */}
      <motion.div
        className="px-4 mt-4 space-y-3 pb-6"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {STORE_CATALOG.map(item => {
          const count = ownedCount(item.id)
          const maxed = count >= item.maxOwn
          const canAfford = pies >= item.price

          return (
            <motion.div
              key={item.id}
              variants={staggerItem}
              className="rounded-2xl p-5"
              style={{ background: '#1C1C1C', border: `1px solid ${maxed ? '#C8F135' : '#2a2a2a'}` }}
            >
              {/* Item header */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
                  style={{ background: '#2a2a2a' }}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span style={{ color: '#fff', fontFamily: 'Anton, sans-serif', fontSize: '1rem', letterSpacing: '0.04em' }}>
                      {item.name}
                    </span>
                    {count > 0 && (
                      <span
                        className="rounded-full px-2 py-0.5"
                        style={{ background: 'rgba(200,241,53,0.1)', color: '#C8F135', fontSize: '0.6rem', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}
                      >
                        {count}/{item.maxOwn} OWNED
                      </span>
                    )}
                  </div>
                  <p style={{ color: '#666', fontSize: '0.78rem', marginTop: 4, lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              </div>

              {/* Buy button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span style={{ color: '#C8F135', fontSize: '1rem', fontFamily: 'Anton, sans-serif' }}>π</span>
                  <span style={{ color: '#fff', fontFamily: 'Anton, sans-serif', fontSize: '1.2rem' }}>{item.price}</span>
                </div>

                {maxed ? (
                  <div className="flex items-center gap-1.5 rounded-full px-4 py-2" style={{ background: 'rgba(200,241,53,0.08)', border: '1px solid #C8F135' }}>
                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#C8F135' }} />
                    <span style={{ color: '#C8F135', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'Anton, sans-serif', letterSpacing: '0.04em' }}>
                      MAXED
                    </span>
                  </div>
                ) : (
                  <motion.button
                    onClick={() => handleBuy(item)}
                    disabled={!canAfford || !!buying}
                    className="flex items-center gap-2 rounded-full px-4 py-2"
                    style={{
                      background: canAfford ? '#C8F135' : '#2a2a2a',
                      color: canAfford ? '#000' : '#555',
                      fontFamily: 'Anton, sans-serif',
                      fontSize: '0.78rem',
                      letterSpacing: '0.06em',
                      opacity: buying && buying !== item.id ? 0.6 : 1,
                    }}
                    whileTap={canAfford ? { scale: 0.95 } : {}}
                    transition={spring.snappy}
                  >
                    {buying === item.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ShoppingCart className="w-3.5 h-3.5" />
                    )}
                    {canAfford ? 'BUY NOW' : 'NOT ENOUGH π'}
                  </motion.button>
                )}
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* How to earn pies */}
      <div className="mx-4 mb-6 rounded-2xl p-4" style={{ background: '#0d1a0d', border: '1px solid #1a4a1a' }}>
        <p style={{ color: '#C8F135', fontFamily: 'Anton, sans-serif', fontSize: '0.85rem', letterSpacing: '0.04em', marginBottom: 8 }}>
          HOW TO EARN π PIES
        </p>
        {[
          { icon: '✅', text: 'Complete daily quests (+2–10π each)' },
          { icon: '🔥', text: 'Maintain your daily streak' },
          { icon: '🏆', text: 'Win arena duels and challenges' },
          { icon: '🤝', text: 'Help peers on SOS Board' },
        ].map((tip, i) => (
          <div key={i} className="flex items-start gap-2 mb-2">
            <span style={{ fontSize: '0.85rem' }}>{tip.icon}</span>
            <span style={{ color: '#888', fontSize: '0.75rem', lineHeight: 1.5 }}>{tip.text}</span>
          </div>
        ))}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={spring.snappy}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 rounded-full px-5 py-3 flex items-center gap-2"
            style={{
              background: toast.ok ? '#C8F135' : '#EF4444',
              color: toast.ok ? '#000' : '#fff',
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 700,
              fontSize: '0.85rem',
              zIndex: 60,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
