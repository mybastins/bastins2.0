import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import ProductCard from '../components/ProductCard'
import { useTheme } from '../context/ThemeContext'

const CATEGORIES = ['All', 'Oversized Tees', 'Graphic Tees', 'Vintage', 'Minimal', 'Logo Tees']
const SORTS = ['Default', 'Price: Low to High', 'Price: High to Low', 'Newest']

export default function Collections() {
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('Default')
  const [search, setSearch] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [loading, setLoading] = useState(true)
  const { darkMode } = useTheme()

  useEffect(() => {
    axios.get('/api/products/all')
      .then(r => { setProducts(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = [...products]
    if (category !== 'All') result = result.filter(p => p.category === category)
    if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    if (minPrice) result = result.filter(p => p.price >= Number(minPrice))
    if (maxPrice) result = result.filter(p => p.price <= Number(maxPrice))
    if (sort === 'Price: Low to High') result.sort((a, b) => a.price - b.price)
    else if (sort === 'Price: High to Low') result.sort((a, b) => b.price - a.price)
    else if (sort === 'Newest') result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    setFiltered(result)
  }, [products, category, sort, search, minPrice, maxPrice])

  return (
    <div className={`min-h-screen pt-20 ${darkMode ? 'bg-black text-white' : 'bg-light text-black'}`}>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-5xl font-black mb-2">All <span className="text-primary">Collections</span></h1>
        <p className={`mb-8 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{filtered.length} products found</p>

        {/* Filters */}
        <div className={`rounded-2xl p-4 mb-8 ${darkMode ? 'bg-white/5' : 'bg-white'} flex flex-wrap gap-4 items-center`}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className={`flex-1 min-w-48 px-4 py-2 rounded-xl text-sm ${darkMode ? 'bg-white/10 text-white placeholder-white/40 border border-white/20' : 'bg-gray-50 border border-gray-200'} outline-none focus:border-primary`}
          />
          <div className="flex gap-2 flex-wrap">
            <input value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min ₹" type="number"
              className={`w-20 px-3 py-2 rounded-xl text-sm ${darkMode ? 'bg-white/10 text-white border border-white/20' : 'bg-gray-50 border border-gray-200'} outline-none focus:border-primary`} />
            <input value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max ₹" type="number"
              className={`w-20 px-3 py-2 rounded-xl text-sm ${darkMode ? 'bg-white/10 text-white border border-white/20' : 'bg-gray-50 border border-gray-200'} outline-none focus:border-primary`} />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className={`px-4 py-2 rounded-xl text-sm ${darkMode ? 'bg-white/10 text-white border border-white/20' : 'bg-gray-50 border border-gray-200'} outline-none focus:border-primary`}>
            {SORTS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${category === c ? 'bg-primary text-white' : darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}>
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-primary text-xl">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 opacity-50">No products found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((p, i) => (
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
