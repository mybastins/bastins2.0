import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'

export default function AdminDashboard() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, customers: 0, lowStock: 0, newOrders: 0 })

  useEffect(() => {
    if (!user) return
    if (user.role !== 'admin') { navigate('/admin/login'); return }
    Promise.all([
      axios.get('/api/products/all'),
      axios.get('/api/orders/all', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('/api/customers/all', { headers: { Authorization: `Bearer ${token}` } })
    ]).then(([products, orders, customers]) => {
      setStats({
        products: products.data.length,
        orders: orders.data.length,
        revenue: orders.data.reduce((s, o) => s + (o.total || 0), 0),
        customers: customers.data.length,
        lowStock: products.data.filter(p => p.stock > 0 && p.stock <= 5).length,
        newOrders: orders.data.filter(o => o.status === 'new').length
      })
    }).catch(() => {})
  }, [user, token])

  if (!user || user.role !== 'admin') return null

  const cards = [
    { label: 'Total Products', value: stats.products, icon: '👕', link: '/admin/products', color: 'text-white' },
    { label: 'Total Orders', value: stats.orders, icon: '📦', link: '/admin/orders', color: 'text-[#C8F135]' },
    { label: 'New Orders', value: stats.newOrders, icon: '🆕', link: '/admin/orders', color: 'text-blue-400' },
    { label: 'Total Revenue', value: `₹${stats.revenue}`, icon: '💰', link: '/admin/orders', color: 'text-green-400' },
    { label: 'Customers', value: stats.customers, icon: '👥', link: '/admin/customers', color: 'text-purple-400' },
    { label: 'Low Stock', value: stats.lowStock, icon: '⚠️', link: '/admin/products', color: 'text-yellow-400' }
  ]

  const quickLinks = [
    { label: 'Product Management', desc: 'Add, edit, delete products. Bulk upload via Excel.', icon: '👕', link: '/admin/products' },
    { label: 'Order Management', desc: 'View all orders, update statuses, track shipments.', icon: '📦', link: '/admin/orders' },
    { label: 'Customer Database', desc: 'View all registered customers and their orders.', icon: '👥', link: '/admin/customers' },
    { label: 'Store Front', desc: 'Visit the customer-facing website.', icon: '🌐', link: '/' }
  ]

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[#C8F135] mb-1">Store Management</p>
            <h1 className="text-4xl font-black tracking-tight">ADMIN DASHBOARD</h1>
            <p className="text-white/40 text-sm mt-1">Welcome back, {user.name}</p>
          </div>
          <Link to="/admin/login" className="text-xs font-bold tracking-widest text-white/40 hover:text-white border border-white/10 px-4 py-2">
            ADMIN LOGIN
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-white/10 mb-10">
          {cards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={card.link} className="bg-black p-6 flex flex-col gap-2 hover:bg-zinc-900 transition-colors block">
                <span className="text-2xl">{card.icon}</span>
                <span className={`text-2xl font-black ${card.color}`}>{card.value}</span>
                <span className="text-xs text-white/30 tracking-wider uppercase leading-tight">{card.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickLinks.map((item, i) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}>
              <Link to={item.link} className="border border-white/10 p-6 hover:border-[#C8F135]/40 hover:bg-white/5 transition-all block group">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <p className="font-black text-lg group-hover:text-[#C8F135] transition-colors">{item.label}</p>
                    <p className="text-sm text-white/40 mt-1">{item.desc}</p>
                    <p className="text-xs font-bold tracking-widest uppercase text-[#C8F135] mt-3">GO →</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
