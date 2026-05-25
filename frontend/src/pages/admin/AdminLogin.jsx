import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@bastins.com')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
  const navigate = useNavigate()

  if (user?.role === 'admin') { navigate('/admin'); return null }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await login(email, password)
      if (data.user.role !== 'admin') {
        toast.error('Admin access required')
        return
      }
      toast.success('Welcome, Admin!')
      navigate('/admin')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.4em] uppercase text-[#C8F135] mb-3">Restricted Area</p>
          <h1 className="text-4xl font-black tracking-tight">ADMIN LOGIN</h1>
          <p className="text-white/30 text-sm mt-2">BASTIN'S Store Management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 border border-white/10 p-8">
          <div>
            <label className="text-xs text-white/40 tracking-widest uppercase block mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full bg-zinc-900 border border-white/10 text-white px-4 py-3 text-sm focus:border-[#C8F135] outline-none transition-colors" />
          </div>
          <div>
            <label className="text-xs text-white/40 tracking-widest uppercase block mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="admin@123"
              className="w-full bg-zinc-900 border border-white/10 text-white px-4 py-3 text-sm focus:border-[#C8F135] outline-none transition-colors placeholder-white/20" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-white text-black font-black py-4 text-xs tracking-widest uppercase hover:bg-[#C8F135] transition-colors disabled:opacity-50 mt-2">
            {loading ? 'LOGGING IN...' : 'LOGIN TO ADMIN →'}
          </button>
        </form>

        <p className="text-center text-xs text-white/20 mt-4">
          Default: admin@bastins.com / admin@123
        </p>
      </motion.div>
    </div>
  )
}
