import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { useDesignAdjust } from '../../hooks/useDesignAdjust'
import TShirtPreviewCanvas from '../../components/TShirtPreviewCanvas'
import DesignAdjustPanel from '../../components/DesignAdjustPanel'
import { TSHIRT_COLORS, SHIRT_VIEWS, BLUE_BDR, BLUE } from '../../utils/tshirtCanvas'

const RESOLUTIONS = [1000, 1500, 2000, 3000]

function loadImageEl(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export default function MockupGenerator() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selectedColor, setSelectedColor] = useState('#FFFFFF')
  const [view, setView] = useState('front')
  const [resolution, setResolution] = useState(2000)
  const [exporting, setExporting] = useState(false)
  const fileRef   = useRef()
  const canvasRef = useRef()
  const adjust    = useDesignAdjust()
  const { uploadedImage, loadImage, clearImage, designPos, designScale, printAreaRef } = adjust

  const colorName = TSHIRT_COLORS.find(c => c.hex === selectedColor)?.name || ''

  useEffect(() => {
    if (user?.role !== 'admin') navigate('/admin/login')
  }, [user])

  function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => loadImage(ev.target.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function exportMockup() {
    if (!uploadedImage) return toast.error('Upload a design first')
    setExporting(true)
    try {
      const N = resolution
      const canvas = document.createElement('canvas')
      canvas.width = N
      canvas.height = N
      const ctx = canvas.getContext('2d')

      const { src: shirtSrc, pa: PA } = SHIRT_VIEWS[view]
      const shirtImg = await loadImageEl(shirtSrc)
      const shirtAR = shirtImg.naturalWidth / shirtImg.naturalHeight
      const sw = shirtAR > 1 ? N : N * shirtAR
      const sh = shirtAR > 1 ? N / shirtAR : N
      const sx = (N - sw) / 2
      const sy = (N - sh) / 2
      ctx.drawImage(shirtImg, sx, sy, sw, sh)

      // Colour tint — solid fill masked to the shirt silhouette, then multiply-blended on top
      const maskCanvas = document.createElement('canvas')
      maskCanvas.width = N
      maskCanvas.height = N
      const mctx = maskCanvas.getContext('2d')
      mctx.fillStyle = selectedColor
      mctx.fillRect(0, 0, N, N)
      mctx.globalCompositeOperation = 'destination-in'
      mctx.drawImage(shirtImg, sx, sy, sw, sh)

      ctx.globalCompositeOperation = 'multiply'
      ctx.drawImage(maskCanvas, 0, 0)
      ctx.globalCompositeOperation = 'source-over'

      // Design layer, positioned/scaled to match the on-screen preview, clipped to the print area
      const paX = N * (parseFloat(PA.left)   / 100)
      const paY = N * (parseFloat(PA.top)    / 100)
      const paW = N * (parseFloat(PA.width)  / 100)
      const paH = N * (parseFloat(PA.height) / 100)

      const designImg = await loadImageEl(uploadedImage)
      const screenCanvasWidth = canvasRef.current.getBoundingClientRect().width
      const ratio = N / screenCanvasWidth

      const designAR = designImg.naturalWidth / designImg.naturalHeight
      const boxAR = paW / paH
      const fitW = designAR > boxAR ? paW : paH * designAR
      const fitH = designAR > boxAR ? paW / designAR : paH
      const effW = fitW * designScale
      const effH = fitH * designScale
      const centerX = paX + paW / 2 + designPos.x * ratio
      const centerY = paY + paH / 2 + designPos.y * ratio

      ctx.save()
      ctx.beginPath()
      ctx.rect(paX, paY, paW, paH)
      ctx.clip()
      ctx.drawImage(designImg, centerX - effW / 2, centerY - effH / 2, effW, effH)
      ctx.restore()

      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `mockup-${view}-${colorName.toLowerCase() || 'shirt'}-${N}px-${Date.now()}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Mockup exported!')
      }, 'image/png')
    } catch {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  if (user?.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[#C8F135] mb-1">Admin</p>
            <h1 className="text-4xl font-black tracking-tight">MOCKUP GENERATOR</h1>
            <p className="text-white/30 text-sm mt-1">Compose a shirt mockup and export a high-res product image</p>
          </div>
          <button onClick={() => navigate('/admin/products')}
            className="text-xs font-bold tracking-widest border border-white/10 px-4 py-2 text-white/40 hover:text-white transition-colors">
            ← PRODUCTS
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* ═══════════════════════════════
              LEFT — mockup canvas
          ═══════════════════════════════ */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40">Preview</p>
              <div className="flex gap-1 border border-white/10">
                {Object.entries(SHIRT_VIEWS).map(([key, v]) => (
                  <button
                    key={key}
                    onClick={() => setView(key)}
                    className={`px-4 py-1.5 text-[10px] font-black tracking-widest uppercase transition-colors ${
                      view === key ? 'bg-[#C8F135] text-black' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <TShirtPreviewCanvas
              selectedColor={selectedColor}
              adjust={adjust}
              onUploadClick={() => fileRef.current.click()}
              canvasRef={canvasRef}
              shirtSrc={SHIRT_VIEWS[view].src}
              printArea={SHIRT_VIEWS[view].pa}
            />

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] text-white/30 tracking-widest uppercase">
                <span
                  className="w-3 h-3 flex-shrink-0"
                  style={{ border: `1.5px dashed ${BLUE_BDR}`, background: BLUE, borderRadius: 2 }}
                />
                14 × 16 in print area
              </div>
              {uploadedImage && (
                <button
                  onClick={clearImage}
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

            {/* Adjust Design */}
            {uploadedImage && <DesignAdjustPanel adjust={adjust} />}

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

            {/* Export */}
            <div className="border border-white/10 p-6">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-4">Export High-Res Image</p>

              <label className="text-xs text-white/40 tracking-widest uppercase block mb-1.5">Resolution</label>
              <div className="grid grid-cols-4 gap-1.5 mb-5">
                {RESOLUTIONS.map(r => (
                  <button
                    key={r}
                    onClick={() => setResolution(r)}
                    className={`text-xs font-bold py-2 border transition-colors ${
                      resolution === r
                        ? 'bg-white text-black border-white'
                        : 'border-white/20 text-white/50 hover:border-white hover:text-white'
                    }`}
                  >
                    {r}px
                  </button>
                ))}
              </div>

              <button
                onClick={exportMockup}
                disabled={!uploadedImage || exporting}
                className="w-full bg-[#C8F135] text-black font-black py-4 text-xs tracking-widest uppercase hover:bg-white transition-colors disabled:opacity-30"
              >
                {exporting ? 'EXPORTING...' : `↓ DOWNLOAD PNG (${resolution}×${resolution})`}
              </button>
              <p className="text-[10px] text-white/20 mt-3 leading-relaxed">
                Composites the shirt, garment colour, and design into a single flattened PNG for use as a product photo.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
