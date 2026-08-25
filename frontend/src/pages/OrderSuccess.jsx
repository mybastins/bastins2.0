import { useEffect, useState } from 'react'
import { useLocation, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useCart } from '../context/CartContext'

export default function OrderSuccess() {
  const { state } = useLocation()
  const [searchParams] = useSearchParams()
  const { clearCart } = useCart()
  const orderId = searchParams.get('orderId')

  const [order, setOrder] = useState(state?.order || null)
  const [loading, setLoading] = useState(!state?.order && !!orderId)

  useEffect(() => {
    if (state?.order || !orderId) return
    axios.get(`/api/orders/track/${orderId}`)
      .then(({ data }) => {
        setOrder(data)
        if (data.paymentStatus === 'paid') clearCart()
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="text-[#C8F135] font-black text-xl tracking-widest">LOADING...</p>
    </div>
  )

  if (order?.paymentMethod === 'payu' && order.paymentStatus === 'failed') return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-500 flex items-center justify-center mx-auto mb-6 text-white text-4xl">✕</div>
        <h1 className="text-3xl font-black tracking-tight mb-2">PAYMENT FAILED</h1>
        <p className="text-white/50 mb-8">Your payment couldn't be completed and you haven't been charged. You can try again or choose a different payment method.</p>
        <Link to="/cart" className="inline-block bg-white text-black font-black py-3 px-8 text-xs tracking-widest uppercase hover:bg-[#C8F135] transition-colors">
          BACK TO CART
        </Link>
      </div>
    </div>
  )

  if (!order) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-xl font-bold mb-4">No order found.</p>
        <Link to="/" className="text-[#C8F135] underline">Go Home</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white pt-16 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 bg-[#C8F135] flex items-center justify-center mx-auto mb-6 text-black text-4xl">
          ✓
        </motion.div>

        <h1 className="text-4xl font-black tracking-tight mb-2">ORDER PLACED!</h1>
        <p className="text-white/50 mb-8">Thank you for shopping with BASTIN'S. We'll get it to you soon.</p>

        <div className="border border-white/10 p-6 text-left space-y-3 mb-8">
          <div className="flex justify-between text-sm">
            <span className="text-white/40 tracking-widest uppercase text-xs">Order ID</span>
            <span className="font-mono font-bold">{order.id.substring(0, 12)}...</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/40 tracking-widest uppercase text-xs">Tracking No.</span>
            <span className="font-mono font-bold text-[#C8F135]">{order.trackingNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/40 tracking-widest uppercase text-xs">Est. Delivery</span>
            <span className="font-bold">{new Date(order.estimatedDelivery).toDateString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/40 tracking-widest uppercase text-xs">Payment</span>
            <span className="font-bold">
              {order.paymentMethod === 'payu' ? 'Paid Online (PayU)' : 'Cash on Delivery'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/40 tracking-widest uppercase text-xs">
              {order.paymentMethod === 'payu' ? 'Total Paid' : 'Total Due'}
            </span>
            <span className="font-black text-[#C8F135]">₹{order.total}</span>
          </div>
          <div className="pt-2 border-t border-white/10">
            <p className="text-xs text-white/40 tracking-widest uppercase mb-1">Shipping To</p>
            <p className="text-sm text-white/70">{order.shippingAddress}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Link to={`/track?id=${order.id}`}
            className="flex-1 border border-white text-white font-black py-3 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-colors">
            TRACK ORDER
          </Link>
          <Link to="/collections"
            className="flex-1 bg-white text-black font-black py-3 text-xs tracking-widest uppercase hover:bg-[#C8F135] transition-colors">
            SHOP MORE
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
