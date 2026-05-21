import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { darkMode } = useTheme()
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[2] || product.sizes?.[0] || 'M')
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || 'Black')

  function handleAddToCart() {
    addToCart(product, selectedSize, selectedColor)
    toast.success(`${product.name} added to cart!`)
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-black/10'} shadow-lg`}
    >
      <div className="relative overflow-hidden aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400' }}
        />
        <div className="absolute top-3 left-3 bg-accent text-black text-xs font-bold px-2 py-1 rounded-full">
          {product.category}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-base mb-1 truncate">{product.name}</h3>
        <p className={`text-sm mb-3 line-clamp-2 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>{product.description}</p>
        <div className="text-xl font-black text-primary mb-3">₹{product.price}</div>

        {product.sizes?.length > 0 && (
          <div className="mb-2">
            <p className={`text-xs mb-1 ${darkMode ? 'text-white/50' : 'text-gray-400'}`}>Size</p>
            <div className="flex flex-wrap gap-1">
              {product.sizes.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${
                    selectedSize === s
                      ? 'bg-primary text-white border-primary'
                      : darkMode ? 'border-white/20 hover:border-primary' : 'border-gray-200 hover:border-primary'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.colors?.length > 0 && (
          <div className="mb-3">
            <p className={`text-xs mb-1 ${darkMode ? 'text-white/50' : 'text-gray-400'}`}>Color: {selectedColor}</p>
            <div className="flex gap-1">
              {product.colors.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  title={c}
                  className={`text-xs px-2 py-1 rounded border transition-colors ${
                    selectedColor === c
                      ? 'bg-primary text-white border-primary'
                      : darkMode ? 'border-white/20 hover:border-primary' : 'border-gray-200 hover:border-primary'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleAddToCart}
          className="w-full bg-primary text-white font-semibold py-2 rounded-xl hover:bg-primary/80 transition-colors text-sm"
        >
          Add to Cart
        </button>
      </div>
    </motion.div>
  )
}
