import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

/* ── Garment catalogue ── */
const GARMENT_TYPES = [
  {
    id: 'mens',
    label: "Men's T-Shirt",
    price: 599,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    // white-on-white studio mockup so the multiply blend tints cleanly
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=700&q=80',
    printTop: '28%',   // where the print area starts (as % of image height)
    printLeft: '22%',  // and horizontally
    printWidth: '56%',
    printHeight: '38%',
  },
  {
    id: 'womens',
    label: "Women's T-Shirt",
    price: 599,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=700&q=80',
    printTop: '26%', printLeft: '24%', printWidth: '52%', printHeight: '34%',
  },
  {
    id: 'oversized',
    label: 'Oversized Unisex',
    price: 699,
    sizes: ['S', 'M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=700&q=80',
    printTop: '26%', printLeft: '22%', printWidth: '56%', printHeight: '36%',
  },
  {
    id: 'hoodie',
    label: 'Unisex Hoodie',
    price: 999,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=700&q=80',
    printTop: '32%', printLeft: '24%', printWidth: '52%', printHeight: '30%',
  },
  {
    id: 'crop',
    label: "Women's Crop Top",
    price: 549,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=700&q=80',
    printTop: '20%', printLeft: '24%', printWidth: '52%', printHeight: '28%',
  },
  {
    id: 'raglan',
    label: 'Raglan T-Shirt',
    price: 649,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1503341338985-95ab0c0c3e21?w=700&q=80',
    printTop: '28%', printLeft: '22%', printWidth: '56%', printHeight: '34%',
  },
]

const TSHIRT_COLORS = [
  { hex: '#000000', name: 'Black' },
  { hex: '#FFFFFF', name: 'White' },
  { hex: '#C8F135', name: 'Lime' },
  { hex: '#C0C0C0', name: 'Silver' },
  { hex: '#1a1a2e', name: 'Navy' },
  { hex: '#2d2d2d', name: 'Charcoal' },
  { hex: '#8B0000', name: 'Burgundy' },
  { hex: '#4a4a4a', name: 'Slate' },
]

/* ── Determine CSS filter / blend settings per color ──
   We show a white-base shirt image and tint it with a multiply overlay.
   For pure black we use brightness(0) directly on the img.
   For white we show no overlay.                              */
function getColorStyle(hex) {
  if (hex === '#000000') return { imgFilter: 'brightness(0.08) contrast(1)', overlay: null }
  if (hex === '#FFFFFF') return { imgFilter: 'brightness(1)', overlay: null }
  return {
    imgFilter: 'brightness(0.92)',
    overlay: { backgroundColor: hex, mixBlendMode: 'multiply', opacity: 0.78 }
  }
}

export default function DesignYourOwn() {
  const [garmentId, setGarmentId]       = useState('mens')
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [selectedSize, setSelectedSize]   = useState('M')
  const [uploadedImage, setUploadedImage] = useState(null)
  const [imagePos, setImagePos]           = useState({ x: 0, y: 0 })
  const [imageSize, setImageSize]         = useState(110)
  const [isDragging, setIsDragging]       = useState(false)
  const [dragStart, setDragStart]         = useState({ x: 0, y: 0 })
  const { addToCart }                     = useCart()
  const fileRef                           = useRef()
  const previewRef                        = useRef()

  const garment    = GARMENT_TYPES.find(g => g.id === garmentId)
  const colorName  = TSHIRT_COLORS.find(c => c.hex === selectedColor)?.name || ''
  const colorStyle = getColorStyle(selectedColor)

  function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      setUploadedImage(ev.target.result)
      // centre the design in the print area when first uploaded
      setImagePos({ x: 0, y: 0 })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function handleMouseDown(e) {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - imagePos.x, y: e.clientY - imagePos.y })
  }
  function handleMouseMove(e) {
    if (!isDragging) return
    setImagePos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }
  function handleMouseUp() { setIsDragging(false) }

  function switchGarment(id) {
    setGarmentId(id)
    const g = GARMENT_TYPES.find(t => t.id === id)
    // reset size if current size not in new garment's sizes
    if (!g.sizes.includes(selectedSize)) setSelectedSize(g.sizes[1] || g.sizes[0])
  }

  function handleAddToCart() {
    const product = {
      id:          `custom-${Date.now()}`,
      name:        `Custom ${garment.label} — ${colorName}`,
      price:       garment.price,
      description: `Custom designed ${garment.label}`,
      image:       garment.image,
      category:    'Custom',
    }
    addToCart(product, selectedSize, selectedColor, 1)
    toast.success('Custom tee added to cart!')
  }

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#C8F135]/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">

        {/* Header */}
        <div className="border-b border-white/10 pb-8 mb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-[#C8F135] mb-2">Customise</p>
          <h1 className="text-4xl font-black tracking-tight">DESIGN YOUR OWN</h1>
          <p className="text-white/30 text-sm mt-1">Choose a style, pick your colour, upload your art</p>
        </div>

        {/* ── Main 2-col layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* ── LEFT: Realistic mockup preview ── */}
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-4">Preview</p>

            <div
              ref={previewRef}
              className="relative w-full aspect-square bg-zinc-100 overflow-hidden select-none cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Realistic shirt photo */}
              <img
                src={garment.image}
                alt={garment.label}
                className="w-full h-full object-cover object-top pointer-events-none"
                style={{ filter: colorStyle.imgFilter, transition: 'filter 0.3s ease' }}
                onError={e => {
                  // fallback to a reliable unsplash white tee
                  e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'
                }}
              />

              {/* Colour multiply overlay */}
              {colorStyle.overlay && (
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-300"
                  style={colorStyle.overlay}
                />
              )}

              {/* Uploaded design — draggable, centred in print area by default */}
              {uploadedImage && (
                <div
                  className="absolute"
                  style={{
                    top:    garment.printTop,
                    left:   garment.printLeft,
                    width:  garment.printWidth,
                    height: garment.printHeight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'visible',
                  }}
                >
                  <img
                    src={uploadedImage}
                    alt="custom design"
                    draggable={false}
                    onMouseDown={handleMouseDown}
                    style={{
                      position:   'relative',
                      left:       imagePos.x,
                      top:        imagePos.y,
                      width:      imageSize,
                      height:     imageSize,
                      cursor:     isDragging ? 'grabbing' : 'grab',
                      userSelect: 'none',
                      border:     '2px dashed rgba(200,241,53,0.55)',
                      objectFit:  'contain',
                    }}
                  />
                </div>
              )}

              {/* Empty-state hint over the print area */}
              {!uploadedImage && (
                <div
                  className="absolute flex items-center justify-center pointer-events-none"
                  style={{
                    top: garment.printTop, left: garment.printLeft,
                    width: garment.printWidth, height: garment.printHeight,
                  }}
                >
                  <div className="border border-dashed border-white/20 w-full h-full flex items-center justify-center">
                    <p className="text-xs text-white/30 tracking-widest uppercase text-center px-2">
                      Your design here
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Design size slider */}
            {uploadedImage && (
              <div className="mt-4 flex items-center gap-4 border border-white/10 px-4 py-3">
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 whitespace-nowrap">Print Size</span>
                <input
                  type="range" min="50" max="280" value={imageSize}
                  onChange={e => setImageSize(Number(e.target.value))}
                  className="flex-1 accent-[#C8F135]"
                />
                <span className="text-xs text-white/40 w-10 text-right">{imageSize}px</span>
              </div>
            )}
          </div>

          {/* ── RIGHT: Controls ── */}
          <div className="space-y-5">

            {/* Upload */}
            <div className="border border-white/10 p-6">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-4">Upload Design</p>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              <button
                onClick={() => fileRef.current.click()}
                className="w-full border border-dashed border-white/20 py-7 text-center hover:border-[#C8F135]/50 transition-colors group"
              >
                <svg className="w-8 h-8 mx-auto mb-2 text-white/20 group-hover:text-[#C8F135] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-xs font-black tracking-widest uppercase text-white/30 group-hover:text-[#C8F135] transition-colors">
                  {uploadedImage ? 'Replace Design' : 'Click to Upload'}
                </p>
                <p className="text-xs text-white/15 mt-1">PNG, JPG, SVG supported</p>
              </button>
              {uploadedImage && (
                <button onClick={() => setUploadedImage(null)}
                  className="w-full text-xs text-red-400/60 hover:text-red-400 transition-colors mt-3 tracking-widest uppercase font-bold">
                  Remove Design
                </button>
              )}
            </div>

            {/* Garment Style */}
            <div className="border border-white/10 p-6">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-3">Select Style</p>
              <div className="relative">
                <select
                  value={garmentId}
                  onChange={e => switchGarment(e.target.value)}
                  className="w-full appearance-none bg-zinc-900 border border-white/10 text-white px-4 py-3 pr-10 text-sm font-bold focus:border-[#C8F135] outline-none transition-colors cursor-pointer"
                >
                  {GARMENT_TYPES.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.label} — ₹{g.price}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-4 h-4 text-[#C8F135]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-white/30 tracking-wider">
                <span>Sizes: {garment.sizes.join(', ')}</span>
                <span className="text-white/10">·</span>
                <span className="text-[#C8F135] font-black">₹{garment.price}</span>
              </div>
            </div>

            {/* Colour picker */}
            <div className="border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40">Garment Colour</p>
                <span className="text-xs font-black" style={{ color: '#C8F135' }}>{colorName}</span>
              </div>
              <div className="flex gap-3 flex-wrap">
                {TSHIRT_COLORS.map(({ hex, name }) => (
                  <button
                    key={hex}
                    onClick={() => setSelectedColor(hex)}
                    title={name}
                    className={`w-10 h-10 transition-all border-2 ${
                      selectedColor === hex ? 'border-[#C8F135] scale-110' : 'border-white/10 hover:border-white/40'
                    }`}
                    style={{ background: hex }}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="border border-white/10 p-6">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-4">Select Size</p>
              <div className="flex gap-2 flex-wrap">
                {garment.sizes.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`min-w-[46px] h-11 px-3 text-xs font-black border transition-all tracking-wider ${
                      selectedSize === s
                        ? 'bg-white text-black border-white'
                        : 'border-white/20 text-white/60 hover:border-white hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary + CTA */}
            <div className="border border-white/10 p-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40">Order Summary</p>
                <span className="text-2xl font-black" style={{ color: '#C8F135' }}>₹{garment.price}</span>
              </div>
              <div className="text-xs text-white/40 space-y-1 mb-6 border-t border-white/10 pt-4 tracking-wider">
                <p>Style: <span className="text-white/70">{garment.label}</span></p>
                <p>Colour: <span className="text-white/70">{colorName}</span></p>
                <p>Size: <span className="text-white/70">{selectedSize}</span></p>
                <p>Design: <span className="text-white/70">{uploadedImage ? 'Custom print added' : 'No design — blank garment'}</span></p>
                <p className="pt-1 text-white/20">Free shipping on orders above ₹999</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                className="w-full bg-white text-black font-black py-4 text-xs tracking-widest uppercase hover:bg-[#C8F135] transition-colors"
              >
                ADD TO CART →
              </motion.button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
