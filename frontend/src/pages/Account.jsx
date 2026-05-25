import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const STATUS_COLOR = {
  new: 'text-blue-400', confirmed: 'text-purple-400', packed: 'text-yellow-400',
  shipped: 'text-orange-400', delivered: 'text-green-400',
  cancelled: 'text-red-400', refunded: 'text-gray-400'
}

export default function Account() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [profile, setProfile] = useState({ name: '', phone: '', address: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchOrders()
    fetchProfile()
  }, [user])

  async function fetchOrders() {
    try {
      const { data } = await axios.get('/api/orders/my-orders', { headers: { Authorization: `Bearer ${token}` } })
      setOrders(data)
    } catch {}
  }

  async function fetchProfile() {
    try {
      const { data } = await axios.get('/api/customers/profile', { headers: { Authorization: `Bearer ${token}` } })
      setProfile({ name: data.name || '', phone: data.phone || '', address: data.address || '' })
    } catch {}
  }

  async function saveProfile(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await axios.put('/api/customers/profile', profile, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Profile updated!')
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  if (!user) return null

  const inputClass = "w-full bg-zinc-900 border border-white/10 text-white px-4 py-3 text-sm focus:border-[#C8F135] outline-none transition-colors"

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tight">MY ACCOUNT</h1>
            <p className="text-white/40 text-sm mt-1">{user.email}</p>
          </div>
          <button onClick={() => { logout(); navigate('/') }}
            className="text-xs font-bold tracking-widest uppercase text-white/40 hover:text-red-400 transition-colors border border-white/10 px-4 py-2">
            LOGOUT
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-white/10 mb-8">
          {['orders', 'profile'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-6 py-3 text-xs font-bold tracking-[0.25em] uppercase transition-colors ${tab === t ? 'text-white border-b-2 border-[#C8F135]' : 'text-white/40 hover:text-white'}`}>
              {t === 'orders' ? `Orders (${orders.length})` : 'Profile'}
            </button>
          ))}
        </div>

        {tab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-white/30 text-lg mb-4">No orders yet</p>
                <Link to="/collections" className="bg-white text-black font-black px-6 py-3 text-xs tracking-widest uppercase hover:bg-[#C8F135] transition-colors">
                  SHOP NOW
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="border border-white/10 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="text-xs text-white/40 tracking-widest uppercase mb-1">Order ID</p>
                        <p className="font-mono font-bold text-sm">{order.id.substring(0, 12)}...</p>
                        <p className="text-xs text-white/30 mt-1">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-black tracking-widest uppercase ${STATUS_COLOR[order.status] || 'text-white'}`}>
                          ● {order.status}
                        </span>
                        <p className="text-xl font-black text-[#C8F135] mt-1">₹{order.total}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mb-4">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 bg-zinc-900 px-3 py-2">
                          <img src={item.image} alt={item.name} className="w-10 h-10 object-cover"
                            onError={e => e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=50'} />
                          <div>
                            <p className="text-xs font-bold truncate max-w-[120px]">{item.name}</p>
                            <p className="text-xs text-white/40">{item.size} · ×{item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <Link to={`/track?id=${order.id}`}
                        className="text-xs font-bold tracking-widest uppercase text-[#C8F135] border border-[#C8F135]/30 px-4 py-2 hover:bg-[#C8F135]/10 transition-colors">
                        TRACK ORDER
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'profile' && (
          <form onSubmit={saveProfile} className="max-w-md space-y-4">
            {[['name','Full Name','text'],['phone','Phone Number','tel'],['address','Address','text']].map(([name, label, type]) => (
              <div key={name}>
                <label className="text-xs text-white/40 tracking-widest uppercase block mb-1">{label}</label>
                <input type={type} value={profile[name]} onChange={e => setProfile(p => ({ ...p, [name]: e.target.value }))}
                  placeholder={label} className={inputClass} />
              </div>
            ))}
            <div>
              <label className="text-xs text-white/40 tracking-widest uppercase block mb-1">Email</label>
              <input value={user.email} disabled className={inputClass + ' opacity-40 cursor-not-allowed'} />
            </div>
            <button type="submit" disabled={saving}
              className="bg-white text-black font-black px-8 py-3 text-xs tracking-widest uppercase hover:bg-[#C8F135] transition-colors disabled:opacity-50">
              {saving ? 'SAVING...' : 'SAVE CHANGES'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
