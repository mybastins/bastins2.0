import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalPrice, totalItems } = useCart()
  const { user, token } = useAuth()
  const { darkMode } = useTheme()
  const navigate = useNavigate()

  async function handleCheckout() {
    if (!user) {
      toast.error('Please login to checkout')
      navigate('/login')
      return
    }
    if (cart.length === 0) {
      toast.error('Your cart is empty')
      return
    }
    try {
      const { data } = await axios.post('/api/orders/create',
        { items: cart, total: totalPrice },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      clearCart()
      toast.success(`Order placed! 🎉 Tracking: ${data.trackingNumber}`)
      navigate(`/track?id=${data.id}`)
    } catch (err) {
      toast.error('Checkout failed. Please try again.')
    }
  }

  return (
    <div className={`min-h-screen pt-20 ${darkMode ? 'bg-black text-white' : 'bg-light text-black'}`}>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-5xl font-black mb-10">Your <span className="text-primary">Cart</span> 🛒</h1>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-xl font-bold mb-4">Your cart is empty</p>
            <button onClick={() => navigate('/collections')} className="bg-primary text-white font-bold px-6 py-3 rounded-full hover:bg-primary/80">
              Shop Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map(item => (
                <motion.div key={item.key} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className={`flex gap-4 p-4 rounded-2xl ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-black/10'}`}>
                  <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl"
                    onError={e => e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100'} />
                  <div className="flex-1">
                    <h3 className="font-bold">{item.name}</h3>
                    <p className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>{item.size} · {item.color}</p>
                    <p className="text-primary font-bold text-lg">₹{item.price}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => updateQuantity(item.key, item.quantity - 1)} className="w-7 h-7 rounded-full bg-primary/20 text-primary font-bold">-</button>
                      <span className="font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.key, item.quantity + 1)} className="w-7 h-7 rounded-full bg-primary/20 text-primary font-bold">+</button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => removeFromCart(item.key)} className="text-red-400 hover:text-red-300">✕</button>
                    <p className="font-bold">₹{item.price * item.quantity}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className={`p-6 rounded-2xl h-fit sticky top-24 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-black/10'}`}>
              <h2 className="text-xl font-black mb-6">Order Summary</h2>
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span>Items ({totalItems})</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-accent font-semibold">FREE</span>
                </div>
                <div className={`border-t pt-3 flex justify-between font-black text-lg ${darkMode ? 'border-white/10' : 'border-gray-100'}`}>
                  <span>Total</span>
                  <span className="text-primary">₹{totalPrice}</span>
                </div>
              </div>
              <button onClick={handleCheckout}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/80 transition-colors">
                Checkout →
              </button>
              <button onClick={clearCart} className="w-full text-red-400 text-sm mt-3 hover:text-red-300">
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
