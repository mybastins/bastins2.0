import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
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
  const { isInWishlist, toggleWishlist } = useWishlist()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [qty, setQty] = useState(1)

  // Zoom / lightbox state
  const [zoomOpen, setZoomOpen] = useState(false)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [lastPinchDist, setLastPinchDist] = useState(null)

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (zoomOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [zoomOpen])

  function openZoom() { setZoomOpen(true); setScale(1); setPosition({ x: 0, y: 0 }) }
  function closeZoom() { setZoomOpen(false); setScale(1); setPosition({ x: 0, y: 0 }) }

  function handleWheel(e) {
    const delta = e.deltaY > 0 ? -0.25 : 0.25
    setScale(s => {
      const next = Math.min(Math.max(s + delta, 1), 6)
      if (next <= 1) { setPosition({ x: 0, y: 0 }); return 1 }
      return next
    })
  }

  function handleMouseDown(e) {
    if (scale <= 1) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }
  function handleMouseMove(e) {
    if (!isDragging) return
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }
  function handleMouseUp() { setIsDragging(false) }

  function getPinchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }
  function handleTouchStart(e) {
    if (e.touches.length === 2) {
      setLastPinchDist(getPinchDist(e.touches))
    } else if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true)
      setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y })
    }
  }
  function handleTouchMove(e) {
    if (e.touches.length === 2 && lastPinchDist !== null) {
      const dist = getPinchDist(e.touches)
      const delta = (dist - lastPinchDist) * 0.012
      setScale(s => {
        const next = Math.min(Math.max(s + delta, 1), 6)
        if (next <= 1) { setPosition({ x: 0, y: 0 }); return 1 }
        return next
      })
      setLastPinchDist(dist)
    } else if (e.touches.length === 1 && isDragging) {
      setPosition({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y })
    }
  }
  function handleTouchEnd(e) {
    if (e.touches.length < 2) setLastPinchDist(null)
    if (e.touches.length === 0) setIsDragging(false)
  }

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

  function handleWishlist() {
    const added = toggleWishlist(product)
    toast(added ? 'Saved to wishlist ♥' : 'Removed from wishlist', {
      icon: added ? '🤍' : '💔'
    })
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
            <div
              className="relative aspect-square bg-zinc-900 overflow-hidden cursor-zoom-in group"
              onClick={openZoom}
              title="Click to zoom"
            >
              <img src={product.image} alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
              {/* Zoom hint overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[10px] font-black tracking-[0.3em] uppercase text-white bg-black/60 px-3 py-1.5 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0zm0 0l.01 3" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 8v6M8 11h6" />
                  </svg>
                  Zoom
                </span>
              </div>
            </div>
          </motion.div>

          {/* ── LIGHTBOX MODAL ── */}
          <AnimatePresence>
            {zoomOpen && (
              <motion.div
                key="lightbox"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[200] bg-black/96 flex items-center justify-center"
                onClick={closeZoom}
              >
                {/* Close button */}
                <button
                  onClick={e => { e.stopPropagation(); closeZoom() }}
                  className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white text-lg transition-colors border border-white/10 hover:border-white/30"
                >
                  ✕
                </button>

                {/* Scale badge */}
                {scale > 1 && (
                  <div className="absolute top-4 left-4 z-10 text-[10px] font-black tracking-widest text-white/50 bg-black/60 px-2 py-1 border border-white/10">
                    {Math.round(scale * 100)}%
                  </div>
                )}

                {/* Zoomable image area */}
                <div
                  className="w-full h-full flex items-center justify-center overflow-hidden select-none"
                  onClick={e => e.stopPropagation()}
                  onWheel={handleWheel}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={{ cursor: isDragging ? 'grabbing' : scale > 1 ? 'grab' : 'zoom-in' }}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    draggable={false}
                    style={{
                      maxWidth: '90vw',
                      maxHeight: '90vh',
                      objectFit: 'contain',
                      transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                      transition: isDragging ? 'none' : 'transform 0.15s ease',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      WebkitUserDrag: 'none',
                    }}
                    onError={e => e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'}
                  />
                </div>

                {/* Hint bar */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-[0.25em] uppercase text-white/25">
                  {scale > 1 ? 'Drag to pan · Scroll to zoom' : 'Scroll / Pinch to zoom · Click outside to close'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleWishlist}
                title={isInWishlist(product.id) ? 'Remove from wishlist' : 'Save to wishlist'}
                className={`w-14 border flex items-center justify-center transition-all ${isInWishlist(product.id) ? 'border-[#C8F135] bg-[#C8F135]/10' : 'border-white/20 hover:border-[#C8F135]/50'}`}>
                <svg className="w-5 h-5 transition-colors" fill={isInWishlist(product.id) ? '#C8F135' : 'none'} stroke={isInWishlist(product.id) ? '#C8F135' : 'white'} strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
                </svg>
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
