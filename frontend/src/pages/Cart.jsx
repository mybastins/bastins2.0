import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, totalPrice, totalItems } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const shipping = totalPrice >= 999 ? 0 : 99
  const grandTotal = totalPrice + shipping

  function handleCheckout() {
    if (!user) { toast.error('Please login to checkout'); navigate('/login'); return }
    if (cart.length === 0) { toast.error('Your cart is empty'); return }
    navigate('/checkout')
  }

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <p className="text-xs tracking-[0.3em] uppercase text-[#C8F135] mb-2">Your</p>
        <h1 className="text-5xl font-black tracking-tight mb-10">CART</h1>

        {cart.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🛒</p>
            <p className="text-xl font-black mb-6 text-white/40">YOUR CART IS EMPTY</p>
            <button onClick={() => navigate('/collections')} className="bg-white text-black font-black px-8 py-3 text-xs tracking-widest uppercase hover:bg-[#C8F135] transition-colors">
              SHOP NOW →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Items */}
            <div className="lg:col-span-2 divide-y divide-white/10 border-t border-white/10">
              {cart.map(item => (
                <motion.div key={item.key} layout className="flex gap-4 py-5">
                  <img src={item.image} alt={item.name} className="w-24 h-24 object-cover bg-zinc-900"
                    onError={e => e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100'} />
                  <div className="flex-1">
                    <p className="font-black text-sm">{item.name}</p>
                    <p className="text-xs text-white/40 mt-0.5">{item.size} · {item.color}</p>
                    <p className="font-black text-[#C8F135] mt-1">₹{item.price}</p>
                    <div className="flex items-center mt-2 border border-white/10 w-fit">
                      <button onClick={() => updateQuantity(item.key, item.quantity - 1)} className="w-8 h-8 text-white hover:bg-white/10 transition-colors font-black">−</button>
                      <span className="w-8 text-center text-sm font-bold border-x border-white/10">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.key, item.quantity + 1)} className="w-8 h-8 text-white hover:bg-white/10 transition-colors font-black">+</button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => removeFromCart(item.key)} className="text-white/30 hover:text-red-400 transition-colors text-sm">✕</button>
                    <p className="font-black">₹{item.price * item.quantity}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Summary */}
            <div className="border border-white/10 p-6 h-fit">
              <h2 className="text-xs font-bold tracking-[0.25em] uppercase text-white/40 mb-5">Order Summary</h2>
              <div className="space-y-3 text-sm border-b border-white/10 pb-4 mb-4">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal ({totalItems} items)</span><span>₹{totalPrice}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-[#C8F135] font-bold' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                {shipping > 0 && <p className="text-xs text-white/30">Add ₹{999 - totalPrice} more for free shipping</p>}
              </div>
              <div className="flex justify-between font-black text-lg mb-5">
                <span>Total</span><span className="text-[#C8F135]">₹{grandTotal}</span>
              </div>
              <button onClick={handleCheckout} className="w-full bg-white text-black font-black py-4 text-xs tracking-widest uppercase hover:bg-[#C8F135] transition-colors mb-3">
                CHECKOUT →
              </button>
              <button onClick={clearCart} className="w-full text-white/30 text-xs hover:text-red-400 transition-colors tracking-widest uppercase py-2">
                CLEAR CART
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
