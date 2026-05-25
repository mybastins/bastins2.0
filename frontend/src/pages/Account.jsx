import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const STATUS_STYLE = {
  new:       'bg-blue-500/10 text-blue-400 border-blue-500/20',
  confirmed: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  packed:    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  shipped:   'bg-orange-500/10 text-orange-400 border-orange-500/20',
  delivered: 'bg-[#C8F135]/10 text-[#C8F135] border-[#C8F135]/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  refunded:  'bg-white/5 text-white/40 border-white/10',
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
      {/* Neon glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#C8F135]/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-10 border-b border-white/10 pb-8">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[#C8F135] mb-2">My Account</p>
            <h1 className="text-4xl font-black tracking-tight">{user.name.toUpperCase()}</h1>
            <p className="text-white/30 text-sm mt-1">{user.email}</p>
          </div>
          <button onClick={() => { logout(); navigate('/') }}
            className="text-xs font-bold tracking-widest uppercase text-white/30 hover:text-red-400 transition-colors border border-white/10 hover:border-red-400/30 px-4 py-2">
            SIGN OUT
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-px bg-white/10 mb-10">
          {[
            { label: 'Total Orders', value: orders.length },
            { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length },
            { label: 'Total Spent', value: `₹${orders.reduce((s, o) => s + (o.total || 0), 0)}` }
          ].map(stat => (
            <div key={stat.label} className="bg-black px-6 py-5 text-center">
              <p className="text-2xl font-black" style={{ color: '#C8F135' }}>{stat.value}</p>
              <p className="text-xs tracking-[0.2em] uppercase text-white/30 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 mb-8">
          {[['orders', `ORDERS (${orders.length})`], ['profile', 'PROFILE']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-6 py-3 text-xs font-black tracking-[0.2em] uppercase transition-colors ${tab === key ? 'text-white border-b-2 border-[#C8F135] -mb-px' : 'text-white/30 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Orders */}
        {tab === 'orders' && (
          <div>
            {orders.length === 0 ? (
              <div className="text-center py-20 border border-white/10">
                <p className="text-5xl mb-4">📦</p>
                <p className="font-black text-xl text-white/20 tracking-widest mb-6">NO ORDERS YET</p>
                <Link to="/collections"
                  className="bg-white text-black font-black px-8 py-3 text-xs tracking-widest uppercase hover:bg-[#C8F135] transition-colors">
                  START SHOPPING →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => (
                  <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="border border-white/10 hover:border-white/20 transition-colors">
                    {/* Order header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-white/5">
                      <div>
                        <p className="text-xs text-white/30 tracking-widest uppercase mb-1">Order</p>
                        <p className="font-mono font-bold text-sm">{order.id.substring(0, 14).toUpperCase()}...</p>
                        <p className="text-xs text-white/30 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-black px-3 py-1 border tracking-widest uppercase ${STATUS_STYLE[order.status] || 'bg-white/5 text-white/40 border-white/10'}`}>
                          {order.status}
                        </span>
                        <span className="text-xl font-black" style={{ color: '#C8F135' }}>₹{order.total}</span>
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="flex flex-wrap gap-3 p-4 border-b border-white/5">
                      {order.items?.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-center gap-3 bg-zinc-900 p-2">
                          <img src={item.image} alt={item.name} className="w-12 h-12 object-cover"
                            onError={e => e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=50'} />
                          <div>
                            <p className="text-xs font-bold max-w-[130px] truncate">{item.name}</p>
                            <p className="text-xs text-white/30">{item.size} · ×{item.quantity}</p>
                          </div>
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <div className="flex items-center bg-zinc-900 px-4 text-xs text-white/30 font-bold">
                          +{order.items.length - 3} more
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between px-5 py-3">
                      <p className="text-xs text-white/20 truncate max-w-xs">{order.shippingAddress}</p>
                      <Link to={`/track?id=${order.id}`}
                        className="text-xs font-black tracking-widest uppercase text-[#C8F135] hover:text-white transition-colors whitespace-nowrap">
                        TRACK →
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile */}
        {tab === 'profile' && (
          <form onSubmit={saveProfile} className="max-w-md">
            <div className="space-y-5">
              {[
                { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Your name' },
                { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+91 00000 00000' },
                { key: 'address', label: 'Default Address', type: 'text', placeholder: 'Street, City, State' },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 block mb-1.5">{label}</label>
                  <input type={type} value={profile[key]}
                    onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder} className={inputClass} />
                </div>
              ))}

              {/* Email (read-only) */}
              <div>
                <label className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 block mb-1.5">Email Address</label>
                <input value={user.email} disabled
                  className={inputClass + ' opacity-30 cursor-not-allowed'} />
                <p className="text-xs text-white/20 mt-1">Email cannot be changed</p>
              </div>

              <motion.button type="submit" whileTap={{ scale: 0.97 }} disabled={saving}
                className="w-full bg-white text-black font-black py-4 text-xs tracking-widest uppercase hover:bg-[#C8F135] transition-colors disabled:opacity-40">
                {saving ? 'SAVING...' : 'SAVE CHANGES →'}
              </motion.button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
