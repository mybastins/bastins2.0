import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { TSHIRT_COLORS } from '../../utils/tshirtCanvas'

const PLACEMENTS = [
  { key: 'front', label: 'Front Only' },
  { key: 'back', label: 'Back Only' },
  { key: 'both', label: 'Front & Back' },
]

const STATUS_COLOR = {
  queued: 'text-white/40',
  'in-progress': 'text-yellow-400',
  updated: 'text-[#C8F135]',
  failed: 'text-red-400',
}

const inputClass = "w-full bg-zinc-900 border border-white/10 text-white px-4 py-2.5 text-sm focus:border-[#C8F135] outline-none transition-colors placeholder-white/20"
const labelClass = "text-xs text-white/40 tracking-widest uppercase block mb-1"

export default function QuickTemplate() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('new')

  const [templates, setTemplates] = useState([])
  const [templateId, setTemplateId] = useState('')
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/admin/login'); return }
    fetchAll()
  }, [user])

  async function fetchAll() {
    setLoading(true)
    try {
      const [tRes, rRes] = await Promise.all([
        axios.get('/api/templates', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/product-requests', { headers: { Authorization: `Bearer ${token}` } }),
      ])
      setTemplates(tRes.data)
      if (!templateId && tRes.data.length) setTemplateId(tRes.data[0].id)
      setRequests(rRes.data)
    } catch {
      toast.error('Failed to load')
    } finally {
      setLoading(false)
    }
  }

  // Poll while anything is still queued/in-progress
  useEffect(() => {
    const hasPending = requests.some(r => r.status === 'queued' || r.status === 'in-progress')
    if (!hasPending) return
    const t = setInterval(() => {
      axios.get('/api/product-requests', { headers: { Authorization: `Bearer ${token}` } })
        .then(({ data }) => setRequests(data)).catch(() => {})
    }, 4000)
    return () => clearInterval(t)
  }, [requests, token])

  const template = templates.find(t => t.id === templateId)

  if (user?.role !== 'admin') return null

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[#C8F135] mb-1">Admin</p>
            <h1 className="text-4xl font-black tracking-tight">QUICK TEMPLATE</h1>
            <p className="text-white/30 text-sm mt-1">Upload a design, pick colours, and let the backend build the product.</p>
          </div>
          <button onClick={() => navigate('/admin/products')}
            className="text-xs font-bold tracking-widest border border-white/10 px-4 py-2 text-white/40 hover:text-white transition-colors">
            ← PRODUCTS
          </button>
        </div>

        <div className="flex gap-0 border-b border-white/10 mb-8">
          {[
            { key: 'new', label: 'New Request' },
            { key: 'requests', label: `Requests (${requests.length})` },
            { key: 'template', label: 'Template' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-3 text-xs font-bold tracking-widest uppercase transition-colors ${tab === t.key ? 'text-white border-b-2 border-[#C8F135]' : 'text-white/30 hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-white/30">Loading...</p>
        ) : (
          <>
            {tab === 'new' && (
              <NewRequestForm
                templates={templates}
                templateId={templateId}
                setTemplateId={setTemplateId}
                template={template}
                token={token}
                onSubmitted={() => { fetchAll(); setTab('requests') }}
              />
            )}
            {tab === 'requests' && <RequestsList requests={requests} token={token} onChange={fetchAll} />}
            {tab === 'template' && template && (
              <TemplateEditor template={template} token={token} onSaved={fetchAll} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

function NewRequestForm({ templates, templateId, setTemplateId, template, token, onSubmitted }) {
  const [productName, setProductName] = useState('')
  const [placement, setPlacement] = useState('front')
  const [colors, setColors] = useState([])
  const [frontFile, setFrontFile] = useState(null)
  const [backFile, setBackFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const frontRef = useRef()
  const backRef = useRef()

  useEffect(() => {
    if (template) setColors(template.defaultColors || [])
  }, [template?.id])

  function toggleColor(hex) {
    setColors(prev => prev.includes(hex) ? prev.filter(c => c !== hex) : [...prev, hex])
  }

  const needsFront = placement === 'front' || placement === 'both'
  const needsBack = placement === 'back' || placement === 'both'

  async function handleSubmit(e) {
    e.preventDefault()
    if (!productName.trim()) return toast.error('Product name is required')
    if (colors.length === 0) return toast.error('Select at least one colour')
    if (colors.length > 15) return toast.error('Select at most 15 colours per submission')
    if (needsFront && !frontFile) return toast.error('Upload a front design')
    if (needsBack && !backFile) return toast.error('Upload a back design')

    const placements = placement === 'both' ? ['front', 'back'] : [placement]

    const fd = new FormData()
    fd.append('templateId', templateId)
    fd.append('productName', productName.trim())
    fd.append('colors', JSON.stringify(colors))
    fd.append('placements', JSON.stringify(placements))
    if (frontFile) fd.append('frontDesign', frontFile)
    if (backFile) fd.append('backDesign', backFile)

    setSubmitting(true)
    try {
      await axios.post('/api/product-requests', fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Mockups generated — review it in Requests')
      setProductName(''); setFrontFile(null); setBackFile(null)
      if (frontRef.current) frontRef.current.value = ''
      if (backRef.current) backRef.current.value = ''
      onSubmitted()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Generation failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {templates.length > 1 && (
        <div>
          <label className={labelClass}>Template</label>
          <select value={templateId} onChange={e => setTemplateId(e.target.value)} className={inputClass + ' cursor-pointer'}>
            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      )}

      <div>
        <label className={labelClass}>Product Name</label>
        <input value={productName} onChange={e => setProductName(e.target.value)}
          placeholder="e.g. Skeleton Peace Sign Tee" className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Placement</label>
        <div className="flex gap-2">
          {PLACEMENTS.map(p => (
            <button key={p.key} type="button" onClick={() => setPlacement(p.key)}
              className={`flex-1 py-2.5 text-xs font-bold tracking-widest uppercase border transition-colors ${
                placement === p.key ? 'bg-white text-black border-white' : 'border-white/20 text-white/50 hover:text-white'
              }`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {needsFront && (
          <div>
            <label className={labelClass}>Front Design (PNG)</label>
            <input ref={frontRef} type="file" accept="image/png,image/jpeg" onChange={e => setFrontFile(e.target.files[0])} className={inputClass} />
          </div>
        )}
        {needsBack && (
          <div>
            <label className={labelClass}>Back Design (PNG)</label>
            <input ref={backRef} type="file" accept="image/png,image/jpeg" onChange={e => setBackFile(e.target.files[0])} className={inputClass} />
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelClass}>Colours ({colors.length} selected)</label>
          <button type="button" onClick={() => setColors(template?.defaultColors || [])}
            className="text-[10px] text-white/30 hover:text-[#C8F135] uppercase tracking-widest">
            Reset to Default
          </button>
        </div>
        <div className="grid grid-cols-6 sm:grid-cols-9 gap-2 border border-white/10 p-4">
          {TSHIRT_COLORS.map(({ hex, name }) => (
            <button key={hex} type="button" onClick={() => toggleColor(hex)} title={name}
              className={`w-8 h-8 border-2 transition-all ${colors.includes(hex) ? 'border-[#C8F135] scale-110' : 'border-white/10 hover:border-white/40'}`}
              style={{ background: hex }} />
          ))}
        </div>
      </div>

      <button type="submit" disabled={submitting}
        className="w-full bg-[#C8F135] text-black font-black py-4 text-xs tracking-widest uppercase hover:bg-white transition-colors disabled:opacity-40">
        {submitting ? 'GENERATING MOCKUPS...' : 'GENERATE →'}
      </button>
      {submitting && (
        <p className="text-[10px] text-white/30 text-center">
          Compositing {colors.length} colour{colors.length > 1 ? 's' : ''} × {placement === 'both' ? 2 : 1} placement — this runs in one request, may take a moment.
        </p>
      )}
    </form>
  )
}

function RequestsList({ requests, token, onChange }) {
  const [publishing, setPublishing] = useState(null)

  async function publish(id) {
    setPublishing(id)
    try {
      await axios.put(`/api/product-requests/${id}/publish`, {}, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Product is live!')
      onChange()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Publish failed')
    } finally {
      setPublishing(null)
    }
  }

  if (requests.length === 0) return <div className="text-center py-20 text-white/20 font-bold">No requests yet</div>

  return (
    <div className="space-y-3">
      {requests.map(r => (
        <div key={r.id} className="border border-white/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div>
              <p className="font-bold text-sm">{r.productName}</p>
              <p className="text-xs text-white/30">
                {r.colors.length} colour{r.colors.length > 1 ? 's' : ''} · {r.placements.join(' + ')} · {new Date(r.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-black tracking-widest uppercase ${STATUS_COLOR[r.status]}`}>
                ● {r.status}
              </span>
              {r.status === 'updated' && !r.published && (
                <button onClick={() => publish(r.id)} disabled={publishing === r.id}
                  className="text-xs font-black tracking-widest uppercase bg-white text-black px-4 py-2 hover:bg-[#C8F135] transition-colors disabled:opacity-40">
                  {publishing === r.id ? 'PUBLISHING...' : 'PUBLISH'}
                </button>
              )}
              {r.published && <span className="text-xs font-black tracking-widest uppercase text-[#C8F135]">LIVE</span>}
            </div>
          </div>
          {r.status === 'failed' && r.error && (
            <p className="text-xs text-red-400 mt-1">{r.error}</p>
          )}
          {r.mockupPreviewUrls?.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-3">
              {r.mockupPreviewUrls.map((url, i) => (
                <img key={i} src={url} alt="" className="w-16 h-16 object-cover bg-zinc-900 border border-white/10" />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function TemplateEditor({ template, token, onSaved }) {
  const [form, setForm] = useState({
    name: template.name,
    price: template.price,
    discountPrice: template.discountPrice || '',
    sizes: (template.sizes || []).join(', '),
    category: template.category || '',
    collection: template.collection || '',
    description: template.description || '',
    defaultColors: template.defaultColors || [],
  })
  const [saving, setSaving] = useState(false)

  function toggleDefaultColor(hex) {
    setForm(f => ({
      ...f,
      defaultColors: f.defaultColors.includes(hex) ? f.defaultColors.filter(c => c !== hex) : [...f.defaultColors, hex]
    }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await axios.put(`/api/templates/${template.id}`, {
        name: form.name,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
        sizes: form.sizes.split(',').map(s => s.trim()).filter(Boolean),
        category: form.category,
        collection: form.collection,
        description: form.description,
        defaultColors: form.defaultColors,
      }, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Template saved')
      onSaved()
    } catch {
      toast.error('Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="max-w-2xl space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Template Name</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Price (₹)</label>
          <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Discount Price (₹)</label>
          <input type="number" value={form.discountPrice} onChange={e => setForm(f => ({ ...f, discountPrice: e.target.value }))} className={inputClass} />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Sizes (comma-separated)</label>
          <input value={form.sizes} onChange={e => setForm(f => ({ ...f, sizes: e.target.value }))} className={inputClass} />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Description</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className={inputClass + ' resize-none'} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Default Colours (pre-checked on new requests)</label>
        <div className="grid grid-cols-6 sm:grid-cols-9 gap-2 border border-white/10 p-4">
          {TSHIRT_COLORS.map(({ hex, name }) => (
            <button key={hex} type="button" onClick={() => toggleDefaultColor(hex)} title={name}
              className={`w-8 h-8 border-2 transition-all ${form.defaultColors.includes(hex) ? 'border-[#C8F135] scale-110' : 'border-white/10 hover:border-white/40'}`}
              style={{ background: hex }} />
          ))}
        </div>
      </div>

      <button type="submit" disabled={saving}
        className="bg-white text-black font-black px-8 py-3 text-xs tracking-widest uppercase hover:bg-[#C8F135] transition-colors disabled:opacity-40">
        {saving ? 'SAVING...' : 'SAVE TEMPLATE'}
      </button>
    </form>
  )
}
