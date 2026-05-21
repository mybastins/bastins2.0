import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useTheme } from '../context/ThemeContext'

const STATUSES = ['pending', 'processing', 'shipped', 'delivered']
const STATUS_LABELS = {
  pending: { label: 'Order Placed', icon: '📦', desc: 'Your order has been received' },
  processing: { label: 'Processing', icon: '⚙️', desc: 'We\'re preparing your order' },
  shipped: { label: 'Shipped', icon: '🚚', desc: 'Your order is on the way' },
  delivered: { label: 'Delivered', icon: '✅', desc: 'Order delivered successfully' }
}

export default function OrderTracking() {
  const [searchParams] = useSearchParams()
  const [identifier, setIdentifier] = useState(searchParams.get('id') || '')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { darkMode } = useTheme()

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
      setError('Order not found. Please check your order ID or tracking number.')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  const currentStep = order ? STATUSES.indexOf(order.status) : -1

  return (
    <div className={`min-h-screen pt-20 ${darkMode ? 'bg-black text-white' : 'bg-light text-black'}`}>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-5xl font-black mb-2">Track <span className="text-primary">Order</span></h1>
        <p className={`mb-8 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>Enter your order ID or tracking number</p>

        <form onSubmit={handleTrack} className="flex gap-3 mb-8">
          <input
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            placeholder="Order ID or BASTINS-tracking number"
            className={`flex-1 px-4 py-3 rounded-xl ${darkMode ? 'bg-white/10 border border-white/20 text-white placeholder-white/40' : 'bg-white border border-gray-200'} outline-none focus:border-primary text-sm`}
          />
          <button type="submit" disabled={loading}
            className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/80 transition-colors disabled:opacity-50">
            {loading ? '...' : 'Track'}
          </button>
        </form>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6">{error}</div>}

        {order && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className={`rounded-2xl p-6 mb-6 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-black/10'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="font-black text-xl">Order Details</h2>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>ID: {order.id.substring(0, 8)}...</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'delivered' ? 'bg-green-500/20 text-green-400' : 'bg-primary/20 text-primary'}`}>
                  {order.status.toUpperCase()}
                </span>
              </div>
              <div className={`text-sm space-y-1 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
                <p>Tracking: <span className="font-mono font-bold text-accent">{order.trackingNumber}</span></p>
                <p>Ordered: {new Date(order.createdAt).toLocaleDateString()}</p>
                <p>Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                <p className="font-bold text-primary text-base mt-2">Total: ₹{order.total}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className={`rounded-2xl p-6 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-black/10'}`}>
              <h3 className="font-black text-lg mb-6">Delivery Timeline</h3>
              <div className="space-y-6">
                {STATUSES.map((status, i) => {
                  const done = i <= currentStep
                  const active = i === currentStep
                  const info = STATUS_LABELS[status]
                  return (
                    <div key={status} className="flex gap-4 items-start">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${done ? 'bg-primary' : darkMode ? 'bg-white/10' : 'bg-gray-100'} ${active ? 'ring-2 ring-accent ring-offset-2 ring-offset-transparent' : ''}`}>
                        {info.icon}
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold ${done ? '' : 'opacity-40'}`}>{info.label}</p>
                        <p className={`text-sm ${done ? (darkMode ? 'text-white/60' : 'text-gray-500') : 'opacity-30'}`}>{info.desc}</p>
                      </div>
                      {done && <span className="text-accent text-lg">✓</span>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Items */}
            <div className={`rounded-2xl p-6 mt-6 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-black/10'}`}>
              <h3 className="font-black text-lg mb-4">Items ({order.items?.length})</h3>
              <div className="space-y-3">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.name} × {item.quantity} ({item.size}, {item.color})</span>
                    <span className="font-bold">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
