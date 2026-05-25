import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

const STATUS_BADGE = {
  active: { label: 'In Stock', color: 'text-green-400 bg-green-400/10' },
  out_of_stock: { label: 'Out of Stock', color: 'text-red-400 bg-red-400/10' },
  draft: { label: 'Coming Soon', color: 'text-yellow-400 bg-yellow-400/10' }
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [qty, setQty] = useState(1)

  useEffect(() => {
    axios.get(`/api/products/${id}`)
      .then(r => {
        setProduct(r.data)
        setSelectedSize(r.data.sizes?.[0] || '')
        setSelectedColor(r.data.colors?.[0] || '')
        setLoading(false)
      })
      .catch(() => { setLoading(false); navigate('/collections') })
  }, [id])

  function handleAdd() {
    if (!selectedSize) return toast.error('Please select a size')
    if (!selectedColor) return toast.error('Please select a color')
    if (product.status === 'out_of_stock') return toast.error('Out of stock')
    addToCart(product, selectedSize, selectedColor, qty)
    toast.success('Added to cart!')
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white text-xl">Loading...</div>
  if (!product) return null

  const badge = STATUS_BADGE[product.status] || STATUS_BADGE.active
  const hasDiscount = product.discountPrice && product.discountPrice < product.price
  const discount = hasDiscount ? Math.round((1 - product.discountPrice / product.price) * 100) : 0

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-white/40 tracking-widest uppercase mb-10">
          <button onClick={() => navigate('/collections')} className="hover:text-white transition-colors">Collections</button>
          <span>/</span>
          <span className="text-white/70">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="relative aspect-square bg-zinc-900 overflow-hidden">
              <img src={product.image} alt={product.name}
                className="w-full h-full object-cover"
                onError={e => e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'} />
              {hasDiscount && (
                <div className="absolute top-4 left-4 bg-[#C8F135] text-black text-xs font-black px-3 py-1">
                  -{discount}% OFF
                </div>
              )}
              {product.status === 'out_of_stock' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-black text-2xl tracking-widest">SOLD OUT</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs tracking-[0.25em] uppercase text-white/40">{product.collection}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${badge.color}`}>{badge.label}</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight mb-1">{product.name}</h1>
              <p className="text-xs text-white/30 tracking-widest">SKU: {product.sku}</p>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              {hasDiscount ? (
                <>
                  <span className="text-4xl font-black text-[#C8F135]">₹{product.discountPrice}</span>
                  <span className="text-xl text-white/30 line-through">₹{product.price}</span>
                  <span className="text-sm bg-[#C8F135]/10 text-[#C8F135] font-bold px-2 py-1">{discount}% OFF</span>
                </>
              ) : (
                <span className="text-4xl font-black">₹{product.price}</span>
              )}
            </div>

            <p className="text-white/60 leading-relaxed text-sm border-t border-white/10 pt-6">{product.description}</p>

            {/* Size */}
            {product.sizes?.length > 0 && (
              <div>
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-3">Select Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)}
                      className={`w-14 h-12 text-sm font-bold border transition-all ${selectedSize === s ? 'bg-white text-black border-white' : 'border-white/20 hover:border-white text-white'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color */}
            {product.colors?.length > 0 && (
              <div>
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-3">Color: <span className="text-white">{selectedColor}</span></p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(c => (
                    <button key={c} onClick={() => setSelectedColor(c)}
                      className={`px-4 py-2 text-xs font-bold border transition-all ${selectedColor === c ? 'bg-white text-black border-white' : 'border-white/20 hover:border-white text-white'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-3">Quantity</p>
              <div className="flex items-center border border-white/20 w-fit">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-12 h-12 text-white hover:bg-white/10 transition-colors text-xl">−</button>
                <span className="w-12 h-12 flex items-center justify-center font-bold">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="w-12 h-12 text-white hover:bg-white/10 transition-colors text-xl">+</button>
              </div>
            </div>

            {/* Stock */}
            {product.stock > 0 && product.stock <= 10 && (
              <p className="text-xs text-yellow-400 font-bold tracking-widest">⚠ ONLY {product.stock} LEFT</p>
            )}

            {/* CTA */}
            <div className="flex gap-3 pt-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAdd}
                disabled={product.status === 'out_of_stock'}
                className="flex-1 bg-white text-black font-black py-4 text-sm tracking-widest uppercase hover:bg-[#C8F135] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {product.status === 'out_of_stock' ? 'OUT OF STOCK' : 'ADD TO CART'}
              </motion.button>
            </div>

            {/* Meta */}
            <div className="border-t border-white/10 pt-4 space-y-2 text-xs text-white/30 tracking-wider">
              <p>Category: <span className="text-white/60">{product.category}</span></p>
              <p>Collection: <span className="text-white/60">{product.collection}</span></p>
              <p>Free shipping on orders above ₹999</p>
              <p>Easy 7-day returns</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
