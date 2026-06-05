import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'

export default function CartSidebar() {
  const { cart, isOpen, setIsOpen, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart()
  const shipping = totalPrice >= 999 ? 0 : 99
  const grandTotal = totalPrice + shipping

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 h-full w-full md:w-96 z-50 flex flex-col bg-black text-white border-l border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div>
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#C8F135] mb-0.5">Your</p>
                <h2 className="text-lg font-black tracking-tight">CART ({totalItems})</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-colors text-sm"
              >
                ✕
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/10">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center px-6">
                  <p className="text-4xl mb-4">🛒</p>
                  <p className="text-sm font-black tracking-widest uppercase text-white/30">Cart is empty</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.key} className="flex gap-3 px-5 py-4">
                    <img
                      src={item.image} alt={item.name}
                      className="w-16 h-16 object-cover bg-zinc-900 flex-shrink-0"
                      onError={e => e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100'}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm truncate">{item.name}</p>
                      <p className="text-[11px] text-white/40 tracking-wider mt-0.5">{item.size} · {item.color}</p>
                      <p className="font-black text-[#C8F135] text-sm mt-1">₹{item.price}</p>
                      {/* Qty controls */}
                      <div className="flex items-center gap-0 mt-2 border border-white/10 w-fit">
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          className="w-7 h-7 text-white hover:bg-white/10 transition-colors text-sm font-black"
                        >−</button>
                        <span className="w-7 text-center text-xs font-bold border-x border-white/10">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          className="w-7 h-7 text-white hover:bg-white/10 transition-colors text-sm font-black"
                        >+</button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between flex-shrink-0">
                      <button
                        onClick={() => removeFromCart(item.key)}
                        className="text-white/25 hover:text-red-400 transition-colors text-xs"
                      >✕</button>
                      <p className="font-black text-sm">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-white/10 p-5 space-y-3">
                {/* Shipping note */}
                {shipping > 0 && (
                  <p className="text-[10px] text-white/30 tracking-wider text-center">
                    Add ₹{999 - totalPrice} more for free shipping
                  </p>
                )}

                {/* Totals */}
                <div className="space-y-1.5 text-xs text-white/50">
                  <div className="flex justify-between">
                    <span>Subtotal</span><span>₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-[#C8F135] font-bold' : ''}>
                      {shipping === 0 ? 'FREE' : `₹${shipping}`}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between font-black text-base border-t border-white/10 pt-3">
                  <span>Total</span>
                  <span className="text-[#C8F135]">₹{grandTotal}</span>
                </div>

                <Link
                  to="/cart"
                  onClick={() => setIsOpen(false)}
                  className="block w-full bg-white text-black text-center font-black py-3.5 text-xs tracking-widest uppercase hover:bg-[#C8F135] transition-colors"
                >
                  VIEW CART & CHECKOUT →
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
