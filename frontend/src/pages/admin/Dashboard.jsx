import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 })
  const { token, user } = useAuth()
  const { darkMode } = useTheme()

  useEffect(() => {
    Promise.all([
      axios.get('/api/products/all'),
      axios.get('/api/orders/all', { headers: { Authorization: `Bearer ${token}` } })
    ]).then(([products, orders]) => {
      const revenue = orders.data.reduce((sum, o) => sum + (o.total || 0), 0)
      setStats({ products: products.data.length, orders: orders.data.length, revenue })
    }).catch(() => {})
  }, [token])

  if (user?.role !== 'admin') {
    return (
      <div className={`min-h-screen pt-20 flex items-center justify-center ${darkMode ? 'bg-black text-white' : 'bg-light text-black'}`}>
        <div className="text-center">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold">Admin Access Required</h2>
        </div>
      </div>
    )
  }

  const cards = [
    { label: 'Total Products', value: stats.products, icon: '👕', color: 'text-primary' },
    { label: 'Total Orders', value: stats.orders, icon: '📦', color: 'text-accent' },
    { label: 'Total Revenue', value: `₹${stats.revenue}`, icon: '💰', color: 'text-green-400' }
  ]

  return (
    <div className={`min-h-screen pt-20 ${darkMode ? 'bg-black text-white' : 'bg-light text-black'}`}>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-4xl font-black mb-2">Admin <span className="text-primary">Dashboard</span></h1>
        <p className={`mb-10 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>Welcome back, {user.name}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {cards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`p-6 rounded-2xl ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-black/10'}`}>
              <div className="text-4xl mb-3">{card.icon}</div>
              <div className={`text-3xl font-black ${card.color}`}>{card.value}</div>
              <div className={`text-sm mt-1 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{card.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/admin/products">
            <motion.div whileHover={{ scale: 1.02 }}
              className={`p-6 rounded-2xl ${darkMode ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-black/10 hover:bg-gray-50'} cursor-pointer transition-colors`}>
              <div className="text-3xl mb-3">👕</div>
              <h3 className="font-black text-xl">Product Management</h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>Add, edit, delete products. Bulk upload via Excel.</p>
              <span className="text-primary font-semibold mt-3 inline-block">Manage Products →</span>
            </motion.div>
          </Link>
          <Link to="/track">
            <motion.div whileHover={{ scale: 1.02 }}
              className={`p-6 rounded-2xl ${darkMode ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-black/10 hover:bg-gray-50'} cursor-pointer transition-colors`}>
              <div className="text-3xl mb-3">📦</div>
              <h3 className="font-black text-xl">Order Tracking</h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>Track and manage customer orders.</p>
              <span className="text-primary font-semibold mt-3 inline-block">View Orders →</span>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  )
}
