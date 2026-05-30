import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

/* ── Garment catalogue ── */
const GARMENT_TYPES = [
  { id: 'mens',      label: "Men's T-Shirt",       price: 599, sizes: ['XS','S','M','L','XL'] },
  { id: 'womens',    label: "Women's T-Shirt",      price: 599, sizes: ['XS','S','M','L','XL'] },
  { id: 'oversized', label: 'Oversized Unisex',     price: 699, sizes: ['S','M','L','XL'] },
  { id: 'hoodie',    label: 'Unisex Hoodie',        price: 999, sizes: ['XS','S','M','L','XL','XXL'] },
  { id: 'crop',      label: "Women's Crop Top",     price: 549, sizes: ['XS','S','M','L','XL'] },
  { id: 'raglan',    label: 'Raglan T-Shirt',       price: 649, sizes: ['XS','S','M','L','XL'] },
]

const TSHIRT_COLORS = [
  { hex: '#111111', name: 'Black' },
  { hex: '#FFFFFF', name: 'White' },
  { hex: '#C8F135', name: 'Lime' },
  { hex: '#C0C0C0', name: 'Silver' },
  { hex: '#1a1a2e', name: 'Navy' },
  { hex: '#2d2d2d', name: 'Charcoal' },
  { hex: '#8B0000', name: 'Burgundy' },
  { hex: '#4a4a4a', name: 'Slate' },
]

/* ─────────────────────────────────────────────────────────────
   SVG T-SHIRT CONSTANTS
   ViewBox:  500 × 580
   Shirt body between seams ≈ 264 px  →  represents ~18 in
   Scale:  264 / 18 ≈ 14.67 px / in

   Print area (14 in × 16 in):
     width  = 14 × 14.67 ≈ 205 px
     height = 16 × 14.67 ≈ 235 px
     centred horizontally: x = (500 - 205) / 2 = 147.5 → 148
     top starts 2.5 in below collar base (y ≈ 82):
       offset = 2.5 × 14.67 ≈ 37 px  →  y = 82 + 37 = 119
───────────────────────────────────────────────────────────── */
const VB_W = 500
const VB_H = 580

// Print area rectangle in SVG coordinate space
const PA = { x: 148, y: 119, w: 205, h: 235 }

// T-shirt flat-lay outline path (clockwise from left collar)
const SHIRT_PATH = `
  M 162 82
  C 196 44 224 24 250 20
  C 276 24 304 44 338 82
  L 458 128
  L 474 212
  C 454 242 420 248 382 250
  L 382 562
  Q 250 576 118 562
  L 118 250
  C 80 248 46 242 26 212
  L 42 128
  Z
`

// Inner collar rib-band path
const COLLAR_PATH = `M 174 80 C 202 52 228 36 250 32 C 272 36 298 52 326 80`

/* ── Inline SVG T-shirt component ── */
function TShirtSVG({ color, hasDesign }) {
  const isLight = ['#FFFFFF', '#C8F135', '#C0C0C0', '#D3D3D3'].includes(color)
  const outline  = isLight ? 'rgba(80,80,80,0.45)'  : 'rgba(255,255,255,0.22)'
  const seamLine = isLight ? 'rgba(0,0,0,0.10)'     : 'rgba(255,255,255,0.07)'
  const collarRib= isLight ? 'rgba(0,0,0,0.12)'     : 'rgba(255,255,255,0.09)'

  const printStroke = 'rgba(200,241,53,0.6)'
  const printFill   = hasDesign ? 'none' : (isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)')
  const labelColor  = isLight ? 'rgba(60,60,60,0.55)' : 'rgba(200,241,53,0.45)'

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shirt-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="3" stdDeviation="10" floodColor="#000000" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* ── Shirt body ── */}
      <path
        d={SHIRT_PATH}
        fill={color}
        stroke={outline}
        strokeWidth="1.5"
        strokeLinejoin="round"
        filter="url(#shirt-shadow)"
      />

      {/* ── Seam lines ── */}
      {/* Shoulder seams */}
      <line x1="162" y1="82"  x2="42"  y2="128" stroke={seamLine} strokeWidth="1" />
      <line x1="338" y1="82"  x2="458" y2="128" stroke={seamLine} strokeWidth="1" />
      {/* Side seams */}
      <line x1="118" y1="252" x2="118" y2="560" stroke={seamLine} strokeWidth="1" />
      <line x1="382" y1="252" x2="382" y2="560" stroke={seamLine} strokeWidth="1" />

      {/* ── Collar rib band ── */}
      <path d={COLLAR_PATH} fill="none" stroke={collarRib} strokeWidth="8"  strokeLinecap="round" />
      <path d={COLLAR_PATH} fill="none" stroke={outline}   strokeWidth="0.8" strokeLinecap="round" />

      {/* ── Print area (14 × 16 in) ── */}
      <rect
        x={PA.x} y={PA.y} width={PA.w} height={PA.h}
        fill={printFill}
        stroke={printStroke}
        strokeWidth="1.5"
        strokeDasharray="7 4"
        rx="2"
      />

      {/* Corner tick marks */}
      {[
        [PA.x,        PA.y,        1, 0,  0, 1],
        [PA.x+PA.w,   PA.y,       -1, 0,  0, 1],
        [PA.x,        PA.y+PA.h,   1, 0,  0,-1],
        [PA.x+PA.w,   PA.y+PA.h,  -1, 0,  0,-1],
      ].map(([cx, cy, dx, , , dy], i) => (
        <g key={i}>
          <line x1={cx} y1={cy} x2={cx + dx*10} y2={cy} stroke={printStroke} strokeWidth="2" />
          <line x1={cx} y1={cy} x2={cx} y2={cy + dy*10} stroke={printStroke} strokeWidth="2" />
        </g>
      ))}

      {/* Label — only when no design uploaded */}
      {!hasDesign && (
        <>
          <text
            x={PA.x + PA.w / 2} y={PA.y + PA.h / 2 - 10}
            textAnchor="middle" fill={labelColor}
            fontSize="14" fontFamily="'Courier New',monospace" fontWeight="700" letterSpacing="1.5"
          >
            14 × 16 in
          </text>
          <text
            x={PA.x + PA.w / 2} y={PA.y + PA.h / 2 + 12}
            textAnchor="middle" fill={labelColor}
            fontSize="9" fontFamily="'Courier New',monospace" letterSpacing="2"
          >
            PRINT AREA
          </text>
          <text
            x={PA.x + PA.w / 2} y={PA.y + PA.h / 2 + 28}
            textAnchor="middle" fill={labelColor}
            fontSize="8" fontFamily="'Courier New',monospace" letterSpacing="1" opacity="0.6"
          >
            upload your design above
          </text>
        </>
      )}
    </svg>
  )
}

/* ── Main page ── */
export default function DesignYourOwn() {
  const [garmentId,      setGarmentId]      = useState('mens')
  const [selectedColor,  setSelectedColor]  = useState('#111111')
  const [selectedSize,   setSelectedSize]   = useState('M')
  const [uploadedImage,  setUploadedImage]  = useState(null)
  const { addToCart }                        = useCart()
  const fileRef                              = useRef()

  const garment   = GARMENT_TYPES.find(g => g.id === garmentId)
  const colorName = TSHIRT_COLORS.find(c => c.hex === selectedColor)?.name || ''

  /* Print area as CSS % of the SVG container — for the <img> overlay */
  const printOverlay = {
    left:   `${(PA.x / VB_W) * 100}%`,
    top:    `${(PA.y / VB_H) * 100}%`,
    width:  `${(PA.w / VB_W) * 100}%`,
    height: `${(PA.h / VB_H) * 100}%`,
  }

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
      image:       'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      category:    'Custom',
    }
    addToCart(product, selectedSize, selectedColor, 1)
    toast.success('Custom tee added to cart!')
  }

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#C8F135]/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">

        {/* Header */}
        <div className="border-b border-white/10 pb-8 mb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-[#C8F135] mb-2">Customise</p>
          <h1 className="text-4xl font-black tracking-tight">DESIGN YOUR OWN</h1>
          <p className="text-white/30 text-sm mt-1">Pick a style, choose your colour, upload your art</p>
        </div>

        {/* ── 2-col layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* LEFT — T-shirt preview */}
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-4">Preview</p>

            {/* Container keeps the SVG aspect ratio; the design overlay is absolute inside */}
            <div
              className="relative w-full bg-zinc-900 border border-white/10"
              style={{ aspectRatio: `${VB_W} / ${VB_H}` }}
            >
              {/* SVG t-shirt */}
              <div className="absolute inset-0">
                <TShirtSVG color={selectedColor} hasDesign={!!uploadedImage} />
              </div>

              {/* Uploaded design — rendered exactly within the print area */}
              {uploadedImage && (
                <div
                  className="absolute pointer-events-none flex items-center justify-center"
                  style={printOverlay}
                >
                  <img
                    src={uploadedImage}
                    alt="custom design"
                    draggable={false}
                    className="w-full h-full object-contain"
                    style={{ userSelect: 'none' }}
                  />
                </div>
              )}
            </div>

            {/* Print spec badge */}
            <div className="mt-3 flex items-center gap-2 text-[10px] tracking-widest text-white/25 uppercase">
              <span className="w-2 h-2 rounded-full bg-[#C8F135]/50 flex-shrink-0" />
              <span>Print area — 14 × 16 in &nbsp;·&nbsp; DTG printing &nbsp;·&nbsp; Full colour</span>
            </div>
          </div>

          {/* RIGHT — Controls */}
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
                <p className="text-[10px] text-white/15 mt-1">PNG, JPG, SVG · shown in 14 × 16 in print area</p>
              </button>
              {uploadedImage && (
                <button onClick={() => setUploadedImage(null)}
                  className="w-full text-xs text-red-400/60 hover:text-red-400 transition-colors mt-3 tracking-widest uppercase font-bold">
                  Remove Design
                </button>
              )}
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
                <p>Style: <span className="text-white/70">{garment.label}</span></p>
                <p>Colour: <span className="text-white/70">{colorName}</span></p>
                <p>Size: <span className="text-white/70">{selectedSize}</span></p>
                <p>Print: <span className="text-white/70">14 × 16 in area</span></p>
                <p>Design: <span className="text-white/70">{uploadedImage ? 'Custom artwork uploaded' : 'No design — blank garment'}</span></p>
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
