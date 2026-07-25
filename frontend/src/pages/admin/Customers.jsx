import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { exportCsv } from '../../utils/exportCsv'

export default function AdminCustomers() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [bulkBusy, setBulkBusy] = useState(false)

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/admin/login'); return }
    fetchCustomers()
  }, [user])

  function fetchCustomers() {
    axios.get('/api/customers/all', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setCustomers(r.data)).catch(() => {})
  }

  const filtered = customers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  )

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelected(prev => {
      const allSelected = filtered.length > 0 && filtered.every(c => prev.has(c.id))
      if (allSelected) return new Set()
      return new Set(filtered.map(c => c.id))
    })
  }

  async function bulkDelete() {
    const ids = [...selected]
    if (!ids.length) return
    if (!window.confirm(`Delete ${ids.length} selected customer${ids.length > 1 ? 's' : ''}? This permanently removes their account and cannot be undone.`)) return
    setBulkBusy(true)
    try {
      await Promise.all(ids.map(id =>
        axios.delete(`/api/customers/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      ))
      toast.success(`${ids.length} customer${ids.length > 1 ? 's' : ''} deleted`)
      setSelected(new Set())
      fetchCustomers()
    } catch { toast.error('Bulk delete failed') }
    finally { setBulkBusy(false) }
  }

  function bulkExport() {
    const rows = customers.filter(c => selected.has(c.id))
    exportCsv('customers.csv', rows, [
      { label: 'ID', value: r => r.id },
      { label: 'Name', value: r => r.name },
      { label: 'Email', value: r => r.email },
      { label: 'Phone', value: r => r.phone },
      { label: 'Joined', value: r => r.createdAt },
      { label: 'Order Count', value: r => r.orderCount },
      { label: 'Total Spent', value: r => r.totalSpent },
    ])
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight">CUSTOMERS</h1>
            <p className="text-white/40 text-sm mt-1">{customers.length} registered users</p>
          </div>
          <button onClick={() => navigate('/admin')} className="text-xs font-bold tracking-widest text-white/40 hover:text-white border border-white/10 px-4 py-2">
            ← DASHBOARD
          </button>
        </div>

        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
          className="w-full max-w-md bg-zinc-900 border border-white/10 text-white px-4 py-2 text-sm focus:border-[#C8F135] outline-none mb-6" />

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-4 px-4 py-3 bg-zinc-900 border border-[#C8F135]/30">
            <span className="text-xs font-bold tracking-widest text-[#C8F135]">{selected.size} SELECTED</span>
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

        <div className="border border-white/10">
          <div className="flex items-center gap-4 p-4 border-b border-white/10 text-xs font-bold tracking-widest uppercase text-white/30">
            <input type="checkbox"
              checked={filtered.length > 0 && filtered.every(c => selected.has(c.id))}
              onChange={toggleSelectAll}
              className="w-4 h-4 accent-[#C8F135] cursor-pointer flex-shrink-0" />
            <div className="grid grid-cols-5 gap-4 flex-1">
              <span className="col-span-2">Customer</span>
              <span>Joined</span>
              <span>Orders</span>
              <span>Total Spent</span>
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-white/30">No customers found</div>
          ) : (
            filtered.map(c => (
              <div key={c.id} className="flex items-center gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                <input type="checkbox"
                  checked={selected.has(c.id)}
                  onChange={() => toggleSelect(c.id)}
                  className="w-4 h-4 accent-[#C8F135] cursor-pointer flex-shrink-0" />
                <div className="grid grid-cols-5 gap-4 items-center flex-1">
                  <div className="col-span-2">
                    <p className="font-bold text-sm">{c.name}</p>
                    <p className="text-xs text-white/40">{c.email}</p>
                    {c.phone && <p className="text-xs text-white/30">{c.phone}</p>}
                  </div>
                  <p className="text-xs text-white/50">{new Date(c.createdAt).toLocaleDateString('en-IN')}</p>
                  <p className="font-bold text-[#C8F135]">{c.orderCount}</p>
                  <p className="font-black">₹{c.totalSpent}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
