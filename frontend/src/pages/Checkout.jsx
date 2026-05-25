import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Checkout() {
  const { cart, totalPrice, clearCart } = useCart()
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  })

  if (!user) { navigate('/login'); return null }
  if (cart.length === 0) { navigate('/cart'); return null }

  const shipping = totalPrice >= 999 ? 0 : 99
  const grandTotal = totalPrice + shipping

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handlePlace(e) {
    e.preventDefault()
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'pincode']
    for (const f of required) {
      if (!form[f].trim()) return toast.error(`${f.charAt(0).toUpperCase() + f.slice(1)} is required`)
    }
    if (form.phone.length < 10) return toast.error('Enter valid phone number')
    setLoading(true)
    try {
      const shippingAddress = `${form.address}, ${form.landmark ? form.landmark + ', ' : ''}${form.city}, ${form.state} - ${form.pincode}`
      const { data } = await axios.post('/api/orders/create',
        { items: cart, total: grandTotal, shippingAddress, phone: form.phone },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      clearCart()
      navigate('/order-success', { state: { order: data } })
    } catch (err) {
      toast.error('Order placement failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full bg-zinc-900 border border-white/10 text-white px-4 py-3 text-sm focus:border-[#C8F135] outline-none transition-colors placeholder-white/20"

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black tracking-tight mb-10">CHECKOUT</h1>

        <form onSubmit={handlePlace} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Shipping Form */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xs font-bold tracking-[0.25em] uppercase text-white/40 mb-4">Shipping Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[['fullName','Full Name'],['email','Email Address'],['phone','Phone Number'],['address','Street Address']].map(([name, label]) => (
                  <div key={name} className={name === 'address' ? 'md:col-span-2' : ''}>
                    <label className="text-xs text-white/40 tracking-widest uppercase block mb-1">{label}</label>
                    <input name={name} value={form[name]} onChange={handleChange} placeholder={label}
                      type={name === 'email' ? 'email' : name === 'phone' ? 'tel' : 'text'}
                      className={inputClass} />
                  </div>
                ))}
                {[['landmark','Landmark (Optional)'],['city','City'],['state','State'],['pincode','PIN Code']].map(([name, label]) => (
                  <div key={name}>
                    <label className="text-xs text-white/40 tracking-widest uppercase block mb-1">{label}</label>
                    <input name={name} value={form[name]} onChange={handleChange} placeholder={label}
                      className={inputClass} />
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-white/10 p-5">
              <h3 className="text-xs font-bold tracking-[0.25em] uppercase text-white/40 mb-3">Payment</h3>
              <div className="flex items-center gap-3 text-sm text-white/70">
                <div className="w-4 h-4 rounded-full bg-[#C8F135]" />
                Cash on Delivery / Pay on Delivery
              </div>
              <p className="text-xs text-white/30 mt-2">Online payment integration coming soon.</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold tracking-[0.25em] uppercase text-white/40 mb-4">Order Summary</h2>
            <div className="border border-white/10 divide-y divide-white/10">
              {cart.map(item => (
                <div key={item.key} className="flex gap-3 p-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover bg-zinc-900"
                    onError={e => e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{item.name}</p>
                    <p className="text-xs text-white/40">{item.size} · {item.color} × {item.quantity}</p>
                    <p className="text-sm font-black text-[#C8F135]">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border border-white/10 p-4 space-y-3 text-sm">
              <div className="flex justify-between text-white/60">
                <span>Subtotal</span><span>₹{totalPrice}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-[#C8F135] font-bold' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              {shipping > 0 && <p className="text-xs text-white/30">Free shipping on orders ≥ ₹999</p>}
              <div className="flex justify-between font-black text-lg border-t border-white/10 pt-3">
                <span>Total</span><span className="text-[#C8F135]">₹{grandTotal}</span>
              </div>
            </div>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              className="w-full bg-white text-black font-black py-4 text-sm tracking-widest uppercase hover:bg-[#C8F135] transition-colors disabled:opacity-50">
              {loading ? 'PLACING ORDER...' : 'PLACE ORDER →'}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  )
}
