import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import ProductCard from '../components/ProductCard'

const SORTS = ['Default', 'Price: Low to High', 'Price: High to Low', 'Newest']
const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL']

export default function Collections() {
  const [products, setProducts]           = useState([])
  const [collections, setCollections]     = useState([])
  const [collectionMeta, setCollectionMeta] = useState({})
  const [categories, setCategories]       = useState([])
  const [loading, setLoading]             = useState(true)

  /* active collection drill-down (null = overview) */
  const [activeCollection, setActiveCollection] = useState(null)

  /* product-grid filters */
  const [category, setCategory]           = useState('All')
  const [sort, setSort]                   = useState('Default')
  const [search, setSearch]               = useState('')
  const [minPrice, setMinPrice]           = useState('')
  const [maxPrice, setMaxPrice]           = useState('')
  const [selectedSizes, setSelectedSizes] = useState([])
  const [showFilters, setShowFilters]     = useState(false)

  useEffect(() => {
    Promise.all([
      axios.get('/api/products/all'),
      axios.get('/api/collections')
    ]).then(([p, c]) => {
      if (Array.isArray(p.data)) setProducts(p.data)
      if (c.data && typeof c.data === 'object' && !Array.isArray(c.data)) {
        setCollections(c.data.collections || [])
        setCollectionMeta(c.data.collectionMeta || {})
        setCategories(['All', ...(c.data.categories || [])])
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  /* ── helpers ── */
  function getCover(name) {
    const meta = collectionMeta[name]
    if (meta?.image) return meta.image
    // fall back to first product image in this collection
    const first = products.find(p => p.collection === name && p.image)
    return first?.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'
  }

  function getProductCount(name) {
    return products.filter(p => p.collection === name).length
  }

  /* ── filtered products for active collection ── */
  const filtered = (() => {
    if (!activeCollection) return []
    let r = products.filter(p => p.collection === activeCollection)
    if (category !== 'All') r = r.filter(p => p.category === category)
    if (search)    r = r.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    if (minPrice)  r = r.filter(p => (p.discountPrice || p.price) >= Number(minPrice))
    if (maxPrice)  r = r.filter(p => (p.discountPrice || p.price) <= Number(maxPrice))
    if (selectedSizes.length) r = r.filter(p => selectedSizes.some(s => p.sizes?.includes(s)))
    if (sort === 'Price: Low to High') r.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price))
    else if (sort === 'Price: High to Low') r.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price))
    else if (sort === 'Newest') r.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return r
  })()

  function openCollection(name) {
    setActiveCollection(name)
    setCategory('All')
    setSearch('')
    setMinPrice('')
    setMaxPrice('')
    setSelectedSizes([])
    setSort('Default')
    setShowFilters(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function toggleSize(s) {
    setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-[#C8F135] font-black text-xl tracking-widest">LOADING...</p>
    </div>
  )

  /* ══════════════════════════════════════════
     COLLECTION OVERVIEW
  ══════════════════════════════════════════ */
  if (!activeCollection) return (
    <div className="min-h-screen bg-black text-white pt-16">
      {/* Glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-[#C8F135]/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="border-b border-white/10 pb-8 mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-[#C8F135] mb-2">Browse</p>
          <h1 className="text-5xl font-black tracking-tight">COLLECTIONS</h1>
          <p className="text-white/30 text-sm mt-2">{collections.length} collections · {products.length} products</p>
        </div>

        {/* Collection grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((name, i) => {
            const count  = getProductCount(name)
            const cover  = getCover(name)
            const desc   = collectionMeta[name]?.description || ''

            return (
              <motion.button
                key={name}
                onClick={() => openCollection(name)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="relative group bg-black overflow-hidden text-left focus:outline-none rounded-[20px] w-4/5 mx-auto"
              >
                {/* Cover image */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-[20px]">
                  <img
                    src={cover}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600' }}
                  />
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                  {/* Product count badge */}
                  <div className="absolute top-4 right-4 bg-black/70 border border-white/10 px-3 py-1">
                    <span className="text-xs font-black tracking-widest text-white/70">{count} PIECES</span>
                  </div>

                  {/* Text overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-xs tracking-[0.25em] uppercase text-[#C8F135] mb-1 font-bold">Collection</p>
                    <h2 className="text-2xl font-black tracking-tight text-white mb-2">{name.toUpperCase()}</h2>
                    {desc && (
                      <p className="text-sm text-white/50 leading-relaxed line-clamp-2">{desc}</p>
                    )}
                    <div className="mt-4 flex items-center gap-2 text-xs font-black tracking-widest uppercase text-[#C8F135] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      EXPLORE
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>

        {collections.length === 0 && (
          <div className="text-center py-24 text-white/20 font-black tracking-widest">
            NO COLLECTIONS YET
          </div>
        )}
      </div>
    </div>
  )

  /* ══════════════════════════════════════════
     COLLECTION DRILL-DOWN (products)
  ══════════════════════════════════════════ */
  const cover = getCover(activeCollection)
  const desc  = collectionMeta[activeCollection]?.description || ''

  return (
    <div className="min-h-screen bg-black text-white pt-16">

      {/* Hero banner */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src={cover} alt={activeCollection}
          className="w-full h-full object-cover"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-0 flex items-end px-10 pb-10">
          <div>
            <button
              onClick={() => setActiveCollection(null)}
              className="text-xs font-bold tracking-widest uppercase text-white/40 hover:text-[#C8F135] transition-colors mb-4 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              ALL COLLECTIONS
            </button>
            <p className="text-xs tracking-[0.3em] uppercase text-[#C8F135] mb-1">Collection</p>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">{activeCollection.toUpperCase()}</h1>
            {desc && <p className="text-white/50 text-sm mt-2 max-w-md">{desc}</p>}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <p className="text-white/30 text-sm">{filtered.length} products</p>
          <div className="flex items-center gap-3">
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="bg-zinc-900 border border-white/10 text-white px-3 py-2 text-xs font-bold tracking-wider focus:border-[#C8F135] outline-none cursor-pointer uppercase">
              {SORTS.map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`text-xs font-bold tracking-widest uppercase border px-4 py-2 transition-colors ${showFilters ? 'border-[#C8F135] text-[#C8F135]' : 'border-white/20 text-white/60 hover:border-[#C8F135]'}`}>
              {showFilters ? 'HIDE FILTERS' : 'FILTERS'}
            </button>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-1 mb-6 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-4 py-2 text-xs font-bold tracking-widest uppercase transition-colors ${category === c ? 'bg-white text-black' : 'bg-zinc-900 border border-white/10 text-white/50 hover:text-white'}`}>
              {c}
            </button>
          ))}
        </div>

        {/* Expanded filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="border border-white/10 p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
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
                {(search || minPrice || maxPrice || selectedSizes.length > 0) && (
                  <div className="col-span-full">
                    <button onClick={() => { setSearch(''); setMinPrice(''); setMaxPrice(''); setSelectedSizes([]) }}
                      className="text-xs font-bold text-red-400 hover:text-red-300 tracking-widest uppercase">
                      CLEAR ALL FILTERS
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 border border-white/10">
            <p className="text-white/20 font-black tracking-widest">NO PRODUCTS IN THIS COLLECTION YET</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-px bg-white/10">
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
