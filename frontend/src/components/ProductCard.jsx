import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
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

      {/* Size selector (visible on hover) */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        variants={{ hover: { opacity: 1, y: 0 } }}
        className="px-4 pb-2"
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
