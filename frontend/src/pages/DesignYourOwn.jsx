import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

/* ── Garment catalogue ── */
const GARMENT_TYPES = [
  { id: 'mens',      label: "Men's T-Shirt",    price: 599, sizes: ['XS','S','M','L','XL'] },
  { id: 'womens',    label: "Women's T-Shirt",  price: 599, sizes: ['XS','S','M','L','XL'] },
  { id: 'oversized', label: 'Oversized Unisex', price: 699, sizes: ['S','M','L','XL'] },
  { id: 'hoodie',    label: 'Unisex Hoodie',    price: 999, sizes: ['XS','S','M','L','XL','XXL'] },
  { id: 'crop',      label: "Women's Crop Top", price: 549, sizes: ['XS','S','M','L','XL'] },
  { id: 'raglan',    label: 'Raglan T-Shirt',   price: 649, sizes: ['XS','S','M','L','XL'] },
]

const TSHIRT_COLORS = [
  { hex: '#111111', name: 'Black'    },
  { hex: '#FFFFFF', name: 'White'    },
  { hex: '#C8F135', name: 'Lime'     },
  { hex: '#C0C0C0', name: 'Silver'   },
  { hex: '#1a1a2e', name: 'Navy'     },
  { hex: '#2d2d2d', name: 'Charcoal' },
  { hex: '#8B0000', name: 'Burgundy' },
  { hex: '#4a4a4a', name: 'Slate'    },
]

/*
  White flat-lay tee — mix-blend-mode:multiply tints it to any color.
  Print area (14 × 16 in) is positioned as % of the preview container.
  Measurements calibrated to this specific image.
*/
const SHIRT_IMG = 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=700&q=85'

// Print area top-left origin + size as % of preview container
const PA = { top: '29%', left: '25%', width: '50%', height: '48%' }

export default function DesignYourOwn() {
  const [garmentId,     setGarmentId]     = useState('mens')
  const [selectedColor, setSelectedColor] = useState('#111111')
  const [selectedSize,  setSelectedSize]  = useState('M')
  const [uploadedImage, setUploadedImage] = useState(null)
  const { addToCart }                     = useCart()
  const fileRef                           = useRef()

  const garment   = GARMENT_TYPES.find(g => g.id === garmentId)
  const colorName = TSHIRT_COLORS.find(c => c.hex === selectedColor)?.name || ''

  /* Multiply-blend overlay turns the white shirt to any color */
  function colorOverlayStyle(hex) {
    if (hex === '#FFFFFF') return null                        // white – no tint needed
    if (hex === '#111111') return { background: '#000', mixBlendMode: 'multiply', opacity: 0.88 }
    return { background: hex, mixBlendMode: 'multiply', opacity: 0.80 }
  }
  const overlay = colorOverlayStyle(selectedColor)

  function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setUploadedImage(ev.target.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function switchGarment(id) {
    setGarmentId(id)
    const g = GARMENT_TYPES.find(t => t.id === id)
    if (!g.sizes.includes(selectedSize)) setSelectedSize(g.sizes[1] || g.sizes[0])
  }

  function handleAddToCart() {
    const product = {
      id:          `custom-${Date.now()}`,
      name:        `Custom ${garment.label} — ${colorName}`,
      price:       garment.price,
      description: `Custom designed ${garment.label}`,
      image:       SHIRT_IMG,
      category:    'Custom',
    }
    addToCart(product, selectedSize, selectedColor, 1)
    toast.success('Custom tee added to cart!')
  }

  return (
    <div className="min-h-screen bg-black text-white pt-16">

      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="border-b border-white/10 pb-8 mb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-[#C8F135] mb-2">Customise</p>
          <h1 className="text-4xl font-black tracking-tight">DESIGN YOUR OWN</h1>
          <p className="text-white/30 text-sm mt-1">Pick a style, choose your colour, upload your art</p>
        </div>

        {/* ── 2-col layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* ═══════════════════════════════════════
              LEFT — T-shirt preview canvas
          ═══════════════════════════════════════ */}
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-3">Preview</p>

            {/*
              Canvas: light-gray background (like qikink),
              portrait aspect ratio matching the shirt photo.
            */}
            <div
              className="relative w-full overflow-hidden"
              style={{ aspectRatio: '4/5', background: '#e8e8e8' }}
            >
              {/* ── White shirt photo ── */}
              <img
                src={SHIRT_IMG}
                alt="T-shirt"
                className="absolute inset-0 w-full h-full object-cover object-top pointer-events-none select-none"
                style={{ mixBlendMode: 'multiply' }}
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600' }}
              />

              {/* ── Colour tint overlay ── */}
              {overlay && (
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-300"
                  style={overlay}
                />
              )}

              {/* ── Print area (14 × 16 in) ── */}
              <div
                className="absolute"
                style={{
                  top:    PA.top,
                  left:   PA.left,
                  width:  PA.width,
                  height: PA.height,
                }}
              >
                {uploadedImage ? (
                  /* ── Design filled state ── */
                  <>
                    <img
                      src={uploadedImage}
                      alt="custom design"
                      draggable={false}
                      className="w-full h-full object-contain pointer-events-none select-none"
                    />
                    {/* thin dashed border stays as reference */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        border: '1.5px dashed rgba(66,133,244,0.55)',
                        borderRadius: 4,
                      }}
                    />
                  </>
                ) : (
                  /* ── Empty / upload prompt state ── */
                  <button
                    onClick={() => fileRef.current.click()}
                    className="w-full h-full flex flex-col items-center justify-center gap-3 transition-all"
                    style={{
                      background:   'rgba(66,133,244,0.16)',
                      border:       '2px dashed rgba(66,133,244,0.65)',
                      borderRadius: 4,
                    }}
                  >
                    {/* Upload icon circle — matches qikink */}
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center shadow-md"
                      style={{ background: 'rgba(66,133,244,0.9)' }}
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2}
                          d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12l-4-4m0 0L8 12m4-4v12" />
                      </svg>
                    </div>
                    <span
                      className="text-[11px] font-bold tracking-wider uppercase"
                      style={{ color: 'rgba(66,133,244,0.85)' }}
                    >
                      Upload Design
                    </span>
                    <span
                      className="text-[10px] tracking-wide"
                      style={{ color: 'rgba(66,133,244,0.55)' }}
                    >
                      14 × 16 in print area
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Below-canvas strip */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] text-white/30 tracking-widest uppercase">
                <span
                  className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ border: '1.5px dashed rgba(66,133,244,0.6)', background: 'rgba(66,133,244,0.1)' }}
                />
                Print area — 14 × 16 in · DTG · Full colour
              </div>
              {uploadedImage && (
                <button
                  onClick={() => setUploadedImage(null)}
                  className="text-[10px] text-red-400/50 hover:text-red-400 transition-colors tracking-widest uppercase font-bold"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════
              RIGHT — Controls
          ═══════════════════════════════════════ */}
          <div className="space-y-5">

            {/* Upload (duplicate trigger for the right panel) */}
            <div className="border border-white/10 p-6">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-4">Upload Design</p>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              <button
                onClick={() => fileRef.current.click()}
                className="w-full border border-dashed border-white/20 py-6 text-center hover:border-[#C8F135]/50 transition-colors group"
              >
                <svg className="w-7 h-7 mx-auto mb-2 text-white/20 group-hover:text-[#C8F135] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12l-4-4m0 0L8 12m4-4v12" />
                </svg>
                <p className="text-xs font-black tracking-widest uppercase text-white/30 group-hover:text-[#C8F135] transition-colors">
                  {uploadedImage ? 'Replace Design' : 'Click to Upload'}
                </p>
                <p className="text-[10px] text-white/15 mt-1">PNG · JPG · SVG · shown in 14 × 16 in area</p>
              </button>
            </div>

            {/* Garment style */}
            <div className="border border-white/10 p-6">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-3">Select Style</p>
              <div className="relative">
                <select
                  value={garmentId}
                  onChange={e => switchGarment(e.target.value)}
                  className="w-full appearance-none bg-zinc-900 border border-white/10 text-white px-4 py-3 pr-10 text-sm font-bold focus:border-[#C8F135] outline-none transition-colors cursor-pointer"
                >
                  {GARMENT_TYPES.map(g => (
                    <option key={g.id} value={g.id}>{g.label} — ₹{g.price}</option>
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

            {/* Colour */}
            <div className="border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40">Garment Colour</p>
                <span className="text-xs font-black text-[#C8F135]">{colorName}</span>
              </div>
              <div className="flex gap-3 flex-wrap">
                {TSHIRT_COLORS.map(({ hex, name }) => (
                  <button
                    key={hex}
                    onClick={() => setSelectedColor(hex)}
                    title={name}
                    className={`w-10 h-10 transition-all border-2 ${
                      selectedColor === hex
                        ? 'border-[#C8F135] scale-110'
                        : 'border-white/10 hover:border-white/40'
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
                <span className="text-2xl font-black text-[#C8F135]">₹{garment.price}</span>
              </div>
              <div className="text-xs text-white/40 space-y-1 mb-6 border-t border-white/10 pt-4 tracking-wider">
                <p>Style:  <span className="text-white/70">{garment.label}</span></p>
                <p>Colour: <span className="text-white/70">{colorName}</span></p>
                <p>Size:   <span className="text-white/70">{selectedSize}</span></p>
                <p>Print:  <span className="text-white/70">14 × 16 in · DTG</span></p>
                <p>Design: <span className="text-white/70">{uploadedImage ? 'Custom artwork uploaded ✓' : 'No design — blank garment'}</span></p>
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
