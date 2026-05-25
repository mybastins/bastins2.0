import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import ProductCard from '../components/ProductCard'

const SORTS = ['Default', 'Price: Low to High', 'Price: High to Low', 'Newest']
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export default function Collections() {
  const [products, setProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [categories, setCategories] = useState([])
  const [collections, setCollections] = useState([])
  const [category, setCategory] = useState('All')
  const [collection, setCollection] = useState('All')
  const [sort, setSort] = useState('Default')
  const [search, setSearch] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [selectedSizes, setSelectedSizes] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get('/api/products/all'),
      axios.get('/api/collections')
    ]).then(([p, c]) => {
      setProducts(p.data)
      setCategories(['All', ...c.data.categories])
      setCollections(['All', ...c.data.collections])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    let r = [...products]
    if (category !== 'All') r = r.filter(p => p.category === category)
    if (collection !== 'All') r = r.filter(p => p.collection === collection)
    if (search) r = r.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    if (minPrice) r = r.filter(p => (p.discountPrice || p.price) >= Number(minPrice))
    if (maxPrice) r = r.filter(p => (p.discountPrice || p.price) <= Number(maxPrice))
    if (selectedSizes.length) r = r.filter(p => selectedSizes.some(s => p.sizes?.includes(s)))
    if (selectedColors.length) r = r.filter(p => selectedColors.some(c => p.colors?.includes(c)))
    if (sort === 'Price: Low to High') r.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price))
    else if (sort === 'Price: High to Low') r.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price))
    else if (sort === 'Newest') r.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    setFiltered(r)
  }, [products, category, collection, sort, search, minPrice, maxPrice, selectedSizes, selectedColors])

  const allColors = [...new Set(products.flatMap(p => p.colors || []))]
  const toggleSize = s => setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  const toggleColor = c => setSelectedColors(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-white/30 mb-1">Browse</p>
            <h1 className="text-5xl font-black tracking-tight">ALL PRODUCTS</h1>
            <p className="text-white/30 text-sm mt-1">{filtered.length} products</p>
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="text-xs font-bold tracking-widest uppercase border border-white/20 px-4 py-2 hover:border-[#C8F135] transition-colors">
            {showFilters ? 'HIDE' : 'FILTERS'}
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 mb-6 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-4 py-2 text-xs font-bold tracking-widest uppercase transition-colors ${category === c ? 'bg-white text-black' : 'bg-zinc-900 border border-white/10 text-white/50 hover:text-white'}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="border border-white/10 p-6 mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-white/30 mb-3">Search</p>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
                className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2 text-sm focus:border-[#C8F135] outline-none" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-white/30 mb-3">Price Range</p>
              <div className="flex gap-2">
                <input value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min ₹" type="number"
                  className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2 text-sm focus:border-[#C8F135] outline-none" />
                <input value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max ₹" type="number"
                  className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2 text-sm focus:border-[#C8F135] outline-none" />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-white/30 mb-3">Size</p>
              <div className="flex flex-wrap gap-1">
                {ALL_SIZES.map(s => (
                  <button key={s} onClick={() => toggleSize(s)}
                    className={`w-10 h-8 text-xs font-bold border transition-colors ${selectedSizes.includes(s) ? 'bg-white text-black border-white' : 'border-white/20 text-white/50 hover:border-white'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-white/30 mb-3">Collection</p>
              <select value={collection} onChange={e => setCollection(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2 text-sm focus:border-[#C8F135] outline-none mb-2">
                {collections.map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 text-white px-3 py-2 text-sm focus:border-[#C8F135] outline-none">
                {SORTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            {(selectedSizes.length > 0 || selectedColors.length > 0 || search || minPrice || maxPrice) && (
              <div className="col-span-full">
                <button onClick={() => { setSelectedSizes([]); setSelectedColors([]); setSearch(''); setMinPrice(''); setMaxPrice('') }}
                  className="text-xs font-bold text-red-400 hover:text-red-300 tracking-widest uppercase">
                  CLEAR ALL FILTERS
                </button>
              </div>
            )}
          </motion.div>
        )}

        {loading ? (
          <div className="text-center py-20 text-[#C8F135] text-xl font-black tracking-widest">LOADING...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/30 font-bold">No products found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
            {filtered.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="bg-black">
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
