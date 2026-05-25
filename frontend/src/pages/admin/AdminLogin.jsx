import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
  const navigate = useNavigate()

  if (user?.role === 'admin') { navigate('/admin'); return null }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!username || !password) return toast.error('Enter username and password')
    setLoading(true)
    try {
      const data = await login(username, password)   // passes username into the "email" field
      if (data.user.role !== 'admin') {
        toast.error('Admin access required')
        return
      }
      toast.success('Welcome back, Admin!')
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

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-4xl font-black tracking-tighter mb-2">
            BASTIN<span style={{ color: '#C8F135' }}>'S</span>
          </div>
          <p className="text-xs tracking-[0.4em] uppercase text-white/30">Admin Portal</p>
        </div>

        <div className="border border-white/10 p-8">
          <h2 className="text-xl font-black tracking-tight mb-6">SIGN IN</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-white/40 tracking-widest uppercase block mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                required
                className="w-full bg-zinc-900 border border-white/10 text-white px-4 py-3 text-sm focus:border-[#C8F135] outline-none transition-colors placeholder-white/20"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 tracking-widest uppercase block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full bg-zinc-900 border border-white/10 text-white px-4 py-3 text-sm focus:border-[#C8F135] outline-none transition-colors placeholder-white/20"
              />
            </div>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              className="w-full bg-white text-black font-black py-4 text-xs tracking-widest uppercase hover:bg-[#C8F135] transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN →'}
            </motion.button>
          </form>
        </div>

        <div className="mt-4 border border-white/5 bg-white/3 p-4 text-center">
          <p className="text-xs text-white/30 mb-1">Default Credentials</p>
          <p className="text-xs font-mono text-white/50">username: <span className="text-[#C8F135]">admin</span></p>
          <p className="text-xs font-mono text-white/50">password: <span className="text-[#C8F135]">bastin123</span></p>
        </div>
      </motion.div>
    </div>
  )
}
