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
  tshirt-white.png — white tee, background-removed transparent PNG.
  White × multiply-colour = perfect shirt colour with full texture preserved.
  No normalisation step needed — white is the ideal multiply base.
*/
const SHIRT_BASE = '/tshirt-white.png'

/*
  Print-area calibrated to tshirt-white.png on a 1:1 square canvas.
  Image 943×943 (padded square from 736×943 source) → fills canvas exactly.

  Pixel scan (corner-corrected, shadow-removed PNG):
    Torso (y=50–65 %): L≈30 %  R≈71 %  W≈41 %  Centre≈50.4 %
    Collar bottom ≈ canvas y 15–17 %.

  14 × 16 in print area centred on front torso:
    width  = 30 %   (5 % margin inside each torso edge)
    height = 30 % × (16/14) ≈ 34 %
    left   = 50 % − 15 % = 35 %
    top    = 17 %   (just below collar band)
*/
const PA = { top: '33%', left: '35%', width: '30%', height: '34%' }

/* Qikink-blue palette */
const BLUE      = 'rgba(38, 99, 235, 0.42)'
const BLUE_BDR  = 'rgba(38, 99, 235, 0.80)'
const BLUE_ICON = '#2563eb'

/* Shared mask style — clips the colour overlay to the shirt silhouette */
function maskStyle(src) {
  return {
    maskImage:          `url(${src})`,
    maskSize:           'contain',
    maskPosition:       'center',
    maskRepeat:         'no-repeat',
    WebkitMaskImage:    `url(${src})`,
    WebkitMaskSize:     'contain',
    WebkitMaskPosition: 'center',
    WebkitMaskRepeat:   'no-repeat',
  }
}

const SCALE_MIN = 0.3
const SCALE_MAX = 2.5

export default function DesignYourOwn() {
  const [garmentId,     setGarmentId]     = useState('mens')
  const [selectedColor, setSelectedColor] = useState('#FFFFFF')
  const [selectedSize,  setSelectedSize]  = useState('M')
  const [uploadedImage, setUploadedImage] = useState(null)
  const [designPos,     setDesignPos]     = useState({ x: 0, y: 0 })
  const [designScale,   setDesignScale]   = useState(1)
  const [imgNatural,    setImgNatural]    = useState({ w: 1, h: 1 })
  const [autoPosition,  setAutoPosition]  = useState(true)
  const { addToCart }                     = useCart()
  const fileRef                           = useRef()
  const printAreaRef                      = useRef()
  const dragState                         = useRef(null)

  const garment   = GARMENT_TYPES.find(g => g.id === garmentId)
  const colorName = TSHIRT_COLORS.find(c => c.hex === selectedColor)?.name || ''

  function resetDesignTransform() {
    setDesignPos({ x: 0, y: 0 })
    setDesignScale(1)
  }

  function toggleAutoPosition() {
    setAutoPosition(prev => {
      const next = !prev
      if (next) resetDesignTransform() // re-snap to the optimized fit when turning auto back on
      return next
    })
  }

  function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      setUploadedImage(ev.target.result)
      resetDesignTransform()
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  /* ── Drag to reposition (mouse + touch, unified via Pointer Events) ── */
  function handleDragStart(e) {
    if (autoPosition) return
    e.preventDefault()
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch {}
    dragState.current = { startX: e.clientX, startY: e.clientY, origX: designPos.x, origY: designPos.y }
  }
  function handleDragMove(e) {
    if (!dragState.current) return
    const dx = e.clientX - dragState.current.startX
    const dy = e.clientY - dragState.current.startY
    setDesignPos({ x: dragState.current.origX + dx, y: dragState.current.origY + dy })
  }
  function handleDragEnd(e) {
    dragState.current = null
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch {}
  }

  /* ── Alignment — snaps the design to an edge/centre of the print area ── */
  function alignDesign(edge) {
    const box = printAreaRef.current?.getBoundingClientRect()
    if (!box || !box.width || !box.height) return
    const imgAR = imgNatural.w / imgNatural.h
    const boxAR = box.width / box.height
    const fitW  = imgAR > boxAR ? box.width : box.height * imgAR
    const fitH  = imgAR > boxAR ? box.width / imgAR : box.height
    const effW  = fitW * designScale
    const effH  = fitH * designScale

    setDesignPos(prev => {
      const next = { ...prev }
      if (edge === 'left')   next.x = -(box.width - effW) / 2
      if (edge === 'right')  next.x =  (box.width - effW) / 2
      if (edge === 'center') next.x = 0
      if (edge === 'top')    next.y = -(box.height - effH) / 2
      if (edge === 'bottom') next.y =  (box.height - effH) / 2
      if (edge === 'middle') next.y = 0
      return next
    })
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
        image:       SHIRT_BASE,
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

            {/* ── Canvas — isolated compositing group ── */}
            <div
              className="relative w-full overflow-hidden"
              style={{ aspectRatio: '1 / 1', background: '#B2AFA6' }}
            >
              {/* Layer 1 — normalised grey shirt base */}
              <img
                src={SHIRT_BASE}
                alt="T-shirt"
                draggable={false}
                className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
                onError={e => { e.target.src = '/tshirt-mockup.jpg' }}
              />

              {/* Layer 2 — colour overlay (multiply × grey base = realistic shirt colour)
                  mask-image clips the solid colour div to the exact shirt silhouette
                  so the canvas background (#e8e8e8) is never tinted               */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:    selectedColor,
                  mixBlendMode:  'multiply',
                  transition:    'background 0.25s ease',
                  ...maskStyle(SHIRT_BASE),
                }}
              />

              {/* ── Print area ── */}
              <div
                ref={printAreaRef}
                className="absolute"
                style={{ top: PA.top, left: PA.left, width: PA.width, height: PA.height }}
              >
                {uploadedImage ? (
                  /* ── Design uploaded — drag to move, transform applied on the image itself
                       so this wrapper's box stays stable for alignment measurement ── */
                  <>
                    <img
                      src={uploadedImage}
                      alt="custom design"
                      draggable={false}
                      onLoad={e => setImgNatural({ w: e.target.naturalWidth || 1, h: e.target.naturalHeight || 1 })}
                      onPointerDown={handleDragStart}
                      onPointerMove={handleDragMove}
                      onPointerUp={handleDragEnd}
                      onPointerCancel={handleDragEnd}
                      className={`w-full h-full object-contain select-none ${autoPosition ? 'cursor-default' : 'cursor-move'}`}
                      style={{
                        transform:      `translate(${designPos.x}px, ${designPos.y}px) scale(${designScale})`,
                        transformOrigin: 'center center',
                        touchAction:    'none',
                      }}
                    />
                    {/* print-area guide — stays fixed as a reference while the design moves */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        border:       `1.5px dashed ${BLUE_BDR}`,
                        borderRadius: 3,
                      }}
                    />
                    {autoPosition && (
                      <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-black/60 px-2 py-1 pointer-events-none" style={{ borderRadius: 3 }}>
                        <svg className="w-2.5 h-2.5 text-[#C8F135]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-[8px] font-black tracking-widest uppercase text-[#C8F135]">Auto</span>
                      </div>
                    )}
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

            {/* Adjust Design — resize / reposition / align */}
            {uploadedImage && (
              <div className="border border-white/10 p-6">

                {/* Auto Position — big toggle, on by default */}
                <button
                  onClick={toggleAutoPosition}
                  className="w-full flex items-center justify-between gap-4 mb-5 pb-5 border-b border-white/10 text-left"
                >
                  <div>
                    <p className="text-sm font-black tracking-wide text-white">Auto Position</p>
                    <p className="text-[10px] text-white/30 mt-0.5 leading-relaxed">
                      Fits your design at its original proportions for the best print size &amp; placement — no adjustment needed.
                    </p>
                  </div>
                  <span
                    className="relative flex-shrink-0 w-14 h-8 rounded-full transition-colors duration-300"
                    style={{ background: autoPosition ? '#C8F135' : 'rgba(255,255,255,0.1)' }}
                  >
                    <motion.span
                      className="absolute top-1 left-1 w-6 h-6 rounded-full bg-black"
                      animate={{ x: autoPosition ? 24 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </span>
                </button>

                {autoPosition ? (
                  <p className="text-[10px] text-white/25 leading-relaxed">
                    🔒 Positioning, resizing &amp; alignment are locked while Auto Position is on. Turn it off to adjust manually.
                  </p>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40">Manual Adjust</p>
                      <button
                        onClick={resetDesignTransform}
                        className="text-[10px] font-bold text-white/30 hover:text-[#C8F135] uppercase tracking-widest transition-colors"
                      >
                        ↺ Reset
                      </button>
                    </div>

                    {/* Zoom / resize */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-white/30 uppercase tracking-widest">Size</span>
                        <span className="text-xs font-black text-[#C8F135]">{Math.round(designScale * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setDesignScale(s => Math.max(SCALE_MIN, +(s - 0.1).toFixed(2)))}
                          className="w-8 h-8 flex-shrink-0 flex items-center justify-center border border-white/20 text-white/60 hover:border-[#C8F135] hover:text-[#C8F135] transition-colors"
                        >
                          −
                        </button>
                        <input
                          type="range"
                          min={SCALE_MIN * 100}
                          max={SCALE_MAX * 100}
                          value={Math.round(designScale * 100)}
                          onChange={e => setDesignScale(Number(e.target.value) / 100)}
                          className="flex-1 accent-[#C8F135]"
                        />
                        <button
                          onClick={() => setDesignScale(s => Math.min(SCALE_MAX, +(s + 0.1).toFixed(2)))}
                          className="w-8 h-8 flex-shrink-0 flex items-center justify-center border border-white/20 text-white/60 hover:border-[#C8F135] hover:text-[#C8F135] transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Alignment */}
                    <div>
                      <span className="text-[10px] text-white/30 uppercase tracking-widest block mb-2">Align</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          ['left', 'Left'], ['center', 'Center'], ['right', 'Right'],
                          ['top', 'Top'], ['middle', 'Middle'], ['bottom', 'Bottom'],
                        ].map(([key, label]) => (
                          <button
                            key={key}
                            onClick={() => alignDesign(key)}
                            className="text-[10px] font-bold border border-white/15 py-2 text-white/50 hover:border-[#C8F135] hover:text-[#C8F135] transition-colors uppercase tracking-wider"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="text-[10px] text-white/20 mt-4 leading-relaxed">
                      Drag the design directly on the preview to reposition it.
                    </p>
                  </>
                )}
              </div>
            )}

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
