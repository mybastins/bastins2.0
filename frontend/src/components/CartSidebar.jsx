import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'
import { Link } from 'react-router-dom'

export default function CartSidebar() {
  const { cart, isOpen, setIsOpen, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart()
  const { darkMode } = useTheme()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className={`fixed right-0 top-0 h-full w-96 z-50 flex flex-col ${darkMode ? 'bg-zinc-900 text-white' : 'bg-white text-black'} shadow-2xl`}
          >
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-xl font-bold">Cart ({totalItems})</h2>
              <button onClick={() => setIsOpen(false)} className="text-2xl hover:text-primary">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20 opacity-50">
                  <div className="text-5xl mb-3">🛒</div>
                  <p>Your cart is empty</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.key} className={`flex gap-3 p-3 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg"
                      onError={e => e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100'} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{item.name}</p>
                      <p className="text-xs opacity-60">{item.size} · {item.color}</p>
                      <p className="text-primary font-bold">₹{item.price}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button onClick={() => updateQuantity(item.key, item.quantity - 1)} className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold text-sm">-</button>
                        <span className="text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.key, item.quantity + 1)} className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold text-sm">+</button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.key)} className="text-red-400 hover:text-red-300 text-sm">✕</button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className={`p-5 border-t ${darkMode ? 'border-white/10' : 'border-gray-100'}`}>
                <div className="flex justify-between text-lg font-bold mb-4">
                  <span>Total</span>
                  <span className="text-primary">₹{totalPrice}</span>
                </div>
                <Link
                  to="/cart"
                  onClick={() => setIsOpen(false)}
                  className="block w-full bg-primary text-white text-center font-semibold py-3 rounded-xl hover:bg-primary/80 transition-colors"
                >
                  View Cart & Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
