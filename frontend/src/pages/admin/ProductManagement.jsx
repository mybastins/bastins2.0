import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'

const empty = { name: '', price: '', description: '', category: '', sizes: '', colors: '', image: '' }

export default function ProductManagement() {
  const [products, setProducts] = useState([])
  const [tab, setTab] = useState('list')
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState(null)
  const { token, user } = useAuth()
  const { darkMode } = useTheme()

  useEffect(() => { fetchProducts() }, [])

  async function fetchProducts() {
    const { data } = await axios.get('/api/products/all')
    setProducts(data)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form, price: Number(form.price) }
      if (editId) {
        await axios.put(`/api/products/${editId}`, payload, { headers: { Authorization: `Bearer ${token}` } })
        toast.success('Product updated!')
      } else {
        await axios.post('/api/products/create', payload, { headers: { Authorization: `Bearer ${token}` } })
        toast.success('Product added!')
      }
      setForm(empty)
      setEditId(null)
      setTab('list')
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error saving product')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return
    await axios.delete(`/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    toast.success('Deleted!')
    fetchProducts()
  }

  function startEdit(p) {
    setForm({ ...p, sizes: p.sizes.join(', '), colors: p.colors.join(', ') })
    setEditId(p.id)
    setTab('add')
  }

  async function handleBulkUpload(e) {
    e.preventDefault()
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    try {
      const { data } = await axios.post('/api/products/bulk-upload', fd, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } })
      toast.success(`${data.added} products uploaded!`)
      fetchProducts()
      setTab('list')
    } catch {
      toast.error('Upload failed')
    }
  }

  if (user?.role !== 'admin') {
    return <div className="min-h-screen pt-20 flex items-center justify-center text-2xl font-bold">🚫 Admin Only</div>
  }

  const inputClass = `w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:border-primary ${darkMode ? 'bg-white/10 border border-white/20 text-white placeholder-white/40' : 'bg-gray-50 border border-gray-200'}`

  return (
    <div className={`min-h-screen pt-20 ${darkMode ? 'bg-black text-white' : 'bg-light text-black'}`}>
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-black mb-8">Product <span className="text-primary">Management</span></h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {['list', 'add', 'bulk'].map(t => (
            <button key={t} onClick={() => { setTab(t); if (t !== 'add') { setForm(empty); setEditId(null) } }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${tab === t ? 'bg-primary text-white' : darkMode ? 'bg-white/10' : 'bg-gray-100'}`}>
              {t === 'list' ? '📋 Products' : t === 'add' ? `${editId ? '✏️ Edit' : '➕ Add'} Product` : '📊 Bulk Upload'}
            </button>
          ))}
        </div>

        {tab === 'list' && (
          <div>
            <p className={`mb-4 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{products.length} products</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => (
                <motion.div key={p.id} layout className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-black/10'}`}>
                  <img src={p.image} alt={p.name} className="w-full h-40 object-cover"
                    onError={e => e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300'} />
                  <div className="p-4">
                    <h3 className="font-bold truncate">{p.name}</h3>
                    <p className={`text-xs ${darkMode ? 'text-white/50' : 'text-gray-400'}`}>{p.category}</p>
                    <p className="text-primary font-black">₹{p.price}</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => startEdit(p)} className="flex-1 bg-primary/20 text-primary text-sm py-1.5 rounded-lg hover:bg-primary/30">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="flex-1 bg-red-500/20 text-red-400 text-sm py-1.5 rounded-lg hover:bg-red-500/30">Delete</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {tab === 'add' && (
          <form onSubmit={handleSubmit} className={`max-w-xl rounded-2xl p-6 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-black/10'}`}>
            <h2 className="font-black text-xl mb-6">{editId ? 'Edit Product' : 'Add New Product'}</h2>
            <div className="space-y-4">
              {[['name', 'Product Name'], ['price', 'Price (₹)'], ['category', 'Category'], ['image', 'Image URL']].map(([field, label]) => (
                <div key={field}>
                  <label className="text-sm font-medium block mb-1">{label}</label>
                  <input className={inputClass} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    placeholder={label} type={field === 'price' ? 'number' : 'text'} required={field === 'name' || field === 'price'} />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium block mb-1">Description</label>
                <textarea className={inputClass} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Product description..." rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Sizes (comma-separated)</label>
                <input className={inputClass} value={form.sizes} onChange={e => setForm(f => ({ ...f, sizes: e.target.value }))} placeholder="XS, S, M, L, XL" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Colors (comma-separated)</label>
                <input className={inputClass} value={form.colors} onChange={e => setForm(f => ({ ...f, colors: e.target.value }))} placeholder="Black, White, Gray" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/80 disabled:opacity-50">
                {loading ? 'Saving...' : editId ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        )}

        {tab === 'bulk' && (
          <div className={`max-w-xl rounded-2xl p-6 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-black/10'}`}>
            <h2 className="font-black text-xl mb-2">Bulk Upload via Excel</h2>
            <p className={`text-sm mb-6 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>
              Upload an .xlsx file with columns: name, price, description, category, sizes, colors, image
            </p>
            <form onSubmit={handleBulkUpload} className="space-y-4">
              <div className="border-2 border-dashed border-primary/50 rounded-xl p-8 text-center">
                <div className="text-3xl mb-2">📊</div>
                <input type="file" accept=".xlsx,.xls" onChange={e => setFile(e.target.files[0])} className="hidden" id="xlsxFile" />
                <label htmlFor="xlsxFile" className="cursor-pointer">
                  <span className="font-semibold text-primary">{file ? file.name : 'Click to select Excel file'}</span>
                </label>
              </div>
              <button type="submit" disabled={!file}
                className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/80 disabled:opacity-50">
                Upload Products
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
