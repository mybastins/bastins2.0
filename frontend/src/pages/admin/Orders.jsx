import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { exportCsv } from '../../utils/exportCsv'

const STATUSES = ['new', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded']
const STATUS_COLOR = {
  new: 'bg-blue-500/20 text-blue-400', confirmed: 'bg-purple-500/20 text-purple-400',
  packed: 'bg-yellow-500/20 text-yellow-400', shipped: 'bg-orange-500/20 text-orange-400',
  delivered: 'bg-green-500/20 text-green-400', cancelled: 'bg-red-500/20 text-red-400',
  refunded: 'bg-gray-500/20 text-gray-400'
}

export default function AdminOrders() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [selected, setSelected] = useState(new Set())
  const [bulkStatus, setBulkStatus] = useState(STATUSES[0])
  const [bulkBusy, setBulkBusy] = useState(false)

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/admin/login'); return }
    fetchOrders()
  }, [user])

  async function fetchOrders() {
    try {
      const { data } = await axios.get('/api/orders/all', { headers: { Authorization: `Bearer ${token}` } })
      setOrders(data)
    } catch {}
  }

  async function updateStatus(orderId, status) {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } })
      toast.success(`Status → ${status}`)
      fetchOrders()
    } catch { toast.error('Failed to update') }
  }

  const filtered = orders.filter(o => {
    const matchStatus = filter === 'all' || o.status === filter
    const matchSearch = !search || o.id.includes(search) || o.userName?.toLowerCase().includes(search.toLowerCase()) || o.userEmail?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelected(prev => {
      const allSelected = filtered.length > 0 && filtered.every(o => prev.has(o.id))
      if (allSelected) return new Set()
      return new Set(filtered.map(o => o.id))
    })
  }

  async function bulkApplyStatus() {
    const ids = [...selected]
    if (!ids.length) return
    setBulkBusy(true)
    try {
      await Promise.all(ids.map(id =>
        axios.put(`/api/orders/${id}/status`, { status: bulkStatus }, { headers: { Authorization: `Bearer ${token}` } })
      ))
      toast.success(`${ids.length} order${ids.length > 1 ? 's' : ''} → ${bulkStatus}`)
      setSelected(new Set())
      fetchOrders()
    } catch { toast.error('Bulk update failed') }
    finally { setBulkBusy(false) }
  }

  function bulkExport() {
    const rows = orders.filter(o => selected.has(o.id))
    exportCsv('orders.csv', rows, [
      { label: 'ID', value: r => r.id },
      { label: 'Tracking Number', value: r => r.trackingNumber },
      { label: 'Customer', value: r => r.userName },
      { label: 'Email', value: r => r.userEmail },
      { label: 'Phone', value: r => r.phone },
      { label: 'Total', value: r => r.total },
      { label: 'Status', value: r => r.status },
      { label: 'Payment Status', value: r => r.paymentStatus },
      { label: 'Address', value: r => r.shippingAddress },
      { label: 'Created At', value: r => r.createdAt },
    ])
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tight">ORDER MANAGEMENT</h1>
            <p className="text-white/40 text-sm mt-1">{orders.length} total orders</p>
          </div>
          <button onClick={() => navigate('/admin')} className="text-xs font-bold tracking-widest text-white/40 hover:text-white border border-white/10 px-4 py-2">
            ← DASHBOARD
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID, name, email..."
            className="bg-zinc-900 border border-white/10 text-white px-4 py-2 text-sm focus:border-[#C8F135] outline-none flex-1 min-w-48" />
          <div className="flex flex-wrap gap-1">
            {['all', ...STATUSES].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-2 text-xs font-bold tracking-widest uppercase transition-colors ${filter === s ? 'bg-white text-black' : 'bg-zinc-900 border border-white/10 text-white/50 hover:text-white'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-4 px-4 py-3 bg-zinc-900 border border-[#C8F135]/30">
            <span className="text-xs font-bold tracking-widest text-[#C8F135]">{selected.size} SELECTED</span>
            <select value={bulkStatus} onChange={e => setBulkStatus(e.target.value)}
              className="bg-black border border-white/20 text-white text-xs px-2 py-1.5 outline-none">
              {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <button onClick={bulkApplyStatus} disabled={bulkBusy}
              className="text-xs font-bold border border-white/20 px-3 py-1.5 hover:border-[#C8F135] hover:text-[#C8F135] transition-colors disabled:opacity-40">
              APPLY STATUS
            </button>
            <button onClick={bulkExport} disabled={bulkBusy}
              className="text-xs font-bold border border-white/20 px-3 py-1.5 hover:border-[#C8F135] hover:text-[#C8F135] transition-colors disabled:opacity-40">
              EXPORT CSV
            </button>
            <button onClick={() => setSelected(new Set())}
              className="text-xs font-bold text-white/30 hover:text-white ml-auto transition-colors">
              CLEAR
            </button>
          </div>
        )}

        {/* Select all */}
        {filtered.length > 0 && (
          <div className="flex items-center gap-2 mb-2 px-1">
            <input type="checkbox"
              checked={filtered.every(o => selected.has(o.id))}
              onChange={toggleSelectAll}
              className="w-4 h-4 accent-[#C8F135] cursor-pointer" />
            <span className="text-xs font-bold tracking-widest uppercase text-white/30">Select All</span>
          </div>
        )}

        {/* Orders Table */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-white/30">No orders found</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(order => (
              <motion.div key={order.id} layout className="border border-white/10">
                <div className="flex flex-wrap items-center gap-4 p-4 hover:bg-white/5">
                  <input type="checkbox"
                    checked={selected.has(order.id)}
                    onClick={e => e.stopPropagation()}
                    onChange={() => toggleSelect(order.id)}
                    className="w-4 h-4 accent-[#C8F135] cursor-pointer flex-shrink-0" />
                  <div className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                    <p className="font-mono text-xs text-white/40">{order.id.substring(0, 16)}...</p>
                    <p className="font-bold text-sm">{order.userName}</p>
                    <p className="text-xs text-white/40">{order.userEmail}</p>
                  </div>
                  <div className="text-xs text-white/40">{new Date(order.createdAt).toLocaleDateString('en-IN')}</div>
                  <div className="font-black text-[#C8F135]">₹{order.total}</div>
                  <span className={`text-xs font-bold px-2 py-1 ${STATUS_COLOR[order.status]}`}>
                    {order.status?.toUpperCase()}
                  </span>
                  <select
                    value={order.status}
                    onClick={e => e.stopPropagation()}
                    onChange={e => updateStatus(order.id, e.target.value)}
                    className="bg-zinc-900 border border-white/20 text-white text-xs px-2 py-1 outline-none">
                    {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>

                {expanded === order.id && (
                  <div className="border-t border-white/10 p-4 bg-zinc-900/50 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <p className="text-xs tracking-widest uppercase text-white/30 mb-2">Order Details</p>
                      <p><span className="text-white/40">Tracking:</span> <span className="font-mono text-[#C8F135]">{order.trackingNumber}</span></p>
                      <p><span className="text-white/40">Phone:</span> {order.phone || '—'}</p>
                      <p><span className="text-white/40">Payment:</span> <span className="text-green-400">{order.paymentStatus}</span></p>
                      <p><span className="text-white/40">Address:</span> {order.shippingAddress}</p>
                    </div>
                    <div>
                      <p className="text-xs tracking-widest uppercase text-white/30 mb-2">Items</p>
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex justify-between text-xs py-1 border-b border-white/5">
                          <span>{item.name} ({item.size}, {item.color}) ×{item.quantity}</span>
                          <span className="font-bold">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
