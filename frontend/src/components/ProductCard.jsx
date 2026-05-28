import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[1] || product.sizes?.[0] || 'M')
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || 'Black')
  const hasDiscount = product.discountPrice && product.discountPrice < product.price
  const discount = hasDiscount ? Math.round((1 - product.discountPrice / product.price) * 100) : 0
  const isOOS = product.status === 'out_of_stock' || product.stock === 0

  function handleAddToCart(e) {
    e.preventDefault()
    if (isOOS) return toast.error('Out of stock')
    addToCart(product, selectedSize, selectedColor)
    toast.success('Added to cart!')
  }

  function handleWishlist(e) {
    e.preventDefault()
    const added = toggleWishlist(product)
    toast(added ? 'Added to wishlist ♥' : 'Removed from wishlist', {
      icon: added ? '🤍' : '💔'
    })
  }

  return (
    <motion.div whileHover="hover" className="group bg-black relative overflow-hidden">
      <Link to={`/product/${product.id}`}>
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-zinc-900">
          <motion.img
            src={product.image}
            alt={product.name}
            variants={{ hover: { scale: 1.06 } }}
            transition={{ duration: 0.5 }}
            className="w-full h-full object-cover"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400' }}
          />
          {hasDiscount && (
            <div className="absolute top-3 left-3 bg-[#C8F135] text-black text-xs font-black px-2 py-0.5">
              -{discount}%
            </div>
          )}
          {isOOS && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-xs font-black tracking-widest">SOLD OUT</span>
            </div>
          )}
          {product.stock > 0 && product.stock <= 5 && !isOOS && (
            <div className="absolute top-3 right-3 bg-yellow-500/20 text-yellow-400 text-xs font-bold px-2 py-0.5">
              ONLY {product.stock} LEFT
            </div>
          )}

          {/* Wishlist heart */}
          <motion.button
            onClick={handleWishlist}
            initial={{ opacity: 0 }}
            variants={{ hover: { opacity: 1 } }}
            className="absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center bg-black/70 border border-white/10 hover:border-[#C8F135]/50 transition-all"
            title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg className="w-4 h-4 transition-colors" fill={isInWishlist(product.id) ? '#C8F135' : 'none'} stroke={isInWishlist(product.id) ? '#C8F135' : 'white'} strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
            </svg>
          </motion.button>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-white/30 tracking-widest uppercase mb-1">{product.category}</p>
          <h3 className="font-bold text-sm text-white mb-2 truncate">{product.name}</h3>
          <div className="flex items-center gap-2 mb-3">
            {hasDiscount ? (
              <>
                <span className="font-black text-[#C8F135]">₹{product.discountPrice}</span>
                <span className="text-white/30 text-xs line-through">₹{product.price}</span>
              </>
            ) : (
              <span className="font-black text-white">₹{product.price}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Mobile: always visible */}
      <div className="px-4 pb-4 md:hidden">
        <div className="flex gap-1 mb-2 flex-wrap">
          {product.sizes?.slice(0, 5).map(s => (
            <button key={s} onClick={e => { e.preventDefault(); setSelectedSize(s) }}
              className={`text-xs w-8 h-7 border transition-colors font-bold ${selectedSize === s ? 'bg-white text-black border-white' : 'border-white/20 text-white/50'}`}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={handleAddToCart} disabled={isOOS}
          className="w-full bg-white text-black text-xs font-black py-3 tracking-widest uppercase active:bg-[#C8F135] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          {isOOS ? 'SOLD OUT' : 'ADD TO CART'}
        </button>
      </div>

      {/* Desktop: hover reveal */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        variants={{ hover: { opacity: 1, y: 0 } }}
        className="hidden md:block px-4 pb-2"
      >
        <div className="flex gap-1 mb-2 flex-wrap">
          {product.sizes?.slice(0, 5).map(s => (
            <button key={s} onClick={e => { e.preventDefault(); setSelectedSize(s) }}
              className={`text-xs w-8 h-7 border transition-colors font-bold ${selectedSize === s ? 'bg-white text-black border-white' : 'border-white/20 text-white/50 hover:border-white'}`}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={handleAddToCart} disabled={isOOS}
          className="w-full bg-white text-black text-xs font-black py-2.5 tracking-widest uppercase hover:bg-[#C8F135] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          {isOOS ? 'SOLD OUT' : 'ADD TO CART'}
        </button>
      </motion.div>
    </motion.div>
  )
}
