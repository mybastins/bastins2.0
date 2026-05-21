import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import ProductCard from '../components/ProductCard'
import { useTheme } from '../context/ThemeContext'

export default function Category() {
  const { name } = useParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { darkMode } = useTheme()

  useEffect(() => {
    setLoading(true)
    axios.get(`/api/products/category/${name}`)
      .then(r => { setProducts(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [name])

  return (
    <div className={`min-h-screen pt-20 ${darkMode ? 'bg-black text-white' : 'bg-light text-black'}`}>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-block bg-accent text-black text-xs font-bold px-3 py-1 rounded-full mb-4">CATEGORY</div>
          <h1 className="text-5xl font-black mb-2">{name}</h1>
          <p className={`mb-10 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{products.length} products</p>
        </motion.div>

        {loading ? (
          <div className="text-center py-20 text-primary text-xl">Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 opacity-50">No products in this category</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
