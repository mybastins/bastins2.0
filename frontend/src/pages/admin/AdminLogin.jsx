import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { user, login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.role === 'admin') navigate('/admin')
  }, [user])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!password) return toast.error('Enter your password')
    setLoading(true)
    try {
      const data = await login('admin', password)
      if (data.user.role !== 'admin') {
        toast.error('Admin access required')
        setLoading(false)
        return
      }
      toast.success('Welcome back, Admin!')
      navigate('/admin')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#C8F135]/4 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <img src="/logo.png" alt="BASTIN'S" className="h-12 w-auto object-contain mx-auto mb-2" />
          <p className="text-xs tracking-[0.4em] uppercase text-white/30">Admin Portal</p>
        </div>

        <div className="border border-white/10 p-8 bg-zinc-950">
          <h2 className="text-xl font-black tracking-tight mb-1">SIGN IN</h2>
          <p className="text-white/30 text-xs mb-8 tracking-wider">Enter your password to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Fixed username display */}
            <div>
              <label className="text-xs text-white/40 tracking-[0.2em] uppercase block mb-1.5">Username</label>
              <div className="w-full bg-black border border-white/10 px-4 py-3 flex items-center gap-3">
                <svg className="w-4 h-4 text-[#C8F135]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-mono font-bold text-white tracking-widest">admin</span>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-white/40 tracking-[0.2em] uppercase block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  autoComplete="current-password"
                  required
                  className="w-full bg-zinc-900 border border-white/10 text-white px-4 py-3 pr-16 text-sm focus:border-[#C8F135] outline-none transition-colors placeholder-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/30 hover:text-white transition-colors font-bold tracking-wider"
                >
                  {showPass ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              className="w-full bg-white text-black font-black py-4 text-xs tracking-widest uppercase hover:bg-[#C8F135] transition-colors disabled:opacity-40"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN →'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
