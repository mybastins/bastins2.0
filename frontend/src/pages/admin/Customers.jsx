import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function AdminCustomers() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/admin/login'); return }
    axios.get('/api/customers/all', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setCustomers(r.data)).catch(() => {})
  }, [user])

  const filtered = customers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  )

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

        <div className="border border-white/10">
          <div className="grid grid-cols-5 gap-4 p-4 border-b border-white/10 text-xs font-bold tracking-widest uppercase text-white/30">
            <span className="col-span-2">Customer</span>
            <span>Joined</span>
            <span>Orders</span>
            <span>Total Spent</span>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-white/30">No customers found</div>
          ) : (
            filtered.map(c => (
              <div key={c.id} className="grid grid-cols-5 gap-4 p-4 border-b border-white/5 hover:bg-white/5 transition-colors items-center">
                <div className="col-span-2">
                  <p className="font-bold text-sm">{c.name}</p>
                  <p className="text-xs text-white/40">{c.email}</p>
                  {c.phone && <p className="text-xs text-white/30">{c.phone}</p>}
                </div>
                <p className="text-xs text-white/50">{new Date(c.createdAt).toLocaleDateString('en-IN')}</p>
                <p className="font-bold text-[#C8F135]">{c.orderCount}</p>
                <p className="font-black">₹{c.totalSpent}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
