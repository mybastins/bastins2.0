import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { exportCsv } from '../../utils/exportCsv'

const empty = {
  name: '', price: '', discountPrice: '', description: '',
  category: '', collection: '', sizes: '', colors: '',
  image: '', stock: '', sku: '', status: 'active',
  mockupImages: []
}

const STATUS_OPTS = ['active', 'draft', 'out_of_stock']
const STATUS_COLOR = { active: 'text-green-400', draft: 'text-yellow-400', out_of_stock: 'text-red-400' }

/* ── Live product card preview ── */
function ProductPreview({ form }) {
  const hasDiscount = form.discountPrice && Number(form.discountPrice) < Number(form.price)
  const discount = hasDiscount ? Math.round((1 - Number(form.discountPrice) / Number(form.price)) * 100) : 0
  const isOOS = form.status === 'out_of_stock'
  const sizes = form.sizes ? form.sizes.split(',').map(s => s.trim()).filter(Boolean) : []

  const mainImage = form.image || (form.mockupImages?.[0]) || null

  return (
    <div className="sticky top-6 space-y-4">
      <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40">Live Preview</p>

      {/* Card preview */}
      <div className="border border-white/10 bg-zinc-950">
        <div className="relative aspect-square bg-zinc-900 overflow-hidden">
          {mainImage ? (
            <img src={mainImage} alt="preview"
              className="w-full h-full object-cover"
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400' }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-[#C8F135] text-black text-xs font-black px-2 py-0.5">
              -{discount}%
            </div>
          )}
          {isOOS && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-xs font-black tracking-widest">SOLD OUT</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <p className="text-xs text-white/30 tracking-widest uppercase mb-1">
            {form.category || 'Category'}
          </p>
          <p className="font-bold text-sm text-white mb-2 truncate">
            {form.name || 'Product Name'}
          </p>
          <div className="flex items-center gap-2 mb-3">
            {hasDiscount ? (
              <>
                <span className="font-black text-[#C8F135] text-sm">₹{form.discountPrice}</span>
                <span className="text-white/30 text-xs line-through">₹{form.price}</span>
              </>
            ) : (
              <span className="font-black text-white text-sm">
                {form.price ? `₹${form.price}` : '₹—'}
              </span>
            )}
          </div>
          {sizes.length > 0 && (
            <div className="flex gap-1 flex-wrap mb-3">
              {sizes.slice(0, 5).map(s => (
                <span key={s} className="text-xs border border-white/20 text-white/50 px-2 py-0.5">{s}</span>
              ))}
            </div>
          )}
          <div className={`text-xs font-bold ${STATUS_COLOR[form.status] || 'text-white/40'}`}>
            {form.status === 'active' ? '● In Stock' : form.status === 'draft' ? '● Draft' : '● Out of Stock'}
          </div>
        </div>
      </div>

      {/* Mockup gallery thumbnails */}
      {form.mockupImages?.length > 0 && (
        <div>
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-2">
            Mockups ({form.mockupImages.length})
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {form.mockupImages.map((url, i) => (
              <div key={i} className={`relative aspect-square bg-zinc-900 border ${i === 0 && !form.image ? 'border-[#C8F135]/50' : 'border-white/10'}`}>
                <img src={url} alt={`Mockup ${i + 1}`} className="w-full h-full object-cover"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100' }} />
                {i === 0 && !form.image && (
                  <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-black bg-[#C8F135] text-black py-0.5">MAIN</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Mockup Images input section ── */
function MockupImagesSection({ form, setForm, inputClass, labelClass }) {
  const [urlInput, setUrlInput] = useState('')

  function addImage() {
    const url = urlInput.trim()
    if (!url) return
    if (form.mockupImages?.includes(url)) return toast.error('Image already added')
    if ((form.mockupImages?.length || 0) >= 6) return toast.error('Max 6 mockup images')
    setForm(f => ({ ...f, mockupImages: [...(f.mockupImages || []), url] }))
    setUrlInput('')
  }

  function removeImage(i) {
    setForm(f => ({ ...f, mockupImages: f.mockupImages.filter((_, idx) => idx !== i) }))
  }

  function moveToMain(url) {
    setForm(f => ({ ...f, image: url }))
    toast.success('Set as main product image')
  }

  return (
    <div className="md:col-span-2 border border-white/10 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className={labelClass}>Product Mockup Images</p>
          <p className="text-xs text-white/20 mt-0.5">Add multiple angles or lifestyle shots (max 6)</p>
        </div>
        <span className="text-xs font-bold text-white/20">{form.mockupImages?.length || 0}/6</span>
      </div>

      {/* URL input row */}
      <div className="flex gap-2">
        <input
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())}
          placeholder="Paste image URL and press Add or Enter"
          className={inputClass + ' flex-1'}
        />
        <button type="button" onClick={addImage}
          className="bg-[#C8F135] text-black font-black px-5 text-xs tracking-widest uppercase hover:bg-white transition-colors whitespace-nowrap">
          + ADD
        </button>
      </div>

      {/* Thumbnail grid */}
      {form.mockupImages?.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {form.mockupImages.map((url, i) => (
            <div key={i} className="relative group aspect-square bg-zinc-900 border border-white/10">
              <img src={url} alt={`Mockup ${i + 1}`}
                className="w-full h-full object-cover"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100' }} />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                <button type="button" onClick={() => moveToMain(url)}
                  className="w-full text-[9px] font-black tracking-wider bg-[#C8F135] text-black py-1 text-center">
                  SET MAIN
                </button>
                <button type="button" onClick={() => removeImage(i)}
                  className="w-full text-[9px] font-black tracking-wider bg-red-500/80 text-white py-1 text-center">
                  REMOVE
                </button>
              </div>

              {/* Index badge */}
              <span className="absolute top-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5">
                {i === 0 ? '★' : i + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {!form.mockupImages?.length && (
        <div className="border border-dashed border-white/10 py-6 text-center">
          <svg className="w-8 h-8 mx-auto mb-2 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xs text-white/20 tracking-widest">No mockup images added yet</p>
        </div>
      )}
    </div>
  )
}

/* ── Collections Manager Component ── */
function CollectionsManager({ collections, collectionMeta, products, token, onRefresh, inputClass, labelClass }) {
  const [newName, setNewName]       = useState('')
  const [newImage, setNewImage]     = useState('')
  const [newDesc, setNewDesc]       = useState('')
  const [editingName, setEditingName] = useState(null)
  const [editImage, setEditImage]   = useState('')
  const [editDesc, setEditDesc]     = useState('')
  const [saving, setSaving]         = useState(false)

  function getCount(name) {
    return products.filter(p => p.collection === name).length
  }

  function getAutoCover(name) {
    const meta = collectionMeta[name]
    if (meta?.image) return meta.image
    const first = products.find(p => p.collection === name && p.image)
    return first?.image || null
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!newName.trim()) return toast.error('Collection name required')
    setSaving(true)
    try {
      await axios.post('/api/collections/collection',
        { name: newName.trim(), image: newImage.trim(), description: newDesc.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(`Collection "${newName}" added!`)
      setNewName(''); setNewImage(''); setNewDesc('')
      onRefresh()
    } catch { toast.error('Failed to add collection') }
    finally { setSaving(false) }
  }

  async function handleSaveMeta(name) {
    setSaving(true)
    try {
      await axios.put(`/api/collections/collection/${encodeURIComponent(name)}`,
        { image: editImage, description: editDesc },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Cover updated!')
      setEditingName(null)
      onRefresh()
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  async function handleDelete(name) {
    if (!window.confirm(`Delete collection "${name}"? Products won't be deleted.`)) return
    try {
      await axios.delete(`/api/collections/collection/${encodeURIComponent(name)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success(`"${name}" deleted`)
      onRefresh()
    } catch { toast.error('Failed to delete') }
  }

  function startEdit(name) {
    setEditingName(name)
    setEditImage(collectionMeta[name]?.image || '')
    setEditDesc(collectionMeta[name]?.description || '')
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-xl font-black mb-1">MANAGE COLLECTIONS</h2>
        <p className="text-white/30 text-sm">Set cover images and descriptions for each collection displayed on the storefront.</p>
      </div>

      {/* Existing collections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {collections.map(name => {
          const cover     = getAutoCover(name)
          const count     = getCount(name)
          const isEditing = editingName === name

          return (
            <div key={name} className="border border-white/10 overflow-hidden">
              {/* Cover thumbnail */}
              <div className="relative h-40 bg-zinc-900">
                {cover ? (
                  <img src={cover} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <p className="font-black text-white">{name}</p>
                  <p className="text-xs text-white/40">{count} product{count !== 1 ? 's' : ''}</p>
                </div>
                {!collectionMeta[name]?.image && cover && (
                  <span className="absolute top-2 right-2 text-[9px] font-black bg-white/10 text-white/50 px-2 py-0.5 tracking-wider">AUTO</span>
                )}
                {collectionMeta[name]?.image && (
                  <span className="absolute top-2 right-2 text-[9px] font-black bg-[#C8F135]/20 text-[#C8F135] px-2 py-0.5 tracking-wider">CUSTOM</span>
                )}
              </div>

              {/* Edit form */}
              {isEditing ? (
                <div className="p-4 space-y-3 border-t border-white/10">
                  <div>
                    <label className={labelClass}>Cover Image URL</label>
                    <input value={editImage} onChange={e => setEditImage(e.target.value)}
                      placeholder="https://..." className={inputClass} />
                    {editImage && (
                      <img src={editImage} alt="preview"
                        className="mt-2 h-16 w-24 object-cover border border-white/10"
                        onError={e => e.target.style.display = 'none'} />
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Description</label>
                    <input value={editDesc} onChange={e => setEditDesc(e.target.value)}
                      placeholder="Short collection description..." className={inputClass} />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => handleSaveMeta(name)} disabled={saving}
                      className="bg-white text-black font-black px-4 py-2 text-xs tracking-widest uppercase hover:bg-[#C8F135] transition-colors disabled:opacity-40">
                      {saving ? 'SAVING...' : 'SAVE'}
                    </button>
                    <button onClick={() => setEditingName(null)}
                      className="border border-white/20 text-white/50 font-bold px-4 py-2 text-xs tracking-widest uppercase hover:text-white transition-colors">
                      CANCEL
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between">
                  <p className="text-xs text-white/30 truncate max-w-[200px]">
                    {collectionMeta[name]?.description || <span className="italic">No description</span>}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(name)}
                      className="text-xs font-bold border border-white/20 px-3 py-1.5 hover:border-[#C8F135] hover:text-[#C8F135] transition-colors">
                      EDIT
                    </button>
                    <button onClick={() => handleDelete(name)}
                      className="text-xs font-bold border border-white/10 px-3 py-1.5 text-red-400/60 hover:text-red-400 hover:border-red-400/40 transition-colors">
                      DEL
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add new collection */}
      <div className="border border-white/10 p-6">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-5">Add New Collection</p>
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Collection Name *</label>
            <input value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="e.g. Summer Drop" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Cover Image URL</label>
            <input value={newImage} onChange={e => setNewImage(e.target.value)}
              placeholder="https://..." className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <input value={newDesc} onChange={e => setNewDesc(e.target.value)}
              placeholder="Short description..." className={inputClass} />
          </div>
          <div className="md:col-span-3">
            <motion.button type="submit" whileTap={{ scale: 0.97 }} disabled={saving}
              className="bg-[#C8F135] text-black font-black px-6 py-2.5 text-xs tracking-widest uppercase hover:bg-white transition-colors disabled:opacity-40">
              {saving ? 'ADDING...' : '+ ADD COLLECTION'}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProductManagement() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [collections, setCollections] = useState([])
  const [collectionMeta, setCollectionMeta] = useState({})
  const [tab, setTab] = useState('list')
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selected, setSelected] = useState(new Set())
  const [bulkBusy, setBulkBusy] = useState(false)
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
    setCollectionMeta(c.data.collectionMeta || {})
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
        mockupImages: form.mockupImages || [],
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

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelected(prev => {
      const allSelected = filtered.length > 0 && filtered.every(p => prev.has(p.id))
      if (allSelected) return new Set()
      return new Set(filtered.map(p => p.id))
    })
  }

  async function bulkSetStatus(status) {
    const ids = [...selected]
    if (!ids.length) return
    setBulkBusy(true)
    try {
      await Promise.all(ids.map(id =>
        axios.put(`/api/products/${id}`, { status }, { headers: { Authorization: `Bearer ${token}` } })
      ))
      toast.success(`${ids.length} product${ids.length > 1 ? 's' : ''} set to ${status}`)
      setSelected(new Set())
      fetchAll()
    } catch { toast.error('Bulk update failed') }
    finally { setBulkBusy(false) }
  }

  async function bulkDelete() {
    const ids = [...selected]
    if (!ids.length) return
    if (!window.confirm(`Delete ${ids.length} selected product${ids.length > 1 ? 's' : ''}? This cannot be undone.`)) return
    setBulkBusy(true)
    try {
      await Promise.all(ids.map(id =>
        axios.delete(`/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      ))
      toast.success(`${ids.length} product${ids.length > 1 ? 's' : ''} deleted`)
      setSelected(new Set())
      fetchAll()
    } catch { toast.error('Bulk delete failed') }
    finally { setBulkBusy(false) }
  }

  function bulkExport() {
    const rows = products.filter(p => selected.has(p.id))
    exportCsv('products.csv', rows, [
      { label: 'ID', value: r => r.id },
      { label: 'SKU', value: r => r.sku },
      { label: 'Name', value: r => r.name },
      { label: 'Price', value: r => r.price },
      { label: 'Discount Price', value: r => r.discountPrice ?? '' },
      { label: 'Stock', value: r => r.stock },
      { label: 'Category', value: r => r.category },
      { label: 'Collection', value: r => r.collection },
      { label: 'Status', value: r => r.status },
    ])
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
      image: p.image, stock: p.stock || 0, sku: p.sku || '', status: p.status || 'active',
      mockupImages: p.mockupImages || []
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
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[1400px] mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[#C8F135] mb-1">Admin</p>
            <h1 className="text-4xl font-black tracking-tight">PRODUCT MANAGEMENT</h1>
            <p className="text-white/30 text-sm mt-1">{products.length} products total</p>
          </div>
          <button onClick={() => navigate('/admin')}
            className="text-xs font-bold tracking-widest border border-white/10 px-4 py-2 text-white/40 hover:text-white transition-colors">
            ← DASHBOARD
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-white/10 mb-8">
          {[
            { key: 'list',        label: `ALL PRODUCTS (${products.length})` },
            { key: 'form',        label: editId ? 'EDIT PRODUCT' : '+ ADD PRODUCT' },
            { key: 'collections', label: `COLLECTIONS (${collections.length})` },
            { key: 'bulk',        label: 'BULK UPLOAD' }
          ].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); if (t.key !== 'form') resetForm(); setSelected(new Set()) }}
              className={`px-5 py-3 text-xs font-bold tracking-widest uppercase transition-colors ${tab === t.key ? 'text-white border-b-2 border-[#C8F135]' : 'text-white/30 hover:text-white'}`}>
              {t.label}
            </button>
          ))}
          <Link to="/admin/products/mockupgen"
            className="px-5 py-3 text-xs font-bold tracking-widest uppercase transition-colors text-white/30 hover:text-white">
            MOCKUP GENERATOR
          </Link>
          <Link to="/admin/products/quick-template"
            className="px-5 py-3 text-xs font-bold tracking-widest uppercase transition-colors text-white/30 hover:text-white">
            QUICK TEMPLATE
          </Link>
        </div>

        {/* ── LIST TAB ── */}
        {tab === 'list' && (
          <div>
            <div className="flex flex-wrap gap-3 mb-6">
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or SKU..."
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

            {/* Bulk action bar */}
            {selected.size > 0 && (
              <div className="flex flex-wrap items-center gap-3 mb-4 px-4 py-3 bg-zinc-900 border border-[#C8F135]/30">
                <span className="text-xs font-bold tracking-widest text-[#C8F135]">{selected.size} SELECTED</span>
                <button onClick={() => bulkSetStatus('active')} disabled={bulkBusy}
                  className="text-xs font-bold border border-white/20 px-3 py-1.5 hover:border-green-400 hover:text-green-400 transition-colors disabled:opacity-40">
                  SET ACTIVE
                </button>
                <button onClick={() => bulkSetStatus('draft')} disabled={bulkBusy}
                  className="text-xs font-bold border border-white/20 px-3 py-1.5 hover:border-yellow-400 hover:text-yellow-400 transition-colors disabled:opacity-40">
                  SET DRAFT
                </button>
                <button onClick={bulkExport} disabled={bulkBusy}
                  className="text-xs font-bold border border-white/20 px-3 py-1.5 hover:border-[#C8F135] hover:text-[#C8F135] transition-colors disabled:opacity-40">
                  EXPORT CSV
                </button>
                <button onClick={bulkDelete} disabled={bulkBusy}
                  className="text-xs font-bold border border-white/10 px-3 py-1.5 text-red-400/70 hover:text-red-400 hover:border-red-400/50 transition-colors disabled:opacity-40">
                  DELETE
                </button>
                <button onClick={() => setSelected(new Set())}
                  className="text-xs font-bold text-white/30 hover:text-white ml-auto transition-colors">
                  CLEAR
                </button>
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="text-center py-20 text-white/20 font-bold">No products found</div>
            ) : (
              <div className="border border-white/10">
                <div className="flex items-center gap-3 px-4 py-3 text-xs font-bold tracking-widest uppercase text-white/20 border-b border-white/10">
                  <input type="checkbox"
                    checked={filtered.length > 0 && filtered.every(p => selected.has(p.id))}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 accent-[#C8F135] cursor-pointer flex-shrink-0" />
                  <div className="grid grid-cols-12 gap-2 flex-1">
                    <span className="col-span-1">IMG</span>
                    <span className="col-span-3">NAME / SKU</span>
                    <span className="col-span-2">PRICE</span>
                    <span className="col-span-1">STOCK</span>
                    <span className="col-span-2">CATEGORY</span>
                    <span className="col-span-1">STATUS</span>
                    <span className="col-span-2 text-right">ACTIONS</span>
                  </div>
                </div>
                <AnimatePresence>
                  {filtered.map(p => (
                    <motion.div key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex items-center gap-3 px-4 py-4 border-b border-white/5 hover:bg-white/3 transition-colors">
                      <input type="checkbox"
                        checked={selected.has(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="w-4 h-4 accent-[#C8F135] cursor-pointer flex-shrink-0" />
                      <div className="grid grid-cols-12 gap-2 items-center flex-1">
                      <div className="col-span-1">
                        <img src={p.image} alt={p.name} className="w-12 h-12 object-cover bg-zinc-900"
                          onError={e => e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=60'} />
                      </div>
                      <div className="col-span-3">
                        <p className="font-bold text-sm truncate">{p.name}</p>
                        <p className="text-xs text-white/30 font-mono">{p.sku}</p>
                        {p.mockupImages?.length > 0 && (
                          <p className="text-xs text-[#C8F135]/60 mt-0.5">{p.mockupImages.length} mockup{p.mockupImages.length > 1 ? 's' : ''}</p>
                        )}
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
                        <button onClick={() => startEdit(p)}
                          className="text-xs font-bold border border-white/20 px-3 py-1.5 hover:border-[#C8F135] hover:text-[#C8F135] transition-colors">
                          EDIT
                        </button>
                        <button onClick={() => handleDelete(p.id, p.name)}
                          className="text-xs font-bold border border-white/10 px-3 py-1.5 text-red-400/70 hover:text-red-400 hover:border-red-400/50 transition-colors">
                          DEL
                        </button>
                      </div>
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
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-10">

            {/* Left: form fields */}
            <form onSubmit={handleSubmit}>
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

                {/* Main Image URL */}
                <div>
                  <label className={labelClass}>Main Image URL</label>
                  <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                    placeholder="https://..." className={inputClass} />
                  <p className="text-xs text-white/20 mt-1">Used in listings & product page hero</p>
                </div>

                {/* Sizes */}
                <div>
                  <label className={labelClass}>Sizes (comma-separated)</label>
                  <input value={form.sizes} onChange={e => setForm(f => ({ ...f, sizes: e.target.value }))}
                    placeholder="XS, S, M, L, XL" className={inputClass} />
                </div>

                {/* Colors */}
                <div className="md:col-span-2">
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

                {/* ── Mockup Images ── */}
                <MockupImagesSection form={form} setForm={setForm} inputClass={inputClass} labelClass={labelClass} />

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

            {/* Right: live preview */}
            <ProductPreview form={form} />
          </div>
        )}

        {/* ── COLLECTIONS TAB ── */}
        {tab === 'collections' && (
          <CollectionsManager
            collections={collections}
            collectionMeta={collectionMeta}
            products={products}
            token={token}
            onRefresh={fetchAll}
            inputClass={inputClass}
            labelClass={labelClass}
          />
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
                  <svg className={`w-10 h-10 mx-auto mb-3 ${file ? 'text-[#C8F135]' : 'text-white/20'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
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
                <button type="button" onClick={() => setFile(null)}
                  className="w-full text-xs text-red-400/60 hover:text-red-400 transition-colors tracking-widest">
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
