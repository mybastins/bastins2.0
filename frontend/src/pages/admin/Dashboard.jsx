import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'

const ICONS = {
  tshirt: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M6 2L2 7l4 2v11h12V9l4-2-4-5c-1.5 2-3 3-5 3s-3.5-1-5-3z" />
    </svg>
  ),
  box: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  newOrder: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 4v16m8-8H4" />
    </svg>
  ),
  revenue: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  globe: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
}

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
    { label: 'Total Products', value: stats.products,         icon: ICONS.tshirt,   link: '/admin/products',   color: 'text-white' },
    { label: 'Total Orders',   value: stats.orders,           icon: ICONS.box,      link: '/admin/orders',     color: 'text-[#C8F135]' },
    { label: 'New Orders',     value: stats.newOrders,        icon: ICONS.newOrder, link: '/admin/orders',     color: 'text-blue-400' },
    { label: 'Customers',      value: stats.customers,        icon: ICONS.users,    link: '/admin/customers',  color: 'text-purple-400' },
    { label: 'Low Stock',      value: stats.lowStock,         icon: ICONS.warning,  link: '/admin/products',   color: 'text-yellow-400' },
  ]

  const quickLinks = [
    { label: 'Product Management', desc: 'Add, edit, delete products. Bulk upload via Excel.', icon: ICONS.tshirt, link: '/admin/products' },
    { label: 'Order Management',   desc: 'View all orders, update statuses, track shipments.', icon: ICONS.box,    link: '/admin/orders' },
    { label: 'Customer Database',  desc: 'View all registered customers and their orders.',    icon: ICONS.users,  link: '/admin/customers' },
    { label: 'Settings',           desc: 'Enable or disable Cash on Delivery and PayU.',        icon: ICONS.settings, link: '/admin/settings' },
    { label: 'Store Front',        desc: 'Visit the customer-facing website.',                 icon: ICONS.globe,  link: '/' },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[#C8F135] mb-1">Store Management</p>
            <h1 className="text-4xl font-black tracking-tight">ADMIN DASHBOARD</h1>
            <p className="text-white/40 text-sm mt-1">Welcome back, {user.name}</p>
          </div>
          <Link to="/" className="text-xs font-bold tracking-widest text-white/40 hover:text-white border border-white/10 px-4 py-2 transition-colors">
            VIEW STORE →
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-white/10 mb-10">
          {cards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={card.link} className="bg-black p-6 flex flex-col gap-2 hover:bg-zinc-900 transition-colors block">
                <span className={`${card.color} opacity-60`}>{card.icon}</span>
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
                  <span className="text-white/30 group-hover:text-[#C8F135] transition-colors mt-0.5">{item.icon}</span>
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
