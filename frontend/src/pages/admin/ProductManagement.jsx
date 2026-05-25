import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const empty = {
  name: '', price: '', discountPrice: '', description: '',
  category: '', collection: '', sizes: '', colors: '',
  image: '', stock: '', sku: '', status: 'active'
}

const STATUS_OPTS = ['active', 'draft', 'out_of_stock']
const STATUS_COLOR = { active: 'text-green-400', draft: 'text-yellow-400', out_of_stock: 'text-red-400' }

export default function ProductManagement() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [collections, setCollections] = useState([])
  const [tab, setTab] = useState('list')
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const { token, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/admin/login'); return }
    fetchAll()
  }, [user])

  async function fetchAll() {
    const [p, c] = await Promise.all([
      axios.get('/api/products/all'),
      axios.get('/api/collections')
    ])
    setProducts(p.data)
    setCategories(c.data.categories || [])
    setCollections(c.data.collections || [])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.price) return toast.error('Name and price are required')
    setLoading(true)
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
        stock: Number(form.stock) || 0,
        sizes: form.sizes ? form.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
        colors: form.colors ? form.colors.split(',').map(c => c.trim()).filter(Boolean) : [],
      }
      if (editId) {
        await axios.put(`/api/products/${editId}`, payload, { headers: { Authorization: `Bearer ${token}` } })
        toast.success('Product updated!')
      } else {
        await axios.post('/api/products/create', payload, { headers: { Authorization: `Bearer ${token}` } })
        toast.success('Product added!')
      }
      resetForm()
      setTab('list')
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error saving product')
    } finally { setLoading(false) }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"?`)) return
    await axios.delete(`/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    toast.success('Product deleted')
    fetchAll()
  }

  async function toggleStatus(product) {
    const newStatus = product.status === 'active' ? 'draft' : 'active'
    await axios.put(`/api/products/${product.id}`, { ...product, status: newStatus }, { headers: { Authorization: `Bearer ${token}` } })
    toast.success(`Product ${newStatus}`)
    fetchAll()
  }

  async function handleBulkUpload(e) {
    e.preventDefault()
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    try {
      const { data } = await axios.post('/api/products/bulk-upload', fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      })
      toast.success(`${data.added} products uploaded!`)
      fetchAll(); setTab('list'); setFile(null)
    } catch { toast.error('Upload failed') }
  }

  function startEdit(p) {
    setForm({
      name: p.name, price: p.price, discountPrice: p.discountPrice || '',
      description: p.description, category: p.category, collection: p.collection || '',
      sizes: p.sizes?.join(', ') || '', colors: p.colors?.join(', ') || '',
      image: p.image, stock: p.stock || 0, sku: p.sku || '', status: p.status || 'active'
    })
    setEditId(p.id)
    setTab('form')
    window.scrollTo(0, 0)
  }

  function resetForm() { setForm(empty); setEditId(null) }

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || p.status === filterStatus
    return matchSearch && matchStatus
  })

  const inputClass = "w-full bg-zinc-900 border border-white/10 text-white px-4 py-2.5 text-sm focus:border-[#C8F135] outline-none transition-colors placeholder-white/20"
  const selectClass = inputClass + " cursor-pointer"
  const labelClass = "text-xs text-white/40 tracking-widest uppercase block mb-1"

  if (user?.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[#C8F135] mb-1">Admin</p>
            <h1 className="text-4xl font-black tracking-tight">PRODUCT MANAGEMENT</h1>
            <p className="text-white/30 text-sm mt-1">{products.length} products total</p>
          </div>
          <button onClick={() => navigate('/admin')} className="text-xs font-bold tracking-widest border border-white/10 px-4 py-2 text-white/40 hover:text-white">
            ← DASHBOARD
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-white/10 mb-8">
          {[
            { key: 'list', label: `ALL PRODUCTS (${products.length})` },
            { key: 'form', label: editId ? '✏ EDIT PRODUCT' : '＋ ADD PRODUCT' },
            { key: 'bulk', label: '📊 BULK UPLOAD' }
          ].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); if (t.key !== 'form') resetForm() }}
              className={`px-5 py-3 text-xs font-bold tracking-widest uppercase transition-colors ${tab === t.key ? 'text-white border-b-2 border-[#C8F135]' : 'text-white/30 hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── LIST TAB ── */}
        {tab === 'list' && (
          <div>
            <div className="flex flex-wrap gap-3 mb-6">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or SKU..."
                className="flex-1 min-w-48 bg-zinc-900 border border-white/10 text-white px-4 py-2 text-sm focus:border-[#C8F135] outline-none" />
              <div className="flex gap-1">
                {['all', ...STATUS_OPTS].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-3 py-2 text-xs font-bold tracking-widest uppercase transition-colors ${filterStatus === s ? 'bg-white text-black' : 'bg-zinc-900 border border-white/10 text-white/40 hover:text-white'}`}>
                    {s}
                  </button>
                ))}
              </div>
              <button onClick={() => { resetForm(); setTab('form') }}
                className="bg-[#C8F135] text-black font-black px-5 py-2 text-xs tracking-widest uppercase hover:bg-white transition-colors">
                + ADD NEW
              </button>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20 text-white/20 font-bold">No products found</div>
            ) : (
              <div className="border border-white/10">
                <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-bold tracking-widest uppercase text-white/20 border-b border-white/10">
                  <span className="col-span-1">IMG</span>
                  <span className="col-span-3">NAME / SKU</span>
                  <span className="col-span-2">PRICE</span>
                  <span className="col-span-1">STOCK</span>
                  <span className="col-span-2">CATEGORY</span>
                  <span className="col-span-1">STATUS</span>
                  <span className="col-span-2 text-right">ACTIONS</span>
                </div>
                <AnimatePresence>
                  {filtered.map(p => (
                    <motion.div key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="grid grid-cols-12 gap-2 px-4 py-4 items-center border-b border-white/5 hover:bg-white/3 transition-colors">
                      <div className="col-span-1">
                        <img src={p.image} alt={p.name} className="w-12 h-12 object-cover bg-zinc-900"
                          onError={e => e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=60'} />
                      </div>
                      <div className="col-span-3">
                        <p className="font-bold text-sm truncate">{p.name}</p>
                        <p className="text-xs text-white/30 font-mono">{p.sku}</p>
                      </div>
                      <div className="col-span-2">
                        {p.discountPrice ? (
                          <div>
                            <p className="font-black text-[#C8F135] text-sm">₹{p.discountPrice}</p>
                            <p className="text-xs text-white/30 line-through">₹{p.price}</p>
                          </div>
                        ) : (
                          <p className="font-black text-sm">₹{p.price}</p>
                        )}
                      </div>
                      <div className="col-span-1">
                        <span className={`text-sm font-black ${p.stock <= 5 ? 'text-red-400' : p.stock <= 15 ? 'text-yellow-400' : 'text-white'}`}>{p.stock}</span>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-white/50 truncate">{p.category}</p>
                        <p className="text-xs text-white/30 truncate">{p.collection}</p>
                      </div>
                      <div className="col-span-1">
                        <span className={`text-xs font-bold ${STATUS_COLOR[p.status]}`}>
                          {p.status === 'active' ? '● ON' : p.status === 'draft' ? '● DRAFT' : '● OOS'}
                        </span>
                      </div>
                      <div className="col-span-2 flex gap-2 justify-end">
                        <button onClick={() => startEdit(p)} className="text-xs font-bold border border-white/20 px-3 py-1.5 hover:border-[#C8F135] hover:text-[#C8F135] transition-colors">
                          EDIT
                        </button>
                        <button onClick={() => handleDelete(p.id, p.name)} className="text-xs font-bold border border-white/10 px-3 py-1.5 text-red-400/70 hover:text-red-400 hover:border-red-400/50 transition-colors">
                          DEL
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* ── ADD / EDIT FORM ── */}
        {tab === 'form' && (
          <form onSubmit={handleSubmit} className="max-w-3xl">
            <h2 className="text-xl font-black mb-6">{editId ? 'EDIT PRODUCT' : 'ADD NEW PRODUCT'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div className="md:col-span-2">
                <label className={labelClass}>Product Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Classic Oversized Black Tee" required className={inputClass} />
              </div>

              {/* Price */}
              <div>
                <label className={labelClass}>Price (₹) *</label>
                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="599" required className={inputClass} />
              </div>

              {/* Discount Price */}
              <div>
                <label className={labelClass}>Discounted Price (₹) — optional</label>
                <input type="number" value={form.discountPrice} onChange={e => setForm(f => ({ ...f, discountPrice: e.target.value }))}
                  placeholder="Leave blank if no discount" className={inputClass} />
              </div>

              {/* SKU */}
              <div>
                <label className={labelClass}>SKU / Product Code</label>
                <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                  placeholder="BST-009" className={inputClass} />
              </div>

              {/* Stock */}
              <div>
                <label className={labelClass}>Stock Quantity</label>
                <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                  placeholder="50" className={inputClass} />
              </div>

              {/* Category */}
              <div>
                <label className={labelClass}>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={selectClass}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Collection */}
              <div>
                <label className={labelClass}>Collection</label>
                <select value={form.collection} onChange={e => setForm(f => ({ ...f, collection: e.target.value }))} className={selectClass}>
                  <option value="">Select collection</option>
                  {collections.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className={labelClass}>Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={selectClass}>
                  <option value="active">Active — visible to customers</option>
                  <option value="draft">Draft — hidden from customers</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>

              {/* Image URL */}
              <div>
                <label className={labelClass}>Image URL</label>
                <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                  placeholder="https://..." className={inputClass} />
              </div>

              {/* Sizes */}
              <div>
                <label className={labelClass}>Sizes (comma-separated)</label>
                <input value={form.sizes} onChange={e => setForm(f => ({ ...f, sizes: e.target.value }))}
                  placeholder="XS, S, M, L, XL, XXL" className={inputClass} />
              </div>

              {/* Colors */}
              <div>
                <label className={labelClass}>Colors (comma-separated)</label>
                <input value={form.colors} onChange={e => setForm(f => ({ ...f, colors: e.target.value }))}
                  placeholder="Black, White, Gray" className={inputClass} />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className={labelClass}>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Product description..." rows={4} className={inputClass + ' resize-none'} />
              </div>

              {/* Image Preview */}
              {form.image && (
                <div className="md:col-span-2">
                  <label className={labelClass}>Image Preview</label>
                  <img src={form.image} alt="preview" className="w-32 h-32 object-cover border border-white/10"
                    onError={e => e.target.style.display = 'none'} />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <motion.button type="submit" whileTap={{ scale: 0.97 }} disabled={loading}
                className="bg-white text-black font-black px-8 py-3 text-xs tracking-widest uppercase hover:bg-[#C8F135] transition-colors disabled:opacity-50">
                {loading ? 'SAVING...' : editId ? 'UPDATE PRODUCT' : 'ADD PRODUCT'}
              </motion.button>
              <button type="button" onClick={() => { resetForm(); setTab('list') }}
                className="border border-white/20 text-white/50 font-bold px-6 py-3 text-xs tracking-widest uppercase hover:text-white hover:border-white transition-colors">
                CANCEL
              </button>
            </div>
          </form>
        )}

        {/* ── BULK UPLOAD TAB ── */}
        {tab === 'bulk' && (
          <div className="max-w-xl">
            <h2 className="text-xl font-black mb-2">BULK UPLOAD VIA EXCEL</h2>
            <p className="text-sm text-white/40 mb-6">
              Upload an <span className="text-white font-bold">.xlsx</span> file with these columns:<br />
              <span className="font-mono text-[#C8F135] text-xs">name, price, discountPrice, description, category, collection, sizes, colors, image, stock, sku, status</span>
            </p>

            <form onSubmit={handleBulkUpload} className="space-y-4">
              <label htmlFor="xlsxFile" className="block">
                <div className={`border-2 border-dashed ${file ? 'border-[#C8F135]/60' : 'border-white/20'} p-10 text-center cursor-pointer hover:border-[#C8F135]/40 transition-colors`}>
                  <div className="text-4xl mb-3">📊</div>
                  <p className={`font-bold text-sm ${file ? 'text-[#C8F135]' : 'text-white/50'}`}>
                    {file ? file.name : 'Click to select Excel file (.xlsx)'}
                  </p>
                  {file && <p className="text-xs text-white/30 mt-1">{(file.size / 1024).toFixed(1)} KB</p>}
                </div>
                <input id="xlsxFile" type="file" accept=".xlsx,.xls" onChange={e => setFile(e.target.files[0])} className="hidden" />
              </label>

              <motion.button type="submit" disabled={!file} whileTap={{ scale: 0.97 }}
                className="w-full bg-white text-black font-black py-3 text-xs tracking-widest uppercase hover:bg-[#C8F135] transition-colors disabled:opacity-30">
                UPLOAD PRODUCTS
              </motion.button>

              {file && (
                <button type="button" onClick={() => setFile(null)} className="w-full text-xs text-red-400/60 hover:text-red-400 transition-colors tracking-widest">
                  REMOVE FILE
                </button>
              )}
            </form>

            <div className="mt-8 border border-white/10 p-5">
              <p className="text-xs font-bold tracking-widest uppercase text-white/30 mb-3">Sample Row Format</p>
              <div className="text-xs font-mono text-white/50 space-y-1">
                <p><span className="text-white/30">name:</span> Classic Black Tee</p>
                <p><span className="text-white/30">price:</span> 599</p>
                <p><span className="text-white/30">discountPrice:</span> 499</p>
                <p><span className="text-white/30">sizes:</span> XS,S,M,L,XL</p>
                <p><span className="text-white/30">colors:</span> Black,White</p>
                <p><span className="text-white/30">stock:</span> 50</p>
                <p><span className="text-white/30">status:</span> active</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
