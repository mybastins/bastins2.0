import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'

/* Maps backend statuses to timeline steps */
const STEPS = [
  {
    key: 'new',
    label: 'Order Placed',
    desc: 'Your order has been received',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    key: 'confirmed',
    label: 'Confirmed',
    desc: 'Order confirmed and queued for packing',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'packed',
    label: 'Packed',
    desc: 'Your order is packed and ready',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    key: 'shipped',
    label: 'Shipped',
    desc: 'Your order is on the way',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
  },
  {
    key: 'delivered',
    label: 'Delivered',
    desc: 'Order delivered successfully',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
]

const STATUS_ORDER = ['new', 'confirmed', 'packed', 'shipped', 'delivered']

const STATUS_STYLE = {
  new:       'bg-blue-500/10 text-blue-400 border-blue-500/20',
  confirmed: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  packed:    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  shipped:   'bg-orange-500/10 text-orange-400 border-orange-500/20',
  delivered: 'bg-[#C8F135]/10 text-[#C8F135] border-[#C8F135]/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  refunded:  'bg-white/5 text-white/40 border-white/10',
}

export default function OrderTracking() {
  const [searchParams] = useSearchParams()
  const [identifier, setIdentifier] = useState(searchParams.get('id') || '')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (searchParams.get('id')) handleTrack(null, searchParams.get('id'))
  }, [])

  async function handleTrack(e, id) {
    if (e) e.preventDefault()
    const val = id || identifier
    if (!val.trim()) return
    setLoading(true)
    setError('')
    try {
      const { data } = await axios.get(`/api/orders/track/${val.trim()}`)
      setOrder(data)
    } catch {
      setError('Order not found. Please check your order ID.')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  const currentStep = order ? STATUS_ORDER.indexOf(order.status) : -1
  const isCancelledOrRefunded = order && (order.status === 'cancelled' || order.status === 'refunded')

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#C8F135]/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12 relative z-10">

        {/* Header */}
        <div className="border-b border-white/10 pb-8 mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-[#C8F135] mb-2">Logistics</p>
          <h1 className="text-4xl font-black tracking-tight">TRACK ORDER</h1>
          <p className="text-white/30 text-sm mt-1">Enter your order ID to see live status</p>
        </div>

        {/* Search */}
        <form onSubmit={handleTrack} className="flex gap-3 mb-8">
          <input
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            placeholder="Order ID"
            className="flex-1 bg-zinc-900 border border-white/10 text-white px-4 py-3 text-sm focus:border-[#C8F135] outline-none transition-colors placeholder-white/20"
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="bg-white text-black font-black px-6 py-3 text-xs tracking-widest uppercase hover:bg-[#C8F135] transition-colors disabled:opacity-40"
          >
            {loading ? '...' : 'TRACK'}
          </motion.button>
        </form>

        {/* Error */}
        {error && (
          <div className="border border-red-500/20 bg-red-500/5 text-red-400 px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Order result */}
        {order && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

            {/* Order details card */}
            <div className="border border-white/10 p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <p className="text-xs text-white/30 tracking-widest uppercase mb-1">Order ID</p>
                  <p className="font-mono font-bold">{order.id.substring(0, 16).toUpperCase()}...</p>
                  <p className="text-xs text-white/30 mt-1">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <span className={`text-xs font-black px-3 py-1 border tracking-widest uppercase ${STATUS_STYLE[order.status] || 'bg-white/5 text-white/40 border-white/10'}`}>
                  {order.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border-t border-white/10 pt-4">
                {order.trackingNumber && (
                  <div>
                    <p className="text-white/30 tracking-wider uppercase mb-0.5">Tracking No.</p>
                    <p className="font-mono font-bold text-[#C8F135]">{order.trackingNumber}</p>
                  </div>
                )}
                {order.estimatedDelivery && (
                  <div>
                    <p className="text-white/30 tracking-wider uppercase mb-0.5">Est. Delivery</p>
                    <p className="font-bold">
                      {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-white/30 tracking-wider uppercase mb-0.5">Total</p>
                  <p className="font-black text-base" style={{ color: '#C8F135' }}>₹{order.total}</p>
                </div>
                {order.shippingAddress && (
                  <div>
                    <p className="text-white/30 tracking-wider uppercase mb-0.5">Ship To</p>
                    <p className="text-white/60 truncate">{order.shippingAddress}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            {!isCancelledOrRefunded && (
              <div className="border border-white/10 p-6">
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-6">Delivery Timeline</p>
                <div className="space-y-0">
                  {STEPS.map((step, i) => {
                    const done = i <= currentStep
                    const active = i === currentStep
                    const isLast = i === STEPS.length - 1
                    return (
                      <div key={step.key} className="flex gap-4 items-stretch">
                        {/* Icon + connector line */}
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 flex items-center justify-center border flex-shrink-0 transition-all ${
                            active
                              ? 'border-[#C8F135] text-[#C8F135] bg-[#C8F135]/10'
                              : done
                              ? 'border-white/40 text-white/60 bg-white/5'
                              : 'border-white/10 text-white/20'
                          }`}>
                            {step.icon}
                          </div>
                          {!isLast && (
                            <div className={`w-px flex-1 my-1 ${done ? 'bg-white/20' : 'bg-white/8'}`} style={{ minHeight: 20 }} />
                          )}
                        </div>

                        {/* Label */}
                        <div className={`pb-6 pt-2 flex-1 ${isLast ? 'pb-0' : ''}`}>
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-black tracking-wide ${active ? 'text-[#C8F135]' : done ? 'text-white' : 'text-white/20'}`}>
                              {step.label}
                            </p>
                            {done && !active && (
                              <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <p className={`text-xs mt-0.5 ${active ? 'text-white/50' : done ? 'text-white/30' : 'text-white/15'}`}>
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Cancelled / Refunded banner */}
            {isCancelledOrRefunded && (
              <div className={`border p-5 text-sm ${order.status === 'cancelled' ? 'border-red-500/20 bg-red-500/5 text-red-400' : 'border-white/10 bg-white/5 text-white/40'}`}>
                <p className="font-black tracking-widest uppercase mb-1">{order.status === 'cancelled' ? 'Order Cancelled' : 'Refund Processed'}</p>
                <p className="text-xs opacity-70">
                  {order.status === 'cancelled'
                    ? 'This order was cancelled. Contact support if this was unexpected.'
                    : 'Your refund has been processed and will reflect in 5–7 business days.'}
                </p>
              </div>
            )}

            {/* Items */}
            {order.items?.length > 0 && (
              <div className="border border-white/10 p-6">
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-4">
                  Items ({order.items.length})
                </p>
                <div className="space-y-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover bg-zinc-900"
                          onError={e => e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=50'}
                        />
                        <div>
                          <p className="text-sm font-bold truncate max-w-[180px]">{item.name}</p>
                          <p className="text-xs text-white/30">{item.size} · {item.color} · ×{item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-sm font-black whitespace-nowrap" style={{ color: '#C8F135' }}>
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center pt-2">
              <Link to="/account" className="text-xs font-bold tracking-widest uppercase text-white/30 hover:text-[#C8F135] transition-colors">
                ← Back to My Orders
              </Link>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  )
}
