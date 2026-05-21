import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'

const TSHIRT_COLORS = ['#000000', '#FFFFFF', '#7C3AED', '#C8F135', '#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF']
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export default function DesignYourOwn() {
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [selectedSize, setSelectedSize] = useState('M')
  const [uploadedImage, setUploadedImage] = useState(null)
  const [imagePos, setImagePos] = useState({ x: 120, y: 100 })
  const [imageSize, setImageSize] = useState({ w: 100, h: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const { addToCart } = useCart()
  const { darkMode } = useTheme()
  const fileRef = useRef()

  function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setUploadedImage(ev.target.result)
    reader.readAsDataURL(file)
  }

  function handleMouseDown(e) {
    setIsDragging(true)
    setDragStart({ x: e.clientX - imagePos.x, y: e.clientY - imagePos.y })
  }

  function handleMouseMove(e) {
    if (!isDragging) return
    setImagePos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }

  function handleMouseUp() { setIsDragging(false) }

  function handleAddToCart() {
    const product = {
      id: `custom-${Date.now()}`,
      name: 'Custom Design Tee',
      price: 599,
      description: 'Your custom designed t-shirt',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      category: 'Custom'
    }
    addToCart(product, selectedSize, selectedColor, 1)
    toast.success('Custom tee added to cart! 🎨')
  }

  const colorName = {
    '#000000': 'Black', '#FFFFFF': 'White', '#7C3AED': 'Purple',
    '#C8F135': 'Lime', '#FF6B6B': 'Coral', '#4ECDC4': 'Teal',
    '#FFE66D': 'Yellow', '#A8E6CF': 'Mint'
  }

  return (
    <div className={`min-h-screen pt-20 ${darkMode ? 'bg-black text-white' : 'bg-light text-black'}`}>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-5xl font-black mb-2">Design <span className="text-primary">Your Own</span> 🎨</h1>
          <p className={`mb-10 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>Upload your art, customize your tee</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Canvas */}
          <div className={`rounded-2xl p-6 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-black/10'}`}>
            <h2 className="font-bold text-lg mb-4">Preview</h2>
            <div
              className="relative w-full aspect-square rounded-xl overflow-hidden cursor-crosshair select-none"
              style={{ background: darkMode ? '#111' : '#f5f5f5' }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* T-shirt SVG */}
              <svg viewBox="0 0 340 380" className="w-full h-full absolute inset-0" fill={selectedColor}>
                <path d="M100,20 L60,60 L20,80 L40,130 L80,110 L80,360 L260,360 L260,110 L300,130 L320,80 L280,60 L240,20 C230,50 200,70 170,70 C140,70 110,50 100,20Z" />
              </svg>

              {/* Uploaded image overlay */}
              {uploadedImage && (
                <img
                  src={uploadedImage}
                  alt="custom"
                  draggable={false}
                  onMouseDown={handleMouseDown}
                  style={{
                    position: 'absolute',
                    left: imagePos.x,
                    top: imagePos.y,
                    width: imageSize.w,
                    height: imageSize.h,
                    cursor: isDragging ? 'grabbing' : 'grab',
                    userSelect: 'none',
                    borderRadius: 4,
                    border: '2px dashed rgba(200,241,53,0.6)'
                  }}
                />
              )}

              {!uploadedImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center opacity-40">
                    <div className="text-3xl mb-2">👆</div>
                    <p className="text-sm">Upload an image to start</p>
                  </div>
                </div>
              )}
            </div>

            {uploadedImage && (
              <div className="mt-4 flex items-center gap-3">
                <label className="text-sm font-medium">Size</label>
                <input type="range" min="50" max="250" value={imageSize.w}
                  onChange={e => setImageSize({ w: Number(e.target.value), h: Number(e.target.value) })}
                  className="flex-1 accent-primary" />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-6">
            <div className={`rounded-2xl p-6 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-black/10'}`}>
              <h3 className="font-bold text-lg mb-4">Upload Design</h3>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              <button onClick={() => fileRef.current.click()}
                className="w-full border-2 border-dashed border-primary/50 rounded-xl py-8 text-center hover:border-primary transition-colors">
                <div className="text-3xl mb-2">📸</div>
                <p className="font-semibold text-primary">Click to Upload Image</p>
                <p className={`text-sm mt-1 ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>PNG, JPG, SVG supported</p>
              </button>
              {uploadedImage && (
                <button onClick={() => setUploadedImage(null)} className="w-full text-red-400 text-sm mt-3 hover:text-red-300">
                  Remove Image
                </button>
              )}
            </div>

            <div className={`rounded-2xl p-6 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-black/10'}`}>
              <h3 className="font-bold text-lg mb-4">T-Shirt Color</h3>
              <div className="flex gap-3 flex-wrap">
                {TSHIRT_COLORS.map(c => (
                  <button key={c} onClick={() => setSelectedColor(c)} title={colorName[c]}
                    style={{ background: c }}
                    className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${selectedColor === c ? 'border-accent scale-110' : 'border-transparent'}`} />
                ))}
              </div>
              <p className={`mt-2 text-sm ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>Selected: {colorName[selectedColor]}</p>
            </div>

            <div className={`rounded-2xl p-6 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-black/10'}`}>
              <h3 className="font-bold text-lg mb-4">Select Size</h3>
              <div className="flex gap-2 flex-wrap">
                {SIZES.map(s => (
                  <button key={s} onClick={() => setSelectedSize(s)}
                    className={`w-12 h-12 rounded-xl font-bold text-sm border-2 transition-all ${selectedSize === s ? 'bg-primary text-white border-primary' : darkMode ? 'border-white/20 hover:border-primary' : 'border-gray-200 hover:border-primary'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className={`rounded-2xl p-6 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-black/10'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Summary</h3>
                <span className="text-2xl font-black text-primary">₹599</span>
              </div>
              <div className={`text-sm space-y-1 mb-4 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
                <p>Color: {colorName[selectedColor]} T-Shirt</p>
                <p>Size: {selectedSize}</p>
                <p>Custom print included</p>
              </div>
              <button onClick={handleAddToCart}
                className="w-full bg-primary text-white font-bold py-4 rounded-xl text-lg hover:bg-primary/80 transition-colors">
                Add to Cart 🛒
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
