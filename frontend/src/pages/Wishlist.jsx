import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()

  function handleAddToCart(product) {
    const size = product.sizes?.[1] || product.sizes?.[0] || 'M'
    const color = product.colors?.[0] || 'Black'
    addToCart(product, size, color, 1)
    toast.success('Added to cart!')
  }

  function handleRemove(productId, name) {
    removeFromWishlist(productId)
    toast(`Removed from wishlist`, { icon: '🗑️' })
  }

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-72 h-72 bg-[#C8F135]/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="border-b border-white/10 pb-8 mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-[#C8F135] mb-2">Saved Items</p>
          <h1 className="text-4xl font-black tracking-tight">MY WISHLIST</h1>
          <p className="text-white/30 text-sm mt-1">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-24 border border-white/10">
            <p className="text-6xl mb-5">🤍</p>
            <p className="font-black text-xl text-white/20 tracking-widest mb-2">YOUR WISHLIST IS EMPTY</p>
            <p className="text-white/30 text-sm mb-8">Save items you love and come back to them anytime</p>
            <Link to="/collections"
              className="inline-block bg-white text-black font-black px-8 py-3 text-xs tracking-widest uppercase hover:bg-[#C8F135] transition-colors">
              EXPLORE COLLECTIONS →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
            <AnimatePresence>
              {wishlist.map(product => {
                const hasDiscount = product.discountPrice && product.discountPrice < product.price
                const discount = hasDiscount ? Math.round((1 - product.discountPrice / product.price) * 100) : 0
                const isOOS = product.status === 'out_of_stock' || product.stock === 0

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="bg-black relative group"
                  >
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemove(product.id, product.name)}
                      className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-black/70 border border-white/10 hover:border-red-400/50 hover:text-red-400 text-white/40 transition-all"
                      title="Remove from wishlist"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
                      </svg>
                    </button>

                    {/* Discount badge */}
                    {hasDiscount && (
                      <div className="absolute top-3 left-3 z-10 bg-[#C8F135] text-black text-xs font-black px-2 py-0.5">
                        -{discount}%
                      </div>
                    )}

                    {/* Image */}
                    <Link to={`/product/${product.id}`}>
                      <div className="relative aspect-square overflow-hidden bg-zinc-900">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400' }}
                        />
                        {isOOS && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white text-xs font-black tracking-widest">SOLD OUT</span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="p-4">
                      <p className="text-xs text-white/30 tracking-widest uppercase mb-1">{product.category}</p>
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-bold text-sm text-white mb-2 hover:text-[#C8F135] transition-colors truncate">{product.name}</h3>
                      </Link>
                      <div className="flex items-center gap-2 mb-4">
                        {hasDiscount ? (
                          <>
                            <span className="font-black text-[#C8F135]">₹{product.discountPrice}</span>
                            <span className="text-white/30 text-xs line-through">₹{product.price}</span>
                          </>
                        ) : (
                          <span className="font-black text-white">₹{product.price}</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={isOOS}
                        className="w-full bg-white text-black text-xs font-black py-2.5 tracking-widest uppercase hover:bg-[#C8F135] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {isOOS ? 'SOLD OUT' : 'ADD TO CART'}
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {wishlist.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Link to="/collections" className="text-xs font-bold tracking-widest uppercase text-white/30 hover:text-[#C8F135] transition-colors">
              ← CONTINUE SHOPPING
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
