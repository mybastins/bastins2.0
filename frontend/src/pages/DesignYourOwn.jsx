import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

/* ── Garment catalogue ── */
const GARMENT_TYPES = [
  { id: 'mens',      label: "Men's T-Shirt",    price: 599,  sizes: ['XS','S','M','L','XL'] },
  { id: 'womens',    label: "Women's T-Shirt",  price: 599,  sizes: ['XS','S','M','L','XL'] },
  { id: 'oversized', label: 'Oversized Unisex', price: 699,  sizes: ['S','M','L','XL'] },
  { id: 'hoodie',    label: 'Unisex Hoodie',    price: 999,  sizes: ['XS','S','M','L','XL','XXL'] },
  { id: 'crop',      label: "Women's Crop Top", price: 549,  sizes: ['XS','S','M','L','XL'] },
  { id: 'raglan',    label: 'Raglan T-Shirt',   price: 649,  sizes: ['XS','S','M','L','XL'] },
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
  User's own black crew-neck tee photo (tshirt-mockup.png in /public).
  Background-removed transparent PNG so CSS filter only tints the shirt,
  not the canvas background.  Base image is BLACK → filters shift to other tones.
*/
const SHIRT_IMG = '/tshirt-mockup.png'

/*  CSS filter per garment colour (base = black shirt)  */
const COLOR_FILTERS = {
  '#111111': 'brightness(1)',                                                  // Black  – natural
  '#FFFFFF': 'brightness(2.4) saturate(0) contrast(0.7)',                     // White  – desaturated + bright
  '#C8F135': 'brightness(1.1) sepia(1) saturate(12) hue-rotate(57deg)',       // Lime
  '#C0C0C0': 'brightness(2.0) saturate(0)',                                   // Silver
  '#1a1a2e': 'brightness(0.9) sepia(1) saturate(6) hue-rotate(200deg)',       // Navy
  '#2d2d2d': 'brightness(1.35) saturate(0)',                                  // Charcoal
  '#8B0000': 'brightness(0.95) sepia(1) saturate(7) hue-rotate(325deg)',      // Burgundy
  '#4a4a4a': 'brightness(1.6) saturate(0)',                                   // Slate
}

/*
  Print-area calibrated to tshirt-mockup.png on a 1:1 square canvas.
  Image is 1356 × 1320 px (aspect ≈ 1.027); with object-contain the image
  fills the full canvas width and 97.4 % of the height (1.33 % letterbox).

  Shirt bounding box  (image px): left=36, right=1236 → width=1200 (88.5 % of 1356)
  Shirt centre-X on canvas: (36+1236)/2 / 1356 ≈ 46.9 %

  14 × 16 in print area on a ~19 in chest shirt:
    width  = 14/19 × 88.5 %             ≈ 65 %
    height = 65 % × (16/14)             ≈ 74 %
    left   = 46.9 % − 65 %/2            ≈ 14 %
    top    = 1.33 % + 3.5in/20in × 97 % ≈ 18 %   (print starts ~3.5 in below collar)
*/
const PA = { top: '18%', left: '14%', width: '65%', height: '74%' }

/* Qikink-blue palette */
const BLUE      = 'rgba(38, 99, 235, 0.42)'
const BLUE_BDR  = 'rgba(38, 99, 235, 0.80)'
const BLUE_ICON = '#2563eb'

export default function DesignYourOwn() {
  const [garmentId,     setGarmentId]     = useState('mens')
  const [selectedColor, setSelectedColor] = useState('#111111')
  const [selectedSize,  setSelectedSize]  = useState('M')
  const [uploadedImage, setUploadedImage] = useState(null)
  const { addToCart }                     = useCart()
  const fileRef                           = useRef()

  const garment   = GARMENT_TYPES.find(g => g.id === garmentId)
  const colorName = TSHIRT_COLORS.find(c => c.hex === selectedColor)?.name || ''
  const imgFilter = COLOR_FILTERS[selectedColor] ?? 'brightness(1)'

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
    addToCart(
      {
        id:          `custom-${Date.now()}`,
        name:        `Custom ${garment.label} — ${colorName}`,
        price:       garment.price,
        description: `Custom designed ${garment.label}`,
        image:       SHIRT_IMG,
        category:    'Custom',
      },
      selectedSize,
      selectedColor,
      1,
    )
    toast.success('Custom tee added to cart!')
  }

  return (
    <div className="min-h-screen bg-black text-white pt-16">

      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="border-b border-white/10 pb-8 mb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-[#C8F135] mb-2">Customise</p>
          <h1 className="text-4xl font-black tracking-tight">DESIGN YOUR OWN</h1>
          <p className="text-white/30 text-sm mt-1">Pick a style · choose your colour · upload your art</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* ═══════════════════════════════
              LEFT — mockup canvas
          ═══════════════════════════════ */}
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-3">Preview</p>

            {/* ── Canvas ── */}
            <div
              className="relative w-full overflow-hidden"
              style={{ aspectRatio: '1 / 1', background: '#e8e8e8' }}
            >
              {/* Shirt photo, tinted by CSS filter */}
              <img
                src={SHIRT_IMG}
                alt="T-shirt"
                draggable={false}
                className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
                style={{
                  filter:     imgFilter,
                  transition: 'filter 0.25s ease',
                }}
                onError={e => {
                  e.target.src = '/tshirt-mockup.jpg'  // fallback to original jpg if png fails
                }}
              />

              {/* ── Print area ── */}
              <div
                className="absolute"
                style={{ top: PA.top, left: PA.left, width: PA.width, height: PA.height }}
              >
                {uploadedImage ? (
                  /* ── Design uploaded ── */
                  <>
                    <img
                      src={uploadedImage}
                      alt="custom design"
                      draggable={false}
                      className="w-full h-full object-contain pointer-events-none select-none"
                    />
                    {/* keep dashed reference border */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        border:       `1.5px dashed ${BLUE_BDR}`,
                        borderRadius: 3,
                      }}
                    />
                  </>
                ) : (
                  /* ── Empty — upload prompt ── */
                  <button
                    onClick={() => fileRef.current.click()}
                    className="w-full h-full flex flex-col items-center justify-center gap-2 group"
                    style={{
                      background:   BLUE,
                      border:       `2px dashed ${BLUE_BDR}`,
                      borderRadius: 3,
                    }}
                  >
                    {/* Icon circle */}
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                      style={{ background: BLUE_ICON }}
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <span
                      className="text-[11px] font-bold tracking-widest uppercase"
                      style={{ color: BLUE_ICON }}
                    >
                      Upload Design
                    </span>
                    <span className="text-[10px]" style={{ color: 'rgba(38,99,235,0.6)' }}>
                      14 × 16 in print area
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Below-canvas info + remove */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] text-white/30 tracking-widest uppercase">
                <span
                  className="w-3 h-3 flex-shrink-0"
                  style={{ border: `1.5px dashed ${BLUE_BDR}`, background: BLUE, borderRadius: 2 }}
                />
                14 × 16 in · DTG · Full colour
              </div>
              {uploadedImage && (
                <button
                  onClick={() => setUploadedImage(null)}
                  className="text-[10px] text-red-400/50 hover:text-red-400 transition-colors uppercase tracking-widest font-bold"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* ═══════════════════════════════
              RIGHT — controls
          ═══════════════════════════════ */}
          <div className="space-y-5">

            {/* Upload trigger */}
            <div className="border border-white/10 p-6">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-4">Upload Design</p>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              <button
                onClick={() => fileRef.current.click()}
                className="w-full border border-dashed border-white/20 py-6 text-center hover:border-[#C8F135]/50 transition-colors group"
              >
                <svg className="w-7 h-7 mx-auto mb-2 text-white/20 group-hover:text-[#C8F135] transition-colors" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p className="text-xs font-black tracking-widest uppercase text-white/30 group-hover:text-[#C8F135] transition-colors">
                  {uploadedImage ? 'Replace Design' : 'Click to Upload'}
                </p>
                <p className="text-[10px] text-white/15 mt-1">PNG · JPG · SVG</p>
              </button>
            </div>

            {/* Style */}
            <div className="border border-white/10 p-6">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-3">Select Style</p>
              <div className="relative">
                <select
                  value={garmentId}
                  onChange={e => switchGarment(e.target.value)}
                  className="w-full appearance-none bg-zinc-900 border border-white/10 text-white px-4 py-3 pr-10 text-sm font-bold focus:border-[#C8F135] outline-none cursor-pointer"
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
                <span className="text-2xl font-black text-[#C8F135]">₹{garment.price}</span>
              </div>
              <div className="text-xs text-white/40 space-y-1 mb-6 border-t border-white/10 pt-4 tracking-wider">
                <p>Style:  <span className="text-white/70">{garment.label}</span></p>
                <p>Colour: <span className="text-white/70">{colorName}</span></p>
                <p>Size:   <span className="text-white/70">{selectedSize}</span></p>
                <p>Print:  <span className="text-white/70">14 × 16 in · DTG</span></p>
                <p>Design: <span className="text-white/70">{uploadedImage ? 'Custom artwork ✓' : 'Blank garment'}</span></p>
                <p className="pt-1 text-white/20">Free shipping above ₹999</p>
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
